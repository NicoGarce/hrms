"use client"

import { useEffect, useRef } from "react"

function hexToRgb(hex: string) {
  const h = hex.replace("#", "")
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  }
}

function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

function lighten(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  const l = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount))
  return `rgb(${l(r)}, ${l(g)}, ${l(b)})`
}

function darken(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  const d = (c: number) => Math.max(0, Math.round(c - c * amount))
  return `rgb(${d(r)}, ${d(g)}, ${d(b)})`
}

function applyCustom(theme: string) {
  const parts = theme.split("_")
  if (parts[0] !== "custom" || parts.length < 4) return
  const bg = parts[1]
  const primary = parts[2]
  const sidebar = parts[3]

  const bgRgb = hexToRgb(bg)
  const fgLum = luminance(bgRgb.r, bgRgb.g, bgRgb.b)
  const fg = fgLum > 0.5 ? "#1a1a2e" : "#f0f0f0"

  const root = document.documentElement
  root.setAttribute("data-theme", "custom")
  root.style.setProperty("--background", bg)
  root.style.setProperty("--foreground", fg)
  root.style.setProperty("--card", fgLum > 0.5 ? "#ffffff" : "#1e1e2e")
  root.style.setProperty("--card-foreground", fg)
  root.style.setProperty("--popover", fgLum > 0.5 ? "#ffffff" : "#1e1e2e")
  root.style.setProperty("--popover-foreground", fg)

  root.style.setProperty("--primary", primary)
  const pRgb = hexToRgb(primary)
  const pLum = luminance(pRgb.r, pRgb.g, pRgb.b)
  root.style.setProperty("--primary-foreground", pLum > 0.5 ? "#1a1a2e" : "#ffffff")

  root.style.setProperty("--secondary", fgLum > 0.5 ? lighten(bg, 0.3) : darken(bg, 0.3))
  root.style.setProperty("--secondary-foreground", fg)
  root.style.setProperty("--muted", fgLum > 0.5 ? lighten(bg, 0.15) : darken(bg, 0.15))
  root.style.setProperty("--muted-foreground", fgLum > 0.5 ? "#6b7280" : "#9ca3af")
  root.style.setProperty("--accent", fgLum > 0.5 ? lighten(bg, 0.4) : darken(bg, 0.4))
  root.style.setProperty("--accent-foreground", fg)
  root.style.setProperty("--destructive", fgLum > 0.5 ? "#dc2626" : "#ef4444")
  root.style.setProperty("--border", fgLum > 0.5 ? darken(bg, 0.08) : lighten(bg, 0.08))
  root.style.setProperty("--input", fgLum > 0.5 ? darken(bg, 0.08) : lighten(bg, 0.08))
  root.style.setProperty("--ring", primary)

  root.style.setProperty("--chart-1", primary)
  const c2 = pLum > 0.5 ? darken(primary, 0.15) : lighten(primary, 0.15)
  root.style.setProperty("--chart-2", c2)
  const c3 = pLum > 0.5 ? lighten(primary, 0.3) : darken(primary, 0.3)
  root.style.setProperty("--chart-3", c3)
  root.style.setProperty("--chart-4", fgLum > 0.5 ? "#d97706" : "#f59e0b")
  root.style.setProperty("--chart-5", fgLum > 0.5 ? "#6b7280" : "#9ca3af")

  root.style.setProperty("--sidebar", sidebar)
  const sRgb = hexToRgb(sidebar)
  const sLum = luminance(sRgb.r, sRgb.g, sRgb.b)
  const sFg = sLum > 0.5 ? "#1a1a2e" : "#f0f0f0"
  root.style.setProperty("--sidebar-foreground", sFg)
  root.style.setProperty("--sidebar-primary", primary)
  root.style.setProperty("--sidebar-primary-foreground", pLum > 0.5 ? "#1a1a2e" : "#ffffff")
  root.style.setProperty("--sidebar-accent", sLum > 0.5 ? darken(sidebar, 0.1) : lighten(sidebar, 0.1))
  root.style.setProperty("--sidebar-accent-foreground", sFg)
  root.style.setProperty("--sidebar-border", sLum > 0.5 ? darken(sidebar, 0.08) : lighten(sidebar, 0.08))
  root.style.setProperty("--sidebar-ring", primary)
}

function removeCustom() {
  const root = document.documentElement
  root.removeAttribute("data-theme")
  const props = [
    "--background", "--foreground", "--card", "--card-foreground",
    "--popover", "--popover-foreground", "--primary", "--primary-foreground",
    "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
    "--accent", "--accent-foreground", "--destructive", "--border", "--input", "--ring",
    "--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5",
    "--sidebar", "--sidebar-foreground", "--sidebar-primary", "--sidebar-primary-foreground",
    "--sidebar-accent", "--sidebar-accent-foreground", "--sidebar-border", "--sidebar-ring",
  ]
  for (const p of props) root.style.removeProperty(p)
}

export function ThemeApplier({ theme }: { theme: string }) {
  const prevRef = useRef(theme)

  useEffect(() => {
    if (theme.startsWith("custom_")) {
      applyCustom(theme)
    } else {
      if (prevRef.current.startsWith("custom_")) removeCustom()
      document.documentElement.setAttribute("data-theme", theme)
    }
    prevRef.current = theme
  }, [theme])

  return null
}
