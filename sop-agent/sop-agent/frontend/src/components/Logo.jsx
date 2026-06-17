export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="logoGradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8A78FF" />
          <stop offset="1" stopColor="#5A47E8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#logoGradient)" />
      <path
        d="M13 12.5C13 11.6716 13.6716 11 14.5 11H21.5L27 16.5V27.5C27 28.3284 26.3284 29 25.5 29H14.5C13.6716 29 13 28.3284 13 27.5V12.5Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path d="M21.5 11V16.5H27" stroke="#5A47E8" strokeWidth="1.4" strokeLinejoin="round" />
      <path
        d="M16 19.5H23.5M16 22.5H23.5M16 25.5H20"
        stroke="#5A47E8"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
