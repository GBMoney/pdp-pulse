import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface PriceRatingChartProps {
  data: any;
}

export function PriceRatingChart({ data }: PriceRatingChartProps) {
  const chartData = [
    {
      name: data.label,
      price: data.target.price,
      rating: data.target.avg_rating,
      ratings_count: data.target.ratings_count,
      type: "target"
    },
    ...data.competitors.map((comp: any) => ({
      name: comp.product_name,
      price: comp.price,
      rating: comp.rating,
      ratings_count: comp.ratings_count,
      type: "competitor"
    }))
  ];

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
        <CardTitle className="text-base flex items-center gap-2">
          Price vs Rating
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Compare value perception (rating) against price. Outliers can indicate price pressure or brand strength.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
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
      </CardContent>
    </Card>
  );
}