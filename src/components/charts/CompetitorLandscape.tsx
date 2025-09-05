import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface CompetitorLandscapeProps {
  data: any[];
}

export function CompetitorLandscape({ data }: CompetitorLandscapeProps) {
  const chartData = data.flatMap(asin => [
    {
      name: asin.label,
      price: asin.target.price,
      rating: asin.target.avg_rating,
      ratings_count: asin.target.ratings_count,
      type: "target",
      asin: asin.asin
    },
    {
      name: "Comp Avg",
      price: asin.comp_avg.price,
      rating: asin.comp_avg.rating,
      ratings_count: asin.comp_avg.ratings_count,
      type: "competitor",
      asin: asin.asin
    }
  ]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">Price: ${data.price}</p>
          <p className="text-sm text-muted-foreground">Rating: {data.rating}</p>
          <p className="text-sm text-muted-foreground">Reviews: {data.ratings_count.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Competitor Landscape
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Positioning vs market expectations. High rating + competitive price = top-right cluster.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Price vs Rating across your portfolio and market averages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number"
              dataKey="price" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              name="Price"
              unit="$"
            />
            <YAxis 
              type="number"
              dataKey="rating"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              name="Rating"
              domain={[3.5, 5]}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Scatter data={chartData} fill="hsl(var(--chart-1))">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.type === "target" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }}></div>
            <span className="text-sm text-muted-foreground">Your ASINs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }}></div>
            <span className="text-sm text-muted-foreground">Market Average</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}