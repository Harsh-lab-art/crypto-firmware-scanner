import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * n8n webhook endpoint for agentic AI workflows
 * 
 * This endpoint receives data from the frontend and can trigger n8n workflows
 * or receive callbacks from n8n automation workflows.
 * 
 * Use cases:
 * - Trigger advanced binary analysis workflows in n8n
 * - Coordinate multi-step analysis pipelines
 * - Integrate external tools (IDA Pro, Binary Ninja, custom scripts)
 * - Send notifications when analysis completes
 * - Generate reports and visualizations
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, payload, n8nWebhookUrl } = await req.json();

    console.log('n8n webhook received:', { action, hasPayload: !!payload });

    // Handle different workflow actions
    switch (action) {
      case 'trigger_advanced_analysis':
        // Trigger n8n workflow for advanced analysis
        if (n8nWebhookUrl) {
          const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'firmware_analysis',
              analysisId: payload.analysisId,
              firmwareFile: payload.firmwareFile,
              timestamp: new Date().toISOString()
            })
          });

          const n8nResult = await response.json();
          console.log('n8n workflow triggered:', n8nResult);

          return new Response(
            JSON.stringify({ success: true, n8nResult }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'analysis_complete':
        // Callback from n8n when analysis completes
        const { analysisId, results } = payload;
        
        // Update database with n8n analysis results
        await supabase
          .from('firmware_analyses')
          .update({
            analysis_status: 'complete',
            analysis_duration: results.duration
          })
          .eq('id', analysisId);

        // Store additional function detections from n8n
        if (results.functions) {
          for (const func of results.functions) {
            await supabase.from('detected_functions').insert({
              analysis_id: analysisId,
              ...func
            });
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Analysis results stored' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_analysis_status':
        // Query analysis status for n8n workflows
        const { data } = await supabase
          .from('firmware_analyses')
          .select('*')
          .eq('id', payload.analysisId)
          .single();

        return new Response(
          JSON.stringify({ success: true, analysis: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('n8n webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
