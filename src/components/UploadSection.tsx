import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileCode, Cpu, FileType, HardDrive, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface UploadSectionProps {
  onUpload: (file: File, isa: string) => void;
  isAnalyzing?: boolean;
}

interface FileDetection {
  fileType: string;
  architecture: string;
  endianness: string;
  bitWidth: string;
  confidence: number;
  details: string[];
}

const detectFileType = async (file: File): Promise<FileDetection> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const detection: FileDetection = {
    fileType: "Unknown",
    architecture: "auto",
    endianness: "Unknown",
    bitWidth: "Unknown",
    confidence: 0,
    details: []
  };

  // ELF Detection (0x7F 'E' 'L' 'F')
  if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
    detection.fileType = "ELF";
    detection.confidence = 95;
    detection.details.push("ELF magic bytes detected (0x7F454C46)");

    // ELF Class (32/64-bit)
    if (bytes[4] === 1) {
      detection.bitWidth = "32-bit";
      detection.details.push("ELF32 format");
    } else if (bytes[4] === 2) {
      detection.bitWidth = "64-bit";
      detection.details.push("ELF64 format");
    }

    // Endianness
    if (bytes[5] === 1) {
      detection.endianness = "Little Endian";
      detection.details.push("Little-endian byte order");
    } else if (bytes[5] === 2) {
      detection.endianness = "Big Endian";
      detection.details.push("Big-endian byte order");
    }

    // Machine type (bytes 18-19)
    const machineType = bytes[5] === 1 
      ? bytes[18] | (bytes[19] << 8)  // Little endian
      : (bytes[18] << 8) | bytes[19]; // Big endian

    switch (machineType) {
      case 0x03:
        detection.architecture = "x86";
        detection.details.push("Intel 80386 (x86) architecture");
        break;
      case 0x3E:
        detection.architecture = "x86_64";
        detection.details.push("AMD x86-64 architecture");
        break;
      case 0x28:
        detection.architecture = "arm";
        detection.details.push("ARM 32-bit architecture");
        break;
      case 0xB7:
        detection.architecture = "arm64";
        detection.details.push("ARM 64-bit (AArch64) architecture");
        break;
      case 0x08:
        detection.architecture = "mips";
        detection.details.push("MIPS architecture");
        break;
      case 0xF3:
        detection.architecture = "riscv";
        detection.details.push("RISC-V architecture");
        break;
      case 0x53:
        detection.architecture = "avr";
        detection.details.push("Atmel AVR architecture");
        break;
      default:
        detection.details.push(`Unknown machine type: 0x${machineType.toString(16)}`);
    }
  }
  // Intel HEX Detection
  else if (bytes[0] === 0x3A) { // ':' character
    detection.fileType = "Intel HEX";
    detection.confidence = 80;
    detection.details.push("Intel HEX format detected (starts with ':')");
    detection.details.push("Architecture must be specified manually for HEX files");
  }
  // Raw binary heuristics
  else {
    detection.fileType = "Raw Binary";
    detection.confidence = 60;
    detection.details.push("No standard header detected");
    
    // ARM detection heuristics
    const armPatterns = [0xE3, 0xE5, 0xE9, 0xEB, 0xE1, 0xE0];
    let armScore = 0;
    for (let i = 0; i < Math.min(1000, bytes.length); i += 4) {
      if (armPatterns.includes(bytes[i + 3] & 0xF0 >> 4)) armScore++;
    }
    if (armScore > 50) {
      detection.architecture = "arm";
      detection.details.push("ARM instruction patterns detected");
    }

    // x86 detection heuristics
    const x86Opcodes = [0x55, 0x89, 0x8B, 0xC3, 0xE8, 0x90];
    let x86Score = 0;
    for (let i = 0; i < Math.min(1000, bytes.length); i++) {
      if (x86Opcodes.includes(bytes[i])) x86Score++;
    }
    if (x86Score > armScore && x86Score > 30) {
      detection.architecture = "x86";
      detection.details.push("x86 instruction patterns detected");
    }
  }

  // File size info
  const sizeKB = (file.size / 1024).toFixed(2);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  detection.details.push(`File size: ${file.size > 1024 * 1024 ? sizeMB + ' MB' : sizeKB + ' KB'}`);

  return detection;
};

const UploadSection = ({ onUpload, isAnalyzing }: UploadSectionProps) => {
  const [selectedISA, setSelectedISA] = useState("auto");
  const [file, setFile] = useState<File | null>(null);
  const [detection, setDetection] = useState<FileDetection | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsDetecting(true);
      
      try {
        const detected = await detectFileType(selectedFile);
        setDetection(detected);
        
        if (detected.architecture !== "auto") {
          setSelectedISA(detected.architecture);
          toast.success(`Detected ${detected.fileType} - ${detected.architecture.toUpperCase()}`);
        } else {
          toast.info(`Loaded ${selectedFile.name} - Please select architecture manually`);
        }
      } catch (error) {
        toast.error("Failed to analyze file");
      } finally {
        setIsDetecting(false);
      }
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      toast.error("Please upload a firmware binary first");
      return;
    }
    onUpload(file, selectedISA);
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="max-w-3xl mx-auto p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <div className="text-center mb-6">
          <FileCode className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Upload Firmware Binary</h2>
          <p className="text-muted-foreground">
            Supports ELF, raw binaries, and firmware images across ARM, x86, MIPS, RISC-V, and AVR
          </p>
        </div>

        <div className="space-y-4">
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
                {isDetecting ? (
                  <span className="text-primary">Analyzing file...</span>
                ) : file ? (
                  <span className="text-foreground font-medium">{file.name}</span>
                ) : (
                  <>Click to upload or drag and drop</>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                .bin, .elf, .hex, .fw files (max 50MB)
              </p>
            </label>
          </div>

          {/* Auto-Detection Results */}
          {detection && (
            <Card className="p-4 bg-muted/30 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Auto-Detection Results</h3>
                <Badge variant={detection.confidence >= 80 ? "default" : "secondary"} className="ml-auto">
                  {detection.confidence}% confidence
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                  <FileType className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">File Type</p>
                    <p className="text-sm font-medium">{detection.fileType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Architecture</p>
                    <p className="text-sm font-medium">{detection.architecture.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bit Width</p>
                    <p className="text-sm font-medium">{detection.bitWidth}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Endianness</p>
                    <p className="text-sm font-medium">{detection.endianness}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Detection Details:</p>
                {detection.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {detection.confidence >= 80 ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                    )}
                    <span className="text-muted-foreground">{detail}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              ISA (Architecture) {detection?.architecture !== "auto" && <span className="text-primary text-xs ml-1">• Auto-detected</span>}
            </label>
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

          <Button onClick={handleAnalyze} className="w-full" size="lg" disabled={isAnalyzing || isDetecting}>
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default UploadSection;
