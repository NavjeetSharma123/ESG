import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DemoForm from './DemoForm';
import './HomePage.css';

const services = [
  {
    id: 'esg-report',
    title: 'ESG Report Generation',
    description: 'Comprehensive Environmental, Social, and Governance reports aligned with GRI, SASB & TCFD frameworks.',
    icon: '📊',
    path: '/esg-report',
  },
  {
    id: 'carbon',
    title: 'Carbon Accounting',
    description: 'Track and measure your organization\'s carbon footprint with Scope 1, 2 & 3 emissions.',
    icon: '🌱',
    path: '/esg-report',
  },
  {
    id: 'financial',
  title: 'BRSR',
  description: 'Open the BRSR form for SEBI-aligned disclosures.',
  icon: '💰',
  path: '/brsr',
  },
  {
  id: 'supply-chain',
  title: 'GRI Company Details',
  description: 'Open the GRI company details form aligned to GRI standards.',
  icon: '🔗',
  path: '/gri-details',
  },
  {
    id: 'green-check',
    title: 'Green Assessment',
    description: 'Discover how green your business is with our comprehensive environmental assessment.',
    icon: '✅',
    path: '/esg-report',
  },
  {
    id: 'social-esg',
    title: 'Social ESG Reporting',
    description: 'Report on workforce diversity, community impact, and social responsibility initiatives.',
    icon: '👥',
    path: '/esg-report',
  },
  {
    id: 'scoring',
    title: 'Sustainability Scoring',
    description: 'Environmental, social & growth opportunity scores to make your business more sustainable.',
    icon: '⭐',
    path: '/msci-readiness',
  },
  {
    id: 'reduce',
    title: 'Emissions Reduction Strategy',
    description: 'Actionable insights to reduce emissions and make your business more sustainable.',
    icon: '📉',
    path: '/esg-report',
  },
  {
    id: 'compliance',
    title: 'Compliance Report Generation',
    description: 'Generate regulatory compliance reports for ESG standards and frameworks.',
    icon: '📋',
    path: '/esg-report',
  },
];

const HomePage = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="homepage">
      <section className="hero">
        <h1 className="hero-title">
          Sustainable Business, <span className="accent">Measured</span>
        </h1>
        <p className="hero-subtitle">
          ESG report generation, carbon accounting, and sustainability services to help your business thrive responsibly.
        </p>
        <div className="hero-actions">
          <Link to="/esg-report" className="btn btn-primary">
            Generate ESG Report
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowDemoModal(true)}
          >
            Request a Demo
          </button>
        </div>
      </section>

      <section className="services-section">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          {services.map((service) => (
            <Link
              key={service.id}
              to={service.path}
              className="service-card"
            >
              <span className="service-icon">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {showDemoModal && (
        <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowDemoModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <DemoForm onClose={() => setShowDemoModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
