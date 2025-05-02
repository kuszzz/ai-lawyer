import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ChatInterface";
import { CaseInfo, ChatSession } from "@/lib/types";

const Judge = () => {
  const [selectedSession, setSelectedSession] = useState<string>("");
  
  // Get case data from localStorage
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  
  // Query for chat sessions
  const { data: chatSessions, isLoading: isLoadingSessions } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat-sessions"],
  });
  
  // Use case ID from localStorage if available
  useEffect(() => {
    const storedCaseId = localStorage.getItem("currentCaseId");
    if (storedCaseId) {
      // Fetch case info
      fetchCaseInfo(storedCaseId);
    }
    
    // Set current session to the most recent one by default
    if (chatSessions && chatSessions.length > 0 && !selectedSession) {
      setSelectedSession(chatSessions[0].id);
    }
  }, [chatSessions]);
  
  // Fetch case info by ID
  const fetchCaseInfo = async (caseId: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (response.ok) {
        const data = await response.json();
        setCaseInfo(data);
      }
    } catch (error) {
      console.error("Error fetching case info:", error);
    }
  };
  
  // Start a new consultation
  const startNewConsultation = async () => {
    try {
      const response = await fetch("/api/chat-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId: caseInfo?.id || null,
          title: "New Consultation",
        }),
      });
      
      if (response.ok) {
        const newSession = await response.json();
        setSelectedSession(newSession.id);
      }
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  };
  
  return (
    <section className="min-h-screen py-20 px-4 bg-legal-dark-alt pt-24">
      <div className="container mx-auto">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              Virtual <span className="text-legal-gold">Judge</span> Consultation
            </h2>
            <p className="text-legal-text-secondary max-w-2xl mx-auto">
              Interact with our AI-powered virtual judge to get answers to your legal questions and guidance on your case.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Chat sidebar */}
            <motion.div 
              className="bg-legal-dark rounded-xl p-6 border border-legal-blue/20 shadow-blue"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-playfair font-semibold mb-4">Case Information</h3>
              
              {caseInfo ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-legal-text-secondary">Case Title</h4>
                    <p>{caseInfo.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-legal-text-secondary">Case Type</h4>
                    <p>{caseInfo.type}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-legal-text-secondary">Documents Analyzed</h4>
                    <p>{caseInfo.documentCount} documents ({caseInfo.pageCount} pages)</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-legal-text-secondary">Analysis Status</h4>
                    <p className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>
                      Complete
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-legal-text-secondary">Case Title</h4>
                    <p className="text-legal-text-secondary italic">No case selected</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-legal-text-secondary">Status</h4>
                    <p className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block mr-2"></span>
                      General Consultation
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-legal-blue/20">
                <h3 className="font-medium mb-3">Consultation History</h3>
                
                {isLoadingSessions ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : chatSessions && chatSessions.length > 0 ? (
                  <div className="space-y-2">
                    {chatSessions.map((session) => (
                      <button
                        key={session.id}
                        className={`w-full text-left p-2 rounded ${
                          selectedSession === session.id
                            ? "bg-legal-blue/10 text-legal-gold"
                            : "hover:bg-legal-blue/10"
                        } text-sm transition-colors`}
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className={`font-medium ${selectedSession === session.id ? "text-legal-gold" : ""}`}>
                          {session.title}
                        </div>
                        <div className="text-xs text-legal-text-secondary">
                          {new Date(session.timestamp).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-legal-text-secondary text-sm">No previous consultations</p>
                )}
                
                <Button
                  onClick={startNewConsultation}
                  className="w-full mt-4 px-4 py-2 border border-legal-gold/40 text-legal-gold hover:bg-legal-gold/5 rounded-lg text-sm transition-colors"
                  variant="outline"
                >
                  Start New Consultation
                </Button>
              </div>
            </motion.div>
            
            {/* Chat interface */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ChatInterface caseInfo={caseInfo || undefined} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Judge;
