import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const extractRetryAfter = (error: any): number => {
  try {
    if (typeof error === 'string') {
      const match = error.match(/Please try again in (\d+)ms/);
      return match ? parseInt(match[1]) : 2000;
    }
    return 2000;
  } catch {
    return 2000;
  }
};

const analyzeWithRetry = async (resumeText: string, retries = 3) => {
  let lastError;
  
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
      
      if (data.error) {
        // Handle rate limit specifically
        if (data.error.type === 'rate_limit_exceeded' || data.error.message?.includes('Rate limit')) {
          const retryAfter = extractRetryAfter(data.error.message);
          console.log(`Rate limit hit, waiting ${retryAfter}ms before retry`);
          await sleep(retryAfter);
          continue;
        }
        throw new Error(data.error.message || 'Error from OpenAI API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Error on attempt ${i + 1}:`, error);
      lastError = error;
      
      // If it's the last retry, throw the error
      if (i === retries - 1) {
        throw error;
      }

      // For non-rate limit errors, use exponential backoff
      const delay = 2000 * Math.pow(2, i);
      console.log(`Waiting ${delay}ms before retry`);
      await sleep(delay);
    }
  }
  throw lastError || new Error('Max retries reached');
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
    
    // Check if it's a rate limit error
    const isRateLimit = error.message?.includes('Rate limit');
    const status = isRateLimit ? 429 : 500;
    const retryAfter = isRateLimit ? extractRetryAfter(error.message) : null;
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        retryAfter,
        isRateLimit
      }), {
        status,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...(retryAfter ? { 'Retry-After': `${retryAfter}` } : {})
        },
      }
    );
  }
});