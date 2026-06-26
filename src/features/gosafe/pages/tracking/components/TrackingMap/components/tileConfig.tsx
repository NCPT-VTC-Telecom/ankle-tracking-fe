import type { ReactNode } from 'react';

// ── Tile layer config ─────────────────────────────────────────────────────────

export type MapLayer = 'light' | 'dark' | 'satellite' | 'hybrid';

export const TILE_URLS: Record<MapLayer, string> = {
  light:     'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark:      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  hybrid:    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

export const HYBRID_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

export const LAYER_PREVIEWS: Record<MapLayer, { label: string; bg: string; pattern?: ReactNode }> = {
  light: {
    label: 'Sáng',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ opacity: 0.15, position: 'absolute', inset: 0 }}>
        <line x1="10" y1="0" x2="10" y2="50" stroke="#000" strokeWidth="2" />
        <line x1="35" y1="0" x2="35" y2="50" stroke="#000" strokeWidth="1" />
        <line x1="0" y1="15" x2="100" y2="15" stroke="#000" strokeWidth="2.5" />
        <line x1="0" y1="35" x2="100" y2="35" stroke="#000" strokeWidth="1" />
      </svg>
    )
  },
  dark: {
    label: 'Tối',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ opacity: 0.2, position: 'absolute', inset: 0 }}>
        <line x1="15" y1="0" x2="15" y2="50" stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1="50" y1="0" x2="50" y2="50" stroke="#0ea5e9" strokeWidth="0.8" />
        <line x1="0" y1="20" x2="100" y2="20" stroke="#0ea5e9" strokeWidth="2" />
        <line x1="0" y1="40" x2="100" y2="40" stroke="#0ea5e9" strokeWidth="0.8" />
      </svg>
    )
  },
  satellite: {
    label: 'Vệ tinh',
    bg: 'linear-gradient(135deg, #15803d 0%, #1e3a8a 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ opacity: 0.3, position: 'absolute', inset: 0 }}>
        <circle cx="20" cy="15" r="10" fill="#166534" />
        <circle cx="70" cy="35" r="18" fill="#14532d" />
        <circle cx="50" cy="10" r="12" fill="#1e40af" />
      </svg>
    )
  },
  hybrid: {
    label: 'Hỗn hợp',
    bg: 'linear-gradient(135deg, #15803d 0%, #1e3a8a 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <g opacity="0.3">
          <circle cx="25" cy="20" r="15" fill="#166534" />
          <circle cx="65" cy="30" r="12" fill="#1e40af" />
        </g>
        <g opacity="0.4">
          <line x1="30" y1="0" x2="30" y2="50" stroke="#eab308" strokeWidth="1.2" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="#eab308" strokeWidth="1.5" />
        </g>
      </svg>
    )
  }
};
