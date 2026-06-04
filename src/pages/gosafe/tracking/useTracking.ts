import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { gosafeTrackingApi, normaliseHistoryResponse, type ApiDevice } from 'api/gosafe.tracking.api';
import { useGosafeSSE, type SSEStatus } from 'hooks/useGosafeSSE';
import {
  Device, Geofence, EventLog, DeviceFormState, GfFormState,
  DeviceHistoryState, HistoryFilters, CriticalAlert,
} from './types';
import {
  INITIAL_DEVICES, INITIAL_GEOFENCES, EMPTY_DEVICE_FORM,
  EMPTY_GF_FORM, DEFAULT_HISTORY_FILTERS, BASE_CENTER, DEVICE_PALETTE,
} from './constants';
import {
  isPointInPolygon, getPolygonArea, getPolygonPerimeter, getAngle,
  fmtArea, fmtPerimeter, toIsoDate,
} from './utils';

const EMPTY_HISTORY: DeviceHistoryState = { loading: false, error: null, data: null };

// ─── CRITICAL EVENT HELPERS ───────────────────────────────────────────────────

function isSOS(name: string): boolean {
  return /\bsos\b/i.test(name);
}
function isFiberCut(name: string): boolean {
  return /fiber[\s_]*(optical[\s_]*)?cut/i.test(name);
}

// ─── SESSION STORAGE ──────────────────────────────────────────────────────────

const SS = {
  DEVICES:    'gosafe:devices',
  GEOFENCES:  'gosafe:geofences',
  LOGS:       'gosafe:logs',
  SOUND:      'gosafe:soundEnabled',
  FOLLOW:     'gosafe:followDevice',
  SELECTED:   'gosafe:selectedDeviceId',
  INTERVAL:   'gosafe:syncInterval',
};

function ssGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function ssSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/** Serialize Device → JSON-safe (Date fields → ISO strings) */
function deviceToSS(d: Device) {
  return {
    ...d,
    status: {
      ...d.status,
      lastGpsUpdate:  d.status.lastGpsUpdate?.toISOString()  ?? null,
      lastServerSync: d.status.lastServerSync?.toISOString() ?? null,
    },
  };
}

/** Deserialize: restore Date fields after JSON.parse */
function deviceFromSS(raw: ReturnType<typeof deviceToSS>): Device {
  return {
    ...raw,
    status: {
      ...raw.status,
      lastGpsUpdate:  raw.status.lastGpsUpdate  ? new Date(raw.status.lastGpsUpdate)  : null,
      lastServerSync: raw.status.lastServerSync ? new Date(raw.status.lastServerSync) : null,
    },
  };
}

const INITIAL_LOGS: EventLog[] = [
  { id: '1', time: '08:50:00', message: 'Hệ thống GoSafe khởi động tại 614 Điện Biên Phủ, P.Vườn Lài, Q.Phú Nhuận.', type: 'info' },
  { id: '2', time: '08:50:05', message: 'Phát hiện 1 thiết bị. Tín hiệu GPS bình thường.', type: 'success' },
];

// ─── API HELPERS ──────────────────────────────────────────────────────────────

/** Chuyển điện áp Li-ion → % pin (3.0V = 0%, 4.2V = 100%) */
function voltageToPercent(v: number | null, fallback = 50): number {
  if (v == null || v <= 0) return fallback;
  return Math.max(0, Math.min(100, Math.round((v - 3.0) / 1.2 * 100)));
}

function mapApiDeviceToDevice(api: ApiDevice, existing: Device | undefined, fallbackColor: string): Device {
  const lastSeen = new Date(api.last_seen);
  const lastDeviceTime = new Date(api.last_device_time);
  const minutesSinceSync = (Date.now() - lastSeen.getTime()) / 60000;
  const voltage = api.battery_voltage ?? api.external_voltage;
  const battery = voltageToPercent(voltage, existing?.status.battery ?? 50);
  return {
    id: existing?.id ?? `api-${api.id}`,
    name: existing?.name ?? api.device_imei,
    type: existing?.type ?? 'Person',
    deviceType: api.device_model,
    uniqueId: api.device_imei,
    phoneNumber: existing?.phoneNumber ?? '',
    color: existing?.color ?? fallbackColor,
    subject: existing?.subject ?? null,
    status: {
      battery,
      batteryVoltage: api.battery_voltage,
      externalVoltage: api.external_voltage,
      signalStrength: Math.min(4, Math.max(0, api.gsm_signal - 1)),
      connectionStatus: minutesSinceSync > 10 ? 'offline' : minutesSinceSync > 2 ? 'unstable' : 'online',
      lastGpsUpdate: lastDeviceTime,
      lastServerSync: lastSeen,
      gpsAccuracy: 5,
      gpsFix: api.gps_fixed,
      satelliteCount: api.satellite_count,
      speed: api.speed,
      altitude: api.altitude,
      eventId: api.event_id,
      eventName: api.event_name,
      deviceModel: api.device_model,
      firmwareVersion: api.firmware_version,
    },
    coords: [api.latitude, api.longitude] as [number, number],
    angle: (() => {
      const prev = existing?.coords;
      const next: [number, number] = [api.latitude, api.longitude];
      return prev && (prev[0] !== api.latitude || prev[1] !== api.longitude)
        ? getAngle(prev, next)
        : (existing?.angle ?? 0);
    })(),
    pathHistory: (() => {
      const next: [number, number] = [api.latitude, api.longitude];
      const prev = existing?.coords;
      if (!prev || prev[0] !== api.latitude || prev[1] !== api.longitude) {
        return [...(existing?.pathHistory ?? []), next].slice(-50);
      }
      return existing?.pathHistory ?? [];
    })(),
    assignedGeofenceId: existing?.assignedGeofenceId ?? null,
  };
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useTracking(isDark: boolean, primaryColor: string, secondaryColor: string) {

  // ── CORE — khởi tạo từ sessionStorage nếu có ──
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = ssGet<ReturnType<typeof deviceToSS>[]>(SS.DEVICES, []);
    return saved.length > 0 ? saved.map(deviceFromSS) : INITIAL_DEVICES;
  });
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() =>
    ssGet(SS.SELECTED, 'dev-001'),
  );
  const [geofences, setGeofences] = useState<Geofence[]>(() =>
    ssGet(SS.GEOFENCES, INITIAL_GEOFENCES),
  );
  const [editingGeofenceId, setEditingGeofenceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<EventLog[]>(() =>
    ssGet(SS.LOGS, INITIAL_LOGS),
  );

  // ── UI ──
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() =>
    ssGet(SS.SOUND, true),
  );
  const [followDevice, setFollowDevice] = useState<boolean>(() =>
    ssGet(SS.FOLLOW, true),
  );
  const [showAlertOverlay, setShowAlertOverlay] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(BASE_CENTER);
  const [mapZoom, setMapZoom] = useState(16);
  const [tick, setTick] = useState(0);
  const [syncInterval, setSyncInterval] = useState<number>(() =>
    ssGet(SS.INTERVAL, 30),
  );
  const [sseStatus, setSseStatus] = useState<SSEStatus>('idle');
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);

  // Initialized from localStorage so page-reload doesn't re-fire existing events
  const prevEventNamesRef = useRef<Record<string, string>>(
    (() => {
      const saved = ssGet<ReturnType<typeof deviceToSS>[]>(SS.DEVICES, []);
      const init: Record<string, string> = {};
      saved.forEach((d) => { init[d.uniqueId] = d.status.eventName ?? 'Normal'; });
      return init;
    })()
  );

  // ── HISTORY ──
  const [historyState, setHistoryState] = useState<Record<string, DeviceHistoryState>>({});
  const [historyVisible, setHistoryVisible] = useState<Record<string, boolean>>({});
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>(DEFAULT_HISTORY_FILTERS);

  // ── DIALOGS ──
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [addDeviceForm, setAddDeviceForm] = useState<DeviceFormState>(EMPTY_DEVICE_FORM);
  const [editDeviceId, setEditDeviceId] = useState<string | null>(null);
  const [subjectDetailId, setSubjectDetailId] = useState<string | null>(null);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [assignGeofenceId, setAssignGeofenceId] = useState<string | null>(null);
  const [editGfId, setEditGfId] = useState<string | null>(null);
  const [editGfForm, setEditGfForm] = useState<GfFormState>(EMPTY_GF_FORM);
  const [addGfOpen, setAddGfOpen] = useState(false);
  const [addGfForm, setAddGfForm] = useState<GfFormState>(EMPTY_GF_FORM);

  // ── REFS ──
  const centerDragStartRef = useRef<{ startLat: number; startLng: number } | null>(null);
  const prevViolationsRef = useRef<Record<string, boolean>>({});
  const deviceColorIdxRef = useRef(INITIAL_DEVICES.length);
  const deviceSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tick for time-ago labels
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // ── SESSION STORAGE SAVE ──────────────────────────────────────────────────────

  // Devices: debounce 2 s — SSE/API updates nhiều, không cần save mỗi packet
  useEffect(() => {
    if (deviceSaveTimer.current) clearTimeout(deviceSaveTimer.current);
    deviceSaveTimer.current = setTimeout(() => {
      ssSet(SS.DEVICES, devices.map(deviceToSS));
    }, 2000);
  }, [devices]);

  useEffect(() => { ssSet(SS.GEOFENCES, geofences); },      [geofences]);
  useEffect(() => { ssSet(SS.LOGS,      logs.slice(0, 200)); }, [logs]);
  useEffect(() => { ssSet(SS.SOUND,     soundEnabled); },    [soundEnabled]);
  useEffect(() => { ssSet(SS.FOLLOW,    followDevice); },    [followDevice]);
  useEffect(() => { ssSet(SS.SELECTED,  selectedDeviceId); },[selectedDeviceId]);
  useEffect(() => { ssSet(SS.INTERVAL,  syncInterval); },    [syncInterval]);

  // ── DERIVED ──────────────────────────────────────────────────────────────────

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) ?? devices[0],
    [devices, selectedDeviceId],
  );

  const deviceViolations = useMemo(() => {
    const out: Record<string, boolean> = {};
    devices.forEach((dev) => {
      if (!dev.assignedGeofenceId) { out[dev.id] = false; return; }
      const gf = geofences.find((g) => g.id === dev.assignedGeofenceId && g.active);
      out[dev.id] = gf ? !isPointInPolygon(dev.coords[0], dev.coords[1], gf.coordinates) : false;
    });
    return out;
  }, [devices, geofences]);

  const anyViolation = useMemo(() => Object.values(deviceViolations).some(Boolean), [deviceViolations]);

  const geofenceDevicesMap = useMemo(() => {
    const map: Record<string, Device[]> = {};
    geofences.forEach((gf) => { map[gf.id] = []; });
    devices.forEach((dev) => {
      if (dev.assignedGeofenceId && map[dev.assignedGeofenceId])
        map[dev.assignedGeofenceId].push(dev);
    });
    return map;
  }, [devices, geofences]);

  const filteredDevices = useMemo(() => {
    if (!searchQuery) return devices;
    const q = searchQuery.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.uniqueId.includes(q) ||
        (d.subject?.fullName.toLowerCase().includes(q) ?? false),
    );
  }, [devices, searchQuery]);

  const syncMinutesMap = useMemo(() => {
    const m: Record<string, number> = {};
    devices.forEach((d) => {
      m[d.id] = d.status.lastServerSync
        ? Math.floor((Date.now() - d.status.lastServerSync.getTime()) / 60000)
        : Infinity;
    });
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, tick]);

  const statusAlertCount = useMemo(() => {
    let n = 0;
    devices.forEach((d) => {
      if (d.status.battery < 20) n++;
      if (d.status.connectionStatus === 'offline') n++;
      if ((syncMinutesMap[d.id] ?? 0) > 30) n++;
    });
    return n;
  }, [devices, syncMinutesMap]);

  const gfMetrics = useMemo(() => {
    const m: Record<string, { area: string; perimeter: string }> = {};
    geofences.forEach((gf) => {
      m[gf.id] = {
        area: fmtArea(getPolygonArea(gf.coordinates)),
        perimeter: fmtPerimeter(getPolygonPerimeter(gf.coordinates)),
      };
    });
    return m;
  }, [geofences]);

  const followTarget = selectedDevice?.coords ?? BASE_CENTER;

  // ── HELPERS ──────────────────────────────────────────────────────────────────

  const addLog = useCallback((message: string, type: EventLog['type']) => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [{ id: Date.now().toString(), time, message, type }, ...prev]);
  }, []);

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, [soundEnabled]);

  // 3 rapid high-pitched beeps for SOS
  const playSOSAlarm = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [0, 0.22, 0.44].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.18);
      });
    } catch {}
  }, [soundEnabled]);

  // 2 warning beeps for fiber cut
  const playFiberAlarm = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [0, 0.3].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.24);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.24);
      });
    } catch {}
  }, [soundEnabled]);

  // ── EFFECTS ───────────────────────────────────────────────────────────────────

  // Violation detection
  useEffect(() => {
    let hasViolation = false;
    Object.entries(deviceViolations).forEach(([devId, isViolating]) => {
      const wasViolating = prevViolationsRef.current[devId] ?? false;
      if (isViolating !== wasViolating) {
        const dev = devices.find((d) => d.id === devId);
        const gfName = geofences.find((g) => g.id === dev?.assignedGeofenceId)?.name ?? '';
        const who = dev?.subject?.fullName ? `${dev.subject.fullName} (${dev.name})` : dev?.name ?? devId;
        if (isViolating) {
          addLog(`CẢNH BÁO: ${who} đã RA NGOÀI vùng "${gfName}"!`, 'warning');
          playBeep();
        } else {
          addLog(`${who} đã QUAY LẠI vùng "${gfName}".`, 'success');
        }
      }
      if (isViolating) hasViolation = true;
    });
    prevViolationsRef.current = { ...deviceViolations };
    setShowAlertOverlay(hasViolation);
  }, [deviceViolations]);

  // Periodic beep
  useEffect(() => {
    if (!anyViolation || !soundEnabled) return;
    const id = setInterval(playBeep, 1500);
    return () => clearInterval(id);
  }, [anyViolation, soundEnabled, playBeep]);

  // ── GEOFENCE HANDLERS ─────────────────────────────────────────────────────────

  const handleDragVertexEnd = (gfId: string, vidx: number, e: L.LeafletEvent) => {
    const pos = e.target.getLatLng();
    setGeofences((prev) =>
      prev.map((g) => {
        if (g.id !== gfId) return g;
        const coords = [...g.coordinates];
        coords[vidx] = [pos.lat, pos.lng];
        return { ...g, coordinates: coords };
      }),
    );
  };

  const handleCenterDragStart = (e: L.LeafletEvent) => {
    const pos = e.target.getLatLng();
    centerDragStartRef.current = { startLat: pos.lat, startLng: pos.lng };
  };

  const handleCenterDragEnd = (gfId: string, e: L.LeafletEvent) => {
    if (!centerDragStartRef.current) return;
    const end = e.target.getLatLng();
    const dLat = end.lat - centerDragStartRef.current.startLat;
    const dLng = end.lng - centerDragStartRef.current.startLng;
    setGeofences((prev) =>
      prev.map((g) => {
        if (g.id !== gfId) return g;
        return { ...g, coordinates: g.coordinates.map((c) => [c[0] + dLat, c[1] + dLng] as [number, number]) };
      }),
    );
    centerDragStartRef.current = null;
  };

  const handleToggleGeofenceActive = (id: string) =>
    setGeofences((prev) => prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g)));

  // ── DEVICE HANDLERS ───────────────────────────────────────────────────────────

  const handleAddDevice = () => {
    const f = addDeviceForm;
    if (!f.name || !f.uniqueId) return;
    const color = f.color || DEVICE_PALETTE[deviceColorIdxRef.current % DEVICE_PALETTE.length];
    deviceColorIdxRef.current++;
    const newId = `dev-${Date.now()}`;
    const newDev: Device = {
      id: newId, name: f.name, type: f.type, deviceType: f.deviceType,
      uniqueId: f.uniqueId, phoneNumber: f.phoneNumber, color,
      subject: f.type === 'Person' && f.subjectFullName
        ? { fullName: f.subjectFullName, idNumber: f.subjectIdNumber, crime: f.subjectCrime,
            sentence: f.subjectSentence, startDate: f.subjectStartDate, releaseDate: f.subjectReleaseDate,
            notes: f.subjectNotes }
        : null,
      status: {
        battery: 100, batteryVoltage: null, externalVoltage: null,
        signalStrength: 4, connectionStatus: 'online',
        lastGpsUpdate: new Date(), lastServerSync: new Date(), gpsAccuracy: 5,
        gpsFix: false, satelliteCount: 0, speed: 0, altitude: 0,
        eventId: 0, eventName: 'Normal', deviceModel: f.deviceType, firmwareVersion: '',
      },
      coords: [...BASE_CENTER] as [number, number],
      angle: 0, pathHistory: [], assignedGeofenceId: null,
    };
    setDevices((prev) => [...prev, newDev]);
    setSelectedDeviceId(newId);
    addLog(`Đã thêm thiết bị: ${f.name}${f.subjectFullName ? ` — ${f.subjectFullName}` : ''}.`, 'success');
    setAddDeviceOpen(false);
    setAddDeviceForm(EMPTY_DEVICE_FORM);
  };

  const handleRemoveDevice = (devId: string) => {
    const dev = devices.find((d) => d.id === devId);
    setDevices((prev) => prev.filter((d) => d.id !== devId));
    if (selectedDeviceId === devId)
      setSelectedDeviceId(devices.find((d) => d.id !== devId)?.id ?? '');
    addLog(`Đã xoá thiết bị: ${dev?.name}.`, 'info');
    setRemoveConfirmId(null);
  };

  const handleAssignDeviceToGeofence = (devId: string, gfId: string | null) =>
    setDevices((prev) => prev.map((d) => (d.id === devId ? { ...d, assignedGeofenceId: gfId } : d)));

  const handleSaveEditDevice = () => {
    if (!editDeviceId) return;
    const f = addDeviceForm;
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== editDeviceId) return d;
        return {
          ...d, name: f.name, type: f.type, deviceType: f.deviceType,
          uniqueId: f.uniqueId, phoneNumber: f.phoneNumber, color: f.color,
          subject: f.type === 'Person' && f.subjectFullName
            ? { fullName: f.subjectFullName, idNumber: f.subjectIdNumber, crime: f.subjectCrime,
                sentence: f.subjectSentence, startDate: f.subjectStartDate, releaseDate: f.subjectReleaseDate,
                notes: f.subjectNotes }
            : d.subject,
        };
      }),
    );
    addLog(`Đã cập nhật thiết bị: ${f.name}.`, 'info');
    setEditDeviceId(null);
  };

  const openEditDevice = (dev: Device) => {
    setAddDeviceForm({
      name: dev.name, type: dev.type, deviceType: dev.deviceType,
      uniqueId: dev.uniqueId, phoneNumber: dev.phoneNumber, color: dev.color,
      subjectFullName: dev.subject?.fullName ?? '', subjectIdNumber: dev.subject?.idNumber ?? '',
      subjectCrime: dev.subject?.crime ?? '', subjectSentence: dev.subject?.sentence ?? '',
      subjectStartDate: dev.subject?.startDate ?? '', subjectReleaseDate: dev.subject?.releaseDate ?? '',
      subjectNotes: dev.subject?.notes ?? '',
    });
    setEditDeviceId(dev.id);
  };

  // ── GEOFENCE INFO ─────────────────────────────────────────────────────────────

  // ── CRITICAL ALERT HANDLERS ───────────────────────────────────────────────────

  const dismissCriticalAlert = useCallback((id: string) => {
    setCriticalAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissAllCriticalAlerts = useCallback(() => {
    setCriticalAlerts([]);
  }, []);

  const handleSaveGfInfo = () => {
    if (!editGfId) return;
    setGeofences((prev) =>
      prev.map((g) => g.id === editGfId ? { ...g, ...editGfForm } : g),
    );
    setEditGfId(null);
  };

  const handleAddGeofence = () => {
    if (!addGfForm.name) return;
    setGeofences((prev) => [...prev, {
      id: `gf-${Date.now()}`,
      name: addGfForm.name, address: addGfForm.address,
      color: addGfForm.color || '#3b82f6',
      coordinates: [
        [BASE_CENTER[0] + 0.002, BASE_CENTER[1] - 0.002],
        [BASE_CENTER[0] + 0.002, BASE_CENTER[1] + 0.002],
        [BASE_CENTER[0] - 0.002, BASE_CENTER[1] + 0.002],
        [BASE_CENTER[0] - 0.002, BASE_CENTER[1] - 0.002],
      ],
      active: true,
    }]);
    setAddGfOpen(false);
    setAddGfForm(EMPTY_GF_FORM);
  };

  // ── LIVE DEVICE FETCH ─────────────────────────────────────────────────────────

  /**
   * Merge ApiDevice[] vào state devices — dùng chung cho cả SSE lẫn polling.
   * Giữ lại manual devices (device thêm tay, không có trên API).
   * Phát hiện SOS và Fiber Cut từ event_name để kích hoạt critical alerts.
   */
  const applyApiDevices = useCallback((apiData: ApiDevice[]) => {
    // ── Critical event detection (before state update to access prev names) ──
    const newAlerts: CriticalAlert[] = [];

    apiData.forEach((api) => {
      const prev = prevEventNamesRef.current[api.device_imei] ?? 'Normal';
      const curr = api.event_name ?? 'Normal';
      prevEventNamesRef.current[api.device_imei] = curr;

      if (isSOS(curr) && !isSOS(prev)) {
        newAlerts.push({
          id: `sos-${api.device_imei}-${Date.now()}`,
          type: 'sos',
          imei: api.device_imei,
          coords: [api.latitude, api.longitude],
          timestamp: new Date(),
        });
        addLog(`🚨 SOS KHẨN CẤP: Thiết bị ${api.device_imei} yêu cầu hỗ trợ!`, 'warning');
      }

      if (isFiberCut(curr) && !isFiberCut(prev)) {
        newAlerts.push({
          id: `fiber-${api.device_imei}-${Date.now()}`,
          type: 'fiber_cut',
          imei: api.device_imei,
          coords: [api.latitude, api.longitude],
          timestamp: new Date(),
        });
        addLog(`⚠️ CẢNH BÁO: Thiết bị ${api.device_imei} phát hiện tháo dây cáp quang!`, 'warning');
      }
    });

    if (newAlerts.length > 0) {
      setCriticalAlerts((prev) => [...prev, ...newAlerts]);
      if (newAlerts.some((a) => a.type === 'sos')) {
        playSOSAlarm();
      } else {
        playFiberAlarm();
      }
    }

    // ── Merge into devices state ──────────────────────────────────────────────
    setDevices((prev) => {
      const prevByImei: Record<string, Device> = {};
      prev.forEach((d) => { prevByImei[d.uniqueId] = d; });
      const updatedImeis = new Set<string>();
      const apiDevices = apiData.map((api: ApiDevice, idx: number) => {
        updatedImeis.add(api.device_imei);
        const existing = prevByImei[api.device_imei];
        return mapApiDeviceToDevice(api, existing, DEVICE_PALETTE[idx % DEVICE_PALETTE.length]);
      });
      // Giữ lại device thêm tay (không có IMEI trên API)
      const manualDevices = prev.filter((d) => !updatedImeis.has(d.uniqueId));
      return [...apiDevices, ...manualDevices];
    });
  }, [addLog, playSOSAlarm, playFiberAlarm]);

  /** Fetch thủ công qua REST — dùng làm fallback polling và nút refresh */
  const fetchLiveDevices = useCallback(async () => {
    try {
      const res = await gosafeTrackingApi.getDevices();
      const apiData = res.data;
      if (apiData?.code !== 0 || !Array.isArray(apiData?.data)) return;
      applyApiDevices(apiData.data);
    } catch {
      // silently ignore — SSE hoặc lần poll sau sẽ bù lại
    }
  }, [applyApiDevices]);

  // ── SSE — primary real-time source ───────────────────────────────────────────

  const { status: sseStatusValue, lastUpdate: sseLastUpdate } = useGosafeSSE(
    applyApiDevices,
    true, // luôn bật khi component mount
  );

  // Sync SSE status vào state để UI có thể hiển thị indicator
  useEffect(() => {
    setSseStatus(sseStatusValue);
  }, [sseStatusValue]);

  // ── Polling fallback — chỉ chạy khi SSE chưa/không kết nối được ─────────────
  useEffect(() => {
    // SSE đang hoạt động → không cần poll
    if (sseStatusValue === 'connected') return;

    // SSE chưa sẵn sàng (connecting/disconnected/unsupported) → dùng polling
    fetchLiveDevices(); // fetch ngay lập tức
    const id = setInterval(fetchLiveDevices, syncInterval * 1000);
    return () => clearInterval(id);
  }, [fetchLiveDevices, syncInterval, sseStatusValue]);

  // ── GPS HISTORY ───────────────────────────────────────────────────────────────

  const loadDeviceHistory = useCallback(async (device: Device, page = 1) => {
    setHistoryState((prev) => ({ ...prev, [device.id]: { ...EMPTY_HISTORY, loading: true } }));
    try {
      const res = await gosafeTrackingApi.getHistory({
        imei: device.uniqueId, page, limit: historyFilters.limit,
        from: toIsoDate(historyFilters.from), to: toIsoDate(historyFilters.to, true),
      });
      const data = normaliseHistoryResponse(res.data, { imei: device.uniqueId, page, limit: historyFilters.limit });
      setHistoryState((prev) => ({ ...prev, [device.id]: { loading: false, error: null, data } }));
      setHistoryVisible((prev) => ({ ...prev, [device.id]: true }));
      if (data.items.length > 0) {
        setMapCenter([data.items[0].lat, data.items[0].lng]);
        setMapZoom(15);
      }
    } catch (err: any) {
      setHistoryState((prev) => ({
        ...prev,
        [device.id]: { loading: false, error: err?.error ?? err?.message ?? 'Không thể tải lịch sử GPS.', data: null },
      }));
    }
  }, [historyFilters]);

  // ── RETURN ────────────────────────────────────────────────────────────────────

  return {
    // Theme
    isDark, primaryColor, secondaryColor,
    // Core state
    devices, geofences, selectedDeviceId, setSelectedDeviceId, selectedDevice,
    editingGeofenceId, setEditingGeofenceId,
    logs, setLogs,
    // UI state
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    soundEnabled, setSoundEnabled,
    followDevice, setFollowDevice,
    showAlertOverlay,
    mapCenter, setMapCenter,
    mapZoom, setMapZoom,
    syncInterval, setSyncInterval,
    sseStatus, sseLastUpdate,
    criticalAlerts, dismissCriticalAlert, dismissAllCriticalAlerts,
    // History
    historyState, historyVisible, setHistoryVisible,
    historyFilters, setHistoryFilters,
    // Dialogs
    addDeviceOpen, setAddDeviceOpen,
    addDeviceForm, setAddDeviceForm,
    editDeviceId, setEditDeviceId,
    subjectDetailId, setSubjectDetailId,
    removeConfirmId, setRemoveConfirmId,
    assignGeofenceId, setAssignGeofenceId,
    editGfId, setEditGfId,
    editGfForm, setEditGfForm,
    addGfOpen, setAddGfOpen,
    addGfForm, setAddGfForm,
    // Derived
    deviceViolations, anyViolation,
    geofenceDevicesMap, filteredDevices, syncMinutesMap,
    statusAlertCount, gfMetrics, followTarget,
    // Handlers
    addLog, loadDeviceHistory, fetchLiveDevices,
    handleAddDevice, handleRemoveDevice, handleSaveEditDevice, openEditDevice,
    handleAssignDeviceToGeofence,
    handleToggleGeofenceActive,
    handleDragVertexEnd, handleCenterDragStart, handleCenterDragEnd,
    handleSaveGfInfo, handleAddGeofence,
  };
}

export type TrackingStore = ReturnType<typeof useTracking>;
