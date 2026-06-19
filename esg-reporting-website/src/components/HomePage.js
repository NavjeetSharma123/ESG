import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  services,
  FRAMEWORKS,
  HOW_IT_WORKS,
  STATS,
  SERVICE_CATEGORIES,
} from '../data/services';
import Button from './ui/Button';
import Container from './ui/Container';
import Badge from './ui/Badge';
import SectionHeader from './ui/SectionHeader';
import ServiceIcon from './ui/ServiceIcon';
import Modal from './ui/Modal';
import DemoForm from './DemoForm';
import './HomePage.css';

const HomePage = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="home">
      {/* Hero */}
      <section className="home-hero" aria-labelledby="hero-heading">
        <Container>
          <div className="home-hero__grid">
            <div className="home-hero__content">
              <p className="home-hero__eyebrow">Sustainability reporting platform</p>
              <h1 id="hero-heading" className="home-hero__title">
                Make Your Business ESG Ready
              </h1>
              <p className="home-hero__description">
              <b>ESG disclosure, from data to audit-ready reports<br/></b>
                Collect framework-aligned responses, track emissions, and generate structured
                reports for GRI, SASB, TCFD, and BRSR — without rebuilding your process each year.
              </p>
              <div className="home-hero__actions">
                <Button as={Link} to="/esg-report" variant="primary" size="lg">
                  Start a report
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowDemoModal(true)}
                >
                  Request a demo
                </Button>
              </div>
              <div className="home-hero__frameworks" aria-label="Supported frameworks">
                {FRAMEWORKS.map((fw) => (
                  <Badge key={fw}>{fw}</Badge>
                ))}
              </div>
            </div>

            <div className="home-hero__preview" aria-hidden="true">
              <div className="home-preview">
                <div className="home-preview__toolbar">
                  <span className="home-preview__dot" />
                  <span className="home-preview__dot" />
                  <span className="home-preview__dot" />
                  <span className="home-preview__title">Report builder</span>
                </div>
                <div className="home-preview__body">
                  <div className="home-preview__sidebar">
                    <div className="home-preview__nav-item is-active">Company profile</div>
                    <div className="home-preview__nav-item">Governance</div>
                    <div className="home-preview__nav-item">Emissions</div>
                    <div className="home-preview__nav-item">Social</div>
                  </div>
                  <div className="home-preview__main">
                    <div className="home-preview__progress">
                      <div className="home-preview__progress-bar" style={{ width: '68%' }} />
                    </div>
                    <div className="home-preview__field">
                      <div className="home-preview__label" />
                      <div className="home-preview__input" />
                    </div>
                    <div className="home-preview__field">
                      <div className="home-preview__label home-preview__label--short" />
                      <div className="home-preview__textarea" />
                    </div>
                    <div className="home-preview__chips">
                      <span className="home-preview__chip">TCFD</span>
                      <span className="home-preview__chip">GRI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="home-stats" aria-label="Platform metrics">
        <Container>
          <dl className="home-stats__list">
            {STATS.map((stat) => (
              <div key={stat.label} className="home-stats__item">
                <dt className="home-stats__value">{stat.value}</dt>
                <dd className="home-stats__label">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* How it works */}
      <section className="home-section" aria-labelledby="how-heading">
        <Container>
          <SectionHeader
            eyebrow="Workflow"
            title="Three steps to a complete disclosure"
            description="A guided process designed for sustainability teams, finance, and compliance — not generic form builders."
          />
          <ol className="home-steps">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step} className="home-steps__item">
                <span className="home-steps__number" aria-hidden="true">{item.step}</span>
                <h3 className="home-steps__title">{item.title}</h3>
                <p className="home-steps__description">{item.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Services */}
      {/* <section className="home-section home-section--muted" aria-labelledby="services-heading">
        <Container>
          <SectionHeader
            eyebrow="Capabilities"
            title="Everything your reporting cycle needs"
            description="Modular tools that share a single data layer — start with one framework and expand as requirements grow."
          />
          {SERVICE_CATEGORIES.map((category) => {
            const categoryServices = services.filter((s) => s.category === category.id);
            if (categoryServices.length === 0) return null;

            return (
              <div key={category.id} className="home-services-group">
                <div className="home-services-group__header">
                  <h3 id="services-heading" className="home-services-group__title">{category.label}</h3>
                  <p className="home-services-group__description">{category.description}</p>
                </div>
                <ul className="home-services-grid">
                  {categoryServices.map((service) => (
                    <li key={service.id}>
                      <Link to={service.path} className="home-service-card">
                        <span className="home-service-card__icon">
                          <ServiceIcon name={service.icon} />
                        </span>
                        <span className="home-service-card__content">
                          <span className="home-service-card__title">{service.title}</span>
                          <span className="home-service-card__description">{service.description}</span>
                        </span>
                        <span className="home-service-card__arrow" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Container>
      </section> */}

      {/* CTA */}
      {/* <section className="home-cta" aria-labelledby="cta-heading">
        <Container>
          <div className="home-cta__inner">
            <div className="home-cta__content">
              <h2 id="cta-heading" className="home-cta__title">Ready to streamline your next reporting cycle?</h2>
              <p className="home-cta__description">
                Start building a report now, or talk to our team about enterprise deployment and custom frameworks.
              </p>
            </div>
            <div className="home-cta__actions">
              <Button as={Link} to="/esg-report" variant="primary">
                Start a report
              </Button>
              <Button as={Link} to="/demo" variant="secondary">
                Contact sales
              </Button>
            </div>
          </div>
        </Container>
      </section> */}

      <Modal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        ariaLabelledBy="demo-form-title"
      >
        <DemoForm onClose={() => setShowDemoModal(false)} />
      </Modal>
    </div>
  );
};

export default HomePage;
