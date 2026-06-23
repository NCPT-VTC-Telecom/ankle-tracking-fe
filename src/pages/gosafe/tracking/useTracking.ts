import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import {
  gosafeTrackingApi,
  normaliseHistoryResponse,
  mapApiEvent,
  GPS_EVENT_ID,
  type ApiDevice
} from 'api/gosafe.tracking.api';
import {
  zonesApi,
  devicesApi,
  offendersApi,
  alertsApi,
  regionsApi,
  mapApiZoneToGeofence,
  mapApiOffenderToSubject,
  offenderDeviceKeys,
  geofenceToApiBody,
  extractList
} from 'api/gosafe.management.api';
import { useGosafeSSE, type SSEStatus } from 'hooks/useGosafeSSE';
import {
  Device,
  Geofence,
  EventLog,
  DeviceFormState,
  GfFormState,
  DeviceHistoryState,
  HistoryFilters,
  CriticalAlert,
  SubjectInfo
} from './types';
import {
  INITIAL_DEVICES,
  INITIAL_GEOFENCES,
  EMPTY_DEVICE_FORM,
  EMPTY_GF_FORM,
  DEFAULT_HISTORY_FILTERS,
  BASE_CENTER,
  DEVICE_PALETTE
} from './constants';
import {
  isPointInPolygon,
  getDistance,
  getPolygonArea,
  getPolygonPerimeter,
  fmtArea,
  fmtPerimeter,
  toIsoDate,
  isSOS,
  isFiberCut,
  isTestDevice,
  isApiDevice,
  SS,
  ssGet,
  ssSet,
  deviceToSS,
  deviceFromSS,
  mapApiDeviceToDevice
} from './utils';

const EMPTY_HISTORY: DeviceHistoryState = { loading: false, error: null, data: null };

/** Khoá để gán offender ↔ device: IMEI (uniqueId) và id thô (bỏ tiền tố 'api-'). */
function deviceMatchKeys(d: { uniqueId?: string; id?: string }): string[] {
  const keys: string[] = [];
  if (d.uniqueId) keys.push(d.uniqueId.trim().toLowerCase());
  if (d.id) keys.push(d.id.replace(/^api-/, '').trim().toLowerCase());
  return keys;
}

const INITIAL_LOGS: EventLog[] = [
  {
    id: '1',
    time: '08:50:00',
    message: 'Hệ thống GoSafe khởi động tại 614 Điện Biên Phủ, P.Vườn Lài, Q.Phú Nhuận.',
    type: 'info'
  },
  {
    id: '2',
    time: '08:50:05',
    message: 'Phát hiện 1 thiết bị. Tín hiệu GPS bình thường.',
    type: 'success'
  }
];


// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useTracking(isDark: boolean, primaryColor: string, secondaryColor: string) {
  // ── CORE — khởi tạo từ sessionStorage nếu có ──
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = ssGet<ReturnType<typeof deviceToSS>[]>(SS.DEVICES, []);
    return saved.length > 0 ? saved.map(deviceFromSS) : INITIAL_DEVICES;
  });
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() =>
    ssGet(SS.SELECTED, 'dev-001')
  );
  const [geofences, setGeofences] = useState<Geofence[]>(() =>
    ssGet(SS.GEOFENCES, INITIAL_GEOFENCES)
  );
  const [editingGeofenceId, setEditingGeofenceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<EventLog[]>(() => ssGet(SS.LOGS, INITIAL_LOGS));

  // ── UI ──
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  // ── Phạm vi địa bàn (region scope) — map/list chỉ hiện "cấp cơ sở đổ xuống" ──
  const [scopeRegionId, setScopeRegionId] = useState<string | null>(null);
  const [scopeRegions, setScopeRegions] = useState<{ id: string; name: string; path: string; level: number }[]>([]);
  const [regionPathById, setRegionPathById] = useState<Record<string, string>>({});
  const [deviceRegionByImei, setDeviceRegionByImei] = useState<Record<string, string>>({});
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => ssGet(SS.SOUND, true));
  const [followDevice, setFollowDevice] = useState<boolean>(() => ssGet(SS.FOLLOW, true));
  const [showAlertOverlay, setShowAlertOverlay] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(BASE_CENTER);
  const [mapZoom, setMapZoom] = useState(16);
  const [tick, setTick] = useState(0);
  const [syncInterval, setSyncInterval] = useState<number>(() => ssGet(SS.INTERVAL, 30));
  const [sseStatus, setSseStatus] = useState<SSEStatus>('idle');
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  // Dedup cho SOS/fiber lấy từ API events: id sự kiện đã xử lý + cờ lần poll đầu.
  const seenCriticalEventsRef = useRef<Set<string>>(new Set());
  const criticalPollInitedRef = useRef(false);
  // % pin thật từ BE (GET /v1/gps_tracking/latest) theo IMEI — ưu tiên hơn ước tính
  // từ điện áp (feed /devices & SSE chỉ có điện áp → quy đổi OCV dễ lệch thấp).
  const latestBatteryRef = useRef<Record<string, number>>({});

  // Initialized from localStorage so page-reload doesn't re-fire existing events
  const prevEventNamesRef = useRef<Record<string, string>>(
    (() => {
      const saved = ssGet<ReturnType<typeof deviceToSS>[]>(SS.DEVICES, []);
      const init: Record<string, string> = {};
      saved.forEach((d) => {
        init[d.uniqueId] = d.status.eventName ?? 'Normal';
      });
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
  const [removeGfId, setRemoveGfId] = useState<string | null>(null);
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

  // ── Load geofences từ API (fallback local nếu lỗi/không token) ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await zonesApi.list({ pageSize: 100 });
        const items = extractList(res.data);
        if (!cancelled && items.length > 0) {
          setGeofences(items.map((z, i) => mapApiZoneToGeofence(z, i)));
        }
      } catch {
        // Giữ INITIAL_GEOFENCES / sessionStorage — UI vẫn chạy demo.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Offender → Device.subject ──────────────────────────────────────────────
  // API GPS (gps_tracking) KHÔNG chứa tên phạm nhân; tên thật nằm ở
  // offender_management. Tải 1 lần, map theo IMEI/deviceId rồi gán vào device.
  const offenderSubjectsRef = useRef<Map<string, SubjectInfo>>(new Map());

  /** Tra SubjectInfo của 1 thiết bị từ bảng offender đã tải (null nếu chưa khớp). */
  const lookupSubject = useCallback((d: { uniqueId?: string; id?: string }): SubjectInfo | null => {
    const map = offenderSubjectsRef.current;
    if (map.size === 0) return null;
    for (const k of deviceMatchKeys(d)) {
      const s = map.get(k);
      if (s) return s;
    }
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await offendersApi.list({ pageSize: 200 });
        const items = extractList(res.data);
        if (cancelled || items.length === 0) return;
        const map = new Map<string, SubjectInfo>();
        items.forEach((o) => {
          const subject = mapApiOffenderToSubject(o);
          offenderDeviceKeys(o).forEach((k) => map.set(k, subject));
        });
        offenderSubjectsRef.current = map;
        // Vá các thiết bị đã có sẵn (seed/SSE vào trước khi offender tải xong).
        setDevices((prev) =>
          prev.map((d) => {
            const subject = lookupSubject(d);
            return subject ? { ...d, subject } : d;
          })
        );
      } catch {
        // Không có offender API/token → giữ subject hiện có (không ghi đè).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lookupSubject]);

  // ── SESSION STORAGE SAVE ──────────────────────────────────────────────────────

  // Devices: debounce 2 s — SSE/API updates nhiều, không cần save mỗi packet
  useEffect(() => {
    if (deviceSaveTimer.current) clearTimeout(deviceSaveTimer.current);
    deviceSaveTimer.current = setTimeout(() => {
      ssSet(SS.DEVICES, devices.map(deviceToSS));
    }, 2000);
  }, [devices]);

  useEffect(() => {
    ssSet(SS.GEOFENCES, geofences);
  }, [geofences]);
  useEffect(() => {
    ssSet(SS.LOGS, logs.slice(0, 200));
  }, [logs]);
  useEffect(() => {
    ssSet(SS.SOUND, soundEnabled);
  }, [soundEnabled]);
  useEffect(() => {
    ssSet(SS.FOLLOW, followDevice);
  }, [followDevice]);
  useEffect(() => {
    ssSet(SS.SELECTED, selectedDeviceId);
  }, [selectedDeviceId]);
  useEffect(() => {
    ssSet(SS.INTERVAL, syncInterval);
  }, [syncInterval]);

  // ── DERIVED ──────────────────────────────────────────────────────────────────

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) ?? devices[0],
    [devices, selectedDeviceId]
  );

  // Sau snapshot, nếu thiết bị đang chọn không còn tồn tại (vd mock dev-001 bị dọn) →
  // tự chọn lại thiết bị thật đầu danh sách.
  useEffect(() => {
    if (devices.length === 0) return;
    if (!devices.some((d) => d.id === selectedDeviceId)) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  const deviceViolations = useMemo(() => {
    const out: Record<string, boolean> = {};
    devices.forEach((dev) => {
      if (!dev.assignedGeofenceId) {
        out[dev.id] = false;
        return;
      }
      const gf = geofences.find((g) => g.id === dev.assignedGeofenceId && g.active);
      if (!gf) {
        out[dev.id] = false;
        return;
      }
      const inside = isPointInPolygon(dev.coords[0], dev.coords[1], gf.coordinates);
      // Vùng an toàn (allowed): vi phạm khi RA. Vùng cấm/cảnh báo: vi phạm khi VÀO.
      out[dev.id] = gf.zoneType === 'allowed' ? !inside : inside;
    });
    return out;
  }, [devices, geofences]);

  const anyViolation = useMemo(
    () => Object.values(deviceViolations).some(Boolean),
    [deviceViolations]
  );

  const geofenceDevicesMap = useMemo(() => {
    const map: Record<string, Device[]> = {};
    geofences.forEach((gf) => {
      map[gf.id] = [];
    });
    devices.forEach((dev) => {
      if (dev.assignedGeofenceId && map[dev.assignedGeofenceId])
        map[dev.assignedGeofenceId].push(dev);
    });
    return map;
  }, [devices, geofences]);

  // Nạp cây địa bàn (path) + map IMEI→regionId (device_management) cho bộ lọc phạm vi.
  useEffect(() => {
    let cancelled = false;
    regionsApi.list({ pageSize: 500 }).then((r) => {
      if (cancelled) return;
      const list = extractList(r.data);
      const pmap: Record<string, string> = {};
      list.forEach((x: any) => { pmap[String(x.id)] = String(x.path ?? ''); });
      setRegionPathById(pmap);
      setScopeRegions(list.map((x: any) => ({ id: String(x.id), name: x.name ?? x.code ?? x.id, path: String(x.path ?? ''), level: Number(x.level ?? 1) })));
    }).catch(() => {});
    devicesApi.list({ pageSize: 500 }).then((r) => {
      if (cancelled) return;
      const dmap: Record<string, string> = {};
      extractList(r.data).forEach((d: any) => {
        const imei = String(d.imei ?? '').trim();
        if (imei && d.regionId) dmap[imei] = String(d.regionId);
      });
      setDeviceRegionByImei(dmap);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // "Cấp cơ sở đổ xuống": chỉ giữ thiết bị thuộc cây con của địa bàn scope (theo path).
  const scopedDevices = useMemo(() => {
    if (!scopeRegionId) return devices;
    const scopePath = regionPathById[scopeRegionId];
    if (!scopePath) return devices; // chưa biết path → không lọc (tránh ẩn nhầm)
    return devices.filter((d) => {
      const rid = deviceRegionByImei[d.uniqueId];
      const rpath = rid ? regionPathById[rid] : undefined;
      return rpath ? rpath === scopePath || rpath.startsWith(scopePath + '.') : false;
    });
  }, [devices, scopeRegionId, regionPathById, deviceRegionByImei]);

  const filteredDevices = useMemo(() => {
    if (!searchQuery) return scopedDevices;
    const q = searchQuery.toLowerCase();
    return scopedDevices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.uniqueId.includes(q) ||
        (d.subject?.fullName.toLowerCase().includes(q) ?? false)
    );
  }, [scopedDevices, searchQuery]);

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
        perimeter: fmtPerimeter(getPolygonPerimeter(gf.coordinates))
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
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
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
        osc.connect(gain);
        gain.connect(ctx.destination);
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
        osc.connect(gain);
        gain.connect(ctx.destination);
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
        const who = dev?.subject?.fullName
          ? `${dev.subject.fullName} (${dev.name})`
          : dev?.name ?? devId;
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
      })
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
        return {
          ...g,
          coordinates: g.coordinates.map((c) => [c[0] + dLat, c[1] + dLng] as [number, number])
        };
      })
    );
    centerDragStartRef.current = null;
  };

  const handleAddVertex = (gfId: string, afterIdx: number, coord: [number, number]) => {
    setGeofences((prev) =>
      prev.map((g) => {
        if (g.id !== gfId) return g;
        const coords = [...g.coordinates];
        coords.splice(afterIdx + 1, 0, coord);
        return { ...g, coordinates: coords };
      })
    );
  };

  const handleDeleteVertex = (gfId: string, vidx: number) => {
    setGeofences((prev) =>
      prev.map((g) => {
        if (g.id !== gfId) return g;
        if (g.coordinates.length <= 3) return g;
        return { ...g, coordinates: g.coordinates.filter((_, i) => i !== vidx) };
      })
    );
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
      id: newId,
      name: f.name,
      type: f.type,
      deviceType: f.deviceType,
      uniqueId: f.uniqueId,
      phoneNumber: f.phoneNumber,
      color,
      subject:
        f.type === 'Person' && f.subjectFullName
          ? {
              fullName: f.subjectFullName,
              idNumber: f.subjectIdNumber,
              crime: f.subjectCrime,
              sentence: f.subjectSentence,
              startDate: f.subjectStartDate,
              releaseDate: f.subjectReleaseDate,
              notes: f.subjectNotes
            }
          : null,
      status: {
        battery: 100,
        batteryVoltage: null,
        externalVoltage: null,
        signalStrength: 4,
        connectionStatus: 'online',
        lastGpsUpdate: new Date(),
        lastServerSync: new Date(),
        gpsAccuracy: 5,
        gpsFix: false,
        satelliteCount: 0,
        speed: 0,
        altitude: 0,
        eventId: 0,
        eventName: 'Normal',
        deviceModel: f.deviceType,
        firmwareVersion: ''
      },
      coords: [...BASE_CENTER] as [number, number],
      angle: 0,
      pathHistory: [],
      assignedGeofenceId: f.assignedGeofenceId
    };
    setDevices((prev) => [...prev, newDev]);
    setSelectedDeviceId(newId);
    addLog(
      `Đã thêm thiết bị: ${f.name}${f.subjectFullName ? ` — ${f.subjectFullName}` : ''}.`,
      'success'
    );
    setAddDeviceOpen(false);
    setAddDeviceForm(EMPTY_DEVICE_FORM);
    // Best-effort tạo trên server.
    devicesApi
      .create({
        deviceCode: f.name,
        imei: f.uniqueId,
        deviceType: f.deviceType,
        phoneNumber: f.phoneNumber,
        ...(f.regionId ? { regionId: f.regionId } : {})
      })
      .catch(() =>
        addLog(`Không tạo được thiết bị "${f.name}" trên máy chủ (lưu cục bộ).`, 'warning')
      );
    if (f.type === 'Person' && f.subjectFullName) {
      offendersApi
        .create({
          fullname: f.subjectFullName,
          citizenId: f.subjectIdNumber,
          crime: f.subjectCrime,
          sentence: f.subjectSentence,
          startDate: f.subjectStartDate,
          releaseDate: f.subjectReleaseDate,
          notes: f.subjectNotes
        })
        .catch(() => {});
    }
  };

  const handleRemoveDevice = (devId: string) => {
    const dev = devices.find((d) => d.id === devId);
    setDevices((prev) => prev.filter((d) => d.id !== devId));
    if (selectedDeviceId === devId)
      setSelectedDeviceId(devices.find((d) => d.id !== devId)?.id ?? '');
    addLog(`Đã xoá thiết bị: ${dev?.name}.`, 'info');
    setRemoveConfirmId(null);
    // Best-effort xoá trên server (id thật dạng uuid; nếu là device thêm tay sẽ bỏ qua lỗi).
    devicesApi.delete(devId).catch(() => {});
  };

  const handleAssignDeviceToGeofence = (devId: string, gfId: string | null) =>
    setDevices((prev) =>
      prev.map((d) => (d.id === devId ? { ...d, assignedGeofenceId: gfId } : d))
    );

  const handleSaveEditDevice = () => {
    if (!editDeviceId) return;
    const f = addDeviceForm;
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== editDeviceId) return d;
        return {
          ...d,
          name: f.name,
          type: f.type,
          deviceType: f.deviceType,
          uniqueId: f.uniqueId,
          phoneNumber: f.phoneNumber,
          color: f.color,
          subject:
            f.type === 'Person' && f.subjectFullName
              ? {
                  fullName: f.subjectFullName,
                  idNumber: f.subjectIdNumber,
                  crime: f.subjectCrime,
                  sentence: f.subjectSentence,
                  startDate: f.subjectStartDate,
                  releaseDate: f.subjectReleaseDate,
                  notes: f.subjectNotes
                }
              : d.subject
        };
      })
    );
    addLog(`Đã cập nhật thiết bị: ${f.name}.`, 'info');
    const id = editDeviceId;
    setEditDeviceId(null);
    // Best-effort cập nhật server.
    devicesApi
      .update(id, {
        deviceCode: f.name,
        imei: f.uniqueId,
        deviceType: f.deviceType,
        phoneNumber: f.phoneNumber
      })
      .catch(() =>
        addLog(`Không đồng bộ được thiết bị "${f.name}" lên máy chủ (lưu cục bộ).`, 'warning')
      );
  };

  const openEditDevice = (dev: Device) => {
    setAddDeviceForm({
      name: dev.name,
      type: dev.type,
      deviceType: dev.deviceType,
      uniqueId: dev.uniqueId,
      phoneNumber: dev.phoneNumber,
      color: dev.color,
      assignedGeofenceId: dev.assignedGeofenceId,
      regionId: null,
      subjectFullName: dev.subject?.fullName ?? '',
      subjectIdNumber: dev.subject?.idNumber ?? '',
      subjectCrime: dev.subject?.crime ?? '',
      subjectSentence: dev.subject?.sentence ?? '',
      subjectStartDate: dev.subject?.startDate ?? '',
      subjectReleaseDate: dev.subject?.releaseDate ?? '',
      subjectNotes: dev.subject?.notes ?? ''
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

  /**
   * Tiếp nhận cảnh báo nghiêm trọng → ẩn khỏi overlay + chuyển trạng thái trên server
   * (alert_management/acknowledge: PENDING → PROCESSING).
   * CriticalAlert lấy từ nhật ký GPS không có sẵn alertId, nên dò bản ghi PENDING khớp
   * theo loại + thời gian (±5 phút) + vị trí gần nhất.
   */
  const acknowledgeCriticalAlert = useCallback(
    async (alert: CriticalAlert) => {
      setCriticalAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      try {
        let alertId = alert.alertId;
        if (!alertId) {
          const res = await alertsApi.list({
            status: 'PENDING',
            pageSize: 50,
            ...(alert.type === 'sos' ? { alertTypeCode: 'SOS' } : {})
          });
          const t = alert.timestamp.getTime();
          let best: any = null;
          let bestScore = Infinity;
          extractList(res.data).forEach((a: any) => {
            const created = a.createdDate ?? a.createdAt ?? a.created_at;
            const dt = created ? Math.abs(new Date(created).getTime() - t) : Infinity;
            if (dt > 5 * 60 * 1000) return; // ngoài cửa sổ ±5 phút → bỏ
            const lat = Number(a.locationLat ?? a.location_lat);
            const lng = Number(a.locationLng ?? a.location_lng);
            const distM =
              Number.isFinite(lat) && Number.isFinite(lng)
                ? getDistance(alert.coords[0], alert.coords[1], lat, lng)
                : 0;
            const score = dt / 1000 + distM; // ưu tiên gần thời gian + gần vị trí
            if (score < bestScore) {
              bestScore = score;
              best = a;
            }
          });
          alertId = best ? String(best.id) : undefined;
        }
        if (alertId) {
          await alertsApi.acknowledge({ alertId });
          addLog(
            `Đã tiếp nhận cảnh báo ${alert.type === 'sos' ? 'SOS' : 'đứt cáp'} — thiết bị ${alert.imei}.`,
            'success'
          );
        } else {
          addLog(`Đã ẩn cảnh báo thiết bị ${alert.imei} (chưa tìm thấy bản ghi trên máy chủ để tiếp nhận).`, 'info');
        }
      } catch {
        addLog(`Không tiếp nhận được cảnh báo trên máy chủ (đã ẩn cục bộ).`, 'warning');
      }
    },
    [addLog]
  );

  const handleSaveGfInfo = () => {
    if (!editGfId) return;
    const id = editGfId;
    let updated: Geofence | undefined;
    setGeofences((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        updated = { ...g, ...editGfForm };
        return updated;
      })
    );
    setEditGfId(null);
    // Best-effort đồng bộ server.
    if (updated) {
      zonesApi
        .update(id, geofenceToApiBody(updated))
        .catch(() =>
          addLog(`Không đồng bộ được vùng "${updated?.name}" lên máy chủ (lưu cục bộ).`, 'warning')
        );
    }
  };

  const handleAddGeofence = (coords?: [number, number][]) => {
    if (!addGfForm.name) return;
    const tempId = `gf-${Date.now()}`;
    const newGf: Geofence = {
      id: tempId,
      name: addGfForm.name,
      address: addGfForm.address,
      color: addGfForm.color || '#3b82f6',
      zoneType: addGfForm.zoneType,
      schedule: addGfForm.schedule,
      coordinates: coords || [
        [BASE_CENTER[0] + 0.002, BASE_CENTER[1] - 0.002],
        [BASE_CENTER[0] + 0.002, BASE_CENTER[1] + 0.002],
        [BASE_CENTER[0] - 0.002, BASE_CENTER[1] + 0.002],
        [BASE_CENTER[0] - 0.002, BASE_CENTER[1] - 0.002]
      ],
      active: true
    };
    setGeofences((prev) => [...prev, newGf]);
    setAddGfOpen(false);
    setAddGfForm(EMPTY_GF_FORM);
    addLog(`Đã thêm vùng "${newGf.name}".`, 'success');
    // Best-effort tạo trên server → thay temp id bằng id thật.
    zonesApi
      .create(geofenceToApiBody(newGf))
      .then((res) => {
        const d = res.data as any;
        const serverId = d?.data?.id ?? d?.id;
        if (serverId) {
          setGeofences((prev) =>
            prev.map((g) => (g.id === tempId ? { ...g, id: String(serverId) } : g))
          );
        }
      })
      .catch(() =>
        addLog(`Không tạo được vùng "${newGf.name}" trên máy chủ (lưu cục bộ).`, 'warning')
      );
  };

  /** Xoá vùng — gỡ gán thiết bị + gọi API best-effort. */
  const handleDeleteGeofence = (gfId: string) => {
    const gf = geofences.find((g) => g.id === gfId);
    setGeofences((prev) => prev.filter((g) => g.id !== gfId));
    setDevices((prev) =>
      prev.map((d) => (d.assignedGeofenceId === gfId ? { ...d, assignedGeofenceId: null } : d))
    );
    if (editingGeofenceId === gfId) setEditingGeofenceId(null);
    setRemoveGfId(null);
    addLog(`Đã xoá vùng "${gf?.name ?? gfId}".`, 'info');
    zonesApi
      .delete(gfId)
      .catch(() => addLog(`Không xoá được vùng trên máy chủ (đã xoá cục bộ).`, 'warning'));
  };

  const originalGfCoordsRef = useRef<[number, number][] | null>(null);

  // Backup original coordinates when editing starts
  useEffect(() => {
    if (editingGeofenceId) {
      const gf = geofences.find((g) => g.id === editingGeofenceId);
      if (gf) {
        originalGfCoordsRef.current = [...gf.coordinates];
      }
    } else {
      originalGfCoordsRef.current = null;
    }
  }, [editingGeofenceId, geofences]);

  /** Kết thúc chỉnh ranh giới — lưu toạ độ mới lên server. */
  const finishEditingGeofence = () => {
    const id = editingGeofenceId;
    setEditingGeofenceId(null);
    if (!id) return;
    const gf = geofences.find((g) => g.id === id);
    if (gf) {
      zonesApi
        .update(id, geofenceToApiBody(gf))
        .catch(() =>
          addLog(`Không đồng bộ ranh giới vùng "${gf.name}" lên máy chủ (lưu cục bộ).`, 'warning')
        );
    }
  };

  /** Hủy chỉnh sửa ranh giới — khôi phục toạ độ cũ. */
  const cancelEditingGeofence = () => {
    const id = editingGeofenceId;
    setEditingGeofenceId(null);
    if (!id) return;
    if (originalGfCoordsRef.current) {
      const coords = originalGfCoordsRef.current;
      setGeofences((prev) =>
        prev.map((g) => (g.id === id ? { ...g, coordinates: coords } : g))
      );
    }
  };

  // ── LIVE DEVICE FETCH ─────────────────────────────────────────────────────────

  /**
   * Merge ApiDevice[] vào state devices — dùng chung cho cả SSE lẫn polling.
   * Giữ lại manual devices (device thêm tay, không có trên API).
   * Phát hiện SOS và Fiber Cut từ event_name để kích hoạt critical alerts.
   *
   * opts.fullSnapshot=true (REST getDevices): coi đây là danh sách đầy đủ — loại bỏ
   * thiết bị API cũ + mock cache không còn trên server. SSE (partial) thì giữ nguyên.
   */
  const applyApiDevices = useCallback(
    (apiData: ApiDevice[], opts?: { fullSnapshot?: boolean }) => {
      // API trả camelCase (deviceImei/eventName) hoặc snake_case → đọc cả hai.
      const imeiOf = (api: any) =>
        String(api?.deviceImei ?? api?.device_imei ?? api?.imei ?? '').trim();
      const evtOf = (api: any) => String(api?.eventName ?? api?.event_name ?? 'Normal');

      // Loại bỏ thiết bị test cứng từ backend (vd IMEI 'TEST...') ngay từ đầu.
      apiData = apiData.filter((d) => !isTestDevice(imeiOf(d)));

      // ── Critical event detection (before state update to access prev names) ──
      const newAlerts: CriticalAlert[] = [];

      apiData.forEach((api: any) => {
        const imei = imeiOf(api);
        const prev = prevEventNamesRef.current[imei] ?? 'Normal';
        const curr = evtOf(api);
        prevEventNamesRef.current[imei] = curr;
        const coords: [number, number] = [Number(api.latitude) || 0, Number(api.longitude) || 0];

        if (isSOS(curr) && !isSOS(prev)) {
          newAlerts.push({
            id: `sos-${imei}-${Date.now()}`,
            type: 'sos',
            imei,
            coords,
            timestamp: new Date()
          });
          addLog(`🚨 SOS KHẨN CẤP: Thiết bị ${imei} yêu cầu hỗ trợ!`, 'warning');
        }

        if (isFiberCut(curr) && !isFiberCut(prev)) {
          newAlerts.push({
            id: `fiber-${imei}-${Date.now()}`,
            type: 'fiber_cut',
            imei,
            coords,
            timestamp: new Date()
          });
          addLog(`⚠️ CẢNH BÁO: Thiết bị ${imei} phát hiện tháo dây cáp quang!`, 'warning');
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
        // Đánh chỉ mục theo IMEI (nếu có) lẫn theo id ổn định từ server.
        // IMEI từ stream đôi khi rỗng → không thể dùng làm khoá duy nhất, nếu không
        // mọi thiết bị "trống IMEI" sẽ đụng key '' và bị nhân bản mỗi lần sync.
        const byImei = new Map<string, Device>();
        const byId = new Map<string, Device>();
        prev.forEach((d) => {
          if (d.uniqueId) byImei.set(d.uniqueId, d);
          byId.set(d.id, d);
        });

        const matchedIds = new Set<string>();
        const apiDevices = apiData.map((api: any, idx: number) => {
          const imei = String(api.deviceImei ?? api.device_imei ?? api.imei ?? '').trim();
          // Ưu tiên khớp theo IMEI thật; nếu rỗng → khớp theo id ổn định của server.
          const existing = (imei ? byImei.get(imei) : undefined) ?? byId.get(`api-${api.id}`);
          if (existing) matchedIds.add(existing.id);
          const mapped = mapApiDeviceToDevice(api, existing, DEVICE_PALETTE[idx % DEVICE_PALETTE.length]);
          // Ưu tiên % pin thật từ BE (/latest) nếu có → tránh bị ghi đè bởi ước tính
          // điện áp mỗi khi có gói SSE (feed /devices & SSE chỉ kèm điện áp).
          const bePct = imei ? latestBatteryRef.current[imei] : undefined;
          const withBat = bePct != null ? { ...mapped, status: { ...mapped.status, battery: bePct } } : mapped;
          // GPS API không có tên phạm nhân → ưu tiên gán từ offender_management
          // (nguồn sự thật). Ghi đè cả subject cũ đã cache để tránh tên lệch.
          const subject = lookupSubject(withBat) ?? withBat.subject;
          return subject ? { ...withBat, subject } : withBat;
        });
        // Giữ lại các thiết bị chưa khớp: device thêm tay + device API không có trong
        // lần push này (vd SSE chỉ đẩy 1 thiết bị mỗi packet).
        // Full snapshot (REST): loại thêm thiết bị API cũ + mock 'dev-001' mồ côi
        // (không còn trên server) → chỉ giữ device thêm tay (dev-<timestamp>).
        const untouched = prev.filter((d) => {
          if (matchedIds.has(d.id) || isTestDevice(d.uniqueId)) return false;
          if (opts?.fullSnapshot && (isApiDevice(d) || d.id === 'dev-001')) return false;
          return true;
        });
        return [...apiDevices, ...untouched];
      });
    },
    [addLog, playSOSAlarm, playFiberAlarm, lookupSubject]
  );

  /** Fetch thủ công qua REST — dùng làm fallback polling và nút refresh */
  const fetchLiveDevices = useCallback(async () => {
    try {
      const res = await gosafeTrackingApi.getDevices();
      const apiData = res.data;
      if (apiData?.code !== 0 || !Array.isArray(apiData?.data)) return;
      applyApiDevices(apiData.data, { fullSnapshot: true });
    } catch {
      // silently ignore — SSE hoặc lần poll sau sẽ bù lại
    }
  }, [applyApiDevices]);

  /**
   * Poll % pin THẬT từ BE (GET /v1/gps_tracking/latest → batteryPercent), lưu theo IMEI.
   * Feed /devices & SSE chỉ kèm điện áp nên battery bị ước tính (OCV) dễ lệch; số này
   * ghi đè để hiển thị đúng và để applyApiDevices giữ nguyên ở các gói sau.
   */
  const pollLatestBattery = useCallback(async () => {
    try {
      const raw: any = (await gosafeTrackingApi.getLatest()).data;
      // /latest có thể trả mảng (data | data.items) hoặc 1 object đơn.
      let list = extractList(raw);
      if (list.length === 0 && raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
        list = [raw.data];
      }
      const map: Record<string, number> = {};
      list.forEach((it: any) => {
        const imei = String(it?.imei ?? it?.deviceImei ?? it?.device_imei ?? '').trim();
        const bpRaw = it?.batteryPercent ?? it?.battery_percent;
        if (imei && bpRaw != null && Number.isFinite(Number(bpRaw))) {
          map[imei] = Math.max(0, Math.min(100, Math.round(Number(bpRaw))));
        }
      });
      if (Object.keys(map).length === 0) return;
      latestBatteryRef.current = { ...latestBatteryRef.current, ...map };
      // Cập nhật ngay state để UI đổi số pin mà không chờ gói SSE kế tiếp.
      setDevices((prev) =>
        prev.map((d) => {
          const bp = map[d.uniqueId];
          return bp != null && bp !== d.status.battery
            ? { ...d, status: { ...d.status, battery: bp } }
            : d;
        })
      );
    } catch {
      // bỏ qua — vẫn còn ước tính từ điện áp làm dự phòng
    }
  }, []);

  /**
   * Poll cảnh báo nghiêm trọng (SOS / đứt cáp) trực tiếp từ nhật ký sự kiện máy chủ
   * (GET /v1/gps_tracking/events). Đây là nguồn xác thực cho "SOS đã kích hoạt" —
   * vẫn hiện được kể cả khi stream thiết bị không bắt được lúc chuyển trạng thái.
   * Lần poll đầu chỉ hiện sự kiện trong 5 phút gần nhất để không phát lại lịch sử cũ.
   */
  const RECENT_SOS_WINDOW_MS = 5 * 60 * 1000;
  const pollCriticalEvents = useCallback(async () => {
    try {
      const [sosRes, fiberRes] = await Promise.all([
        gosafeTrackingApi.getEvents({ eventId: GPS_EVENT_ID.SOS, limit: 30 }),
        gosafeTrackingApi.getEvents({ eventId: GPS_EVENT_ID.FIBER_CUT, limit: 30 })
      ]);
      const events = [...extractList(sosRes.data), ...extractList(fiberRes.data)]
        .map(mapApiEvent)
        .filter((e) => e.imei && !isTestDevice(e.imei));

      const firstRun = !criticalPollInitedRef.current;
      const now = Date.now();
      const newAlerts: CriticalAlert[] = [];

      events.forEach((ev) => {
        if (seenCriticalEventsRef.current.has(ev.id)) return;
        seenCriticalEventsRef.current.add(ev.id);
        // Lần đầu: bỏ qua sự kiện cũ hơn cửa sổ gần đây (chỉ hiện SOS vừa bấm).
        if (firstRun && now - ev.timestamp.getTime() > RECENT_SOS_WINDOW_MS) return;
        const type = ev.eventId === GPS_EVENT_ID.SOS ? 'sos' : 'fiber_cut';
        newAlerts.push({ id: `evt-${ev.id}`, type, imei: ev.imei, coords: ev.coords, timestamp: ev.timestamp });
        addLog(
          type === 'sos'
            ? `🚨 SOS KHẨN CẤP: Thiết bị ${ev.imei} đã kích hoạt SOS!`
            : `⚠️ CẢNH BÁO: Thiết bị ${ev.imei} phát hiện tháo dây cáp quang!`,
          'warning'
        );
      });
      criticalPollInitedRef.current = true;

      if (newAlerts.length > 0) {
        // Tránh trùng với cảnh báo từ stream: gộp theo type+imei+phút.
        const keyOf = (a: CriticalAlert) => `${a.type}-${a.imei}-${Math.floor(a.timestamp.getTime() / 60000)}`;
        setCriticalAlerts((prev) => {
          const seen = new Set(prev.map(keyOf));
          const fresh = newAlerts.filter((a) => !seen.has(keyOf(a)));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
        if (newAlerts.some((a) => a.type === 'sos')) playSOSAlarm();
        else playFiberAlarm();
      }
    } catch {
      // bỏ qua — lần poll sau bù lại
    }
  }, [addLog, playSOSAlarm, playFiberAlarm]);

  // Poll định kỳ nhật ký sự kiện (độc lập với SSE — events là log riêng).
  useEffect(() => {
    pollCriticalEvents();
    const id = setInterval(pollCriticalEvents, Math.max(syncInterval, 15) * 1000);
    return () => clearInterval(id);
  }, [pollCriticalEvents, syncInterval]);

  // ── SSE — primary real-time source ───────────────────────────────────────────

  const { status: sseStatusValue, lastUpdate: sseLastUpdate } = useGosafeSSE(
    applyApiDevices,
    true // luôn bật khi component mount
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

  // ── Snapshot xác thực 1 lần khi mount (không phụ thuộc SSE) ──────────────────
  // Bảo đảm full snapshot luôn chạy để dọn thiết bị API/mock mồ côi từ cache,
  // kể cả khi SSE connect ngay (khiến effect polling phía trên bỏ qua fetch).
  const didInitSnapshotRef = useRef(false);
  useEffect(() => {
    if (didInitSnapshotRef.current) return;
    didInitSnapshotRef.current = true;
    fetchLiveDevices();
  }, [fetchLiveDevices]);

  // ── Poll % pin thật từ BE (/latest) — độc lập với SSE ───────────────────────
  useEffect(() => {
    pollLatestBattery();
    const id = setInterval(pollLatestBattery, Math.max(syncInterval, 15) * 1000);
    return () => clearInterval(id);
  }, [pollLatestBattery, syncInterval]);

  // ── GPS HISTORY ───────────────────────────────────────────────────────────────

  const loadDeviceHistory = useCallback(
    async (device: Device, page = 1) => {
      setHistoryState((prev) => ({ ...prev, [device.id]: { ...EMPTY_HISTORY, loading: true } }));
      try {
        const res = await gosafeTrackingApi.getHistory({
          imei: device.uniqueId,
          page,
          limit: historyFilters.limit,
          from: toIsoDate(historyFilters.from),
          to: toIsoDate(historyFilters.to, true)
        });
        const data = normaliseHistoryResponse(res.data, {
          imei: device.uniqueId,
          page,
          limit: historyFilters.limit
        });
        setHistoryState((prev) => ({
          ...prev,
          [device.id]: { loading: false, error: null, data }
        }));
        setHistoryVisible((prev) => ({ ...prev, [device.id]: true }));
        if (data.items.length > 0) {
          setMapCenter([data.items[0].lat, data.items[0].lng]);
          setMapZoom(15);
        }
      } catch (err: any) {
        setHistoryState((prev) => ({
          ...prev,
          [device.id]: {
            loading: false,
            error: err?.error ?? err?.message ?? 'Không thể tải lịch sử GPS.',
            data: null
          }
        }));
      }
    },
    [historyFilters]
  );

  // ── RETURN ────────────────────────────────────────────────────────────────────

  return {
    // Theme
    isDark,
    primaryColor,
    secondaryColor,
    // Core state
    devices,
    geofences,
    selectedDeviceId,
    setSelectedDeviceId,
    selectedDevice,
    editingGeofenceId,
    setEditingGeofenceId,
    logs,
    setLogs,
    // UI state
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    // Region scope (lọc map/list theo cấp cơ sở đổ xuống)
    scopeRegionId,
    setScopeRegionId,
    scopeRegions,
    scopedDevices,
    soundEnabled,
    setSoundEnabled,
    followDevice,
    setFollowDevice,
    showAlertOverlay,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    syncInterval,
    setSyncInterval,
    sseStatus,
    sseLastUpdate,
    criticalAlerts,
    dismissCriticalAlert,
    dismissAllCriticalAlerts,
    acknowledgeCriticalAlert,
    // History
    historyState,
    historyVisible,
    setHistoryVisible,
    historyFilters,
    setHistoryFilters,
    // Dialogs
    addDeviceOpen,
    setAddDeviceOpen,
    addDeviceForm,
    setAddDeviceForm,
    editDeviceId,
    setEditDeviceId,
    subjectDetailId,
    setSubjectDetailId,
    removeConfirmId,
    setRemoveConfirmId,
    assignGeofenceId,
    setAssignGeofenceId,
    editGfId,
    setEditGfId,
    editGfForm,
    setEditGfForm,
    removeGfId,
    setRemoveGfId,
    addGfOpen,
    setAddGfOpen,
    addGfForm,
    setAddGfForm,
    // Derived
    deviceViolations,
    anyViolation,
    geofenceDevicesMap,
    filteredDevices,
    syncMinutesMap,
    statusAlertCount,
    gfMetrics,
    followTarget,
    // Handlers
    addLog,
    loadDeviceHistory,
    fetchLiveDevices,
    handleAddDevice,
    handleRemoveDevice,
    handleSaveEditDevice,
    openEditDevice,
    handleAssignDeviceToGeofence,
    handleToggleGeofenceActive,
    handleDragVertexEnd,
    handleCenterDragStart,
    handleCenterDragEnd,
    handleAddVertex,
    handleDeleteVertex,
    handleSaveGfInfo,
    handleAddGeofence,
    handleDeleteGeofence,
    finishEditingGeofence,
    cancelEditingGeofence
  };
}

export type TrackingStore = ReturnType<typeof useTracking>;
