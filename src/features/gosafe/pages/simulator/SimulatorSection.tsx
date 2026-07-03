import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  IconButton,
  Button,
  Divider,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { ArrowLeft, Routing, Danger, Location, Trash, Send2, SearchNormal1, Gps, Flash } from 'iconsax-react';
import { useNavigate } from 'react-router-dom';

import { useTracking } from '../tracking/useTracking';
import type { Device } from '../tracking/types';
import SimulatorMap, { type SimMode } from './SimulatorMap';
import { gpsSimApi, G737_EVENTS } from 'shared/api/gosafe.sim.api';

interface Props {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

type Feedback = { type: 'success' | 'error' | 'info'; msg: string } | null;

export default function SimulatorSection({ isDark, primaryColor, secondaryColor }: Props) {
  const store = useTracking(isDark, primaryColor, secondaryColor);
  const navigate = useNavigate();

  const {
    scopedDevices: devices,
    filteredDevices,
    searchQuery,
    setSearchQuery,
    selectedDeviceId,
    setSelectedDeviceId,
    selectedDevice,
    geofences,
    mapCenter,
    mapZoom,
    setMapCenter,
    setMapZoom
  } = store;

  // ── Sim state ───────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<SimMode>('position');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Position mode
  const [pendingCoords, setPendingCoords] = useState<[number, number] | null>(null);
  const [posSpeed, setPosSpeed] = useState(0);
  const [posAzimuth, setPosAzimuth] = useState(0);
  const [posMoving, setPosMoving] = useState(true);
  const [posBattery, setPosBattery] = useState(3.9);

  // Route mode
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [routeSteps, setRouteSteps] = useState(20);
  const [routeSpeed, setRouteSpeed] = useState(40);
  const [routeInterval, setRouteInterval] = useState(2000);
  const [routeRunMode, setRouteRunMode] = useState<'sync' | 'background'>('background');
  const [routeBattery, setRouteBattery] = useState(3.9);

  // Sự kiện G737 khác (ngoài SOS) — /event
  const [eventId, setEventId] = useState<number>(4); // mặc định Fiber cut
  const [eventStatus, setEventStatus] = useState(true); // true = Triggered, false = Restored

  const imei = selectedDevice?.uniqueId ?? '';
  const activeCoords: [number, number] | null = pendingCoords ?? selectedDevice?.coords ?? null;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const runSim = useCallback(
    async (fn: () => Promise<{ data: { code: number; message: string; data?: unknown } }>, okMsg: string) => {
      setBusy(true);
      setFeedback(null);
      try {
        const res = await fn();
        const body = res.data;
        if (body?.code === 0) {
          setFeedback({ type: 'success', msg: `${okMsg} ${body.message ? `— ${body.message}` : ''}`.trim() });
          return body;
        }
        setFeedback({ type: 'error', msg: body?.message || 'Máy chủ trả về lỗi nghiệp vụ.' });
        return null;
      } catch (err: any) {
        setFeedback({ type: 'error', msg: err?.error || err?.message || 'Không gọi được API mô phỏng.' });
        return null;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const handleSelectDevice = useCallback(
    (id: string) => {
      setSelectedDeviceId(id);
      setPendingCoords(null);
      const dev = devices.find((d) => d.id === id);
      if (dev) {
        setMapCenter(dev.coords);
        setMapZoom(16);
      }
    },
    [devices, setSelectedDeviceId, setMapCenter, setMapZoom]
  );

  const handleDeviceDragged = useCallback(
    (dev: Device, lat: number, lng: number) => {
      setSelectedDeviceId(dev.id);
      setPendingCoords([lat, lng]);
    },
    [setSelectedDeviceId]
  );

  // ── Actions ───────────────────────────────────────────────────────────────────
  const sendPosition = useCallback(() => {
    if (!imei || !activeCoords) return;
    runSim(
      () =>
        gpsSimApi.position({
          imei,
          latitude: activeCoords[0],
          longitude: activeCoords[1],
          speed: Number(posSpeed) || 0,
          azimuth: Number(posAzimuth) || 0,
          moving: posMoving,
          batteryVoltage: Number(posBattery) || 3.9
        }),
      'Đã cập nhật vị trí mới'
    );
  }, [imei, activeCoords, posSpeed, posAzimuth, posMoving, posBattery, runSim]);

  const sendSos = useCallback(
    (status: boolean) => {
      if (!imei) return;
      runSim(
        () =>
          gpsSimApi.sos({
            imei,
            ...(activeCoords ? { latitude: activeCoords[0], longitude: activeCoords[1] } : {}),
            status
          }),
        status ? 'Đã kích hoạt SOS' : 'Đã huỷ SOS'
      );
    },
    [imei, activeCoords, runSim]
  );

  const sendRoute = useCallback(() => {
    if (!imei || waypoints.length < 2) return;
    runSim(
      () =>
        gpsSimApi.route({
          imei,
          waypoints: waypoints.map(([latitude, longitude]) => ({ latitude, longitude })),
          steps: Number(routeSteps) || 10,
          speed: Number(routeSpeed) || 30,
          intervalMs: routeRunMode === 'sync' ? 0 : Number(routeInterval) || 0,
          batteryVoltage: Number(routeBattery) || 3.9
        }),
      'Đã bắt đầu mô phỏng lộ trình'
    );
  }, [imei, waypoints, routeSteps, routeSpeed, routeInterval, routeRunMode, routeBattery, runSim]);

  const sendEvent = useCallback(() => {
    if (!imei) return;
    const label = G737_EVENTS.find((e) => e.id === eventId)?.label ?? `sự kiện #${eventId}`;
    runSim(
      () =>
        gpsSimApi.event({
          imei,
          eventId,
          status: eventStatus,
          ...(activeCoords ? { latitude: activeCoords[0], longitude: activeCoords[1] } : {})
        }),
      `Đã gửi ${label} (${eventStatus ? 'Triggered' : 'Restored'})`
    );
  }, [imei, eventId, eventStatus, activeCoords, runSim]);

  // ── Glass tokens ──────────────────────────────────────────────────────────────
  const glassBg = isDark ? 'rgba(9, 13, 31, 0.85)' : 'rgba(255, 255, 255, 0.9)';
  const glassBdr = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const txt = isDark ? '#f8fafc' : '#0f172a';
  const txtMuted = isDark ? '#94a3b8' : '#64748b';

  const selectedInfo = useMemo(() => {
    if (!selectedDevice) return null;
    return {
      name: selectedDevice.subject?.fullName || selectedDevice.name,
      imei: selectedDevice.uniqueId,
      coords: activeCoords
    };
  }, [selectedDevice, activeCoords]);

  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', bgcolor: isDark ? '#020617' : '#f8fafc' }}>
      {/* Map backdrop */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <SimulatorMap
          isDark={isDark}
          primaryColor={primaryColor}
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={handleSelectDevice}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          geofences={geofences}
          mode={mode}
          pendingCoords={pendingCoords}
          onDeviceDragged={handleDeviceDragged}
          waypoints={waypoints}
          onAddWaypoint={(lat, lng) => setWaypoints((prev) => [...prev, [lat, lng]])}
          onMoveWaypoint={(idx, lat, lng) =>
            setWaypoints((prev) => prev.map((w, i) => (i === idx ? [lat, lng] : w)))
          }
        />
      </Box>

      {/* Floating control panel */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          bottom: 16,
          width: { xs: 'auto', sm: 420 },
          right: { xs: 16, sm: 'auto' },
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 5,
          bgcolor: glassBg,
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: `1px solid ${glassBdr}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${glassBdr}`, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Về Bản đồ giám sát">
            <IconButton size="small" onClick={() => navigate('/gosafe/tracking')} sx={{ color: txt }}>
              <ArrowLeft size={20} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: txt, lineHeight: 1.2 }}>GPS Simulator</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: txtMuted }}>Mô phỏng vị trí · SOS · lộ trình</Typography>
          </Box>
          <Chip
            size="small"
            icon={<Gps size={14} />}
            label={`${devices.length} thiết bị`}
            sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700, bgcolor: isDark ? 'rgba(56,189,248,0.12)' : 'rgba(39,114,237,0.08)', color: primaryColor }}
          />
        </Box>

        {/* Search */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tên, IMEI, đối tượng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <SearchNormal1 size={18} style={{ marginRight: 8, color: '#94a3b8' }} /> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.875rem' } }}
          />
        </Box>

        {/* Device list */}
        <Box sx={{ px: 2, pb: 1, maxHeight: 180, overflowY: 'auto' }}>
          {filteredDevices.length === 0 ? (
            <Typography sx={{ py: 2, textAlign: 'center', fontSize: '0.8rem', color: txtMuted }}>
              Chưa có thiết bị nào trong feed.
            </Typography>
          ) : (
            <Stack spacing={0.75}>
              {filteredDevices.map((d) => {
                const active = d.id === selectedDeviceId;
                return (
                  <Box
                    key={d.id}
                    onClick={() => handleSelectDevice(d.id)}
                    sx={{
                      p: 1,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: `1px solid ${active ? primaryColor : glassBdr}`,
                      bgcolor: active ? (isDark ? 'rgba(56,189,248,0.1)' : 'rgba(39,114,237,0.06)') : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: primaryColor }
                    }}
                  >
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d.subject?.fullName || d.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: txtMuted }}>{d.uniqueId}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Divider sx={{ borderColor: glassBdr }} />

        {/* Mode toggle + controls */}
        <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', px: 2, py: 1.5 }}>
          {!selectedDevice ? (
            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
              Chọn một thiết bị để bắt đầu mô phỏng.
            </Alert>
          ) : (
            <Stack spacing={1.75}>
              {/* Selected device summary */}
              <Box sx={{ p: 1.25, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: txt }}>{selectedInfo?.name}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: txtMuted }}>IMEI: {selectedInfo?.imei}</Typography>
                {selectedInfo?.coords && (
                  <Typography sx={{ fontSize: '0.72rem', color: txtMuted }}>
                    {selectedInfo.coords[0].toFixed(6)}, {selectedInfo.coords[1].toFixed(6)}
                    {pendingCoords && <Chip label="đã kéo" size="small" sx={{ ml: 0.75, height: 16, fontSize: '0.62rem' }} />}
                  </Typography>
                )}
              </Box>

              <ToggleButtonGroup
                value={mode}
                exclusive
                fullWidth
                size="small"
                onChange={(_, v) => v && setMode(v)}
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', gap: 0.5 } }}
              >
                <ToggleButton value="position">
                  <Location size={16} /> Vị trí
                </ToggleButton>
                <ToggleButton value="route">
                  <Routing size={16} /> Lộ trình
                </ToggleButton>
              </ToggleButtonGroup>

              {/* ── POSITION MODE ── */}
              {mode === 'position' && (
                <Stack spacing={1.5}>
                  <Typography sx={{ fontSize: '0.75rem', color: txtMuted }}>
                    Kéo marker của thiết bị đang chọn tới vị trí mới, chỉnh thông số rồi bấm <b>cập nhật vị trí</b>.
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Tốc độ (km/h)"
                      type="number"
                      size="small"
                      value={posSpeed}
                      onChange={(e) => setPosSpeed(Number(e.target.value))}
                      fullWidth
                    />
                    <TextField
                      label="Hướng (0–360°)"
                      type="number"
                      size="small"
                      value={posAzimuth}
                      onChange={(e) => setPosAzimuth(Number(e.target.value))}
                      fullWidth
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="Điện áp pin (V)"
                      type="number"
                      size="small"
                      value={posBattery}
                      onChange={(e) => setPosBattery(Number(e.target.value))}
                      inputProps={{ step: 0.1 }}
                      fullWidth
                    />
                    <FormControlLabel
                      control={<Switch checked={posMoving} onChange={(e) => setPosMoving(e.target.checked)} size="small" />}
                      label={<Typography sx={{ fontSize: '0.78rem' }}>{posMoving ? 'Moving' : 'Rest'}</Typography>}
                      sx={{ flexShrink: 0, mr: 0 }}
                    />
                  </Stack>
                  <Button
                    variant="contained"
                    startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <Send2 size={16} />}
                    disabled={busy || !activeCoords}
                    onClick={sendPosition}
                    sx={{ borderRadius: '12px' }}
                  >
                    Cập nhật vị trí
                  </Button>
                </Stack>
              )}

              {/* ── ROUTE MODE ── */}
              {mode === 'route' && (
                <Stack spacing={1.5}>
                  <Typography sx={{ fontSize: '0.75rem', color: txtMuted }}>
                    Click lên bản đồ để thêm điểm (kéo để chỉnh). Cần tối thiểu 2 điểm.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip label={`${waypoints.length} điểm`} size="small" sx={{ fontWeight: 700 }} />
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Trash size={14} />}
                      disabled={waypoints.length === 0}
                      onClick={() => setWaypoints([])}
                      sx={{ textTransform: 'none' }}
                    >
                      Xoá điểm
                    </Button>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <TextField label="Số điểm nội suy" type="number" size="small" value={routeSteps} onChange={(e) => setRouteSteps(Number(e.target.value))} fullWidth />
                    <TextField label="Tốc độ (km/h)" type="number" size="small" value={routeSpeed} onChange={(e) => setRouteSpeed(Number(e.target.value))} fullWidth />
                  </Stack>
                  <TextField
                    select
                    label="Chế độ chạy"
                    size="small"
                    value={routeRunMode}
                    onChange={(e) => setRouteRunMode(e.target.value as 'sync' | 'background')}
                    fullWidth
                  >
                    <MenuItem value="background">Chạy nền (theo intervalMs)</MenuItem>
                    <MenuItem value="sync">Đồng bộ (cập nhật hết ngay)</MenuItem>
                  </TextField>
                  {routeRunMode === 'background' && (
                    <TextField label="Interval (ms/điểm)" type="number" size="small" value={routeInterval} onChange={(e) => setRouteInterval(Number(e.target.value))} fullWidth />
                  )}
                  <TextField label="Điện áp pin (V)" type="number" size="small" value={routeBattery} onChange={(e) => setRouteBattery(Number(e.target.value))} inputProps={{ step: 0.1 }} fullWidth />
                  <Button
                    variant="contained"
                    startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <Routing size={16} />}
                    disabled={busy || waypoints.length < 2}
                    onClick={sendRoute}
                    sx={{ borderRadius: '12px' }}
                  >
                    Bắt đầu lộ trình
                  </Button>
                </Stack>
              )}

              <Divider sx={{ borderColor: glassBdr }} />

              {/* ── SOS ── */}
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: txt, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Danger size={16} color="#ef4444" /> Tín hiệu SOS
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    disabled={busy}
                    onClick={() => sendSos(true)}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                  >
                    Kích hoạt SOS
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={busy}
                    onClick={() => sendSos(false)}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                  >
                    Huỷ SOS
                  </Button>
                </Stack>
              </Stack>

              <Divider sx={{ borderColor: glassBdr }} />

              {/* ── Sự kiện G737 khác (geofence / fiber / crash / overspeed…) ── */}
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: txt, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Flash size={16} color="#f59e0b" variant="Bold" /> Sự kiện khác
                </Typography>
                <TextField
                  select
                  label="Loại sự kiện"
                  size="small"
                  value={eventId}
                  onChange={(e) => setEventId(Number(e.target.value))}
                  fullWidth
                >
                  {G737_EVENTS.filter((e) => e.id !== 5).map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      #{e.id} · {e.label}
                    </MenuItem>
                  ))}
                </TextField>
                <FormControlLabel
                  control={<Switch checked={eventStatus} onChange={(e) => setEventStatus(e.target.checked)} size="small" />}
                  label={<Typography sx={{ fontSize: '0.78rem' }}>{eventStatus ? 'Kích hoạt (Triggered)' : 'Phục hồi (Restored)'}</Typography>}
                  sx={{ mr: 0 }}
                />
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <Send2 size={16} />}
                  disabled={busy}
                  onClick={sendEvent}
                  sx={{ borderRadius: '12px', fontWeight: 700 }}
                >
                  Gửi sự kiện
                </Button>
              </Stack>

              {feedback && (
                <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ fontSize: '0.78rem' }}>
                  {feedback.msg}
                </Alert>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
