import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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

    // Remove duplicates from existing keywords before sending to ChatGPT
    const uniqueExistingKeywords = Array.from(new Set(
      existingKeywords.map((k: string) => k.toLowerCase())
    ));

    console.log('Analyzing resume with unique existing keywords:', uniqueExistingKeywords);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a resume keyword analyzer. Your task is to:
1. Review the provided resume text
2. Consider the existing keywords: ${uniqueExistingKeywords.join(', ')}
3. Extract additional relevant keywords that are not in the existing list
4. Focus on skills, technologies, job titles, and notable achievements
5. Return ONLY new keywords as a comma-separated list, with no explanations or additional text
6. If no new keywords are found, return an empty string`
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
    // This time we preserve the original case of the first occurrence
    const seen = new Set<string>();
    const allKeywords = [...existingKeywords, ...newKeywords].filter(keyword => {
      const lowercase = keyword.toLowerCase();
      if (seen.has(lowercase)) {
        return false;
      }
      seen.add(lowercase);
      return true;
    });

    console.log('Final keywords after deduplication:', allKeywords);

    return new Response(JSON.stringify({ 
      keywords: allKeywords.join(', '),
      newKeywordsCount: newKeywords.length 
    }), {
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