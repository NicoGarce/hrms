"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Upload, Download, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"

interface Document {
  id: string
  name: string
  employeeName: string
  type: string
  uploadedAt: string
  fileUrl: string
}

export default function DocumentsPage() {
  const [user, setUser] = useState<any>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDocType, setUploadDocType] = useState<string>("CONTRACT")
  const [uploadEmployeeId, setUploadEmployeeId] = useState<string>("")
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      fetchDocuments()
      if (user?.role === "SUPER_ADMINISTRATOR" || user?.role === "HR_ADMINISTRATOR") {
        fetchEmployees()
      }
    })
  }, [categoryFilter])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents?type=${categoryFilter}`)
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      toast.error("Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setEmployees(data.map((e: any) => ({ id: e.id, name: `${e.firstName} ${e.lastName}` })))
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Please select a file")
      return
    }

    const formData = new FormData()
    formData.append("file", uploadFile)
    formData.append("type", uploadDocType)
    formData.append("employeeId", uploadEmployeeId)

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("Document uploaded")
        setUploadDialogOpen(false)
        setUploadFile(null)
        setUploadEmployeeId("")
        fetchDocuments()
      } else {
        toast.error("Failed to upload document")
      }
    } catch (error) {
      console.error("Failed to upload document:", error)
      toast.error("Failed to upload document")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Document deleted")
        fetchDocuments()
      } else {
        toast.error("Failed to delete document")
      }
    } catch (error) {
      console.error("Failed to delete document:", error)
      toast.error("Failed to delete document")
    }
  }

  const handleDownload = (fileUrl: string, name: string) => {
    window.open(fileUrl, "_blank")
  }

  const typeColors = {
    CONTRACT: "bg-chart-1 text-chart-1-foreground",
    ID: "bg-chart-2 text-chart-2-foreground",
    CERTIFICATE: "bg-chart-3 text-chart-3-foreground",
    OTHER: "bg-slate text-slate-foreground",
  }

  if (!user) return null

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground">Manage employee documents</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={categoryFilter === "ALL" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter("ALL")}
              >
                All
              </Button>
              <Button
                variant={categoryFilter === "CONTRACT" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter("CONTRACT")}
              >
                Contracts
              </Button>
              <Button
                variant={categoryFilter === "ID" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter("ID")}
              >
                IDs
              </Button>
              <Button
                variant={categoryFilter === "CERTIFICATE" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter("CERTIFICATE")}
              >
                Certificates
              </Button>
              <Button
                variant={categoryFilter === "OTHER" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter("OTHER")}
              >
                Other
              </Button>
            </div>
            <Button
              className="gap-2"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        <Card accent="slate">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No documents found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Uploaded</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.name}
                        </td>
                        <td className="px-4 py-3">{doc.employeeName}</td>
                        <td className="px-4 py-3">
                          <Badge className={typeColors[doc.type as keyof typeof typeColors] || ""}>
                            {doc.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDownload(doc.fileUrl, doc.name)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            {(user.role === "SUPER_ADMINISTRATOR" || user.role === "HR_ADMINISTRATOR") && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive"
                                onClick={() => handleDelete(doc.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <select
                value={uploadDocType}
                onChange={(e) => setUploadDocType(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              >
                <option value="CONTRACT">Contract</option>
                <option value="ID">ID</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            {(user.role === "SUPER_ADMINISTRATOR" || user.role === "HR_ADMINISTRATOR") && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <select
                  value={uploadEmployeeId}
                  onChange={(e) => setUploadEmployeeId(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

