import { useState, useEffect, useMemo } from 'react';
import { Stack, Pagination, Typography } from '@mui/material';

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
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => onChange(p)}
          size="small"
          color="primary"
          shape="rounded"
          siblingCount={1}
        />
      )}
    </Stack>
  );
}
