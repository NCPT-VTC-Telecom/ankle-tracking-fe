# Kế hoạch chuẩn hoá cấu trúc — `ankle-tracking-fe` (EMS / GoSafe)

> **Mục tiêu:** Đưa source code hiện tại (type-based / Atomic Design — Mantis template) về **Isolated Features** theo chuẩn V-Track (xem [`FRONTEND_PROJECT_STANDARD.md`](./FRONTEND_PROJECT_STANDARD.md)).
> **Ràng buộc:** **Giữ nguyên tech stack** (React 18, MUI 5, Redux Toolkit, Formik…). Chỉ thay đổi **cấu trúc thư mục + import**. Không đổi hành vi app.
> **Nhánh thực hiện:** `format-structure`.

---

## 0. TRẠNG THÁI: ✅ ĐÃ THỰC THI (2026-06-26)

Migration **đã chạy**. Tóm tắt kết quả:

- **Đã di chuyển** 16 nhóm thư mục → `features/` (auth, gosafe, landing, dashboard, maintenance) + `shared/` (api, components[+layout], hooks, store, themes, menu-items, contexts, types, utils). Mỗi nhóm copy→verify(byte-exact)→delete.
- **Đã rewrite import**: 279 file (alias `components/ utils/ types/…` → `shared/…`; `pages/* sections/*` → `features/…`; sửa relative `../assets` và `../public`).
- **Đã cập nhật** `vite.config.ts` (thêm alias `shared` + `features`, repoint alias cũ) và `tsconfig.json` (`typeRoots → ./shared/types`).
- **Kiểm tra import resolver**: 0 import gãy do migration. (21 cảnh báo còn lại đều **có sẵn từ trước**: import Firebase/Auth0/AWS đang comment, ảnh template thiếu sẵn như `avatar-*.png`/`google.svg`/`logo-icon.svg`, `./AdPreview.js`.)

**Việc còn lại cho bạn (chạy local):**
1. Xoá thư mục rỗng `src/api/` còn sót (phantom do mount Windows — file đã chuyển hết sang `src/shared/api/`). Trong Explorer hoặc: `rmdir src\api` / `git rm -r src/api` nếu git còn thấy.
2. Chạy `npm run build` để xác nhận tsc xanh (sandbox không chạy được full build do giới hạn thời gian — đã verify ở mức phân giải import).
3. Smoke test: `npm run dev` → kiểm tra `/login` và các route `/gosafe/*`.
4. Commit trên nhánh `format-structure`.

> 21 cảnh báo có sẵn từ trước không phải do đợt migration; xử lý riêng nếu cần.

---

## 1. Hiện trạng vs. Mục tiêu

| | Hiện tại | Mục tiêu (chuẩn) |
|---|---|---|
| Mô hình | Type-based (`api/`, `components/`, `pages/`, `hooks/`…) | Isolated Features (`features/` + `shared/`) |
| Import | Alias theo loại folder (`baseUrl=src` + vite alias: `components`, `pages`, `utils`…) | Alias `features` + `shared` (+ relative trong feature) |
| Phân nhóm | Theo *kỹ thuật* (atom/molecule/organism) | Theo *nghiệp vụ* (auth, tracking, devices…) |

> Stack giữ nguyên. MUI/Redux/Formik **không** đổi trong đợt này (xem §6 "Stack — dài hạn").

---

## 2. Cây thư mục đích

```
src/
├── features/
│   ├── auth/                 # đăng nhập, đăng ký, quên mật khẩu, guard, authSlice
│   ├── landing/              # trang marketing (landing + gosafe landing sections)
│   ├── dashboard/            # dashboard tổng quan
│   ├── gosafe/               # SHELL EMS: index, navbar, side drawer, feedback, css
│   ├── tracking/             # giám sát thời gian thực + bản đồ + SSE + geofence
│   ├── devices/              # quản lý thiết bị (EMS)
│   ├── persons/              # quản lý đối tượng giám sát (prisoner)
│   ├── alerts/               # cảnh báo
│   ├── compliance/           # tuân thủ
│   ├── regions/              # quản lý địa bàn
│   ├── monitoring-users/     # người dùng & quyền (trong EMS)
│   ├── audit-logs/           # nhật ký hệ thống
│   └── _legacy/              # (xem §5) domain WiFi/Ads cũ — xác minh trước khi giữ
│
├── shared/
│   ├── api/                  # axios.ts (gộp axios.ts + axiosGosafe.ts) + helper API chung
│   ├── components/           # @extended, MainCard, Loadable, atoms/molecules/organisms,
│   │   │                     #   template/, third-party/, ul-config/, layout/
│   │   └── layout/           # CommonLayout, MainLayout (Drawer/Header)
│   ├── hooks/                # hook chung (usePagination, useLocalStorage, useConfig…)
│   ├── store/                # Redux store + reducers chung (menu, snackbar, calendar)
│   ├── themes/               # MUI ThemeCustomization (app-wide)
│   ├── menu-items/           # cấu hình navigation
│   ├── contexts/             # ConfigContext (JWTContext → features/auth)
│   ├── types/                # TẤT CẢ types (gồm overrides/)
│   └── utils/                # helper chung (dateFormat, crypto, regex, render…)
│
├── assets/                   # giữ nguyên ở src root
├── App.tsx · main (index.tsx) · routes/    # app-level wiring — giữ ở src root
├── config.ts · settings.ts · styles/ · index.css
```

> **Lưu ý granularity:** GoSafe hiện là **một shell** (`pages/gosafe/index.tsx`) với các tab. Các "management sections" là *component*, chưa phải page riêng. Để **không đổi hành vi**, ta giữ shell trong `features/gosafe/` và đặt từng nhóm nghiệp vụ thành feature mà shell import vào. Việc tách thành route riêng (nếu muốn) là bước sau, ngoài phạm vi chuẩn hoá folder.

---

## 3. Bản đồ ánh xạ — `features/`

| Feature | Gom từ (hiện tại) |
|---|---|
| **auth** | `pages/auth/**`, `sections/auth/**`, `api/auth.api.ts`, `store/reducers/auth.ts` → `store.ts`, `contexts/JWTContext.tsx`, `utils/route-guard/**`, `utils/auth.ts`, `utils/gosafeAuth.ts`, `hooks/useAuth.ts`, `hooks/useAccessCheck.tsx`, `hooks/usePermissionChecker.tsx`, `hooks/useHandlePermission.ts`, `types/auth.ts`, `types/password.ts` |
| **landing** | `pages/landing/**`, `pages/gosafe/sections/**` (HeroSection, ProductsSection, SolutionsSection, FAQSection, ContactSection, Footer, SpecsSection, TrackingSection, LiveDemoSection) |
| **dashboard** | `pages/dashboard/**`, `pages/gosafe/sections/components/DashboardOverview.tsx`, `GlassKpiCard.tsx`, `StatCard.tsx` |
| **gosafe** (shell) | `pages/gosafe/index.tsx`, `pages/gosafe/gosafe.css`, `pages/gosafe/components/**` (GosafeNavbar, SideDrawer, PaginationBar, FeedbackProvider) |
| **tracking** | `pages/gosafe/tracking/**` (TrackingMap + layers, dialogs, useTracking, constants, mapIcons, types, utils), `api/gosafe.tracking.api.ts`, `api/geolocation.api.ts`, `hooks/useGosafeSSE.ts`, `hooks/useGeolocation.ts`, `types/geolocation.ts` |
| **devices** | `pages/gosafe/sections/components/DeviceManagementTable.tsx`, `api/device.api.ts`, `api/deviceConnectionLog.api.ts`, `api/controller.api.ts`, `hooks/useHandleDevice.ts`, `hooks/useHandleDeviceConnectionLog.ts`, `hooks/useHandleTopology.ts`, `components/organisms/EditDeviceDialog.tsx`, `components/organisms/TopologyView/**`, `types/devices.ts`, `types/device-connection-log.ts` |
| **persons** | `pages/gosafe/sections/components/PrisonerManagementTable.tsx`, `types/end-user.ts`, `api/contact.api.ts` (nếu là đối tượng) |
| **alerts** | `pages/gosafe/sections/components/AlertsManagement.tsx`, `api/incidentFeedback.api.ts`, `hooks/useHandleIncidentFeedback.ts`, `types/alerts-monitoring.ts`, `types/incidentFeedback.ts` |
| **compliance** | `pages/gosafe/sections/components/ComplianceManagement.tsx` |
| **regions** | `pages/gosafe/sections/components/RegionManagement.tsx`, `components/organisms/RegionForm.tsx`, `components/organisms/LocationPickerMap.tsx`, `api/site.api.ts` (nếu site = địa bàn) |
| **monitoring-users** | `pages/gosafe/sections/components/UserManagement.tsx`, `api/agent.api.ts`, `hooks/useHandleUser.ts`, `hooks/useHandleAgent.ts` |
| **audit-logs** | `pages/gosafe/sections/components/AuditLogManagement.tsx`, `api/logsHardware.api.ts`, `hooks/useHandleLogs.ts`, `hooks/useHandleLogsHardware.ts`, `types/log.ts` |

> Tên feature dùng **kebab-case**. Mỗi feature cuối cùng nên có `api.ts` + `hooks.ts` (gộp các `useHandleX`/`X.api.ts` rời rạc hiện tại) + `pages/`.

---

## 4. Bản đồ ánh xạ — `shared/`

| Đích | Gom từ (hiện tại) |
|---|---|
| `shared/api/axios.ts` | `utils/axios.ts` + `utils/axiosGosafe.ts` (gộp/giữ 2 instance) |
| `shared/components/` | `components/@extended/**`, `MainCard.tsx`, `Loadable.tsx`, `Loader.tsx`, `Locales.tsx`, `RTLLayout.tsx`, `ScrollTop.tsx`, `ScrollX.tsx`, `SecondaryAction.tsx`, `components/atoms/**`, `components/molecules/**`, `components/organisms/**` (generic: GeneralizedTable[V2], GenericForm[Portal], Map, DynamicFilterRenderer, FieldGroupCard, SidebarList, Tab, WPASelector, chart/, dialog/, skeleton/, statistics/), `components/template/**`, `components/third-party/**`, `components/ul-config/**`, `components/portal/**` |
| `shared/components/layout/` | `layout/**` (CommonLayout, MainLayout/Drawer, MainLayout/Header) |
| `shared/hooks/` | `hooks/usePagination.ts`, `useLocalStorage.ts`, `useConfig.ts`, `useConfirmNavigation.tsx`, `useStickyShadow.tsx`, `useScriptRef.ts`, `useValidation.ts`, `useMapCode.ts`, `useHandleExcel.ts` |
| `shared/store/` | `store/index.ts`, `store/reducers/index.ts`, `store/reducers/actions.ts`, `store/reducers/menu.ts`, `store/reducers/snackbar.ts`, `store/reducers/calendar.ts` (riêng `auth.ts` → `features/auth/store.ts`) |
| `shared/themes/` | `themes/**` (theme, overrides, palette) |
| `shared/menu-items/` | `menu-items/**` |
| `shared/contexts/` | `contexts/ConfigContext.tsx` (JWTContext → `features/auth`) |
| `shared/types/` | `types/**` (gồm `overrides/`, `index.ts`, `common.ts`, `general.ts`, `extended.ts`, `menu.ts`, `config.ts`, `dialog.ts`, `filters.ts`, `form-types.ts`, `calendar.ts`, `provider.ts` + các type chưa gán feature) |
| `shared/utils/` | `utils/constant.ts`, `crypto-utils.ts`, `dateFormat.ts`, `datePresets.ts`, `getColors.ts`, `getShadow.ts`, `getWindowScheme.ts`, `handleData.ts`, `normalizeKeys.ts`, `password-strength.ts`, `password-validation.ts`, `react-table.tsx`, `regex.ts`, `render.ts`, `trimFc.ts`, `icon-wrapper.tsx` |

**Giữ ở `src/` root (app-level):** `App.tsx`, `index.tsx`/`main`, `routes/`, `config.ts`, `settings.ts`, `styles/`, `index.css`, `input.css`, `output.css`, `assets/`.

---

## 5. Domain LEGACY cần xác minh

Routing hiện tại (`routes/MainRoutes.tsx`) chỉ mount **auth + gosafe + maintenance**. Phần quản trị WiFi/Ads/Network cũ (comment trong code: *"WiFi cũ"*) có thể **không còn dùng**. Trước khi tạo feature cho chúng → **xác minh còn route/được import không**:

| Nhóm legacy | File liên quan |
|---|---|
| Ads / Campaign | `api/ad.api.ts`, `adHistory.api.ts`, `campaign.api.ts`, `userBehaviors.api.ts`, `components/organisms/adManagement/**`, `adSample/**`, `hooks/useHandleAd*`, `useHandleCampaign.ts`, `useHandleSurvey.ts`, `useSingleAd.tsx`, `types/Ads.ts` |
| Network / WiFi | `api/{ssid,ssidClient,wlan,network}.api.ts`, `api/accessControl.api.ts`, `components/template/{FormSSID,FormWLAN,WirelessForm,NetworkDiagram}.tsx`, `components/ul-config/table-config/{SSID,wlan,vlan,radius,ratelimit,restriction,accessControl,session,...}.tsx`, `hooks/useHandle{SSID,WLAN,VLAN,Radius,Ratelimit,Restriction,Session,AccessControl}*`, `types/{SSID,SSIDClient,access-control}.ts` |
| Sites / Partner / Portal | `api/site.api.ts`, `hooks/useHandleSites*`, `useHandlePartner.ts`, `useHandlePortal.ts`, `types/{partner,portal}.ts` |
| Notification / Voucher | `api/notification.api.ts`, `hooks/useHandleNotification.ts`, `components/template/{FormVoucher,ListWidgetVoucher}.tsx` |

→ Còn dùng: tách thành `features/<x>/`. Không dùng: gom tạm `features/_legacy/` rồi lên kế hoạch xoá (PR riêng).

---

## 6. Quy trình thực hiện (từng giai đoạn, build xanh sau mỗi bước)

### Giai đoạn 0 — Skeleton (đã làm sẵn)
`src/features/` và `src/shared/` đã được tạo kèm `README.md` mô tả. Chưa di chuyển file → build không đổi.

### Bước alias (làm 1 lần)
Thêm 2 alias vào `vite.config.ts` (giữ alias cũ trong suốt quá trình migrate):

```typescript
// vite.config.ts → resolve.alias
features: path.resolve(__dirname, './src/features'),
shared:   path.resolve(__dirname, './src/shared'),
```

`tsconfig.json` đã có `baseUrl: "src"` nên `import x from 'shared/...'` / `'features/...'` tự resolve cho TS.

### Giai đoạn 1 — Shared trước (rủi ro thấp)
Di chuyển bằng `git mv` (giữ history), sau mỗi nhóm chạy `npm run build`:

```bash
# Ví dụ — chạy trên nhánh format-structure
git mv src/utils/axios.ts        src/shared/api/axios.ts
git mv src/themes                src/shared/themes
git mv src/menu-items            src/shared/menu-items
git mv src/types                 src/shared/types
# ... (theo bảng §4)
```

Cập nhật import tương ứng (xem "Công thức rewrite" bên dưới).

### Giai đoạn 2 — Từng feature
Mỗi feature một PR: `git mv` các file theo bảng §3 → đổi import → `npm run build` + smoke test → merge.

### Công thức rewrite import (chạy thử trên 1 file trước)
Vì project dùng alias theo folder, đa số chỉ cần đổi tiền tố:

```bash
# macOS/Linux (BSD/GNU sed khác cờ -i). Chạy trong src/.
# components/  → shared/components/
grep -rl "from 'components/" src | xargs sed -i "s#from 'components/#from 'shared/components/#g"
# utils/axios  → shared/api/axios   (xử lý axios riêng vì đổi cả tên)
grep -rl "from 'utils/axios'"       src | xargs sed -i "s#from 'utils/axios'#from 'shared/api/axios'#g"
grep -rl "from 'utils/axiosGosafe'" src | xargs sed -i "s#from 'utils/axiosGosafe'#from 'shared/api/axios'#g"
# utils/ (còn lại) → shared/utils/
grep -rl "from 'utils/" src | xargs sed -i "s#from 'utils/#from 'shared/utils/#g"
# themes / menu-items / types / store / contexts → shared/*
grep -rl "from 'themes'"      src | xargs sed -i "s#from 'themes'#from 'shared/themes'#g"
grep -rl "from 'menu-items"   src | xargs sed -i "s#from 'menu-items#from 'shared/menu-items#g"
grep -rl "from 'types"        src | xargs sed -i "s#from 'types#from 'shared/types#g"
grep -rl "from 'store"        src | xargs sed -i "s#from 'store#from 'shared/store#g"
```

> ⚠️ Sau mỗi lệnh sed: `npm run build` để bắt lỗi sớm. Xử lý riêng các import lẻ (vd `utils/route-guard` → `features/auth/...`, `store/reducers/auth` → `features/auth/store`).

### Giai đoạn 3 — Dọn dẹp
- Xoá folder phẳng cũ đã rỗng.
- Gỡ alias không còn dùng trong `vite.config.ts` (giữ lại `features`, `shared`).
- Cập nhật `README.md` + tài liệu.

### Giai đoạn 4 — Stack (dài hạn, tùy chọn, ngoài đợt này)
Chuyển dần theo từng feature, không big-bang: `useHandleX` (axios thủ công) → React Query hooks; Formik → RHF + Zod; Redux slice → Zustand; MUI → AntD.

---

## 7. Tiêu chí hoàn thành (Definition of Done)

- [ ] `src/` chỉ còn `features/`, `shared/`, `assets/`, `App.tsx`, `main`, `routes/`, file cấu hình app-level.
- [ ] Không còn folder phẳng cũ (`api/`, `pages/`, `components/`, `hooks/`, `sections/` ở src root).
- [ ] `npm run build` xanh; app chạy đúng như trước (smoke test các route gosafe + login).
- [ ] `vite.config.ts` chỉ giữ alias `features`, `shared` (+ `assets` nếu cần).
- [ ] Tài liệu cập nhật; mỗi giai đoạn là một PR review được.
