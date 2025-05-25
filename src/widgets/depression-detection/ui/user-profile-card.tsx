import React from "react";
import { motion } from "framer-motion";
import { User, TrendingUp, Clock, MessageSquare } from "lucide-react";
import { UserProfile } from "../model/types";

interface UserProfileCardProps {
  userProfile: UserProfile;
  getRiskLevelColor: (level: string) => string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userProfile,
  getRiskLevelColor,
}) => {
  const getSentimentTrend = () => {
    const recent = userProfile.sentimentHistory.slice(-5);
    if (recent.length < 2) return "stable";

    const positiveCount = recent.filter((s) => s === "positive").length;
    const negativeCount = recent.filter(
      (s) => s === "negative" || s === "concerning",
    ).length;

    if (positiveCount > negativeCount) return "improving";
    if (negativeCount > positiveCount) return "declining";
    return "stable";
  };

  const trend = getSentimentTrend();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
    >
      <h3 className="font-bold text-gray-800 mb-6 flex items-center text-lg">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="mr-3 p-2 bg-blue-100 rounded-xl"
        >
          <User className="w-5 h-5 text-blue-600" />
        </motion.div>
        User Profile
      </h3>

      <div className="space-y-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100"
        >
          <span className="text-sm text-gray-600 font-medium">Risk Level:</span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border-2 ${getRiskLevelColor(userProfile.riskLevel)}`}
          >
            {userProfile.riskLevel.toUpperCase()}
          </motion.span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100"
        >
          <span className="text-sm text-gray-600 font-medium flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
            Sessions:
          </span>
          <span className="text-sm font-bold text-green-700">
            {userProfile.sessionCount}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100"
        >
          <span className="text-sm text-gray-600 font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2 text-purple-600" />
            Last Active:
          </span>
          <span className="text-sm font-bold text-purple-700">Now</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-gray-100"
        >
          <span className="text-sm text-gray-600 font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />
            Trend:
          </span>
          <span
            className={`text-sm font-bold px-2 py-1 rounded-lg ${
              trend === "improving"
                ? "text-green-700 bg-green-100"
                : trend === "declining"
                  ? "text-red-700 bg-red-100"
                  : "text-gray-700 bg-gray-100"
            }`}
          >
            {trend === "improving"
              ? "↗ Improving"
              : trend === "declining"
                ? "↘ Needs Attention"
                : "→ Stable"}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-100"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 font-medium">
              Confidence Score:
            </span>
            <span className="text-sm font-bold text-indigo-700">
              {(userProfile.averageConfidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${userProfile.averageConfidence * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
            />
          </div>
        </motion.div>

        {userProfile.sentimentHistory.length > 0 && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl border border-gray-100"
          >
            <span className="text-sm text-gray-600 font-medium mb-3 block">
              Recent Sentiment:
            </span>
            <div className="flex space-x-1">
              {userProfile.sentimentHistory
                .slice(-10)
                .map((sentiment, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-3 h-3 rounded-full ${
                      sentiment === "positive"
                        ? "bg-green-400"
                        : sentiment === "negative"
                          ? "bg-red-400"
                          : sentiment === "concerning"
                            ? "bg-yellow-400"
                            : "bg-gray-400"
                    }`}
                    title={sentiment}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
