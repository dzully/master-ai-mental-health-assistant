"use client";

import React from "react";
import {
  User,
  TrendingUp,
  Calendar,
  MessageCircle,
  Brain,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { UserProfile } from "../model/types";

interface UserProfileCardProps {
  userProfile: UserProfile;
  getRiskLevelColor: (level: string) => string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userProfile,
  getRiskLevelColor,
}) => {
  // Clinical interpretation of risk levels based on validated assessment tools
  const getRiskLevelInfo = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return {
          description: "Immediate professional intervention recommended",
          clinicalNote:
            "Indicators suggest significant depression symptoms requiring immediate attention",
          interventions: [
            "Crisis hotline",
            "Emergency services",
            "Professional referral",
          ],
          icon: AlertTriangle,
        };
      case "medium":
        return {
          description: "Professional mental health consultation advised",
          clinicalNote:
            "Moderate depression indicators detected, therapeutic support beneficial",
          interventions: [
            "Therapy referral",
            "CBT techniques",
            "Mood monitoring",
          ],
          icon: Brain,
        };
      default:
        return {
          description: "Minimal depression indicators, continue monitoring",
          clinicalNote:
            "Low-risk profile with supportive intervention appropriate",
          interventions: [
            "Self-care strategies",
            "Preventive resources",
            "Peer support",
          ],
          icon: User,
        };
    }
  };

  // Calculate average sentiment over recent interactions
  const calculateRecentTrend = () => {
    if (userProfile.sentimentHistory.length < 2) return "stable";

    const recent = userProfile.sentimentHistory.slice(-3);
    const concerningCount = recent.filter(
      (s) => s === "concerning" || s === "negative",
    ).length;
    const positiveCount = recent.filter((s) => s === "positive").length;

    if (concerningCount > positiveCount && concerningCount >= 2)
      return "declining";
    if (positiveCount > concerningCount && positiveCount >= 2)
      return "improving";
    return "stable";
  };

  // Clinical session analysis
  const getSessionAnalysis = () => {
    const avgConfidence = userProfile.averageConfidence;
    const messageCount = userProfile.totalMessages;

    let reliability = "Limited data";
    if (messageCount >= 10 && avgConfidence >= 0.8)
      reliability = "High confidence";
    else if (messageCount >= 5 && avgConfidence >= 0.7)
      reliability = "Moderate confidence";
    else if (messageCount >= 3) reliability = "Preliminary assessment";

    return { reliability, messageCount, avgConfidence };
  };

  const riskInfo = getRiskLevelInfo(userProfile.riskLevel);
  const trend = calculateRecentTrend();
  const sessionAnalysis = getSessionAnalysis();
  const RiskIcon = riskInfo.icon;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-emerald-600 bg-emerald-50";
      case "declining":
        return "text-red-600 bg-red-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getTrendIcon = (trend: string) => {
    const baseClasses = "w-4 h-4";
    switch (trend) {
      case "improving":
        return <TrendingUp className={`${baseClasses} text-emerald-600`} />;
      case "declining":
        return (
          <TrendingUp className={`${baseClasses} text-red-600 rotate-180`} />
        );
      default:
        return (
          <TrendingUp className={`${baseClasses} text-blue-600 rotate-90`} />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg"
        >
          <User className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Clinical Assessment
          </h3>
          <p className="text-sm text-slate-600">User Mental Health Profile</p>
        </div>
      </div>

      {/* Risk Level Assessment */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`p-4 rounded-2xl border-2 ${getRiskLevelColor(userProfile.riskLevel)}`}
      >
        <div className="flex items-center space-x-3 mb-3">
          <RiskIcon className="w-5 h-5" />
          <div>
            <div className="font-semibold text-lg capitalize">
              {userProfile.riskLevel} Risk Level
            </div>
            <div className="text-sm opacity-90">{riskInfo.description}</div>
          </div>
        </div>

        <div className="text-xs bg-white/50 p-3 rounded-lg mb-3">
          <strong>Clinical Note:</strong> {riskInfo.clinicalNote}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold opacity-75">
            Recommended Interventions:
          </div>
          <div className="flex flex-wrap gap-1">
            {riskInfo.interventions.map((intervention, index) => (
              <motion.span
                key={intervention}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="px-2 py-1 text-xs bg-white/70 rounded-lg font-medium"
              >
                {intervention}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Session Analytics */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50"
        >
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">
              Messages
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-1">
            {userProfile.totalMessages}
          </div>
          <div className="text-xs text-slate-600">Total interactions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">
              Sessions
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-1">
            {userProfile.sessionCount}
          </div>
          <div className="text-xs text-slate-600">Conversation sessions</div>
        </motion.div>
      </div>

      {/* Clinical Confidence & Reliability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-xl border border-indigo-200/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">
              Assessment Reliability
            </span>
          </div>
          <div className="text-sm font-medium text-indigo-800">
            {(userProfile.averageConfidence * 100).toFixed(0)}%
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Confidence Level:</span>
            <span className="font-medium text-slate-700">
              {sessionAnalysis.reliability}
            </span>
          </div>

          <div className="w-full bg-white/50 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${userProfile.averageConfidence * 100}%` }}
              transition={{ delay: 0.8, duration: 1 }}
              className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Sentiment Trend Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getTrendIcon(trend)}
            <span className="text-sm font-semibold text-slate-700">
              Mood Trend
            </span>
          </div>
          <div
            className={`px-2 py-1 rounded-lg text-xs font-medium ${getTrendColor(trend)}`}
          >
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </div>
        </div>

        <div className="text-xs text-slate-600 mb-3">
          Based on recent conversation sentiment analysis
        </div>

        {userProfile.sentimentHistory.length > 0 && (
          <div className="flex space-x-1">
            {userProfile.sentimentHistory.slice(-10).map((sentiment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className={`w-2 h-8 rounded-full ${
                  sentiment === "positive"
                    ? "bg-emerald-400"
                    : sentiment === "neutral"
                      ? "bg-slate-300"
                      : sentiment === "negative"
                        ? "bg-amber-400"
                        : "bg-red-400"
                }`}
                title={`${sentiment} sentiment`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Last Interaction */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-xs text-center text-slate-500 pt-4 border-t border-slate-200/50"
      >
        Last interaction: {userProfile.lastInteraction.toLocaleDateString()} at{" "}
        {userProfile.lastInteraction.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </motion.div>
    </motion.div>
  );
};
