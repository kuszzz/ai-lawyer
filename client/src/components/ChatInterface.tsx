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
    <div className="md:col-span-3 bg-legal-dark rounded-xl border border-legal-blue/20 shadow-blue flex flex-col h-[700px]">
      {/* Chat header */}
      <div className="p-4 border-b border-legal-blue/20 flex items-center">
        <div className="w-10 h-10 rounded-full bg-legal-gold/20 flex items-center justify-center mr-3">
          <i className="ri-scales-3-fill text-legal-gold"></i>
        </div>
        
        <div>
          <h3 className="font-playfair font-semibold">Virtual Judge</h3>
          <p className="text-xs text-legal-text-secondary">AI-powered legal assistant</p>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          <button 
            className="p-2 hover:bg-legal-blue/10 rounded-full transition-colors" 
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
          </button>
          <button className="p-2 hover:bg-legal-blue/10 rounded-full transition-colors" title="Save conversation">
            <i className="ri-save-line text-legal-text-secondary"></i>
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="p-6 flex-1 overflow-y-auto flex flex-col gap-4"
      >
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`chat-message ${
              message.role === "system" 
                ? "bg-legal-blue/5 rounded-lg mx-auto border border-legal-blue/10 text-center"
                : message.role === "user"
                ? "bg-legal-blue/10 rounded-lg self-end ml-auto max-w-[80%]"
                : "bg-legal-dark-alt rounded-lg self-start mr-auto max-w-[80%]"
            } p-4 animate-in fade-in-0 slide-in-from-bottom-5 duration-300`}
          >
            {message.role === "system" ? (
              <p className="text-sm text-legal-text-secondary">{message.content}</p>
            ) : message.role === "user" ? (
              <div className="flex items-start justify-end">
                <div>
                  <p className="font-medium mb-1 text-right">You</p>
                  <p>{message.content}</p>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-legal-blue/20 flex items-center justify-center ml-3 shrink-0">
                  <i className="ri-user-fill text-legal-blue-light text-sm"></i>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-legal-gold/20 flex items-center justify-center mr-3 shrink-0">
                  <i className="ri-scales-3-fill text-legal-gold text-sm"></i>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Virtual Judge</p>
                  <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {sendMessageMutation.isPending && (
          <div className="chat-message bg-legal-dark-alt rounded-lg self-start mr-auto max-w-[80%] p-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-legal-gold/20 flex items-center justify-center mr-3 shrink-0">
                <i className="ri-scales-3-fill text-legal-gold text-sm"></i>
              </div>
              
              <div>
                <p className="font-medium mb-1">Virtual Judge</p>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-legal-gold/50 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-legal-gold/50 rounded-full animate-ping" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-legal-gold/50 rounded-full animate-ping" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-legal-blue/20">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-legal-dark-alt rounded-lg border border-legal-blue/30 focus-within:border-legal-gold/60 transition-colors">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              className="w-full bg-transparent px-4 pt-3 focus:outline-none resize-none text-legal-text border-none"
              placeholder="Ask the Virtual Judge about your case..."
            />
            
            <div className="px-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button type="button" className="p-1 text-legal-text-secondary hover:text-legal-gold transition-colors" title="Attach file">
                  <i className="ri-attachment-2 text-lg"></i>
                </button>
                <button type="button" className="p-1 text-legal-text-secondary hover:text-legal-gold transition-colors" title="Insert citation">
                  <i className="ri-bookmark-line text-lg"></i>
                </button>
              </div>
              
              <span className="text-xs text-legal-text-secondary">Legal advice is provided based on AI analysis only</span>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={sendMessageMutation.isPending || !input.trim()}
            className="p-3 bg-legal-gold hover:bg-legal-gold-dark text-legal-dark rounded-lg transition-all"
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
