import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link to="/" className="footer-brand">
          <BrandMark className="brandmark brandmark-light" />
          <span>Thaba <em>Library</em></span>
        </Link>
        <span className="footer-copy">© {new Date().getFullYear()} Thaba Library</span>
      </div>
    </footer>
  );
}
