import React, { useState } from 'react';
import { Link, Redirect, useHistory, useLocation } from 'react-router-dom';
import { isAuthenticated, login } from '../utils/auth';
import './LoginPage.css';

const LoginPage = () => {
  const history = useHistory();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = (location.state && location.state.from) || '/esg-report';

  if (isAuthenticated()) {
    return <Redirect to={redirectTo} />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const session = await login(credentials.username.trim(), credentials.password);
      if (!session) { setError('Invalid email or password.'); return; }
      history.replace(redirectTo);
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <span className="login-kicker">Secure reporting workspace</span>
        <h1>Sign in to generate reports</h1>
        <p>Report generation and final report pages are available after login.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={credentials.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          {error ? <div className="login-error" role="alert">{error}</div> : null}
          <button type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Login'}</button>
        </form>
        <p className="login-switch">New to Sustanica? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
};

export default LoginPage;
