import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Assuming you have a CSS file for header styles

const Header = () => {
    return (
        <header className="header">
            <h1 className="site-title">ESG Reporting Services</h1>
            <nav className="navigation">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/services">Services</Link></li>
                    <li><Link to="/esg-report">ESG Report Generation</Link></li>
                    <li><Link to="/demo">Request a Demo</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;