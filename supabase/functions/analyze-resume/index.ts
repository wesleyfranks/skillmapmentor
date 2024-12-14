import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const analyzeWithRetry = async (resumeText: string, retries = 3, initialDelay = 500) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to analyze resume`);
      
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
              content: 'You are a resume analyzer. Extract and return only the most important keywords from the resume, including skills, technologies, job titles, and notable achievements. Return them as a comma-separated list, with no explanations or additional text.'
            },
            { role: 'user', content: resumeText }
          ],
        }),
      });

      const data = await response.json();
      console.log('OpenAI response:', data);

      if (data.error) {
        // Check if it's a rate limit error
        if (data.error.message?.includes('Rate limit')) {
          const waitTime = extractWaitTime(data.error.message) || initialDelay * Math.pow(2, i);
          console.log(`Rate limit hit, waiting ${waitTime}ms before retry`);
          await sleep(waitTime);
          continue;
        }
        throw new Error(data.error.message || 'Error analyzing resume');
      }

      return data.choices[0].message.content;
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = initialDelay * Math.pow(2, i);
      console.log(`Error on attempt ${i + 1}, waiting ${delay}ms before retry:`, error);
      await sleep(delay);
    }
  }
  throw new Error('Max retries reached when analyzing resume');
};

const extractWaitTime = (message: string): number | null => {
  const match = message.match(/Please try again in (\d+)ms/);
  return match ? parseInt(match[1]) : null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      throw new Error('Resume text is required');
    }

    console.log('Analyzing resume:', resumeText.substring(0, 100) + '...');

    const keywords = await analyzeWithRetry(resumeText);
    console.log('Extracted keywords:', keywords);

    return new Response(JSON.stringify({ keywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: error.message,
        retryAfter: error.message.includes('Rate limit') ? extractWaitTime(error.message) : null
      }), {
        status: error.message.includes('Rate limit') ? 429 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});