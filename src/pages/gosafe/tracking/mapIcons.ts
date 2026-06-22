import L from 'leaflet';

export const createDeviceIcon = (angle: number, isAlarm: boolean, color: string, isSelected: boolean) => {
  const c = isAlarm ? '#ef4444' : color;
  const pulse = isAlarm ? 'rgba(239,68,68,0.4)' : `${color}55`;
  const sz = isSelected ? 52 : 44;
  const h = sz / 2;
  return new L.DivIcon({
    html: `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${h}" cy="${h}" r="${h - 4}" fill="${pulse}">
        <animate attributeName="r" values="${h * 0.4};${h - 2};${h * 0.4}" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${h}" cy="${h}" r="${h * 0.55}" fill="${c}" stroke="#fff" stroke-width="${isSelected ? 3 : 2}"/>
      <g transform="translate(${h},${h}) rotate(${angle}) translate(-${h},-${h})">
        <path d="M${h},${h * 0.5} L${h * 1.25},${h * 1.1} L${h},${h * 0.95} L${h * 0.75},${h * 1.1} Z" fill="#fff"/>
      </g>
    </svg>`,
    className: '',
    iconSize: [sz, sz],
    iconAnchor: [h, h],
    popupAnchor: [0, -h],
  });
};

export const createVertexIcon = (color: string) =>
  new L.DivIcon({
    html: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="#fff" stroke="${color}" stroke-width="2.5"/>
      <circle cx="10" cy="10" r="4.5" fill="${color}"/>
    </svg>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

export const createCenterMoveIcon = (color: string) =>
  new L.DivIcon({
    html: `<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="14" fill="${color}" stroke="#fff" stroke-width="2" opacity="0.88"/>
      <polygon points="15,4 12,9 15,8 18,9" fill="white"/>
      <polygon points="15,26 12,21 15,22 18,21" fill="white"/>
      <polygon points="4,15 9,12 8,15 9,18" fill="white"/>
      <polygon points="26,15 21,12 22,15 21,18" fill="white"/>
      <circle cx="15" cy="15" r="3" fill="white"/>
    </svg>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

export const createHistoryMarkerIcon = (label: string, color: string) =>
  new L.DivIcon({
    html: `<div style="background:${color};color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${label}</div>`,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

export const createMidpointIcon = (color: string) =>
  new L.DivIcon({
    html: `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" fill="white" stroke="${color}" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.92"/>
      <line x1="8" y1="3.5" x2="8" y2="12.5" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="3.5" y1="8" x2="12.5" y2="8" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
