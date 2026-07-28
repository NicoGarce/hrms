"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Palette, Save, Check, PaintBucket } from "lucide-react"
import { toast } from "sonner"

const themes = [
  { id: "teal", label: "Teal", bg: "#eef2f7", primary: "#1a6b73", sidebar: "#2a2f3e" },
  { id: "warm", label: "Warm", bg: "#f5f0e8", primary: "#9a7b4f", sidebar: "#2e2b26" },
  { id: "slate", label: "Slate", bg: "#f0f1f3", primary: "#5c5f6b", sidebar: "#2d2e33" },
  { id: "forest", label: "Forest", bg: "#eef3ec", primary: "#2d6e4f", sidebar: "#262e28" },
  { id: "dusk", label: "Dusk", bg: "#eeedf3", primary: "#4f46b3", sidebar: "#2a2833" },
]

function parseCustomTheme(value: string): { bg: string; primary: string; sidebar: string } | null {
  const parts = value.split("_")
  if (parts[0] !== "custom" || parts.length < 4) return null
  return { bg: parts[1], primary: parts[2], sidebar: parts[3] }
}

function buildCustomValue(bg: string, primary: string, sidebar: string) {
  return `custom_${bg}_${primary}_${sidebar}`
}

function isValidHex(h: string) {
  return /^#[0-9a-fA-F]{6}$/.test(h)
}

interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  logoUrl: string
  timezone: string
  currency: string
  theme: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    logoUrl: "",
    timezone: "UTC",
    currency: "USD",
    theme: "teal",
  })
  const [customBg, setCustomBg] = useState("#eef2f7")
  const [customPrimary, setCustomPrimary] = useState("#1a6b73")
  const [customSidebar, setCustomSidebar] = useState("#2a2f3e")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "SUPER_ADMINISTRATOR") {
        router.push("/dashboard")
        return
      }
      fetchSettings()
    }
  }, [status, session, router])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/company")
      const data = await response.json()
      setSettings(data)
      const parsed = parseCustomTheme(data.theme)
      if (parsed) {
        setCustomBg(parsed.bg)
        setCustomPrimary(parsed.primary)
        setCustomSidebar(parsed.sidebar)
      } else {
        const match = themes.find((t) => t.id === data.theme)
        if (match) {
          setCustomBg(match.bg)
          setCustomPrimary(match.primary)
          setCustomSidebar(match.sidebar)
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const payload = { ...settings }
    if (payload.theme === "custom") {
      if (!isValidHex(customBg) || !isValidHex(customPrimary) || !isValidHex(customSidebar)) {
        toast.error("Invalid hex color values")
        return
      }
      payload.theme = buildCustomValue(customBg, customPrimary, customSidebar)
    }
    setSaving(true)
    try {
      const response = await fetch("/api/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Settings saved successfully")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const isCustom = settings.theme === "custom"

  useEffect(() => {
    if (!isCustom || !isValidHex(customBg) || !isValidHex(customPrimary) || !isValidHex(customSidebar)) return
    const root = document.documentElement
    root.style.setProperty("--background", customBg)
    root.style.setProperty("--foreground", "#1a1a2e")
    root.style.setProperty("--card", "#ffffff")
    root.style.setProperty("--card-foreground", "#1a1a2e")
    root.style.setProperty("--popover", "#ffffff")
    root.style.setProperty("--popover-foreground", "#1a1a2e")
    root.style.setProperty("--primary", customPrimary)
    root.style.setProperty("--primary-foreground", "#ffffff")
    root.style.setProperty("--secondary", "#e8eaf0")
    root.style.setProperty("--secondary-foreground", "#1a1a2e")
    root.style.setProperty("--muted", "#eef0f4")
    root.style.setProperty("--muted-foreground", "#6b7280")
    root.style.setProperty("--accent", "#dcdfe8")
    root.style.setProperty("--accent-foreground", "#1a1a2e")
    root.style.setProperty("--destructive", "#dc2626")
    root.style.setProperty("--border", "#d4d7e0")
    root.style.setProperty("--input", "#d4d7e0")
    root.style.setProperty("--ring", customPrimary)
    root.style.setProperty("--chart-1", customPrimary)
    root.style.setProperty("--chart-2", "#6b7280")
    root.style.setProperty("--chart-3", "#9ca3af")
    root.style.setProperty("--chart-4", "#d97706")
    root.style.setProperty("--chart-5", "#6b7280")
    root.style.setProperty("--sidebar", customSidebar)
    root.style.setProperty("--sidebar-foreground", "#f0f0f0")
    root.style.setProperty("--sidebar-primary", customPrimary)
    root.style.setProperty("--sidebar-primary-foreground", "#ffffff")
    root.style.setProperty("--sidebar-accent", "#383a45")
    root.style.setProperty("--sidebar-accent-foreground", "#f0f0f0")
    root.style.setProperty("--sidebar-border", "rgba(255,255,255,0.08)")
    root.style.setProperty("--sidebar-ring", customPrimary)
  }, [isCustom, customBg, customPrimary, customSidebar])

  const selectPreset = (id: string) => {
    setSettings({ ...settings, theme: id })
    const match = themes.find((t) => t.id === id)
    if (match) {
      setCustomBg(match.bg)
      setCustomPrimary(match.primary)
      setCustomSidebar(match.sidebar)
    }
  }

  const selectCustom = () => {
    setSettings({ ...settings, theme: "custom" })
  }

  if (status === "loading") return null

  if (session?.user?.role !== "SUPER_ADMINISTRATOR") {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Access restricted to SUPER_ADMINISTRATOR</div>
        </div>
      </div>
    )
  }

  return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Company Settings</h1>
          <p className="text-muted-foreground">Manage company information</p>
        </div>

        <Card accent="slate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timezone</label>
                    <Input
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Currency</label>
                    <Input
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card accent="slate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              UI Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectPreset(t.id)}
                  className="relative flex flex-col items-center gap-2 rounded-lg border bg-card p-3 transition-all hover:bg-accent data-[selected=true]:ring-2 data-[selected=true]:ring-primary"
                  data-selected={settings.theme === t.id}
                >
                  <div className="flex rounded-lg overflow-hidden ring-1 ring-foreground/10 h-10 w-full">
                    <div className="flex-1" style={{ background: t.bg }} />
                    <div className="w-3" style={{ background: t.primary }} />
                    <div className="w-4" style={{ background: t.sidebar }} />
                  </div>
                  <span className="text-xs font-medium">{t.label}</span>
                  {settings.theme === t.id && (
                    <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
              <button
                onClick={selectCustom}
                className="relative flex flex-col items-center gap-2 rounded-lg border bg-card p-3 transition-all hover:bg-accent data-[selected=true]:ring-2 data-[selected=true]:ring-primary"
                data-selected={isCustom}
              >
                <div className="flex rounded-lg overflow-hidden ring-1 ring-foreground/10 h-10 w-full items-center justify-center bg-muted">
                  <PaintBucket className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium">Custom</span>
                {isCustom && (
                  <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            </div>

            {isCustom && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border" style={{ background: customBg }} />
                    Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="h-8 w-8 rounded border cursor-pointer bg-transparent"
                    />
                    <Input
                      value={customBg}
                      onChange={(e) => {
                        const v = e.target.value
                        setCustomBg(v.startsWith("#") ? v : `#${v}`)
                      }}
                      placeholder="#eef2f7"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border" style={{ background: customPrimary }} />
                    Primary
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="h-8 w-8 rounded border cursor-pointer bg-transparent"
                    />
                    <Input
                      value={customPrimary}
                      onChange={(e) => {
                        const v = e.target.value
                        setCustomPrimary(v.startsWith("#") ? v : `#${v}`)
                      }}
                      placeholder="#1a6b73"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border" style={{ background: customSidebar }} />
                    Sidebar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customSidebar}
                      onChange={(e) => setCustomSidebar(e.target.value)}
                      className="h-8 w-8 rounded border cursor-pointer bg-transparent"
                    />
                    <Input
                      value={customSidebar}
                      onChange={(e) => {
                        const v = e.target.value
                        setCustomSidebar(v.startsWith("#") ? v : `#${v}`)
                      }}
                      placeholder="#2a2f3e"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button className="gap-2 min-w-[160px]" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
  )
}

