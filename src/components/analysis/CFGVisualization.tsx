import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const CFGVisualization = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Control Flow Graph</h2>
          <p className="text-sm text-muted-foreground">Function: sub_401234 (AES-128)</p>
        </div>
        <Badge variant="outline" className="text-crypto border-crypto">
          Crypto Pattern Detected
        </Badge>
      </div>

      <div className="bg-code-bg rounded-lg p-8 border border-border min-h-[400px]">
        <div className="space-y-6">
          {/* Entry block */}
          <div className="flex items-center gap-4">
            <div className="bg-card border-2 border-primary p-4 rounded-lg min-w-[200px]">
              <p className="text-xs font-mono text-muted-foreground mb-2">0x00401234</p>
              <p className="text-sm font-mono text-code-text">Entry Block</p>
              <p className="text-xs text-muted-foreground mt-1">4 instructions</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Round loop */}
          <div className="ml-8 space-y-4">
            <div className="bg-card border-2 border-crypto p-4 rounded-lg min-w-[200px]">
              <p className="text-xs font-mono text-muted-foreground mb-2">0x00401250</p>
              <p className="text-sm font-mono text-crypto">Round Loop</p>
              <p className="text-xs text-muted-foreground mt-1">12 instructions</p>
              <Badge variant="outline" className="text-xs mt-2 border-crypto text-crypto">
                S-Box Lookup
              </Badge>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <div className="w-0.5 h-8 bg-border" />
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="bg-card border border-border p-4 rounded-lg min-w-[200px]">
              <p className="text-xs font-mono text-muted-foreground mb-2">0x00401290</p>
              <p className="text-sm font-mono text-code-text">Mix Columns</p>
              <p className="text-xs text-muted-foreground mt-1">8 instructions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-card border-2 border-confidence-high p-4 rounded-lg min-w-[200px]">
              <p className="text-xs font-mono text-muted-foreground mb-2">0x004012C0</p>
              <p className="text-sm font-mono text-confidence-high">Exit Block</p>
              <p className="text-xs text-muted-foreground mt-1">2 instructions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="text-crypto font-semibold">Analysis:</span> Detected characteristic
          AES round structure with S-box lookups (constant table access patterns) and
          MixColumns operations. High confidence: 97.3%
        </p>
      </div>
    </Card>
  );
};

export default CFGVisualization;
