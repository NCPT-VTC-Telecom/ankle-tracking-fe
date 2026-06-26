import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, TextField, CircularProgress, Chip,
  Avatar, Switch, Divider
} from '@mui/material';
import { Add, Edit, Trash, Buildings2, ArrowDown2, ArrowRight2, Refresh, Profile2User, SearchNormal1 } from 'iconsax-react';
import { regionsApi, usersApi, extractList } from 'shared/api/gosafe.management.api';
import SideDrawer from '../../components/SideDrawer';
import { useFeedback } from '../../components/FeedbackProvider';

/** Lấy danh sách regionId mà user đang được gán (đọc phòng thủ nhiều biến thể schema). */
function userRegionIds(u: any): string[] {
  const raw =
    u?.regionIds ??
    u?.regionAccess ??
    u?.regions ??
    u?.region_access ??
    [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r: any) => String(typeof r === 'object' ? (r?.id ?? r?.regionId ?? r?.region_id ?? '') : r))
    .filter(Boolean);
}

interface Props {
  isDark: boolean;
  refreshKey?: number;
}

interface RegionNode {
  id: string;
  name: string;
  code?: string;
  level: number;
  path: string;
  parentId?: string | null;
  description?: string;
  children: RegionNode[];
}

function normalizeNode(n: any): RegionNode {
  return {
    id: String(n.id ?? n.regionId ?? n.code ?? Math.random()),
    name: n.name ?? n.regionName ?? '—',
    code: n.code,
    level: Number(n.level ?? 1),
    path: String(n.path ?? (n.code ? String(n.code).toLowerCase() : '')),
    parentId: n.parentId ?? null,
    description: n.description ?? n.note ?? '',
    children: Array.isArray(n.children) ? n.children.map(normalizeNode) : []
  };
}

// Cấp bậc địa bàn
const LEVEL_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Quốc gia', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  2: { label: 'Tỉnh/Thành', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  3: { label: 'Quận/Huyện', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  4: { label: 'Phường/Xã', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
};

interface FlatRegionNode extends RegionNode {
  fullNamePath: string;
}

const getFlatNodes = (nodes: RegionNode[], currentPath = ''): FlatRegionNode[] => {
  let list: FlatRegionNode[] = [];
  for (const node of nodes) {
    const nodePath = currentPath ? `${currentPath} > ${node.name}` : node.name;
    list.push({ ...node, fullNamePath: nodePath });
    if (node.children && node.children.length > 0) {
      list = [...list, ...getFlatNodes(node.children, nodePath)];
    }
  }
  return list;
};

export default function RegionManagement({ isDark, refreshKey }: Props) {
  const [tree, setTree] = useState<RegionNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; node?: RegionNode; parent?: RegionNode } | null>(null);
  const [usersFor, setUsersFor] = useState<RegionNode | null>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchQuery, setSearchQuery] = useState('');

  const { confirm, notify } = useFeedback();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await regionsApi.tree();
      const data = (res.data as any)?.data ?? res.data;
      const arr = Array.isArray(data) ? data : extractList(res.data);
      setTree(arr.map(normalizeNode));
    } catch {
      setTree([]);
      setError('Chưa kết nối được API địa bàn (cần đăng nhập tài khoản GoSafe thật).');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await usersApi.list({ pageSize: 200 });
      setUsers(extractList(res.data));
    } catch (err) {
      console.error('Failed to load users for region assignment:', err);
    }
  }, []);

  useEffect(() => {
    load();
    loadUsers();
  }, [load, loadUsers, refreshKey]);

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const expandAll = () => {
    const flat = getFlatNodes(tree);
    const next: Record<string, boolean> = {};
    flat.forEach((n) => {
      next[n.id] = true;
    });
    setExpanded(next);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const getAssignedUsers = useCallback((regionId: string) => {
    return users.filter((u) => {
      const rIds = userRegionIds(u);
      return rIds.includes(regionId);
    });
  }, [users]);

  const removeNode = async (node: RegionNode) => {
    const ok = await confirm({
      title: 'Xóa địa bàn',
      message: <>Xóa địa bàn <b>{node.name}</b>{node.children.length ? ' và toàn bộ cấp con' : ''}? Hành động không thể hoàn tác.</>,
      confirmText: 'Xóa',
      tone: 'danger'
    });
    if (!ok) return;
    try {
      await regionsApi.delete(node.id);
      const prune = (nodes: RegionNode[]): RegionNode[] =>
        nodes.filter((n) => n.id !== node.id).map((n) => ({ ...n, children: prune(n.children) }));
      setTree((prev) => prune(prev));
      notify('Đã xóa địa bàn', 'success');
    } catch {
      notify('Xóa địa bàn thất bại', 'error');
    }
  };

  const flatNodes = useMemo(() => getFlatNodes(tree), [tree]);

  const filteredFlatNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return flatNodes.filter((n) =>
      n.name.toLowerCase().includes(q) ||
      (n.code && n.code.toLowerCase().includes(q)) ||
      n.fullNamePath.toLowerCase().includes(q)
    );
  }, [flatNodes, searchQuery]);

  const showFlatList = viewMode === 'list' || searchQuery.trim() !== '';

  // glass/flat tokens
  const glassBdr   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const glassBlur  = 'blur(20px) saturate(1.6)';
  const panelBg    = isDark ? 'rgba(9,13,31,0.5)'  : 'rgba(255,255,255,0.7)';

  const renderRow = (node: RegionNode | FlatRegionNode, depth = 0, isFlat = false) => {
    const hasChildren = node.children && node.children.length > 0;
    const open = expanded[node.id] ?? depth < 1;
    const lv = node.level ?? (depth + 1);
    const config = LEVEL_CONFIG[lv] || { label: `Cấp ${lv}`, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
    
    const assigned = getAssignedUsers(node.id);
    const officerText = assigned.length > 0 ? `${assigned.length} cán bộ` : 'Chưa phân công';
    const officerBg = assigned.length > 0 ? 'rgba(22, 163, 74, 0.08)' : 'rgba(100, 116, 139, 0.05)';
    const officerColor = assigned.length > 0 ? '#16a34a' : '#64748b';

    return (
      <Box key={node.id}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            pl: isFlat ? 2.5 : (depth * 4 + 2.5),
            pr: 2.5,
            py: 1.75,
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            borderBottom: `1px solid ${glassBdr}`,
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0, 0, 0, 0.015)',
              transform: 'translateX(4px)',
            },
          }}
        >
          {!isFlat && (
            <IconButton
              size="small"
              onClick={() => hasChildren && toggle(node.id)}
              sx={{
                visibility: hasChildren ? 'visible' : 'hidden',
                p: 0.5,
                mr: 0.5,
                color: 'text.secondary',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderRadius: '8px',
                border: `1px solid ${glassBdr}`,
                width: 28,
                height: 28,
              }}
            >
              {open ? <ArrowDown2 size={12} variant="Bold" /> : <ArrowRight2 size={12} variant="Bold" />}
            </IconButton>
          )}

          <Avatar
            sx={{
              bgcolor: config.bg,
              color: config.color,
              width: 38,
              height: 38,
              borderRadius: '10px',
              border: `1.5px solid ${config.color}35`,
              boxShadow: `0 4px 12px ${config.color}15`,
            }}
          >
            <Buildings2 size={20} variant="Bold" />
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#f1f5f9' : '#0f172a' }}>
                {node.name}
              </Typography>
              {node.code && (
                <Chip
                  label={node.code}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    color: 'text.secondary',
                    borderRadius: '6px',
                  }}
                />
              )}
            </Stack>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 500 }}>
              {isFlat && 'fullNamePath' in node
                ? (node as FlatRegionNode).fullNamePath
                : (node.description || 'Không có mô tả')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Level Badge */}
            <Chip
              label={config.label}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: config.bg,
                color: config.color,
                border: `1px solid ${config.color}25`,
                borderRadius: '8px',
              }}
            />

            {/* Officer Assignment Tag */}
            <Chip
              label={officerText}
              size="small"
              onClick={() => setUsersFor(node)}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: officerBg,
                color: officerColor,
                border: `1px solid ${officerColor}20`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: assigned.length > 0 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(100, 116, 139, 0.1)',
                }
              }}
            />

            <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', borderColor: glassBdr }} />

            {/* Actions */}
            <Stack direction="row" spacing={0.75}>
              <Tooltip title="Phân công cán bộ">
                <IconButton
                  size="small"
                  onClick={() => setUsersFor(node)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    color: '#10b981',
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.2)'}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(16, 185, 129, 0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  <Profile2User size={16} variant="Bold" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Thêm cấp con">
                <IconButton
                  size="small"
                  onClick={() => setDialog({ mode: 'add', parent: node })}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    color: '#3b82f6',
                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)',
                    border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.2)'}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(59, 130, 246, 0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  <Add size={16} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Sửa">
                <IconButton
                  size="small"
                  onClick={() => setDialog({ mode: 'edit', node })}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    color: '#f59e0b',
                    bgcolor: isDark ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.03)',
                    border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.2)'}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(245, 158, 11, 0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  <Edit size={16} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Xoá">
                <IconButton
                  size="small"
                  onClick={() => removeNode(node)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    color: '#ef4444',
                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)',
                    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.2)'}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(239, 68, 68, 0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  <Trash size={16} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>

        {!isFlat && open && node.children && node.children.length > 0 && (
          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: `${depth * 32 + 30}px`,
                top: 0,
                bottom: 20,
                width: '1.5px',
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              }
            }}
          >
            {node.children.map((c) => renderRow(c, depth + 1, false))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: `1px solid ${glassBdr}`,
        background: panelBg,
        backdropFilter: glassBlur,
        WebkitBackdropFilter: glassBlur,
        boxShadow: `0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)`,
        overflow: 'hidden',
      }}
    >
      {/* Filter & Toolbar */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${glassBdr}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Tìm địa bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchNormal1 size={16} style={{ marginRight: 6, color: '#94a3b8' }} />,
                sx: { fontSize: '0.9rem', borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
              }}
              sx={{ width: 280 }}
            />

            <Stack direction="row" spacing={0.5}>
              {[
                { key: 'tree', label: 'Dạng cây' },
                { key: 'list', label: 'Dạng danh sách' },
              ].map((m) => {
                const active = viewMode === m.key;
                return (
                  <Chip
                    key={m.key}
                    label={m.label}
                    onClick={() => setViewMode(m.key as any)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      height: 32,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1.5px solid',
                      borderColor: active ? '#1e6fd9' : glassBdr,
                      bgcolor: active ? 'rgba(30, 111, 217, 0.1)' : 'transparent',
                      color: active ? '#1e6fd9' : 'text.secondary',
                      '&:hover': { borderColor: '#1e6fd9' },
                    }}
                  />
                );
              })}
            </Stack>

            {!showFlatList && (
              <Stack direction="row" spacing={0.5}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={expandAll}
                  sx={{ textTransform: 'none', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, height: 32 }}
                >
                  Mở rộng tất cả
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={collapseAll}
                  sx={{ textTransform: 'none', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, height: 32 }}
                >
                  Thu gọn tất cả
                </Button>
              </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Tải lại">
              <IconButton
                size="small"
                onClick={load}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '12px',
                  border: `1.5px solid ${glassBdr}`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }
                }}
              >
                <Refresh size={18} />
              </IconButton>
            </Tooltip>
            {/* Bỏ "Thêm địa bàn gốc": gốc hệ thống ("Toàn quốc") cố định, API không cho
                tạo gốc mới. Thêm Tỉnh/Thành qua nút "+" (Thêm cấp con) trên node gốc. */}
          </Stack>
        </Stack>
      </Box>

      {/* Main List Box */}
      <Box sx={{ p: 2.5, minHeight: 200 }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
        ) : error && tree.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 5 }}>{error}</Typography>
        ) : (showFlatList ? (searchQuery.trim() ? filteredFlatNodes : flatNodes) : tree).length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 5 }}>Không tìm thấy địa bàn nào.</Typography>
        ) : showFlatList ? (
          (searchQuery.trim() ? filteredFlatNodes : flatNodes).map((n) => renderRow(n, 0, true))
        ) : (
          tree.map((n) => renderRow(n, 0, false))
        )}
      </Box>

      {dialog && (
        <RegionDialog
          isDark={isDark}
          mode={dialog.mode}
          node={dialog.node}
          parent={dialog.parent}
          onClose={() => setDialog(null)}
          onSaved={load}
        />
      )}

      {usersFor && (
        <RegionUsersDrawer
          isDark={isDark}
          region={usersFor}
          onClose={() => setUsersFor(null)}
          users={users}
          setUsers={setUsers}
        />
      )}
    </Box>
  );
}

/** Phân công cán bộ vào địa bàn — bật/tắt thành viên, gọi user_management/assign_regions. */
function RegionUsersDrawer({
  isDark,
  region,
  onClose,
  users,
  setUsers
}: {
  isDark: boolean;
  region: RegionNode;
  onClose: () => void;
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { notify } = useFeedback();

  const userId = (u: any) => String(u.id ?? u.userId ?? u._id ?? '');
  const userName = (u: any) => u.fullname ?? u.fullName ?? u.name ?? u.username ?? u.email ?? '—';
  const userRole = (u: any) =>
    (Array.isArray(u.roles) ? u.roles.map((r: any) => r?.name ?? r).filter(Boolean).join(', ') : '') ||
    u.roleName || u.role?.name || (typeof u.role === 'string' ? u.role : '');

  const toggle = async (u: any) => {
    const id = userId(u);
    const cur = userRegionIds(u);
    const member = cur.includes(region.id);
    const next = member ? cur.filter((r) => r !== region.id) : [...cur, region.id];
    setSavingId(id);
    try {
      await usersApi.assignRegions({ userId: id, regionIds: next });
      // Cập nhật regionIds cục bộ để UI phản ánh ngay
      setUsers((prev) => prev.map((x) => (userId(x) === id ? { ...x, regionIds: next } : x)));
      notify(member ? 'Đã gỡ cán bộ khỏi địa bàn' : 'Đã phân công cán bộ', 'success');
    } catch {
      notify('Cập nhật phân công thất bại', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) => `${userName(u)} ${userRole(u)} ${u.email ?? ''}`.toLowerCase().includes(q))
    : users;
  const memberCount = users.filter((u) => userRegionIds(u).includes(region.id)).length;

  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      width={460}
      title={`Cán bộ phụ trách · ${region.name}`}
      subtitle={`${memberCount} cán bộ đang được phân công địa bàn này`}
      footer={<Button variant="contained" onClick={onClose} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>Xong</Button>}
    >
      <Stack spacing={1.5}>
        <TextField
          size="small"
          fullWidth
          placeholder="Tìm cán bộ theo tên, vai trò, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchNormal1 size={16} style={{ marginRight: 6, color: '#94a3b8' }} /> }}
        />
        {filtered.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Không có cán bộ nào.</Typography>
        ) : (
          filtered.map((u) => {
            const id = userId(u);
            const member = userRegionIds(u).includes(region.id);
            return (
              <Stack
                key={id}
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ p: 1, borderRadius: '12px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
              >
                <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700, bgcolor: member ? '#16a34a' : '#94a3b8' }}>
                  {userName(u).split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }} noWrap>{userName(u)}</Typography>
                  {userRole(u) && <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }} noWrap>{userRole(u)}</Typography>}
                </Box>
                {savingId === id
                  ? <CircularProgress size={18} />
                  : <Switch checked={member} onChange={() => toggle(u)} size="small" />}
              </Stack>
            );
          })
        )}
      </Stack>
    </SideDrawer>
  );
}

function RegionDialog({ isDark, mode, node, parent, onClose, onSaved }: {
  isDark: boolean; mode: 'add' | 'edit'; node?: RegionNode; parent?: RegionNode; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(node?.name ?? '');
  const [code, setCode] = useState(node?.code ?? '');
  const [description, setDescription] = useState((node as any)?.description ?? '');
  const [saving, setSaving] = useState(false);
  const { notify } = useFeedback();

  const save = async () => {
    if (!name || !code) return;
    setSaving(true);
    const desc = description.trim() || name;
    try {
      if (mode === 'edit' && node) {
        await regionsApi.update(node.id, {
          name, code, description: desc, path: node.path, level: node.level
        });
      } else {
        // API bắt buộc parentId (string). Mọi địa bàn mới phải treo dưới một cha.
        if (!parent?.id) {
          notify('Chưa có địa bàn gốc trong hệ thống để gắn vào.', 'error');
          setSaving(false);
          return;
        }
        const codeLower = code.trim().toLowerCase();
        const path = `${parent.path}.${codeLower}`;
        const level = parent.level + 1;
        await regionsApi.create({
          name,
          code,
          parentId: String(parent.id),
          description: desc,
          path,
          level
        });
      }
      notify(mode === 'edit' ? 'Đã cập nhật địa bàn' : 'Đã thêm địa bàn', 'success');
      onClose();
      setTimeout(onSaved, 300);
    } catch {
      notify('Lưu địa bàn thất bại', 'error');
      setSaving(false);
    }
  };

  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      title={mode === 'edit' ? 'Sửa địa bàn' : parent ? `Thêm cấp con của "${parent.name}"` : 'Thêm địa bàn gốc'}
      subtitle="Thông tin đơn vị địa bàn quản lý"
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={!name || !code || saving} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>{saving ? 'Đang lưu…' : 'Lưu'}</Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <TextField label="Tên địa bàn *" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Mã địa bàn *" fullWidth value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: 79 (TP.HCM)" helperText="Mã duy nhất trong hệ thống" />
        <TextField label="Mô tả" fullWidth multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả phạm vi / ghi chú địa bàn" />
      </Stack>
    </SideDrawer>
  );
}
