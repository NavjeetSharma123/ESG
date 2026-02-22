import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './DemoForm.css';

const DemoForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
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
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Demo request submitted:', formData);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      companyName: '',
      industry: '',
      companySize: '',
      website: '',
      country: '',
      city: '',
      servicesInterest: [],
      timeline: '',
      budget: '',
      message: '',
    });
    if (onClose) onClose();
  };

  const serviceOptions = [
    'ESG Report Generation',
    'Carbon Accounting',
    'Financial Reporting',
    'Supply Chain Sustainability',
    'Green Assessment',
    'Social ESG Reporting',
    'Sustainability Scoring',
    'Emissions Reduction',
    'Compliance Reports',
  ];

  return (
    <div className="demo-form">
      <h2>Request a Demo</h2>
      <p className="demo-form-intro">
        Tell us about yourself and we&apos;ll show you how we can help your business become more sustainable.
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
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              placeholder="https://"
              value={formData.website}
              onChange={handleChange}
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
                <option value="Under 10k">Under $10k</option>
                <option value="10k-50k">$10k - $50k</option>
                <option value="50k-100k">$50k - $100k</option>
                <option value="100k+">$100k+</option>
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
          <button type="submit" className="btn btn-primary">
            Submit Request
          </button>
          {onClose ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
          ) : (
            <Link to="/" className="btn btn-outline">
              Back to Home
            </Link>
          )}
        </div>
      </form>
    </div>
  );
};

export default DemoForm;
