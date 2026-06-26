import { useEffect, useRef, useCallback, useState } from 'react';
import { ApiDevice } from 'shared/api/gosafe.tracking.api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SSEStatus =
  | 'idle'          // chưa khởi động
  | 'connecting'    // đang kết nối lần đầu
  | 'connected'     // đang nhận dữ liệu
  | 'disconnected'  // mất kết nối, đang chờ reconnect
  | 'unsupported';  // browser không hỗ trợ EventSource

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Kết nối SSE tới GoSafe backend để nhận vị trí thiết bị real-time.
 *
 * - Tự động reconnect với exponential backoff khi mất kết nối
 * - Tự pause khi tab bị ẩn (visibility hidden), resume khi tab active lại
 * - `onDevices` luôn được gọi qua ref → callback không cần stable reference
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

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const esRef             = useRef<EventSource | null>(null);
  const backoffRef        = useRef(INITIAL_BACKOFF_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeEventSource = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearReconnectTimer();
    closeEventSource();
  }, [clearReconnectTimer, closeEventSource]);

  // ── Parse helper: hỗ trợ các dạng BE có thể trả về ──────────────────
  // Stream push từng device: single object, { data: device }, [ ...devices ]

  const parseDevices = (raw: unknown): ApiDevice[] => {
    if (Array.isArray(raw)) return raw as ApiDevice[];
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r?.data)) return r.data as ApiDevice[];
    // { data: { device_imei: ... } } — wrapped single device
    if (r?.data && typeof (r.data as any).device_imei === 'string') return [r.data as ApiDevice];
    // { device_imei: ... } — single device at root
    if (typeof r?.device_imei === 'string') return [raw as ApiDevice];
    return [];
  };

  // ── Connect ───────────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    if (!enabledRef.current) return;

    if (!window.EventSource) {
      setStatus('unsupported');
      return;
    }

    cleanup();
    setStatus('connecting');

    const es = new EventSource(SSE_URL, { withCredentials: false });
    esRef.current = es;

    // ── Kết nối thành công ────────────────────────────────────────────────
    es.onopen = () => {
      setStatus('connected');
      backoffRef.current = INITIAL_BACKOFF_MS; // reset backoff
    };

    // ── Handler chung — dùng cho cả named event lẫn fallback ─────────────
    const handleData = (e: MessageEvent) => {
      try {
        const devices = parseDevices(JSON.parse(e.data as string));
        if (devices.length > 0) {
          onDevicesRef.current(devices);
          setLastUpdate(new Date());
        }
      } catch {
        // JSON malformed — bỏ qua, không crash
      }
    };

    // Named event: BE gửi `event: device-update\ndata: {...}\n\n`
    es.addEventListener('device-update', handleData);

    // Fallback: BE gửi `data: {...}\n\n` (không có event name)
    es.onmessage = handleData;

    // ── Lỗi / mất kết nối → reconnect với backoff ────────────────────────
    es.onerror = () => {
      closeEventSource();
      if (!enabledRef.current) return;

      setStatus('disconnected');

      const delay = backoffRef.current;
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);

      reconnectTimerRef.current = setTimeout(() => {
        if (enabledRef.current) connect();
      }, delay);
    };
  }, [cleanup, closeEventSource]);

  // ── Effect chính: start/stop dựa trên enabled + tab visibility ───────────

  useEffect(() => {
    if (!enabled) {
      cleanup();
      setStatus('idle');
      return;
    }

    connect();

    // Pause khi tab ẩn để tiết kiệm tài nguyên server
    const onVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
        setStatus('disconnected');
      } else {
        // Tab active lại → reset backoff và kết nối lại ngay
        backoffRef.current = INITIAL_BACKOFF_MS;
        connect();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, connect, cleanup]);

  return { status, lastUpdate };
}
