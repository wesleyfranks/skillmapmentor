import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ResumeEditorProps {
  resumeText: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (text: string) => void;
  userId: string;
}

export const ResumeEditor = ({
  resumeText,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onDelete,
  onChange,
  userId,
}: ResumeEditorProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('pdf')) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload a PDF file",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: formData,
      });

      if (error) throw error;

      onChange(data.extractedText);
      toast({
        title: "Success",
        description: "PDF uploaded and processed successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process PDF",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground">Resume Text</label>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit()}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {!isEditing && resumeText && (
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your resume.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete();
                      setShowDeleteDialog(false);
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isUploading}
          onClick={() => document.getElementById('pdf-upload')?.click()}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload PDF"}
        </Button>
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {isEditing ? (
        <>
          <Textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px] font-mono whitespace-pre-wrap"
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <Button onClick={onSave} disabled={isSaving} className="mt-2">
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                Saving...
              </div>
            ) : (
              "Save Resume"
            )}
          </Button>
        </>
      ) : (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded-md min-h-[100px] font-mono">
          {resumeText || "No resume text provided"}
        </div>
      )}
    </div>
  );
};