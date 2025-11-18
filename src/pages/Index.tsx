import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Hero from "@/components/Hero";
import UploadSection from "@/components/UploadSection";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import { useFirmwareAnalysis } from "@/hooks/useFirmwareAnalysis";

const Index = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const { uploadAndAnalyze, isAnalyzing } = useFirmwareAnalysis();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleUpload = async (file: File, isa: string) => {
    if (!userId) {
      toast.error("Please sign in to upload firmware");
      return;
    }

    try {
      const analysisId = await uploadAndAnalyze(file, isa, userId);
      setCurrentAnalysisId(analysisId);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {!currentAnalysisId ? (
        <>
          <Hero onStartAnalysis={() => setCurrentAnalysisId('demo')} />
          <UploadSection onUpload={handleUpload} isAnalyzing={isAnalyzing} />
        </>
      ) : (
        <AnalysisDashboard
          analysisId={currentAnalysisId}
          onBack={() => setCurrentAnalysisId(null)}
        />
      )}
    </div>
  );
};

export default Index;
