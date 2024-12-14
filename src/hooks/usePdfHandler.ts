import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjs from 'pdfjs-dist';
import { useToast } from "@/hooks/use-toast";

// Configure PDF.js worker
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
);
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc.toString();

export const usePdfHandler = (userId: string, onTextExtracted: (text: string) => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    try {
      const loadingTask = pdfjs.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      let extractedText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        extractedText += pageText + '\n';
      }

      return extractedText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw error;
    }
  };

  const handleFileUpload = async (file: File) => {
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
      // First, extract text from the PDF locally
      const arrayBuffer = await file.arrayBuffer();
      const extractedText = await extractTextFromPDF(arrayBuffer);

      // Then upload the file to Supabase
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const { error } = await supabase.functions.invoke('process-pdf', {
        body: formData,
      });

      if (error) throw error;

      // Update the text area with extracted text
      onTextExtracted(extractedText);
      toast({
        title: "Success",
        description: "PDF uploaded and processed successfully",
      });
    } catch (error: any) {
      console.error('PDF upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process PDF",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleFileUpload,
  };
};