# `shared/` — Code dùng chung ≥ 2 feature

Theo chuẩn [`docs/FRONTEND_PROJECT_STANDARD.md`](../../docs/FRONTEND_PROJECT_STANDARD.md).

## Cấu trúc đã migrate

| Thư mục | Nội dung | Gom từ (cũ) |
|---|---|---|
| `api/` | Tất cả `*.api.ts` (axios calls theo domain) | `src/api` |
| `components/` | Component dùng chung: `@extended`, `atoms`, `molecules`, `organisms`, `template`, `third-party`, `ul-config`, `MainCard`, `Loadable`… | `src/components` |
| `components/layout/` | Layout chính (CommonLayout, MainLayout/Drawer, MainLayout/Header) | `src/layout` |
| `hooks/` | Hook dùng chung + các `useHandleX` (data) | `src/hooks` |
| `store/` | Redux store + reducers (auth, menu, snackbar, calendar) | `src/store` |
| `themes/` | MUI ThemeCustomization (app-wide) | `src/themes` |
| `menu-items/` | Cấu hình navigation | `src/menu-items` |
| `contexts/` | JWTContext, ConfigContext | `src/contexts` |
| `types/` | **TẤT CẢ** TypeScript types (gồm `overrides/`) | `src/types` |
| `utils/` | Helper chung: axios, axiosGosafe, dateFormat, crypto, regex, route-guard… | `src/utils` |

> Stack giữ nguyên (MUI/Redux/Formik). `App.tsx`, `main`/`index.tsx`, `routes/`, `assets/`, `config.ts`, `settings.ts`, `styles/` → giữ ở `src/` root.
>
> **Import:** alias `shared` + `features` (đã thêm vào `vite.config.ts`); alias cũ (`components`, `utils`…) được repoint sang vị trí mới để an toàn. `tsconfig` `baseUrl: "src"`.
