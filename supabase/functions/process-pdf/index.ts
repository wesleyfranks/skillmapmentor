import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing PDF upload request...');
    const formData = await req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      console.error('Missing required fields:', { file: !!file, userId: !!userId });
      return new Response(
        JSON.stringify({ error: 'Missing file or user ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Initializing Supabase client...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload file to Supabase Storage
    console.log('Uploading file to storage...');
    const fileBuffer = await file.arrayBuffer()
    const filePath = `${userId}/${crypto.randomUUID()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Extract text from PDF using pdf.js
    console.log('Extracting text from PDF...');
    
    // Set up the worker for pdf.js
    const pdfjsWorker = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    // Load the PDF document
    const pdfData = new Uint8Array(fileBuffer);
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    
    let extractedText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      extractedText += pageText + '\n';
    }

    console.log('Updating user record...');
    // Update user record with file path and extracted text
    const { error: updateError } = await supabase
      .from('users')
      .update({
        resume_file_path: filePath,
        resume_text: extractedText
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('PDF processing completed successfully');
    return new Response(
      JSON.stringify({ 
        message: 'PDF processed successfully',
        filePath,
        extractedText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process PDF',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})