import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} ESG Reporting Website. All rights reserved.</p>
                <ul>
                    <li><Link to="/services">Services</Link></li>
                    <li><Link to="/demo">Request a Demo</Link></li>
                    <li><Link to="/esg-report">ESG Report</Link></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;