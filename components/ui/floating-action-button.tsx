"use client";

import { motion } from "framer-motion";

interface FloatingActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FloatingActionButton({ onClick, children, className = "" }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed z-40 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.button>
  );
}