export default function BrandMark() {
  return (
    <span className="sales-brand">
      <svg className="sales-brand-mark" viewBox="0 0 82 76" fill="none" aria-hidden="true">
        <path d="M9 45 25 50v22L9 67V45Z" fill="#d40000" />
        <path d="m25 50 6-4v22l-6 4V50Z" fill="#850000" />
        <path d="m31 33 17 6v34l-17-5V33Z" fill="#e00000" />
        <path d="m48 39 6-4v34l-6 4V39Z" fill="#910000" />
        <path d="m54 17 17 6v39l-17 7V17Z" fill="#ef0000" />
        <path d="m71 23 5-3v37l-5 5V23Z" fill="#9d0000" />
        <path className="sales-brand-arrow" d="M4 38C23 36 40 25 55 9m-10 2 11-4-1 12" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sales-brand-word">SalesInfo<span className="sales-brand-pro">Pro</span></span>
    </span>
  );
}
