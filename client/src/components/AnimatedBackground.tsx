import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  // Legal-themed words for the background
  const legalWords = [
    'JUSTICE', 'EQUALITY', 'FAIRNESS', 'LAW', 'CONSTITUTION', 
    'RIGHTS', 'VERDICT', 'PROCEDURE', 'EVIDENCE', 'TESTIMONY',
    'COURT', 'ORDER', 'APPEAL', 'JUDGMENT', 'LEGAL', 'CODE',
    'WITNESS', 'TRIAL', 'HEARING', 'DELHI HIGH COURT', 'ARTICLE 21',
    'FUNDAMENTAL RIGHTS', 'JUDICIARY', 'VIRTUAL JUDGE', 'AI', 'NLP'
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none z-0">
      {/* Moving text background */}
      <motion.div 
        className="absolute inset-0 font-mono text-sm text-legal-blue font-semibold overflow-hidden dark:text-legal-blue-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div 
            key={i} 
            className="whitespace-nowrap"
            initial={{ x: -1000, y: i * 16 }}
            animate={{ 
              x: [Math.random() * -500, 1500],
              y: i * 16 + (Math.random() * 5) 
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
            {legalWords.sort(() => Math.random() - 0.5).join(' · ').repeat(2)}
          </motion.div>
        ))}
      </motion.div>
      
      {/* Floating circles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => {
          const size = 10 + Math.random() * 90;
          return (
            <motion.div
              key={`circle-${i}`}
              className="absolute rounded-full opacity-30 dark:opacity-25"
              style={{
                width: size,
                height: size,
                background: i % 2 === 0 ? 'radial-gradient(circle, rgba(10,36,99,0.5) 0%, rgba(10,36,99,0) 70%)' : 
                                          'radial-gradient(circle, rgba(212,175,55,0.5) 0%, rgba(212,175,55,0) 70%)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 50 - 25],
                y: [0, Math.random() * 50 - 25],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedBackground;