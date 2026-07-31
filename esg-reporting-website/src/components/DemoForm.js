import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Container from './ui/Container';
import './DemoForm.css';

const initialFormData = {
  // Contact
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  // Company
  companyName: '',
  industry: '',
  companySize: '',
  website: '',
  country: '',
  city: '',
  // Needs
  servicesInterest: [],
  timeline: '',
  budget: '',
  message: '',
};

const DemoForm = ({ onClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = e.target.checked;
      setFormData((prev) => ({
        ...prev,
        servicesInterest: checked
          ? [...prev.servicesInterest, value]
          : prev.servicesInterest.filter((s) => s !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('');
    setSubmitError('');

    const serviceId = "service_pofp90h";
    const templateId = "template_ihtrnwl";
    const publicKey = "nSw5wd8uGop5jK6NI";

    if (!serviceId || !templateId || !publicKey) {
      setSubmitError('Email service is not configured. Please try again later.');
      return;
    }

    const templateParams = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      servicesInterest: formData.servicesInterest.join(', '),
    };

    setIsSubmitting(true);

    try {
      await emailjs.send(serviceId, templateId, templateParams, {
        publicKey,
      });
      setSubmitStatus('Thanks. Your demo request has been sent.');
      setFormData(initialFormData);
      if (onClose) onClose();
    } catch (error) {
      console.error('Demo request email failed:', error);
      setSubmitError('We could not send your request right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceOptions = [
    'ESG Report Generation [GRI, SASB, BRSR, UNGC]',
    'Carbon Accounting[TCFD, GRI, BRSR]',
    'Financial Reporting[TCFD, SASB, GRI]',
    'Supply Chain Sustainability[GRI, UNGC, BRSR]',
    'Green Assessment[GRI, TCFD]',
    'Social ESG Reporting[GRI, UNGC, BRSR]',
    'Sustainability Scoring[GRI, SASB]',
    'Emissions Reduction[TCFD, GRI, BRSR]',
    'Compliance Reports[BRSR, GRI, TCFD]'
  ];

  const formContent = (
    <>
      <h2 id="demo-form-title" className="demo-form__title">Request a demo</h2>
      <p className="demo-form__intro">
        Tell us about your organization and reporting requirements. We&apos;ll follow up within one business day.
      </p>
      <form onSubmit={handleSubmit}>
        <section className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              pattern="^(?!.*@(gmail|yahoo|hotmail|outlook|live|msn|icloud|aol|protonmail|zoho|gmx|mail)\.).+$"
              title="Please enter your official work email address."
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="jobTitle">Job Title *</label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3>Company Information</h3>
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="industry">Industry *</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Energy">Energy</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Transportation">Transportation</option>
                <option value="Construction">Construction</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="companySize">Company Size *</label>
              <select
                id="companySize"
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                required
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="website">Website *</label>
            <input
              type="url"
              id="website"
              name="website"
              placeholder="https://"
              value={formData.website}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3>Your Needs</h3>
          <div className="form-group">
            <label>Services of Interest</label>
            <div className="checkbox-group">
              {serviceOptions.map((service) => (
                <label key={service} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="servicesInterest"
                    value={service}
                    checked={formData.servicesInterest.includes(service)}
                    onChange={handleChange}
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="timeline">Timeline</label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
              >
                <option value="">Select timeline</option>
                <option value="ASAP">ASAP</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="Exploring">Just exploring</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="budget">Budget Range</label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
              >
                <option value="">Select budget</option>
                <option value="Under 10k">Under INR 10k</option>
                <option value="10k-50k">INR 10k - INR 50k</option>
                <option value="50k-100k">INR 50k - INR 100k</option>
                <option value="100k+">INR 100k+</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="message">Additional Comments</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Tell us more about your sustainability goals..."
              value={formData.message}
              onChange={handleChange}
            />
          </div>
        </section>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Submit request'}
          </Button>
          {onClose ? (
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          ) : (
            <Button as={Link} to="/" variant="secondary">
              Back to home
            </Button>
          )}
        </div>
        {submitStatus ? <p className="demo-form__status" role="status">{submitStatus}</p> : null}
        {submitError ? <p className="demo-form__status demo-form__status--error" role="alert">{submitError}</p> : null}
      </form>
    </>
  );

  if (onClose) {
    return <div className="demo-form demo-form--modal">{formContent}</div>;
  }

  return (
    <div className="demo-form-page">
      <header className="ds-page-header">
        <Container>
          <h1 className="ds-page-header__title">Contact us</h1>
          <p className="ds-page-header__description">
            Schedule a walkthrough of the platform or discuss enterprise requirements.
          </p>
        </Container>
      </header>
      <Container className="demo-form-page__body">
        <div className="demo-form demo-form--page">{formContent}</div>
      </Container>
    </div>
  );
};

export default DemoForm;
