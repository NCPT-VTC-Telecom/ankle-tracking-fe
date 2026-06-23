import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Typography,
  Avatar,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Switch,
  Alert
} from '@mui/material';
import { DEVICE_PALETTE, ZONE_PRESETS, DEFAULT_ZONE_SCHEDULE, WEEKDAY_LABELS, ZONE_PRESET_MAP } from '../constants';
import { getMockBiometrics } from '../utils';
import type { ZoneType, ZoneSchedule } from '../types';
import type { TrackingStore } from '../useTracking';
import SideDrawer from '../../components/SideDrawer';
import { useFeedback } from '../../components/FeedbackProvider';

interface Props {
  store: TrackingStore;
}

function DeviceFormContent({ store }: Props) {
  const { addDeviceForm, setAddDeviceForm } = store;
  const f = addDeviceForm;
  const set = (patch: Partial<typeof f>) => setAddDeviceForm((prev) => ({ ...prev, ...patch }));

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={2}>
        <TextField label="Tên thiết bị *" fullWidth value={f.name} onChange={(e) => set({ name: e.target.value })} />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Loại</InputLabel>
          <Select value={f.type} label="Loại" onChange={(e) => set({ type: e.target.value as any })}>
            <MenuItem value="Person">Phạm nhân</MenuItem>
            <MenuItem value="Vehicle">Phương tiện</MenuItem>
            <MenuItem value="Asset">Tài sản</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="IMEI *" fullWidth value={f.uniqueId} onChange={(e) => set({ uniqueId: e.target.value })} />
        <TextField label="Số SIM" fullWidth value={f.phoneNumber} onChange={(e) => set({ phoneNumber: e.target.value })} />
      </Stack>
      <TextField label="Dòng thiết bị" fullWidth value={f.deviceType} onChange={(e) => set({ deviceType: e.target.value })} />

      {/* Color swatches */}
      <Stack direction="row" spacing={1} alignItems="center" className="gs-swatch-row">
        <Typography variant="body2" color="text.secondary">
          Màu marker:
        </Typography>
        {DEVICE_PALETTE.map((c) => (
          <Box
            key={c}
            className={`gs-color-swatch${f.color === c ? ' gs-color-swatch--active' : ''}`}
            onClick={() => set({ color: c })}
            style={{ backgroundColor: c, boxShadow: f.color === c ? `0 0 0 2px ${c}` : 'none' }}
          />
        ))}
      </Stack>

      {f.type === 'Person' && (
        <>
          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              Thông tin phạm nhân
            </Typography>
          </Divider>
          <Stack direction="row" spacing={2}>
            <TextField label="Họ và tên *" fullWidth value={f.subjectFullName} onChange={(e) => set({ subjectFullName: e.target.value })} />
            <TextField label="CCCD/CMND" fullWidth value={f.subjectIdNumber} onChange={(e) => set({ subjectIdNumber: e.target.value })} />
          </Stack>
          <TextField label="Tội danh" fullWidth value={f.subjectCrime} onChange={(e) => set({ subjectCrime: e.target.value })} />
          <TextField
            label="Bản án / Hình phạt"
            fullWidth
            value={f.subjectSentence}
            onChange={(e) => set({ subjectSentence: e.target.value })}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Ngày bắt đầu"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={f.subjectStartDate}
              onChange={(e) => set({ subjectStartDate: e.target.value })}
            />
            <TextField
              label="Ngày kết thúc"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={f.subjectReleaseDate}
              onChange={(e) => set({ subjectReleaseDate: e.target.value })}
            />
          </Stack>
          <TextField
            label="Ghi chú"
            fullWidth
            multiline
            rows={2}
            value={f.subjectNotes}
            onChange={(e) => set({ subjectNotes: e.target.value })}
          />
        </>
      )}
    </Stack>
  );
}

// ── GF color swatch row ────────────────────────────────────────────────────────
const GF_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

// ── Zone preset picker (chọn loại vùng theo zoneType của API) ───────────────────
function ZonePresetPicker({
  value,
  onChange
}: {
  value: ZoneType;
  onChange: (zoneType: ZoneType, color: string) => void;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        Loại vùng *
      </Typography>
      <Stack direction="row" spacing={1}>
        {ZONE_PRESETS.map((p) => {
          const selected = value === p.zoneType;
          return (
            <Box
              key={p.zoneType}
              onClick={() => onChange(p.zoneType, p.color)}
              sx={{
                flex: 1,
                cursor: 'pointer',
                borderRadius: '10px',
                p: 1.25,
                border: '2px solid',
                borderColor: selected ? p.color : 'divider',
                bgcolor: selected ? `${p.color}14` : 'transparent',
                transition: 'all .15s',
                '&:hover': { borderColor: p.color }
              }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: p.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  {p.label}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem', display: 'block', lineHeight: 1.3 }}>
                {p.description}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

// ── Zone schedule picker (lịch áp dụng vùng — khớp ZoneScheduleDto) ─────────────
function ZoneSchedulePicker({
  value,
  onChange
}: {
  value: ZoneSchedule | null;
  onChange: (schedule: ZoneSchedule | null) => void;
}) {
  const enabled = value != null;
  const sched = value ?? DEFAULT_ZONE_SCHEDULE;

  const toggleDay = (day: number) => {
    const days = sched.daysOfWeek.includes(day)
      ? sched.daysOfWeek.filter((d) => d !== day)
      : [...sched.daysOfWeek, day].sort((a, b) => a - b);
    onChange({ ...sched, daysOfWeek: days });
  };

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Lịch áp dụng
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {enabled ? 'Chỉ áp dụng trong khung giờ đã chọn' : 'Áp dụng 24/7 (mọi lúc)'}
          </Typography>
        </Box>
        <Switch
          checked={enabled}
          onChange={(e) => onChange(e.target.checked ? DEFAULT_ZONE_SCHEDULE : null)}
          size="small"
        />
      </Stack>

      {enabled && (
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const active = sched.daysOfWeek.includes(day);
              return (
                <Chip
                  key={day}
                  label={WEEKDAY_LABELS[day]}
                  size="small"
                  onClick={() => toggleDay(day)}
                  color={active ? 'primary' : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700, minWidth: 40 }}
                />
              );
            })}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Từ giờ"
              type="time"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={sched.startTime}
              onChange={(e) => onChange({ ...sched, startTime: e.target.value })}
            />
            <TextField
              label="Đến giờ"
              type="time"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={sched.endTime}
              onChange={(e) => onChange({ ...sched, endTime: e.target.value })}
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

function GfColorRow({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" className="gs-swatch-row">
      <Typography variant="body2" color="text.secondary">
        Màu:
      </Typography>
      {GF_COLORS.map((c) => (
        <Box
          key={c}
          className={`gs-color-swatch${value === c ? ' gs-color-swatch--active' : ''}`}
          onClick={() => onChange(c)}
          style={{ backgroundColor: c, boxShadow: value === c ? `0 0 0 2px ${c}` : 'none' }}
        />
      ))}
    </Stack>
  );
}

// ── All dialogs ────────────────────────────────────────────────────────────────

export default function TrackingDialogs({ store }: Props) {
  const {
    isDark,
    primaryColor,
    devices,
    geofences,
    addDeviceOpen,
    setAddDeviceOpen,
    addDeviceForm,
    editDeviceId,
    setEditDeviceId,
    subjectDetailId,
    setSubjectDetailId,
    removeConfirmId,
    setRemoveConfirmId,
    removeGfId,
    setRemoveGfId,
    handleDeleteGeofence,
    assignGeofenceId,
    setAssignGeofenceId,
    editGfId,
    setEditGfId,
    editGfForm,
    setEditGfForm,
    addGfOpen,
    setAddGfOpen,
    addGfForm,
    setAddGfForm,
    handleAddDevice,
    handleSaveEditDevice,
    handleRemoveDevice,
    handleAssignDeviceToGeofence,
    handleSaveGfInfo,
    handleAddGeofence,
    // Additional items
    setEditingGeofenceId,
    setMapCenter,
    setMapZoom,
    geofenceDevicesMap,
    gfMetrics,
    handleToggleGeofenceActive,
    mapCenter
  } = store;

  const { notify } = useFeedback();
  const after = (fn: () => void, msg: string) => () => { fn(); notify(msg, 'success'); };

  const [isEditingGf, setIsEditingGf] = useState(false);
  const [shapeType, setShapeType] = useState<'square' | 'circle' | 'polygon'>('square');

  useEffect(() => {
    if (!editGfId) {
      setIsEditingGf(false);
    }
  }, [editGfId]);

  const generateShapeCoords = (shape: 'square' | 'circle' | 'polygon', center: [number, number]): [number, number][] => {
    const lat = center[0];
    const lng = center[1];
    if (shape === 'circle') {
      const coords: [number, number][] = [];
      const segments = 16;
      const radius = 0.0025; // approx 250m
      for (let i = 0; i < segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        coords.push([
          lat + radius * Math.cos(angle),
          lng + radius * Math.sin(angle)
        ]);
      }
      return coords;
    }
    if (shape === 'polygon') {
      return [
        [lat + 0.0025, lng],
        [lat - 0.0015, lng + 0.0025],
        [lat - 0.002, lng],
        [lat - 0.0015, lng - 0.0025]
      ];
    }
    // square default
    return [
      [lat + 0.002, lng - 0.002],
      [lat + 0.002, lng + 0.002],
      [lat - 0.002, lng + 0.002],
      [lat - 0.002, lng - 0.002]
    ];
  };

  const getGeofenceCenter = (coordinates?: [number, number][]): [number, number] => {
    if (!coordinates || coordinates.length === 0) return mapCenter || [21.0285, 105.8048];
    let latSum = 0;
    let lngSum = 0;
    coordinates.forEach(([lat, lng]) => {
      latSum += lat;
      lngSum += lng;
    });
    return [latSum / coordinates.length, lngSum / coordinates.length];
  };

  const handleCreateGeofenceWithPreset = () => {
    const coords = generateShapeCoords(shapeType, mapCenter || [21.0285, 105.8048]);
    handleAddGeofence(coords);
  };

  const paperSx = {
    borderRadius: 2,
    bgcolor: isDark ? '#0f172a' : '#fff',
    backgroundImage: 'none'
  };

  const gf = geofences.find((g) => g.id === editGfId);
  const assigned = gf ? (geofenceDevicesMap[gf.id] ?? []) : [];

  return (
    <>
      {/* ── Add Device ── */}
      <SideDrawer
        open={addDeviceOpen}
        onClose={() => setAddDeviceOpen(false)}
        isDark={isDark}
        primaryColor={store.primaryColor}
        width={520}
        title="Thêm thiết bị mới"
        subtitle="Khai báo thiết bị giám sát & đối tượng"
        footer={
          <>
            <Button onClick={() => setAddDeviceOpen(false)} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}>Hủy</Button>
            <Button variant="contained" onClick={after(handleAddDevice, 'Đã thêm thiết bị')} disabled={!addDeviceForm.name || !addDeviceForm.uniqueId} sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}>
              Thêm thiết bị
            </Button>
          </>
        }
      >
        <DeviceFormContent store={store} />
      </SideDrawer>

      {/* ── Edit Device ── */}
      <SideDrawer
        open={!!editDeviceId}
        onClose={() => setEditDeviceId(null)}
        isDark={isDark}
        primaryColor={store.primaryColor}
        width={520}
        title="Chỉnh sửa thiết bị"
        subtitle="Cập nhật thông tin thiết bị & đối tượng"
        footer={
          <>
            <Button onClick={() => setEditDeviceId(null)} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}>Hủy</Button>
            <Button variant="contained" onClick={after(handleSaveEditDevice, 'Đã cập nhật thiết bị')} sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}>Lưu thay đổi</Button>
          </>
        }
      >
        <DeviceFormContent store={store} />
      </SideDrawer>

      {/* ── Remove Confirm ── */}
      <Dialog open={!!removeConfirmId} onClose={() => setRemoveConfirmId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: paperSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xoá</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xoá thiết bị <b>{devices.find((d) => d.id === removeConfirmId)?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setRemoveConfirmId(null)} sx={{ borderRadius: 2.5, fontWeight: 600, py: 1 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => { handleRemoveDevice(removeConfirmId!); notify('Đã xóa thiết bị', 'success'); }}
            sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Remove Geofence Confirm ── */}
      <Dialog open={!!removeGfId} onClose={() => setRemoveGfId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: paperSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xoá vùng</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xoá vùng giám sát <b>{geofences.find((g) => g.id === removeGfId)?.name}</b>? Các thiết bị đang gán sẽ được gỡ khỏi vùng này.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setRemoveGfId(null)} sx={{ borderRadius: 2.5, fontWeight: 600, py: 1 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => { handleDeleteGeofence(removeGfId!); setRemoveGfId(null); setEditGfId(null); notify('Đã xóa vùng giám sát', 'success'); }}
            sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
          >
            Xoá vùng
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Subject Detail ── */}
      {(() => {
        const dev = devices.find((d) => d.id === subjectDetailId);
        const sub = dev?.subject;
        if (!dev || !sub) return null;
        const release = sub.releaseDate ? new Date(sub.releaseDate) : null;
        const daysLeft = release ? Math.max(0, Math.ceil((release.getTime() - Date.now()) / 86400000)) : null;
        return (
          <SideDrawer
            open={!!subjectDetailId}
            onClose={() => setSubjectDetailId(null)}
            isDark={isDark}
            primaryColor={dev.color}
            width={460}
            title="Hồ sơ phạm nhân"
            subtitle={sub.fullName}
            footer={
              <Button variant="contained" onClick={() => setSubjectDetailId(null)} sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}>Đóng</Button>
            }
          >
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: dev.color,
                      fontSize: '1.4rem',
                      fontWeight: 700
                    }}
                  >
                    {sub.fullName?.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {sub.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CCCD: {sub.idNumber || '—'}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                {[
                  ['Thiết bị', dev.name],
                  ['IMEI', dev.uniqueId],
                  ['Tội danh', sub.crime],
                  ['Bản án', sub.sentence],
                  ['Ngày bắt đầu', sub.startDate || '—'],
                  ['Ngày mãn hạn', sub.releaseDate || '—']
                ].map(([label, value]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {label}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                      {value}
                    </Typography>
                  </Stack>
                ))}
                {daysLeft !== null && (
                  <Chip
                    label={daysLeft > 0 ? `Còn ${daysLeft} ngày chấp hành án` : 'Đã mãn hạn án'}
                    color={daysLeft > 30 ? 'default' : daysLeft > 0 ? 'warning' : 'success'}
                    sx={{ fontWeight: 700 }}
                  />
                )}
                <Divider />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#2d5eaf',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    fontSize: '0.68rem',
                    display: 'block'
                  }}
                >
                  Cảm biến & Phần cứng thiết bị
                </Typography>
                {(() => {
                  const bio = getMockBiometrics(dev.id);
                  return (
                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Tiếp xúc vòng chân:
                        </Typography>
                        <Chip
                          label={bio.isTampered ? 'PHÁT HIỆN THÁO XÍCH' : 'Khóa đeo ổn định'}
                          size="small"
                          className={bio.isTampered ? 'gs-blink' : ''}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                            borderRadius: 1,
                            bgcolor: bio.isTampered ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                            color: bio.isTampered ? '#ef4444' : '#22c55e',
                            border: '1px solid',
                            borderColor: bio.isTampered ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'
                          }}
                        />
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Điện áp Pin:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {dev.status.batteryVoltage != null
                            ? `${dev.status.batteryVoltage.toFixed(2)}V (pin)`
                            : dev.status.externalVoltage != null
                            ? `${dev.status.externalVoltage.toFixed(2)}V (nguồn ngoài)`
                            : '—'}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái định vị GPS:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: dev.status.gpsFix ? '#22c55e' : '#f59e0b' }}>
                          {dev.status.gpsFix ? `Đã Fix (${dev.status.satelliteCount} vệ tinh)` : 'Chưa định vị (No Fix)'}
                        </Typography>
                      </Stack>
                    </Stack>
                  );
                })()}
                {sub.notes && (
                  <Box
                    sx={{
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      borderRadius: 2,
                      p: 1.5
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      Ghi chú:
                    </Typography>
                    <Typography variant="body2">{sub.notes}</Typography>
                  </Box>
                )}
              </Stack>
          </SideDrawer>
        );
      })()}

      {/* ── Assign Device to Geofence ── */}
      {(() => {
        const gf = geofences.find((g) => g.id === assignGeofenceId);
        if (!gf) return null;
        return (
          <SideDrawer
            open={!!assignGeofenceId}
            onClose={() => setAssignGeofenceId(null)}
            isDark={isDark}
            primaryColor={gf.color}
            width={440}
            title={`Gán thiết bị vào "${gf.name}"`}
            subtitle="Mỗi thiết bị chỉ thuộc một vùng tại một thời điểm"
            footer={
              <Button variant="contained" onClick={() => setAssignGeofenceId(null)} sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}>Xong</Button>
            }
          >
              <List disablePadding>
                {devices.map((dev) => {
                  const isAssigned = dev.assignedGeofenceId === gf.id;
                  const other = !isAssigned && dev.assignedGeofenceId ? geofences.find((g) => g.id === dev.assignedGeofenceId)?.name : null;
                  return (
                    <ListItem key={dev.id} disableGutters sx={{ py: 0.5 }}>
                      <Checkbox
                        checked={isAssigned}
                        onChange={(e) => handleAssignDeviceToGeofence(dev.id, e.target.checked ? gf.id : null)}
                        sx={{ color: dev.color, '&.Mui-checked': { color: dev.color } }}
                      />
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: dev.color,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          mr: 1.5,
                          flexShrink: 0
                        }}
                      >
                        {(dev.name ?? '').slice(-3)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                             {dev.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {dev.subject?.fullName ?? dev.deviceType}
                            {other && <span style={{ color: '#f59e0b' }}> · đang ở "{other}"</span>}
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
          </SideDrawer>
        );
      })()}

      {/* ── Edit/View Geofence Info (Unified Sidebar CRUD) ── */}
      <SideDrawer
        open={!!editGfId}
        onClose={() => setEditGfId(null)}
        isDark={isDark}
        primaryColor={editGfForm.color || '#2563eb'}
        width={440}
        title={isEditingGf ? "Chỉnh sửa vùng giám sát" : gf?.name || "Thông tin vùng"}
        subtitle={isEditingGf ? "Cập nhật các thuộc tính của vùng" : "Chi tiết và quản lý vùng giám sát"}
        footer={
          isEditingGf ? (
            <>
              <Button onClick={() => setIsEditingGf(false)} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}>Hủy</Button>
              <Button variant="contained" onClick={after(() => { handleSaveGfInfo(); setIsEditingGf(false); }, 'Đã cập nhật vùng')} sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}>Lưu</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setEditGfId(null)} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}>Đóng</Button>
              <Button variant="contained" onClick={() => setIsEditingGf(true)} sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}>Chỉnh sửa thông tin</Button>
            </>
          )
        }
      >
        {gf && (
          <Stack spacing={3}>
            {!isEditingGf ? (
              /* VIEW MODE */
              <>
                {/* Visual Swatch & Basic Info */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      bgcolor: gf.color, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: `0 8px 20px ${gf.color}33`,
                      border: '2px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: '#ffffff' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {gf.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {gf.address || 'Không có địa điểm xác định'}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                {/* Switch Active & Zone Type row */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Loại phân loại vùng
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hành động cảnh báo của vùng
                    </Typography>
                  </Box>
                  <Chip
                    label={ZONE_PRESET_MAP[gf.zoneType]?.label || gf.zoneType}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      color: gf.color,
                      bgcolor: `${gf.color}14`,
                      border: `1px solid ${gf.color}33`
                    }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Trạng thái hoạt động
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bật/tắt theo dõi vùng này
                    </Typography>
                  </Box>
                  <Switch checked={gf.active} onChange={() => handleToggleGeofenceActive(gf.id)} size="small" />
                </Stack>

                <Divider />

                {/* Map Control Buttons */}
                <Stack direction="row" spacing={1.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      if (gf.coordinates.length > 0) {
                        setMapCenter(gf.coordinates[0]);
                        setMapZoom(16);
                      }
                    }}
                    sx={{ borderRadius: '12px', fontWeight: 600, py: 1 }}
                  >
                    Định vị trên bản đồ
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      setEditingGeofenceId(gf.id);
                      if (gf.coordinates.length > 0) {
                        setMapCenter(gf.coordinates[0]);
                        setMapZoom(16);
                      }
                      setEditGfId(null);
                      notify('Hãy kéo các đỉnh polygon trên bản đồ để chỉnh sửa ranh giới.', 'info');
                    }}
                    sx={{ borderRadius: '12px', fontWeight: 600, py: 1 }}
                  >
                    Sửa ranh giới
                  </Button>
                </Stack>

                {/* Detailed Metrics */}
                <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '14px', p: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: primaryColor, display: 'block', mb: 1.5 }}>
                    Thông số vùng giám sát
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      ['Diện tích', gfMetrics[gf.id]?.area || '—'],
                      ['Chu vi', gfMetrics[gf.id]?.perimeter || '—'],
                      ['Số điểm mốc', `${gf.coordinates.length} đỉnh`],
                      ['Khung thời gian áp dụng', gf.schedule ? `${gf.schedule.daysOfWeek.map((d) => WEEKDAY_LABELS[d]).join(', ')} · ${gf.schedule.startTime}–${gf.schedule.endTime}` : '24/7 (mọi lúc)']
                    ].map(([label, val]) => (
                      <Stack key={label} direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          {label}:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {val}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {/* Assigned Devices */}
                <Box sx={{ border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: '14px', p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: primaryColor }}>
                      Thiết bị được gán ({assigned.length})
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setAssignGeofenceId(gf.id)}
                      sx={{ fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      + Gán thiết bị
                    </Button>
                  </Stack>
                  {assigned.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
                      Chưa có thiết bị nào được gán vùng này.
                    </Typography>
                  ) : (
                    <Stack spacing={1.25}>
                      {assigned.map((dev) => (
                        <Stack key={dev.id} direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dev.color }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {dev.name}
                              </Typography>
                              {dev.subject && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {dev.subject.fullName}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          <Chip
                            label="Đang gán"
                            size="small"
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Dangerous Delete button */}
                <Box sx={{ pt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => setRemoveGfId(gf.id)}
                    sx={{ borderRadius: '12px', fontWeight: 700, py: 1 }}
                  >
                    Xóa vùng giám sát này
                  </Button>
                </Box>
              </>
            ) : (
              /* EDIT MODE */
              <Stack spacing={2.5}>
                <TextField
                  label="Tên vùng *"
                  fullWidth
                  value={editGfForm.name}
                  onChange={(e) => setEditGfForm((f) => ({ ...f, name: e.target.value }))}
                />
                <TextField
                  label="Địa chỉ"
                  fullWidth
                  value={editGfForm.address}
                  onChange={(e) => setEditGfForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="VD: 614 Điện Biên Phủ, P.25, Q.Bình Thạnh"
                />

                {/* Shape Presets in Edit Mode */}
                <FormControl fullWidth>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Thay đổi dạng hình học (Ghi đè ranh giới)
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {[
                      { value: 'square' as const, label: 'Hình vuông' },
                      { value: 'circle' as const, label: 'Hình tròn' },
                      { value: 'polygon' as const, label: 'Đa giác tự do' }
                    ].map((item) => {
                      return (
                        <Chip
                          key={item.value}
                          label={item.label}
                          onClick={() => {
                            const center = getGeofenceCenter(editGfForm.coordinates || gf.coordinates);
                            const newCoords = generateShapeCoords(item.value, center);
                            setEditGfForm((f) => ({ ...f, coordinates: newCoords }));
                            notify(`Đã áp dụng preset ${item.label}. Bấm Lưu để xác nhận.`, 'info');
                          }}
                          variant="outlined"
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            height: 32,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        />
                      );
                    })}
                  </Stack>
                </FormControl>

                <ZonePresetPicker
                  value={editGfForm.zoneType}
                  onChange={(zoneType, color) => setEditGfForm((f) => ({ ...f, zoneType, color }))}
                />
                <GfColorRow value={editGfForm.color} onChange={(c) => setEditGfForm((f) => ({ ...f, color: c }))} />
                <ZoneSchedulePicker
                  value={editGfForm.schedule}
                  onChange={(schedule) => setEditGfForm((f) => ({ ...f, schedule }))}
                />
              </Stack>
            )}
          </Stack>
        )}
      </SideDrawer>

      {/* ── Add Geofence ── */}
      <SideDrawer
        open={addGfOpen}
        onClose={() => setAddGfOpen(false)}
        isDark={isDark}
        primaryColor={addGfForm.color || '#2563eb'}
        width={420}
        title="Thêm vùng giám sát mới"
        subtitle="Tạo vùng an toàn / vùng cấm"
        footer={
          <>
            <Button onClick={() => setAddGfOpen(false)} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}>Hủy</Button>
            <Button variant="contained" onClick={after(handleCreateGeofenceWithPreset, 'Đã thêm vùng giám sát')} disabled={!addGfForm.name} sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}>Thêm</Button>
          </>
        }
      >
        <Stack spacing={2.5}>
            <TextField
              label="Tên vùng *"
              fullWidth
              value={addGfForm.name}
              onChange={(e) => setAddGfForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Địa chỉ"
              fullWidth
              value={addGfForm.address}
              onChange={(e) => setAddGfForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="VD: 614 Điện Biên Phủ, P.25, Q.Bình Thạnh"
            />
            
            {/* Shape Presets */}
            <FormControl fullWidth>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                Dạng hình học *
              </Typography>
              <Stack direction="row" spacing={1}>
                {[
                  { value: 'square' as const, label: 'Hình vuông' },
                  { value: 'circle' as const, label: 'Hình tròn' },
                  { value: 'polygon' as const, label: 'Đa giác tự do' }
                ].map((item) => {
                  const active = shapeType === item.value;
                  return (
                    <Chip
                      key={item.value}
                      label={item.label}
                      onClick={() => setShapeType(item.value)}
                      color={active ? 'primary' : 'default'}
                      variant={active ? 'filled' : 'outlined'}
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        height: 32,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    />
                  );
                })}
              </Stack>
            </FormControl>

            <ZonePresetPicker
              value={addGfForm.zoneType}
              onChange={(zoneType, color) => setAddGfForm((f) => ({ ...f, zoneType, color }))}
            />
            <GfColorRow value={addGfForm.color} onChange={(c) => setAddGfForm((f) => ({ ...f, color: c }))} />
            <ZoneSchedulePicker
              value={addGfForm.schedule}
              onChange={(schedule) => setAddGfForm((f) => ({ ...f, schedule }))}
            />
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Vùng mới xuất hiện ở trung tâm bản đồ. Bấm "Sửa ranh giới" để điều chỉnh.
            </Alert>
          </Stack>
      </SideDrawer>
    </>
  );
}
