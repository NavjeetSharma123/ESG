import React from 'react';
import { useHistory } from 'react-router-dom';
import './CompaniesPage.css';

const companies = [
  {
    name: 'GreenTech Industries Ltd.',
    sector: 'Manufacturing',
    location: 'Mumbai, India',
    services: 'BRSR Reporting, ESG Benchmarking',
    since: '2023',
  },
  {
    name: 'Urban Infra Developers',
    sector: 'Infrastructure & Real Estate',
    location: 'Delhi NCR, India',
    services: 'ESG Report Generation, GRI Mapping',
    since: '2022',
  },
  {
    name: 'FutureFin Services',
    sector: 'Financial Services',
    location: 'Bengaluru, India',
    services: 'BRSR Compliance, ESG Analytics',
    since: '2024',
  },
  {
    name: 'SolarWay Energy Pvt. Ltd.',
    sector: 'Renewable Energy',
    location: 'Hyderabad, India',
    services: 'ESG & Impact Reporting',
    since: '2021',
  },
];

const CompaniesPage = () => {
  const history = useHistory();

  const handleCompanyClick = (company) => {
    const country = company.location.split(',').slice(-1)[0].trim();

    history.push({
      pathname: '/esg-report',
      state: {
        presetCompany: {
          name: company.name,
          industry: company.sector,
          hqLocation: country,
        },
      },
    });
  };

  return (
    <div className="companies-page">
      <header className="companies-header">
        <h1>Companies Using Our ESG Reporting Services</h1>
        <p>
          A snapshot of organisations that rely on our platform for ESG, BRSR, and sustainability reporting.
        </p>
      </header>

      <section className="companies-list-section">
        <div className="companies-list-card">
          <div className="companies-list-header">
            <span>Company</span>
            <span>Sector</span>
            <span>Location</span>
            <span>Services Used</span>
            <span>Client Since</span>
          </div>
          {companies.map((company) => (
            <div className="companies-list-row" key={company.name}>
              <button
                type="button"
                className="companies-name-button"
                onClick={() => handleCompanyClick(company)}
              >
                {company.name}
              </button>
              <span>{company.sector}</span>
              <span>{company.location}</span>
              <span>{company.services}</span>
              <span>{company.since}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CompaniesPage;

