import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomeRoute } from '@/routes/HomeRoute';
import { TeacherRoute } from '@/routes/TeacherRoute';
import { StudentRoute } from '@/routes/StudentRoute';
import { SyncProvider } from '@/contexts/SyncContext';

// 管理ページとスライドビューワーは滅多にアクセスされないので分離
const AdminRoute = lazy(() => import('@/routes/AdminRoute').then((m) => ({ default: m.AdminRoute })));
const SlidesRoute = lazy(() => import('@/routes/SlidesRoute').then((m) => ({ default: m.SlidesRoute })));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
    読み込み中…
  </div>
);

const App = () => (
  <SyncProvider>
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/teacher" element={<TeacherRoute />} />
      <Route path="/student" element={<StudentRoute />} />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<Loading />}>
            <AdminRoute />
          </Suspense>
        }
      />
      <Route
        path="/slides"
        element={
          <Suspense fallback={<Loading />}>
            <SlidesRoute />
          </Suspense>
        }
      />
      <Route path="*" element={<HomeRoute />} />
    </Routes>
  </SyncProvider>
);

export default App;
