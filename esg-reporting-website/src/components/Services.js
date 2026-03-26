import React from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

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
  title: 'BRSR Reporting',
  description: 'Open the BRSR form for SEBI-aligned disclosures.',
  icon: '💰',
  path: '/brsr',
  },
  {
  id: 'supply-chain',
  title: 'GRI Reporting',
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

const Services = () => (
  <div className="services-page">
    <section className="services-hero">
      <h1>Our Services</h1>
      <p>
        End-to-end sustainability solutions to measure, report, and improve your ESG performance.
      </p>
    </section>
    <section className="services-grid-section">
      <div className="services-grid">
        {services.map((service) => (
          <Link key={service.id} to={service.path} className="service-card">
            <span className="service-icon">{service.icon}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </Link>
        ))}
      </div>
    </section>
  </div>
);

export default Services;
