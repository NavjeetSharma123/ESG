import React, { useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { isAuthenticated, login, register } from '../utils/auth';
import './LoginPage.css';

const emailJsConfigured = () => Boolean(process.env.REACT_APP_EMAILJS_SERVICE_ID && process.env.REACT_APP_EMAILJS_TEMPLATE_ID && process.env.REACT_APP_EMAILJS_PUBLIC_KEY);

const sendOtp = async (email, code) => {
  if (!emailJsConfigured()) throw new Error('Email verification is not configured. Add the EmailJS environment variables and restart the app.');
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.REACT_APP_EMAILJS_SERVICE_ID,
      template_id: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      user_id: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
      template_params: { to_email: email, otp_code: code },
    }),
  });
  if (!response.ok) throw new Error('We could not send the verification email. Please try again.');
};

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
  const [otp, setOtp] = useState('');
  const [issuedOtp, setIssuedOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (isAuthenticated()) return <Redirect to="/profile" />;

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setSending(true);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    try {
      await sendOtp(form.email, code);
      setIssuedOtp(code);
      setMessage(`A six-digit verification code was sent to ${form.email}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const verify = (event) => {
    event.preventDefault();
    if (otp !== issuedOtp) return setError('That verification code is incorrect.');
    try {
      const timestamp = new Date().toISOString();
      const user = register({
        ...form,
        company: form.organization_name,
        displayName: `${form.first_name} ${form.last_name}`.trim(),
        password_hash: form.password,
        email_verified: true,
        organization_verified: false,
        verification_token: null,
        verification_token_expiry: null,
        role: 'organization_admin',
        report_generation_count: 0,
        created_at: timestamp,
        updated_at: timestamp,
      });
      login(user.email, form.password);
      history.replace('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return <main className="login-page"><section className="login-panel register-panel"><span className="login-kicker">Create your workspace</span><h1>Register</h1><p>Provide your organisation and account details, then verify your work email.</p><form className="login-form" onSubmit={issuedOtp ? verify : requestOtp}>{!issuedOtp ? <>
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
  </> : <><label htmlFor="otp">Email verification code</label><input id="otp" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="6-digit code" required /><button type="button" className="login-secondary" onClick={() => setIssuedOtp('')}>Use a different email</button></>}
    {message ? <div className="login-success" role="status">{message}</div> : null}{error ? <div className="login-error" role="alert">{error}</div> : null}<button type="submit" disabled={sending}>{sending ? 'Sending code...' : issuedOtp ? 'Verify and create account' : 'Send verification code'}</button>
  </form><p className="login-switch">Already registered? <Link to="/login">Sign in</Link></p></section></main>;
};

export default RegisterPage;
