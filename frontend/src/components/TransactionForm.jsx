import { useState } from 'react';
import Field from './Field';
import Notice from './Notice';
import { validateTransaction } from '../utils/validators';

const start = { bookId: '', type: 'borrow', quantity: '1', userId: '', note: '' };

export default function TransactionForm({ books, users, isAdmin, onSubmit }) {
  const [values, setValues] = useState(start);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const selectedBook = books.find((b) => String(b.id) === String(values.bookId));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const found = validateTransaction(values, selectedBook);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      const res = await onSubmit({
        bookId: Number(values.bookId),
        type: values.type,
        quantity: Number(values.quantity),
        userId: values.userId ? Number(values.userId) : undefined,
        note: values.note,
      });
      setMessage({ kind: 'ok', text: `Done. ${selectedBook.title} now has ${res.newQuantity} in stock.` });
      setValues((prev) => ({ ...start, type: prev.type }));
    } catch (err) {
      setMessage({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
      <h2 className="panel-title">Record a transaction</h2>

      <fieldset className="field type-picker">
        <legend className="field-label">What's happening?</legend>
        <label><input type="radio" name="type" value="borrow" checked={values.type === 'borrow'} onChange={handleChange} /> Borrow (−)</label>
        <label><input type="radio" name="type" value="return" checked={values.type === 'return'} onChange={handleChange} /> Return (+)</label>
        {isAdmin && (
          <label><input type="radio" name="type" value="restock" checked={values.type === 'restock'} onChange={handleChange} /> New stock (+)</label>
        )}
      </fieldset>

      <Field label="Book" error={errors.bookId}>
        <select name="bookId" value={values.bookId} onChange={handleChange}>
          <option value="">Choose a book…</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} ({b.quantity} in stock)
            </option>
          ))}
        </select>
      </Field>

      <Field label="Quantity" error={errors.quantity}>
        <input name="quantity" type="number" min="1" value={values.quantity} onChange={handleChange} />
      </Field>

      {isAdmin && values.type !== 'restock' && (
        <Field label="Member" hint="Leave empty to log it against yourself">
          <select name="userId" value={values.userId} onChange={handleChange}>
            <option value="">— me —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Note (optional)">
        <input name="note" value={values.note} onChange={handleChange} maxLength={200} />
      </Field>

      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Record'}
        </button>
      </div>
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
    </form>
  );
}
