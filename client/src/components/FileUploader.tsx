import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
};

const FileUploader = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [caseTitle, setCaseTitle] = useState("");
  const [caseType, setCaseType] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [analysisOptions, setAnalysisOptions] = useState({
    outcomePrediction: true,
    legalSummary: true,
    precedentSearch: true,
    argumentAnalysis: false,
  });
  const [analysisDepth, setAnalysisDepth] = useState("detailed");
  const [jurisdiction, setJurisdiction] = useState("delhi");
  
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one document to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!caseTitle) {
      toast({
        title: "Missing information",
        description: "Please provide a case title.",
        variant: "destructive",
      });
      return;
    }

    if (!caseType) {
      toast({
        title: "Missing information",
        description: "Please select a case type.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a FormData object to handle file uploads
      const formData = new FormData();
      
      // Append each file
      files.forEach((file) => {
        formData.append("files", file.file);
      });
      
      // Append case information
      formData.append("caseTitle", caseTitle);
      formData.append("caseType", caseType);
      formData.append("caseDescription", caseDescription);
      
      // Append analysis options
      formData.append("analysisOptions", JSON.stringify(analysisOptions));
      formData.append("analysisDepth", analysisDepth);
      formData.append("jurisdiction", jurisdiction);

      // Send the data to the server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      toast({
        title: "Upload successful",
        description: "Your documents have been uploaded for analysis.",
      });

      // Redirect to analysis page
      window.location.href = "/analysis";
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-5 gap-8">
      {/* Left column - Upload Area */}
      <div className="md:col-span-3 bg-legal-dark rounded-xl p-6 border border-legal-blue/20 shadow-blue">
        <div className="mb-6">
          <h3 className="text-xl font-playfair font-semibold mb-4">Document Upload</h3>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed ${
              isDragActive ? "border-legal-gold" : "border-legal-gold/30"
            } rounded-lg p-8 text-center cursor-pointer hover:border-legal-gold/60 transition-colors`}
          >
            <input {...getInputProps()} />
            <i className="ri-upload-cloud-2-line text-4xl text-legal-gold mb-4"></i>
            <p className="mb-2">Drag and drop your legal files here</p>
            <p className="text-sm text-legal-text-secondary mb-4">or click to browse files</p>
            <p className="text-xs text-legal-text-secondary">Supports PDF, DOC, DOCX, and TXT (Max 25MB)</p>
          </div>
        </div>
        
        <div className="space-y-3 mt-6 max-h-60 overflow-y-auto p-2">
          {files.map((file) => (
            <div key={file.id} className="bg-legal-dark-alt p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-file-text-line text-legal-gold mr-3"></i>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-legal-text-secondary">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                className="text-legal-text-secondary hover:text-legal-gold transition-colors"
                title="Remove file"
                onClick={() => handleRemoveFile(file.id)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          ))}
        </div>
        
        {/* Case information form */}
        <div className="mt-8">
          <h3 className="text-xl font-playfair font-semibold mb-4">Case Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="case-title">Case Title</Label>
              <Input
                id="case-title"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="w-full bg-legal-dark-alt border border-legal-blue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-legal-gold/60 transition-colors"
                placeholder="Enter case title"
              />
            </div>
            
            <div>
              <Label htmlFor="case-type">Case Type</Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger 
                  id="case-type"
                  className="w-full bg-legal-dark-alt border border-legal-blue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-legal-gold/60 transition-colors"
                >
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civil Case</SelectItem>
                  <SelectItem value="criminal">Criminal Case</SelectItem>
                  <SelectItem value="family">Family Law</SelectItem>
                  <SelectItem value="corporate">Corporate Law</SelectItem>
                  <SelectItem value="property">Property Dispute</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="case-description">Brief Description</Label>
              <Textarea
                id="case-description"
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                rows={4}
                className="w-full bg-legal-dark-alt border border-legal-blue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-legal-gold/60 transition-colors"
                placeholder="Provide a brief overview of your case"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Right column - Options */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-legal-dark rounded-xl p-6 border border-legal-blue/20 shadow-blue">
          <h3 className="text-xl font-playfair font-semibold mb-4">Analysis Options</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="outcome-prediction" 
                checked={analysisOptions.outcomePrediction}
                onCheckedChange={(checked) => 
                  setAnalysisOptions(prev => ({...prev, outcomePrediction: checked === true}))
                }
                className="w-5 h-5 rounded-sm text-legal-gold focus:ring-legal-gold bg-legal-dark-alt border-legal-blue/30"
              />
              <Label htmlFor="outcome-prediction">Outcome Prediction</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="legal-summary" 
                checked={analysisOptions.legalSummary}
                onCheckedChange={(checked) => 
                  setAnalysisOptions(prev => ({...prev, legalSummary: checked === true}))
                }
                className="w-5 h-5 rounded-sm text-legal-gold focus:ring-legal-gold bg-legal-dark-alt border-legal-blue/30"
              />
              <Label htmlFor="legal-summary">Case Summary</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="precedent-search" 
                checked={analysisOptions.precedentSearch}
                onCheckedChange={(checked) => 
                  setAnalysisOptions(prev => ({...prev, precedentSearch: checked === true}))
                }
                className="w-5 h-5 rounded-sm text-legal-gold focus:ring-legal-gold bg-legal-dark-alt border-legal-blue/30"
              />
              <Label htmlFor="precedent-search">Similar Case Precedents</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="argument-analysis" 
                checked={analysisOptions.argumentAnalysis}
                onCheckedChange={(checked) => 
                  setAnalysisOptions(prev => ({...prev, argumentAnalysis: checked === true}))
                }
                className="w-5 h-5 rounded-sm text-legal-gold focus:ring-legal-gold bg-legal-dark-alt border-legal-blue/30"
              />
              <Label htmlFor="argument-analysis">Argument Strength Analysis</Label>
            </div>
          </div>
        </div>
        
        <div className="bg-legal-dark rounded-xl p-6 border border-legal-blue/20 shadow-blue">
          <h3 className="text-xl font-playfair font-semibold mb-4">Advanced Settings</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="analysis-depth">Analysis Depth</Label>
              <Select value={analysisDepth} onValueChange={setAnalysisDepth}>
                <SelectTrigger 
                  id="analysis-depth"
                  className="w-full bg-legal-dark-alt border border-legal-blue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-legal-gold/60 transition-colors"
                >
                  <SelectValue placeholder="Select analysis depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Analysis</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="jurisdiction">Primary Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger 
                  id="jurisdiction"
                  className="w-full bg-legal-dark-alt border border-legal-blue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-legal-gold/60 transition-colors"
                >
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delhi">Delhi High Court</SelectItem>
                  <SelectItem value="supreme">Supreme Court of India</SelectItem>
                  <SelectItem value="national">National Jurisdiction</SelectItem>
                  <SelectItem value="international">International Law</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isUploading}
          className="w-full py-3 bg-legal-gold hover:bg-legal-gold-dark text-legal-dark font-medium rounded-lg transition-all shadow-gold flex items-center justify-center"
        >
          {isUploading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-legal-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </div>
          ) : (
            <>
              <i className="ri-scales-3-line mr-2"></i>
              Analyze Documents
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
