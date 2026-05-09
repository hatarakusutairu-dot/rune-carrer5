import type { GameId } from '@shared/protocol';

// 生徒画面用のゲーム紹介テキスト
// スライド表示中・ゲーム開始待ちの間に表示
export type GameInfo = {
  emoji: string;
  name: string;
  description: string;
  rules: string[];
};

export const GAME_INFO: Record<GameId, GameInfo> = {
  balloon: {
    emoji: '🎈',
    name: '風船リスク',
    description: 'ふくらませるほど点数が増えるけど、割れたら0点。各風船には限界がある（毎回違う）。',
    rules: [
      '「ふくらます」で1pt増加',
      '「STOP」で確定（その風船の点を獲得）',
      '割れる前に止められるか？を試そう',
    ],
  },
  digit_span: {
    emoji: '🔢',
    name: '数字記憶',
    description: '出てきた数字を順番に覚えて、そのとおり入力。正解で1桁増、不正解で1桁減。',
    rules: [
      '時間制限内に何桁まで覚えられるか',
      '正解すると桁数+1、不正解だと桁数-1',
      '最高記録に挑戦！',
    ],
  },
  card_decks: {
    emoji: '🎴',
    name: 'カード山引き',
    description: '4つの山から好きな山を選んでカードを引く。お金が増える山と減る山があるから見分けよう。',
    rules: [
      '所持金 $2000 からスタート',
      '50枚引き終えるか時間切れで終了',
      'どの山が「良い山」かは試して見つける',
    ],
  },
  emotion_match: {
    emoji: '😊',
    name: '表情から気持ちを読む',
    description: '出てきた表情がどの感情か4択から選ぼう。似た感情の見分けがポイント。',
    rules: [
      '10問出題',
      '正解率と「微妙な違い」を見抜く力を測る',
    ],
  },
  money_split: {
    emoji: '🪙',
    name: 'コイン分配',
    description: '10コインを自分と相手でどう分ける？相手の関係性によって考え方が変わるかも。',
    rules: [
      '5つのシナリオで配分を決める',
      '相手は友達／チームメイト／知らない人など',
      '正解はない、自分の選び方を見るゲーム',
    ],
  },
  stop_signal: {
    emoji: '🚦',
    name: '信号反応',
    description: '緑が出たら即タップ、赤は押さない。だんだん速くなる集中力勝負。',
    rules: [
      '緑（▶）= 即タップ',
      '赤（✋）= 押さない',
      '後半ほどスピードアップ',
    ],
  },
  pattern_match: {
    emoji: '◆',
    name: 'パターン推論',
    description: '4つの図形の並びから次に来る図形を予想する。規則性を見抜こう。',
    rules: ['12問出題', '4択から選ぶ'],
  },
  towers: {
    emoji: '🗼',
    name: '塔の移動',
    description: '大きい円盤は小さい円盤の上に置けない。全部をゴール杭に移そう（ハノイの塔風）。',
    rules: [
      '杭をタップ → 円盤を選択',
      '移動先の杭をタップ → 移動',
      '5パズル、最少手数を目指す',
    ],
  },
  wasabi_waiter: {
    emoji: '🍜',
    name: '食堂タイム',
    description: '3卓に来るお客さんに注文どおりの料理を出そう。怒り出したら帰っちゃう！',
    rules: [
      '客の注文を覚えて料理を選ぶ',
      '我慢ゲージが切れる前に提供',
      'マルチタスクの腕の見せどころ',
    ],
  },
};
