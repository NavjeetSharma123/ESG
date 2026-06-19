import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mainNav } from '../data/navigation';
import Button from './ui/Button';
import Container from './ui/Container';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link to="/" className="site-header__logo" aria-label="ESG Reporting — Home">
          <span className="site-header__logo-mark" aria-hidden="true" />
          <span className="site-header__logo-text">ESG Reporting</span>
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
          <Button as={Link} to="/esg-report" variant="primary" size="sm">
            Start report
          </Button>
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
              <Button as={Link} to="/esg-report" variant="primary" className="site-header__mobile-btn">
                Start report
              </Button>
            </li>
          </ul>
        </Container>
      </nav>
    </header>
  );
};

export default Header;
