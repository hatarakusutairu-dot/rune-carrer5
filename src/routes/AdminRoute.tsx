import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { AdminQuestExport } from '@/components/admin/AdminQuestExport';
import { AdminSlides } from '@/components/admin/AdminSlides';
import { AdminSlidesControl } from '@/components/admin/AdminSlidesControl';
import { AdminImages } from '@/components/admin/AdminImages';
import { AdminDiagnostics } from '@/components/admin/AdminDiagnostics';

export const AdminRoute = () => {
  return (
    <Layout title="管理ページ" subtitle="画像・スライド・データ管理（投影PC専用）">
      <div className="space-y-6 max-w-5xl">
        <NavBack />

        <Section title="📥 アンケート / My Quest 結果ダウンロード" tone="amber">
          <AdminQuestExport />
        </Section>

        <Section title="🖼 画像管理（EmotionMatch・AIアバター）" tone="violet">
          <AdminImages />
        </Section>

        <Section title="⏯ スライド進行コントロール" tone="rose">
          <AdminSlidesControl />
        </Section>

        <Section title="🎞 スライド管理（追加・削除）" tone="rose">
          <AdminSlides />
        </Section>

        <Section title="🔍 配信ファイル診断" tone="slate">
          <AdminDiagnostics />
        </Section>

        <p className="text-[11px] text-slate-500 italic">
          管理ページへのアクセスは <code>/admin</code> で開けます。授業中は講師モード（<code>/teacher</code>）に切り替えてください。
        </p>
      </div>
    </Layout>
  );
};

const NavBack = () => (
  <div className="flex gap-2 text-sm">
    <Link to="/" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
      ← ホームへ
    </Link>
    <Link to="/teacher" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
      講師モードへ
    </Link>
    <Link to="/slides" className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800">
      スライド再生
    </Link>
  </div>
);

const TONE_CLASSES: Record<string, string> = {
  amber: 'from-amber-50 to-rose-50 border-amber-200',
  violet: 'from-violet-50 to-sky-50 border-violet-200',
  rose: 'from-rose-50 to-pink-50 border-rose-200',
  slate: 'from-slate-50 to-slate-100 border-slate-200',
};

const Section = ({
  title,
  tone,
  children,
}: {
  title: string;
  tone: keyof typeof TONE_CLASSES;
  children: React.ReactNode;
}) => (
  <section className={`rounded-2xl bg-gradient-to-br ${TONE_CLASSES[tone]} border p-5`}>
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);
