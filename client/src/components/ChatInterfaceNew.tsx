import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Message, CaseInfo } from "@/lib/types";

interface ChatInterfaceProps {
  caseInfo?: CaseInfo;
}

const ChatInterface = ({ caseInfo }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Virtual Judge AI is ready to assist you with your legal questions.",
      timestamp: new Date().toISOString(),
    },
  ]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Fetch case analysis if there is case information
  const { data: caseAnalysis } = useQuery({
    queryKey: ["/api/case-analysis", caseInfo?.id],
    enabled: !!caseInfo?.id,
  });
  
  // Add welcome message with case information if available
  useEffect(() => {
    if (caseInfo && caseInfo.title) {
      setMessages([
        {
          id: "welcome",
          role: "system",
          content: "Virtual Judge AI is ready to assist you with your legal questions.",
          timestamp: new Date().toISOString(),
        },
        {
          id: "intro",
          role: "assistant",
          content: `Welcome to your case consultation for ${caseInfo.title}. I've analyzed your documents and prepared insights on your ${caseInfo.type} case. How can I assist you today?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [caseInfo]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        content,
        caseId: caseInfo?.id || null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ["/api/chat-history"] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message immediately
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Send to server
    sendMessageMutation.mutate(input);
    
    // Clear input
    setInput("");
  };
  
  return (
    <div className="bg-legal-dark/80 dark:bg-legal-dark-alt/60 backdrop-blur-sm rounded-xl border border-legal-blue/30 shadow-blue flex flex-col h-[700px]">
      {/* Chat header */}
      <div className="p-4 border-b border-legal-blue/20 flex items-center bg-gradient-to-r from-legal-blue/10 to-transparent rounded-t-xl">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-legal-gold/30 to-legal-gold/10 flex items-center justify-center mr-3 border border-legal-gold/30 animate-spin-slow">
          <i className="ri-scales-3-fill text-legal-gold"></i>
        </div>
        
        <div>
          <h3 className="font-playfair font-semibold flex items-center gap-2">
            Virtual Judge
            <span className="inline-flex items-center bg-legal-blue/30 px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-normal tracking-wider text-legal-blue-light dark:text-legal-gold">Official</span>
          </h3>
          <p className="text-xs text-legal-text-secondary flex items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
            AI-powered legal assistant
          </p>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <button 
            className="p-2 hover:bg-legal-blue/10 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1 text-xs border border-transparent hover:border-legal-blue/20" 
            title="Clear conversation"
            onClick={() => {
              setMessages([
                {
                  id: "welcome",
                  role: "system",
                  content: "Virtual Judge AI is ready to assist you with your legal questions.",
                  timestamp: new Date().toISOString(),
                },
              ]);
            }}
          >
            <i className="ri-delete-bin-line text-legal-text-secondary"></i>
            <span className="text-legal-text-secondary">Clear</span>
          </button>
          <button 
            className="p-2 hover:bg-legal-blue/10 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1 text-xs border border-transparent hover:border-legal-blue/20" 
            title="Save conversation"
          >
            <i className="ri-save-line text-legal-text-secondary"></i>
            <span className="text-legal-text-secondary">Save</span>
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-legal-blue/30 scrollbar-track-transparent"
      >
        {messages.map((message, index) => (
          <div 
            key={message.id}
            className={`chat-message ${
              message.role === "system" 
                ? "bg-gradient-to-r from-legal-blue/10 to-legal-blue/5 rounded-lg mx-auto border border-legal-blue/20 text-center backdrop-blur-sm"
                : message.role === "user"
                ? "bg-gradient-to-br from-legal-blue/20 to-legal-blue/10 rounded-lg self-end ml-auto max-w-[80%] shadow-sm"
                : "bg-gradient-to-br from-legal-dark-alt/90 to-legal-dark/80 dark:from-legal-dark/90 dark:to-legal-dark-alt/80 rounded-lg self-start mr-auto max-w-[80%] shadow-sm"
            } p-4 animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {message.role === "system" ? (
              <div className="flex items-center justify-center gap-2">
                <i className="ri-information-line text-legal-gold"></i>
                <p className="text-sm text-legal-text-secondary">{message.content}</p>
              </div>
            ) : message.role === "user" ? (
              <div className="flex items-start justify-end">
                <div className="mr-3">
                  <div className="flex items-center justify-end mb-1">
                    <p className="font-medium text-right text-sm mr-1">You</p>
                    <span className="text-[10px] text-legal-text-secondary">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-legal-text">{message.content}</p>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-legal-blue/30 to-legal-blue/10 border border-legal-blue/20 flex items-center justify-center shrink-0">
                  <i className="ri-user-fill text-legal-blue-light text-sm"></i>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-legal-gold/30 to-legal-gold/10 border border-legal-gold/20 flex items-center justify-center mr-3 shrink-0">
                  <i className="ri-scales-3-fill text-legal-gold text-sm"></i>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <p className="font-medium text-sm mr-1 text-legal-gold">Virtual Judge</p>
                    <span className="text-[10px] text-legal-text-secondary">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-strong:text-legal-gold prose-strong:font-medium"
                    dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} 
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {sendMessageMutation.isPending && (
          <div 
            className="chat-message bg-gradient-to-br from-legal-dark-alt/90 to-legal-dark/80 dark:from-legal-dark/90 dark:to-legal-dark-alt/80 rounded-lg self-start mr-auto max-w-[80%] p-4 shadow-sm animate-fade-in-up"
          >
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-legal-gold/30 to-legal-gold/10 border border-legal-gold/20 flex items-center justify-center mr-3 shrink-0">
                <i className="ri-scales-3-fill text-legal-gold text-sm"></i>
              </div>
              
              <div>
                <p className="font-medium mb-1 text-sm text-legal-gold">Virtual Judge</p>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-legal-gold/80 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-legal-gold/80 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-legal-gold/80 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-legal-blue/20 bg-gradient-to-r from-legal-blue/5 to-transparent rounded-b-xl">
        <div className="flex items-end gap-3">
          <div className="flex-1 rounded-lg border border-legal-blue/30 focus-within:border-legal-gold/40 transition-colors overflow-hidden relative backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-legal-dark-alt/90 to-legal-dark/90 dark:from-legal-dark/90 dark:to-legal-dark-alt/80 -z-10"></div>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              className="w-full bg-transparent px-4 pt-3 focus:outline-none resize-none text-legal-text border-none focus:ring-0"
              placeholder="Ask the Virtual Judge about your case..."
            />
            
            <div className="px-3 pb-2 flex items-center justify-between border-t border-legal-blue/10 bg-legal-blue/5">
              <div className="flex items-center gap-2">
                <button type="button" className="p-1.5 text-legal-text-secondary hover:text-legal-gold transition-colors rounded-md hover:bg-legal-blue/10" title="Attach file">
                  <i className="ri-attachment-2 text-lg"></i>
                </button>
                <button type="button" className="p-1.5 text-legal-text-secondary hover:text-legal-gold transition-colors rounded-md hover:bg-legal-blue/10" title="Insert citation">
                  <i className="ri-bookmark-line text-lg"></i>
                </button>
                <button type="button" className="p-1.5 text-legal-text-secondary hover:text-legal-gold transition-colors rounded-md hover:bg-legal-blue/10" title="Request precedent">
                  <i className="ri-scales-line text-lg"></i>
                </button>
              </div>
              
              <span className="text-xs text-legal-text-secondary bg-legal-blue/10 px-2 py-1 rounded-sm border border-legal-blue/20">
                <i className="ri-ai-generate text-legal-gold mr-1"></i>
                AI-powered legal analysis
              </span>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={sendMessageMutation.isPending || !input.trim()}
            className="p-3 bg-gradient-to-r from-legal-gold/90 to-legal-gold hover:from-legal-gold hover:to-legal-gold-light text-legal-dark font-medium rounded-lg transition-all hover:shadow-md hover:shadow-legal-gold/20 disabled:opacity-50 disabled:hover:shadow-none"
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;