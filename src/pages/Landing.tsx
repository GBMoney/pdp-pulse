import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, ArrowRight, CheckCircle, AlertTriangle, BarChart3, Target, Zap, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

const Landing = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileValidated = (file: File, isValid: boolean) => {
    setFile(file);
    setIsValidFile(isValid);
  };

  const handleGenerateInsights = async () => {
    if (!file || !isValidFile) {
      toast({
        title: "Invalid file",
        description: "Please upload a valid CSV file with a 'url' column.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting file processing...', file.name);
      const content = await file.text();
      console.log('File content loaded, length:', content.length);
      
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: content
      };
      
      sessionStorage.setItem('uploadedFile', JSON.stringify(fileData));
      console.log('Navigating to processing page...');
      navigate('/processing');
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Error reading file", 
        description: "Failed to read the uploaded file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const steps = [
    { number: 1, title: "Upload CSV", description: "Your Amazon PDP URLs" },
    { number: 2, title: "Extract ASINs", description: "Auto-detect from URLs" },
    { number: 3, title: "Fetch Competitor Data", description: "Pull top 5 rivals via API" },
    { number: 4, title: "Analyse & Score", description: "Generate insights" },
    { number: 5, title: "Report & Download", description: "Visual recommendations" },
  ];

  const features = [
    {
      icon: Target,
      title: "ASIN extraction",
      description: "We detect the ASIN from …/dp/ASIN/… automatically."
    },
    {
      icon: BarChart3,
      title: "Competitive context",
      description: "We pull and analyse your top 5 rivals per ASIN."
    },
    {
      icon: Zap,
      title: "Actionable output",
      description: "Clear charts, gaps, and prioritised recommendations."
    }
  ];

  return (
    <div className="min-h-screen" style={{background: 'var(--gradient-hero)'}}>
      {/* Navigation */}
      <nav className="backdrop-filter backdrop-blur-sm bg-gradient-glass border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Digital Shelf Snapshot</h1>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">About</Button>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">Help</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Floating chart elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-lg animate-drift"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-accent-wins/20 rounded-full animate-float"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-8 bg-warning/20 rounded-md animate-drift" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-32 right-1/3 w-14 h-14 bg-primary/30 rounded-lg animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight animate-fade-in">
                Know your Amazon edge
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  in minutes
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 leading-relaxed animate-fade-in-delayed max-w-3xl mx-auto">
                Upload PDP links → auto-extract ASINs → pull competitors → get instant, visual insights to tune price, keywords, and reviews.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delayed">
              <Button 
                variant="default" 
                size="xl"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-white text-primary hover:bg-white/90 border-0 shadow-lg animate-scale-spring"
                style={{animationDelay: '200ms', animationFillMode: 'both'}}
              >
                <Upload className="w-5 h-5" />
                Upload .csv
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                disabled={!isValidFile}
                onClick={handleGenerateInsights}
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 animate-scale-spring"
                style={{animationDelay: '250ms', animationFillMode: 'both'}}
              >
                Generate insights
                {!isValidFile && <span className="text-sm opacity-75">(disabled until file validates)</span>}
              </Button>
            </div>

            <p className="text-sm text-white/60 animate-fade-in-delayed">
              We only process what you upload. No external storage.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-cards/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4 group">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-surface-hero/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">How it works</h2>
            <p className="text-white/70 text-lg">Simple steps to get actionable insights</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center group">
                <div className="flex items-center space-x-4 bg-gradient-glass backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg hover:shadow-glow transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-hover text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{step.title}</h4>
                    <p className="text-sm text-white/70">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-white/40 mx-3 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-20 bg-surface-cards/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-elegant border-white/10 bg-gradient-glass backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Drop your CSV here</CardTitle>
              <CardDescription className="text-white/70">
                Must include a url column. Optional: label, brand, price_floor, target_rating, target_reviews_count.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUpload onFileValidated={handleFileValidated} />
              
              <div className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle className="w-4 h-4 text-accent-wins" />
                    <span className="font-medium">url</span> ✓
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                    <span>label • optional</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                    <span>brand • optional</span>
                  </div>
                </div>
                <Button variant="ghost" className="p-0 h-auto text-sm text-primary hover:text-primary-hover" onClick={() => {
                  const csvContent = `url,label,brand,price_floor,target_rating,target_reviews_count
https://amazon.com/dp/B0CC282PBW,Hero Product 1,YourBrand,20.00,4.5,1000
https://amazon.com/dp/B0SAMPLE123,Premium Widget,YourBrand,25.00,4.4,800
https://amazon.com/dp/B0EXAMPLE456,Smart Device,YourBrand,30.00,4.6,1200`;
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sample_amazon_urls.csv';
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}>
                  Download sample CSV
                </Button>
              </div>

              {file && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{file.name}</span>
                    <Badge variant={isValidFile ? "default" : "destructive"} className={isValidFile ? "bg-accent-wins" : ""}>
                      {isValidFile ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  {isValidFile && (
                    <div className="text-xs text-accent-wins flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Ready to process
                    </div>
                  )}
                </div>
              )}

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={!isValidFile}
                onClick={handleGenerateInsights}
              >
                <TrendingUp className="w-5 h-5" />
                Generate Insights
                <span className="text-sm opacity-90">Let's go</span>
              </Button>

              <p className="text-xs text-center text-white/50">
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