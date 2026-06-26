import dagre from '@dagrejs/dagre';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MainCard from 'shared/components/MainCard';
import useHandleTopology from 'shared/hooks/useHandleTopology';
import { Activity, ArrowDown2, ArrowUp2, People, Routing2, StatusUp, Wifi } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { ENV } from 'settings';
import { ThemeMode } from 'shared/types';
import { AccessPoint, Controller, Region, TopologySite } from 'shared/types/topology';
import { normalizeDate } from 'shared/utils/handleData';

interface TopologyViewProps {
  regionId?: string;
  controllerId?: string;
  siteId?: string;
  includeClients?: boolean;
  clusterSize?: number;
}

interface NodeDetailData {
  type: 'controller' | 'ap' | 'clientGroup' | 'apCluster' | 'site' | null;
  data: any;
}

const STATUS_MAP: Record<string, { label: string; color: string; id: number }> = {
  online: { label: 'Online', color: '#4caf50', id: 8 },
  offline: { label: 'Offline', color: '#f44336', id: 7 },
  pending: { label: 'Pending', color: '#ff9800', id: 9 },
  heartbeat_missed: { label: 'Heartbeat Missed', color: '#ff5722', id: 10 },
  isolated: { label: 'Isolated', color: '#9e9e9e', id: 11 },
  unknown: { label: 'Unknown', color: '#9e9e9e', id: 7 }
};

const IS_STAGING = ENV === 'staging';

const getStatusInfo = (status: string) => {
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  return STATUS_MAP[normalizedStatus] || STATUS_MAP.unknown;
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const g = new dagre.graphlib.Graph({
    directed: true,
    multigraph: false,
    compound: false
  }).setDefaultEdgeLabel(() => ({}));

  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 250, height: 150 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 75
      }
    };
  });

  return layoutedNodes;
};

// Site Node
const SiteNode = ({ data, id }: any) => {
  const theme = useTheme();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onNodeClick) {
      data.onNodeClick({ type: 'site', data });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onToggleSiteCollapse?.(id);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#9c27b0', width: 10, height: 10 }} />

      <MainCard
        content={false}
        onClick={handleClick}
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.mode === ThemeMode.DARK ? '#ffffff' : '#4a148c',
          borderRadius: 2,
          p: 2,
          minWidth: 240,
          boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
            borderColor: '#9c27b0'
          },
          position: 'relative'
        }}
      >
        {data.aps > 0 && (
          <IconButton
            onClick={handleToggle}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              color: '#9c27b0',
              width: 26,
              height: 26,
              '&:hover': {
                bgcolor: '#f3e5f5'
              }
            }}
          >
            <Typography variant="caption" fontWeight="700">
              {data.isCollapsed ? '+' : '−'}
            </Typography>
          </IconButton>
        )}

        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Avatar
            sx={{
              bgcolor: '#f3e5f5',
              color: '#9c27b0',
              width: 40,
              height: 40,
              border: '1px solid #e1bee7'
            }}
          >
            <People size={22} variant="Bold" />
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight="700" noWrap>
              {data.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.aps} APs • {data.clients} clients
            </Typography>
          </Box>
        </Stack>
      </MainCard>

      <Handle type="source" position={Position.Bottom} style={{ background: '#9c27b0', width: 10, height: 10 }} />
    </>
  );
};

// Floor/Cluster Node
const APClusterNode = ({ data, id }: any) => {
  const theme = useTheme();
  const onlineCount = data.aps.filter((ap: any) => ap.status?.toLowerCase() === 'online').length;
  const offlineCount = data.aps.length - onlineCount;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onToggleExpand(id);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#ff9800', width: 10, height: 10 }} />

      <MainCard
        content={false}
        onClick={handleClick}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          p: 2,
          minWidth: 220,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            borderColor: '#ff9800'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.2} alignItems="center" flex={1}>
              <Avatar
                sx={{
                  bgcolor: '#fff3e0',
                  color: '#ff9800',
                  width: 38,
                  height: 38,
                  border: '1px solid #ffe0b2'
                }}
              >
                <Wifi size="20" variant="Bold" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {data.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.aps.length} Access Points
                </Typography>
              </Box>
            </Stack>

            <IconButton
              size="small"
              sx={{
                border: '1px solid',
                borderColor: data.isExpanded ? '#e57373' : '#81c784',
                bgcolor: theme.palette.background.default,
                '&:hover': { bgcolor: '#fafafa' }
              }}
              onClick={handleClick}
            >
              {data.isExpanded ? <ArrowUp2 size="18" color="#e57373" /> : <ArrowDown2 size="18" color="#81c784" />}
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip
              label={`${onlineCount} Online`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: '#e8f5e9',
                color: '#388e3c',
                borderRadius: 1
              }}
            />
            {offlineCount > 0 && (
              <Chip
                label={`${offlineCount} Offline`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: '#ffebee',
                  color: '#d32f2f',
                  borderRadius: 1
                }}
              />
            )}
          </Stack>

          <Box sx={{ pt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.3} sx={{ fontWeight: 500 }}>
              Total: {data.totalClients} clients
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(onlineCount / data.aps.length) * 100}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: '#f5f5f5',
                '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' }
              }}
            />
          </Box>
        </Stack>
      </MainCard>

      <Handle type="source" position={Position.Bottom} style={{ background: '#ff9800', width: 10, height: 10 }} />
    </>
  );
};

// AP Node
const APNode = ({ data }: any) => {
  const theme = useTheme();
  const statusInfo = getStatusInfo(data.status);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onNodeClick) {
      data.onNodeClick({ type: 'ap', data });
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: statusInfo.color, width: 10, height: 10 }} />
      <MainCard
        content={false}
        onClick={handleClick}
        sx={{
          bgcolor: theme.palette.background.paper,
          border: '3px solid',
          borderColor: statusInfo.color,
          borderRadius: 2,
          p: 1.5,
          minWidth: 200,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-2px)' },
          transition: 'all 0.3s ease'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
          <Avatar sx={{ bgcolor: statusInfo.color, width: 40, height: 40 }}>
            <Wifi size={24} variant="Bold" />
          </Avatar>
          <Box flex={1}>
            <Typography variant="body1" fontWeight="700" noWrap>
              {data.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.ip || 'N/A'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              bgcolor: statusInfo.color,
              color: 'white',
              fontWeight: 600
            }}
          />
          <Chip label={`${data.clients} clients`} size="small" icon={<People size={14} />} sx={{ height: 22, fontSize: '0.7rem' }} />
        </Stack>
      </MainCard>
      <Handle type="source" position={Position.Bottom} style={{ background: statusInfo.color, width: 10, height: 10 }} />
    </>
  );
};

// Controller Node
const ControllerNode = ({ data, id }: any) => {
  const theme = useTheme();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onNodeClick) {
      data.onNodeClick({ type: 'controller', data });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onToggleCollapse?.(id);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#3f51b5', width: 10, height: 10 }} />

      <MainCard
        content={false}
        onClick={handleClick}
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.mode === ThemeMode.DARK ? '#ffffff' : '#1a237e',
          borderRadius: 2,
          p: 2.5,
          minWidth: 260,
          boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
            borderColor: '#3f51b5'
          },
          position: 'relative'
        }}
      >
        {data.aps > 0 && (
          <IconButton
            onClick={handleToggle}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              color: '#3f51b5',
              width: 26,
              height: 26,
              '&:hover': {
                bgcolor: '#e8eaf6'
              }
            }}
          >
            <Typography variant="caption" fontWeight="700">
              {data.isCollapsed ? '+' : '−'}
            </Typography>
          </IconButton>
        )}

        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Avatar
            sx={{
              bgcolor: '#e8eaf6',
              color: '#3f51b5',
              width: 44,
              height: 44,
              border: '1px solid #c5cae9'
            }}
          >
            <Routing2 size={24} variant="Bold" />
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight="700" noWrap>
              {data.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.ip || 'N/A'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ borderColor: theme.palette.divider, mb: 1.5 }} />

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                textAlign: 'center',
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === ThemeMode.DARK ? theme.palette.background.default : '#f8f9fa'
              }}
            >
              <Typography variant="h6" fontWeight="700" color={theme.palette.mode === ThemeMode.DARK ? '#ffffff' : '#1a237e'}>
                {data.aps}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                APs
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: theme.palette.mode === ThemeMode.DARK ? theme.palette.background.default : '#f8f9fa',
                p: 1,
                textAlign: 'center',
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="h6" fontWeight="700" color={theme.palette.mode === ThemeMode.DARK ? '#ffffff' : '#1a237e'}>
                {data.clients}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Clients
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </MainCard>

      <Handle type="source" position={Position.Bottom} style={{ background: '#3f51b5', width: 10, height: 10 }} />
    </>
  );
};

// Client Group Node
const ClientGroupNode = ({ data }: any) => {
  const theme = useTheme();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onNodeClick) {
      data.onNodeClick({ type: 'clientGroup', data });
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#2196f3', width: 10, height: 10 }} />
      <Box
        onClick={handleClick}
        sx={{
          bgcolor: theme.palette.mode === ThemeMode.DARK ? theme.palette.background.default : '#e3f2fd',
          border: '2px dashed #2196f3',
          borderRadius: 2,
          p: 1.5,
          minWidth: 140,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#bbdefb', transform: 'scale(1.05)' },
          transition: 'all 0.2s'
        }}
      >
        <Avatar sx={{ bgcolor: '#2196f3', width: 36, height: 36, mx: 'auto', mb: 1 }}>
          <People size={20} variant="Bold" />
        </Avatar>
        <Typography variant="body2" fontWeight="600">
          {data.label}
        </Typography>
        <Chip label={`${data.count} devices`} size="small" color="primary" sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }} />
      </Box>
    </>
  );
};

// Detail Dialog Component
const NodeDetailDialog = ({ open, nodeDetail, onClose }: any) => {
  if (!nodeDetail.data) {
    return null;
  }

  const renderControllerDetails = () => (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: '#667eea' }}>
            <Routing2 size={24} />
          </Avatar>
          <Typography variant="h4">{nodeDetail.data.label}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                <TableCell>{nodeDetail.data.ip || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total APs</TableCell>
                <TableCell>{nodeDetail.data.aps}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total Clients</TableCell>
                <TableCell>{nodeDetail.data.clients}</TableCell>
              </TableRow>
              {nodeDetail.data.fullData?.region_id && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Region ID</TableCell>
                  <TableCell>{nodeDetail.data.fullData.region_id}</TableCell>
                </TableRow>
              )}
              {nodeDetail.data.fullData?.status && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell>
                    <Chip label={getStatusInfo(nodeDetail.data.fullData.status).label} color="success" size="small" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </>
  );

  const renderSiteDetails = () => (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: '#9c27b0' }}>
            <People size={24} />
          </Avatar>
          <Typography variant="h4">{nodeDetail.data.label}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total APs</TableCell>
                <TableCell>{nodeDetail.data.aps}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total Clients</TableCell>
                <TableCell>{nodeDetail.data.clients}</TableCell>
              </TableRow>
              {nodeDetail.data.fullData?.location && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell>{nodeDetail.data.fullData.location}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </>
  );

  const renderAPDetails = () => (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: getStatusInfo(nodeDetail.data.status).color }}>
            <Wifi size={24} />
          </Avatar>
          <Typography variant="h4">{nodeDetail.data.label}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                <TableCell>{nodeDetail.data.ip || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusInfo(nodeDetail.data.status).label}
                    sx={{ bgcolor: getStatusInfo(nodeDetail.data.status).color, color: 'white' }}
                    size="small"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Connected Clients</TableCell>
                <TableCell>{nodeDetail.data.clients}</TableCell>
              </TableRow>
              {nodeDetail.data.fullData?.mac_address && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>MAC Address</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{nodeDetail.data.fullData.mac_address}</TableCell>
                </TableRow>
              )}
              {nodeDetail.data.fullData?.model && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                  <TableCell>{nodeDetail.data.fullData.model}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </>
  );

  const renderClusterDetails = () => (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: '#ff9800' }}>
            <Wifi size={24} />
          </Avatar>
          <Typography variant="h4">{nodeDetail.data.label}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total APs</TableCell>
                <TableCell>{nodeDetail.data.aps?.length || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total Clients</TableCell>
                <TableCell>{nodeDetail.data.totalClients}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Status Overview</TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Chip
                      label={`${nodeDetail.data.aps?.filter((ap: any) => ap.status?.toLowerCase() === 'online').length || 0} Online`}
                      sx={{ bgcolor: '#4caf50', color: 'white' }}
                      size="small"
                    />
                    {nodeDetail.data.aps?.filter((ap: any) => ap.status?.toLowerCase() !== 'online').length > 0 && (
                      <Chip
                        label={`${nodeDetail.data.aps?.filter((ap: any) => ap.status?.toLowerCase() !== 'online').length || 0} Offline`}
                        sx={{ bgcolor: '#f44336', color: 'white' }}
                        size="small"
                      />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {nodeDetail.data.aps && nodeDetail.data.aps.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              Access Points in this {IS_STAGING ? 'Site' : 'Floor'}
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableBody>
                  {nodeDetail.data.aps.map((ap: any) => (
                    <TableRow key={ap.id}>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{ap.name}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        <Chip
                          label={getStatusInfo(ap.status).label}
                          sx={{ bgcolor: getStatusInfo(ap.status).color, color: 'white' }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', textAlign: 'right' }}>{ap.connections?.total_clients || 0} clients</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
    </>
  );

  const renderClientGroupDetails = () => (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: '#2196f3' }}>
            <People size={24} />
          </Avatar>
          <Typography variant="h4">Clients connected to {nodeDetail.data.apInfo?.name}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Access Point Information
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '40%' }}>AP Name</TableCell>
                    <TableCell>{nodeDetail.data.apInfo?.name || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>MAC Address</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{nodeDetail.data.apInfo?.mac || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                    <TableCell>{nodeDetail.data.apInfo?.ip || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Total Clients</TableCell>
                    <TableCell>
                      <Chip label={nodeDetail.data.count} color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Connected Devices ({nodeDetail.data.fullData?.length || 0})
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small">
                {nodeDetail.data.fullData && nodeDetail.data.fullData.length > 0 ? (
                  <TableBody>
                    {nodeDetail.data.fullData.map((client: any, idx: number) => (
                      <Box key={idx} sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                              <People size={20} />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {client.device_name || client.hostname || 'Unknown Device'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {client.mac_address}
                              </Typography>
                            </Box>
                          </Stack>

                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', width: '40%' }}>IP Address</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{client.ip_address || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Device Type</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                  <Chip label={client.device_type || 'Unknown'} size="small" variant="outlined" />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Signal Strength</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                  <Chip
                                    label={`${client.signal_strength || client.connection_quality?.rssi} dBm`}
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        client.signal_strength > -60 ? '#4caf50' : client.signal_strength > -75 ? '#ff9800' : '#f44336',
                                      color: 'white'
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>SSID</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{client.ssid || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Channel</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{client.channel || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Connection Time</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{new Date(client.connection_time).toLocaleString()}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Session Duration</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                  {Math.floor(client.session_duration_seconds / 60)}m {client.session_duration_seconds % 60}s
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Download</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                  {(client.bandwidth?.download_mbps / 1000000).toFixed(2)} Mbps
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Upload</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                  {(client.bandwidth?.upload_mbps / 1000000).toFixed(2)} Mbps
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Packet Loss</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{client.connection_quality?.packet_loss || 0}%</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Stack>
                      </Box>
                    ))}
                  </TableBody>
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={2} sx={{ textAlign: 'center', py: 2 }}>
                        No clients connected
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      </DialogContent>
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {nodeDetail.type === 'controller' && renderControllerDetails()}
      {nodeDetail.type === 'site' && renderSiteDetails()}
      {nodeDetail.type === 'ap' && renderAPDetails()}
      {nodeDetail.type === 'apCluster' && renderClusterDetails()}
      {nodeDetail.type === 'clientGroup' && renderClientGroupDetails()}
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const nodeTypes = {
  ap: APNode,
  controller: ControllerNode,
  clientGroup: ClientGroupNode,
  apCluster: APClusterNode,
  site: SiteNode
};

const TopologyView = ({ regionId, controllerId, siteId, includeClients = true }: TopologyViewProps) => {
  const intl = useIntl();
  const { fetchTopologyData, refreshTopology, isLoadingTopology, topologyData, timestamp } = useHandleTopology();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [collapsedSites, setCollapsedSites] = useState<Set<string>>(new Set());
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<NodeDetailData>({ type: null, data: null });
  const [openDetail, setOpenDetail] = useState(false);
  const theme = useTheme();
  const handleNodeClick = useCallback((nodeDetail: NodeDetailData) => {
    console.log({ nodeDetail });
    setSelectedNode(nodeDetail);
    setOpenDetail(true);
  }, []);

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const newSet = new Set(prev);
      newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
      return newSet;
    });
  }, []);

  const toggleSiteCollapse = useCallback((siteId: string) => {
    setCollapsedSites((prev) => {
      const newSet = new Set(prev);
      newSet.has(siteId) ? newSet.delete(siteId) : newSet.add(siteId);
      return newSet;
    });
  }, []);

  const toggleClusterExpand = useCallback((clusterId: string) => {
    setExpandedClusters((prev) => {
      const newSet = new Set(prev);
      newSet.has(clusterId) ? newSet.delete(clusterId) : newSet.add(clusterId);
      return newSet;
    });
  }, []);

  useEffect(() => {
    fetchTopologyData({ regionId, controllerId, siteId, includeClients, realtime: false });
  }, [regionId, controllerId, siteId, includeClients]);

  useEffect(() => {
    if (topologyData) {
      generateNodesAndEdges(topologyData);
    }
  }, [topologyData, collapsedNodes, collapsedSites, expandedClusters]);

  const extractFloorFromName = (name: string) => {
    const match = name.match(/-(\d+)/);
    const floorNum = match ? parseInt(match[1], 10) : NaN;
    if (floorNum >= 1 && floorNum <= 4) return floorNum.toString();
    return 'Khác';
  };

  const generateNodesAndEdges = useCallback(
    async (data: any) => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      data.regions.forEach((region: Region) => {
        region.controllers.forEach((controller: Controller) => {
          if (!controller.sites?.length || controller.total_aps === 0) return;

          const controllerId = `controller-${controller.id}`;
          const isControllerCollapsed = collapsedNodes.has(controllerId);

          newNodes.push({
            id: controllerId,
            type: 'controller',
            data: {
              label: controller.name,
              ip: controller.ip_address,
              aps: controller.total_aps,
              clients: controller.total_clients,
              isCollapsed: isControllerCollapsed,
              onToggleCollapse: toggleNodeCollapse,
              onNodeClick: handleNodeClick,
              fullData: controller
            },
            position: { x: 0, y: 0 }
          });

          if (isControllerCollapsed) return;

          // Process each site
          controller.sites.forEach((site: TopologySite) => {
            const siteNodeId = `site-${site.id}`;
            const isSiteCollapsed = collapsedSites.has(siteNodeId);
            const siteAps = site.access_points || [];
            const siteTotalClients = siteAps.reduce((sum, ap) => sum + ap.connections.total_clients, 0);

            newNodes.push({
              id: siteNodeId,
              type: 'site',
              data: {
                label: site.name || `Site ${site.id}`,
                aps: siteAps.length,
                clients: siteTotalClients,
                isCollapsed: isSiteCollapsed,
                onToggleSiteCollapse: toggleSiteCollapse,
                onNodeClick: handleNodeClick,
                fullData: site
              },
              position: { x: 0, y: 0 }
            });

            newEdges.push({
              id: `edge-${controllerId}-${siteNodeId}`,
              source: controllerId,
              target: siteNodeId,
              type: 'default',
              style: { stroke: '#9c27b0', strokeWidth: 3 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#9c27b0', width: 20, height: 20 }
            });

            if (isSiteCollapsed) return;

            // If NOT staging, group APs by floor
            if (!IS_STAGING) {
              const apsByFloor = siteAps.reduce((acc: Record<string, AccessPoint[]>, ap) => {
                const floor = extractFloorFromName(ap.name);
                if (!acc[floor]) acc[floor] = [];
                acc[floor].push(ap);
                return acc;
              }, {});

              Object.entries(apsByFloor).forEach(([floor, apsOnFloor]) => {
                const floorId = `floor-${site.id}-${floor}`;
                const isExpanded = expandedClusters.has(floorId);
                const totalClients = apsOnFloor.reduce((sum, ap) => sum + ap.connections.total_clients, 0);

                newNodes.push({
                  id: floorId,
                  type: 'apCluster',
                  data: {
                    label: floor === 'Khác' ? 'Khác' : `Tầng ${floor}`,
                    aps: apsOnFloor,
                    totalClients,
                    isExpanded,
                    onToggleExpand: toggleClusterExpand,
                    onNodeClick: handleNodeClick
                  },
                  position: { x: 0, y: 0 }
                });

                newEdges.push({
                  id: `edge-${siteNodeId}-${floorId}`,
                  source: siteNodeId,
                  target: floorId,
                  type: 'default',
                  style: { stroke: '#ff9800', strokeWidth: 3 },
                  markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800', width: 20, height: 20 }
                });

                if (isExpanded) {
                  apsOnFloor.forEach((ap) => {
                    const apId = `ap-${ap.id}`;
                    const apStatusInfo = getStatusInfo(ap.status);

                    newNodes.push({
                      id: apId,
                      type: 'ap',
                      data: {
                        label: ap.name,
                        ip: ap.ip_address,
                        status: ap.status,
                        clients: ap.connections.total_clients,
                        onNodeClick: handleNodeClick,
                        fullData: ap
                      },
                      position: { x: 0, y: 0 }
                    });

                    newEdges.push({
                      id: `edge-${floorId}-${apId}`,
                      source: floorId,
                      target: apId,
                      type: 'default',
                      animated: ap.status?.toLowerCase() === 'online',
                      style: { stroke: apStatusInfo.color, strokeWidth: 3 },
                      markerEnd: { type: MarkerType.ArrowClosed, color: apStatusInfo.color, width: 20, height: 20 }
                    });

                    if (includeClients && ap.connections.total_clients > 0) {
                      const clientGroupId = `clients-${ap.id}`;
                      newNodes.push({
                        id: clientGroupId,
                        type: 'clientGroup',
                        data: {
                          label: 'Client Group',
                          count: ap.connections.total_clients,
                          onNodeClick: handleNodeClick,
                          fullData: ap.connected_clients || [],
                          apInfo: { name: ap.name, mac: ap.mac_address, ip: ap.ip_address }
                        },
                        position: { x: 0, y: 0 }
                      });

                      newEdges.push({
                        id: `edge-${apId}-${clientGroupId}`,
                        source: apId,
                        target: clientGroupId,
                        type: 'smoothstep',
                        style: { stroke: '#2196f3', strokeWidth: 2, strokeDasharray: '8 4' },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#2196f3', width: 18, height: 18 }
                      });
                    }
                  });
                }
              });
            } else {
              // If STAGING, show APs directly under site (no floor grouping)
              siteAps.forEach((ap) => {
                const apId = `ap-${ap.id}`;
                const apStatusInfo = getStatusInfo(ap.status);

                newNodes.push({
                  id: apId,
                  type: 'ap',
                  data: {
                    label: ap.name,
                    ip: ap.ip_address,
                    status: ap.status,
                    clients: ap.connections.total_clients,
                    onNodeClick: handleNodeClick,
                    fullData: ap
                  },
                  position: { x: 0, y: 0 }
                });

                newEdges.push({
                  id: `edge-${siteNodeId}-${apId}`,
                  source: siteNodeId,
                  target: apId,
                  type: 'default',
                  animated: ap.status?.toLowerCase() === 'online',
                  style: { stroke: apStatusInfo.color, strokeWidth: 3 },
                  markerEnd: { type: MarkerType.ArrowClosed, color: apStatusInfo.color, width: 20, height: 20 }
                });

                if (includeClients && ap.connections.total_clients > 0) {
                  const clientGroupId = `clients-${ap.id}`;
                  newNodes.push({
                    id: clientGroupId,
                    type: 'clientGroup',
                    data: {
                      label: 'Client Group',
                      count: ap.connections.total_clients,
                      onNodeClick: handleNodeClick,
                      fullData: ap.connected_clients || [],
                      apInfo: { name: ap.name, mac: ap.mac_address, ip: ap.ip_address }
                    },
                    position: { x: 0, y: 0 }
                  });

                  newEdges.push({
                    id: `edge-${apId}-${clientGroupId}`,
                    source: apId,
                    target: clientGroupId,
                    type: 'smoothstep',
                    style: { stroke: '#2196f3', strokeWidth: 2, strokeDasharray: '8 4' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#2196f3', width: 18, height: 18 }
                  });
                }
              });
            }
          });
        });
      });

      const layoutedNodes = getLayoutedElements(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(newEdges);
    },
    [
      includeClients,
      setNodes,
      setEdges,
      toggleNodeCollapse,
      toggleSiteCollapse,
      toggleClusterExpand,
      collapsedNodes,
      collapsedSites,
      expandedClusters,
      handleNodeClick
    ]
  );

  const handleRefresh = async () => {
    await refreshTopology({ regionId, controllerId, siteId, includeClients });
  };

  if (isLoadingTopology) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {intl.formatMessage({ id: 'loading-topology' })}
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!topologyData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {intl.formatMessage({ id: 'no-topology-data' })}
        </Typography>
      </Box>
    );
  }

  console.log({ timestamp });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <NodeDetailDialog open={openDetail} nodeDetail={selectedNode} onClose={() => setOpenDetail(false)} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          <FormattedMessage id="last-updated" />: {normalizeDate(timestamp)}
        </Typography>
        <Button variant="outlined" size="small" onClick={handleRefresh}>
          <FormattedMessage id="refresh" />
        </Button>
      </Box>
      {/* Header Stats */}
      <Grid container spacing={2} mb={2} mt={1}>
        {[
          { title: 'Total APs', value: topologyData.summary.total_aps, color: '#1D4ED8', icon: Wifi },
          { title: 'Online', value: topologyData.summary.online_aps, color: '#16A34A', icon: StatusUp },
          { title: 'Total Clients', value: topologyData.summary.total_clients, color: '#4F46E5', icon: People },
          {
            title: 'Bandwidth (Mbps)',
            value: Number(topologyData.summary.total_bandwidth_mbps).toLocaleString(),
            color: '#F97316',
            icon: Activity
          }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Grid key={i} item xs={12} sm={6} md={3}>
              <MainCard
                content={false}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" color="text.secondary">
                      {item.title}
                    </Typography>
                    <Typography variant="h3" fontWeight={700}>
                      {item.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: `${item.color}11`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={24} color={item.color} />
                  </Box>
                </Stack>
              </MainCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Network Diagram */}
      <MainCard
        content={false}
        sx={{
          width: '100%',
          height: 600,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {nodes.length > 0 ? (
          <ReactFlow
            colorMode={theme.palette.mode}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable
            edgesFocusable
            elementsSelectable
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.05}
            maxZoom={2}
          >
            <Background color="#e0e0e0" gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'controller') return '#3f51b5';
                if (node.type === 'site') return '#9c27b0';
                if (node.type === 'apCluster') return '#ff9800';
                if (node.type === 'clientGroup') return '#2196f3';
                return '#4caf50';
              }}
            />
            <Paper
              sx={{
                position: 'absolute',
                top: '60%',
                left: 16,
                transform: 'translateY(-50%)',
                p: 1.5,
                bgcolor: theme.palette.mode === ThemeMode.DARK ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                boxShadow: 0,
                zIndex: 10
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight="600">
                Legend
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 14, height: 14, bgcolor: '#3f51b5', borderRadius: '3px' }} />
                  <Typography variant="caption">Controller</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 14, height: 14, bgcolor: '#9c27b0', borderRadius: '3px' }} />
                  <Typography variant="caption">Site</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 14, height: 14, bgcolor: '#ff9800', borderRadius: '3px' }} />
                  <Typography variant="caption">{IS_STAGING ? 'AP' : 'Floor'}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 14, height: 14, border: '2px solid #4caf50', borderRadius: '3px' }} />
                  <Typography variant="caption">AP (Online)</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 14, height: 14, border: '2px solid #f44336', borderRadius: '3px' }} />
                  <Typography variant="caption">AP (Offline)</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 14, height: 14, border: '2px dashed #2196f3', borderRadius: '3px' }} />
                  <Typography variant="caption">Client Group</Typography>
                </Stack>
              </Stack>
            </Paper>
          </ReactFlow>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Activity size={64} color="#9e9e9e" />
            <Typography variant="h6" color="text.secondary">
              No topology data available
            </Typography>
          </Box>
        )}
      </MainCard>
    </Box>
  );
};

const TopologyViewWithProvider = (props: TopologyViewProps) => (
  <ReactFlowProvider>
    <TopologyView {...props} />
  </ReactFlowProvider>
);

export default TopologyViewWithProvider;
