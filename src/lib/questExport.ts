type QuestAgg = {
  total: number;
  perClass: Record<string, number>;
  growSkillCounts: Record<string, number>;
  gameActionCounts: Record<string, number>;
  schoolActionCounts: Record<string, number>;
  samples: Array<{ className: string; growSkill: string; gameAction: string; schoolAction: string }>;
};

const csvEscape = (v: string | number): string => {
  const s = String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const buildQuestCsv = (agg: QuestAgg): string => {
  const lines: string[] = [];
  lines.push('# My Quest Card 集計');
  lines.push(`# 提出総数,${agg.total}`);
  lines.push('');
  lines.push('# クラス別提出数');
  lines.push('クラス,人数');
  for (const [cls, n] of Object.entries(agg.perClass)) {
    lines.push([csvEscape(cls), n].join(','));
  }
  lines.push('');
  lines.push('# 育てたい力 集計');
  lines.push('内容,人数');
  for (const [k, v] of Object.entries(agg.growSkillCounts).sort((a, b) => b[1] - a[1])) {
    lines.push([csvEscape(k), v].join(','));
  }
  lines.push('');
  lines.push('# ゲームでの行動 集計');
  lines.push('内容,人数');
  for (const [k, v] of Object.entries(agg.gameActionCounts).sort((a, b) => b[1] - a[1])) {
    lines.push([csvEscape(k), v].join(','));
  }
  lines.push('');
  lines.push('# 学校生活での行動 集計');
  lines.push('内容,人数');
  for (const [k, v] of Object.entries(agg.schoolActionCounts).sort((a, b) => b[1] - a[1])) {
    lines.push([csvEscape(k), v].join(','));
  }
  lines.push('');
  lines.push('# 個別カード（匿名）');
  lines.push('クラス,育てたい力,ゲームでの行動,学校生活での行動');
  for (const s of agg.samples) {
    lines.push(
      [csvEscape(s.className), csvEscape(s.growSkill), csvEscape(s.gameAction), csvEscape(s.schoolAction)].join(','),
    );
  }
  return lines.join('\r\n');
};

export const downloadBlob = (filename: string, content: string, mime: string): void => {
  const bom = '﻿';
  const blob = new Blob([bom + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const stamp = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
};
