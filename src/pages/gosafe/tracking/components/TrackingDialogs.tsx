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
  Alert
} from '@mui/material';
import { DEVICE_PALETTE } from '../constants';
import type { TrackingStore } from '../useTracking';

interface Props {
  store: TrackingStore;
}

// ── Device form (shared by Add + Edit dialogs) ─────────────────────────────────
function DeviceFormContent({ store }: Props) {
  const { addDeviceForm, setAddDeviceForm } = store;
  const f = addDeviceForm;
  const set = (patch: Partial<typeof f>) => setAddDeviceForm((prev) => ({ ...prev, ...patch }));

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Tên thiết bị *"
          fullWidth
          value={f.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Loại</InputLabel>
          <Select
            value={f.type}
            label="Loại"
            onChange={(e) => set({ type: e.target.value as any })}
          >
            <MenuItem value="Person">Phạm nhân</MenuItem>
            <MenuItem value="Vehicle">Phương tiện</MenuItem>
            <MenuItem value="Asset">Tài sản</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          label="IMEI *"
          fullWidth
          value={f.uniqueId}
          onChange={(e) => set({ uniqueId: e.target.value })}
        />
        <TextField
          label="Số SIM"
          fullWidth
          value={f.phoneNumber}
          onChange={(e) => set({ phoneNumber: e.target.value })}
        />
      </Stack>
      <TextField
        label="Dòng thiết bị"
        fullWidth
        value={f.deviceType}
        onChange={(e) => set({ deviceType: e.target.value })}
      />

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
            <TextField
              label="Họ và tên *"
              fullWidth
              value={f.subjectFullName}
              onChange={(e) => set({ subjectFullName: e.target.value })}
            />
            <TextField
              label="CCCD/CMND"
              fullWidth
              value={f.subjectIdNumber}
              onChange={(e) => set({ subjectIdNumber: e.target.value })}
            />
          </Stack>
          <TextField
            label="Tội danh"
            fullWidth
            value={f.subjectCrime}
            onChange={(e) => set({ subjectCrime: e.target.value })}
          />
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
    handleAddGeofence
  } = store;

  const paperSx = {
    borderRadius: 4,
    bgcolor: isDark ? '#0f172a' : '#fff',
    backgroundImage: 'none'
  };

  return (
    <>
      {/* ── Add Device ── */}
      <Dialog
        open={addDeviceOpen}
        onClose={() => setAddDeviceOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: paperSx }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>Thêm thiết bị mới</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DeviceFormContent store={store} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setAddDeviceOpen(false)}
            sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDevice}
            disabled={!addDeviceForm.name || !addDeviceForm.uniqueId}
            sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
          >
            Thêm thiết bị
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Device ── */}
      <Dialog
        open={!!editDeviceId}
        onClose={() => setEditDeviceId(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: paperSx }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>Chỉnh sửa thiết bị</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DeviceFormContent store={store} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setEditDeviceId(null)}
            sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEditDevice}
            sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Remove Confirm ── */}
      <Dialog
        open={!!removeConfirmId}
        onClose={() => setRemoveConfirmId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { ...paperSx, borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xoá</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xoá thiết bị{' '}
            <b>{devices.find((d) => d.id === removeConfirmId)?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setRemoveConfirmId(null)}
            sx={{ borderRadius: 2.5, fontWeight: 600, py: 1 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleRemoveDevice(removeConfirmId!)}
            sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Subject Detail ── */}
      {(() => {
        const dev = devices.find((d) => d.id === subjectDetailId);
        const sub = dev?.subject;
        if (!dev || !sub) return null;
        const release = sub.releaseDate ? new Date(sub.releaseDate) : null;
        const daysLeft = release
          ? Math.max(0, Math.ceil((release.getTime() - Date.now()) / 86400000))
          : null;
        return (
          <Dialog
            open={!!subjectDetailId}
            onClose={() => setSubjectDetailId(null)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: paperSx }}
          >
            <DialogTitle sx={{ fontWeight: 800 }}>Hồ sơ phạm nhân</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: dev.color,
                      fontSize: '1.4rem',
                      fontWeight: 800
                    }}
                  >
                    {sub.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
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
                {sub.notes && (
                  <Box
                    sx={{
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      borderRadius: 2,
                      p: 1.5
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                      Ghi chú:
                    </Typography>
                    <Typography variant="body2">{sub.notes}</Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setSubjectDetailId(null)}
                sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      {/* ── Assign Device to Geofence ── */}
      {(() => {
        const gf = geofences.find((g) => g.id === assignGeofenceId);
        if (!gf) return null;
        return (
          <Dialog
            open={!!assignGeofenceId}
            onClose={() => setAssignGeofenceId(null)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: paperSx }}
          >
            <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>Gán thiết bị vào "{gf.name}"</DialogTitle>
            <DialogContent sx={{ pt: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Mỗi thiết bị chỉ thuộc một vùng tại một thời điểm.
              </Typography>
              <List disablePadding>
                {devices.map((dev) => {
                  const isAssigned = dev.assignedGeofenceId === gf.id;
                  const other =
                    !isAssigned && dev.assignedGeofenceId
                      ? geofences.find((g) => g.id === dev.assignedGeofenceId)?.name
                      : null;
                  return (
                    <ListItem key={dev.id} disableGutters sx={{ py: 0.5 }}>
                      <Checkbox
                        checked={isAssigned}
                        onChange={(e) =>
                          handleAssignDeviceToGeofence(dev.id, e.target.checked ? gf.id : null)
                        }
                        sx={{ color: dev.color, '&.Mui-checked': { color: dev.color } }}
                      />
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: dev.color,
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          mr: 1.5,
                          flexShrink: 0
                        }}
                      >
                        {dev.name.slice(-3)}
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
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setAssignGeofenceId(null)}
                sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
              >
                Xong
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      {/* ── Edit Geofence Info ── */}
      <Dialog
        open={!!editGfId}
        onClose={() => setEditGfId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: paperSx }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Thông tin vùng giám sát</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
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
            <GfColorRow
              value={editGfForm.color}
              onChange={(c) => setEditGfForm((f) => ({ ...f, color: c }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setEditGfId(null)}
            sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveGfInfo}
            sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Geofence ── */}
      <Dialog
        open={addGfOpen}
        onClose={() => setAddGfOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: paperSx }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Thêm vùng giám sát mới</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
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
            <GfColorRow
              value={addGfForm.color}
              onChange={(c) => setAddGfForm((f) => ({ ...f, color: c }))}
            />
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Vùng mới xuất hiện ở vị trí mặc định. Bấm "Sửa ranh giới" để điều chỉnh.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setAddGfOpen(false)}
            sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', py: 1 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleAddGeofence}
            disabled={!addGfForm.name}
            sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, px: 3 }}
          >
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
