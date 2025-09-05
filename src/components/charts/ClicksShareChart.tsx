import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface ClicksShareChartProps {
  data: any;
}

export function ClicksShareChart({ data }: ClicksShareChartProps) {
  const totalCompetitorClicks = data.competitors.reduce((sum: number, comp: any) => sum + comp.est_daily_clicks, 0);
  
  const chartData = [
    {
      name: "Your ASIN",
      clicks: data.target.est_daily_clicks,
      fill: "hsl(var(--chart-1))"
    },
    {
      name: "Competitors",
      clicks: totalCompetitorClicks,
      fill: "hsl(var(--chart-2))"
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = chartData.reduce((sum, item) => sum + item.clicks, 0);
      const percentage = ((data.clicks / total) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">Clicks: {data.clicks.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Share: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Clicks Share
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Share of estimated daily clicks captured by your ASIN versus competitors.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="clicks" 
              fill="hsl(var(--chart-1))"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}