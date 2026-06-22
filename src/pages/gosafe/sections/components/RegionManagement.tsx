import { useEffect, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, TextField, CircularProgress, Chip
} from '@mui/material';
import { Add, Edit, Trash, Buildings2, ArrowDown2, ArrowRight2, Refresh } from 'iconsax-react';
import { regionsApi, extractList } from 'api/gosafe.management.api';
import SideDrawer from '../../components/SideDrawer';

interface Props {
  isDark: boolean;
}

interface RegionNode {
  id: string;
  name: string;
  code?: string;
  level?: number;
  parentId?: string | null;
  children: RegionNode[];
}

function normalizeNode(n: any): RegionNode {
  return {
    id: String(n.id ?? n.regionId ?? n.code ?? Math.random()),
    name: n.name ?? n.regionName ?? '—',
    code: n.code,
    level: n.level,
    parentId: n.parentId ?? null,
    children: Array.isArray(n.children) ? n.children.map(normalizeNode) : []
  };
}

const LEVEL_LABEL: Record<number, string> = { 0: 'Trung ương', 1: 'Tỉnh/Thành', 2: 'Quận/Huyện', 3: 'Phường/Xã' };

export default function RegionManagement({ isDark }: Props) {
  const [tree, setTree] = useState<RegionNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; node?: RegionNode; parent?: RegionNode } | null>(null);

  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

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

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const removeNode = (node: RegionNode) => {
    const prune = (nodes: RegionNode[]): RegionNode[] =>
      nodes.filter((n) => n.id !== node.id).map((n) => ({ ...n, children: prune(n.children) }));
    setTree((prev) => prune(prev));
    regionsApi.delete(node.id).catch(() => {});
  };

  const renderNode = (node: RegionNode, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const open = expanded[node.id] ?? depth < 1;
    return (
      <Box key={node.id}>
        <Stack
          direction="row" alignItems="center" spacing={1}
          sx={{ pl: depth * 2.5, py: 1, px: 1, borderRadius: '8px', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' } }}
        >
          <IconButton size="small" onClick={() => hasChildren && toggle(node.id)} sx={{ visibility: hasChildren ? 'visible' : 'hidden', p: 0.25 }}>
            {open ? <ArrowDown2 size={14} /> : <ArrowRight2 size={14} />}
          </IconButton>
          <Buildings2 size={18} color="#1e6fd9" variant="Bold" />
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{node.name}</Typography>
          {node.code && <Typography sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'text.secondary' }}>{node.code}</Typography>}
          {node.level != null && <Chip label={LEVEL_LABEL[node.level] ?? `Cấp ${node.level}`} size="small" sx={{ height: 18, fontSize: '0.62rem' }} />}
          <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
            <Tooltip title="Thêm cấp con">
              <IconButton size="small" onClick={() => setDialog({ mode: 'add', parent: node })} sx={{ color: '#1e6fd9', border: '1px solid', borderColor: cardBorder, borderRadius: '8px' }}><Add size={15} /></IconButton>
            </Tooltip>
            <Tooltip title="Sửa">
              <IconButton size="small" onClick={() => setDialog({ mode: 'edit', node })} sx={{ color: '#1e6fd9', border: '1px solid', borderColor: cardBorder, borderRadius: '8px' }}><Edit size={15} /></IconButton>
            </Tooltip>
            <Tooltip title="Xoá">
              <IconButton size="small" onClick={() => removeNode(node)} sx={{ color: '#ef4444', border: '1px solid', borderColor: cardBorder, borderRadius: '8px' }}><Trash size={15} /></IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        {open && node.children.map((c) => renderNode(c, depth + 1))}
      </Box>
    );
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Cây địa bàn quản lý</Typography>
        <Tooltip title="Tải lại"><IconButton size="small" onClick={load} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '9px' }}><Refresh size={16} /></IconButton></Tooltip>
        <Button variant="contained" startIcon={<Add size={18} />} onClick={() => setDialog({ mode: 'add' })} sx={{ borderRadius: '9px', fontWeight: 700, ml: 'auto' }}>
          Thêm địa bàn gốc
        </Button>
      </Stack>

      <Box sx={{ borderRadius: '12px', border: '1px solid', borderColor: cardBorder, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', p: 1.5, minHeight: 200 }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
        ) : tree.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 5 }}>{error ?? 'Chưa có địa bàn nào.'}</Typography>
        ) : (
          tree.map((n) => renderNode(n))
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
    </Box>
  );
}

function RegionDialog({ isDark, mode, node, parent, onClose, onSaved }: {
  isDark: boolean; mode: 'add' | 'edit'; node?: RegionNode; parent?: RegionNode; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(node?.name ?? '');
  const [code, setCode] = useState(node?.code ?? '');

  const save = () => {
    if (!name) return;
    if (mode === 'edit' && node) {
      regionsApi.update(node.id, { name, code }).catch(() => {});
    } else {
      regionsApi.create({ name, code, parentId: parent?.id, level: parent?.level != null ? parent.level + 1 : 0 }).catch(() => {});
    }
    onClose();
    setTimeout(onSaved, 300);
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
          <Button variant="contained" onClick={save} disabled={!name} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>Lưu</Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <TextField label="Tên địa bàn *" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Mã" fullWidth value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: 79 (TP.HCM)" />
      </Stack>
    </SideDrawer>
  );
}
