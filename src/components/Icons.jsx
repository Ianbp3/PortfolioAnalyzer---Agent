// FolioSense icon set — custom line icons that match the brand
// (Syne/DM Sans, accent #1a6b4a green, gold #c9993a). 24x24, stroke-based.
// Replaces the generic emoji used in the MVP. Use <Icon name="zap" /> anywhere.
import React from "react";

const PATHS = {
  zap: `<path d='M13.5 2.5 5 13.2a.6.6 0 0 0 .47.97H11l-.9 7.06a.4.4 0 0 0 .72.28l8.62-10.78a.6.6 0 0 0-.47-.98H13.4l1.06-6.9a.4.4 0 0 0-.72-.3Z'/>`,
  chatSpark: `<path d='M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15H9l-4 4v-4H6.5'/><path d='M14.2 7.2l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z' fill='currentColor' stroke='none'/>`,
  bars: `<path d='M4 20V10M9.3 20V4M14.7 20V13M20 20V7'/><path d='M3 20h18'/>`,
  tag: `<path d='M3.5 12.4 11 4.9a2 2 0 0 1 1.4-.6l5.1.1a2 2 0 0 1 2 2l.1 5.1a2 2 0 0 1-.6 1.4l-7.5 7.5a1.5 1.5 0 0 1-2.1 0l-5.4-5.4a1.5 1.5 0 0 1 0-2.1Z'/><circle cx='15.5' cy='8.5' r='1.4' fill='currentColor' stroke='none'/>`,
  chatHelp: `<path d='M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15H9l-4 4v-4H6.5'/><circle cx='9' cy='9.5' r='.05'/><circle cx='12' cy='9.5' r='.05'/><circle cx='15' cy='9.5' r='.05'/>`,
  wrench: `<path d='M14.5 6.2a3.8 3.8 0 0 0 4.9 4.9l-2 2a3.8 3.8 0 0 1-4.9-4.9Z'/><path d='m12.5 8.2-7 7a2 2 0 0 0 2.8 2.8l7-7'/>`,
  shieldCheck: `<path d='M12 3 5 5.6v5.2c0 4.3 2.9 7.6 7 9.2 4.1-1.6 7-4.9 7-9.2V5.6L12 3Z'/><path d='m9 11.6 2 2 4-4'/>`,
  link: `<path d='M9.5 14.5a3.5 3.5 0 0 1 0-5l2-2a3.5 3.5 0 0 1 5 5l-1 1'/><path d='M14.5 9.5a3.5 3.5 0 0 1 0 5l-2 2a3.5 3.5 0 0 1-5-5l1-1'/>`,
  book: `<path d='M4 5.5A1.5 1.5 0 0 1 5.5 4H11a1 1 0 0 1 1 1v14a1 1 0 0 0-1-1H5.5A1.5 1.5 0 0 1 4 16.5Z'/><path d='M20 5.5A1.5 1.5 0 0 0 18.5 4H13a1 1 0 0 0-1 1v14a1 1 0 0 1 1-1h5.5a1.5 1.5 0 0 0 1.5-1.5Z'/>`,
  gauge: `<path d='M4 16a8 8 0 1 1 16 0'/><path d='m12 16 4.2-4.6'/><circle cx='12' cy='16' r='1.3' fill='currentColor' stroke='none'/>`,
  search: `<circle cx='10.5' cy='10.5' r='6'/><path d='m15 15 4.5 4.5'/>`,
  docChart: `<path d='M6 3h7l5 5v11.5A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5Z'/><path d='M13 3v5h5'/><path d='M9.5 17v-3M12 17v-5M14.5 17v-2'/>`,
  check: `<circle cx='12' cy='12' r='8'/><path d='m8.5 12 2.4 2.4L15.5 9.5'/>`,
  stack: `<path d='m12 3 8 4-8 4-8-4 8-4Z'/><path d='m4 12 8 4 8-4'/><path d='m4 16.5 8 4 8-4'/>`,
  alert: `<path d='M11 4.2 2.6 18.5a1.2 1.2 0 0 0 1 1.8h16.8a1.2 1.2 0 0 0 1-1.8L13 4.2a1.2 1.2 0 0 0-2 0Z'/><path d='M12 9.5v4.5'/><circle cx='12' cy='17' r='.05'/>`,
  checkLine: `<path d='M5 12.5 10 17.5 19 7'/>`,
  Technology: `<rect x='5' y='5' width='14' height='14' rx='2'/><rect x='9' y='9' width='6' height='6' rx='1' fill='currentColor' stroke='none'/><path d='M9 2.5v2.5M15 2.5v2.5M9 19v2.5M15 19v2.5M2.5 9H5M2.5 15H5M19 9h2.5M19 15h2.5'/>`,
  Financials: `<path d='M4 9 12 4l8 5'/><path d='M5.5 9v8M9.5 9v8M14.5 9v8M18.5 9v8'/><path d='M3.5 20h17'/>`,
  Healthcare: `<rect x='4' y='4' width='16' height='16' rx='3'/><path d='M12 8v8M8 12h8'/>`,
  "Consumer Discretionary": `<path d='M6 8h12l-1 11a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9Z'/><path d='M9 8a3 3 0 0 1 6 0'/>`,
  "Communication Services": `<circle cx='12' cy='13' r='2.2' fill='currentColor' stroke='none'/><path d='M8.2 9.2a5.4 5.4 0 0 0 0 7.6M15.8 9.2a5.4 5.4 0 0 1 0 7.6'/><path d='M5.7 6.7a9 9 0 0 0 0 12.6M18.3 6.7a9 9 0 0 1 0 12.6'/>`,
  Industrials: `<path d='M4 20V11l5 3V11l5 3V8l6 4v8Z'/><path d='M3 20h18'/>`,
  "Consumer Staples": `<path d='m5 8 1.4 9.2a1.5 1.5 0 0 0 1.5 1.3h8.2a1.5 1.5 0 0 0 1.5-1.3L19 8Z'/><path d='M8.5 8a3.5 3.5 0 0 1 7 0'/><path d='M3.5 8h17'/>`,
  Energy: `<path d='M13.5 2.5 5 13.2a.6.6 0 0 0 .47.97H11l-.9 7.06a.4.4 0 0 0 .72.28l8.62-10.78a.6.6 0 0 0-.47-.98H13.4l1.06-6.9a.4.4 0 0 0-.72-.3Z'/>`,
  Materials: `<path d='m12 3 8 4.5v9L12 21l-8-4.5v-9Z'/><path d='M12 3v18M4 7.5l8 4.5 8-4.5'/>`,
  "Real Estate": `<path d='M4 11 12 4l8 7'/><path d='M6 10v9h12v-9'/><path d='M10 19v-5h4v5'/>`,
  Utilities: `<path d='M9 17a5 5 0 1 1 6 0v1.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 18.5Z'/><path d='M10 21.5h4'/>`,
  Other: `<path d='m12 3 8 4v10l-8 4-8-4V7Z'/><path d='m4 7 8 4 8-4M12 11v10'/>`,
};

// Canonical GICS sector keys -> icon name (kept 1:1 so SectorComparison can map directly)
export const SECTOR_ICON_KEYS = [
  "Technology", "Financials", "Healthcare", "Consumer Discretionary",
  "Communication Services", "Industrials", "Consumer Staples", "Energy",
  "Materials", "Real Estate", "Utilities", "Other",
];

export function Icon({ name, size = 24, stroke = 1.75, color = "currentColor", style }) {
  const inner = PATHS[name] || PATHS.Other;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", ...style }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

export default Icon;
