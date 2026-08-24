export default function PageHead({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="adm-head">
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children && <div className="adm-head-actions">{children}</div>}
    </div>
  );
}
