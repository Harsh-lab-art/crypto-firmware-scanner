import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

const similarityMatches = [
  { 
    library: "OpenSSL 1.1.1", 
    function: "AES_encrypt", 
    similarity: 98.2,
    source: "libcrypto.so.1.1"
  },
  { 
    library: "mbedTLS 2.16", 
    function: "mbedtls_aes_encrypt", 
    similarity: 94.7,
    source: "libmbedcrypto.a"
  },
  { 
    library: "OpenSSL 3.0.0", 
    function: "EVP_aes_128_cbc", 
    similarity: 92.1,
    source: "libssl.so.3"
  },
  { 
    library: "wolfSSL 4.7", 
    function: "wc_AesEncryptDirect", 
    similarity: 89.3,
    source: "libwolfssl.so"
  },
];

const SimilarityResults = () => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Similar Known Functions</h2>
        <p className="text-sm text-muted-foreground">
          FAISS nearest-neighbor search against known crypto library implementations
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Library</TableHead>
              <TableHead>Function Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Similarity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {similarityMatches.map((match, idx) => (
              <TableRow key={idx} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {match.library.split(' ')[0]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      v{match.library.split(' ')[1]}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-code-text">
                  {match.function}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {match.source}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`font-mono text-sm ${
                      match.similarity > 95 
                        ? "text-confidence-high" 
                        : match.similarity > 90 
                        ? "text-confidence-medium" 
                        : "text-confidence-low"
                    }`}>
                      {match.similarity.toFixed(1)}%
                    </span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm">
          <span className="text-primary font-semibold">Highest Match:</span> OpenSSL 1.1.1
          AES_encrypt (98.2% similarity). Function embeddings indicate near-identical
          instruction sequences and control flow structure.
        </p>
      </div>
    </Card>
  );
};

export default SimilarityResults;
