import React from 'react';
import { Link } from 'react-router-dom';
import { services, SERVICE_CATEGORIES } from '../data/services';
import Container from './ui/Container';
import SectionHeader from './ui/SectionHeader';
import ServiceIcon from './ui/ServiceIcon';
import './Services.css';

const Services = () => (
  <div className="services-page">
    <header className="ds-page-header">
      <Container>
        <h1 className="ds-page-header__title">Services</h1>
        <p className="ds-page-header__description">
          End-to-end sustainability tools for measurement, disclosure, and compliance — built around
          the frameworks your stakeholders expect.
        </p>
      </Container>
    </header>

    <div className="services-page__body">
      <Container>
        {SERVICE_CATEGORIES.map((category) => {
          const categoryServices = services.filter((s) => s.category === category.id);
          if (categoryServices.length === 0) return null;

          return (
            <section key={category.id} className="services-category" aria-labelledby={`cat-${category.id}`}>
              <SectionHeader
                eyebrow={category.label}
                title={category.description}
              />
              <ul className="services-list">
                {categoryServices.map((service) => (
                  <li key={service.id}>
                    <Link to={service.path} className="services-list__item">
                      <span className="services-list__icon">
                        <ServiceIcon name={service.icon} />
                      </span>
                      <span className="services-list__content">
                        <span className="services-list__title">{service.title}</span>
                        <span className="services-list__description">{service.description}</span>
                      </span>
                      <span className="services-list__arrow" aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </Container>
    </div>
  </div>
);

export default Services;
