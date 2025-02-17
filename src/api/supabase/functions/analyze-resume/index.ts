import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, existingKeywords = [] } = await req.json();
    if (!resumeText) throw new Error('Resume text is required');

    console.log('Received Resume Text:', resumeText.substring(0, 100)); // Debugging
    console.log('Existing Keywords:', existingKeywords);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a resume keyword analyzer. Your task is to:
1. Extract keywords from the given resume.
2. Return only new keywords not present in the existing list: ${JSON.stringify(
              existingKeywords
            )}.
3. Respond in JSON format as an array of strings: ["keyword1", "keyword2"].`,
          },
          { role: 'user', content: resumeText },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    console.log('Raw AI Response:', data.choices?.[0]?.message?.content);

    let extractedKeywords: string[] = [];
    try {
      extractedKeywords = JSON.parse(data.choices?.[0]?.message?.content);
      if (!Array.isArray(extractedKeywords)) throw new Error();
    } catch {
      console.error('Invalid response format from OpenAI');
      throw new Error('AI response is not an array');
    }

    console.log('Extracted Keywords:', extractedKeywords);

    return new Response(JSON.stringify({ keywords: extractedKeywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
