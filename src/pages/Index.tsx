import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Shield, Binary, Cpu, Network } from "lucide-react";
import Hero from "@/components/Hero";
import UploadSection from "@/components/UploadSection";
import AnalysisDashboard from "@/components/AnalysisDashboard";

const Index = () => {
  const [analysisStarted, setAnalysisStarted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!analysisStarted ? (
        <>
          <Hero onStartAnalysis={() => setAnalysisStarted(true)} />
          <UploadSection onUpload={() => setAnalysisStarted(true)} />
          
          <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Pipeline Overview</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-card border border-border rounded-lg">
                <Binary className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Binary Lifting</h3>
                <p className="text-muted-foreground text-sm">
                  Lift firmware to IR (VEX/P-Code) for cross-ISA analysis
                </p>
              </div>
              
              <div className="p-6 bg-card border border-border rounded-lg">
                <Cpu className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Feature Extraction</h3>
                <p className="text-muted-foreground text-sm">
                  Extract instruction sequences, CFGs, constants, and entropy
                </p>
              </div>
              
              <div className="p-6 bg-card border border-border rounded-lg">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">ML Classification</h3>
                <p className="text-muted-foreground text-sm">
                  Transformer + GNN models detect and classify crypto primitives
                </p>
              </div>
              
              <div className="p-6 bg-card border border-border rounded-lg">
                <Network className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Protocol Inference</h3>
                <p className="text-muted-foreground text-sm">
                  Infer high-level protocol behavior from function sequences
                </p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <AnalysisDashboard onBack={() => setAnalysisStarted(false)} />
      )}
    </div>
  );
};

export default Index;
