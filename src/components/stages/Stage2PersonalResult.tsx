import { useEffect, useState } from 'react';
import { computeMyCumulative } from '@/lib/cumulativeScore';
import { SEED_TYPE_INFO } from '@/content/seedTypeDescriptions';
import { RadarChart } from '@/components/common/RadarChart';

export const Stage2PersonalResult = () => {
  // セッション内の回答が揃っているかをマウント時+5秒ごとに再計算
  const [result, setResult] = useState(() => computeMyCumulative());
  useEffect(() => {
    setResult(computeMyCumulative());
    const t = window.setInterval(() => setResult(computeMyCumulative()), 5000);
    return () => clearInterval(t);
  }, []);

  if (result.played === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center text-sm text-slate-600">
        まだミニゲームの結果がありません。
        <br />
        Stage 1 のあとに「あなたの強みの芽」がここに表示されます。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-5 sm:p-6">
        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          Stage 2
        </div>
        <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
          あなたの強みの芽
        </h2>

        {/* 一言タイプ見出し */}
        {result.topTypes.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white border-2 border-emerald-300 p-5 text-center">
            <div className="text-xs text-emerald-700 font-semibold">今日のあなたは</div>
            <div className="mt-1 flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black text-emerald-900">
              <span>{SEED_TYPE_INFO[result.topTypes[0]].emoji}</span>
              <span>{SEED_TYPE_INFO[result.topTypes[0]].label.replace('の芽', '')}型</span>
            </div>
            {result.topTypes[1] && (
              <div className="mt-2 text-sm text-slate-600">
                次に強かったのは{' '}
                <span className="font-bold text-slate-800">
                  {SEED_TYPE_INFO[result.topTypes[1]].emoji}{' '}
                  {SEED_TYPE_INFO[result.topTypes[1]].label.replace('の芽', '')}型
                </span>
              </div>
            )}
          </div>
        )}

        <p className="mt-3 text-sm text-slate-700">
          {result.played}個のゲームから見えた、今日のあなたの傾向です。
          <br />
          <span className="text-xs text-slate-500">
            ※「あなたの全部」ではなく「今日の選択の傾向」です。
          </span>
        </p>

        <div className="mt-4 flex justify-center">
          <RadarChart
            scores={result.scores}
            size={280}
            color="emerald"
            label="6軸の傾向"
          />
        </div>

        {result.topTypes.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-2">
              特に強く見えた芽（上位{result.topTypes.length}つ）
            </div>
            <div className="space-y-3">
              {result.topTypes.map((t) => {
                const info = SEED_TYPE_INFO[t];
                return (
                  <div
                    key={t}
                    className={`rounded-xl border p-3 ${info.color}`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-2xl">{info.emoji}</span>
                      <span className="text-lg">{info.label}</span>
                    </div>
                    <div className="text-xs mt-1 opacity-80">{info.short}</div>
                    <p className="mt-2 text-sm leading-relaxed">
                      {info.description}
                    </p>
                    <p className="mt-2 text-xs opacity-90">
                      <span className="font-semibold">将来活きる場面：</span>
                      {info.futureLink}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-700">
        <p>
          複数の芽が見えた人もいます。それは強みです。
          <br />
          1つだけ強く出た人は、それが個性。チームの中で頼られる役になれます。
        </p>
      </div>
    </div>
  );
};
