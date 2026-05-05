# 画像配置ガイド

このフォルダに置いた画像は Vite が `/img/...` で配信します。
ファイルが**存在しない場合は自動で絵文字フォールバック**されるので、
段階的に差し替えできます。

---

## emotions/（EmotionMatch ゲーム用）

- パス: `public/img/emotions/{key}.png`
- 推奨サイズ: 512×512 px、PNG（透過可）、200KB 以内
- 表示サイズ: 128×128 px（`w-32 h-32`、object-cover）
- 構図: 顔のクローズアップ、感情が一目で分かる表情

| key | label | フォールバック絵文字 |
|---|---|---|
| joy | 喜び | 😄 |
| sad | 悲しみ | 😢 |
| anger | 怒り | 😠 |
| surprise | 驚き | 😲 |
| fear | 恐れ | 😨 |
| disgust | 嫌悪 | 🤢 |
| trust | 信頼 | 😌 |
| anticipation | 期待 | 🤩 |
| relief | 安堵 | 😮‍💨 |
| lonely | 寂しさ | 🥺 |
| irritated | 苛立ち | 😤 |
| confused | 戸惑い | 😕 |
| anxious | 不安 | 😟 |
| contempt | 軽蔑 | 😏 |
| peaceful | 安らぎ | 😊 |
| excitement | 興奮 | 😆 |
| disappointed | 落胆 | 😔 |
| tense | 緊張 | 😬 |

例: `public/img/emotions/joy.png`、`public/img/emotions/sad.png` …

---

## avatars/（Stage4 AI 面接官アバター）

- パス: `public/img/avatars/ai_{key}.png`
- 推奨サイズ: 512×512 px、PNG、200KB 以内
- 表示サイズ: 80×80 px（`w-20 h-20`、丸トリミング、object-cover）

| key | name | tag | フォールバック絵文字 |
|---|---|---|---|
| a | AI 面接官 A | 優しい系 | 🤖 |
| b | AI 面接官 B | 冷静系 | 👩‍💼 |
| c | AI 面接官 C | 親しみ系 | 🧑‍💼 |
| d | AI 面接官 D | 現場系 | 👨‍💻 |

例: `public/img/avatars/ai_a.png` …

---

## 配置手順

1. ローカルで画像を生成・取得
2. このフォルダにファイル名を合わせて配置
3. `git add public/img/ && git commit -m "add: 感情画像N枚" && git push`
4. デプロイ（自動 or `npm run deploy`）

ファイルが無い key はそのまま絵文字表示なので、揃えなくても壊れません。
