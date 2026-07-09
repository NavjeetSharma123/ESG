import React from 'react';
import { Link } from 'react-router-dom';
import { footerNav } from '../data/navigation';
import Container from './ui/Container';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link to="/" className="site-footer__logo">
              <span className="site-footer__logo-mark" aria-hidden="true"><img src="logo.png" alt="Icon"/></span>
              <span>Sustanica</span>
            </Link>
            <p className="site-footer__tagline">
              Structured sustainability disclosure for teams that need accuracy, not overhead.
            </p>
          </div>

          <div className="site-footer__column">
            <h3 className="site-footer__heading">Product</h3>
            <ul className="site-footer__links">
              {footerNav.product.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__column">
            <h3 className="site-footer__heading">Company</h3>
            <ul className="site-footer__links">
              {footerNav.company.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>&copy; {year} Sustanica. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
