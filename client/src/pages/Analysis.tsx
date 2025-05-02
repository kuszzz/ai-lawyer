import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CaseAnalysis } from "@/lib/types";

const Analysis = () => {
  const { toast } = useToast();
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  
  // Get the most recent case analysis (or the one from localStorage)
  const { data: analysis, isLoading, error } = useQuery<CaseAnalysis>({
    queryKey: ["/api/case-analysis", currentCaseId],
    queryFn: async () => {
      if (!currentCaseId) throw new Error("No case ID provided");
      const response = await fetch(`/api/case-analysis/${currentCaseId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch case analysis: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!currentCaseId,
  });
  
  // Check for case ID in localStorage
  useEffect(() => {
    const storedCaseId = localStorage.getItem("currentCaseId");
    if (storedCaseId) {
      setCurrentCaseId(storedCaseId);
    } else {
      // If no stored case ID, get the most recent one
      fetchMostRecentCase();
    }
  }, []);
  
  // Function to fetch the most recent case
  const fetchMostRecentCase = async () => {
    try {
      const response = await fetch("/api/cases/recent");
      if (!response.ok) {
        throw new Error("No recent case found");
      }
      const data = await response.json();
      setCurrentCaseId(data.id);
      localStorage.setItem("currentCaseId", data.id);
    } catch (error) {
      toast({
        title: "No case analysis found",
        description: "Please upload case documents for analysis first.",
        variant: "destructive",
      });
    }
  };
  
  // If no case information is available, show a message
  if (!currentCaseId && !isLoading) {
    return (
      <section className="min-h-screen py-20 px-4 bg-legal-dark pt-24 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-playfair font-bold mb-4">No Analysis Available</h2>
          <p className="text-legal-text-secondary mb-6">
            Please upload your case documents first to get AI-powered legal analysis.
          </p>
          <Link href="/upload">
            <Button className="bg-legal-gold hover:bg-legal-gold-dark text-legal-dark">
              Upload Documents
            </Button>
          </Link>
        </div>
      </section>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <section className="min-h-screen py-20 px-4 bg-legal-dark pt-24">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
                Case <span className="text-legal-gold">Analysis</span>
              </h2>
              <p className="text-legal-text-secondary max-w-2xl mx-auto">
                Review the AI-powered analysis of your legal documents and gain valuable insights into your case.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-playfair font-semibold">Case Summary</h3>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                
                <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                  <h3 className="text-xl font-playfair font-semibold mb-4">Key Document Analysis</h3>
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                  <h3 className="text-xl font-playfair font-semibold mb-4">Outcome Prediction</h3>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
                
                <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                  <h3 className="text-xl font-playfair font-semibold mb-4">Similar Case Precedents</h3>
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // Error state
  if (error) {
    return (
      <section className="min-h-screen py-20 px-4 bg-legal-dark pt-24 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-playfair font-bold mb-4">Error Loading Analysis</h2>
          <p className="text-legal-text-secondary mb-6">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-legal-gold hover:bg-legal-gold-dark text-legal-dark"
            >
              Retry
            </Button>
            <Link href="/upload">
              <Button variant="outline" className="border-legal-gold text-legal-gold hover:bg-legal-gold/10">
                Upload New Documents
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }
  
  // If we have analysis data, display it
  return (
    <section className="min-h-screen py-20 px-4 bg-legal-dark pt-24">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              Case <span className="text-legal-gold">Analysis</span>
            </h2>
            <p className="text-legal-text-secondary max-w-2xl mx-auto">
              Review the AI-powered analysis of your legal documents and gain valuable insights into your case.
            </p>
          </motion.div>
          
          {analysis && (
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Left column - Summary */}
              <div className="md:col-span-2 space-y-6">
                {/* Case summary */}
                <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-playfair font-semibold">Case Summary</h3>
                    <span className="px-3 py-1 bg-legal-blue/20 text-legal-gold rounded-full text-xs">
                      {analysis.caseType}
                    </span>
                  </div>
                  
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: analysis.summary }} />
                  </div>
                </div>
                
                {/* Document analysis */}
                <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                  <h3 className="text-xl font-playfair font-semibold mb-4">Key Document Analysis</h3>
                  
                  <div className="space-y-4">
                    {analysis.documents.map((doc, index) => (
                      <div 
                        key={index} 
                        className={`${index < analysis.documents.length - 1 ? 'border-b border-legal-blue/20 pb-4' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{doc.name}</h4>
                          <span className="text-xs text-legal-text-secondary">
                            Analyzed {doc.pageCount} pages
                          </span>
                        </div>
                        
                        <p className="text-sm text-legal-text-secondary mb-2">{doc.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doc.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="px-2 py-1 bg-legal-blue/10 text-legal-text-secondary rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right column - Prediction & Insights */}
              <div className="space-y-6">
                {/* Outcome prediction */}
                <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                  <h3 className="text-xl font-playfair font-semibold mb-4">Outcome Prediction</h3>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span>Plaintiff Favorable Outcome</span>
                      <span className="text-legal-gold">{analysis.prediction.plaintiffOutcome}%</span>
                    </div>
                    <div className="w-full bg-legal-dark rounded-full h-2">
                      <div 
                        className="bg-legal-gold h-2 rounded-full" 
                        style={{ width: `${analysis.prediction.plaintiffOutcome}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span>Defendant Favorable Outcome</span>
                      <span className="text-legal-blue-light">{analysis.prediction.defendantOutcome}%</span>
                    </div>
                    <div className="w-full bg-legal-dark rounded-full h-2">
                      <div 
                        className="bg-legal-blue-light h-2 rounded-full" 
                        style={{ width: `${analysis.prediction.defendantOutcome}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-legal-text-secondary">
                    <p className="mb-2">
                      <strong>Analysis basis:</strong> {analysis.prediction.basis}
                    </p>
                    <p>{analysis.prediction.explanation}</p>
                  </div>
                </div>
                
                {/* Similar cases */}
                <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                  <h3 className="text-xl font-playfair font-semibold mb-4">Similar Case Precedents</h3>
                  
                  <div className="space-y-4">
                    {analysis.precedents.map((precedent, index) => (
                      <div 
                        key={index} 
                        className={`${index < analysis.precedents.length - 1 ? 'border-b border-legal-blue/20 pb-3' : ''}`}
                      >
                        <h4 className="font-medium text-legal-gold">{precedent.title}</h4>
                        <p className="text-sm text-legal-text-secondary mt-1">
                          {precedent.description} Similarity: {precedent.similarity}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Strength/weakness */}
                {analysis.argumentAnalysis && (
                  <div className="bg-legal-dark-alt rounded-xl p-6 border border-legal-blue/20 shadow-blue">
                    <h3 className="text-xl font-playfair font-semibold mb-4">Argument Strength Analysis</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-500">Case Strengths</h4>
                        <ul className="list-disc list-inside text-sm text-legal-text-secondary mt-1 space-y-1">
                          {analysis.argumentAnalysis.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-500">Case Weaknesses</h4>
                        <ul className="list-disc list-inside text-sm text-legal-text-secondary mt-1 space-y-1">
                          {analysis.argumentAnalysis.weaknesses.map((weakness, index) => (
                            <li key={index}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Action buttons */}
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/judge">
              <Button className="px-8 py-3 bg-legal-gold hover:bg-legal-gold-dark text-legal-dark font-medium rounded-lg transition-all shadow-gold flex items-center justify-center">
                <i className="ri-chat-3-line mr-2"></i>
                Consult Virtual Judge
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="px-8 py-3 border border-legal-gold text-legal-gold hover:bg-legal-gold/10 font-medium rounded-lg transition-all flex items-center justify-center"
              onClick={() => {
                // In a real app, this would trigger a download
                toast({
                  title: "Download started",
                  description: "Your full report is being generated for download.",
                });
              }}
            >
              <i className="ri-download-line mr-2"></i>
              Download Full Report
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Analysis;
