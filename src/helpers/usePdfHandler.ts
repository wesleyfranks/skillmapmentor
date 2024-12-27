import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; 
import * as crypto from 'crypto';


export const usePdfHandler = (
  userId: string,
  onTextExtracted: (text: string) => void
) => {
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const initializeWorker = async () => {
      try {
        const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
      } catch (error) {
        console.error('Failed to initialize PDF.js worker:', error);
      }
    };
    initializeWorker();
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        if (!textContent.items || textContent.items.length === 0) {
          throw new Error('The PDF appears to have no readable text.');
        }

        let lastY: number | null = null;
        textContent.items.forEach((item: any) => {
          const currentY = item.transform[5];
          if (lastY !== null && Math.abs(currentY - lastY) > 5) {
            fullText += '\n';
            if (Math.abs(currentY - lastY) > 15) {
              fullText += '\n';
            }
          }
          fullText += item.str;
          lastY = currentY;
        });

        if (i < pdf.numPages) {
          fullText += '\n\n';
        }
      }

      return fullText
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from the PDF. Please try again.');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.includes('pdf')) {
      throw new Error('Please upload a valid PDF file.');
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB size limit
      throw new Error(
        'PDF file is too large. Please upload a file under 10MB.'
      );
    }

    setIsUploading(true);
    try {
      const text = await extractTextFromPDF(file);
      const filePath = `${userId}/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('resumes')
        .update({ resume_text: text, file_path: filePath })
        .eq('id', userId);

      if (updateError) throw updateError;

      onTextExtracted(text);
      toast.success('Resume uploaded and text extracted successfully.');
    } catch (error) {
      console.error('PDF upload error:', error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading,
  };
};
