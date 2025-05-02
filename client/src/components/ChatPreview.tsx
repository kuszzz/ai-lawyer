import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPreview = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat Button */}
      <motion.button
        className="w-14 h-14 rounded-full bg-legal-gold text-legal-dark dark:text-legal-dark flex items-center justify-center shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
      >
        {isOpen ? (
          <i className="ri-close-line text-2xl dark:text-legal-dark"></i>
        ) : (
          <i className="ri-chat-3-line text-2xl dark:text-legal-dark"></i>
        )}
      </motion.button>
      
      {/* Chat Preview Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 w-80 bg-legal-dark-alt dark:bg-legal-dark rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-legal-blue p-4 text-white">  
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-legal-dark-alt flex items-center justify-center">
                  <i className="ri-scales-3-line text-legal-gold"></i>
                </div>
                <div>
                  <h3 className="font-medium">Virtual Judge</h3>
                  <div className="flex items-center text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chat Messages Preview */}
            <div className="p-4 bg-legal-dark-alt dark:bg-legal-dark">
              <div className="chat-bubble assistant text-sm mb-3">
                <p>Hello! I'm the Delhi High Court's AI-powered Virtual Judge. How can I assist you today?</p>
              </div>
              
              <div className="space-y-2">
                <motion.div 
                  className="bg-legal-dark dark:bg-legal-dark-alt p-2 rounded-lg cursor-pointer text-sm hover:bg-legal-blue/20 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <p>How will my case be evaluated?</p>
                </motion.div>
                
                <motion.div 
                  className="bg-legal-dark dark:bg-legal-dark-alt p-2 rounded-lg cursor-pointer text-sm hover:bg-legal-blue/20 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <p>What documentation do I need to submit?</p>
                </motion.div>
                
                <motion.div 
                  className="bg-legal-dark dark:bg-legal-dark-alt p-2 rounded-lg cursor-pointer text-sm hover:bg-legal-blue/20 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <p>Tell me more about legal precedents</p>
                </motion.div>
              </div>
            </div>
            
            {/* Footer with CTA */}
            <div className="p-3 bg-legal-dark dark:bg-legal-dark-alt border-t border-legal-blue/20">
              <Link href="/judge">
                <motion.div 
                  className="w-full py-2 bg-legal-gold text-legal-dark text-center rounded-md cursor-pointer font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Full Consultation
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPreview;