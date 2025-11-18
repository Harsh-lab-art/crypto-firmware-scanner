import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFirmwareAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const uploadAndAnalyze = async (file: File, isa: string, userId: string) => {
    setIsAnalyzing(true);
    
    try {
      // Upload firmware file to storage
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('firmware')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create analysis record
      const { data: analysis, error: analysisError } = await supabase
        .from('firmware_analyses')
        .insert([{
          user_id: userId,
          filename: file.name,
          file_size: file.size,
          isa: isa as any,
          analysis_status: 'pending'
        }])
        .select()
        .single();

      if (analysisError) throw analysisError;

      // Trigger analysis via edge function
      const { data: analyzeData, error: analyzeError } = await supabase.functions.invoke(
        'analyze-firmware',
        {
          body: {
            analysisId: analysis.id,
            firmwareData: {
              fileName: file.name,
              size: file.size,
              isa: isa
            }
          }
        }
      );

      if (analyzeError) throw analyzeError;

      toast.success('Analysis started successfully');
      return analysis.id;

    } catch (error: any) {
      console.error('Error starting analysis:', error);
      toast.error(error.message || 'Failed to start analysis');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { uploadAndAnalyze, isAnalyzing };
};
