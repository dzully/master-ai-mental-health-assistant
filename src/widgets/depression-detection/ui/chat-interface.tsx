"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Mic,
  MicOff,
  User,
  Bot,
  Sparkles,
  Heart,
} from "lucide-react";
import { Message, UserProfile } from "../model/types";
import { formatTimestamp } from "@/shared/lib/date-utils";

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  isListening: boolean;
  inputText: string;
  userProfile: UserProfile;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onToggleListening: () => void;
  getRiskLevelColor: (level: string) => string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isTyping,
  isListening,
  inputText,
  userProfile,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onToggleListening,
  getRiskLevelColor,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-h-[1000px] flex flex-col border border-white/30 relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-purple-50/30 pointer-events-none"></div>

      <div className="relative z-10 p-8 border-b border-white/20 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-sm text-white rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>
              <div className="relative bg-white/10 p-3 rounded-2xl border border-white/20">
                <MessageCircle className="w-7 h-7" />
              </div>
            </motion.div>
            <div className="space-y-1">
              <h3 className="font-bold text-xl flex items-center space-x-2">
                <span>Conversation Session</span>
                <Heart className="w-5 h-5 text-pink-300 animate-pulse" />
              </h3>
              <p className="text-sm opacity-90 font-medium">
                Secure & Confidential Support
              </p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-sm"></div>
            <div
              className={`relative px-6 py-3 rounded-2xl font-bold border-2 border-white/30 bg-white/10 backdrop-blur-sm ${getRiskLevelColor(userProfile.riskLevel).replace("bg-", "text-").replace("border-", "").replace("text-", "text-white ")}`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${userProfile.riskLevel === "high" ? "bg-red-300" : userProfile.riskLevel === "medium" ? "bg-yellow-300" : "bg-green-300"} animate-pulse`}
                ></div>
                <span>Risk: {userProfile.riskLevel.toUpperCase()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-slate-50/30 via-white/40 to-blue-50/30">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm lg:max-w-lg relative ${
                  message.type === "user" ? "ml-12" : "mr-12"
                }`}
              >
                <div
                  className={`px-8 py-6 rounded-3xl shadow-xl relative overflow-hidden ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white"
                      : "bg-white/90 backdrop-blur-sm border border-white/50 text-slate-800"
                  }`}
                >
                  {message.type === "user" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
                  )}
                  {message.type === "bot" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/30"></div>
                  )}

                  <div className="relative z-10 flex items-start space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      className={`p-2 rounded-2xl shadow-lg ${
                        message.type === "user"
                          ? "bg-white/20 backdrop-blur-sm"
                          : "bg-gradient-to-br from-blue-100 to-purple-100"
                      }`}
                    >
                      {message.type === "bot" ? (
                        <Bot className="w-5 h-5 text-blue-600" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </motion.div>

                    <div className="flex-1 space-y-3">
                      <p className="text-sm leading-relaxed font-medium">
                        {message.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold ${
                            message.type === "user"
                              ? "text-white/70"
                              : "text-slate-500"
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </span>

                        {message.confidence && (
                          <div className="flex items-center space-x-3">
                            <div
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                message.type === "user"
                                  ? "bg-white/20 text-white"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {(message.confidence * 100).toFixed(0)}%
                              confidence
                            </div>

                            {message.sentiment && (
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`text-xs px-3 py-1 rounded-full font-bold border-2 ${
                                  message.sentiment === "positive"
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : message.sentiment === "negative"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : message.sentiment === "concerning"
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                {message.sentiment}
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex justify-start mr-12"
          >
            <div className="bg-white/90 backdrop-blur-sm border border-white/50 px-8 py-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/30"></div>

              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 font-semibold ml-3">
                    AI is analyzing...
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative z-10 p-8 border-t border-white/20 bg-white/60 backdrop-blur-xl rounded-b-3xl">
        <div className="flex items-end space-x-6">
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-3xl blur-sm"></div>
            <textarea
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Share your thoughts and feelings... I'm here to listen with care and understanding."
              className="relative w-full px-8 py-6 border-2 border-white/30 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400/50 resize-none transition-all duration-300 bg-white/80 backdrop-blur-sm text-slate-800 placeholder-slate-500 font-medium shadow-lg"
              rows={3}
            />
          </div>

          <div className="flex flex-col space-y-3">
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleListening}
              className={`p-5 rounded-3xl transition-all duration-300 shadow-xl relative overflow-hidden ${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 hover:from-slate-200 hover:to-slate-300"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative z-10">
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </div>
              {isListening && (
                <motion.div
                  className="absolute inset-0 bg-red-400/30 rounded-3xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSendMessage}
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-5 rounded-3xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent group-hover:from-white/20"></div>
              <div className="relative z-10">
                <Send className="w-6 h-6" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
