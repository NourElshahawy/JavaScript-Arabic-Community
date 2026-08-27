"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

const COOKIE_KEY = "jsac-sidebar-collapsed";

// `defaultCollapsed` comes from the cookie read server-side in the layout,
// so the first render already matches the user's choice — no expand/collapse
// flash on load. The toggle writes the cookie back for the next request.
export function MainGrid({ children, defaultCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        document.cookie = `${COOKIE_KEY}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        // Non-fatal — the toggle still applies for this session.
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
