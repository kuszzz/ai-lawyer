import { Link } from "wouter";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Float, useScroll } from "@react-three/drei";
import { motion, useScroll as useFramerScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Gavel from "@/components/models/Gavel";
import ScalesOfJustice from "@/components/models/ScalesOfJustice";
import AIJudge from "@/components/models/AIJudge";

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

// Animated background component with subtle moving legal text
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      <motion.div 
        className="absolute inset-0 font-mono text-xs text-legal-blue overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div 
            key={i} 
            className="whitespace-nowrap"
            initial={{ x: -1000, y: i * 24 }}
            animate={{ 
              x: [Math.random() * -500, 1500],
              y: i * 24 + (Math.random() * 10) 
            }}
            transition={{ 
              x: { 
                duration: 80 + Math.random() * 40,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              },
              y: { 
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }
            }}
          >
            {"JUSTICE EQUALITY FAIRNESS LAW CONSTITUTION RIGHTS VERDICT PROCEDURE EVIDENCE TESTIMONY COURT ORDER APPEAL JUDGMENT LEGAL CODE WITNESS TRIAL HEARING DELHI HIGH COURT VIRTUAL JUDGE AI INTELLIGENCE ANALYSIS PREDICTION ".repeat(3)}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Scene Selector Component for 3D Models
const ModelScene = ({ activeModel }: { activeModel: string }) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows>
        <Environment preset="city" />
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1}
          color="#FFD700"
          castShadow
        />
        <directionalLight 
          position={[-5, -5, 5]} 
          intensity={1}
          color="#0A2463"
        />
        
        {/* Show one model at a time based on active section */}
        <Float 
          speed={2} 
          rotationIntensity={0.5} 
          floatIntensity={0.5}
        >
          {activeModel === "gavel" && (
            <Gavel 
              rotation={[0, Math.PI / 4, 0]} 
              position={[0, 0, 0]}
            />
          )}
          
          {activeModel === "scales" && (
            <ScalesOfJustice 
              rotation={[0, Math.PI / 4, 0]}
              position={[0, 0, 0]} 
              scale={0.8}
            />
          )}
          
          {activeModel === "judge" && (
            <AIJudge 
              rotation={[0, Math.PI / 4, 0]}
              position={[0, 0, 0]} 
              scale={1.2}
            />
          )}
        </Float>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
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
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center p-4 pt-20 overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* 3D Models (temporarily disabled for compatibility) */}
      {/* <ModelScene activeModel={activeModel} /> */}
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
              <motion.div 
                className="px-8 py-3 bg-legal-gold hover:bg-legal-gold-dark text-legal-dark font-medium rounded-lg transition-all shadow-gold inline-block cursor-pointer"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                Upload Case Files
              </motion.div>
            </Link>
            <Link href="/judge">
              <motion.div
                className="px-8 py-3 border border-legal-gold text-legal-gold hover:bg-legal-gold/10 font-medium rounded-lg transition-all inline-block cursor-pointer"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 215, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                Consult Virtual Judge
              </motion.div>
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
  );
};

export default Home;
