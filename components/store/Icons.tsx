type P = { size?: number; className?: string };

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const HeartIcon = ({ size, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

export const EyeIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const BagIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const CloseIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const SearchIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const FilterIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </svg>
);

export const TrashIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const TruckIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export const ShieldIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const RefreshIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10" />
  </svg>
);

export const CheckIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-label={`Reyting: ${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="star" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
              <path className="star-bg" d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
            </svg>
            <span className="star-fill" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
                <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}
