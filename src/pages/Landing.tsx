import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, ArrowRight, CheckCircle, AlertTriangle, BarChart3, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import heroImage from "@/assets/hero-analytics.jpg";

const Landing = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileValidated = (file: File, isValid: boolean) => {
    setFile(file);
    setIsValidFile(isValid);
  };

  const handleGenerateInsights = () => {
    if (!file || !isValidFile) {
      toast({
        title: "Invalid file",
        description: "Please upload a valid CSV file with a 'url' column.",
        variant: "destructive",
      });
      return;
    }

    // Store file in sessionStorage for processing page
    sessionStorage.setItem('uploadedFile', JSON.stringify({
      name: file.name,
      size: file.size,
      type: file.type
    }));

    navigate('/processing');
  };

  const steps = [
    { number: 1, title: "Upload CSV", description: "Your Amazon PDP URLs" },
    { number: 2, title: "Extract ASINs", description: "Auto-detect from URLs" },
    { number: 3, title: "Fetch & Normalise", description: "Collect competitor data" },
    { number: 4, title: "Analyse & Score", description: "Generate insights" },
    { number: 5, title: "Report & Downloads", description: "Visual recommendations" },
  ];

  const features = [
    {
      icon: Target,
      title: "ASIN Extraction",
      description: "We detect the ASIN from .../dp/ASIN/.... patterns automatically."
    },
    {
      icon: BarChart3,
      title: "Competitive Context",
      description: "We compare you vs the top 5 rival ASINs for comprehensive analysis."
    },
    {
      icon: Zap,
      title: "Actionable Output",
      description: "Clear charts, gaps, and next steps — not just data dumps."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Digital Shelf Snapshot</h1>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">About</Button>
            <Button variant="ghost" size="sm">Help</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Digital Shelf
                  <span className="block text-primary">Snapshot</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Upload your Amazon PDP URLs, auto-extract ASINs, benchmark against competitors, 
                  and get quick, visual recommendations to improve PDP health.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="xl"
                  onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group"
                >
                  <Upload className="w-5 h-5" />
                  Upload .csv file
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="xl"
                  disabled={!isValidFile}
                  onClick={handleGenerateInsights}
                >
                  Generate Insights
                  {!isValidFile && <span className="text-xs">(upload file first)</span>}
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src={heroImage} 
                alt="Analytics Dashboard Preview" 
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-hero rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">Simple steps to get actionable insights</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center space-x-3 bg-card rounded-lg p-4 shadow-sm border">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-16 bg-card/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Upload your CSV</CardTitle>
              <CardDescription>
                Upload your Amazon PDP URLs to get started with competitive analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUpload onFileValidated={handleFileValidated} />
              
              <div className="space-y-3">
                <h4 className="font-medium">CSV Requirements:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Must contain a <code className="bg-muted px-1 rounded">url</code> column (Amazon PDP links)
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Optional columns: label, brand, price_floor, target_rating, target_reviews_count
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto text-sm">
                  Download sample CSV
                </Button>
              </div>

              {file && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{file.name}</span>
                    <Badge variant={isValidFile ? "default" : "destructive"}>
                      {isValidFile ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={!isValidFile}
                onClick={handleGenerateInsights}
              >
                <BarChart3 className="w-5 h-5" />
                Generate Insights
                <span className="text-xs opacity-75">Let's go</span>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We only process what you upload. No external storage.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;