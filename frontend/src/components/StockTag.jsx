import { LOW_STOCK_LIMIT } from '../utils/constants';

// rubber-stamp style label that goes next to the copy count
export default function StockTag({ quantity }) {
  if (quantity === 0) return <span className="stamp stamp-out">Out</span>;
  if (quantity < LOW_STOCK_LIMIT) return <span className="stamp stamp-low">Low</span>;
  return null;
}
