import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Zap,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { SystemMetrics } from "../model/types";

interface SystemMetricsCardProps {
  systemMetrics: SystemMetrics;
}

export const SystemMetricsCard: React.FC<SystemMetricsCardProps> = ({
  systemMetrics,
}) => {
  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatResponseTime = (time: number) => {
    return `${time.toFixed(1)}s`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
    >
      <h3 className="font-bold text-gray-800 mb-6 flex items-center text-lg">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="mr-3 p-2 bg-green-100 rounded-xl"
        >
          <Activity className="w-5 h-5 text-green-600" />
        </motion.div>
        System Metrics
      </h3>

      <div className="space-y-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-blue-600 mb-1"
          >
            {systemMetrics.processedMessages.toLocaleString()}
          </motion.div>
          <div className="text-sm text-blue-700 font-medium flex items-center justify-center">
            <Zap className="w-4 h-4 mr-1" />
            Messages Processed
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-yellow-600 mb-1"
          >
            {systemMetrics.alertsGenerated}
          </motion.div>
          <div className="text-sm text-yellow-700 font-medium flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            High-Risk Alerts
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-green-600 mb-1"
          >
            {(systemMetrics.accuracy * 100).toFixed(1)}%
          </motion.div>
          <div className="text-sm text-green-700 font-medium flex items-center justify-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Detection Accuracy
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-purple-600 mb-1"
          >
            {systemMetrics.activeSessions}
          </motion.div>
          <div className="text-sm text-purple-700 font-medium flex items-center justify-center">
            <Users className="w-4 h-4 mr-1" />
            Active Sessions
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-indigo-700 font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Response Time:
            </span>
            <span className="text-sm font-bold text-indigo-800">
              {formatResponseTime(systemMetrics.responseTime)}
            </span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, ((3 - systemMetrics.responseTime) / 3) * 100)}%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-emerald-700 font-medium flex items-center">
              <Activity className="w-4 h-4 mr-1" />
              System Uptime:
            </span>
            <span className="text-sm font-bold text-emerald-800">
              {formatUptime(systemMetrics.uptime)}
            </span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${systemMetrics.uptime}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-xs text-gray-600 font-medium">
              System Online
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
