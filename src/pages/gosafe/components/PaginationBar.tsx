import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Stack, Typography, IconButton } from '@mui/material';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';

/**
 * Phân trang client-side cho danh sách đã tải. Trả về trang hiện tại + mảng đã cắt.
 * Tự về trang 1 khi dữ liệu/độ dài đổi (lọc, reload).
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);
  const paged = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );
  return { page, setPage, total, totalPages, paged, pageSize };
}

/**
 * Phân trang SERVER-side: chỉ tải đúng 1 trang từ API (không load hết rồi cắt).
 * `fetcher(page, pageSize)` trả về `{ items, total }`. Tự nạp lại khi đổi trang
 * hoặc khi `resetKey` đổi (đổi tìm kiếm/bộ lọc/refresh) — khi đó về trang 1.
 */
export function useServerPagination<T>(
  fetcher: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  pageSize = 12,
  resetKey: unknown = null
) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const { items: rows, total: tot } = await fetcherRef.current(p, pageSize);
      setItems(rows);
      setTotal(tot);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Một effect duy nhất: đổi trang → tải trang đó; đổi tìm kiếm/bộ lọc (resetKey) →
  // về trang 1 rồi tải (tránh fetch 2 lần với trang cũ).
  const lastResetRef = useRef(resetKey);
  useEffect(() => {
    let target = page;
    if (lastResetRef.current !== resetKey) {
      lastResetRef.current = resetKey;
      if (page !== 1) { setPage(1); return; }
      target = 1;
    }
    load(target);
  }, [load, page, resetKey]);

  const reload = useCallback(() => load(page), [load, page]);
  return { items, page, setPage, total, totalPages, loading, reload, pageSize };
}

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  shownCount: number;
  onChange: (page: number) => void;
  /** Nhãn đối tượng (vd "phạm nhân", "thiết bị") */
  label?: string;
}

/** Thanh phân trang — ẩn khi chỉ có 1 trang. */
export default function PaginationBar({ page, totalPages, total, shownCount, onChange, label = 'mục' }: PaginationBarProps) {
  if (total === 0) return null;
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={1}
      sx={{ pt: 1.5 }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        Hiển thị {shownCount} / {total} {label}
      </Typography>
      {totalPages > 1 && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            size="small"
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
            sx={{
              p: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              color: 'text.primary',
              '&:disabled': { opacity: 0.3 }
            }}
          >
            <ArrowLeft2 size="14" />
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              minWidth: 40,
              textAlign: 'center',
              fontFamily: '"Inter", sans-serif',
              color: 'text.primary'
            }}
          >
            {page} / {totalPages}
          </Typography>
          <IconButton
            size="small"
            disabled={page === totalPages}
            onClick={() => onChange(page + 1)}
            sx={{
              p: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              color: 'text.primary',
              '&:disabled': { opacity: 0.3 }
            }}
          >
            <ArrowRight2 size="14" />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
}
