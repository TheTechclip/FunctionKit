"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const VIEWPORT_PORTAL_ROOT_ID = "viewport-portal-root";

export function getViewportPortalRoot() {
  if (typeof document === "undefined") {
    return null;
  }

  const existingRoot = document.getElementById(VIEWPORT_PORTAL_ROOT_ID);
  if (existingRoot instanceof HTMLDivElement) {
    return existingRoot;
  }

  const root = document.createElement("div");
  root.id = VIEWPORT_PORTAL_ROOT_ID;
  root.setAttribute("data-viewport-portal-root", "true");
  root.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;";
  document.body.appendChild(root);
  return root;
}

type ViewportPortalProps = {
  children: React.ReactNode;
};

export function ViewportPortal({ children }: ViewportPortalProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(getViewportPortalRoot());
  }, []);

  if (!root) return null;
  return createPortal(children, root);
}
