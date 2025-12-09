import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Lock, Unlock, Shield, AlertTriangle } from "lucide-react";

interface ProtocolFlow {
  step_name: string;
  is_crypto: boolean;
  protocol_type: string;
  security_level: string;
  confidence: number;
  handshake_method?: string;
  key_exchange?: string;
  encryption_algorithm?: string;
}

interface ProtocolGraphProps {
  protocolFlows?: ProtocolFlow[];
}

const defaultProtocolData = [
  { step_name: "TLS Handshake", is_crypto: true, protocol_type: "TLS 1.3", security_level: "high", confidence: 0.95, handshake_method: "ECDHE", key_exchange: "X25519", encryption_algorithm: "AES-256-GCM" },
  { step_name: "Certificate Verification", is_crypto: true, protocol_type: "X.509", security_level: "high", confidence: 0.92, handshake_method: "RSA-2048" },
  { step_name: "Session Key Derivation", is_crypto: true, protocol_type: "HKDF", security_level: "high", confidence: 0.88, key_exchange: "ECDH" },
  { step_name: "Data Encryption", is_crypto: true, protocol_type: "AES", security_level: "high", confidence: 0.96, encryption_algorithm: "AES-256-GCM" },
  { step_name: "HMAC Authentication", is_crypto: true, protocol_type: "HMAC-SHA256", security_level: "medium", confidence: 0.85 },
  { step_name: "HTTP Request", is_crypto: false, protocol_type: "HTTP/2", security_level: "low", confidence: 0.78 },
  { step_name: "JSON Parsing", is_crypto: false, protocol_type: "JSON", security_level: "low", confidence: 0.82 },
  { step_name: "MD5 Hash (Legacy)", is_crypto: true, protocol_type: "MD5", security_level: "deprecated", confidence: 0.91 },
];

const ProtocolGraph = ({ protocolFlows }: ProtocolGraphProps) => {
  const protocols = protocolFlows || defaultProtocolData;

  // Crypto vs Non-Crypto distribution
  const cryptoCount = protocols.filter(p => p.is_crypto).length;
  const nonCryptoCount = protocols.filter(p => !p.is_crypto).length;
  
  const distributionData = [
    { name: "Crypto", value: cryptoCount, color: "hsl(var(--crypto))" },
    { name: "Non-Crypto", value: nonCryptoCount, color: "hsl(var(--non-crypto))" },
  ];

  // Security level distribution
  const securityLevels = protocols.reduce((acc, p) => {
    const level = p.security_level || "unknown";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const securityData = Object.entries(securityLevels).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: name === "high" ? "hsl(var(--confidence-high))" 
        : name === "medium" ? "hsl(var(--confidence-medium))"
        : name === "deprecated" ? "hsl(var(--destructive))"
        : "hsl(var(--muted-foreground))",
  }));

  // Protocol type distribution for bar chart
  const protocolTypes = protocols.reduce((acc, p) => {
    const type = p.protocol_type || "Unknown";
    if (!acc[type]) {
      acc[type] = { crypto: 0, nonCrypto: 0, confidence: 0, count: 0 };
    }
    if (p.is_crypto) {
      acc[type].crypto += 1;
    } else {
      acc[type].nonCrypto += 1;
    }
    acc[type].confidence += p.confidence;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { crypto: number; nonCrypto: number; confidence: number; count: number }>);

  const barData = Object.entries(protocolTypes).map(([name, data]) => ({
    name,
    crypto: data.crypto,
    nonCrypto: data.nonCrypto,
    confidence: Math.round((data.confidence / data.count) * 100),
  }));

  // Confidence by protocol
  const confidenceData = protocols.map(p => ({
    name: p.step_name.length > 15 ? p.step_name.slice(0, 15) + "..." : p.step_name,
    confidence: Math.round(p.confidence * 100),
    fill: p.is_crypto ? "hsl(var(--crypto))" : "hsl(var(--non-crypto))",
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-crypto">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-crypto" />
            <div>
              <p className="text-xs text-muted-foreground">Crypto Protocols</p>
              <p className="text-2xl font-bold text-crypto">{cryptoCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-non-crypto">
          <div className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-non-crypto" />
            <div>
              <p className="text-xs text-muted-foreground">Non-Crypto</p>
              <p className="text-2xl font-bold text-non-crypto">{nonCryptoCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-confidence-high">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-confidence-high" />
            <div>
              <p className="text-xs text-muted-foreground">High Security</p>
              <p className="text-2xl font-bold text-confidence-high">{securityLevels.high || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Deprecated</p>
              <p className="text-2xl font-bold text-destructive">{securityLevels.deprecated || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Crypto Distribution Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Protocol Distribution</CardTitle>
            <CardDescription>Crypto vs Non-Crypto protocols</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Security Level Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Security Levels</CardTitle>
            <CardDescription>Distribution by security classification</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={securityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {securityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Types Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Protocol Types Analysis</CardTitle>
          <CardDescription>Breakdown by protocol type with confidence scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Bar dataKey="crypto" name="Crypto" fill="hsl(var(--crypto))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nonCrypto" name="Non-Crypto" fill="hsl(var(--non-crypto))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Confidence by Step Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Confidence by Protocol Step</CardTitle>
          <CardDescription>Detection confidence for each protocol step</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                width={90}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value: number) => [`${value}%`, "Confidence"]}
              />
              <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
                {confidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtocolGraph;
