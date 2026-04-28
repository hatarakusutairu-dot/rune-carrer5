import type { MiniGameQuestion } from '@/types';

export const MINI_GAMES: MiniGameQuestion[] = [
  {
    id: 'q1',
    prompt: '5人パーティでボス戦に挑む。あなたが選ぶ役割は？',
    options: [
      { key: 'A', label: '先頭で攻撃を引き受ける',     main: 'leader',    sub: 'challenge' },
      { key: 'B', label: '味方を回復・支援する',       main: 'support',   sub: 'balance'   },
      { key: 'C', label: '敵の弱点を分析して指示を出す', main: 'analysis',  sub: 'leader'    },
      { key: 'D', label: '新しい戦略を試してみる',      main: 'challenge', sub: 'analysis'  },
    ],
  },
  {
    id: 'q2',
    prompt: 'ゲームで連敗した。次にすることは？',
    options: [
      { key: 'A', label: 'すぐにもう一戦',                  main: 'challenge', sub: 'continuity' },
      { key: 'B', label: '負けた理由を振り返る',            main: 'analysis',  sub: 'continuity' },
      { key: 'C', label: 'チームに「気にしないで」と声をかける', main: 'support',   sub: 'balance'    },
      { key: 'D', label: '少し休んで気持ちを整える',         main: 'balance',   sub: 'support'    },
    ],
  },
  {
    id: 'q3',
    prompt: 'アップデートで新マップが来た。あなたはまず？',
    options: [
      { key: 'A', label: 'とりあえず突っ込んで覚える',     main: 'challenge', sub: 'continuity' },
      { key: 'B', label: 'マップ構造を確認して動線を予想',  main: 'analysis',  sub: 'balance'    },
      { key: 'C', label: '仲間と情報交換',                main: 'support',   sub: 'analysis'   },
      { key: 'D', label: '毎日少しずつ攻略する',           main: 'continuity', sub: 'analysis'  },
    ],
  },
  {
    id: 'q4',
    prompt: 'ボイチャで揉めそうな雰囲気。あなたは？',
    options: [
      { key: 'A', label: '空気を変える一言を言う',         main: 'leader',    sub: 'support'  },
      { key: 'B', label: '一旦冷静になろうと提案する',      main: 'balance',   sub: 'analysis' },
      { key: 'C', label: '黙って状況を見守る',             main: 'analysis',  sub: 'balance'  },
      { key: 'D', label: '相手の気持ちを聞きにいく',       main: 'support',   sub: 'balance'  },
    ],
  },
  {
    id: 'q5',
    prompt: '練習時間が30分ある。何に使う？',
    options: [
      { key: 'A', label: '苦手な操作を反復する',           main: 'continuity', sub: 'analysis'  },
      { key: 'B', label: '上手い人のプレイを観察する',      main: 'analysis',   sub: 'continuity' },
      { key: 'C', label: '友達と通話しながら遊ぶ',          main: 'support',    sub: 'balance'   },
      { key: 'D', label: '新キャラ・新装備を試す',         main: 'challenge',  sub: 'analysis'  },
    ],
  },
  {
    id: 'q6',
    prompt: 'チームを作るなら、自分はどんな存在？',
    options: [
      { key: 'A', label: '前で旗を立てる人',                main: 'leader',    sub: 'challenge' },
      { key: 'B', label: '裏で全体を整える人',              main: 'balance',   sub: 'support'  },
      { key: 'C', label: '味方の調子を見て支える人',         main: 'support',   sub: 'analysis' },
      { key: 'D', label: 'コツコツ強くなって貢献する人',    main: 'continuity', sub: 'analysis' },
    ],
  },
];
