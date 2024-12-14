import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { supabase } from '@/integrations/supabase/client';

export const usePdfHandler = (userId: string, onTextExtracted: (text: string) => void) => {
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const initializeWorker = async () => {
      // Import the worker and set it as a URL string
      const workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
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
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw error;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.includes('pdf')) {
      throw new Error('Please upload a valid PDF file');
    }

    setIsUploading(true);
    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      
      // Upload PDF to Supabase Storage
      const filePath = `${userId}/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update user's resume data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          resume_text: text,
          resume_file_path: filePath
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Call the callback with extracted text
      onTextExtracted(text);
    } catch (error) {
      console.error('PDF upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading
  };
};