import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import {
  gosafeTrackingApi,
  normaliseHistoryResponse,
  type ApiDevice
} from 'api/gosafe.tracking.api';
import {
  zonesApi,
  devicesApi,
  offendersApi,
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
  getPolygonArea,
  getPolygonPerimeter,
  fmtArea,
  fmtPerimeter,
  toIsoDate,
  isSOS,
  isFiberCut,
  isTestDevice,
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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => ssGet(SS.SOUND, true));
  const [followDevice, setFollowDevice] = useState<boolean>(() => ssGet(SS.FOLLOW, true));
  const [showAlertOverlay, setShowAlertOverlay] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(BASE_CENTER);
  const [mapZoom, setMapZoom] = useState(16);
  const [tick, setTick] = useState(0);
  const [syncInterval, setSyncInterval] = useState<number>(() => ssGet(SS.INTERVAL, 30));
  const [sseStatus, setSseStatus] = useState<SSEStatus>('idle');
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);

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

  const deviceViolations = useMemo(() => {
    const out: Record<string, boolean> = {};
    devices.forEach((dev) => {
      if (!dev.assignedGeofenceId) {
        out[dev.id] = false;
        return;
      }
      const gf = geofences.find((g) => g.id === dev.assignedGeofenceId && g.active);
      out[dev.id] = gf ? !isPointInPolygon(dev.coords[0], dev.coords[1], gf.coordinates) : false;
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

  const filteredDevices = useMemo(() => {
    if (!searchQuery) return devices;
    const q = searchQuery.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.uniqueId.includes(q) ||
        (d.subject?.fullName.toLowerCase().includes(q) ?? false)
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
      assignedGeofenceId: null
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
        phoneNumber: f.phoneNumber
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

  const handleAddGeofence = () => {
    if (!addGfForm.name) return;
    const tempId = `gf-${Date.now()}`;
    const newGf: Geofence = {
      id: tempId,
      name: addGfForm.name,
      address: addGfForm.address,
      color: addGfForm.color || '#3b82f6',
      coordinates: [
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

  // ── LIVE DEVICE FETCH ─────────────────────────────────────────────────────────

  /**
   * Merge ApiDevice[] vào state devices — dùng chung cho cả SSE lẫn polling.
   * Giữ lại manual devices (device thêm tay, không có trên API).
   * Phát hiện SOS và Fiber Cut từ event_name để kích hoạt critical alerts.
   */
  const applyApiDevices = useCallback(
    (apiData: ApiDevice[]) => {
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
          // GPS API không có tên phạm nhân → ưu tiên gán từ offender_management
          // (nguồn sự thật). Ghi đè cả subject cũ đã cache để tránh tên lệch.
          const subject = lookupSubject(mapped) ?? mapped.subject;
          return subject ? { ...mapped, subject } : mapped;
        });
        // Giữ lại các thiết bị chưa khớp: device thêm tay + device API không có trong
        // lần push này (vd SSE chỉ đẩy 1 thiết bị mỗi packet).
        const untouched = prev.filter((d) => !matchedIds.has(d.id) && !isTestDevice(d.uniqueId));
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
      applyApiDevices(apiData.data);
    } catch {
      // silently ignore — SSE hoặc lần poll sau sẽ bù lại
    }
  }, [applyApiDevices]);

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
    finishEditingGeofence
  };
}

export type TrackingStore = ReturnType<typeof useTracking>;
