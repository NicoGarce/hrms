"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Download, Eye } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  uploadedAt: string
  fileUrl: string
}

interface EmployeeDocumentsProps {
  documents: Document[]
}

export function EmployeeDocuments({ documents }: EmployeeDocumentsProps) {
  const [selected, setSelected] = useState<Document | null>(null)

  const isViewable = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase()
    return ["png", "jpg", "jpeg", "gif", "svg", "webp", "pdf", "txt"].includes(ext || "")
  }

  const isImage = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase()
    return ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext || "")
  }

  return (
    <>
      <Card accent="slate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          ) : (
            <div className="space-y-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{doc.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal shrink-0">
                      {doc.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isViewable(doc.fileUrl) && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setSelected(doc)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    <a
                      href={doc.fileUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-[12px] text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground"
                    >
                      <Download className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {selected?.name}
              {selected && <Badge variant="outline" className="ml-2">{selected.type}</Badge>}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            {selected && isImage(selected.fileUrl) ? (
              <img
                src={selected.fileUrl}
                alt={selected.name}
                className="w-full rounded-lg object-contain"
              />
            ) : selected && selected.fileUrl.endsWith(".pdf") ? (
              <iframe
                src={selected.fileUrl}
                className="w-full h-[65vh] rounded-lg border"
                title={selected.name}
              />
            ) : selected ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Preview not available for this file type
                </p>
                <a
                  href={selected.fileUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                  Download {selected.name}
                </a>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
