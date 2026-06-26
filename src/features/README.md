# `features/` — Isolated Features

Mỗi tính năng là **một folder độc lập**. Theo chuẩn [`docs/FRONTEND_PROJECT_STANDARD.md`](../../docs/FRONTEND_PROJECT_STANDARD.md).

## Cấu trúc đã migrate (đợt chuẩn hoá hierarchy)

| Feature | Nội dung | Gom từ (cũ) |
|---|---|---|
| `auth/pages` + `auth/sections` | Đăng nhập, đăng ký, quên mật khẩu, form auth | `pages/auth`, `sections/auth` |
| `gosafe/pages` | **Shell EMS** + tracking + các tab quản lý (overview, devices, prisoners, alerts, compliance, regions, users, audit-logs) | `pages/gosafe` (gồm `components/`, `sections/`, `tracking/`) |
| `landing/pages` | Trang marketing | `pages/landing` |
| `dashboard/pages` | Dashboard | `pages/dashboard` |
| `maintenance/pages` | 404 / 500 / coming-soon / under-construction | `pages/maintenance` |

> **Lưu ý granularity:** GoSafe hiện là **một shell** (`gosafe/pages/index.tsx`) với các tab — nên giữ là **một feature** để không đổi hành vi. Khi tách thành route riêng sau này, có thể split `gosafe/` thành `tracking/`, `devices/`, `persons/`, `alerts/`, `compliance/`, `regions/`, `monitoring-users/`, `audit-logs/` theo bản đồ trong `docs/STRUCTURE_MIGRATION.md` §3.

## Quy tắc

- Chỉ tạo folder mới trong `features/` và `shared/`.
- Code dùng chung ≥ 2 feature → đưa lên `shared/`.
- (Bước sau – tùy chọn) gom `*.api.ts` rời trong `shared/api/` + các `useHandleX` trong `shared/hooks/` về `features/<x>/{api.ts, hooks.ts}` theo chuẩn.
