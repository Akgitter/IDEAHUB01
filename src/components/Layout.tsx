import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, APP_NAME } from '../constants';
import '../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to={ROUTES.FEED} className="nav-brand">
            {APP_NAME}
          </Link>
          <div className="nav-links">
            <Link to={ROUTES.FEED} className={`nav-link ${isActive(ROUTES.FEED) ? 'active' : ''}`}>
              Feed
            </Link>
            <Link to={ROUTES.POST} className={`nav-link ${isActive(ROUTES.POST) ? 'active' : ''}`}>
              Post Idea
            </Link>
            <Link to={ROUTES.PROFILE} className={`nav-link ${isActive(ROUTES.PROFILE) ? 'active' : ''}`}>
              Profile
            </Link>
          </div>
          <div className="nav-user">
            <span className="user-name">{user.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
