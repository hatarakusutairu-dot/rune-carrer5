# 画像配置ガイド（フラット命名）

このフォルダ `public/img/` に置いた画像はそのまま `/img/...` で配信されます。
**git commit + push でCloudflareにデプロイされ、どの端末からでも表示されます**。

ファイルが存在しない場合は自動で絵文字フォールバックされるので、段階的に揃えられます。

---

## 配置のしかた

1. ChatGPTで生成した PNG をダウンロード（生成プロンプトのファイル名と同じ命名）
2. このフォルダ `public/img/` に**そのままドロップ**
3. `git add public/img/ && git commit -m "add: 〇〇画像N枚" && git push`
4. Cloudflare が自動デプロイ → 全端末で見える

ファイルが無い key はそのまま絵文字表示なので、揃えなくても壊れません。

---

## ファイル名対応表

### 1. ロゴ
| ファイル名 | 用途 | 推奨サイズ |
|---|---|---|
| `logo.png` | アプリトップ | 1024×1024 PNG透過 |

### 2. 表情（EmotionMatch ゲーム用）— 10種

| ファイル名 | label | フォールバック |
|---|---|---|
| `emotion-joy.png` | 喜び | 😄 |
| `emotion-sad.png` | 悲しみ | 😢 |
| `emotion-anger.png` | 怒り | 😠 |
| `emotion-surprise.png` | 驚き | 😲 |
| `emotion-fear.png` | 恐れ | 😨 |
| `emotion-disgust.png` | 嫌悪 | 🤢 |
| `emotion-trust.png` | 信頼 | 😌 |
| `emotion-lonely.png` | 寂しさ | 🥺 |
| `emotion-peaceful.png` | 安らぎ | 😊 |
| `emotion-excitement.png` | 興奮 | 😆 |

推奨：512×512 PNG、200KB以内、表示は 128×128（object-cover）

### 3. AI 面接官アバター（Stage4 用）— 4種

| ファイル名 | name | tag | フォールバック |
|---|---|---|---|
| `avatar-a.png` | AI 面接官 A | 優しい系 | 🤖 |
| `avatar-b.png` | AI 面接官 B | 冷静系 | 👩‍💼 |
| `avatar-c.png` | AI 面接官 C | 親しみ系 | 🧑‍💼 |
| `avatar-d.png` | AI 面接官 D | 現場系 | 👨‍💻 |

推奨：512×512 PNG、表示は 80×80 円形（object-cover）

### 4. 風船（BalloonRisk）— 19種

| ファイル名 | 用途 |
|---|---|
| `balloon-{red,yellow,blue,green,purple,pink}-{small,mid,large}.png` | 6色 × 3サイズ = 18種 |
| `balloon-pop.png` | 割れた風船 1種 |

ChatGPTプロンプト名そのまま。例：`balloon-red-mid.png`

サイズ目安：small=100、mid=200、large=320 px（投影用）

### 5. カード山（CardDecks）— 5種

| ファイル名 | 用途 |
|---|---|
| `card-deck-{a,b,c,d}.png` | 4デッキの裏面 |
| `card-back-flipped.png` | めくった共通裏面 |

推奨：300×450 PNG（2:3）

### 6. コイン（MoneySplit）— 5種

| ファイル名 | 枚数 |
|---|---|
| `coin-1.png` | 1枚 |
| `coin-3.png` | 3枚 |
| `coin-5.png` | 5枚 |
| `coin-7.png` | 7枚 |
| `coin-10.png` | 10枚 |

推奨：500×500 PNG透過

### 7. 信号（StopSignal）— 2種

| ファイル名 | 用途 |
|---|---|
| `signal-go.png` | GO（緑） |
| `signal-stop.png` | STOP（赤） |

推奨：512×512 PNG透過

### 8. 図形（PatternMatch）— 36種

| パターン | 例 |
|---|---|
| `shape-{shape}-{color}.png` | 6図形 × 6色 = 36種 |

- shape: `circle, triangle, square, star, diamond, hex`
- color: `red, blue, yellow, green, orange, purple`

例：`shape-star-blue.png`

推奨：256×256 PNG透過

### 9. ランナーキャラ（演出用）— 8種

| ファイル名 | 用途 |
|---|---|
| `racer-{red,blue,green,purple}-{frame1,frame2}.png` | 4キャラ × 2フレーム |

例：`racer-red-frame1.png`

推奨：256×256 PNG透過

### 10. 待機シーン

| ファイル名 | 用途 |
|---|---|
| `waiting-scene.gif` | 早終了組の待機画面（**アニメーションGIF優先**） |
| `waiting-scene.png` | 静止画でも可（GIFが無い時のフォールバック） |

推奨：1280×720（16:9）。GIF はループ再生されます。

### 11. Towers（塔と円盤）— 6種

| ファイル名 | 用途 |
|---|---|
| `tower-peg.png` | 杭 |
| `tower-disk-1.png`〜`tower-disk-5.png` | 円盤5枚 |

推奨：透過 PNG。peg は縦長、disk は横長楕円。

### 12. Wasabi Waiter — 14種

| ファイル名 | 用途 |
|---|---|
| `food-{sushi,ramen,tempura,curry,salad,tea}.png` | 料理6種 |
| `customer-1.png`〜`customer-8.png` | 客の顔8種 |

推奨：256×256 PNG透過

### 13. リアクション絵文字 — 8種

| ファイル名 | 元絵文字 |
|---|---|
| `reaction-thumbs.png` | 👍 |
| `reaction-heart.png` | ❤️ |
| `reaction-laugh.png` | 😂 |
| `reaction-surprise.png` | 😮 |
| `reaction-sprout.png` | 🌱 |
| `reaction-fire.png` | 🔥 |
| `reaction-clap.png` | 👏 |
| `reaction-party.png` | 🎉 |

推奨：128×128 PNG透過

---

## 進捗状況

| カテゴリ | コード対応 | メモ |
|---|---|---|
| 1. logo | ✅ 対応済 | Layout ヘッダー左に表示 |
| 2. 表情 | ✅ 対応済 | EmotionMatch 中央 |
| 3. AIアバター | ✅ 対応済 | Stage4 ⑤AIアバター面接 |
| 4. 風船 | ✅ 対応済 | BalloonRisk（6色×3サイズ+pop） |
| 5. カード | ✅ 対応済 | CardDecks 4デッキ背景 |
| 6. コイン | ✅ 対応済 | MoneySplit（最近傍画像） |
| 7. 信号 | ✅ 対応済 | StopSignal GO/STOP |
| 8. 図形 | ✅ 対応済 | PatternMatch（6図形×6色） |
| 9. ランナー | ⏳ 未統合 | 画像参照する演出が未実装 |
| 10. 待機シーン | ✅ 対応済 | WaitingScene 上部 |
| 11. 塔 | ✅ 対応済 | Towers（peg + disk1〜5） |
| 12. 食堂 | ✅ 対応済 | WasabiWaiter（food6 + customer8） |
| 13. リアクション | ✅ 対応済 | ReactionBar / ReactionStream |

**ファイルを配置 → git push** で各端末に反映されます。
配置状況は `/admin` の「🔍 配信ファイル診断」でリアルタイム確認できます。

---

## ローカル管理ページ（補助）

`/admin` ページで画像を**端末ローカルに上書き**できますが、これは**その端末でしか反映されません**。
PCを変えると消えます。本番では git commit + push でデプロイしてください。
