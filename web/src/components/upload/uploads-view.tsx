"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Image as ImageIcon, Trash2, CheckCircle2, Search, File, Sparkles, Loader2 } from "lucide-react";

interface UploadItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  chunks: number;
  status: "indexed" | "processing";
}

const INITIAL_FILES: UploadItem[] = [
  {
    id: "f-1",
    name: "Class8_Science_NCERT_Chapter2_Microorganisms.pdf",
    size: "2.4 MB",
    type: "PDF",
    uploadedAt: "Yesterday",
    chunks: 18,
    status: "indexed",
  },
  {
    id: "f-2",
    name: "Maths_Class8_Linear_Equations_Worksheet.png",
    size: "1.1 MB",
    type: "Image (OCR)",
    uploadedAt: "3 days ago",
    chunks: 6,
    status: "indexed",
  },
];

export function UploadsView() {
  const [files, setFiles] = useState<UploadItem[]>(INITIAL_FILES);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setTimeout(() => {
      const file = uploadedFiles[0];
      const newFile: UploadItem = {
        id: `f-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.includes("pdf") ? "PDF" : "Image",
        uploadedAt: "Just now",
        chunks: Math.floor(Math.random() * 15) + 5,
        status: "indexed",
      };
      setFiles((prev) => [newFile, ...prev]);
      setIsUploading(false);
    }, 1500);
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-display font-700 mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Document &amp; Material Indexer
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Upload PDFs, worksheets, images, or notes. Your AI teacher extracts text and answers questions directly from your materials.
        </p>
      </div>

      {/* Drag & Drop Upload Dropzone */}
      <div className="glass-strong rounded-2xl p-8 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-all text-center space-y-4 relative">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
          onChange={handleSimulatedUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto">
          {isUploading ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <Upload className="w-7 h-7" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-base">
            {isUploading ? "Extracting & Indexing Document..." : "Click or drag & drop files here"}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Supports PDF, Worksheets, Images (OCR), Word Docs &amp; Notes up to 50MB
          </p>
        </div>
      </div>

      {/* RAG Mode Info Banner */}
      <div className="glass rounded-xl p-4 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          <strong>RAG Mode Enabled:</strong> When learning in chat, ask <em>&quot;Answer using my uploaded materials&quot;</em> and the AI will reference your indexed text chunks.
        </p>
      </div>

      {/* Uploaded Files Table */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Indexed Materials ({files.length})</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {files
            .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((file) => (
              <div key={file.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {file.size} • {file.type} • {file.chunks} Vector Chunks
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteFile(file.id)}
                    className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
