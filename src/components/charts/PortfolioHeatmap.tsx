import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface PortfolioHeatmapProps {
  data: any[];
}

export function PortfolioHeatmap({ data }: PortfolioHeatmapProps) {
  const getHeatmapColor = (value: number, max: number) => {
    const intensity = value / max;
    return `hsl(var(--primary) / ${Math.max(0.1, intensity)})`;
  };

  const maxTop4 = Math.max(...data.map(item => item.target.keywords_top4));
  const maxPage1 = Math.max(...data.map(item => item.target.keywords_page1));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Coverage Heatmap
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Darker = better coverage. Use to spot weakest PDPs.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Keyword coverage across your product portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div></div>
            <div className="text-center font-medium">Keywords Top-4</div>
            <div className="text-center font-medium">Keywords Page-1</div>
          </div>
          
          {data.map((item, index) => (
            <div key={item.asin} className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm font-medium truncate" title={item.label}>
                {item.label}
              </div>
              <div 
                className="h-12 rounded flex items-center justify-center text-sm font-medium text-white"
                style={{ backgroundColor: getHeatmapColor(item.target.keywords_top4, maxTop4) }}
              >
                {item.target.keywords_top4}
              </div>
              <div 
                className="h-12 rounded flex items-center justify-center text-sm font-medium text-white"
                style={{ backgroundColor: getHeatmapColor(item.target.keywords_page1, maxPage1) }}
              >
                {item.target.keywords_page1}
              </div>
            </div>
          ))}
          
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <span className="text-xs text-muted-foreground">Weak</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity, i) => (
                <div 
                  key={i}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: `hsl(var(--primary) / ${intensity})` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Strong</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}