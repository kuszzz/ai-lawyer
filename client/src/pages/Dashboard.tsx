import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import AIJudge from "@/components/models/AIJudge";

// Mock data for demonstration purposes
const MOCK_RECENT_CASES = [
  {
    id: "case1",
    title: "Singh v. Delhi Transport Corporation",
    type: "Civil Dispute",
    date: "2025-04-28",
    documentCount: 3,
    status: "Analyzed",
    prediction: 78
  },
  {
    id: "case2",
    title: "Mehta v. State of Maharashtra",
    type: "Criminal Appeal",
    date: "2025-04-25",
    documentCount: 5,
    status: "In Progress",
    prediction: null
  },
  {
    id: "case3",
    title: "ABC Corp v. XYZ Ltd",
    type: "Contract Dispute",
    date: "2025-04-20",
    documentCount: 7,
    status: "Analyzed",
    prediction: 45
  }
];

const MOCK_ACTIVITIES = [
  {
    id: "act1",
    action: "Document uploaded",
    caseId: "case1",
    caseName: "Singh v. Delhi Transport Corporation",
    timestamp: "2025-04-28T14:35:00"
  },
  {
    id: "act2",
    action: "Analysis completed",
    caseId: "case1",
    caseName: "Singh v. Delhi Transport Corporation",
    timestamp: "2025-04-28T14:45:00"
  },
  {
    id: "act3",
    action: "Chat session started",
    caseId: "case3",
    caseName: "ABC Corp v. XYZ Ltd",
    timestamp: "2025-04-27T10:22:00"
  },
  {
    id: "act4",
    action: "Document uploaded",
    caseId: "case2",
    caseName: "Mehta v. State of Maharashtra",
    timestamp: "2025-04-25T09:15:00"
  }
];

const MOCK_STATS = {
  totalCases: 12,
  analyzedCases: 10,
  documentsUploaded: 45,
  chatSessions: 23
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("cases");
  
  // Format the date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };
  
  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return "Just now";
    }
  };
  
  return (
    <section className="min-h-screen pt-20 px-4 pb-10 bg-legal-dark">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-legal-dark-alt rounded-lg p-4 sticky top-24">
              <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg bg-legal-dark flex items-center justify-center">
                {/* 3D model replaced with animated icon for compatibility */}
                <div className="relative">
                  <motion.div 
                    className="w-24 h-24 border-4 border-legal-gold/40 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="ri-scales-3-line text-4xl text-legal-gold"></i>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-legal-dark-alt via-transparent to-transparent"></div>
              </div>
              
              <h2 className="text-xl font-playfair font-semibold mb-4 text-legal-gold">Dashboard</h2>
              
              <nav className="mb-6">
                <ul className="space-y-2">
                  <li>
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md transition-all ${activeTab === "cases" ? "bg-legal-blue text-white" : "text-legal-text-secondary hover:bg-legal-blue/10"}`}
                      onClick={() => setActiveTab("cases")}
                    >
                      <i className="ri-file-list-3-line mr-2"></i> My Cases
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md transition-all ${activeTab === "activity" ? "bg-legal-blue text-white" : "text-legal-text-secondary hover:bg-legal-blue/10"}`}
                      onClick={() => setActiveTab("activity")}
                    >
                      <i className="ri-time-line mr-2"></i> Recent Activity
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md transition-all ${activeTab === "stats" ? "bg-legal-blue text-white" : "text-legal-text-secondary hover:bg-legal-blue/10"}`}
                      onClick={() => setActiveTab("stats")}
                    >
                      <i className="ri-bar-chart-line mr-2"></i> Statistics
                    </button>
                  </li>
                </ul>
              </nav>
              
              <div className="border-t border-legal-blue/20 pt-4">
                <Link href="/upload">
                  <motion.div 
                    className="flex items-center justify-center p-2 bg-legal-gold text-legal-dark rounded-md cursor-pointer font-medium"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="ri-add-line mr-2"></i> New Case
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-grow">
            {/* Cases Tab */}
            {activeTab === "cases" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-playfair font-bold text-legal-gold">My Cases</h1>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search cases..."
                      className="bg-legal-dark-alt border-none rounded-md px-4 py-2 pl-10 text-legal-text focus:ring-1 focus:ring-legal-gold focus:outline-none w-full md:w-64"
                    />
                    <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-legal-text-secondary"></i>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {MOCK_RECENT_CASES.map(caseItem => (
                    <Link key={caseItem.id} href={`/analysis/${caseItem.id}`}>
                      <motion.div 
                        className="dashboard-card cursor-pointer relative overflow-hidden group"
                        whileHover={{ y: -5 }}
                      >
                        {/* Hover effect with radial gradient */}
                        <motion.div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                          animate={{ 
                            background: ["radial-gradient(600px circle at var(--x) var(--y), rgba(10, 36, 99, 0.15), transparent 40%)"] 
                          }}
                          transition={{ duration: 0.3 }}
                          style={{
                            "--x": "50%",
                            "--y": "50%",
                          } as any}
                        />
                        
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-xl font-playfair font-semibold mb-1 group-hover:text-legal-gold transition-colors">{caseItem.title}</h3>
                            <p className="text-legal-text-secondary mb-3 text-sm">{caseItem.type} • {formatDate(caseItem.date)}</p>
                          </div>
                          <div className="h-12 w-12 rounded-md bg-legal-dark flex items-center justify-center text-legal-gold">
                            <i className="ri-file-text-line text-xl"></i>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center">
                            <span className="text-sm text-legal-text-secondary">
                              <i className="ri-file-list-line mr-1"></i> {caseItem.documentCount} docs
                            </span>
                          </div>
                          
                          <div>
                            {caseItem.status === "Analyzed" ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium flex items-center gap-1">
                                  <i className="ri-scales-3-line"></i>
                                  <span>Outcome: </span>
                                  <span className={caseItem.prediction && caseItem.prediction > 50 ? "text-green-500" : "text-red-500"}>
                                    {caseItem.prediction}%
                                  </span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm px-2 py-1 rounded-full bg-legal-blue/20 text-legal-blue-light">
                                {caseItem.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                  
                  <Link href="/upload">
                    <motion.div 
                      className="dashboard-card cursor-pointer flex flex-col items-center justify-center min-h-[200px] border-dashed"
                      whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(10, 36, 99, 0.2)" }}
                    >
                      <div className="w-16 h-16 rounded-full bg-legal-dark flex items-center justify-center mb-3 text-legal-gold">
                        <i className="ri-add-line text-3xl"></i>
                      </div>
                      <p className="text-legal-text font-medium text-lg">Create New Case</p>
                      <p className="text-legal-text-secondary text-sm mt-1">Upload documents for analysis</p>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            )}
            
            {/* Activity Tab */}
            {activeTab === "activity" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-playfair font-bold text-legal-gold mb-6">Recent Activity</h1>
                
                <div className="bg-legal-dark-alt rounded-lg p-4">
                  <ul className="divide-y divide-legal-blue/10">
                    {MOCK_ACTIVITIES.map((activity, index) => (
                      <motion.li 
                        key={activity.id}
                        className="py-3 first:pt-0 last:pb-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex justify-between">
                          <div className="flex items-start gap-3">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${activity.action.includes("uploaded") ? "bg-legal-blue/20 text-legal-blue-light" : 
                                activity.action.includes("completed") ? "bg-green-900/30 text-green-500" : 
                                "bg-legal-gold/20 text-legal-gold"}`}
                            >
                              <i className={`${activity.action.includes("uploaded") ? "ri-file-upload-line" : 
                                activity.action.includes("completed") ? "ri-check-line" : 
                                "ri-chat-3-line"} text-sm`}></i>
                            </div>
                            <div>
                              <p className="text-legal-text">
                                {activity.action}
                                <span className="text-legal-text-secondary"> for </span>
                                <Link href={`/analysis/${activity.caseId}`}>
                                  <span className="text-legal-gold cursor-pointer hover:underline">
                                    {activity.caseName}
                                  </span>
                                </Link>
                              </p>
                            </div>
                          </div>
                          <span className="text-legal-text-secondary text-sm">{formatTimestamp(activity.timestamp)}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
            
            {/* Stats Tab */}
            {activeTab === "stats" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-playfair font-bold text-legal-gold mb-6">Statistics</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Total Cases */}
                  <motion.div 
                    className="bg-legal-dark-alt rounded-lg p-4 flex flex-col"
                    whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(10, 36, 99, 0.3)" }}
                  >
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-legal-blue/20 text-legal-blue-light mb-3">
                      <i className="ri-folder-line"></i>
                    </div>
                    <h3 className="text-legal-text-secondary text-sm">Total Cases</h3>
                    <p className="text-3xl font-playfair font-semibold text-legal-text mt-1">{MOCK_STATS.totalCases}</p>
                  </motion.div>
                  
                  {/* Analyzed Cases */}
                  <motion.div 
                    className="bg-legal-dark-alt rounded-lg p-4 flex flex-col"
                    whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(10, 36, 99, 0.3)" }}
                  >
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-green-900/30 text-green-500 mb-3">
                      <i className="ri-check-double-line"></i>
                    </div>
                    <h3 className="text-legal-text-secondary text-sm">Analyzed Cases</h3>
                    <p className="text-3xl font-playfair font-semibold text-legal-text mt-1">{MOCK_STATS.analyzedCases}</p>
                  </motion.div>
                  
                  {/* Documents Uploaded */}
                  <motion.div 
                    className="bg-legal-dark-alt rounded-lg p-4 flex flex-col"
                    whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(10, 36, 99, 0.3)" }}
                  >
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-legal-blue/20 text-legal-blue-light mb-3">
                      <i className="ri-file-text-line"></i>
                    </div>
                    <h3 className="text-legal-text-secondary text-sm">Documents Uploaded</h3>
                    <p className="text-3xl font-playfair font-semibold text-legal-text mt-1">{MOCK_STATS.documentsUploaded}</p>
                  </motion.div>
                  
                  {/* Chat Sessions */}
                  <motion.div 
                    className="bg-legal-dark-alt rounded-lg p-4 flex flex-col"
                    whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(10, 36, 99, 0.3)" }}
                  >
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-legal-gold/20 text-legal-gold mb-3">
                      <i className="ri-chat-3-line"></i>
                    </div>
                    <h3 className="text-legal-text-secondary text-sm">Chat Sessions</h3>
                    <p className="text-3xl font-playfair font-semibold text-legal-text mt-1">{MOCK_STATS.chatSessions}</p>
                  </motion.div>
                </div>
                
                <div className="bg-legal-dark-alt rounded-lg p-6">
                  <h2 className="text-xl font-playfair font-semibold mb-4 text-legal-gold">Case Analysis Distribution</h2>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {/* Mock bar chart */}
                    {[75, 42, 68, 50, 35, 60, 80].map((height, index) => (
                      <motion.div 
                        key={index}
                        className="w-12 bg-legal-blue rounded-t-md relative group"
                        initial={{ height: 0 }}
                        animate={{ height: `${height * 0.6}px` }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                        whileHover={{ backgroundColor: "#3E92CC" }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-legal-gold text-legal-dark px-2 py-1 rounded text-xs whitespace-nowrap">
                            {height}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-around mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={index} className="text-xs text-legal-text-secondary">{day}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;