import { useState } from "react";
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

// Mock data structure matching the API spec
const mockResults = {
  runId: "abc123",
  generatedAt: "2025-09-05T12:00:00Z",
  portfolio: {
    asinsProcessed: 12,
    avgRating: 4.4,
    avgPrice: 23.95,
    totalEstClicks: 3120,
    avgPriorityScore: 0.56
  },
  asins: [
    {
      asin: "B0CC282PBW",
      label: "Hero Product 1",
      target: {
        price: 24.99,
        est_daily_impressions: 12000,
        est_daily_clicks: 360,
        ratings_count: 540,
        avg_rating: 4.3,
        keywords_top4: 18,
        keywords_page1: 92
      },
      comp_avg: {
        price: 23.29,
        rating: 4.4,
        ratings_count: 1050,
        keywords_top4: 18.6,
        keywords_page1: 104,
        est_daily_clicks: 264
      },
      competitors: [
        {
          rank: 1,
          comp_asin: "B0COMP0001",
          product_name: "Premium Widget Pro",
          brand_name: "BrandA",
          price: 22.99,
          rating: 4.4,
          ratings_count: 800,
          keywords_top4: 20,
          keywords_page1: 110,
          est_daily_clicks: 310
        },
        {
          rank: 2,
          comp_asin: "B0COMP0002",
          product_name: "Smart Widget Elite",
          brand_name: "BrandB",
          price: 21.49,
          rating: 4.5,
          ratings_count: 1200,
          keywords_top4: 19,
          keywords_page1: 98,
          est_daily_clicks: 285
        }
      ],
      insights: {
        kw4_gap: 0.6,
        kwp1_gap: 12.0,
        rating_gap: -0.10,
        reviews_deficit: 510,
        price_position: "above",
        clicks_share: 0.58,
        priority_score: 0.72,
        actions: [
          {
            title: "Expand Page-1 coverage by ~12 keywords",
            why: "You trail comp avg on Page-1 listings which limits discoverability.",
            impact: ["↑ clicks", "↑ rank"],
            effort: "Low",
            target: "Reach ~104 Page-1 keywords"
          },
          {
            title: "Accelerate review acquisition (~500 additional)",
            why: "Large social proof gap vs comp avg is suppressing CVR and ranking.",
            impact: ["↑ CVR", "↑ rank"],
            effort: "Med",
            target: "1050 total ratings"
          }
        ]
      }
    }
  ]
};

const Results = () => {
  const [selectedAsin, setSelectedAsin] = useState(mockResults.asins[0].asin);
  const navigate = useNavigate();
  const { toast } = useToast();

  const selectedAsinData = mockResults.asins.find(asin => asin.asin === selectedAsin) || mockResults.asins[0];

  const handleDownload = (type: string) => {
    toast({
      title: `Downloading ${type}...`,
      description: "Your download will begin shortly.",
    });
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
                Insights for sample_data.csv
              </h1>
              <p className="text-sm text-muted-foreground">
                Run completed {new Date(mockResults.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleDownload('HTML report')}>
                <FileText className="w-4 h-4" />
                HTML Report
                <span className="text-xs opacity-75">Make it make sense</span>
              </Button>
              <Button variant="outline" onClick={() => handleDownload('data CSV')}>
                Data Bundle (CSV)
                <span className="text-xs opacity-75">Show me the gaps</span>
              </Button>
              <Button variant="default" onClick={() => handleDownload('all ZIP')}>
                <Download className="w-4 h-4" />
                Everything (ZIP)
                <span className="text-xs opacity-75">Let's go</span>
              </Button>
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
              <div className="text-2xl font-bold text-primary">{mockResults.portfolio.asinsProcessed}</div>
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
                {mockResults.portfolio.avgRating}
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
                {mockResults.portfolio.avgPrice}
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
                {mockResults.portfolio.totalEstClicks.toLocaleString()}
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
                {mockResults.portfolio.avgPriorityScore}
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
                        <th className="p-3 text-left border-b border-border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockResults.asins.map((asin) => (
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
                          <td className="p-3">
                            <Button variant="outline" size="sm" onClick={() => setSelectedAsin(asin.asin)}>
                              View details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="heatmap">
                <PortfolioHeatmap data={mockResults.asins} />
              </TabsContent>

              <TabsContent value="landscape">
                <CompetitorLandscape data={mockResults.asins} />
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
                  {mockResults.asins.map((asin) => (
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

        {/* Competitor Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Competitor Analysis
              <InfoTooltip content="Top 5 products competing with the selected ASIN, as surfaced by the data source." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left border-b border-border">Rank</th>
                    <th className="p-3 text-left border-b border-border">ASIN</th>
                    <th className="p-3 text-left border-b border-border">Product Name</th>
                    <th className="p-3 text-left border-b border-border">Brand</th>
                    <th className="p-3 text-left border-b border-border">Price</th>
                    <th className="p-3 text-left border-b border-border">Rating</th>
                    <th className="p-3 text-left border-b border-border">Reviews</th>
                    <th className="p-3 text-left border-b border-border">KW Top-4</th>
                    <th className="p-3 text-left border-b border-border">KW Page-1</th>
                    <th className="p-3 text-left border-b border-border">Est Daily Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAsinData.competitors.map((competitor) => (
                    <tr key={competitor.comp_asin} className="hover:bg-muted/20">
                      <td className="p-3">#{competitor.rank}</td>
                      <td className="p-3 font-mono text-sm">{competitor.comp_asin}</td>
                      <td className="p-3">{competitor.product_name}</td>
                      <td className="p-3">{competitor.brand_name}</td>
                      <td className="p-3">${competitor.price}</td>
                      <td className="p-3 flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        {competitor.rating}
                      </td>
                      <td className="p-3">{competitor.ratings_count.toLocaleString()}</td>
                      <td className="p-3">{competitor.keywords_top4}</td>
                      <td className="p-3">{competitor.keywords_page1}</td>
                      <td className="p-3">{competitor.est_daily_clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

            <div className="flex gap-4 pt-4 border-t">
              <Button variant="hero" onClick={() => handleDownload('HTML report')}>
                <FileText className="w-4 h-4" />
                Download HTML report
              </Button>
              <Button variant="default" onClick={() => handleDownload('all ZIP')}>
                <Download className="w-4 h-4" />
                Download all (ZIP)
              </Button>
              <Button variant="outline" onClick={() => handleDownload('data CSV')}>
                Download data (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;