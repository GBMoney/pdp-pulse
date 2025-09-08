import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Star, 
  DollarSign, 
  Eye, 
  HelpCircle,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KeywordCoverageChart } from "@/components/charts/KeywordCoverageChart";
import { PriceRatingChart } from "@/components/charts/PriceRatingChart";
import { ClicksShareChart } from "@/components/charts/ClicksShareChart";
import { ReviewsGapChart } from "@/components/charts/ReviewsGapChart";
import { PortfolioHeatmap } from "@/components/charts/PortfolioHeatmap";
import { CompetitorLandscape } from "@/components/charts/CompetitorLandscape";
import { ProcessedData } from "@/services/dataProcessor";

const Results = () => {
  const [results, setResults] = useState<ProcessedData | null>(null);
  const [selectedAsin, setSelectedAsin] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const processedResults = sessionStorage.getItem('processedResults');
    if (!processedResults) {
      navigate('/');
      return;
    }
    
    try {
      const data: ProcessedData = JSON.parse(processedResults);
      setResults(data);
      if (data.asins.length > 0) {
        setSelectedAsin(data.asins[0].asin);
      }
    } catch (error) {
      console.error('Failed to parse results:', error);
      navigate('/');
    }
  }, [navigate]);

  if (!results) {
    return <div>Loading...</div>;
  }

  const selectedAsinData = results.asins.find(asin => asin.asin === selectedAsin) || results.asins[0];

  const handleDownload = (type: string) => {
    try {
      let content = '';
      let filename = '';
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filePrefix = `digital_shelf_insights_${timestamp}`;

      if (type === 'data CSV') {
        content = generateCSVContent(results);
        filename = `${filePrefix}_data.csv`;
        downloadFile(content, filename, 'text/csv');
      } else if (type === 'HTML report') {
        content = generateHTMLReport(results);
        filename = `${filePrefix}_report.html`;
        downloadFile(content, filename, 'text/html');
      } else if (type === 'all ZIP') {
        // For ZIP, we'll create multiple files
        const csvContent = generateCSVContent(results);
        const htmlContent = generateHTMLReport(results);
        
        // Create a simple "ZIP-like" download by offering both files
        downloadFile(csvContent, `${filePrefix}_data.csv`, 'text/csv');
        setTimeout(() => {
          downloadFile(htmlContent, `${filePrefix}_report.html`, 'text/html');
        }, 1000);
      }

      toast({
        title: `Downloaded ${type}`,
        description: "Your file has been saved to your Downloads folder.",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "There was an error generating your file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateCSVContent = (data: ProcessedData): string => {
    const headers = [
      'ASIN', 'Product Name', 'Brand', 'Price', 'Rating', 'Reviews Count',
      'Keywords Top 4', 'Keywords Page 1', 'Est Daily Clicks', 'Est Daily Impressions',
      'KW4 Gap', 'Page 1 Gap', 'Rating Gap', 'Reviews Deficit', 'Price Position',
      'Clicks Share', 'Priority Score', 'Top Action'
    ];

    const rows = data.asins.map(asin => [
      asin.asin,
      `"${asin.target.product_name}"`,
      asin.target.brand,
      asin.target.price,
      asin.target.avg_rating,
      asin.target.ratings_count,
      asin.target.keywords_top4,
      asin.target.keywords_page1,
      asin.target.est_daily_clicks,
      asin.target.est_daily_impressions,
      asin.insights.kw4_gap,
      asin.insights.kwp1_gap,
      asin.insights.rating_gap,
      asin.insights.reviews_deficit,
      asin.insights.price_position,
      asin.insights.clicks_share,
      asin.insights.priority_score,
      asin.insights.actions.length > 0 ? `"${asin.insights.actions[0].title}"` : ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const generateHTMLReport = (data: ProcessedData): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Shelf Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .asin-section { margin-bottom: 40px; border-left: 4px solid #007acc; padding-left: 20px; }
        .insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .insight-card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 6px; }
        .actions { background: #fff3cd; padding: 15px; border-radius: 6px; margin-top: 20px; }
        .metric { font-size: 1.2em; font-weight: bold; color: #007acc; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Digital Shelf Analysis Report</h1>
        <p>Generated on: ${new Date(data.generatedAt).toLocaleString()}</p>
        <p>File: ${data.fileName}</p>
    </div>
    
    <div class="summary">
        <h2>Portfolio Summary</h2>
        <div class="insights-grid">
            <div class="insight-card">
                <h3>ASINs Processed</h3>
                <div class="metric">${data.portfolio.asinsProcessed}</div>
            </div>
            <div class="insight-card">
                <h3>Average Rating</h3>
                <div class="metric">${data.portfolio.avgRating}</div>
            </div>
            <div class="insight-card">
                <h3>Average Price</h3>
                <div class="metric">$${data.portfolio.avgPrice}</div>
            </div>
            <div class="insight-card">
                <h3>Total Daily Clicks</h3>
                <div class="metric">${data.portfolio.totalEstClicks}</div>
            </div>
        </div>
    </div>

    ${data.asins.map(asin => `
    <div class="asin-section">
        <h2>${asin.target.product_name} (${asin.asin})</h2>
        
        <div class="insights-grid">
            <div class="insight-card">
                <h4>Price</h4>
                <div class="metric">$${asin.target.price}</div>
            </div>
            <div class="insight-card">
                <h4>Rating</h4>
                <div class="metric">${asin.target.avg_rating} ★ (${asin.target.ratings_count} reviews)</div>
            </div>
            <div class="insight-card">
                <h4>Keywords Top 4</h4>
                <div class="metric">${asin.target.keywords_top4}</div>
            </div>
            <div class="insight-card">
                <h4>Keywords Page 1</h4>
                <div class="metric">${asin.target.keywords_page1}</div>
            </div>
            <div class="insight-card">
                <h4>Daily Clicks</h4>
                <div class="metric">${asin.target.est_daily_clicks}</div>
            </div>
            <div class="insight-card">
                <h4>Priority Score</h4>
                <div class="metric">${asin.insights.priority_score}</div>
            </div>
        </div>

        ${asin.insights.actions.length > 0 ? `
        <div class="actions">
            <h3>Recommended Actions</h3>
            ${asin.insights.actions.map(action => `
                <div style="margin-bottom: 15px;">
                    <strong>${action.title}</strong><br>
                    <em>${action.why}</em><br>
                    Impact: ${action.impact.join(', ')} | Effort: ${action.effort} | Target: ${action.target}
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
    `).join('')}
</body>
</html>`;
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const formatPricePosition = (position: string) => {
    const colors = {
      above: "text-warning",
      aligned: "text-success",
      below: "text-primary"
    };
    return <span className={colors[position as keyof typeof colors] || "text-muted-foreground"}>{position}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Insights for {sessionStorage.getItem('uploadedFile') ? JSON.parse(sessionStorage.getItem('uploadedFile')!).name : 'uploaded_file.csv'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Run completed {new Date(results.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Re-run with new CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                ASINs processed
                <InfoTooltip content="Number of target PDPs analysed from your file." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{results.portfolio.asinsProcessed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Avg rating (portfolio)
                <InfoTooltip content="Mean of target ASIN ratings." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <Star className="w-5 h-5 text-warning fill-current" />
                {results.portfolio.avgRating}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Avg price (portfolio)
                <InfoTooltip content="Mean of target ASIN prices." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-success" />
                {results.portfolio.avgPrice}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Total est daily clicks
                <InfoTooltip content="Sum of estimated daily clicks across target ASINs." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <Eye className="w-5 h-5 text-primary" />
                {results.portfolio.totalEstClicks.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Avg priority score
                <InfoTooltip content="Composite urgency score (0–1) from keyword gaps, reviews, click share, and price position." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <TrendingUp className="w-5 h-5 text-warning" />
                {results.portfolio.avgPriorityScore}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Views */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Views</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="opportunities" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="heatmap">Coverage Heatmap</TabsTrigger>
                <TabsTrigger value="landscape">Competitor Landscape</TabsTrigger>
              </TabsList>

              <TabsContent value="opportunities" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border rounded-lg">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left border-b border-border">ASIN</th>
                        <th className="p-3 text-left border-b border-border">Label</th>
                        <th className="p-3 text-left border-b border-border">Priority Score</th>
                        <th className="p-3 text-left border-b border-border">KW Top-4 Gap</th>
                        <th className="p-3 text-left border-b border-border">Page-1 Gap</th>
                        <th className="p-3 text-left border-b border-border">Reviews Deficit</th>
                        <th className="p-3 text-left border-b border-border">Rating Gap</th>
                        <th className="p-3 text-left border-b border-border">Price Position</th>
                        <th className="p-3 text-left border-b border-border">Clicks Share</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {results.asins.map((asin) => (
                        <tr key={asin.asin} className="hover:bg-muted/20">
                          <td className="p-3 font-mono text-sm">{asin.asin}</td>
                          <td className="p-3">{asin.label}</td>
                          <td className="p-3">
                            <Badge variant={asin.insights.priority_score > 0.7 ? "destructive" : asin.insights.priority_score > 0.5 ? "warning" : "default"}>
                              {asin.insights.priority_score}
                            </Badge>
                          </td>
                          <td className="p-3">{asin.insights.kw4_gap}</td>
                          <td className="p-3">{asin.insights.kwp1_gap}</td>
                          <td className="p-3">{asin.insights.reviews_deficit}</td>
                          <td className="p-3">{asin.insights.rating_gap}</td>
                          <td className="p-3">{formatPricePosition(asin.insights.price_position)}</td>
                          <td className="p-3">{(asin.insights.clicks_share * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="heatmap">
                <PortfolioHeatmap data={results.asins} />
              </TabsContent>

              <TabsContent value="landscape">
                <CompetitorLandscape data={results.asins} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ASIN Detail */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ASIN Detail</CardTitle>
              <Select value={selectedAsin} onValueChange={setSelectedAsin}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {results.asins.map((asin) => (
                    <SelectItem key={asin.asin} value={asin.asin}>
                      {asin.asin} - {asin.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Insight Cards */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Headline Gaps</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-warning/20 bg-warning/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Keywords Top-4 gap</span>
                        <InfoTooltip content="Competitor average minus your count of top-4 keywords. Positive = you're behind." />
                      </div>
                      <div className="text-2xl font-bold text-warning">
                        {selectedAsinData.insights.kw4_gap}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Keywords Page-1 gap</span>
                        <InfoTooltip content="Competitor average minus your page-1 keywords. Positive = you're behind." />
                      </div>
                      <div className="text-2xl font-bold text-destructive">
                        {selectedAsinData.insights.kwp1_gap}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-success/20 bg-success/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Rating gap</span>
                        <InfoTooltip content="Your average rating minus competitor average. Negative = you're behind." />
                      </div>
                      <div className="text-2xl font-bold text-success">
                        {selectedAsinData.insights.rating_gap}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-warning/20 bg-warning/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Reviews deficit</span>
                        <InfoTooltip content="Competitor average # ratings minus your # ratings. Positive = you need more reviews." />
                      </div>
                      <div className="text-2xl font-bold text-warning">
                        {selectedAsinData.insights.reviews_deficit}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-medium">Price position</span>
                         <InfoTooltip content="Your price vs competitor average: above (>3%), aligned (±3%), or below (<-3%)." />
                       </div>
                      <div className="text-2xl font-bold">
                        {formatPricePosition(selectedAsinData.insights.price_position)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-success/20 bg-success/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Clicks share</span>
                        <InfoTooltip content="Your estimated daily clicks / (your clicks + competitors' clicks)." />
                      </div>
                      <div className="text-2xl font-bold text-success">
                        {(selectedAsinData.insights.clicks_share * 100).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary-light/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">Priority Score</span>
                      <Badge variant={selectedAsinData.insights.priority_score > 0.7 ? "destructive" : "warning"}>
                        {selectedAsinData.insights.priority_score > 0.7 ? "High Priority" : "Medium Priority"}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {selectedAsinData.insights.priority_score}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="space-y-6">
                <KeywordCoverageChart data={selectedAsinData} />
                <PriceRatingChart data={selectedAsinData} />
                <ClicksShareChart data={selectedAsinData} />
                <ReviewsGapChart data={selectedAsinData} />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Action Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Action Plan</CardTitle>
            <CardDescription>Prioritized recommendations for {selectedAsinData.label}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAsinData.insights.actions.map((action, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{action.title}</h4>
                        {action.effort === "Low" && <Badge variant="success" className="gap-1"><Zap className="w-3 h-3" />Quick Win</Badge>}
                      </div>
                      <p className="text-muted-foreground">{action.why}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Expected impact:</span>
                          <div className="flex gap-1">
                            {action.impact.map((impact, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {impact}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Target:</span>
                          <span className="text-sm text-primary">{action.target}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;