import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileValidated: (file: File, isValid: boolean) => void;
}

interface FilePreview {
  name: string;
  size: number;
  rowCount: number;
  hasUrlColumn: boolean;
  previewRows: string[][];
  warnings: string[];
}

export function FileUpload({ onFileValidated }: FileUploadProps) {
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateAndPreviewCSV = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      // Parse header
      const header = lines[0].split(',').map(col => col.trim().toLowerCase());
      const hasUrlColumn = header.includes('url');
      
      // Parse first few rows for preview
      const previewRows = lines.slice(0, 6).map(line => line.split(',').map(cell => cell.trim()));
      
      // Check for warnings
      const warnings: string[] = [];
      if (!hasUrlColumn) {
        warnings.push('Missing required "url" column');
      }
      if (lines.length < 3) {
        warnings.push('Very few rows detected - consider adding more data');
      }

      const filePreview: FilePreview = {
        name: file.name,
        size: file.size,
        rowCount: lines.length - 1, // Exclude header
        hasUrlColumn,
        previewRows,
        warnings
      };

      setPreview(filePreview);
      onFileValidated(file, hasUrlColumn && lines.length > 1);
      console.log('File validation result:', { hasUrlColumn, rowCount: lines.length - 1, isValid: hasUrlColumn && lines.length > 1 });

      if (hasUrlColumn) {
        toast({
          title: "File validated successfully",
          description: `Found ${lines.length - 1} rows with URL column`,
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV';
      toast({
        title: "File validation failed",
        description: errorMessage,
        variant: "destructive",
      });
      onFileValidated(file, false);
    } finally {
      setIsProcessing(false);
    }
  }, [onFileValidated, toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      validateAndPreviewCSV(file);
    }
  }, [validateAndPreviewCSV]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    onDropRejected: () => {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="border-2 border-dashed transition-colors hover:border-primary/50">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-colors ${
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse your files
                </p>
                <Button variant="outline" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Browse Files'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      {preview && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">{preview.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {(preview.size / 1024).toFixed(1)} KB • {preview.rowCount} rows
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {preview.hasUrlColumn ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    URL column found
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="w-3 h-3" />
                    Missing URL column
                  </Badge>
                )}
              </div>
            </div>

            {/* Warnings */}
            {preview.warnings.length > 0 && (
              <div className="space-y-2">
                {preview.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Data Preview */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Data Preview (first 5 rows):</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-border rounded">
                  <thead className="bg-muted/50">
                    <tr>
                      {preview.previewRows[0]?.map((header, index) => (
                        <th key={index} className="p-2 text-left border-r border-border last:border-r-0">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.previewRows.slice(1, 6).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-border">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-2 border-r border-border last:border-r-0">
                            <div className="truncate max-w-32" title={cell}>
                              {cell || <span className="text-muted-foreground">empty</span>}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}