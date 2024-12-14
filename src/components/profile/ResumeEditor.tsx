import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
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

interface ResumeEditorProps {
  resumeText: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (text: string) => void;
}

export const ResumeEditor = ({
  resumeText,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onDelete,
  onChange,
}: ResumeEditorProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

      {isEditing ? (
        <>
          <Textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px]"
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
        <div className="whitespace-pre-wrap bg-muted p-4 rounded-md min-h-[100px]">
          {resumeText || "No resume text provided"}
        </div>
      )}
    </div>
  );
};