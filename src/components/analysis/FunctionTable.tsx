import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertCircle, Lock, Unlock } from "lucide-react";

const mockFunctions = [
  { addr: "0x00401234", name: "sub_401234", type: "AES-128", confidence: 97.3, isCrypto: true },
  { addr: "0x00402156", name: "sub_402156", type: "SHA-256", confidence: 95.8, isCrypto: true },
  { addr: "0x00403890", name: "sub_403890", type: "RSA-2048", confidence: 92.1, isCrypto: true },
  { addr: "0x00405120", name: "sub_405120", type: "PRNG", confidence: 88.4, isCrypto: true },
  { addr: "0x00407234", name: "memcpy", type: "Memory Op", confidence: 99.1, isCrypto: false },
  { addr: "0x00408156", name: "sub_408156", type: "ECC-P256", confidence: 94.6, isCrypto: true },
  { addr: "0x00409890", name: "sub_409890", type: "HMAC-SHA256", confidence: 96.2, isCrypto: true },
  { addr: "0x00410234", name: "strlen", type: "String Op", confidence: 98.5, isCrypto: false },
  { addr: "0x00411567", name: "printf", type: "I/O Op", confidence: 97.8, isCrypto: false },
  { addr: "0x00412890", name: "malloc", type: "Memory Alloc", confidence: 99.3, isCrypto: false },
];

const cryptoFunctions = mockFunctions.filter(f => f.isCrypto);
const nonCryptoFunctions = mockFunctions.filter(f => !f.isCrypto);

const FunctionTable = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crypto Functions Column */}
      <Card className="p-6 border-crypto/30 bg-crypto/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-crypto" />
            <h2 className="text-lg font-semibold text-crypto">Cryptographic Functions</h2>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-crypto/50 text-crypto">
            {cryptoFunctions.length} detected
          </Badge>
        </div>

        <div className="border border-crypto/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-crypto/10">
                <TableHead className="w-[100px]">Address</TableHead>
                <TableHead>Function</TableHead>
                <TableHead>Algorithm</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cryptoFunctions.map((func) => (
                <TableRow key={func.addr} className="hover:bg-crypto/10">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {func.addr}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{func.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-crypto" />
                      <span className="text-crypto font-medium">{func.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono text-sm ${
                      func.confidence > 95 
                        ? "text-confidence-high" 
                        : func.confidence > 90 
                        ? "text-confidence-medium" 
                        : "text-confidence-low"
                    }`}>
                      {func.confidence.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Non-Crypto Functions Column */}
      <Card className="p-6 border-muted-foreground/30 bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-muted-foreground">Non-Cryptographic Functions</h2>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {nonCryptoFunctions.length} detected
          </Badge>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Address</TableHead>
                <TableHead>Function</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonCryptoFunctions.map((func) => (
                <TableRow key={func.addr} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {func.addr}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{func.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{func.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm text-muted-foreground">
                      {func.confidence.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default FunctionTable;
