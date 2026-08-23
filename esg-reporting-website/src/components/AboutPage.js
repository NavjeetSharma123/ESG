import React from 'react';
import { Link } from 'react-router-dom';
import Container from './ui/Container';
import Button from './ui/Button';
import './AboutPage.css';

const AboutPage = () => (
  <div className="about-page">
    <header className="ds-page-header">
      <Container>
        <h1 className="ds-page-header__title">About us</h1>
        <p className="ds-page-header__description">
          We help sustainability teams move from scattered data to structured, audit-ready disclosure.
        </p>
      </Container>
    </header>

    <Container className="about-page__body">
      <section className="about-page__section">
        <h2 className="about-page__heading">Who we are</h2>
        <p className="about-page__text">
          Sustanica is an AI-powered ESG reporting platform built for companies that need accurate
          sustainability disclosure without the spreadsheet overhead. We bring evidence collection,
          framework mapping, and report generation into one responsive workspace.
        </p>
      </section>

      <section className="about-page__section">
        <h2 className="about-page__heading">What we do</h2>
        <p className="about-page__text">
          Our platform guides teams through guided disclosures aligned with GRI, SASB, TCFD, BRSR,
          and UNGC. Progress saves as you work, AI surfaces gaps in your data, and exports are
          ready for board review, investor relations, or regulatory filing.
        </p>
      </section>

      <section className="about-page__section">
        <h2 className="about-page__heading">Our focus</h2>
        <ul className="about-page__list">
          <li>Structured disclosure workflows — not one-off documents</li>
          <li>Framework coverage your stakeholders expect</li>
          <li>Evidence trails that stand up to audit review</li>
          <li>Tools that scale from first report to annual cycles</li>
        </ul>
      </section>

      <div className="about-page__cta">
        <p className="about-page__text">Ready to see the platform in action?</p>
        <Button as={Link} to="/demo" variant="primary">
          Request a demo
        </Button>
      </div>

      <footer className="about-page__footer">
        <p className="about-page__text">Connect with us on LinkedIn</p>
        <a
          href="https://www.linkedin.com/company/sustanica-esg/"
          className="about-page__linkedin"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sustanica on LinkedIn
        </a>
      </footer>
    </Container>
  </div>
);

export default AboutPage;
