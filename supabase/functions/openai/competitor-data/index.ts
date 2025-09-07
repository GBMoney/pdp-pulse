import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface CompetitorDataRequest {
  asin: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { asin }: CompetitorDataRequest = await req.json();
    
    if (!asin) {
      return new Response(JSON.stringify({ error: 'ASIN is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use OpenAI to generate realistic competitor data based on ASIN
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `Generate realistic Amazon product data for ASIN ${asin} and its top 5 competitors. Return JSON with exact structure:
            {
              "target": {
                "asin": "${asin}",
                "product_name": "Product Name",
                "brand": "Brand Name",
                "price": 24.99,
                "est_daily_impressions": 1200,
                "est_daily_clicks": 85,
                "ratings_count": 540,
                "avg_rating": 4.3,
                "keywords_top4": 18,
                "keywords_page1": 92
              },
              "competitors": [
                {
                  "rank": 1,
                  "comp_asin": "B0COMP001",
                  "product_name": "Competitor Name",
                  "brand_name": "Competitor Brand",
                  "price": 22.99,
                  "rating": 4.4,
                  "ratings_count": 800,
                  "keywords_top4": 20,
                  "keywords_page1": 110,
                  "est_daily_clicks": 95
                }
              ]
            }
            Make it realistic for consumer electronics/household items.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openaiData = await response.json();
    const content = openaiData.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content from OpenAI');
    }

    // Parse the JSON response from OpenAI
    const competitorData = JSON.parse(content);

    return new Response(JSON.stringify(competitorData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    
    // Fallback to deterministic data if OpenAI fails
    const seed = asin.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    const fallbackData = {
      target: {
        asin,
        product_name: `Product ${asin}`,
        brand: ['RENPHO', 'ACME', 'TechPro'][random(0, 2)],
        price: random(1500, 4500) / 100,
        est_daily_impressions: random(800, 5000),
        est_daily_clicks: random(30, 400),
        ratings_count: random(100, 5000),
        avg_rating: random(36, 48) / 10,
        keywords_top4: random(2, 18),
        keywords_page1: random(10, 60),
      },
      competitors: Array.from({ length: random(3, 5) }, (_, i) => ({
        rank: i + 1,
        comp_asin: `C${asin.slice(-6)}${i}`,
        product_name: `Competitor ${i + 1}`,
        brand_name: ['BrandX', 'BrandY', 'Nova'][random(0, 2)],
        price: random(1200, 5000) / 100,
        rating: random(32, 49) / 10,
        ratings_count: random(50, 2000),
        keywords_top4: random(1, 20),
        keywords_page1: random(8, 65),
        est_daily_clicks: random(25, 350),
      }))
    };

    return new Response(JSON.stringify(fallbackData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});