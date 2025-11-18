import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertCircle } from "lucide-react";

const mockFunctions = [
  { addr: "0x00401234", name: "sub_401234", type: "AES-128", confidence: 97.3, isCrypto: true },
  { addr: "0x00402156", name: "sub_402156", type: "SHA-256", confidence: 95.8, isCrypto: true },
  { addr: "0x00403890", name: "sub_403890", type: "RSA-2048", confidence: 92.1, isCrypto: true },
  { addr: "0x00405120", name: "sub_405120", type: "PRNG", confidence: 88.4, isCrypto: true },
  { addr: "0x00407234", name: "memcpy", type: "Non-crypto", confidence: 99.1, isCrypto: false },
  { addr: "0x00408156", name: "sub_408156", type: "ECC-P256", confidence: 94.6, isCrypto: true },
  { addr: "0x00409890", name: "sub_409890", type: "HMAC-SHA256", confidence: 96.2, isCrypto: true },
];

const FunctionTable = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Detected Functions</h2>
        <Badge variant="outline" className="font-mono text-xs">
          {mockFunctions.filter(f => f.isCrypto).length} crypto / {mockFunctions.length} total
        </Badge>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Address</TableHead>
              <TableHead>Function</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead className="text-right">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFunctions.map((func) => (
              <TableRow key={func.addr} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {func.addr}
                </TableCell>
                <TableCell className="font-mono text-sm">{func.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {func.isCrypto ? (
                      <Shield className="w-4 h-4 text-crypto" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={func.isCrypto ? "text-crypto" : "text-muted-foreground"}>
                      {func.type}
                    </span>
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
  );
};

export default FunctionTable;
