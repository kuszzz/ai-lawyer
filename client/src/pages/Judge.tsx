import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ChatInterfaceNew";
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
    <section className="min-h-screen py-20 px-4 bg-legal-dark-alt dark:bg-legal-dark pt-24 bg-gradient-to-b from-legal-dark-alt to-legal-dark/90 dark:from-legal-dark dark:to-legal-dark-alt/90">
      <div className="container mx-auto">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-14">
            <motion.h2 
              className="text-3xl md:text-4xl font-playfair font-bold mb-4 relative inline-block"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, type: "spring" }}
            >
              Virtual <span className="text-legal-gold relative">Judge
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-legal-gold/10 via-legal-gold to-legal-gold/10"></span>
              </span> Consultation
            </motion.h2>
            <motion.p 
              className="text-legal-text-secondary max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Interact with our AI-powered virtual judge to get answers to your legal questions and guidance on your case.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Chat sidebar */}
            <motion.div 
              className="bg-legal-dark/80 dark:bg-legal-dark-alt/60 backdrop-blur-sm rounded-xl p-6 border border-legal-blue/30 shadow-blue flex flex-col h-[700px] overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-playfair font-semibold flex items-center">
                  <i className="ri-scales-3-line text-legal-gold mr-2"></i>
                  Case Information
                </h3>
                <div className="text-xs px-2 py-1 bg-legal-blue/20 border border-legal-blue/30 rounded-full text-legal-blue-light dark:text-legal-gold">
                  AI Assisted
                </div>
              </div>
              
              {caseInfo ? (
                <div className="space-y-5">
                  <div className="bg-legal-dark/50 dark:bg-legal-dark rounded-lg p-4 border border-legal-blue/20">
                    <h4 className="text-sm font-medium text-legal-text-secondary flex items-center">
                      <i className="ri-file-text-line mr-1 text-legal-gold/80"></i> Case Title
                    </h4>
                    <p className="font-medium text-lg">{caseInfo.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-legal-dark/50 dark:bg-legal-dark rounded-lg p-3 border border-legal-blue/20">
                      <h4 className="text-sm font-medium text-legal-text-secondary flex items-center">
                        <i className="ri-folder-line mr-1 text-legal-gold/80"></i> Case Type
                      </h4>
                      <p className="font-medium">{caseInfo.type}</p>
                    </div>
                    
                    <div className="bg-legal-dark/50 dark:bg-legal-dark rounded-lg p-3 border border-legal-blue/20">
                      <h4 className="text-sm font-medium text-legal-text-secondary flex items-center">
                        <i className="ri-file-paper-2-line mr-1 text-legal-gold/80"></i> Documents
                      </h4>
                      <p className="font-medium">{caseInfo.documentCount} <span className="text-sm text-legal-text-secondary">({caseInfo.pageCount} pages)</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-legal-dark/50 dark:bg-legal-dark rounded-lg p-4 border border-legal-blue/20">
                    <h4 className="text-sm font-medium text-legal-text-secondary flex items-center">
                      <i className="ri-check-double-line mr-1 text-legal-gold/80"></i> Analysis Status
                    </h4>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-legal-dark-alt/70 rounded-full h-2.5 mr-2">
                        <div className="bg-gradient-to-r from-green-500/80 to-green-400 h-2.5 rounded-full w-full"></div>
                      </div>
                      <span className="text-xs flex items-center whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
                        Complete
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-legal-dark/50 dark:bg-legal-dark rounded-lg p-4 border border-legal-blue/20">
                    <h4 className="text-sm font-medium text-legal-text-secondary flex items-center">
                      <i className="ri-file-text-line mr-1 text-legal-gold/80"></i> Case Title
                    </h4>
                    <p className="text-legal-text-secondary italic">No case selected</p>
                  </div>
                  
                  <div className="bg-legal-dark/50 dark:bg-legal-dark rounded-lg p-4 border border-legal-blue/20">
                    <h4 className="text-sm font-medium text-legal-text-secondary flex items-center">
                      <i className="ri-information-line mr-1 text-legal-gold/80"></i> Status
                    </h4>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-legal-dark-alt/70 rounded-full h-2.5 mr-2">
                        <div className="bg-gradient-to-r from-yellow-500/80 to-yellow-400 h-2.5 rounded-full w-1/3"></div>
                      </div>
                      <span className="text-xs flex items-center whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block mr-1"></span>
                        General
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-auto pt-6 border-t border-legal-blue/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center">
                    <i className="ri-history-line text-legal-gold/80 mr-1.5"></i>
                    Consultation History
                  </h3>
                  <span className="text-xs text-legal-text-secondary">
                    {chatSessions?.length || 0} sessions
                  </span>
                </div>
                
                {isLoadingSessions ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </div>
                ) : chatSessions && chatSessions.length > 0 ? (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-legal-blue/20 scrollbar-track-transparent">
                    {chatSessions.map((session) => (
                      <motion.button
                        whileHover={{ x: 2 }}
                        key={session.id}
                        className={`w-full text-left p-3 rounded-lg ${selectedSession === session.id
                            ? "bg-legal-blue/20 border border-legal-blue/30"
                            : "hover:bg-legal-blue/10 border border-transparent"
                        } text-sm transition-all`}
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-legal-blue/20 flex items-center justify-center mr-2 shrink-0">
                            <i className={`ri-chat-3-line ${selectedSession === session.id ? "text-legal-gold" : "text-legal-blue-light"}`}></i>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className={`font-medium truncate ${selectedSession === session.id ? "text-legal-gold" : ""}`}>
                              {session.title}
                            </div>
                            <div className="text-xs text-legal-text-secondary flex items-center">
                              <i className="ri-time-line mr-1"></i>
                              {new Date(session.timestamp).toLocaleString()}
                            </div>
                          </div>
                          {selectedSession === session.id && (
                            <div className="w-1.5 h-6 bg-legal-gold rounded-full ml-2"></div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-legal-dark/50 dark:bg-legal-dark rounded-lg border border-dashed border-legal-blue/20">
                    <i className="ri-chat-smile-3-line text-2xl text-legal-text-secondary mb-2"></i>
                    <p className="text-legal-text-secondary text-sm">No previous consultations</p>
                  </div>
                )}
                
                <Button
                  onClick={startNewConsultation}
                  className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-legal-gold/90 to-legal-gold hover:from-legal-gold hover:to-legal-gold-light text-legal-dark font-medium rounded-lg text-sm transition-all transform hover:translate-y-[-2px] hover:shadow-lg flex items-center justify-center gap-2"
                  variant="default"
                >
                  <i className="ri-add-line"></i>
                  New Consultation
                </Button>
              </div>
            </motion.div>
            
            {/* Chat interface */}
            <motion.div
              className="md:col-span-3"
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
