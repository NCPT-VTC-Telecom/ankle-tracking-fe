import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
}

const FadeInWhenVisible = ({ children, delay = 0 }: FadeInWhenVisibleProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 30 }
      }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInWhenVisible;
