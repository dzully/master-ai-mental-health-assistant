"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Mic, MicOff, User, Bot } from "lucide-react";
import { Message, UserProfile } from "../model/types";

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
  messagesEndRef: React.RefObject<HTMLDivElement>;
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
  messagesEndRef,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl h-[700px] flex flex-col border border-white/20">
      <div className="p-6 border-b bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="font-bold text-lg">Conversation Session</h3>
              <p className="text-sm opacity-90">Secure & Confidential</p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getRiskLevelColor(userProfile.riskLevel)}`}
          >
            Risk: {userProfile.riskLevel.toUpperCase()}
          </motion.div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`p-1 rounded-full ${
                      message.type === "user" ? "bg-white/20" : "bg-blue-100"
                    }`}
                  >
                    {message.type === "bot" ? (
                      <Bot className="w-4 h-4 text-blue-600" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs opacity-70 font-medium">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.confidence && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs opacity-70">
                            {(message.confidence * 100).toFixed(0)}%
                          </span>
                          {message.sentiment && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                message.sentiment === "positive"
                                  ? "bg-green-100 text-green-700"
                                  : message.sentiment === "negative"
                                    ? "bg-red-100 text-red-700"
                                    : message.sentiment === "concerning"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {message.sentiment}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-blue-100">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  AI is thinking...
                </span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t bg-white/80 backdrop-blur-sm rounded-b-2xl">
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Share your thoughts and feelings... I'm here to listen."
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
              rows={3}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleListening}
              className={`p-4 rounded-2xl transition-all duration-200 shadow-lg ${
                isListening
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSendMessage}
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
