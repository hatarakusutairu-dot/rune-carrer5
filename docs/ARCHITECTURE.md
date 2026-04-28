# 技術構成・アーキテクチャ

最終更新：2026-04-28（v2 - Kahoot式同期設計に改訂）

## 1. 全体方針

**「Cloudflare Workers + Durable Objects による軽量リアルタイム同期」** を基本方針とする。
Kahoot式の講師ペース管理を実現しつつ、300人同時参加でも安定動作させる。
個人情報は依然ゼロ。ルーム状態は揮発（DB なし）。

---

## 2. アーキテクチャ図

```
┌────────────────────────────────────────────────────────┐
│           Cloudflare Workers ($5/月 Paid)               │
│           https://rune-carrer5.<acct>.workers.dev       │
│                                                          │
│   ┌──────────────────────────────────────────────────┐ │
│   │  Static Assets（dist/ をWorkerが配信）            │ │
│   │  HTML / CSS / JS / 画像                          │ │
│   └──────────────────────────────────────────────────┘ │
│                                                          │
│   ┌──────────────────────────────────────────────────┐ │
│   │  WebSocket エンドポイント /ws?room=482917         │ │
│   │   ├─ Durable Object: RoomDO (1ルーム=1インスタンス)│ │
│   │   │   ├─ ルーム状態（フェーズ、現在のゲーム等）   │ │
│   │   │   ├─ クラス別集計                            │ │
│   │   │   └─ WebSocket Hibernation API でコスト最適化 │ │
│   │   └─ 揮発：授業終了でデータ消失                   │ │
│   └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
        ▲                                   ▲
        │ WSS                               │ WSS
        │                                   │
   ┌────┴─────────┐                ┌───────┴────────────┐
   │ 講師PC（投影） │                │ 生徒スマホ/PC×300人 │
   │ /teacher     │                │ /student          │
   │ ・ルーム作成   │                │ ・6桁コード入室    │
   │ ・進行コマンド │                │ ・クラス選択       │
   │ ・全集計表示   │                │ ・ゲーム回答       │
   └──────────────┘                └────────────────────┘
```

---

## 3. 技術スタック

### 3.1 サーバー（Cloudflare Workers）

| 項目 | 選定 | 理由 |
|---|---|---|
| 実行環境 | Cloudflare Workers (Paid $5/月) | エッジ実行、WebSocket対応、Durable Objects必須 |
| 状態管理 | Durable Objects | 1ルーム=1インスタンスで状態保持 |
| WebSocket | Hibernation API | アイドル時のコスト削減 |
| デプロイ | wrangler | CLIで `wrangler deploy` |
| DB | **なし** | 揮発のみ、個人情報非保存方針 |
| ドメイン | `*.workers.dev` | 独自ドメイン不要、無料 |

### 3.2 フロントエンド

| 項目 | 選定 | 理由 |
|---|---|---|
| 言語 | TypeScript | 型安全 |
| フレームワーク | React 18 | 既存採用 |
| ビルドツール | Vite | 既存採用 |
| スタイル | Tailwind CSS | 既存採用 |
| ルーティング | React Router (HashRouter) | 既存採用 |
| 状態管理 | React Context | 既存 + 同期state追加 |
| QRコード | qrcode.react | 既存 |
| グラフ | recharts または自前SVG | レーダー・棒グラフ用 |

### 3.3 永続化（クライアント）

| 項目 | 用途 |
|---|---|
| localStorage | 個人の診断結果、My Quest Card（ローカルフォールバック用） |
| sessionStorage | 講師タイマー、ルームコード（再接続用） |

---

## 4. ディレクトリ構成

```
rune-carrer5/
├── README.md
├── package.json                # client + worker scripts
├── wrangler.toml               # Cloudflare Workers設定
├── vite.config.ts
├── tsconfig.json               # references all
├── tsconfig.app.json           # client
├── tsconfig.worker.json        # worker
├── tsconfig.node.json          # vite
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/                        # クライアント
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   ├── stages/
│   ├── games/                  # 7ミニゲームコンポーネント
│   ├── components/
│   ├── content/
│   ├── lib/
│   │   ├── storage.ts
│   │   ├── scoring.ts
│   │   ├── timer.ts
│   │   └── sync.ts             # WebSocketクライアント
│   ├── types/
│   └── styles/
├── shared/
│   └── protocol.ts             # クライアント・サーバー共有メッセージ型
├── worker/                     # Cloudflare Workers
│   ├── index.ts                # Worker entry
│   ├── RoomDO.ts               # Durable Object
│   ├── state.ts                # 状態機械ロジック
│   └── tsconfig.json
├── docs/
└── .github/workflows/
```

---

## 5. ルーム状態モデル

### 5.1 フェーズ機械

```
   [lobby] ──teacher: startGame──▶ [intro: 3-2-1 countdown]
      ▲                                  │
      │                                  ▼
      │                           [active: 生徒回答]
      │                                  │
      │                          (時間切れ or 全員回答)
      │                                  ▼
      │ ◀──teacher: nextGame──── [results: 集計表示]
      │                                  │
      │              teacher: endStage   │
      │ ◀────────────────────────────────┤
      │                                  ▼
      │                         [stage_summary]
      │                                  │
      └──teacher: nextStage───────────────┘

      teacher: closeRoom ──▶ [closed]
```

### 5.2 RoomDO の状態（メモリ）

```ts
interface RoomState {
  code: string;                 // 6桁ルームコード
  classes: string[];            // ["梅田大", "梅田小", "名古屋"]
  phase: 'lobby' | 'intro' | 'active' | 'results' | 'stage_summary' | 'closed';
  currentStage: number;         // 0..6
  currentGameIndex: number | null; // Stage1の0..6
  introCountdownAt: number | null; // タイムスタンプ
  activeStartedAt: number | null;
  activeDurationMs: number | null;
  students: Map<string, StudentInfo>; // sid → info
  responses: Map<string, Map<string, AnswerPayload>>; // gameId → (sid → answer)
  reactions: ReactionLog[];     // 直近のリアクション（揮発・10秒）
}

interface StudentInfo {
  sid: string;                  // 匿名ID（Workerが付与）
  className: string;
  joinedAt: number;
  lastSeenAt: number;
}
```

### 5.3 個人情報を保存しないルール
- `sid` は Worker が発行する匿名 UUID。氏名・端末ID等は使わない
- localStorage に保持されるのは sid と className とローカル回答のみ
- DO のメモリは授業終了で破棄（Durable Object は明示破棄しない場合も最大数日でアイドル消失）

---

## 6. 通信プロトコル

`shared/protocol.ts` に集約。

### 6.1 Client → Server

| type | payload | 送信元 |
|---|---|---|
| `T_CREATE_ROOM` | `{ classes: string[] }` | 講師 |
| `T_START_GAME` | `{ gameId: string, durationMs: number }` | 講師 |
| `T_END_GAME` | `{}` | 講師 |
| `T_NEXT_GAME` | `{}` | 講師 |
| `T_SKIP_GAME` | `{ gameId: string }` | 講師 |
| `T_END_STAGE` | `{}` | 講師 |
| `T_NEXT_STAGE` | `{}` | 講師 |
| `T_CLOSE_ROOM` | `{}` | 講師 |
| `S_JOIN` | `{ code: string, className: string, sid?: string }` | 生徒 |
| `S_ANSWER` | `{ gameId: string, payload: any }` | 生徒 |
| `S_RETRY` | `{ gameId: string }` | 生徒（再挑戦、集計には反映しない） |
| `REACTION` | `{ emoji: string }` | 講師/生徒 |
| `PING` | `{}` | 両方 |

### 6.2 Server → Client

| type | payload | 用途 |
|---|---|---|
| `ROOM_CREATED` | `{ code: string, teacherToken: string }` | 講師にコード返却 |
| `JOINED` | `{ sid: string, state: RoomState }` | 生徒入室成功 |
| `STATE` | `{ state: RoomState }` | フル状態同期 |
| `PHASE_CHANGE` | `{ phase, currentGameIndex, ...}` | フェーズ遷移通知 |
| `PROGRESS` | `{ gameId, count, total, perClass }` | 回答進捗 |
| `AGGREGATION` | `{ gameId, perClass, overall }` | 結果集計 |
| `STAGE_SUMMARY` | `{ overall, perClass }` | Stage終了集計 |
| `REACTION_BURST` | `{ emoji, ts }` | リアクション拡散 |
| `STUDENT_COUNT` | `{ count, perClass }` | 入室人数更新 |
| `ERROR` | `{ code, message }` | エラー |
| `PONG` | `{}` | ping応答 |

すべて JSON。WebSocket フレーム1つに1メッセージ。

---

## 7. 認可モデル

- **講師トークン**：ルーム作成時に1回だけ発行、`sessionStorage`に保管。以後の `T_*` メッセージに同梱
- **生徒sid**：入室時に発行、再接続時はsidを使ってstate復旧
- ルームコードは「入室の鍵」、講師トークンは「進行操作の鍵」

---

## 8. パフォーマンス設計

### 8.1 1ルーム300人での負荷見積

| 項目 | 試算 |
|---|---|
| WebSocket接続 | 300同時、1 Durable Object内 |
| メッセージ流量 | 平均10msg/sec/ルーム（回答+リアクション+ping） |
| 1メッセージサイズ | <1KB |
| Durable Object メモリ | <1MB |
| Workers リクエスト | 月数千〜数万、Paid枠で十分 |

### 8.2 WebSocket Hibernation
- アイドル時はDOがhibernateし、課金されない
- 復帰時にWebSocket状態は維持

### 8.3 失敗時のフォールバック
- WebSocket接続失敗 → 「ローカルモード」に切替表示
- 生徒は自分のペースで進める（既存実装）
- 講師は別途口頭進行

---

## 9. セキュリティ・プライバシー

| 項目 | 方針 |
|---|---|
| 個人情報 | 氏名・学籍番号・端末識別子を一切収集しない |
| 認証 | 講師トークン（短命、sessionStorage） + 生徒sid（匿名） |
| HTTPS / WSS | Cloudflareが自動付与 |
| XSS対策 | Reactの自動エスケープ |
| 永続DB | なし |
| Cookie | 使用しない |

---

## 10. デプロイ

### 10.1 ビルド〜デプロイ
```bash
npm run build              # client → dist/
npx wrangler deploy        # worker + dist/ を一括デプロイ
```

### 10.2 GitHub Actions
- main pushで自動デプロイ
- secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

### 10.3 環境
- **dev**: ローカルで `wrangler dev`
- **prod**: `*.workers.dev`

---

## 11. 既知のトレードオフ

| トレードオフ | 採用判断 |
|---|---|
| 自前バックエンドが増える | Workers Paid $5/月で許容 |
| Hibernation使用でコールドスタートあり | 数百ms、許容 |
| Durable Objects はリージョン固定 | 単一教室前提なので問題なし |
| WebSocket断時の再接続実装が必要 | sid再利用で復帰可能 |

---

## 12. 将来拡張ポイント

| 拡張 | 検討時期 |
|---|---|
| D1 にクラス別傾向を匿名集計で蓄積 | Phase 3 |
| R2 でAI画像をCDN配信 | Phase 2〜3 |
| KV でクラス名プリセット保存 | Phase 2 |
| 独自ドメイン切替 | 任意 |
