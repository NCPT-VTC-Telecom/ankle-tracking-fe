import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { Box, Chip, Container, Grid, Stack, Typography, alpha } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, Polyline } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { FormattedMessage } from 'react-intl';
import { Location, Shield, Notification, Clock } from 'iconsax-react';

/* ─────────────────────────────── Types ─────────────────────────────── */
interface StatItem {
  value: number;
  suffix: string;
  labelKey: string;
  labelDefault: string;
  icon: React.ReactNode;
}

/* ─────────────────────── Simulated device routes ──────────────────── */
// Ho Chi Minh City center area – Quận 1 / Quận 3
const CENTER: LatLngExpression = [10.7769, 106.7009];

// Allowed zone: green circle, radius 600 m
const ALLOWED_CENTER: LatLngExpression = [10.7769, 106.7009];
const ALLOWED_RADIUS = 600;

// Restricted zone: red circle, radius 220 m
const RESTRICTED_CENTER: LatLngExpression = [10.7745, 106.6985];
const RESTRICTED_RADIUS = 220;

// Device 1 (blue) – compliant patrol around Ben Nghe area
const D1_ROUTE: LatLngExpression[] = [
  [10.7800, 106.7030],
  [10.7790, 106.7050],
  [10.7775, 106.7055],
  [10.7760, 106.7040],
  [10.7750, 106.7020],
  [10.7760, 106.7000],
  [10.7775, 106.6995],
  [10.7790, 106.7010]
];

// Device 2 (green→red) – slowly drifts toward the restricted zone
const D2_ROUTE: LatLngExpression[] = [
  [10.7800, 106.6970],
  [10.7790, 106.6975],
  [10.7780, 106.6978],
  [10.7768, 106.6980],
  [10.7758, 106.6982],
  [10.7750, 106.6983],
  [10.7744, 106.6983], // inside restricted zone
  [10.7741, 106.6982], // deeper inside
  [10.7741, 106.6982], // hold violation
  [10.7741, 106.6982]  // hold violation
];

// Device 3 (orange) – stationary house-arrest subject
const D3_POS: LatLngExpression = [10.7730, 106.7025];

/* ─────────────────── Haversine distance helper ──────────────────── */
function haversineKm(a: LatLngExpression, b: LatLngExpression): number {
  const [lat1, lon1] = a as [number, number];
  const [lat2, lon2] = b as [number, number];
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const a2 = sinLat * sinLat + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

/* ─────────────────── Counter component ───────────────────────────── */
function AnimatedCounter({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const steps = 60;
    const step = duration / steps;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setCount(Math.round((target * i) / steps));
      if (i >= steps) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─────────────────────── Main component ──────────────────────────── */
interface Props {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const LiveDemoSection = ({ primaryColor }: Props) => {
  /* Always dark section for dramatic effect */
  const bg = '#020617';
  const surface = '#0f172a';
  const border = alpha('#fff', 0.08);

  /* Simulation state */
  const [tick, setTick] = useState(0);
  const [mapMounted, setMapMounted] = useState(false);

  /* Advance simulation every 2.8 s */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % D2_ROUTE.length), 2800);
    return () => clearInterval(id);
  }, []);

  const d1Pos = D1_ROUTE[tick % D1_ROUTE.length];
  const d2Pos = D2_ROUTE[tick];
  const d2Violating = haversineKm(d2Pos, RESTRICTED_CENTER) * 1000 < RESTRICTED_RADIUS;

  /* Stats */
  const stats: StatItem[] = [
    {
      value: 500,
      suffix: '+',
      labelKey: 'gosafe-demo-stat-devices',
      labelDefault: 'Devices Monitored',
      icon: <Location size={22} color={primaryColor} variant="Bold" />
    },
    {
      value: 999,
      suffix: '‰',
      labelKey: 'gosafe-demo-stat-uptime',
      labelDefault: '99.9% Uptime',
      icon: <Shield size={22} color="#22c55e" variant="Bold" />
    },
    {
      value: 3,
      suffix: 's',
      labelKey: 'gosafe-demo-stat-alert',
      labelDefault: 'Alert Response',
      icon: <Notification size={22} color="#f59e0b" variant="Bold" />
    },
    {
      value: 24,
      suffix: '/7',
      labelKey: 'gosafe-demo-stat-support',
      labelDefault: 'Live Support',
      icon: <Clock size={22} color="#a78bfa" variant="Bold" />
    }
  ];

  /* Tile URL for dark map */
  const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const tileAttribution = '&copy; <a href="https://carto.com/">CARTO</a>';

  return (
    <Box
      component="section"
      id="live-demo"
      sx={{ bgcolor: bg, py: { xs: 10, md: 14 }, position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient glow blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          left: '10%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(primaryColor, 0.18)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          right: '8%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#ef4444', 0.14)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <Stack alignItems="center" spacing={2} mb={7}>
            <Chip
              label={<FormattedMessage id="gosafe-demo-chip" defaultMessage="LIVE DEMO" />}
              size="small"
              sx={{
                bgcolor: alpha(primaryColor, 0.15),
                color: primaryColor,
                fontWeight: 700,
                letterSpacing: 1.5,
                fontSize: '0.7rem',
                border: `1px solid ${alpha(primaryColor, 0.3)}`
              }}
            />
            <Typography
              variant="h3"
              fontWeight={800}
              textAlign="center"
              sx={{ color: '#f8fafc', lineHeight: 1.2, maxWidth: 640 }}
            >
              <FormattedMessage id="gosafe-demo-title" defaultMessage="See the System in Action" />
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ color: alpha('#f8fafc', 0.6), maxWidth: 520, lineHeight: 1.7 }}
            >
              <FormattedMessage
                id="gosafe-demo-subtitle"
                defaultMessage="Watch live how GoSafe tracks multiple offenders simultaneously, enforces geofences, and triggers instant alerts — all in real time."
              />
            </Typography>
          </Stack>
        </motion.div>

        {/* ── Stat counters ── */}
        <Grid container spacing={3} mb={6}>
          {stats.map((s, i) => (
            <Grid item xs={6} md={3} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Box
                  sx={{
                    bgcolor: surface,
                    border: `1px solid ${border}`,
                    borderRadius: 2,
                    p: { xs: 2.5, md: 3 },
                    textAlign: 'center',
                    height: '100%',
                    transition: 'border-color 0.3s',
                    '&:hover': { borderColor: alpha(primaryColor, 0.4) }
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1.25,
                      borderRadius: 1.5,
                      bgcolor: alpha('#fff', 0.05),
                      mb: 1.5
                    }}
                  >
                    {s.icon}
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ color: '#f8fafc', lineHeight: 1, mb: 0.5, fontSize: { xs: '1.6rem', md: '2rem' } }}
                  >
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#f8fafc', 0.55), fontSize: '0.82rem' }}>
                    <FormattedMessage id={s.labelKey} defaultMessage={s.labelDefault} />
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* ── Map + Legend ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          onViewportEnter={() => setMapMounted(true)}
        >
          <Box
            sx={{
              bgcolor: surface,
              border: `1px solid ${border}`,
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            {/* Map header */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 3, py: 2, borderBottom: `1px solid ${border}` }}
              flexWrap="wrap"
              gap={1}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#22c55e',
                    boxShadow: '0 0 8px #22c55e'
                  }}
                />
                <Typography variant="body2" fontWeight={600} sx={{ color: '#f8fafc' }}>
                  <FormattedMessage id="gosafe-demo-map-title" defaultMessage="Live Tracking Simulation" />
                </Typography>
              </Stack>

              {/* Legend */}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {[
                  { color: '#3b82f6', label: 'gosafe-demo-legend-compliant', def: 'Compliant' },
                  {
                    color: d2Violating ? '#ef4444' : '#22c55e',
                    label: 'gosafe-demo-legend-monitored',
                    def: 'Monitored',
                    pulse: d2Violating
                  },
                  { color: '#f97316', label: 'gosafe-demo-legend-stationary', def: 'House Arrest' },
                  { color: '#22c55e', label: 'gosafe-demo-legend-allowed', def: 'Allowed Zone', dashed: true },
                  { color: '#ef4444', label: 'gosafe-demo-legend-restricted', def: 'Restricted Zone', dashed: true }
                ].map((l, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={0.75}>
                    <Box
                      sx={{
                        width: l.dashed ? 14 : 9,
                        height: l.dashed ? 3 : 9,
                        borderRadius: l.dashed ? 0 : '50%',
                        bgcolor: l.color,
                        border: l.dashed ? 'none' : 'none',
                        borderTop: l.dashed ? `2px dashed ${l.color}` : 'none',
                        opacity: l.dashed ? 0.9 : 1,
                        ...(l.pulse && { boxShadow: `0 0 0 3px ${alpha('#ef4444', 0.3)}` }),
                        animation: l.pulse ? 'gs-pulse-dot 1s ease-in-out infinite' : 'none'
                      }}
                    />
                    <Typography variant="caption" sx={{ color: alpha('#f8fafc', 0.5), whiteSpace: 'nowrap' }}>
                      <FormattedMessage id={l.label} defaultMessage={l.def} />
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>

            {/* Map container */}
            <Box sx={{ position: 'relative', height: { xs: 360, md: 460 } }}>
              {mapMounted && (
                <MapContainer
                  center={CENTER}
                  zoom={14}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  attributionControl={false}
                  className="gs-leaflet-map"
                >
                  <TileLayer url={tileUrl} attribution={tileAttribution} />

                  {/* Allowed zone (green) */}
                  <Circle
                    center={ALLOWED_CENTER}
                    radius={ALLOWED_RADIUS}
                    pathOptions={{
                      color: '#22c55e',
                      fillColor: '#22c55e',
                      fillOpacity: 0.06,
                      weight: 1.5,
                      dashArray: '6 4'
                    }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -ALLOWED_RADIUS / 100]}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e' }}>Allowed Zone</span>
                    </Tooltip>
                  </Circle>

                  {/* Restricted zone (red) */}
                  <Circle
                    center={RESTRICTED_CENTER}
                    radius={RESTRICTED_RADIUS}
                    pathOptions={{
                      color: '#ef4444',
                      fillColor: '#ef4444',
                      fillOpacity: 0.12,
                      weight: 2,
                      dashArray: '5 4'
                    }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -RESTRICTED_RADIUS / 100]}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>⛔ Restricted Zone</span>
                    </Tooltip>
                  </Circle>

                  {/* Device 1 trail */}
                  <Polyline
                    positions={D1_ROUTE.slice(0, (tick % D1_ROUTE.length) + 1)}
                    pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.5, dashArray: '4 3' }}
                  />

                  {/* Device 1 – compliant (blue) */}
                  <CircleMarker
                    center={d1Pos}
                    radius={9}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>VTC-G001 ✅</span>
                    </Tooltip>
                  </CircleMarker>

                  {/* Device 2 trail */}
                  <Polyline
                    positions={D2_ROUTE.slice(0, tick + 1)}
                    pathOptions={{
                      color: d2Violating ? '#ef4444' : '#22c55e',
                      weight: 2,
                      opacity: 0.55,
                      dashArray: '4 3'
                    }}
                  />

                  {/* Device 2 – approaching/violating restricted zone */}
                  <CircleMarker
                    center={d2Pos}
                    radius={9}
                    pathOptions={{
                      color: d2Violating ? '#ef4444' : '#22c55e',
                      fillColor: d2Violating ? '#ef4444' : '#22c55e',
                      fillOpacity: 1,
                      weight: d2Violating ? 3 : 2
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>
                        {d2Violating ? '⚠️ VTC-G002 VIOLATION' : 'VTC-G002 👀'}
                      </span>
                    </Tooltip>
                  </CircleMarker>

                  {/* Device 3 – stationary (orange) */}
                  <CircleMarker
                    center={D3_POS}
                    radius={8}
                    pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 1, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>VTC-G003 🏠</span>
                    </Tooltip>
                  </CircleMarker>
                </MapContainer>
              )}

              {/* Violation alert overlay */}
              {d2Violating && (
                <Box
                  className="gs-blink"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    bgcolor: alpha('#ef4444', 0.92),
                    color: '#fff',
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    boxShadow: `0 0 24px ${alpha('#ef4444', 0.6)}`,
                    pointerEvents: 'none',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#fff',
                      flexShrink: 0,
                      animation: 'gs-pulse-dot 0.8s ease-in-out infinite'
                    }}
                  />
                  <Typography variant="body2" fontWeight={700} sx={{ letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                    ⚠️{' '}
                    <FormattedMessage
                      id="gosafe-demo-violation-alert"
                      defaultMessage="GEOFENCE VIOLATION — VTC-G002 entered restricted zone"
                    />
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Map footer */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 3, py: 1.5, borderTop: `1px solid ${border}` }}
              flexWrap="wrap"
              gap={1}
            >
              <Typography variant="caption" sx={{ color: alpha('#f8fafc', 0.4) }}>
                <FormattedMessage
                  id="gosafe-demo-map-note"
                  defaultMessage="Simulation only — positions are illustrative. Real system tracks live GPS coordinates."
                />
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <Typography variant="caption" sx={{ color: alpha('#f8fafc', 0.4) }}>
                  3{' '}
                  <FormattedMessage id="gosafe-demo-active-devices" defaultMessage="devices active" />
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </motion.div>

        {/* ── Feature list ── */}
        <Grid container spacing={3} mt={4}>
          {[
            {
              icon: '📡',
              titleKey: 'gosafe-demo-feat-1-title',
              titleDef: 'Real-time GPS Tracking',
              descKey: 'gosafe-demo-feat-1-desc',
              descDef: 'Sub-second location updates for every monitored device, displayed on a live map with movement trails.'
            },
            {
              icon: '🔴',
              titleKey: 'gosafe-demo-feat-2-title',
              titleDef: 'Instant Geofence Alerts',
              descKey: 'gosafe-demo-feat-2-desc',
              descDef: 'Automatic detection and multi-channel notification (web, SMS, email) within 3 seconds of a violation.'
            },
            {
              icon: '📊',
              titleKey: 'gosafe-demo-feat-3-title',
              titleDef: 'History & Reports',
              descKey: 'gosafe-demo-feat-3-desc',
              descDef: 'Full route replay, stop analysis, and exportable PDF / Excel reports for legal compliance.'
            },
            {
              icon: '🛡️',
              titleKey: 'gosafe-demo-feat-4-title',
              titleDef: 'Tamper Detection',
              descKey: 'gosafe-demo-feat-4-desc',
              descDef: 'Fiber-optic strap integrity monitored continuously — any cut or removal triggers an immediate alarm.'
            }
          ].map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                style={{ height: '100%' }}
              >
                <Box
                  sx={{
                    bgcolor: surface,
                    border: `1px solid ${border}`,
                    borderRadius: 2,
                    p: 3,
                    height: '100%',
                    transition: 'border-color 0.3s, transform 0.3s',
                    '&:hover': {
                      borderColor: alpha(primaryColor, 0.35),
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Typography fontSize="1.8rem" mb={1.5}>
                    {f.icon}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f8fafc', mb: 0.75 }}>
                    <FormattedMessage id={f.titleKey} defaultMessage={f.titleDef} />
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#f8fafc', 0.55), lineHeight: 1.65 }}>
                    <FormattedMessage id={f.descKey} defaultMessage={f.descDef} />
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LiveDemoSection;
