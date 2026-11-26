export function LogoMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="glowdots-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="55%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#f5e11c" />
        </linearGradient>
      </defs>
      {/* Orbital arc */}
      <path
        d="M8.2 22.8C5.2 19.2 5.4 13.6 8.9 9.8C12.7 5.7 19.1 5.4 23.3 9.1"
        stroke="url(#glowdots-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M23.8 9.2C26.8 12.8 26.6 18.4 23.1 22.2C19.3 26.3 12.9 26.6 8.7 22.9"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="2 4"
        opacity="0.45"
      />
      {/* Luminous core + satellite particle dots */}
      <circle cx="16" cy="16" r="4.2" fill="url(#glowdots-grad)" />
      <circle cx="16" cy="16" r="1.8" fill="#ffffff" />
      <circle cx="24.5" cy="9.5" r="2.2" fill="#67e8f9" />
      <circle cx="7.5" cy="22.5" r="1.8" fill="#f5e11c" />
      <circle cx="22.5" cy="23.5" r="1.2" fill="#ffffff" opacity="0.7" />
    </svg>
  )
}
