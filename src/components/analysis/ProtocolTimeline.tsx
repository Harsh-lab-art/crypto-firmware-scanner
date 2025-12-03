import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Shield, ShieldAlert, ShieldCheck, Key, Lock, Unlock, ArrowRightLeft, Server, FileCode, Handshake } from "lucide-react";

interface ProtocolStep {
  step: number;
  name: string;
  functions: string[];
  description: string;
  confidence: number;
  protocolType: string;
  isCrypto: boolean;
  handshakeMethod?: string;
  keyExchange?: string;
  encryptionAlgorithm?: string;
  authenticationMethod?: string;
  securityLevel: string;
}

interface ProtocolTimelineProps {
  protocolFlows?: any[];
}

// Default mock data for demonstration
const defaultProtocolSteps: ProtocolStep[] = [
  {
    step: 1,
    name: "Handshake Initialization",
    functions: ["gen_random_nonce", "prepare_hello"],
    description: "Client Hello with supported cipher suites and random nonce generation",
    confidence: 96.2,
    protocolType: "tls",
    isCrypto: true,
    handshakeMethod: "client_hello",
    securityLevel: "high"
  },
  {
    step: 2,
    name: "Server Hello & Certificate",
    functions: ["parse_server_hello", "validate_cert_chain"],
    description: "Server responds with selected cipher suite, certificate chain, and key share",
    confidence: 94.5,
    protocolType: "tls",
    isCrypto: true,
    handshakeMethod: "server_hello",
    authenticationMethod: "RSA-2048",
    securityLevel: "high"
  },
  {
    step: 3,
    name: "Key Exchange",
    functions: ["ecdh_compute_shared", "derive_session_key"],
    description: "ECDHE-P256 key agreement for perfect forward secrecy",
    confidence: 98.1,
    protocolType: "tls",
    isCrypto: true,
    handshakeMethod: "key_share",
    keyExchange: "ECDHE-P256",
    securityLevel: "high"
  },
  {
    step: 4,
    name: "Authentication & Verification",
    functions: ["verify_signature_rsa", "hmac_sha256"],
    description: "Certificate verification using signature validation and HMAC integrity check",
    confidence: 94.7,
    protocolType: "tls",
    isCrypto: true,
    handshakeMethod: "certificate_verify",
    authenticationMethod: "HMAC-SHA256",
    securityLevel: "high"
  },
  {
    step: 5,
    name: "Secure Channel",
    functions: ["aes_gcm_encrypt", "aes_gcm_decrypt"],
    description: "Encrypted data transmission using AES-256-GCM symmetric encryption",
    confidence: 97.3,
    protocolType: "tls",
    isCrypto: true,
    handshakeMethod: "application_data",
    encryptionAlgorithm: "AES-256-GCM",
    securityLevel: "high"
  },
  {
    step: 6,
    name: "Data Processing",
    functions: ["parse_payload", "validate_format", "process_message"],
    description: "Non-cryptographic data parsing, validation, and business logic processing",
    confidence: 88.2,
    protocolType: "application",
    isCrypto: false,
    securityLevel: "unknown"
  }
];

const ProtocolTimeline = ({ protocolFlows }: ProtocolTimelineProps) => {
  // Convert DB format to component format
  const protocolSteps: ProtocolStep[] = protocolFlows && protocolFlows.length > 0 
    ? protocolFlows.map(flow => ({
        step: flow.step_number,
        name: flow.step_name,
        functions: flow.functions || [],
        description: flow.description,
        confidence: flow.confidence,
        protocolType: flow.protocol_type || 'unknown',
        isCrypto: flow.is_crypto ?? true,
        handshakeMethod: flow.handshake_method,
        keyExchange: flow.key_exchange,
        encryptionAlgorithm: flow.encryption_algorithm,
        authenticationMethod: flow.authentication_method,
        securityLevel: flow.security_level || 'unknown'
      }))
    : defaultProtocolSteps;

  const cryptoSteps = protocolSteps.filter(s => s.isCrypto);
  const nonCryptoSteps = protocolSteps.filter(s => !s.isCrypto);
  const deprecatedSteps = protocolSteps.filter(s => s.securityLevel === 'deprecated');

  const getSecurityBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <Badge variant="outline" className="border-confidence-high text-confidence-high bg-confidence-high/10">
            <ShieldCheck className="w-3 h-3 mr-1" />
            High Security
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="border-confidence-medium text-confidence-medium bg-confidence-medium/10">
            <Shield className="w-3 h-3 mr-1" />
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Low
          </Badge>
        );
      case 'deprecated':
        return (
          <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Deprecated
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
            Unknown
          </Badge>
        );
    }
  };

  const getStepIcon = (step: ProtocolStep) => {
    if (!step.isCrypto) {
      return <FileCode className="w-4 h-4" />;
    }
    if (step.handshakeMethod?.includes('hello')) {
      return <Handshake className="w-4 h-4" />;
    }
    if (step.keyExchange) {
      return <ArrowRightLeft className="w-4 h-4" />;
    }
    if (step.encryptionAlgorithm) {
      return <Lock className="w-4 h-4" />;
    }
    if (step.authenticationMethod) {
      return <Key className="w-4 h-4" />;
    }
    if (step.handshakeMethod?.includes('server')) {
      return <Server className="w-4 h-4" />;
    }
    return <Shield className="w-4 h-4" />;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Protocol State Inference</h2>
        <p className="text-sm text-muted-foreground">
          Detected protocol patterns with handshaking, key exchange, and encryption analysis
        </p>
        
        {/* Summary Stats */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Lock className="w-3 h-3 mr-1" />
            {cryptoSteps.length} Crypto Steps
          </Badge>
          <Badge variant="secondary" className="bg-muted">
            <Unlock className="w-3 h-3 mr-1" />
            {nonCryptoSteps.length} Non-Crypto Steps
          </Badge>
          {deprecatedSteps.length > 0 && (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {deprecatedSteps.length} Deprecated
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {protocolSteps.map((step, idx) => (
          <div key={step.step} className="relative">
            {idx < protocolSteps.length - 1 && (
              <div className={`absolute left-4 top-12 w-0.5 h-full ${step.isCrypto ? 'bg-primary/30' : 'bg-border'}`} />
            )}
            
            <div className="flex gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                step.securityLevel === 'deprecated' 
                  ? 'bg-destructive/20 text-destructive'
                  : step.isCrypto 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{step.name}</h3>
                      <Badge variant={step.isCrypto ? "default" : "secondary"} className="text-xs">
                        {step.isCrypto ? 'Crypto' : 'Non-Crypto'}
                      </Badge>
                      {step.protocolType !== 'unknown' && (
                        <Badge variant="outline" className="text-xs uppercase">
                          {step.protocolType}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getSecurityBadge(step.securityLevel)}
                    <Badge 
                      variant="outline" 
                      className={`${
                        step.confidence > 95 
                          ? "border-confidence-high text-confidence-high" 
                          : step.confidence > 90
                            ? "border-confidence-medium text-confidence-medium"
                            : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {step.confidence.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                {/* Protocol Details */}
                {(step.handshakeMethod || step.keyExchange || step.encryptionAlgorithm || step.authenticationMethod) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 p-3 bg-muted/50 rounded-lg text-xs">
                    {step.handshakeMethod && (
                      <div>
                        <span className="text-muted-foreground block">Handshake:</span>
                        <span className="font-medium">{step.handshakeMethod}</span>
                      </div>
                    )}
                    {step.keyExchange && (
                      <div>
                        <span className="text-muted-foreground block">Key Exchange:</span>
                        <span className="font-medium text-primary">{step.keyExchange}</span>
                      </div>
                    )}
                    {step.encryptionAlgorithm && (
                      <div>
                        <span className="text-muted-foreground block">Encryption:</span>
                        <span className={`font-medium ${step.securityLevel === 'deprecated' ? 'text-destructive' : 'text-confidence-high'}`}>
                          {step.encryptionAlgorithm}
                        </span>
                      </div>
                    )}
                    {step.authenticationMethod && (
                      <div>
                        <span className="text-muted-foreground block">Authentication:</span>
                        <span className="font-medium">{step.authenticationMethod}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Functions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {step.functions.map((func) => (
                    <Badge key={func} variant="secondary" className={`font-mono text-xs ${
                      step.isCrypto ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {func}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Summary */}
      {deprecatedSteps.length > 0 ? (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive mb-1">
              Security Warning: Deprecated Algorithms Detected
            </p>
            <p className="text-sm text-muted-foreground">
              This firmware uses deprecated cryptographic algorithms ({deprecatedSteps.map(s => s.encryptionAlgorithm).filter(Boolean).join(', ')}) 
              that are no longer considered secure. Consider updating to modern alternatives like AES-GCM or ChaCha20.
            </p>
          </div>
        </div>
      ) : cryptoSteps.length > 0 ? (
        <div className="mt-6 p-4 bg-confidence-high/10 border border-confidence-high/20 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-confidence-high flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-confidence-high mb-1">
              Protocol Identified: Secure Implementation
            </p>
            <p className="text-sm text-muted-foreground">
              High-confidence detection of secure protocol patterns with modern key exchange 
              ({cryptoSteps.find(s => s.keyExchange)?.keyExchange || 'N/A'}) and encryption 
              ({cryptoSteps.find(s => s.encryptionAlgorithm)?.encryptionAlgorithm || 'N/A'}).
              Handshake sequence matches standard TLS state machine transitions.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-muted border border-border rounded-lg flex items-start gap-3">
          <Unlock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              No Cryptographic Protocols Detected
            </p>
            <p className="text-sm text-muted-foreground">
              The analyzed firmware does not appear to implement cryptographic protocols. 
              This may indicate unencrypted communication or the use of external security modules.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProtocolTimeline;