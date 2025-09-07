import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, FileText, Clock, CheckCircle } from "lucide-react";

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
  const navigate = useNavigate();

  const steps: ProcessingStep[] = [
    { id: 'parsing', title: 'Parsing CSV', status: 'pending' },
    { id: 'extracting', title: 'Extracting ASINs', status: 'pending' },
    { id: 'fetching', title: 'Fetching from Pattern API', status: 'pending' },
    { id: 'computing', title: 'Computing insights', status: 'pending' },
    { id: 'rendering', title: 'Rendering charts/report', status: 'pending' },
  ];

  const [processSteps, setProcessSteps] = useState(steps);

  // Get file info from sessionStorage
  const fileInfo = JSON.parse(sessionStorage.getItem('uploadedFile') || '{}');

  useEffect(() => {
    if (!fileInfo.name) {
      navigate('/');
      return;
    }

    // Simulate processing
    const processFile = async () => {
      const stepDurations = [1000, 2000, 3000, 2000, 1500];
      
      for (let i = 0; i < steps.length; i++) {
        // Update current step to active
        setProcessSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'active' : index < i ? 'completed' : 'pending'
        })));
        
        setCurrentStep(i);
        
        // Add some logs
        const stepLogs = {
          0: ['Validating CSV structure...', 'Found 12 rows with URL column', 'CSV parsing completed'],
          1: ['Extracting ASINs from Amazon URLs...', 'ASIN B0CC282PBW extracted', 'ASIN B0COMP0001 extracted', 'Found 12 unique ASINs'],
          2: ['Calling Pattern API...', 'https://insights.pattern.com/digital-shelf/B0CC282PBW/competitors/top-five?country_code=US', 'ASIN B0CC282PBW — competitors found: 5', 'Fetching competitor data complete'],
          3: ['Computing keyword gaps...', 'Calculating priority scores...', 'Generating recommendations...', 'Insights computed successfully'],
          4: ['Generating charts...', 'Building HTML report...', 'Preparing downloads...', 'All assets ready']
        };

        // Add logs for current step
        for (const log of stepLogs[i as keyof typeof stepLogs] || []) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
        }

        // Update progress
        setProgress(((i + 1) / steps.length) * 100);

        await new Promise(resolve => setTimeout(resolve, stepDurations[i]));
      }

      // Mark all as completed
      setProcessSteps(prev => prev.map(step => ({
        ...step,
        status: 'completed'
      })));

      // Navigate to results after a brief delay
      setTimeout(() => {
        navigate('/results');
      }, 1000);
    };

    processFile();
  }, [fileInfo.name, navigate]);

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