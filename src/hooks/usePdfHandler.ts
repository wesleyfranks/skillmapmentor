import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { supabase } from '@/integrations/supabase/client';

export const usePdfHandler = (userId: string, onTextExtracted: (text: string) => void) => {
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const initializeWorker = async () => {
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
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
        
        let lastY: number | null = null;
        let textItems = textContent.items as { str: string; transform: number[]; }[];
        
        // Process each text item on the page
        textItems.forEach((item: any, index) => {
          // Get the y-coordinate of the text (transform[5] represents y-position)
          const currentY = item.transform[5];
          
          // Add newlines between different vertical positions
          if (lastY !== null && Math.abs(currentY - lastY) > 5) {
            fullText += '\n';
            
            // Add extra newline for larger vertical gaps (like between paragraphs)
            if (Math.abs(currentY - lastY) > 15) {
              fullText += '\n';
            }
          }
          
          // Add the text content
          fullText += item.str;
          
          // Add space between horizontally adjacent items if they're on the same line
          if (index < textItems.length - 1 && 
              Math.abs(textItems[index + 1].transform[5] - currentY) < 5) {
            fullText += ' ';
          }
          
          lastY = currentY;
        });
        
        // Add page breaks between pages
        if (i < pdf.numPages) {
          fullText += '\n\n';
        }
      }

      // Clean up excessive whitespace while preserving intentional formatting
      return fullText
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with 2
        .replace(/[ \t]+\n/g, '\n')  // Remove trailing spaces
        .replace(/\n[ \t]+/g, '\n')  // Remove leading spaces
        .trim();
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
