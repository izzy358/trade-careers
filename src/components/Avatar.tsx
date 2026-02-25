type AvatarProps = {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export function Avatar({ name, url, size = 64, className }: AvatarProps) {
  const classes = ['rounded-full border border-border object-cover', className].filter(Boolean).join(' ');
  const placeholderClasses = [
    'inline-flex items-center justify-center rounded-full border border-border bg-surface-hover font-bold text-text-primary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`${name} avatar`}
        width={size}
        height={size}
        className={classes}
      />
    );
  }

  return (
    <div
      className={placeholderClasses}
      style={{ width: size, height: size }}
      aria-label={`${name} avatar placeholder`}
    >
      {initials(name)}
    </div>
  );
}
