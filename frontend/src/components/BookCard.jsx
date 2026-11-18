import StockTag from './StockTag';
import { LOW_STOCK_LIMIT } from '../utils/constants';

// looks a bit like an old catalogue card
export default function BookCard({ book }) {
  const low = book.quantity < LOW_STOCK_LIMIT;
  return (
    <article className={`card ${low ? 'card-low' : ''}`}>
      <span className="card-genre">{book.genre}</span>
      <h3 className="card-title">{book.title}</h3>
      <p className="card-author">{book.author}</p>
      <div className="card-foot">
        <span className="card-isbn">ISBN {book.isbn}</span>
        <div className="card-count">
          <StockTag quantity={book.quantity} />
          <strong>{book.quantity}</strong>
          <small>{book.quantity === 1 ? 'copy' : 'copies'}</small>
        </div>
      </div>
    </article>
  );
}
