"use client";

import React from "react";
import { motion } from "framer-motion";
import { Menu, MessageSquare } from "lucide-react";

interface SidebarToggleButtonProps {
  isVisible: boolean;
  onClick: () => void;
  sessionCount: number;
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  isVisible,
  onClick,
  sessionCount,
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed top-6 left-6 z-40 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl group-hover:from-white/20"></div>

      <div className="relative z-10 flex items-center space-x-3">
        <motion.div
          animate={{ rotate: isVisible ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Menu className="w-6 h-6" />
        </motion.div>

        <div className="hidden sm:flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Chat Sessions</span>
          {sessionCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 min-w-[24px] flex items-center justify-center"
            >
              <span className="text-xs font-bold">{sessionCount}</span>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
      </motion.div>
    </motion.button>
  );
};
