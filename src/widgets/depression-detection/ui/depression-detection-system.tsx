"use client";

import React, { useState, useEffect } from "react";
import { Brain, Sparkles, Shield, Activity } from "lucide-react";
import { LazyMotion, domAnimation, motion } from "framer-motion";
import { useChatSessionManager } from "../model/use-chat-session-manager";
import { ChatInterface } from "../ui/chat-interface";
import { UserProfileCard } from "../ui/user-profile-card";
import { SystemMetricsCard } from "../ui/system-metrics-card";
import { SupportResourcesCard } from "../ui/support-resources-card";
import { ChatSessionSidebar } from "../ui/chat-session-sidebar";
import { SidebarToggleButton } from "../ui/sidebar-toggle-button";

const DepressionDetectionSystem = () => {
  const {
    currentSession,
    sessionsList,
    systemMetrics,
    isTyping,
    isListening,
    sidebarVisible,
    sendMessage,
    toggleListening,
    toggleSidebar,
    createNewSession,
    selectSession,
    deleteSession,
    exportSessions,
    importSessions,
  } = useChatSessionManager();

  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    await sendMessage(inputText);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50"></div>

        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
              <div className="pattern-overlay absolute inset-0"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-3xl shadow-xl">
                      <Brain className="w-10 h-10 text-white" />
                      <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-3 h-3 text-white m-0.5" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                      AI Mental Health Assistant
                    </h1>
                    <p className="text-slate-600 font-medium text-lg flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span>
                        Intelligent Conversational Agent for Depression
                        Detection & Support
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="text-sm text-blue-700 font-semibold">
                          Detection Accuracy
                        </div>
                        <div className="text-3xl font-bold text-blue-800">
                          {(systemMetrics.accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <div className="text-sm text-emerald-700 font-semibold">
                          Active Sessions
                        </div>
                        <div className="text-3xl font-bold text-emerald-800">
                          {systemMetrics.activeSessions}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col xl:flex-row gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="xl:w-3/4"
            >
              {currentSession && (
                <ChatInterface
                  messages={currentSession.messages}
                  isTyping={isTyping}
                  isListening={isListening}
                  inputText={inputText}
                  userProfile={currentSession.userProfile}
                  onInputChange={setInputText}
                  onSendMessage={handleSendMessage}
                  onKeyPress={handleKeyPress}
                  onToggleListening={toggleListening}
                  getRiskLevelColor={getRiskLevelColor}
                />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6 xl:w-1/4"
            >
              {currentSession && (
                <UserProfileCard
                  userProfile={currentSession.userProfile}
                  getRiskLevelColor={getRiskLevelColor}
                />
              )}

              <SystemMetricsCard metrics={systemMetrics} />

              {currentSession && (
                <SupportResourcesCard
                  userRiskLevel={currentSession.userProfile.riskLevel}
                />
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col lg:flex-row mt-6 gap-6"
          >
            <div className="flex-1">
              <SystemMetricsCard metrics={systemMetrics} />
            </div>
            <div className="flex-1">
              {currentSession && (
                <SupportResourcesCard
                  userRiskLevel={currentSession.userProfile.riskLevel}
                />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8"
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-blue-50/30 to-purple-50/50"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3 px-4 py-2 bg-emerald-50/80 rounded-2xl border border-emerald-200/50"
                  >
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-emerald-700 font-semibold text-sm">
                      End-to-end encrypted
                    </span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3 px-4 py-2 bg-blue-50/80 rounded-2xl border border-blue-200/50"
                  >
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-blue-700 font-semibold text-sm">
                      ML-powered analysis
                    </span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3 px-4 py-2 bg-purple-50/80 rounded-2xl border border-purple-200/50"
                  >
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-purple-700 font-semibold text-sm">
                      Real-time processing
                    </span>
                  </motion.div>
                </div>

                <div className="text-sm text-slate-500 font-medium bg-slate-50/80 px-4 py-2 rounded-2xl border border-slate-200/50">
                  Research by Mohamad Dzul Syakimin - University of Malaya
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <SidebarToggleButton
          isVisible={sidebarVisible}
          onClick={toggleSidebar}
          sessionCount={sessionsList.length}
        />

        <ChatSessionSidebar
          sessions={sessionsList}
          activeSessionId={currentSession?.id || null}
          isVisible={sidebarVisible}
          onCreateSession={createNewSession}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
          onExportSessions={exportSessions}
          onImportSessions={importSessions}
          onToggleSidebar={toggleSidebar}
        />
      </div>
    </LazyMotion>
  );
};

export default DepressionDetectionSystem;
