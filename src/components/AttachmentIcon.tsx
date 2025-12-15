import { File, FileSpreadsheet, FileText, ImageIcon } from "lucide-react";

export function AttachmentIcon({ extension }: { extension: string | null }) {
  const ext = extension?.toLowerCase() || "";

  switch (ext) {
    case "pdf":
      return <File className="h-4 w-4 text-red-500" />;
    case "xlsx":
    case "xls":
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    case "docx":
    case "doc":
    case "txt":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
      return <ImageIcon className="h-4 w-4 text-purple-500" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}
