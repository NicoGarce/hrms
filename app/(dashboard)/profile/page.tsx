"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Building2, Briefcase, Calendar, Phone, MapPin, Save } from "lucide-react"
import { toast } from "sonner"

interface EmployeeProfile {
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  role: string
  departmentName: string | null
  positionTitle: string | null
  hireDate: string
  phone: string | null
  address: string | null
  emergencyContact: string | null
  dateOfBirth: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editPhone, setEditPhone] = useState("")
  const [editAddress, setEditAddress] = useState("")

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/employee/profile")
      if (!response.ok) {
        toast.error("Failed to load profile")
        return
      }
      const data = await response.json()
      setProfile(data)
      setEditPhone(data.phone || "")
      setEditAddress(data.address || "")
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (user) { fetchProfile() }
  }, [status, user, fetchProfile])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/employee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: editPhone, address: editAddress }),
      })

      if (response.ok) {
        toast.success("Profile updated")
        fetchProfile()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : "U"

  if (!user) return null

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View and manage your profile information</p>
      </div>

      {loading ? (
        <Card accent="slate">
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      ) : !profile ? (
        <Card accent="slate">
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">No employee profile found. Please contact HR.</div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card accent="teal">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg">{profile.firstName} {profile.lastName}</div>
                  <div className="text-sm font-normal text-muted-foreground">{profile.role}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">{profile.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Department</div>
                      <div className="text-sm font-medium">{profile.departmentName || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Position</div>
                      <div className="text-sm font-medium">{profile.positionTitle || "—"}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Employee Code</div>
                      <div className="text-sm font-medium">{profile.employeeCode}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Hire Date</div>
                      <div className="text-sm font-medium">{new Date(profile.hireDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Date of Birth</div>
                      <div className="text-sm font-medium">
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card accent="slate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone number"
                    className="max-w-xs"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Address"
                    className="max-w-md"
                  />
                </div>
                <Button className="gap-2" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {profile.emergencyContact && (
            <Card accent="slate">
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{profile.emergencyContact}</div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
