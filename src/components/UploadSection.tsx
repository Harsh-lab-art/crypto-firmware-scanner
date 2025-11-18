import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileCode } from "lucide-react";
import { toast } from "sonner";

interface UploadSectionProps {
  onUpload: () => void;
}

const UploadSection = ({ onUpload }: UploadSectionProps) => {
  const [selectedISA, setSelectedISA] = useState("auto");
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      toast.success(`Loaded ${file.name}`);
    }
  };

  const handleAnalyze = () => {
    if (!fileName) {
      toast.error("Please upload a firmware binary first");
      return;
    }
    toast.success("Starting analysis...");
    setTimeout(() => onUpload(), 800);
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <div className="text-center mb-6">
          <FileCode className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Upload Firmware Binary</h2>
          <p className="text-muted-foreground">
            Supports ELF, raw binaries, and firmware images across ARM, x86, MIPS, RISC-V, and AVR
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select ISA (Architecture)</label>
            <Select value={selectedISA} onValueChange={setSelectedISA}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="arm">ARM / ARMv7</SelectItem>
                <SelectItem value="arm64">ARM64 / AArch64</SelectItem>
                <SelectItem value="x86">x86</SelectItem>
                <SelectItem value="x86_64">x86_64</SelectItem>
                <SelectItem value="mips">MIPS</SelectItem>
                <SelectItem value="riscv">RISC-V</SelectItem>
                <SelectItem value="avr">AVR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <input
              type="file"
              id="firmware-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".bin,.elf,.hex,.fw"
            />
            <label htmlFor="firmware-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {fileName ? (
                  <span className="text-foreground font-medium">{fileName}</span>
                ) : (
                  <>Click to upload or drag and drop</>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                .bin, .elf, .hex, .fw files (max 50MB)
              </p>
            </label>
          </div>

          <Button onClick={handleAnalyze} className="w-full" size="lg">
            Start Analysis
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default UploadSection;
