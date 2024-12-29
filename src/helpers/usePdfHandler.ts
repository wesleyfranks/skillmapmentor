import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { toast } from 'sonner';
import * as crypto from 'crypto';
import {
  updateResumesTableUserResume,
  resumesTableUploadSingleResume,
} from '@/api/supabase/resumes/resumes';

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
      throw new Error(
        'PDF file is too large. Please upload a file under 10MB.'
      );
    }

    setIsUploading(true);
    try {
      const filePath = `${userId}/${crypto.randomUUID()}.pdf`;

      // Step 1: Upload file and insert row, capture resume_id
      const resumeId = await resumesTableUploadSingleResume(userId, filePath);

      if (!resumeId) {
        throw new Error('Failed to upload resume and create database entry.');
      }

      // Step 2: Extract text from PDF
      const text = await extractTextFromPDF(file);

      // Step 3: Update the existing row with extracted text
      const success = await updateResumesTableUserResume(
        userId,
        resumeId,
        text
      );
      if (success) {
        onTextExtracted(text);
        toast.success('Resume uploaded and text extracted successfully.');
      } else {
        throw new Error('Failed to update resume with extracted text.');
      }
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
