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
      if (match) return parseInt(match[1]);
    }
    if (error?.message) {
      const match = error.message.match(/Please try again in (\d+)ms/);
      if (match) return parseInt(match[1]);
    }
    return 3000; // Default to 3 seconds if no time specified
  } catch {
    return 3000;
  }
};

const analyzeWithRetry = async (resumeText: string, maxRetries = 3) => {
  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    try {
      console.log(`Attempt ${attempt + 1} to analyze resume`);
      
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
        if (data.error.type === 'rate_limit_exceeded' || data.error.message?.includes('Rate limit')) {
          const retryAfter = extractRetryAfter(data.error);
          console.log(`Rate limit hit, waiting ${retryAfter}ms before retry`);
          await sleep(retryAfter + 1000); // Add 1 second buffer
          attempt++;
          continue;
        }
        throw new Error(data.error.message || 'Error from OpenAI API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Error on attempt ${attempt + 1}:`, error);
      lastError = error;
      
      if (attempt === maxRetries - 1) {
        throw error;
      }

      const delay = 3000 * Math.pow(2, attempt); // Exponential backoff starting at 3 seconds
      console.log(`Waiting ${delay}ms before retry`);
      await sleep(delay);
      attempt++;
    }
  }
  
  throw lastError || new Error('Max retries reached');
};

serve(async (req) => {
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
    
    const isRateLimit = error.message?.includes('Rate limit');
    const status = isRateLimit ? 429 : 500;
    const retryAfter = isRateLimit ? extractRetryAfter(error) : 3000;
    
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
          'Retry-After': `${retryAfter}`
        },
      }
    );
  }
});