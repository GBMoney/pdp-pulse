import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface KeywordCoverageChartProps {
  data: any;
}

export function KeywordCoverageChart({ data }: KeywordCoverageChartProps) {
  const chartData = [
    {
      name: "Keywords Top-4",
      target: data.target.keywords_top4,
      competitor: data.comp_avg.keywords_top4,
    },
    {
      name: "Keywords Page-1", 
      target: data.target.keywords_page1,
      competitor: data.comp_avg.keywords_page1,
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Keyword Coverage
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Counts of keywords where the ASIN appears in top 4 or anywhere on page 1. Higher is better.</p>
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
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px"
              }}
            />
            <Bar 
              dataKey="target" 
              fill="hsl(var(--chart-1))" 
              name="Target"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="competitor" 
              fill="hsl(var(--chart-2))" 
              name="Comp Avg"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}