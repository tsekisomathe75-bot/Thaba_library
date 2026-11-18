import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandMark from './BrandMark';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/users');
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand" aria-label="Thaba Library home">
          <BrandMark />
          <span className="brand-name">Thaba <em>Library</em></span>
        </Link>

        {user ? (
          <>
            <nav className="nav" aria-label="Main navigation">
              <NavLink to="/" end>Dashboard</NavLink>
              <NavLink to="/books">Books</NavLink>
              <NavLink to="/transactions">Transactions</NavLink>
              <NavLink to="/users">{isAdmin ? 'Users' : 'Account'}</NavLink>
            </nav>
            <div className="whoami">
              <span>
                {user.name} <small>{user.role}</small>
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log out</button>
            </div>
          </>
        ) : (
          <div className="whoami auth-links">
            <Link to="/users" className="btn btn-outline btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Join the library</Link>
          </div>
        )}
      </div>
    </header>
  );
}
