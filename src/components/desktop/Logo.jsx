export default function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M20 2 L36 11 L36 29 L20 38 L4 29 L4 11 Z"
        fill="url(#logoGradient)"
      />
      <path
        d="M15 26 C15 26 15 14 24 14 C29 14 29 19 24 19 C19 19 19 24 24 24 C29 24 29 26 26 26"
        fill="none"
        stroke="#0a0a12"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}