import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastMessage, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => {
    addToast({ type: "success", title: title || "Success", message });
  }, [addToast]);

  const error = useCallback((message: string, title?: string) => {
    addToast({ type: "error", title: title || "Error", message, duration: 6000 });
  }, [addToast]);

  const warning = useCallback((message: string, title?: string) => {
    addToast({ type: "warning", title: title || "Warning", message });
  }, [addToast]);

  const info = useCallback((message: string, title?: string) => {
    addToast({ type: "info", title: title || "Note", message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxWidth: "420px",
          width: "calc(100% - 2.5rem)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          let bg = "var(--bg-card)";
          let border = "var(--border-color)";
          let icon = <Info size={20} color="var(--primary)" />;

          if (toast.type === "success") {
            border = "rgba(16, 185, 129, 0.4)";
            icon = <CheckCircle2 size={20} color="var(--accent-emerald)" />;
          } else if (toast.type === "error") {
            border = "rgba(244, 63, 94, 0.4)";
            icon = <AlertCircle size={20} color="var(--accent-rose)" />;
          } else if (toast.type === "warning") {
            border = "rgba(245, 158, 11, 0.4)";
            icon = <AlertTriangle size={20} color="var(--accent-amber)" />;
          }

          return (
            <div
              key={toast.id}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: "var(--radius-md)",
                padding: "0.875rem 1rem",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                pointerEvents: "auto",
                animation: "slideUp 0.2s ease-out",
              }}
            >
              <div style={{ flexShrink: 0, marginTop: "2px" }}>{icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "2px" }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "2px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
