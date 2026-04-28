# 技術構成・アーキテクチャ

最終更新：2026-04-28

## 1. 全体方針

**「サーバーを持たない静的Webアプリ」** を基本方針とする。
300名同時アクセスでも安定動作させるため、サーバー側処理を最小化し、
診断・保存はすべてクライアント側で完結させる。

---

## 2. アーキテクチャ図

```
┌──────────────────────────────────────────────────────┐
│                   静的ホスティング                       │
│      (GitHub Pages / Netlify / Vercel / Cloudflare)   │
│                                                        │
│   ┌──────────────────────────────────────────────┐    │
│   │  HTML / CSS / JS（バンドル済み・キャッシュ可）  │    │
│   └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
              ▲                              ▲
              │ 初回ロード後はオフライン可     │
              │                              │
   ┌──────────┴──────────┐        ┌─────────┴──────────┐
   │  講師PC（投影）      │        │  生徒スマホ/PC     │
   │  /teacher           │        │  /student          │
   │  - タイマー         │        │  - ミニゲーム      │
   │  - 進行管理         │        │  - localStorage    │
   │  - QR表示           │        │  - 診断            │
   └─────────────────────┘        └────────────────────┘

   ※ 講師画面と生徒画面の間にリアルタイム通信なし（MVP）
   ※ 全データは各端末のlocalStorageに閉じる
```

---

## 3. 技術スタック

### 3.1 フロントエンド

| 項目 | 選定 | 理由 |
|---|---|---|
| 言語 | TypeScript | 型安全・保守性 |
| フレームワーク | React 18 | エコシステム・SPA構築の容易さ |
| ビルドツール | Vite | 高速・軽量バンドル |
| スタイル | Tailwind CSS | クラスベース・追加CSSが軽い |
| ルーティング | React Router | /teacher と /student の分離 |
| 状態管理 | React Context | 軽量・追加依存なし |
| QRコード | qrcode.react | 軽量・依存少 |
| アイコン | lucide-react | 軽量SVGアイコン |

### 3.2 永続化

| 項目 | 選定 | 用途 |
|---|---|---|
| localStorage | 標準API | 生徒の回答・診断結果 |
| sessionStorage | 標準API | 講師のタイマー状態 |

### 3.3 配信

| 項目 | 選定 |
|---|---|
| CI/CD | GitHub Actions |
| ホスティング | GitHub Pages（第一候補） |
| ドメイン | 必要に応じてカスタムドメイン |

---

## 4. ディレクトリ構成（予定）

```
rune-carrer5/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── index.html
├── public/
│   └── (静的アセット最小限)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── TeacherRoute.tsx       # 講師モード
│   │   ├── StudentRoute.tsx       # 生徒モード
│   │   └── HomeRoute.tsx          # 入口
│   ├── stages/
│   │   ├── Stage0Start.tsx
│   │   ├── Stage1MiniGame.tsx
│   │   ├── Stage2Result.tsx
│   │   ├── Stage3Share.tsx
│   │   ├── Stage4Reveal.tsx
│   │   ├── Stage5SkillLink.tsx
│   │   └── Stage6MyQuest.tsx
│   ├── components/
│   │   ├── teacher/
│   │   │   ├── Timer.tsx
│   │   │   ├── StageNav.tsx
│   │   │   ├── QRDisplay.tsx
│   │   │   └── FallbackPanel.tsx
│   │   ├── student/
│   │   │   ├── MiniGameCard.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── QuestCard.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       └── Layout.tsx
│   ├── content/
│   │   ├── miniGames.ts           # ミニゲームの問題定義
│   │   ├── stages.ts              # Stage進行データ
│   │   ├── skillLinks.ts          # ゲームスキル接続マップ
│   │   └── messages.ts            # 表示文言
│   ├── lib/
│   │   ├── storage.ts             # localStorage管理
│   │   ├── scoring.ts             # タイプ判定ロジック
│   │   └── timer.ts               # タイマーロジック
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── docs/
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── STAGES.md
│   ├── DEVELOPMENT_PLAN.md
│   ├── PROGRESS.md
│   └── ERROR_LOG.md
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 5. データフロー

### 5.1 生徒回答フロー

```
[生徒画面]
   ↓ ボタン押下
[Reactイベントハンドラ]
   ↓ 回答を state に追加
[localStorage保存]
   ↓ Stage1完了時
[scoring.ts でタイプ判定]
   ↓ Stage2へ遷移
[強みの芽表示]
   ↓ Stage6 で
[QuestCard 生成・表示]
```

### 5.2 講師進行フロー

```
[講師画面]
   ↓ 開始ボタン
[全体タイマー開始 / sessionStorage]
   ↓ 自動的にStage切替（推奨時間で通知）
[次へ/戻るボタンで手動進行も可]
   ↓ 各Stageで
[QR表示 / 問い表示 / 講師メモ表示]
```

### 5.3 リアルタイム同期について
**初期版では実装しない**。
講師画面と生徒画面は独立して進行する。生徒の進捗は講師画面に反映されない。
これにより、サーバー処理・WebSocket接続を不要とし、300名規模に耐える。

---

## 6. パフォーマンス設計

### 6.1 バンドルサイズ目標

| 項目 | 目標 |
|---|---|
| 初回JS（gzip） | < 150KB |
| 初回CSS（gzip） | < 20KB |
| 画像合計 | < 200KB |
| 初回ロード時間（4G） | < 3秒 |

### 6.2 最適化方針
- 画像はSVG優先、ラスタはWebP
- 動画は使用しない（または極小プレビュー）
- コード分割：ルート単位（teacher / student）
- フォントはシステムフォント中心
- Service Workerで2回目以降オフライン化（後期検討）

### 6.3 300名同時アクセス耐性
- 静的配信のため、CDN配信能力に依存
- 各クライアントが独立処理 → サーバーボトルネックなし
- localStorage使用 → サーバー保存処理ゼロ

---

## 7. セキュリティ設計

| 項目 | 方針 |
|---|---|
| 個人情報 | 一切収集しない |
| 認証 | なし（不要） |
| HTTPS | 配信プラットフォームで強制 |
| XSS対策 | Reactの自動エスケープに依存 |
| 外部送信 | localStorage以外への永続化なし |
| Cookie | 使用しない |
| 解析タグ | 初期版では入れない |

---

## 8. ブラウザサポート

| ブラウザ | 対象 |
|---|---|
| iOS Safari | 直近2バージョン |
| Android Chrome | 直近2バージョン |
| Desktop Chrome / Edge / Firefox | 最新 |
| IE11 | 非対応 |

---

## 9. 環境変数

初期版では機密情報を扱わないため、環境変数は最小限。

| 変数 | 用途 |
|---|---|
| `VITE_BASE_URL` | デプロイ先のベースURL（QR生成用） |
| `VITE_APP_VERSION` | リリースバージョン表示 |

---

## 10. デプロイ戦略

### 10.1 ブランチ運用
- `main`：本番反映
- `claude/kahoot-independent-design-CRd6X`：開発ブランチ
- フィーチャーブランチ：必要に応じて切る

### 10.2 自動デプロイ
- `main` への push をトリガーにGitHub Actionsで自動ビルド・デプロイ
- プレビュー環境はNetlify Deploy Preview等で対応（オプション）

---

## 11. 将来拡張ポイント

| 拡張 | 検討時期 |
|---|---|
| Service Worker（オフライン化） | フェーズ2 |
| リアルタイム集計（WebSocket） | フェーズ3以降 |
| バックエンドDB | 実証で必要性が確認されたら |
| 講師ダッシュボード | フェーズ3以降 |
| 多授業テンプレート対応 | フェーズ3以降 |
