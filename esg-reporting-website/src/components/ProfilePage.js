import React, { useEffect, useMemo, useState } from 'react';
import { changePassword, getAuthSession, updateProfile } from '../utils/auth';
import { fetchUserProfile, toProfile } from '../data/supabaseBackend';
import './ProfilePage.css';

const FIELDS = {
  organization: [['legalName', 'Organization name *'], ['website', 'Website *'], ['phone', 'Phone number'], ['registeredAddress', 'Registered address *'], ['operationalAddress', 'Operational address'], ['country', 'Country *'], ['state', 'State *'], ['postalCode', 'Postal code *'], ['yearEstablished', 'Year established *'], ['registrationNumber', 'CIN / registration number *'], ['gstNumber', 'GST number *'], ['pan', 'PAN *'], ['industry', 'Industry *'], ['employeeCount', 'Number of employees'], ['annualRevenue *', 'Annual revenue *'], ['listingStatus *', 'Listed / unlisted *'], ['stockExchange', 'Stock exchange']],
};

const FieldGrid = ({ fields, profile, update }) => (
  <div className="profile-grid">
    {fields.map(([key, label]) => (
      <label key={key}>{label}<input value={profile[key] || ''} onChange={(event) => update(key, event.target.value)} /></label>
    ))}
  </div>
);

const PasswordField = ({ label, name, value, onChange }) => (
  <label>{label}<input type="password" name={name} value={value} onChange={onChange} autoComplete="new-password" /></label>
);

const ProfilePage = () => {
  const session = getAuthSession();
  const [profile, setProfile] = useState(() => ({
    displayName: session?.displayName || '',
    email: session?.email || '',
    company: session?.company || '',
    role: session?.role || 'ESG Reporting Member',
    esgFrameworks: [],
    team: [],
    contacts: {},
    certifications: [],
    policies: [],
    documents: [],
    ...session?.profile,
  }));
  const [active, setActive] = useState('Organization');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', nextPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const user = await fetchUserProfile(session);
        if (mounted && user) setProfile((current) => ({ ...current, ...toProfile(user) }));
      } catch (error) {
        if (mounted) setLoadError('Unable to load the latest profile from Supabase.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [session?.id, session?.email]);

  const update = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const completion = useMemo(() => Math.round(
    FIELDS.organization.filter(([key]) => String(profile[key] || '').trim()).length / FIELDS.organization.length * 100
  ), [profile]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setLoadError('');
    try {
      await updateProfile({ displayName: profile.displayName, company: profile.legalName || profile.company, role: profile.role, profile });
      setSaved(true);
    } catch (error) {
      setLoadError(error.message || 'Unable to save your profile to Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const updatePasswordField = (event) => {
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setPasswordStatus('');
    setPasswordError('');
  };

  const savePassword = async () => {
    setPasswordStatus('');
    setPasswordError('');
    if (!passwordForm.currentPassword) return setPasswordError('Enter your current password.');
    if (passwordForm.nextPassword.length < 8) return setPasswordError('Use a new password with at least 8 characters.');
    if (passwordForm.nextPassword !== passwordForm.confirmPassword) return setPasswordError('New passwords do not match.');
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.nextPassword);
      setPasswordForm({ currentPassword: '', nextPassword: '', confirmPassword: '' });
      setPasswordStatus('Password changed successfully.');
    } catch (error) {
      setPasswordError(error.message || 'Unable to change password.');
    }
  };

  const navItems = ['Organization', 'Settings & security'];

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div>
          <span>ORGANIZATION COMMAND CENTER</span>
          <h1 style={{ color: 'white' }}>{profile.legalName || profile.company || 'Your organization'}</h1>
          <p>{session?.email} - {profile.role}</p>
        </div>
        <div className="profile-score"><strong>{completion}%</strong><span>profile complete</span></div>
      </section>

      <div className="profile-layout">
        <aside className="profile-nav">
          {navItems.map((item) => <button type="button" className={active === item ? 'active' : ''} onClick={() => setActive(item)} key={item}>{item}</button>)}
        </aside>
        <form className="profile-content" onSubmit={save}>
          {loadError ? <p className="profile-error">{loadError}</p> : null}
          {loading ? <p className="profile-note">Loading profile...</p> : null}

          {active === 'Organization' && (
            <>
              <h2>Organization profile</h2>
              <p>Core data automatically available to questionnaires, reports and benchmarking.</p>
              <label className="profile-wide">Company description<textarea maxLength="2500" value={profile.companyDescription || ''} onChange={(event) => update('companyDescription', event.target.value)} /></label>
              <FieldGrid fields={[['displayName', 'Your name *'], ...FIELDS.organization]} profile={profile} update={update} />
            </>
          )}

          {active === 'Settings & security' && (
            <>
              <h2>Settings & security</h2>
              <p>Manage account access for {session?.email}.</p>
              <h3>Change password</h3>
              <div className="profile-grid profile-password-grid">
                <PasswordField label="Current password" name="currentPassword" value={passwordForm.currentPassword} onChange={updatePasswordField} />
                <PasswordField label="New password" name="nextPassword" value={passwordForm.nextPassword} onChange={updatePasswordField} />
                <PasswordField label="Confirm new password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={updatePasswordField} />
              </div>
              {passwordStatus ? <p className="profile-success">{passwordStatus}</p> : null}
              {passwordError ? <p className="profile-error">{passwordError}</p> : null}
              <button type="button" className="profile-secondary-action" onClick={savePassword}>Update password</button>
            </>
          )}

          <div className="profile-actions">
            {saved && <span>Changes saved.</span>}
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ProfilePage;
