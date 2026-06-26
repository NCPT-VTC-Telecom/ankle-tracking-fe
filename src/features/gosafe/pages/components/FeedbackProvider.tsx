import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { Dialog, Box, Stack, Typography, Button, Snackbar, Alert, Slide } from '@mui/material';
import type { SlideProps } from '@mui/material';
import { Trash, Warning2, InfoCircle, TickCircle, CloseCircle } from 'iconsax-react';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** 'danger' → nút đỏ + icon thùng rác (mặc định cho xóa) */
  tone?: 'danger' | 'primary';
}

interface FeedbackCtx {
  /** Hỏi xác nhận, resolve true nếu người dùng đồng ý */
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  /** Hiện toast phản hồi (mặc định success) */
  notify: (message: string, severity?: Severity) => void;
}

const Ctx = createContext<FeedbackCtx | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useFeedback(): FeedbackCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFeedback phải nằm trong <FeedbackProvider>');
  return c;
}

const SlideUp = (props: SlideProps) => <Slide {...props} direction="up" />;

const TONE = {
  danger: { color: '#dc2626', icon: <Trash size={26} variant="Bold" color="#dc2626" /> },
  primary: { color: '#2563eb', icon: <Warning2 size={26} variant="Bold" color="#2563eb" /> }
};

const SEVERITY_ICON: Record<Severity, ReactNode> = {
  success: <TickCircle size={20} variant="Bold" />,
  error: <CloseCircle size={20} variant="Bold" />,
  warning: <Warning2 size={20} variant="Bold" />,
  info: <InfoCircle size={20} variant="Bold" />
};

export default function FeedbackProvider({ isDark = false, children }: { isDark?: boolean; children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{ open: boolean; opts: ConfirmOptions }>({ open: false, opts: { message: '' } });
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: Severity }>({ open: false, message: '', severity: 'success' });

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmState({ open: true, opts });
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const close = (result: boolean) => {
    setConfirmState((s) => ({ ...s, open: false }));
    resolver.current?.(result);
    resolver.current = null;
  };

  const notify = useCallback((message: string, severity: Severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const { opts } = confirmState;
  const tone = TONE[opts.tone ?? 'danger'];

  return (
    <Ctx.Provider value={{ confirm, notify }}>
      {children}

      {/* ── Confirm dialog ── */}
      <Dialog
        open={confirmState.open}
        onClose={() => close(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            p: 0.5,
            maxWidth: 420,
            bgcolor: isDark ? '#0d1224' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: `${tone.color}14`, border: `1px solid ${tone.color}30` }}>
              {tone.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: isDark ? '#f8fafc' : '#0f172a', mb: 0.5 }}>
                {opts.title ?? 'Xác nhận'}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
                {opts.message}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button onClick={() => close(false)} sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary', px: 2.5 }}>
              {opts.cancelText ?? 'Hủy'}
            </Button>
            <Button
              variant="contained"
              onClick={() => close(true)}
              sx={{ borderRadius: 2, fontWeight: 700, px: 3, bgcolor: tone.color, '&:hover': { bgcolor: tone.color, filter: 'brightness(0.92)' } }}
            >
              {opts.confirmText ?? 'Xác nhận'}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={SlideUp}
      >
        <Alert
          variant="filled"
          severity={toast.severity}
          icon={SEVERITY_ICON[toast.severity]}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600, alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', '& .MuiAlert-icon': { alignItems: 'center' } }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Ctx.Provider>
  );
}
