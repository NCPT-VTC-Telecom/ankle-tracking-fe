import { useEffect, useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { ApiDevice } from 'shared/api/gosafe.tracking.api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SSEStatus =
  | 'idle'          // chưa khởi động
  | 'connecting'    // đang kết nối lần đầu
  | 'connected'     // đang nhận dữ liệu
  | 'disconnected'; // mất kết nối, đang chờ reconnect

export interface UseGosafeSSEReturn {
  /** Trạng thái kết nối hiện tại */
  status: SSEStatus;
  /** Thời điểm nhận được packet GPS gần nhất */
  lastUpdate: Date | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

// Dùng cùng base URL logic với axiosGosafe.ts
const SSE_BASE = import.meta.env.DEV
  ? '/api/gosafe'
  : (import.meta.env.VITE_APP_BACKEND_API_GOSAFE ?? 'https://gosafe.vtctelecom.com.vn/api/gosafe');

/** GET /v1/gps_tracking/stream — thêm ?imei=xxx để lọc 1 thiết bị cụ thể */
export const SSE_URL = `${SSE_BASE}/v1/gps_tracking/stream`;

const INITIAL_BACKOFF_MS = 1_000;  // 1s lần reconnect đầu
const MAX_BACKOFF_MS     = 30_000; // tối đa 30s giữa các lần reconnect

/** Lỗi không thể phục hồi (vd 401/403) → dừng retry, không spam server. */
class FatalSSEError extends Error {}

// ── Parse helper: hỗ trợ các dạng BE có thể trả về ──────────────────
// Stream push từng device: single object, { data: device }, [ ...devices ]
const parseDevices = (raw: unknown): ApiDevice[] => {
  if (Array.isArray(raw)) return raw as ApiDevice[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r?.data)) return r.data as ApiDevice[];
  // Batch lồng dưới khoá: { data: { devices: [...] } }
  if (Array.isArray((r?.data as any)?.devices)) return (r.data as any).devices as ApiDevice[];
  if (Array.isArray((r as any)?.devices)) return (r as any).devices as ApiDevice[];
  // Single device: { data: { device_imei } } hoặc { device_imei }
  if (r?.data && typeof (r.data as any).device_imei === 'string') return [r.data as ApiDevice];
  if (typeof r?.device_imei === 'string') return [raw as ApiDevice];
  return [];
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Kết nối SSE tới GoSafe backend để nhận vị trí thiết bị real-time.
 *
 * Dùng @microsoft/fetch-event-source (fetch + ReadableStream) thay cho native
 * EventSource — vì native EventSource KHÔNG gửi được header. Ở đây ta đính
 * `Authorization: Bearer <gosafe_token>` để stream được xác thực (BE mới đẩy
 * location/id về). Thư viện tự:
 *  - reconnect (ta điều khiển backoff qua onerror trả về số ms)
 *  - pause khi tab ẩn + resume bằng Last-Event-ID khi tab hiện lại (openWhenHidden:false)
 *
 * @param onDevices  Callback nhận mảng ApiDevice mỗi khi BE push update
 * @param enabled    Tắt SSE hoàn toàn khi false (dùng khi route unmount)
 */
export function useGosafeSSE(
  onDevices: (devices: ApiDevice[]) => void,
  enabled = true,
): UseGosafeSSEReturn {
  const [status, setStatus]         = useState<SSEStatus>('idle');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Dùng ref để callback mới nhất luôn được dùng mà không cần restart SSE
  const onDevicesRef = useRef(onDevices);
  onDevicesRef.current = onDevices;

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    const ctrl = new AbortController();
    let backoff = INITIAL_BACKOFF_MS;
    setStatus('connecting');

    const token = localStorage.getItem('gosafe_token');

    fetchEventSource(SSE_URL, {
      signal: ctrl.signal,
      // Tự đóng khi tab ẩn, mở lại (kèm Last-Event-ID) khi tab active → tiết kiệm.
      openWhenHidden: false,
      headers: {
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      async onopen(res) {
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('text/event-stream')) {
          setStatus('connected');
          backoff = INITIAL_BACKOFF_MS; // reset backoff khi mở thành công
          return;
        }
        // Token sai/hết hạn → dừng hẳn (xoá token để REST fallback xử lý)
        if (res.status === 401 || res.status === 403) {
          try { localStorage.removeItem('gosafe_token'); } catch { /* ignore */ }
          throw new FatalSSEError(`SSE auth failed (${res.status})`);
        }
        throw new Error(`SSE bad response (${res.status})`);
      },
      onmessage(ev) {
        if (!ev.data) return; // bỏ heartbeat/comment ": ping"
        try {
          const devices = parseDevices(JSON.parse(ev.data));
          if (devices.length > 0) {
            onDevicesRef.current(devices);
            setLastUpdate(new Date());
          }
        } catch {
          // JSON malformed — bỏ qua, không crash
        }
      },
      onclose() {
        // Server đóng stream → ném để thư viện gọi onerror và reconnect.
        throw new Error('SSE closed by server');
      },
      onerror(err) {
        if (err instanceof FatalSSEError) {
          setStatus('disconnected');
          throw err; // dừng retry
        }
        setStatus('disconnected');
        const delay = backoff;
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
        return delay; // reconnect sau `delay` ms (exponential backoff)
      },
    }).catch(() => {
      // bị abort (unmount/disable) hoặc lỗi fatal — không cần xử lý thêm
    });

    return () => {
      ctrl.abort();
      setStatus('idle');
    };
  }, [enabled]);

  return { status, lastUpdate };
}
