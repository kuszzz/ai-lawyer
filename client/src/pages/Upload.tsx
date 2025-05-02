import { motion } from "framer-motion";
import FileUploader from "@/components/FileUploader";

const Upload = () => {
  return (
    <motion.section 
      className="min-h-screen py-20 px-4 relative bg-legal-dark-alt pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              Upload Your <span className="text-legal-gold">Legal Documents</span>
            </h2>
            <p className="text-legal-text-secondary max-w-2xl mx-auto">
              Submit your case files for AI-powered analysis. Our system accepts PDF documents, text files, and scanned legal documents.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FileUploader />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Upload;
