"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// next-themes injects an inline <script> to set the theme class before
// hydration (avoiding a flash of the wrong theme). React 19 warns whenever
// a <script> tag is rendered inside a component, which next-themes hasn't
// been updated to handle. The warning is a known false positive and does
// not affect functionality: https://github.com/pacocoursey/next-themes/issues/387
// We filter just this one message so real errors still show up normally.
if (typeof window !== "undefined") {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return
    }
    originalError(...args)
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}