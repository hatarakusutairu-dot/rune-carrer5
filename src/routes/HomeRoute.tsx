import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { MESSAGES } from '@/content/messages';

export const HomeRoute = () => (
  <Layout title={MESSAGES.appName} subtitle="高校eスポーツコース 60分授業進行アプリ">
    <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
      <Link
        to="/teacher"
        className="block rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-md transition"
      >
        <div className="text-2xl">🎤</div>
        <div className="mt-2 text-lg font-bold">講師モード</div>
        <p className="text-sm text-slate-600 mt-1">
          スクリーン投影用。タイマー・QR・進行管理。
        </p>
      </Link>
      <Link
        to="/student"
        className="block rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-md transition"
      >
        <div className="text-2xl">🌱</div>
        <div className="mt-2 text-lg font-bold">生徒モード</div>
        <p className="text-sm text-slate-600 mt-1">
          スマホ/PCで参加。ミニゲーム・診断・My Quest Card。
        </p>
      </Link>
    </div>
    <p className="mt-8 text-xs text-slate-500">
      個人情報は一切収集しません。回答結果は端末内にのみ保存されます。
    </p>
  </Layout>
);
