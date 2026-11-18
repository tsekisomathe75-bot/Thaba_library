import { useState } from 'react';
import StockTag from './StockTag';
import { validateBook } from '../utils/validators';
import { LOW_STOCK_LIMIT } from '../utils/constants';

function BookRow({ book, canEdit, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(book);
  const [error, setError] = useState('');

  const startEdit = () => {
    setDraft(book);
    setError('');
    setEditing(true);
  };

  const handleChange = (e) => {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const save = async () => {
    const found = validateBook({ ...draft, quantity: String(draft.quantity) });
    const firstProblem = Object.values(found)[0];
    if (firstProblem) {
      setError(firstProblem);
      return;
    }
    try {
      await onUpdate(book.id, { ...draft, quantity: Number(draft.quantity) });
      setEditing(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const low = book.quantity < LOW_STOCK_LIMIT;

  return (
    <>
      <tr className={low && !editing ? 'row-low' : ''}>
        {editing ? (
          <>
            <td data-label="Title"><input name="title" value={draft.title} onChange={handleChange} /></td>
            <td data-label="Author"><input name="author" value={draft.author} onChange={handleChange} /></td>
            <td data-label="Genre"><input name="genre" value={draft.genre} onChange={handleChange} /></td>
            <td data-label="ISBN"><input name="isbn" value={draft.isbn} onChange={handleChange} /></td>
            <td data-label="In stock">
              <input name="quantity" type="number" min="0" value={draft.quantity} onChange={handleChange} />
            </td>
            <td className="actions">
              <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </td>
          </>
        ) : (
          <>
            <td data-label="Title"><strong>{book.title}</strong></td>
            <td data-label="Author">{book.author}</td>
            <td data-label="Genre">{book.genre}</td>
            <td data-label="ISBN" className="mono">{book.isbn}</td>
            <td data-label="In stock">
              <span className="qty">{book.quantity}</span> <StockTag quantity={book.quantity} />
            </td>
            {canEdit && (
              <td className="actions">
                <button className="btn btn-outline btn-sm" onClick={startEdit}>Update</button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(book)}>Delete</button>
              </td>
            )}
          </>
        )}
      </tr>
      {error && (
        <tr className="row-error">
          <td colSpan={6}>{error}</td>
        </tr>
      )}
    </>
  );
}

export default function BookList({ books, canEdit, onUpdate, onDelete }) {
  if (books.length === 0) {
    return <p className="empty">No books in the catalogue yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>In stock</th>
            {canEdit && <th></th>}
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <BookRow key={book.id} book={book} canEdit={canEdit} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
