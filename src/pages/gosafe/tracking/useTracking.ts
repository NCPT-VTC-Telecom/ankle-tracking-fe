import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { gosafeTrackingApi, normaliseHistoryResponse } from 'api/gosafe.tracking.api';
import {
  Device, Geofence, EventLog, DeviceFormState, GfFormState,
  DeviceHistoryState, HistoryFilters,
} from './types';
import {
  INITIAL_DEVICES, INITIAL_GEOFENCES, EMPTY_DEVICE_FORM,
  EMPTY_GF_FORM, DEFAULT_HISTORY_FILTERS, BASE_CENTER, DEVICE_PALETTE,
} from './constants';
import {
  isPointInPolygon, getPolygonArea, getPolygonPerimeter, getAngle,
  generateDevicePath, fmtArea, fmtPerimeter, toIsoDate,
} from './utils';

const EMPTY_HISTORY: DeviceHistoryState = { loading: false, error: null, data: null };

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useTracking(isDark: boolean, primaryColor: string, secondaryColor: string) {

  // ── CORE ──
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState('dev-001');
  const [geofences, setGeofences] = useState<Geofence[]>(INITIAL_GEOFENCES);
  const [editingGeofenceId, setEditingGeofenceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<EventLog[]>([
    { id: '1', time: '08:50:00', message: 'Hệ thống GoSafe khởi động tại 614 Điện Biên Phủ.', type: 'info' },
    { id: '2', time: '08:50:05', message: 'Phát hiện 2 thiết bị. Tín hiệu GPS tốt.', type: 'success' },
  ]);

  // ── UI ──
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [simSpeed, setSimSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [followDevice, setFollowDevice] = useState(true);
  const [showAlertOverlay, setShowAlertOverlay] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(BASE_CENTER);
  const [mapZoom, setMapZoom] = useState(16);
  const [tick, setTick] = useState(0);

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
  const deviceSimPathsRef = useRef<Record<string, [number, number][]>>({});
  const centerDragStartRef = useRef<{ startLat: number; startLng: number } | null>(null);
  const prevViolationsRef = useRef<Record<string, boolean>>({});
  const deviceColorIdxRef = useRef(INITIAL_DEVICES.length);

  // ── INIT SIM PATHS ──
  useEffect(() => {
    deviceSimPathsRef.current['dev-001'] = generateDevicePath(BASE_CENTER, 0);
    deviceSimPathsRef.current['dev-002'] = generateDevicePath(BASE_CENTER, 1);
  }, []);

  // Tick for time-ago labels
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

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

  // ── EFFECTS ───────────────────────────────────────────────────────────────────

  // Simulation interval
  useEffect(() => {
    const ms = Math.max(100, 1000 / simSpeed);
    const id = setInterval(() => {
      setDevices((prev) => {
        if (!prev.some((d) => d.isSimulating)) return prev;
        return prev.map((dev) => {
          if (!dev.isSimulating) return dev;
          const path = deviceSimPathsRef.current[dev.id];
          if (!path?.length) return dev;
          const nextIdx = (dev.simIndex + 1) % path.length;
          const next = path[nextIdx], cur = path[dev.simIndex];
          const hist = [...dev.pathHistory, next];
          if (hist.length > 50) hist.shift();
          return {
            ...dev,
            simIndex: nextIdx,
            coords: next,
            angle: getAngle(cur, next),
            pathHistory: hist,
            status: { ...dev.status, lastGpsUpdate: new Date(), lastServerSync: new Date() },
          };
        });
      });
    }, ms);
    return () => clearInterval(id);
  }, [simSpeed]);

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

  const handleManualPosition = (lat: number, lng: number) => {
    if (!selectedDeviceId) return;
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDeviceId) return d;
        const hist = [...d.pathHistory, [lat, lng] as [number, number]];
        if (hist.length > 50) hist.shift();
        return { ...d, coords: [lat, lng], pathHistory: hist, status: { ...d.status, lastGpsUpdate: new Date() } };
      }),
    );
    addLog(`Định vị thủ công ${selectedDevice?.name} tại [${lat.toFixed(5)}, ${lng.toFixed(5)}].`, 'info');
  };

  const handleToggleSimulate = (devId: string) =>
    setDevices((prev) => prev.map((d) => (d.id === devId ? { ...d, isSimulating: !d.isSimulating } : d)));

  const handleResetDevice = (devId: string) => {
    const path = deviceSimPathsRef.current[devId];
    if (!path?.length) return;
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== devId) return d;
        return { ...d, isSimulating: false, simIndex: 0, coords: path[0], pathHistory: [path[0]] };
      }),
    );
    addLog(`Đặt lại vị trí ${devices.find((d) => d.id === devId)?.name}.`, 'info');
  };

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
      status: { battery: 100, signalStrength: 4, connectionStatus: 'online',
                lastGpsUpdate: new Date(), lastServerSync: new Date(), gpsAccuracy: 5 },
      coords: [...BASE_CENTER] as [number, number],
      angle: 0, pathHistory: [], isSimulating: false, simIndex: 0, assignedGeofenceId: null,
    };
    deviceSimPathsRef.current[newId] = generateDevicePath(BASE_CENTER, Object.keys(deviceSimPathsRef.current).length);
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
    simSpeed, setSimSpeed,
    soundEnabled, setSoundEnabled,
    followDevice, setFollowDevice,
    showAlertOverlay,
    mapCenter, setMapCenter,
    mapZoom, setMapZoom,
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
    addLog, loadDeviceHistory, handleManualPosition,
    handleToggleSimulate, handleResetDevice,
    handleAddDevice, handleRemoveDevice, handleSaveEditDevice, openEditDevice,
    handleAssignDeviceToGeofence,
    handleToggleGeofenceActive,
    handleDragVertexEnd, handleCenterDragStart, handleCenterDragEnd,
    handleSaveGfInfo, handleAddGeofence,
  };
}

export type TrackingStore = ReturnType<typeof useTracking>;
