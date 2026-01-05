import { Navigate, createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { OrganizationsPage } from '../pages/OrganizationsPage';
import { BoardPage } from '../pages/BoardPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppShell } from '../components/AppShell';

const AppLayout = () => (
  <AppShell>
    <OrganizationsPage />
  </AppShell>
);

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <AppLayout /> },
      {
        path: '/projects/:projectId/board',
        element: (
          <AppShell>
            <BoardPage />
          </AppShell>
        )
      },
      { path: '*', element: <Navigate to="/" /> }
    ]
  }
]);
