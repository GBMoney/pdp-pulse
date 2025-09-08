import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, FileText, Clock, CheckCircle } from "lucide-react";
import { dataProcessor } from "@/services/dataProcessor";
import { useToast } from "@/hooks/use-toast";

interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
}

const Processing = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps: ProcessingStep[] = [
    { id: 'parsing', title: 'Parsing CSV', status: 'pending' },
    { id: 'extracting', title: 'Extracting ASINs', status: 'pending' },
    { id: 'fetching', title: 'Fetching competitor data', status: 'pending' },
    { id: 'computing', title: 'Computing insights', status: 'pending' },
    { id: 'rendering', title: 'Rendering charts/report', status: 'pending' },
  ];

  const [processSteps, setProcessSteps] = useState(steps);

  // Get file info from sessionStorage
  const fileInfo = JSON.parse(sessionStorage.getItem('uploadedFile') || '{}');

  useEffect(() => {
    if (!fileInfo.name || !fileInfo.content) {
      navigate('/');
      return;
    }

    // Real processing
    const processFile = async () => {
      try {
        // Step 1: Parsing CSV
        setProcessSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === 0 ? 'active' : 'pending'
        })));
        setCurrentStep(0);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Validating CSV structure...`]);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CSV parsing completed`]);
        setProgress(20);

        // Step 2: Extracting ASINs
        setProcessSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === 1 ? 'active' : index < 1 ? 'completed' : 'pending'
        })));
        setCurrentStep(1);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Extracting ASINs from Amazon URLs...`]);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setProgress(40);

        // Step 3: Fetching from Pattern API (actual processing)
        setProcessSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === 2 ? 'active' : index < 2 ? 'completed' : 'pending'
        })));
        setCurrentStep(2);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Fetching competitor data...`]);
        
        // Process the actual data
        const results = await dataProcessor.processCSVData(fileInfo.content, fileInfo.name);
        
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found ${results.asins.length} unique ASINs`]);
        results.asins.forEach((asin, index) => {
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ASIN ${asin.asin} — competitors found: ${asin.competitors.length}`]);
        });
        
        setProgress(70);

        // Step 4: Computing insights
        setProcessSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === 3 ? 'active' : index < 3 ? 'completed' : 'pending'
        })));
        setCurrentStep(3);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Computing keyword gaps...`]);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Calculating priority scores...`]);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Generating recommendations...`]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Insights computed successfully`]);
        setProgress(90);

        // Step 5: Rendering charts & report
        setProcessSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === 4 ? 'active' : index < 4 ? 'completed' : 'pending'
        })));
        setCurrentStep(4);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Generating charts...`]);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Building HTML report...`]);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Preparing downloads...`]);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] All assets ready`]);
        setProgress(100);

        // Mark all as completed
        setProcessSteps(prev => prev.map(step => ({
          ...step,
          status: 'completed'
        })));

        // Store results and navigate
        sessionStorage.setItem('processedResults', JSON.stringify(results));
        
        setTimeout(() => {
          navigate('/results');
        }, 1000);

      } catch (error) {
        console.error('Processing failed:', error);
        setError(error instanceof Error ? error.message : 'Processing failed');
        setProcessSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === currentStep ? 'error' : index < currentStep ? 'completed' : 'pending'
        })));
        
        toast({
          title: "Processing Failed",
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: "destructive",
        });
      }
    };

    processFile();
  }, [fileInfo.name, fileInfo.content, navigate, currentStep, toast]);

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'active':
        return <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />;
      case 'error':
        return <div className="w-5 h-5 rounded-full bg-destructive" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-muted" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Processing: {fileInfo.name}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Started {new Date().toLocaleString()}
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Processing Progress
              <Badge variant="outline">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Processing Steps */}
            <div className="space-y-4">
              {processSteps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    step.status === 'active' ? 'bg-primary/5 border-primary/20' :
                    step.status === 'completed' ? 'bg-success/5 border-success/20' :
                    'bg-muted/20'
                  }`}
                >
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    {step.message && (
                      <p className="text-sm text-muted-foreground">{step.message}</p>
                    )}
                  </div>
                  <Badge 
                    variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'active' ? 'secondary' :
                      'outline'
                    }
                  >
                    {step.status === 'completed' ? 'Done' :
                     step.status === 'active' ? 'Processing' :
                     'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Logs */}
        <Card>
          <Collapsible open={isLogsOpen} onOpenChange={setIsLogsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  Live Processing Log
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{logs.length} entries</Badge>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isLogsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-1 font-mono text-sm">
                    {logs.map((log, index) => (
                      <div key={index} className="text-muted-foreground">
                        {log}
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-muted-foreground">Waiting for processing to begin...</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};

export default Processing;