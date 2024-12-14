import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib'

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
    const formData = await req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or user ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const filePath = `${userId}/${crypto.randomUUID()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Extract text from PDF
    const pdfDoc = await PDFDocument.load(fileBuffer)
    const pages = pdfDoc.getPages()
    let extractedText = ''

    for (const page of pages) {
      const text = await page.doc.getText()
      extractedText += text + '\n'
    }

    // Update user record with file path and extracted text
    const { error: updateError } = await supabase
      .from('users')
      .update({
        resume_file_path: filePath,
        resume_text: extractedText
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        message: 'PDF processed successfully',
        filePath,
        extractedText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process PDF' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})