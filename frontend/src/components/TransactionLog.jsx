import { useState } from 'react';
import { formatDate } from '../utils/format';

const labels = { borrow: 'Borrowed', return: 'Returned', restock: 'Stock added' };

function LogRow({ t, showUser, canEdit, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ type: t.type, quantity: String(t.quantity), note: t.note || '' });
  const [error, setError] = useState('');

  const columns = 5 + (showUser ? 1 : 0) + (canEdit ? 1 : 0);

  const startEdit = () => {
    setDraft({ type: t.type, quantity: String(t.quantity), note: t.note || '' });
    setError('');
    setEditing(true);
  };

  const handleChange = (e) => {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const save = async () => {
    const qty = Number(draft.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      setError('Quantity must be a whole number, 1 or more');
      return;
    }
    try {
      await onUpdate(t.id, { type: draft.type, quantity: qty, note: draft.note });
      setEditing(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <tr>
        <td data-label="When">{formatDate(t.created_at)}</td>
        <td data-label="Book"><strong>{t.book_title}</strong></td>

        {editing ? (
          <>
            <td data-label="What">
              <select name="type" value={draft.type} onChange={handleChange}>
                <option value="borrow">Borrowed</option>
                <option value="return">Returned</option>
                <option value="restock">Stock added</option>
              </select>
            </td>
            <td data-label="Qty">
              <input name="quantity" type="number" min="1" value={draft.quantity} onChange={handleChange} />
            </td>
          </>
        ) : (
          <>
            <td data-label="What"><span className={`kind kind-${t.type}`}>{labels[t.type]}</span></td>
            <td data-label="Qty" className="mono">{t.type === 'borrow' ? '−' : '+'}{t.quantity}</td>
          </>
        )}

        {showUser && (
          <td data-label="Member">{t.user_name ? `${t.user_name} (${t.membership_id})` : '—'}</td>
        )}

        <td data-label="Note">
          {editing ? <input name="note" value={draft.note} onChange={handleChange} maxLength={200} /> : t.note || ''}
        </td>

        {canEdit && (
          <td className="actions">
            {editing ? (
              <>
                <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline btn-sm" onClick={startEdit}>Update</button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(t)}>Delete</button>
              </>
            )}
          </td>
        )}
      </tr>
      {error && (
        <tr className="row-error">
          <td colSpan={columns}>{error}</td>
        </tr>
      )}
    </>
  );
}

export default function TransactionLog({ rows, showUser, canEdit, onUpdate, onDelete }) {
  if (rows.length === 0) return <p className="empty">Nothing recorded yet.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>When</th>
            <th>Book</th>
            <th>What</th>
            <th>Qty</th>
            {showUser && <th>Member</th>}
            <th>Note</th>
            {canEdit && <th></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <LogRow
              key={t.id}
              t={t}
              showUser={showUser}
              canEdit={canEdit}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
