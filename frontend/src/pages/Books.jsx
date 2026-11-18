import useApi from '../hooks/useApi';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import BookForm from '../components/BookForm';
import BookList from '../components/BookList';
import Notice from '../components/Notice';

export default function Books() {
  const { isAdmin } = useAuth();
  const { data: books, loading, error, reload } = useApi('/books');

  const addBook = async (values) => {
    await api('/books', { method: 'POST', body: values });
    reload();
  };

  const updateBook = async (id, values) => {
    await api(`/books/${id}`, { method: 'PUT', body: values });
    reload();
  };

  const deleteBook = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? Its transaction history goes with it.`)) return;
    try {
      await api(`/books/${book.id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <p className="kicker">Thaba Library · Management</p>
        <h1>Book management</h1>
        <p>{isAdmin ? 'Add, correct or remove titles.' : 'The full catalogue. Only admins can change it.'}</p>
      </div>

      {isAdmin && <BookForm onSubmit={addBook} />}

      <Notice kind="error">{error}</Notice>
      {loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <BookList books={books} canEdit={isAdmin} onUpdate={updateBook} onDelete={deleteBook} />
      )}
    </>
  );
}
