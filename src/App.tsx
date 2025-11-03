import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Login from './pages/Login';
import Feed from './pages/Feed';
import PostIdea from './pages/PostIdea';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './constants';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={isAuthenticated ? <Navigate to={ROUTES.FEED} /> : <Login />} />
      <Route
        path={ROUTES.FEED}
        element={
          <ProtectedRoute>
            <Layout>
              <Feed />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.POST}
        element={
          <ProtectedRoute>
            <Layout>
              <PostIdea />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
