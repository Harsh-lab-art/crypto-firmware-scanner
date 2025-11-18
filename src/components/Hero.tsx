import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

interface HeroProps {
  onStartAnalysis: () => void;
}

const Hero = ({ onStartAnalysis }: HeroProps) => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-dark opacity-50" />
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-primary text-sm font-mono">ML-Powered Firmware Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Detect Crypto Primitives in
            <span className="text-primary"> Black-Box Firmware</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cross-ISA binary analysis using Transformers and Graph Neural Networks.
            Automatically identify cryptographic functions, protocols, and state machines
            without source code or symbols.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={onStartAnalysis} className="group">
              Start Analysis
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button size="lg" variant="outline" className="gap-2">
              <Github className="w-4 h-4" />
              View Source
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">5+</div>
              <div className="text-sm text-muted-foreground">Supported ISAs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">10+</div>
              <div className="text-sm text-muted-foreground">Crypto Algorithms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">95%</div>
              <div className="text-sm text-muted-foreground">Detection Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
