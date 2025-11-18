import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";

interface PipelineStatusProps {
  isComplete: boolean;
}

const stages = [
  { name: "Binary Lifting", description: "IR extraction via angr/VEX" },
  { name: "Feature Extraction", description: "CFG, opcodes, constants" },
  { name: "ML Classification", description: "Transformer + GNN inference" },
  { name: "Similarity Search", description: "FAISS nearest neighbor" },
  { name: "Protocol Inference", description: "Sequence analysis" },
];

const PipelineStatus = ({ isComplete }: PipelineStatusProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Pipeline Status</h2>
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isActive = !isComplete && index === 2;
          const isDone = isComplete || index < 2;
          
          return (
            <div key={stage.name} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDone 
                  ? "bg-confidence-high/20 text-confidence-high" 
                  : isActive 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                  {stage.name}
                </p>
                <p className="text-xs text-muted-foreground">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PipelineStatus;
