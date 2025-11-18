import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";

const protocolSteps = [
  {
    step: 1,
    name: "Handshake Init",
    functions: ["gen_random_nonce", "prepare_hello"],
    description: "Client hello with supported cipher suites",
    confidence: 96.2
  },
  {
    step: 2,
    name: "Key Exchange",
    functions: ["ecdh_compute_shared", "derive_session_key"],
    description: "ECDH P-256 key agreement",
    confidence: 98.1
  },
  {
    step: 3,
    name: "Authentication",
    functions: ["verify_signature_rsa", "hmac_sha256"],
    description: "RSA-2048 signature verification + HMAC",
    confidence: 94.7
  },
  {
    step: 4,
    name: "Secure Channel",
    functions: ["aes_cbc_encrypt", "aes_cbc_decrypt"],
    description: "Encrypted data transmission (AES-128-CBC)",
    confidence: 97.3
  },
];

const ProtocolTimeline = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Protocol State Inference</h2>
        <p className="text-sm text-muted-foreground">
          Detected TLS-like handshake protocol from function call sequences
        </p>
      </div>

      <div className="space-y-6">
        {protocolSteps.map((step, idx) => (
          <div key={step.step} className="relative">
            {idx < protocolSteps.length - 1 && (
              <div className="absolute left-4 top-12 w-0.5 h-full bg-border" />
            )}
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm relative z-10">
                {step.step}
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{step.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      step.confidence > 95 
                        ? "border-confidence-high text-confidence-high" 
                        : "border-confidence-medium text-confidence-medium"
                    }`}
                  >
                    {step.confidence.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {step.functions.map((func) => (
                    <Badge key={func} variant="secondary" className="font-mono text-xs">
                      {func}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-confidence-high/10 border border-confidence-high/20 rounded-lg flex items-start gap-3">
        <Check className="w-5 h-5 text-confidence-high flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-confidence-high mb-1">
            Protocol Identified
          </p>
          <p className="text-sm text-muted-foreground">
            High-confidence detection of TLS 1.2+ handshake pattern with ECDHE-RSA key
            exchange and AES-CBC symmetric encryption. Sequence matches standard TLS state
            machine transitions.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProtocolTimeline;
