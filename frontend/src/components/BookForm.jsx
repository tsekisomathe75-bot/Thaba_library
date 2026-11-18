import { useState } from 'react';
import Field from './Field';
import Notice from './Notice';
import { validateBook } from '../utils/validators';

const emptyBook = { title: '', author: '', genre: '', isbn: '', quantity: '' };

export default function BookForm({ onSubmit }) {
  const [values, setValues] = useState(emptyBook);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const found = validateBook(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await onSubmit({ ...values, quantity: Number(values.quantity) });
      setValues(emptyBook);
      setMessage({ kind: 'ok', text: 'Book added to the catalogue.' });
    } catch (err) {
      setMessage({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
      <h2 className="panel-title">Add a new book</h2>

      <Field label="Title" error={errors.title}>
        <input name="title" value={values.title} onChange={handleChange} />
      </Field>
      <Field label="Author" error={errors.author}>
        <input name="author" value={values.author} onChange={handleChange} />
      </Field>
      <Field label="Genre" error={errors.genre}>
        <input name="genre" value={values.genre} onChange={handleChange} placeholder="e.g. Fiction" />
      </Field>
      <Field label="ISBN" error={errors.isbn} hint="10 or 13 digits, dashes allowed">
        <input name="isbn" value={values.isbn} onChange={handleChange} />
      </Field>
      <Field label="Initial quantity" error={errors.quantity}>
        <input name="quantity" type="number" min="0" value={values.quantity} onChange={handleChange} />
      </Field>

      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Add book'}
        </button>
      </div>
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
    </form>
  );
}
