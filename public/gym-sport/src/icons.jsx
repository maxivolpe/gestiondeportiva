// Lightweight inline icon set. Each component accepts size + className.
const I = ({ size = 16, className = "", children, stroke = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
       className={className}>{children}</svg>
);

const Icon = {
  Dumbbell: (p) => <I {...p}><path d="M6 4v16M4 6v12M18 4v16M20 6v12M2 12h20" /></I>,
  Dashboard: (p) => <I {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></I>,
  Users: (p) => <I {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>,
  Calendar: (p) => <I {...p}><rect x="3" y="4" width="18" height="18" rx="0"/><path d="M16 2v4M8 2v4M3 10h18"/></I>,
  Card: (p) => <I {...p}><rect x="2" y="5" width="20" height="14" rx="0"/><path d="M2 10h20M6 15h4"/></I>,
  Cycle: (p) => <I {...p}><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></I>,
  Check: (p) => <I {...p}><path d="M20 6 9 17l-5-5"/></I>,
  X: (p) => <I {...p}><path d="M18 6 6 18M6 6l12 12"/></I>,
  Plus: (p) => <I {...p}><path d="M12 5v14M5 12h14"/></I>,
  Search: (p) => <I {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></I>,
  ChevronDown: (p) => <I {...p}><path d="m6 9 6 6 6-6"/></I>,
  ChevronRight: (p) => <I {...p}><path d="m9 6 6 6-6 6"/></I>,
  ChevronLeft: (p) => <I {...p}><path d="m15 6-6 6 6 6"/></I>,
  Menu: (p) => <I {...p}><path d="M4 12h16M4 6h16M4 18h16"/></I>,
  Sun: (p) => <I {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></I>,
  Moon: (p) => <I {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></I>,
  Logout: (p) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></I>,
  Bell: (p) => <I {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></I>,
  Clock: (p) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></I>,
  Pin: (p) => <I {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></I>,
  TrendUp: (p) => <I {...p}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></I>,
  TrendDown: (p) => <I {...p}><path d="m3 7 6 6 4-4 8 8"/><path d="M14 17h7v-7"/></I>,
  Edit: (p) => <I {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></I>,
  Trash: (p) => <I {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></I>,
  Filter: (p) => <I {...p}><path d="M3 6h18M6 12h12M10 18h4"/></I>,
  Download: (p) => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></I>,
  Eye: (p) => <I {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></I>,
  Alert: (p) => <I {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></I>,
  Info: (p) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></I>,
  Settings: (p) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></I>,
  Mail: (p) => <I {...p}><rect x="2" y="4" width="20" height="16"/><path d="m22 6-10 7L2 6"/></I>,
  Lock: (p) => <I {...p}><rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></I>,
  Building: (p) => <I {...p}><rect x="3" y="3" width="18" height="18"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/></I>,
  Spark: (p) => <I {...p}><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></I>,
  ArrowRight: (p) => <I {...p}><path d="M5 12h14M13 5l7 7-7 7"/></I>,
};

window.Icon = Icon;
