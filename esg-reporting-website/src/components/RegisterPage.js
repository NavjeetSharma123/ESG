import React, { useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { isAuthenticated, login, register } from '../utils/auth';
import './LoginPage.css';

const initialForm = {
  organization_name: '', industry: '', sector: '', company_type: '', website: '',
  registration_number: '', gst_number: '', cin_number: '', country: '', state: '', city: '',
  employee_count: '', annual_revenue: '', first_name: '', last_name: '', designation: '',
  email: '', password: '', confirmPassword: '',
};

const Field = ({ label, name, value, onChange, type = 'text', required = false, ...props }) => (
  <div className="register-field">
    <label htmlFor={name}>{label}{required ? ' *' : ''}</label>
    <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} {...props} />
  </div>
);

const RegisterPage = () => {
  const history = useHistory();
  const [form, setForm] = useState(initialForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (isAuthenticated()) return <Redirect to="/profile" />;

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleTermsChange = (event) => {
    setAcceptedTerms(event.target.checked);
    setError('');
    if (event.target.checked) setShowTerms(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!acceptedTerms) return setError('Please accept the Terms and Conditions to register.');
    setSending(true);
    try {
      const timestamp = new Date().toISOString();
      const user = await register({
        ...form,
        organization_name: form.organization_name,
        first_name: form.first_name,
        password_hash: form.password,
        email_verified: false,
        organization_verified: false,
        verification_token: null,
        verification_token_expiry: null,
        role: 'organization_admin',
        report_generation_count: 0,
        created_at: timestamp,
        updated_at: timestamp,
      });
      await login(user.email, form.password);
      history.replace('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return <main className="login-page"><section className="login-panel register-panel"><span className="login-kicker">Create your workspace</span><h1>Register</h1><p>Provide your organisation and account details to create your workspace.</p><form className="login-form" onSubmit={handleSubmit}>
    <fieldset className="register-section"><legend>Organisation details</legend><div className="register-grid">
      <Field label="Organisation name" name="organization_name" value={form.organization_name} onChange={change} required />
      <Field label="Industry" name="industry" value={form.industry} onChange={change} required />
      <Field label="Sector" name="sector" value={form.sector} onChange={change} required />
      <Field label="Company type" name="company_type" value={form.company_type} onChange={change} required />
      <Field label="Website" name="website" type="url" value={form.website} onChange={change} placeholder="https://example.com" />
      <Field label="Registration number" name="registration_number" value={form.registration_number} onChange={change} />
      <Field label="GST number" name="gst_number" value={form.gst_number} onChange={change} />
      <Field label="CIN number" name="cin_number" value={form.cin_number} onChange={change} />
      <Field label="Employee count" name="employee_count" type="number" min="0" value={form.employee_count} onChange={change} />
      <Field label="Annual revenue" name="annual_revenue" type="number" min="0" value={form.annual_revenue} onChange={change} />
    </div></fieldset>
    <fieldset className="register-section"><legend>Location</legend><div className="register-grid">
      <Field label="Country" name="country" value={form.country} onChange={change} required />
      <Field label="State" name="state" value={form.state} onChange={change} required />
      <Field label="City" name="city" value={form.city} onChange={change} required />
    </div></fieldset>
    <fieldset className="register-section"><legend>Account contact</legend><div className="register-grid">
      <Field label="First name" name="first_name" value={form.first_name} onChange={change} required />
      <Field label="Last name" name="last_name" value={form.last_name} onChange={change} required />
      <Field label="Designation" name="designation" value={form.designation} onChange={change} required />
      <Field label="Work email" name="email" type="email" value={form.email} onChange={change} required />
      <Field label="Password" name="password" type="password" value={form.password} onChange={change} minLength="8" required />
      <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={change} required />
    </div></fieldset>
    <label className="terms-checkbox" htmlFor="tnc">
      <input type="checkbox" id="tnc" name="tnc" checked={acceptedTerms} onChange={handleTermsChange} required />
      <span>I agree to the <button type="button" className="terms-link" onClick={() => setShowTerms(true)}>Terms and Conditions</button>.</span>
    </label>
    {message ? <div className="login-success" role="status">{message}</div> : null}{error ? <div className="login-error" role="alert">{error}</div> : null}<button type="submit" disabled={sending}>{sending ? 'Registering...' : 'Register'}</button>
  </form>
  <p className="login-switch">Already registered? <Link to="/login">Sign in</Link></p></section>

  {showTerms ? <div className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
    <div className="terms-modal__content">
      <button type="button" className="terms-modal__close" aria-label="Close Terms and Conditions" onClick={() => setShowTerms(false)}>×</button>
      <h2 id="terms-title">Terms and Conditions</h2>
      <div className="terms-modal__body">
        <p><strong>Template placeholder:</strong> Add your Terms and Conditions text here.</p>
        <p>Use this section for eligibility, account responsibilities, acceptable use, subscriptions or fees, data usage, privacy references, limitations of liability, termination, governing law, and contact details.</p>
      </div>
      <button type="button" className="terms-modal__accept" onClick={() => { setAcceptedTerms(true); setShowTerms(false); }}>I Agree</button>
    </div>
  </div> : null}
  
  </main>;
  
};

export default RegisterPage;
