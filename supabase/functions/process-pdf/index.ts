import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Get the file URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath)

    // Use PDF.js in the browser instead
    // For now, we'll just store the file and let the frontend handle text extraction
    console.log('File uploaded successfully');

    // Update user record with file path
    const { error: updateError } = await supabase
      .from('users')
      .update({
        resume_file_path: filePath,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'PDF uploaded successfully',
        filePath,
        publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
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