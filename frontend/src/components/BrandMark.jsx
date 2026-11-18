// open-book logo, drawn the same way as the coffee shop's cup mark
export default function BrandMark({ className = 'brandmark' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" role="img" aria-label="Thaba Library logo">
      <path
        d="M32 18c-5-4-13-5-21-4v32c8-1 16 0 21 4 5-4 13-5 21-4V14c-8-1-16 0-21 4Z"
        stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"
      />
      <path d="M32 18v32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M17 24c4 0 8 .5 11 2M17 31c4 0 8 .5 11 2M36 26c3-1.5 7-2 11-2M36 33c3-1.5 7-2 11-2"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".6"
      />
      <path d="M20 57h24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
