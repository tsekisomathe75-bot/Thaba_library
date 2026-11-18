import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from './Field';
import Notice from './Notice';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const found = {};
    if (!membershipId.trim()) found.membershipId = 'Enter your membership ID';
    if (!password) found.password = 'Enter your password';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await login(membershipId, password);
      // go back to the page they were trying to reach, otherwise the dashboard
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setServerError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit} noValidate>
      <p className="kicker">Thaba Library · Members</p>
      <h1>Welcome back.</h1>
      <p className="auth-lead">Log in with your membership ID to see what is on the shelves.</p>

      <Field label="Membership ID" error={errors.membershipId}>
        <input
          value={membershipId}
          onChange={(e) => setMembershipId(e.target.value)}
          autoComplete="username"
          autoFocus
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </Field>

      <Notice kind="error">{serverError}</Notice>
      <button className="btn btn-primary btn-wide" disabled={busy}>
        {busy ? 'Checking…' : 'Log in →'}
      </button>

      <p className="auth-switch">
        New here? <Link to="/register">Create a member account</Link>
      </p>
    </form>
  );
}
