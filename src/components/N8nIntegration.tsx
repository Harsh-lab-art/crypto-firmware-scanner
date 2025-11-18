import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Webhook, Zap, Activity } from "lucide-react";

interface N8nIntegrationProps {
  analysisId?: string;
}

const N8nIntegration = ({ analysisId }: N8nIntegrationProps) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);

  const triggerN8nWorkflow = async () => {
    if (!webhookUrl) {
      toast.error("Please enter your n8n webhook URL");
      return;
    }

    if (!analysisId) {
      toast.error("No analysis selected");
      return;
    }

    setIsTriggering(true);

    try {
      const { data, error } = await supabase.functions.invoke('n8n-webhook', {
        body: {
          action: 'trigger_advanced_analysis',
          payload: {
            analysisId,
            firmwareFile: 'firmware_sample.bin'
          },
          n8nWebhookUrl: webhookUrl
        }
      });

      if (error) throw error;

      toast.success('n8n workflow triggered successfully');
      console.log('n8n response:', data);

    } catch (error: any) {
      console.error('Error triggering n8n workflow:', error);
      toast.error(error.message || 'Failed to trigger n8n workflow');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">n8n Agentic AI Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect advanced automation workflows for enhanced analysis
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="webhook-url">n8n Webhook URL</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://your-n8n-instance.com/webhook/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get this URL from your n8n workflow's webhook trigger node
          </p>
        </div>

        <Button
          onClick={triggerN8nWorkflow}
          disabled={isTriggering || !analysisId}
          className="w-full"
        >
          <Webhook className="w-4 h-4 mr-2" />
          {isTriggering ? 'Triggering...' : 'Trigger Advanced Analysis'}
        </Button>

        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" />
            What n8n Can Do:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>Run complex multi-step binary analysis pipelines</li>
            <li>Integrate with IDA Pro, Binary Ninja, or custom tools</li>
            <li>Coordinate distributed analysis across multiple servers</li>
            <li>Send notifications to Slack, Discord, or email</li>
            <li>Generate custom reports and visualizations</li>
            <li>Chain multiple AI models for enhanced detection</li>
          </ul>
        </div>

        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
            <li>Create a workflow in your n8n instance</li>
            <li>Add a "Webhook" trigger node</li>
            <li>Enable "MCP access" in your workflow settings</li>
            <li>Copy the webhook URL and paste it above</li>
            <li>Add analysis nodes (HTTP requests, AI models, etc.)</li>
            <li>Configure callback to send results back</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};

export default N8nIntegration;
