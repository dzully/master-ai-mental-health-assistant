"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageCircle,
  Clock,
  Trash2,
  Download,
  Upload,
  Settings,
  AlertCircle,
  Heart,
  Brain,
  Search,
  X,
  MoreVertical,
} from "lucide-react";
import { ChatSessionMetadata } from "../model/types";
import { formatTimestamp } from "@/shared/lib/date-utils";

interface ChatSessionSidebarProps {
  sessions: ChatSessionMetadata[];
  activeSessionId: string | null;
  isVisible: boolean;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportSessions: () => void;
  onImportSessions: (file: File) => void;
  onToggleSidebar: () => void;
}

export const ChatSessionSidebar: React.FC<ChatSessionSidebarProps> = ({
  sessions,
  activeSessionId,
  isVisible,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
  onExportSessions,
  onImportSessions,
  onToggleSidebar,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSessionMenu, setSelectedSessionMenu] = useState<string | null>(
    null,
  );

  const getRiskLevelColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRiskIcon = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return <AlertCircle className="w-3 h-3" />;
      case "medium":
        return <Brain className="w-3 h-3" />;
      case "low":
        return <Heart className="w-3 h-3" />;
      default:
        return <MessageCircle className="w-3 h-3" />;
    }
  };

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportSessions(file);
      event.target.value = "";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-96 bg-white/95 backdrop-blur-xl border-r border-white/30 shadow-2xl z-50 flex flex-col"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/40 to-purple-50/30"></div>

          <div className="relative z-10 p-6 border-b border-white/20 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90 text-white">
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>
                  <div className="relative bg-white/10 p-3 rounded-2xl border border-white/20">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Chat Sessions</h2>
                  <p className="text-sm opacity-90">
                    {sessions.length} conversations
                  </p>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleSidebar}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateSession}
              className="w-full flex items-center justify-center space-x-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/30 transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="font-semibold">New Conversation</span>
            </motion.button>
          </div>

          <div className="relative z-10 p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all text-slate-700 placeholder-slate-500"
              />
              {searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`relative group cursor-pointer rounded-2xl p-4 border transition-all ${
                    session.id === activeSessionId
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg"
                      : "bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 hover:shadow-md"
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-xl border ${getRiskLevelColor(session.riskLevel)}`}
                        >
                          {getRiskIcon(session.riskLevel)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate text-sm">
                            {session.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {formatTimestamp(session.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSessionMenu(
                              selectedSessionMenu === session.id
                                ? null
                                : session.id,
                            );
                          }}
                          className="p-1 rounded-lg hover:bg-white/60 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </motion.button>

                        <AnimatePresence>
                          {selectedSessionMenu === session.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-8 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/30 p-2 z-20 min-w-[120px]"
                            >
                              <motion.button
                                whileHover={{ scale: 1.02, x: 2 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSession(session.id);
                                  setSelectedSessionMenu(null);
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {session.lastMessage}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-slate-500">
                          {session.messageCount} messages
                        </div>
                      </div>

                      {session.id === activeSessionId && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center space-x-1 text-blue-600"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">Active</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {session.id === activeSessionId && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredSessions.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-slate-500"
              >
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">
                  {searchTerm
                    ? "No sessions match your search"
                    : "No conversations yet"}
                </p>
                <p className="text-xs mt-2 opacity-70">
                  {searchTerm
                    ? "Try a different search term"
                    : "Start a new conversation to begin"}
                </p>
              </motion.div>
            )}
          </div>

          <div className="relative z-10 p-4 border-t border-white/20 bg-white/40 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-3 py-2 bg-white/60 hover:bg-white/80 rounded-xl transition-colors text-slate-700"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </motion.button>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExportSessions}
                  className="p-2 bg-white/60 hover:bg-white/80 rounded-xl transition-colors text-slate-700"
                  title="Export Sessions"
                >
                  <Download className="w-4 h-4" />
                </motion.button>

                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/60 hover:bg-white/80 rounded-xl transition-colors text-slate-700 cursor-pointer"
                  title="Import Sessions"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </motion.label>
              </div>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/20"
                >
                  <div className="text-xs text-slate-500 space-y-2">
                    <div className="flex justify-between">
                      <span>Total Sessions:</span>
                      <span className="font-medium">{sessions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage Used:</span>
                      <span className="font-medium">
                        {(
                          JSON.stringify(sessions).length /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
