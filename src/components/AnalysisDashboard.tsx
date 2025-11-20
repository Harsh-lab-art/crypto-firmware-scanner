import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, Shield, Network, Database } from "lucide-react";
import FunctionTable from "./analysis/FunctionTable";
import CFGVisualization from "./analysis/CFGVisualization";
import SimilarityResults from "./analysis/SimilarityResults";
import ProtocolTimeline from "./analysis/ProtocolTimeline";
import PipelineStatus from "./analysis/PipelineStatus";
import AIAssistant from "./AIAssistant";
import N8nIntegration from "./N8nIntegration";
import BlockchainLogger from "./BlockchainLogger";
import BlockchainHistory from "./BlockchainHistory";
import ContractSettings from "./ContractSettings";

interface AnalysisDashboardProps {
  analysisId: string;
  onBack: () => void;
}

const AnalysisDashboard = ({ analysisId, onBack }: AnalysisDashboardProps) => {
  const [pipelineComplete, setPipelineComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPipelineComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">firmware_sample.bin</h1>
                <p className="text-sm text-muted-foreground">ARM64 • 2.4 MB • 847 functions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className={pipelineComplete ? "w-5 h-5 text-confidence-high" : "w-5 h-5 text-confidence-medium animate-pulse"} />
              <span className="text-sm font-medium">
                {pipelineComplete ? "Analysis Complete" : "Analyzing..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <PipelineStatus isComplete={pipelineComplete} />

        <div className="grid lg:grid-cols-3 gap-6 mb-6 mt-6">
          <Card className="p-6 border-l-4 border-l-crypto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crypto Functions</p>
                <p className="text-3xl font-bold text-crypto mt-1">23</p>
              </div>
              <Shield className="w-10 h-10 text-crypto opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-non-crypto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non-Crypto Functions</p>
                <p className="text-3xl font-bold text-non-crypto mt-1">824</p>
              </div>
              <Database className="w-10 h-10 text-non-crypto opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-3xl font-bold text-confidence-high mt-1">94.2%</p>
              </div>
              <Activity className="w-10 h-10 text-primary opacity-20" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="functions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="cfg">Control Flow</TabsTrigger>
            <TabsTrigger value="similarity">Similarity</TabsTrigger>
            <TabsTrigger value="protocol">Protocol</TabsTrigger>
          </TabsList>

          <TabsContent value="functions" className="space-y-4">
            <FunctionTable />
          </TabsContent>

          <TabsContent value="cfg" className="space-y-4">
            <CFGVisualization />
          </TabsContent>

          <TabsContent value="similarity" className="space-y-4">
            <SimilarityResults />
          </TabsContent>

          <TabsContent value="protocol" className="space-y-4">
            <ProtocolTimeline />
          </TabsContent>
        </Tabs>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <AIAssistant analysisContext={{ analysisId: analysisId }} />
          <N8nIntegration analysisId={analysisId} />
        </div>

        <div className="space-y-6 mt-6">
          <ContractSettings />
          
          <div className="grid lg:grid-cols-2 gap-6">
            <BlockchainLogger
              analysisId={analysisId}
              filename="firmware_sample.bin"
              cryptoFunctions={23}
              totalFunctions={847}
            />
            <BlockchainHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
