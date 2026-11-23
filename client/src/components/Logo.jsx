import React from "react";

/**
 * Worklance Brand Logo Icon - The Piercing Lance (Cobalt Solid Edition)
 * Briefcase sliced diagonally by a solid electric cobalt lance arrow.
 */
export function WorklanceIcon({ className = "h-10 w-10", variant = "light" }) {
  const isLight = variant === "light";
  
  // Colors for light/dark variant
  const bgBadge = isLight ? "#F8FAFC" : "#0F172A";
  const borderBadge = isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.12)";
  const caseColor = isLight ? "#0F172A" : "#FFFFFF";
  const handleColor = isLight ? "#64748B" : "#94A3B8";
  const lanceColor = isLight ? "#2563EB" : "#3B82F6";

  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Worklance Logo"
    >
      {/* Squircle Container */}
      <rect width="100" height="100" rx="24" fill={bgBadge} stroke={borderBadge} strokeWidth="1.5" />

      <g transform="translate(16, 17)">
        {/* Briefcase Handle */}
        <path 
          d="M26 14 C26 8.5 29.5 4.5 34 4.5 C38.5 4.5 42 8.5 42 14" 
          stroke={handleColor} 
          strokeWidth="3.5" 
          strokeLinecap="round"
        />

        {/* Briefcase Top Part (Above cut) */}
        <path 
          d="M11 20 C11 16.5 13.8 14 17.5 14 H50.5 C54.2 14 57 16.5 57 20 V25 L11 41 Z" 
          fill={caseColor}
        />

        {/* Briefcase Bottom Part (Below cut) */}
        <path 
          d="M11 48 L57 32 V48 C57 51.5 54.2 54 50.5 54 H17.5 C13.8 54 11 51.5 11 48 Z" 
          fill={caseColor}
        />

        {/* Piercing Solid Lance Arrow */}
        <line 
          x1="8" 
          y1="52" 
          x2="58" 
          y2="18" 
          stroke={lanceColor} 
          strokeWidth="4.5" 
          strokeLinecap="round"
        />
        <polygon 
          points="66,13 52,17 57,23" 
          fill={lanceColor}
        />
      </g>
    </svg>
  );
}

export default WorklanceIcon;
