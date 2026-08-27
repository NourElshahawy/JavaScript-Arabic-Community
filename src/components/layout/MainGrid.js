"use client";

import { useEffect, useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

const STORAGE_KEY = "jsac-sidebar-collapsed";

export function MainGrid({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable (private mode, etc.) — default to expanded.
    }
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore — nothing to persist to, the toggle still works this session.
      }
      return next;
    });
  }

  return (
    <main className="app-main" data-sidebar={collapsed ? "collapsed" : "expanded"}>
      <div>{children}</div>
      <aside className="app-main__sidebar">
        <div className="card sidebar-card">
          <button
            type="button"
            className="btn btn--icon btn--sm sidebar-toggle"
            onClick={toggle}
            aria-label={collapsed ? "إظهار القائمة" : "إخفاء القائمة"}
            title={collapsed ? "إظهار القائمة" : "إخفاء القائمة"}
          >
            {collapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
          </button>
          <Sidebar />
        </div>
      </aside>
    </main>
  );
}
