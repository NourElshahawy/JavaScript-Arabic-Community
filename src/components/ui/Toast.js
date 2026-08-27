"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

// App-wide toast stack. The `.toast` / `.toast-stack` classes already exist
// in components.css but had no producer — this is it. Mounted once in the
// root layout; call `useToast()` anywhere under it.
const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { type = "info", duration = 3400 } = {}) => {
      const id = ++nextId;
      setToasts((list) => [...list, { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = t.type === "success" ? CheckCircle2 : t.type === "error" ? AlertCircle : Info;
          return (
            <div key={t.id} className="toast" data-type={t.type}>
              <Icon size={16} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="إغلاق"
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// Returns show(message, { type: "success" | "error" | "info", duration }).
// Safe to call even if no provider is mounted (no-op).
export function useToast() {
  return useContext(ToastContext) ?? (() => {});
}
