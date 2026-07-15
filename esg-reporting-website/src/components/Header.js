import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { mainNav } from '../data/navigation';
import Button from './ui/Button';
import Container from './ui/Container';
import { getAuthSession, isAuthenticated, logout } from '../utils/auth';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const session = getAuthSession();
  const loggedIn = isAuthenticated();
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link to="/" className="site-header__logo" aria-label="Sustanica — Home">
          <span className="site-header__logo-mark" aria-hidden="true"><img src="logo.png" alt="Icon"/></span>
          <span className="site-header__logo-text">Sustanica</span>
        </Link>

        <nav className="site-header__nav" aria-label="Main navigation">
          <ul className="site-header__nav-list">
            {mainNav.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`site-header__nav-link${location.pathname === item.path ? ' is-active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Button as={Link} to="/demo" variant="ghost" className="site-header__demo-link">
            Contact
          </Button>
          {loggedIn ? (
            <>
              <Link to="/profile" className="site-header__user">{session.email}</Link>
              <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button as={Link} to="/login" variant="primary" size="sm">
              Login
            </Button>
          )}
        </div>

        <button
          type="button"
          className="site-header__menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="site-header__menu-bar" />
          <span className="site-header__menu-bar" />
        </button>
      </Container>

      <nav
        id="mobile-nav"
        className={`site-header__mobile${menuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
      >
        <Container>
          <ul className="site-header__mobile-list">
            {mainNav.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`site-header__mobile-link${location.pathname === item.path ? ' is-active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="site-header__mobile-cta">
              {loggedIn ? (
                <Button type="button" variant="primary" className="site-header__mobile-btn" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button as={Link} to="/login" variant="primary" className="site-header__mobile-btn">
                  Login
                </Button>
              )}
            </li>
          </ul>
        </Container>
      </nav>
    </header>
  );
};

export default Header;
