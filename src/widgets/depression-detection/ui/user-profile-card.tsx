import React from "react";
import { motion } from "framer-motion";
import {
  User,
  TrendingUp,
  Clock,
  MessageSquare,
  Star,
  Activity,
  Heart,
} from "lucide-react";
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
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/20 to-purple-50/40"></div>
      <div className="pattern-overlay absolute inset-0 opacity-30"></div>

      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-slate-800 text-xl flex items-center">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="mr-4 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            User Profile
          </h3>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="w-6 h-6 text-pink-500" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm"></div>
            <div className="relative p-6 border border-white/40 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-semibold flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-blue-600" />
                  Risk Assessment:
                </span>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 shadow-lg ${getRiskLevelColor(userProfile.riskLevel)}`}
                >
                  {userProfile.riskLevel.toUpperCase()}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm"></div>
            <div className="relative p-6 border border-emerald-200/50 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-semibold flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-emerald-600" />
                  Total Sessions:
                </span>
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  ></motion.div>
                  <span className="text-lg font-bold text-emerald-700">
                    {userProfile.sessionCount}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm"></div>
            <div className="relative p-6 border border-purple-200/50 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-semibold flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-purple-600" />
                  Status:
                </span>
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 bg-green-500 rounded-full shadow-lg"
                  ></motion.div>
                  <span className="text-sm font-bold text-purple-700 bg-purple-100/80 px-3 py-1 rounded-full">
                    Active Now
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm"></div>
            <div className="relative p-6 border border-orange-200/50 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-semibold flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />
                  Wellness Trend:
                </span>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`text-sm font-bold px-4 py-2 rounded-xl shadow-lg border-2 ${
                    trend === "improving"
                      ? "text-emerald-700 bg-emerald-100/80 border-emerald-200"
                      : trend === "declining"
                        ? "text-red-700 bg-red-100/80 border-red-200"
                        : "text-slate-700 bg-slate-100/80 border-slate-200"
                  }`}
                >
                  {trend === "improving"
                    ? "↗ Improving"
                    : trend === "declining"
                      ? "↘ Needs Care"
                      : "→ Stable"}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 backdrop-blur-sm"></div>
            <div className="relative p-6 border border-indigo-200/50 rounded-2xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-2 text-indigo-600" />
                    AI Confidence:
                  </span>
                  <span className="text-lg font-bold text-indigo-700">
                    {(userProfile.averageConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200/60 rounded-full h-3 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${userProfile.averageConfidence * 100}%`,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 h-3 rounded-full shadow-lg relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                        animate={{ x: [-100, 200] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      ></motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {userProfile.sentimentHistory.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.03, x: 4 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-50/80 to-rose-50/80 backdrop-blur-sm"></div>
              <div className="relative p-6 border border-pink-200/50 rounded-2xl">
                <div className="space-y-4">
                  <span className="text-sm text-slate-600 font-semibold flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-pink-600" />
                    Emotional Journey:
                  </span>
                  <div className="flex space-x-2 justify-center">
                    {userProfile.sentimentHistory
                      .slice(-10)
                      .map((sentiment, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, opacity: 0, y: 20 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{
                            delay: index * 0.1,
                            duration: 0.5,
                            ease: "easeOut",
                          }}
                          whileHover={{ scale: 1.3, y: -4 }}
                          className={`w-4 h-4 rounded-full shadow-lg border-2 border-white ${
                            sentiment === "positive"
                              ? "bg-gradient-to-br from-emerald-400 to-green-500"
                              : sentiment === "negative"
                                ? "bg-gradient-to-br from-red-400 to-red-500"
                                : sentiment === "concerning"
                                  ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                                  : "bg-gradient-to-br from-slate-400 to-gray-500"
                          }`}
                          title={sentiment}
                        />
                      ))}
                  </div>
                  <div className="text-xs text-center text-slate-500 font-medium">
                    Recent emotional patterns
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
