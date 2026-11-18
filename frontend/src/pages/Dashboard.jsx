import { useMemo, useState } from 'react';
import useApi from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import Notice from '../components/Notice';
import { LOW_STOCK_LIMIT } from '../utils/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: books, loading, error } = useApi('/books');

  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('all');
  const [lowOnly, setLowOnly] = useState(false);

  const genres = useMemo(() => [...new Set(books.map((b) => b.genre))].sort(), [books]);

  const totalCopies = books.reduce((sum, b) => sum + b.quantity, 0);
  const lowCount = books.filter((b) => b.quantity > 0 && b.quantity < LOW_STOCK_LIMIT).length;
  const outCount = books.filter((b) => b.quantity === 0).length;

  const shown = books.filter((b) => {
    const text = `${b.title} ${b.author} ${b.isbn}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (genre !== 'all' && b.genre !== genre) return false;
    if (lowOnly && b.quantity >= LOW_STOCK_LIMIT) return false;
    return true;
  });

  return (
    <>
      <div className="page-head">
        <p className="kicker">Thaba Library · Catalogue</p>
        <h1>Good to see you, {user.name.split(' ')[0]}.</h1>
        <p>Here is what is on the shelves right now.</p>
      </div>

      <Notice kind="error">{error}</Notice>

      <section className="ledger">
        <div>
          <strong>{books.length}</strong>
          <span>titles</span>
        </div>
        <div>
          <strong>{totalCopies}</strong>
          <span>copies on shelf</span>
        </div>
        <div className={lowCount ? 'ledger-warn' : ''}>
          <strong>{lowCount}</strong>
          <span>running low</span>
        </div>
        <div className={outCount ? 'ledger-warn' : ''}>
          <strong>{outCount}</strong>
          <span>out of stock</span>
        </div>
      </section>

      <section className="toolbar">
        <input
          type="search"
          placeholder="Search title, author or ISBN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="all">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <label className="check">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Low stock only
        </label>
      </section>

      {loading ? (
        <p className="empty">Fetching the catalogue…</p>
      ) : shown.length === 0 ? (
        <p className="empty">Nothing matches that.</p>
      ) : (
        <section className="card-grid">
          {shown.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </section>
      )}
    </>
  );
}
