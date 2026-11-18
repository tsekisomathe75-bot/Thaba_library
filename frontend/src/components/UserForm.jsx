import { useEffect, useState } from 'react';
import Field from './Field';
import Notice from './Notice';
import { validateUser } from '../utils/validators';

const blank = { name: '', membershipId: '', role: 'member', password: '' };

// one form for both adding and editing - `editing` is the user being edited (or null)
export default function UserForm({ editing, onSubmit, onCancel }) {
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const isNew = !editing;

  useEffect(() => {
    if (editing) {
      setValues({
        name: editing.name,
        membershipId: editing.membership_id,
        role: editing.role,
        password: '',
      });
    } else {
      setValues(blank);
    }
    setErrors({});
    setMessage(null);
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const found = validateUser(values, { isNew });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await onSubmit(values);
      if (isNew) {
        setValues(blank);
        setMessage({ kind: 'ok', text: 'User added.' });
      }
    } catch (err) {
      setMessage({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
      <h2 className="panel-title">{isNew ? 'Add a user' : `Update ${editing.name}`}</h2>

      <Field label="Full name" error={errors.name}>
        <input name="name" value={values.name} onChange={handleChange} />
      </Field>
      <Field label="Membership ID" error={errors.membershipId} hint="Member1, Member2 … or Admin1, Admin2 …">
        <input name="membershipId" value={values.membershipId} onChange={handleChange} />
      </Field>
      <Field label="Role">
        <select name="role" value={values.role} onChange={handleChange}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      <Field
        label={isNew ? 'Password' : 'New password'}
        error={errors.password}
        hint={isNew ? 'Exactly 5 digits' : 'Exactly 5 digits. Leave blank to keep the current one'}
      >
        <input name="password" type="password" inputMode="numeric" maxLength={5} value={values.password} onChange={handleChange} autoComplete="new-password" />
      </Field>

      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : isNew ? 'Add user' : 'Save changes'}
        </button>
        {!isNew && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        )}
      </div>
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
    </form>
  );
}
