"use client";

import React, { useState, useEffect, useRef, RefObject } from "react";
import { Brain } from "lucide-react";
import { LazyMotion, domAnimation, motion } from "framer-motion";
import { useDepressionDetection } from "../model/use-depression-detection";
import { ChatInterface } from "../ui/chat-interface";
import { UserProfileCard } from "../ui/user-profile-card";
import { SystemMetricsCard } from "../ui/system-metrics-card";
import { SupportResourcesCard } from "../ui/support-resources-card";

const DepressionDetectionSystem = () => {
  const {
    messages,
    userProfile,
    systemMetrics,
    isTyping,
    isListening,
    sendMessage,
    toggleListening,
  } = useDepressionDetection();

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg"
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Mental Health Assistant
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Intelligent Conversational Agent for Depression Detection &
                    Support
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100"
                >
                  <div className="text-sm text-blue-600 font-medium">
                    Accuracy
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {(systemMetrics.accuracy * 100).toFixed(1)}%
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-green-50 rounded-xl border border-green-100"
                >
                  <div className="text-sm text-green-600 font-medium">
                    Active Sessions
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {systemMetrics.activeSessions}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <ChatInterface
                messages={messages}
                isTyping={isTyping}
                isListening={isListening}
                inputText={inputText}
                userProfile={userProfile}
                onInputChange={setInputText}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
                onToggleListening={toggleListening}
                getRiskLevelColor={getRiskLevelColor}
                messagesEndRef={messagesEndRef as RefObject<HTMLDivElement>}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <UserProfileCard
                userProfile={userProfile}
                getRiskLevelColor={getRiskLevelColor}
              />
              <SystemMetricsCard systemMetrics={systemMetrics} />
              <SupportResourcesCard />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">End-to-end encrypted</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">ML-powered analysis</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">Real-time processing</span>
                </span>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Based on research by Mohamad Dzul Syakimin - University of
                Malaya
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </LazyMotion>
  );
};

export default DepressionDetectionSystem;
