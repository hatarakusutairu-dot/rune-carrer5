import { Route, Routes } from 'react-router-dom';
import { HomeRoute } from '@/routes/HomeRoute';
import { TeacherRoute } from '@/routes/TeacherRoute';
import { StudentRoute } from '@/routes/StudentRoute';
import { SyncProvider } from '@/contexts/SyncContext';

const App = () => (
  <SyncProvider>
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/teacher" element={<TeacherRoute />} />
      <Route path="/student" element={<StudentRoute />} />
      <Route path="*" element={<HomeRoute />} />
    </Routes>
  </SyncProvider>
);

export default App;
