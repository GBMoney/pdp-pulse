interface CSVRow {
  url: string;
  label?: string;
  brand?: string;
  price_floor?: number;
  target_rating?: number;
  target_reviews_count?: number;
  [key: string]: any;
}

interface TargetData {
  asin: string;
  product_name: string;
  brand: string;
  price: number;
  est_daily_impressions: number;
  est_daily_clicks: number;
  ratings_count: number;
  avg_rating: number;
  keywords_top4: number;
  keywords_page1: number;
}

interface CompetitorData {
  rank: number;
  comp_asin: string;
  product_name: string;
  brand_name: string;
  price: number;
  rating: number;
  ratings_count: number;
  keywords_top4: number;
  keywords_page1: number;
  est_daily_clicks: number;
}

interface ProcessedAsinData {
  asin: string;
  label: string;
  target: TargetData;
  comp_avg: {
    price: number;
    rating: number;
    ratings_count: number;
    keywords_top4: number;
    keywords_page1: number;
    est_daily_clicks: number;
  };
  competitors: CompetitorData[];
  insights: {
    kw4_gap: number;
    kwp1_gap: number;
    rating_gap: number;
    reviews_deficit: number;
    price_position: string;
    clicks_share: number;
    priority_score: number;
    actions: Array<{
      title: string;
      why: string;
      impact: string[];
      effort: string;
      target: string;
    }>;
  };
}

export interface ProcessedData {
  fileName: string;
  runId: string;
  generatedAt: string;
  portfolio: {
    asinsProcessed: number;
    avgRating: number;
    avgPrice: number;
    totalEstClicks: number;
    avgPriorityScore: number;
  };
  asins: ProcessedAsinData[];
  downloads: {
    htmlReportUrl: string;
    zipUrl: string;
    csvBundleUrl: string;
  };
}

class DataProcessor {
  private normalizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';
    url = url.trim();
    if (!url) return '';
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    return url;
  }

  private extractAsin(url: string): string | null {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:\/dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
    return match ? match[1].toUpperCase() : null;
  }

  private extractProductNameFromUrl(url: string): string {
    try {
      // Extract product name from Amazon URL structure
      // Amazon URLs typically have format: /product-name/dp/ASIN or /dp/ASIN/product-name
      const urlObj = new URL(this.normalizeUrl(url));
      const pathname = decodeURIComponent(urlObj.pathname);
      
      // Look for patterns like /product-name/dp/ or /dp/ASIN/product-name
      const dpIndex = pathname.indexOf('/dp/');
      if (dpIndex !== -1) {
        // Check if product name is before /dp/
        const beforeDp = pathname.substring(0, dpIndex);
        const segments = beforeDp.split('/').filter(s => s.length > 0);
        
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          // Clean up the product name
          return this.cleanProductName(lastSegment);
        }
        
        // Check if product name is after /dp/ASIN/
        const afterDp = pathname.substring(dpIndex + 4); // Skip '/dp/'
        const asinMatch = afterDp.match(/^[A-Z0-9]{10}\/?(.+)?/);
        if (asinMatch && asinMatch[1]) {
          const productPart = asinMatch[1].split('/')[0];
          return this.cleanProductName(productPart);
        }
      }
      
      // Fallback: look for product name in other parts of the URL
      const segments = pathname.split('/').filter(s => s.length > 2 && !s.match(/^[A-Z0-9]{10}$/));
      if (segments.length > 0) {
        return this.cleanProductName(segments[segments.length - 1]);
      }
    } catch (error) {
      console.warn('Failed to extract product name from URL:', url, error);
    }
    
    return '';
  }

  private cleanProductName(rawName: string): string {
    return rawName
      .replace(/[-_+]/g, ' ') // Replace dashes, underscores, plus with spaces
      .replace(/\b\w/g, l => l.toUpperCase()) // Title case
      .replace(/\s+/g, ' ') // Remove extra spaces
      .trim()
      .substring(0, 60); // Limit length
  }

  private async fetchCompetitorData(asin: string, originalUrl?: string): Promise<{ target: TargetData; competitors: CompetitorData[] }> {
    try {
      const response = await fetch('/api/openai/competitor-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch competitor data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`Failed to fetch real data for ${asin}, using fallback:`, error);
      return this.generateFallbackData(asin, originalUrl);
    }
  }

  private generateFallbackData(asin: string, originalUrl?: string): { target: TargetData; competitors: CompetitorData[] } {
    // Deterministic random based on ASIN
    const seed = asin.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    const brands = ['RENPHO', 'ACME', 'GADGY', 'FLEXO', 'TechPro', 'SmartLife'];
    const price = Math.round((random(1400, 4900) / 100) * 100) / 100;
    
    // Generate more realistic product names
    const productTypes = ['Wireless Headphones', 'Smart Watch', 'Bluetooth Speaker', 'Fitness Tracker', 'Phone Case', 'Kitchen Scale', 'LED Desk Lamp', 'Portable Charger', 'Gaming Mouse', 'Yoga Mat'];
    const adjectives = ['Premium', 'Ultra', 'Pro', 'Advanced', 'Smart', 'Compact', 'Ergonomic', 'High-Performance'];
    
    let productName = `Product ${asin}`;
    
    // Try to extract from URL first
    if (originalUrl) {
      const extractedName = this.extractProductNameFromUrl(originalUrl);
      if (extractedName) {
        productName = extractedName;
      } else {
        // Generate realistic fallback name
        const adjective = adjectives[random(0, adjectives.length - 1)];
        const productType = productTypes[random(0, productTypes.length - 1)];
        productName = `${adjective} ${productType}`;
      }
    } else {
      // Generate realistic fallback name
      const adjective = adjectives[random(0, adjectives.length - 1)];
      const productType = productTypes[random(0, productTypes.length - 1)];
      productName = `${adjective} ${productType}`;
    }
    
    const target: TargetData = {
      asin,
      product_name: productName,
      brand: brands[random(0, brands.length - 1)],
      price,
      est_daily_impressions: random(800, 5000),
      est_daily_clicks: random(30, 400),
      ratings_count: random(100, 5000),
      avg_rating: Math.round(random(36, 48)) / 10,
      keywords_top4: random(2, 18),
      keywords_page1: random(10, 60),
    };

    const competitors: CompetitorData[] = [];
    const numCompetitors = random(3, 5);
    
    for (let i = 0; i < numCompetitors; i++) {
      const compAdjective = adjectives[random(0, adjectives.length - 1)];
      const compType = productTypes[random(0, productTypes.length - 1)];
      
      competitors.push({
        rank: i + 1,
        comp_asin: `C${asin.slice(-6)}${i}`,
        product_name: `${compAdjective} ${compType} ${i + 1}`,
        brand_name: brands[random(0, brands.length - 1)],
        price: Math.round(price * (random(85, 115) / 100) * 100) / 100,
        rating: Math.round(Math.min(4.9, Math.max(3.2, target.avg_rating + (random(-4, 4) / 10))) * 10) / 10,
        ratings_count: Math.round(target.ratings_count * (random(40, 160) / 100)),
        keywords_top4: Math.max(0, target.keywords_top4 + random(-4, 6)),
        keywords_page1: Math.max(0, target.keywords_page1 + random(-12, 12)),
        est_daily_clicks: Math.round(target.est_daily_clicks * (random(50, 140) / 100)),
      });
    }

    return { target, competitors };
  }

  private calculateInsights(target: TargetData, competitors: CompetitorData[]): ProcessedAsinData['insights'] {
    const avgPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
    const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    const avgRatingsCount = competitors.reduce((sum, c) => sum + c.ratings_count, 0) / competitors.length;
    const avgKeywordsTop4 = competitors.reduce((sum, c) => sum + c.keywords_top4, 0) / competitors.length;
    const avgKeywordsPage1 = competitors.reduce((sum, c) => sum + c.keywords_page1, 0) / competitors.length;
    const totalCompClicks = competitors.reduce((sum, c) => sum + c.est_daily_clicks, 0);

    const kw4_gap = avgKeywordsTop4 - target.keywords_top4;
    const kwp1_gap = avgKeywordsPage1 - target.keywords_page1;
    const rating_gap = target.avg_rating - avgRating;
    const reviews_deficit = avgRatingsCount - target.ratings_count;
    
    const priceDiff = (target.price - avgPrice) / avgPrice;
    const price_position = priceDiff > 0.03 ? 'above' : priceDiff < -0.03 ? 'below' : 'aligned';
    
    const clicks_share = target.est_daily_clicks / (target.est_daily_clicks + totalCompClicks);

    // Priority score calculation
    const weights = { kwTop4: 0.30, page1: 0.25, reviews: 0.20, clicks: 0.15, price: 0.10 };
    const normKw4 = Math.min(Math.max(kw4_gap, 0) / 20, 1);
    const normPg1 = Math.min(Math.max(kwp1_gap, 0) / 40, 1);
    const normRev = Math.min(Math.max(reviews_deficit, 0) / 1000, 1);
    const normClk = 1 - clicks_share;
    const normPrice = price_position === 'above' ? 1.0 : price_position === 'aligned' ? 0.5 : 0.0;
    
    const priority_score = weights.kwTop4 * normKw4 + weights.page1 * normPg1 + 
                          weights.reviews * normRev + weights.clicks * normClk + weights.price * normPrice;

    // Generate actions
    const actions = [];
    
    if (kwp1_gap > 5) {
      actions.push({
        title: `Expand Page-1 coverage by ~${Math.round(kwp1_gap)} keywords`,
        why: "You trail comp avg on Page-1 listings which limits discoverability.",
        impact: ["↑ clicks", "↑ rank"],
        effort: kwp1_gap > 20 ? "High" : kwp1_gap > 10 ? "Med" : "Low",
        target: `Reach ~${Math.round(avgKeywordsPage1)} Page-1 keywords`
      });
    }

    if (reviews_deficit > 200) {
      actions.push({
        title: `Accelerate review acquisition (~${Math.round(reviews_deficit)} additional)`,
        why: "Large social proof gap vs comp avg is suppressing CVR and ranking.",
        impact: ["↑ CVR", "↑ rank"],
        effort: reviews_deficit > 1000 ? "High" : "Med",
        target: `${Math.round(avgRatingsCount)} total ratings`
      });
    }

    if (kw4_gap > 2) {
      actions.push({
        title: `Target ~${Math.round(kw4_gap)} more Top-4 keyword positions`,
        why: "Missing key ranking positions limits visibility in prime search results.",
        impact: ["↑ clicks", "↑ CVR"],
        effort: "Med",
        target: `${Math.round(avgKeywordsTop4)} Top-4 keywords`
      });
    }

    if (clicks_share < 0.3) {
      actions.push({
        title: "Improve click capture strategy",
        why: "Low click share indicates suboptimal title/image optimization.",
        impact: ["↑ clicks"],
        effort: "Low",
        target: "Increase click share to 35%+"
      });
    }

    return {
      kw4_gap: Math.round(kw4_gap * 10) / 10,
      kwp1_gap: Math.round(kwp1_gap * 10) / 10,
      rating_gap: Math.round(rating_gap * 10) / 10,
      reviews_deficit: Math.round(reviews_deficit),
      price_position,
      clicks_share: Math.round(clicks_share * 100) / 100,
      priority_score: Math.round(priority_score * 1000) / 1000,
      actions: actions.slice(0, 3) // Top 3 actions
    };
  }

  async processCSVData(csvContent: string, fileName: string): Promise<ProcessedData> {
    // Parse CSV
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    if (!headers.includes('url')) {
      throw new Error('CSV must contain a "url" column');
    }

    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      if (row.url) rows.push(row as CSVRow);
    }

    // Extract ASINs
    const validRows = rows.map(row => ({
      ...row,
      url: this.normalizeUrl(row.url),
      asin: this.extractAsin(row.url)
    })).filter(row => row.asin);

    if (validRows.length === 0) {
      throw new Error('No valid Amazon ASINs found in URLs');
    }

    const uniqueAsins = [...new Set(validRows.map(row => row.asin))];
    
    // Process each ASIN
    const processedAsins: ProcessedAsinData[] = [];
    
    for (const asin of uniqueAsins) {
      const row = validRows.find(r => r.asin === asin);
      const label = row?.label || `Product ${asin}`;
      
      const { target, competitors } = await this.fetchCompetitorData(asin!);
      
      const comp_avg = {
        price: competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length,
        rating: competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length,
        ratings_count: competitors.reduce((sum, c) => sum + c.ratings_count, 0) / competitors.length,
        keywords_top4: competitors.reduce((sum, c) => sum + c.keywords_top4, 0) / competitors.length,
        keywords_page1: competitors.reduce((sum, c) => sum + c.keywords_page1, 0) / competitors.length,
        est_daily_clicks: competitors.reduce((sum, c) => sum + c.est_daily_clicks, 0) / competitors.length,
      };

      const insights = this.calculateInsights(target, competitors);

      processedAsins.push({
        asin: asin!,
        label,
        target,
        comp_avg,
        competitors,
        insights
      });
    }

    // Calculate portfolio summary
    const portfolio = {
      asinsProcessed: processedAsins.length,
      avgRating: processedAsins.reduce((sum, a) => sum + a.target.avg_rating, 0) / processedAsins.length,
      avgPrice: processedAsins.reduce((sum, a) => sum + a.target.price, 0) / processedAsins.length,
      totalEstClicks: processedAsins.reduce((sum, a) => sum + a.target.est_daily_clicks, 0),
      avgPriorityScore: processedAsins.reduce((sum, a) => sum + a.insights.priority_score, 0) / processedAsins.length,
    };

    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      fileName,
      runId,
      generatedAt: new Date().toISOString(),
      portfolio: {
        asinsProcessed: portfolio.asinsProcessed,
        avgRating: Math.round(portfolio.avgRating * 10) / 10,
        avgPrice: Math.round(portfolio.avgPrice * 100) / 100,
        totalEstClicks: Math.round(portfolio.totalEstClicks),
        avgPriorityScore: Math.round(portfolio.avgPriorityScore * 1000) / 1000,
      },
      asins: processedAsins,
      downloads: {
        htmlReportUrl: `/api/run/${runId}/report.html`,
        zipUrl: `/api/run/${runId}/all.zip`,
        csvBundleUrl: `/api/run/${runId}/data.zip`,
      }
    };
  }
}

export const dataProcessor = new DataProcessor();