import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import Notice from '../components/Notice';
import { validateRegister } from '../utils/validators';

const empty = { name: '', membershipId: '', password: '', confirm: '' };

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await register(values.name, values.membershipId, values.password);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <p className="kicker">Thaba Library · Join</p>
        <h1>Become a member.</h1>
        <p className="auth-lead">Create an account to browse the catalogue and borrow books.</p>

        <Field label="Full name" error={errors.name}>
          <input name="name" value={values.name} onChange={handleChange} autoComplete="name" autoFocus />
        </Field>
        <Field label="Membership ID" error={errors.membershipId} hint="Member followed by a number, e.g. Member3">
          <input
            name="membershipId"
            value={values.membershipId}
            onChange={handleChange}
            placeholder="Member3"
            autoComplete="username"
          />
        </Field>
        <Field label="Password" error={errors.password} hint="Exactly 5 digits">
          <input
            name="password"
            type="password"
            inputMode="numeric"
            maxLength={5}
            value={values.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <input
            name="confirm"
            type="password"
            inputMode="numeric"
            maxLength={5}
            value={values.confirm}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </Field>

        <Notice kind="error">{serverError}</Notice>
        <button className="btn btn-primary btn-wide" disabled={busy}>
          {busy ? 'Creating…' : 'Create account →'}
        </button>

        <p className="auth-switch">
          Already a member? <Link to="/users">Log in</Link>
        </p>
      </form>
    </div>
  );
}
