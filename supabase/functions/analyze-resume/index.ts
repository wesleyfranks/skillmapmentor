import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, existingKeywords = [] } = await req.json();

    if (!resumeText) {
      throw new Error('Resume text is required');
    }

    console.log('Analyzing resume with existing keywords:', existingKeywords);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a resume keyword analyzer. Extract only new and relevant keywords from the resume that are not in the existing list: ${existingKeywords.join(', ')}. Focus on skills, technologies, job titles, and notable achievements. Return them as a comma-separated list, with no explanations or additional text. If no new keywords are found, return an empty string.`
          },
          { role: 'user', content: resumeText }
        ],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error from OpenAI API');
    }

    const newKeywords = data.choices[0].message.content
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean);
    
    console.log('New keywords found:', newKeywords);
    
    // Combine existing and new keywords, removing duplicates using Set
    const allKeywords = [...new Set([
      ...existingKeywords,
      ...newKeywords
    ])].filter(k => k !== '');

    console.log('Final keywords after deduplication:', allKeywords);

    return new Response(JSON.stringify({ keywords: allKeywords.join(', ') }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});