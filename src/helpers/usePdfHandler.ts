import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { insertResumesTableResume } from '@/api/supabase/resumes/table/insert';
import { updateResumesTableUserResume } from '@/api/supabase/resumes/table/update';

export const usePdfHandler = (
  userId: string,
  onTextExtracted: (text: string) => void
) => {
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    try {
      // Use the local worker file from your public folder
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    } catch (error) {
      console.error('Failed to initialize PDF.js worker:', error);
    }
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
            if (Math.abs(currentY - lastY) > 15) fullText += '\n';
          }
          fullText += item.str;
          lastY = currentY;
        });
        if (i < pdf.numPages) fullText += '\n\n';
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
    if (!userId || userId.trim() === '') {
      toast.error('User ID is missing.');
      return;
    }
    if (!file || !file.type.includes('pdf')) {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF file is too large. Please upload a file under 10MB.');
      return;
    }
    setIsUploading(true);
    try {
      const filePath = `${userId}/${uuidv4()}.pdf`;
      const resumeId = await insertResumesTableResume(userId, filePath);
      if (!resumeId) {
        throw new Error('Failed to upload resume and create database entry.');
      }
      const text = await extractTextFromPDF(file);
      const success = await updateResumesTableUserResume(
        userId,
        resumeId,
        text
      );
      if (success) {
        onTextExtracted(text);
        toast.success('Resume uploaded and text extracted successfully.');
        return filePath;
      } else {
        throw new Error('Failed to update resume with extracted text.');
      }
    } catch (error: any) {
      console.error('PDF upload error:', error);
      toast.error(error.message || 'Failed to process PDF upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return { handleFileUpload, isUploading };
};

export default usePdfHandler;
