# Chuẩn cấu trúc dự án Frontend — VTC Telecom

> **Phiên bản:** 1.0.0 · **Cập nhật:** 2026-06-26
> **Phạm vi áp dụng:** Mọi dự án Frontend mới của công ty. Dự án hiện hữu áp dụng dần theo lộ trình (xem §14).
> **Nguồn tham chiếu:** Cấu trúc chuẩn của repo **V-Track** (`fe/`).

Đây là **tài liệu template mẫu** để thống nhất cách tổ chức source code Frontend trên toàn bộ dự án của công ty. Tài liệu mô tả: tech stack chuẩn, kiến trúc thư mục, quy ước đặt tên, cách phân tầng (API → hooks → component), và checklist khi thêm/sửa tính năng.

Khi tạo dự án mới: **copy cấu trúc trong §4 và §16**, thay `<project>` / `<feature>` bằng tên thực tế.

---

## 1. Nguyên tắc cốt lõi

| # | Nguyên tắc | Ý nghĩa |
|---|-----------|---------|
| 1 | **Isolated Features** | Mỗi tính năng là một thư mục tự đủ (api + hooks + pages). Đọc/sửa 1 feature không phải lục tung cả repo. |
| 2 | **Một nguồn sự thật** | Mỗi loại thông tin (types, API call, quyền) chỉ định nghĩa ở một nơi. Không duplicate. |
| 3 | **Phân tầng rõ ràng** | `component → hooks → api → axios`. Không nhảy cóc (component không gọi `axios` trực tiếp). |
| 4 | **Shared là tối thiểu** | Chỉ đưa vào `shared/` khi ≥ 2 feature dùng chung. Mặc định để trong feature. |
| 5 | **Đặt tên nhất quán** | Theo bảng §6. Tên file/biến đoán được nội dung mà không cần mở. |
| 6 | **Surgical changes** | Chỉ động phần phải động; mỗi dòng đổi truy được về một yêu cầu. |

---

## 2. Tech stack chuẩn

Dự án **mới** dùng đúng stack dưới đây (đồng bộ với V-Track). Dự án **cũ** giữ stack hiện tại và chỉ chuẩn hoá *kiến trúc thư mục* trước (§14).

| Lớp | Công nghệ chuẩn |
|---|---|
| Framework | **React 19 + TypeScript** |
| Build | **Vite 7** |
| Styling | **Tailwind CSS v4** |
| UI components | **Ant Design 6** + **Lucide React** (icon) |
| State — client | **Zustand 5** |
| State — server | **TanStack React Query 5** + **Axios** |
| Form + validate | **React Hook Form 7** + **Zod 4** |
| Charts | **Recharts 3** |
| Date | **dayjs** |
| Export | **ExcelJS**, **XLSX**, **file-saver**, **@react-pdf/renderer** |
| Test (nếu có) | **Vitest** (tích hợp Vite) |

**Scripts chuẩn (package.json):**

```bash
npm run dev      # dev server (Vite HMR)
npm run build    # tsc -b && vite build
npm run lint     # ESLint
npm run preview  # preview bản build
```

**Biến môi trường:** API base URL lấy từ `.env` → `VITE_API_URL`. Không hard-code URL trong code.

---

## 3. Kiến trúc tổng thể — Isolated Features

```
component (pages/*.tsx)
   └── hooks.ts        ← useQuery / useMutation (React Query)
         └── api.ts    ← axios.get/post (1 hàm = 1 endpoint)
               └── shared/api/axios.ts   ← instance + interceptor (token, refresh)
                     └── REST API (Backend)
```

**Quy tắc bất biến:**

- Component **không** gọi `axios` trực tiếp — luôn đi qua `features/<x>/api.ts` rồi bọc bằng hook trong `hooks.ts`.
- Server state (dữ liệu từ API) → **React Query**. Client state toàn cục → **Zustand**. UI state cục bộ → **useState**.
- Tất cả **types** tập trung ở `shared/types/`.

---

## 4. Cấu trúc thư mục chuẩn

```
src/
├── features/                    ← Mỗi tính năng là 1 folder độc lập, tự đủ
│   └── <feature>/
│       ├── api.ts               ← Tất cả API call của feature này
│       ├── hooks.ts             ← Tất cả React Query hooks của feature này
│       ├── store.ts             ← (chỉ khi feature cần state riêng, vd auth)
│       ├── utils.ts             ← (nếu cần) helper riêng của feature
│       └── pages/
│           ├── <Page>.tsx       ← Component trang
│           └── ui-columns.tsx   ← (nếu có Table) định nghĩa cột
│
├── shared/                      ← Dùng chung ≥ 2 feature
│   ├── api/
│   │   ├── axios.ts             ← Axios instance + interceptors (token, refresh)
│   │   └── <shared-api>.ts      ← API dùng chung (vd comments, attachments)
│   ├── components/              ← Component dùng chung (layout, modal, guard…)
│   ├── hooks/                   ← Hook dùng chung (usePermissions, usePagination…)
│   ├── store/                   ← Zustand store dùng chung (sidebar, theme)
│   ├── types/                   ← TẤT CẢ TypeScript types/interfaces
│   └── utils/                   ← Helper dùng chung (permissions, fileHelpers…)
│
├── assets/                      ← Ảnh, font, icon tĩnh
├── App.tsx                      ← Router + Provider (Query, Theme, ConfigProvider)
├── main.tsx                     ← Entry point
└── index.css                    ← Import Tailwind + custom class
```

**Quy tắc thư mục:**

- **Không** tạo folder cấp cao mới ngoài `features/` và `shared/` trong `src/`.
- **Không** dùng lại kiểu phẳng theo *loại file* (`src/api/`, `src/pages/`, `src/components/` tách rời) — đó là mô hình cũ cần loại bỏ.
- Mỗi feature **nên** map 1–1 với một file đặc tả trong `contract/features/<feature>.md` (nếu dự án có thư mục `contract/`).

---

## 5. Phân bổ code: feature hay shared?

Khi thêm code mới, luôn hỏi: **"Cái này thuộc về feature nào?"**

| Tình huống | Đặt ở đâu |
|---|---|
| Chỉ 1 feature dùng | `features/<feature>/` |
| ≥ 2 feature dùng | `shared/` |
| Type/interface bất kỳ | `shared/types/` (luôn luôn) |
| Axios instance + interceptor | `shared/api/axios.ts` |
| Layout, sidebar, header, route guard | `shared/components/` |
| Store auth (user, token) | `features/auth/store.ts` |
| Store UI toàn cục (sidebar, theme) | `shared/store/` |

> **Mặc định:** nếu phân vân → để trong feature. Chỉ "nâng" lên `shared/` khi có feature thứ 2 thực sự cần.

---

## 6. Quy ước đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Folder feature | kebab-case | `work-activities/`, `service-monitors/` |
| Component | PascalCase | `TaskFormModal.tsx` |
| Hook | camelCase, prefix `use` | `useTasks.ts`, `usePermissions.ts` |
| API function | camelCase, verb đầu | `fetchTasks()`, `createTask()`, `updateTask()`, `deleteTask()` |
| Util function | camelCase | `formatDate()`, `canEditTask()` |
| Type / Interface | PascalCase | `Task`, `CreateTaskPayload` |
| Enum | PascalCase | `TaskStatus` |
| Zustand store | camelCase + prefix `use` | `useAuthStore()`, `useThemeStore()` |
| Query key factory | `<ENTITY>_KEYS` (UPPER_SNAKE) | `TASK_KEYS`, `USER_KEYS` |
| CSS class | Tailwind utility / kebab-case custom | `text-slate-300`, `modal-scrollbar` |

---

## 7. Tầng API — `api.ts`

Mỗi feature có **một** file `api.ts`. Mỗi function ứng với **một** endpoint.

```typescript
// features/tasks/api.ts
import api from '../../shared/api/axios'
import type { CreateTaskPayload } from '../../shared/types'

export interface FetchTasksParams {
  projectId: number
  page?: number
  pageSize?: number
}

export async function fetchTasks(params: FetchTasksParams) {
  const res = await api.get('/tasks_management/data_task', { params })
  return res.data            // trả raw data — để React Query xử lý
}

export async function createTask(payload: CreateTaskPayload) {
  const res = await api.post('/tasks_management/create_task', payload)
  return res.data
}

export async function updateTask(id: number, payload: Partial<CreateTaskPayload>) {
  const res = await api.post('/tasks_management/update_task', payload, { params: { id } })
  return res.data
}

export async function deleteTask(id: number) {
  const res = await api.post('/tasks_management/delete_task', null, { params: { id } })
  return res.data
}
```

**Quy tắc:**

- Input: interface có type rõ ràng. Output: trả `res.data` thô, **không** xử lý/format trong `api.ts`.
- **Không** `try/catch` trong `api.ts` — để lỗi bubble lên hook (React Query bắt).
- Params → query string: `{ params: {...} }`. Body → truyền trực tiếp object.
- Upload file: dùng `FormData`, **không** tự set `Content-Type`.

---

## 8. Tầng Hooks — `hooks.ts`

Mỗi feature có **một** file `hooks.ts` chứa tất cả React Query hooks, mở đầu bằng **query key factory**.

```typescript
// features/tasks/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchTasks, createTask, updateTask, deleteTask, type FetchTasksParams } from './api'

const TASK_KEYS = {
  all: ['tasks'] as const,
  list: (params: object) => ['tasks', 'list', params] as const,
  detail: (id: number) => ['tasks', 'detail', id] as const,
}

export function useTasks(params: FetchTasksParams) {
  return useQuery({
    queryKey: TASK_KEYS.list(params),
    queryFn: () => fetchTasks(params),
    placeholderData: (prev) => prev,    // giữ data cũ khi refetch → tránh nhấp nháy
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all })
      toast.success('Tạo task thành công')
    },
    onError: () => toast.error('Tạo task thất bại'),
  })
}
```

**Quy tắc:**

- Query key factory `<ENTITY>_KEYS` đặt ở đầu file.
- List query → `placeholderData: (prev) => prev` để tránh flicker khi đổi trang/filter.
- `onSuccess` → `invalidateQueries` + toast tiếng Việt. `onError` → toast tiếng Việt.
- Component **không** fetch trực tiếp — luôn qua hook.

---

## 9. Component

### 9.1 Page component

```typescript
// features/tasks/pages/ListPage.tsx
import { useState } from 'react'
import { useTasks, useCreateTask } from '../hooks'
import TaskFormModal from '../../../shared/components/TaskFormModal'
import { useAuthStore } from '../../auth/store'

export default function ListPage() {
  const [page, setPage] = useState(1)
  const { user } = useAuthStore()
  const { data, isLoading } = useTasks({ projectId: 1, page })
  const createTask = useCreateTask()
  return <div>{/* UI */}</div>
}
```

- **Export default**, không named export cho page.
- UI state (modal open, filter, page) → `useState`. Data → React Query hook. Global state → Zustand.
- Không gọi `api.*` trực tiếp.

### 9.2 Shared component

```typescript
// shared/components/TaskFormModal.tsx
interface Props {
  open: boolean
  onClose: () => void
  initialValues?: Partial<Task>
  onSubmit: (values: CreateTaskPayload) => void
  loading?: boolean
}

export default function TaskFormModal({ open, onClose, initialValues, onSubmit, loading }: Props) {
  // ...
}
```

- Props interface đặt **ngay trên** component.
- **Không** fetch data bên trong shared component — nhận data qua props. (Ngoại lệ: dữ liệu lookup dùng chung như statuses/priorities.)

### 9.3 `ui-columns.tsx` (khi có Table)

```typescript
// features/backlog/pages/ui-columns.tsx
import type { ColumnsType } from 'antd/es/table'
import type { Task } from '../../../shared/types'

export function buildColumns(opts: {
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
}): ColumnsType<Task> {
  return [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    // ...
  ]
}
```

- Dùng function `buildColumns(opts)` (truyền callback) thay vì array tĩnh.
- **Không** import hook/store trong `ui-columns.tsx`.

---

## 10. State management

| Loại state | Công cụ | Ví dụ |
|---|---|---|
| Server state (data API) | React Query | `useTasks()`, `useCreateTask()` |
| Client state toàn cục | Zustand | `useAuthStore`, `useSidebarStore`, `useThemeStore` |
| UI state cục bộ | `useState` | modal open, page, filter |

**Quy tắc Zustand:** số store giữ tối thiểu. `authStore` đặt ở `features/auth/store.ts`; store UI dùng chung (sidebar, theme) ở `shared/store/`. Không tạo thêm store trừ khi thực sự cần.

---

## 11. TypeScript

- **Tất cả types** → `shared/types/`. Một nguồn sự thật, tránh duplicate.
- Cấm `any` — không biết type thì dùng `unknown` rồi narrow.
- Props interface đặt ngay trên component, không export trừ khi cần tái sử dụng.
- API response: dùng generic `ApiResponse<T>` / `ApiListResponse<T>` nếu có.

---

## 12. Styling — Tailwind CSS v4

- Ưu tiên Tailwind utility, tránh `style={{...}}` inline.
- Dark mode dùng class strategy `.dark` trên `<html>` + variant `dark:`.
- Custom class chỉ viết trong `index.css`, **không** viết `<style>` trong component.
- Với Ant Design: dùng AntD cho `Table/Modal/Form/Select/DatePicker…`; dùng Tailwind cho layout/spacing/color. **Không** override AntD bằng `!important` — dùng `ConfigProvider` token.

---

## 13. Import

**Thứ tự import:**

```typescript
// 1. React / thư viện bên thứ ba
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table, Button } from 'antd'

// 2. Shared (đi lên)
import type { Task } from '../../../shared/types'
import TaskFormModal from '../../../shared/components/TaskFormModal'

// 3. Feature-local (ngang/xuống)
import { useTasks } from '../hooks'
```

**Path:** dùng **relative path** trong feature; nếu dự án cấu hình alias (`@/`, hoặc `baseUrl=src`) thì thống nhất một kiểu trong toàn repo và ghi rõ ở README. Không trộn lẫn.

---

## 14. Lộ trình áp dụng cho dự án CŨ

Dự án đang chạy không đổi tech stack ngay. Chuẩn hoá theo thứ tự rủi ro thấp → cao:

1. **Giai đoạn 0 — Skeleton:** tạo `src/features/` và `src/shared/` (chưa di chuyển file). Build không đổi.
2. **Giai đoạn 1 — Shared trước:** chuyển `axios`, types, util/component dùng chung vào `shared/`. Cập nhật alias + import. Build xanh sau mỗi bước.
3. **Giai đoạn 2 — Từng feature:** di chuyển từng domain vào `features/<x>/` (api → hooks → pages). Build + smoke test sau mỗi feature.
4. **Giai đoạn 3 — Dọn dẹp:** xoá folder phẳng cũ rỗng, gỡ alias thừa, cập nhật tài liệu.
5. **Giai đoạn 4 — Stack (tùy chọn, dài hạn):** chuyển dần Redux→Zustand, Formik→RHF/Zod, MUI→AntD theo từng feature, không big-bang.

> Mỗi giai đoạn = một PR nhỏ, build xanh, review được. Không gộp tất cả vào một commit.

---

## 15. Checklist

### Khi thêm feature mới

- [ ] Tạo `features/<feature>/`
- [ ] `api.ts` — viết các API call (1 hàm = 1 endpoint)
- [ ] `hooks.ts` — React Query hooks + query key factory
- [ ] `pages/<Page>.tsx` (+ `ui-columns.tsx` nếu có Table)
- [ ] Types mới → `shared/types/`
- [ ] Thêm route vào `App.tsx`
- [ ] Component dùng chung → `shared/components/`
- [ ] (Nếu có `contract/`) cập nhật `contract/features/<feature>.md` + `app_map.md`

### Khi review PR

- [ ] File mới đặt đúng `features/` hoặc `shared/` theo §5
- [ ] Không có `axios` gọi trực tiếp trong component
- [ ] Không có `any`; types nằm ở `shared/types/`
- [ ] Đặt tên theo §6
- [ ] Không override AntD bằng `!important`
- [ ] Mỗi thay đổi truy được về một yêu cầu (surgical)

---

## 16. Phụ lục — Cấu trúc một feature mẫu (copy khi tạo mới)

```
features/<feature>/
├── api.ts                  # fetchX, createX, updateX, deleteX
├── hooks.ts                # useX, useCreateX, useUpdateX, useDeleteX (+ X_KEYS)
├── utils.ts                # (tùy chọn) helper riêng
└── pages/
    ├── <Feature>Page.tsx   # component trang, export default
    └── ui-columns.tsx      # (tùy chọn) buildColumns(opts)
```

**Luồng chuẩn:** `pages/<Feature>Page.tsx` → `hooks.ts` → `api.ts` → `shared/api/axios.ts` → Backend.

---

*Tài liệu này là chuẩn nội bộ. Khi cập nhật: bump phiên bản ở đầu file và ghi rõ thay đổi.*
