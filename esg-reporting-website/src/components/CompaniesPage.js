import React from 'react';
import { useHistory } from 'react-router-dom';
import Container from './ui/Container';
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
      <header className="ds-page-header">
        <Container>
          <h1 className="ds-page-header__title">Client companies</h1>
          <p className="ds-page-header__description">
            Organizations using our platform for ESG, BRSR, and sustainability reporting.
            Select a company to pre-fill the report builder.
          </p>
        </Container>
      </header>

      <Container className="companies-page__body">
        <div className="ds-table-wrap">
          <table className="ds-table companies-table">
            <thead>
              <tr>
                <th scope="col">Company</th>
                <th scope="col">Sector</th>
                <th scope="col">Location</th>
                <th scope="col">Services</th>
                <th scope="col">Since</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.name}>
                  <td>
                    <button
                      type="button"
                      className="companies-table__link"
                      onClick={() => handleCompanyClick(company)}
                    >
                      {company.name}
                    </button>
                  </td>
                  <td>{company.sector}</td>
                  <td>{company.location}</td>
                  <td>{company.services}</td>
                  <td>{company.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
};

export default CompaniesPage;
