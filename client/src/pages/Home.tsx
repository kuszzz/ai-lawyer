import { Link } from "wouter";
import { motion, useScroll as useFramerScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import ChatPreview from "@/components/ChatPreview";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// Typewriter effect component
const TypewriterText = ({ text, delay = 40 }: { text: string, delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);
  
  return <span>{displayText}<span className="animate-pulse">|</span></span>;
};

// Fallback Component for 3D Models with motion animations
const ModelScene = ({ activeModel }: { activeModel: string }) => {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70">
      {activeModel === "gavel" && (
        <motion.div 
          className="relative w-40 h-40"
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-legal-gold text-6xl">
            <i className="ri-auction-line"></i>
          </div>
        </motion.div>
      )}
      
      {activeModel === "scales" && (
        <motion.div 
          className="relative w-40 h-40"
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-legal-gold text-6xl">
            <i className="ri-scales-3-line"></i>
          </div>
        </motion.div>
      )}
      
      {activeModel === "judge" && (
        <motion.div 
          className="relative w-40 h-40"
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-legal-gold text-6xl">
            <i className="ri-robot-line"></i>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Home = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [activeModel, setActiveModel] = useState("gavel");
  
  // Scroll animations
  const { scrollYProgress } = useFramerScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Change 3D model based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollPercentage = scrollPosition / (document.body.scrollHeight - windowHeight);
      
      if (scrollPercentage < 0.33) {
        setActiveModel("gavel");
      } else if (scrollPercentage < 0.66) {
        setActiveModel("scales");
      } else {
        setActiveModel("judge");
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Parallax effect values
  const textY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const featureOpacity = useTransform(scrollYProgress, [0, 0.3, 0.4], [0, 0, 1]);
  const featureY = useTransform(scrollYProgress, [0, 0.4], [100, 0]);
  
  return (
    <div className="flex flex-col min-h-screen bg-legal-dark text-legal-text">
      <Navbar />

      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center p-4 pt-20 overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />
        
        {/* 3D Models */}
        <ModelScene activeModel={activeModel} />
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div 
                className="w-64 h-64 border-8 border-legal-gold/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div 
                className="w-48 h-48 border-4 border-legal-blue/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div 
                className="w-32 h-32 border-2 border-legal-gold/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ y: textY }}
          >
            <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-6 glow-effect text-shadow-gold">
              <TypewriterText text="AI-Powered " />
              <span className="text-legal-gold"><TypewriterText text="Virtual Judge" delay={50} /></span>
            </h1>
            <p className="text-lg md:text-xl text-legal-text-secondary mb-10 max-w-2xl mx-auto backdrop-blur-sm bg-legal-dark-alt/30 p-4 rounded-lg">
              Experience the future of legal analysis with Delhi High Court's AI-driven legal assistance platform. Upload your case documents and receive instant insights and predictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <div 
                  className="px-8 py-3 bg-legal-gold hover:bg-legal-gold-dark text-legal-dark font-medium rounded-lg transition-all shadow-gold inline-block cursor-pointer"
                >
                  Upload Case Files
                </div>
              </Link>
              <Link href="/judge">
                <div
                  className="px-8 py-3 border border-legal-gold text-legal-gold hover:bg-legal-gold/10 font-medium rounded-lg transition-all inline-block cursor-pointer"
                >
                  Consult Virtual Judge
                </div>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-20 grid md:grid-cols-3 gap-8 px-4"
            style={{ opacity: featureOpacity, y: featureY }}
          >
            {/* Feature 1 - Case Analysis */}
            <motion.div 
              className="bg-legal-dark-alt p-6 rounded-xl shadow-blue border border-legal-blue/20 transition-all relative overflow-hidden group"
              whileHover={{ y: -8, boxShadow: "0 10px 25px rgba(10, 36, 99, 0.4)" }}
            >
              {/* Glowing border effect on hover */}
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                animate={{ 
                  background: ["radial-gradient(400px circle at var(--x) var(--y), rgba(10, 36, 99, 0.3), transparent 40%)"] 
                }}
                transition={{ duration: 0.3 }}
                style={{
                  "--x": "50%",
                  "--y": "50%",
                } as any}
              />
              <div className="w-14 h-14 bg-legal-blue/20 rounded-lg flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <i className="ri-file-search-line text-2xl text-legal-gold group-hover:animate-pulse"></i>
              </div>
              <h3 className="text-xl font-playfair font-semibold mb-3">Case Analysis</h3>
              <p className="text-legal-text-secondary">
                AI-powered document analysis to extract key information and legal arguments from your case documents.
              </p>
            </motion.div>
            
            {/* Feature 2 - Outcome Prediction */}
            <motion.div 
              className="bg-legal-dark-alt p-6 rounded-xl shadow-blue border border-legal-blue/20 transition-all relative overflow-hidden group"
              whileHover={{ y: -8, boxShadow: "0 10px 25px rgba(10, 36, 99, 0.4)" }}
            >
              {/* Glowing border effect on hover */}
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                animate={{ 
                  background: ["radial-gradient(400px circle at var(--x) var(--y), rgba(10, 36, 99, 0.3), transparent 40%)"] 
                }}
                transition={{ duration: 0.3 }}
                style={{
                  "--x": "50%",
                  "--y": "50%",
                } as any}
              />
              <div className="w-14 h-14 bg-legal-blue/20 rounded-lg flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <i className="ri-scales-3-line text-2xl text-legal-gold group-hover:animate-pulse"></i>
              </div>
              <h3 className="text-xl font-playfair font-semibold mb-3">Outcome Prediction</h3>
              <p className="text-legal-text-secondary">
                Advanced algorithms to predict potential case outcomes based on legal precedents and document analysis.
              </p>
            </motion.div>
            
            {/* Feature 3 - Legal Consultation */}
            <motion.div 
              className="bg-legal-dark-alt p-6 rounded-xl shadow-blue border border-legal-blue/20 transition-all relative overflow-hidden group"
              whileHover={{ y: -8, boxShadow: "0 10px 25px rgba(10, 36, 99, 0.4)" }}
            >
              {/* Glowing border effect on hover */}
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                animate={{ 
                  background: ["radial-gradient(400px circle at var(--x) var(--y), rgba(10, 36, 99, 0.3), transparent 40%)"] 
                }}
                transition={{ duration: 0.3 }}
                style={{
                  "--x": "50%",
                  "--y": "50%",
                } as any}
              />
              <div className="w-14 h-14 bg-legal-blue/20 rounded-lg flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <i className="ri-chat-3-line text-2xl text-legal-gold group-hover:animate-pulse"></i>
              </div>
              <h3 className="text-xl font-playfair font-semibold mb-3">Legal Consultation</h3>
              <p className="text-legal-text-secondary">
                Interactive virtual judge to answer your legal questions and provide guidance on your case.
              </p>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-12 w-full text-center">
          <motion.div
            className="animate-bounce inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <i className="ri-arrow-down-line text-2xl text-legal-gold-dark"></i>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatPreview />
    </div>
  );
};

export default Home;