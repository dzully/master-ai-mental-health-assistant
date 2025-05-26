import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Zap,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Server,
  Cpu,
  Gauge,
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
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden w-full h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white/20 to-blue-50/40"></div>
      <div className="pattern-overlay absolute inset-0 opacity-20"></div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <h3 className="font-bold text-slate-800 text-lg sm:text-xl flex items-center">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="mr-4 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-r from-emerald-600 to-blue-600 p-3 rounded-2xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            System Metrics
          </h3>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Server className="w-6 h-6 text-emerald-500" />
          </motion.div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-sm"></div>
            <div className="relative p-4 sm:p-5 lg:p-6 border border-blue-200/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-blue-100/80 rounded-xl"
                  >
                    <Zap className="w-5 h-5 text-blue-600" />
                  </motion.div>
                  <div>
                    <div className="text-sm text-slate-600 font-semibold">
                      Messages Processed
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.6 }}
                      className="text-2xl font-bold text-blue-700"
                    >
                      {systemMetrics.processedMessages.toLocaleString()}
                    </motion.div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-blue-300 border-t-blue-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 to-yellow-50/90 backdrop-blur-sm"></div>
            <div className="relative p-4 sm:p-5 lg:p-6 border border-amber-200/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-amber-100/80 rounded-xl"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </motion.div>
                  <div>
                    <div className="text-sm text-slate-600 font-semibold">
                      High-Risk Alerts
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="text-2xl font-bold text-amber-700"
                    >
                      {systemMetrics.alertsGenerated}
                    </motion.div>
                  </div>
                </div>
                {systemMetrics.alertsGenerated > 0 && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 bg-red-500 rounded-full shadow-lg"
                  ></motion.div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 to-green-50/90 backdrop-blur-sm"></div>
            <div className="relative p-4 sm:p-5 lg:p-6 border border-emerald-200/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-emerald-100/80 rounded-xl"
                  >
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </motion.div>
                  <div>
                    <div className="text-sm text-slate-600 font-semibold">
                      Detection Accuracy
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-2xl font-bold text-emerald-700"
                    >
                      {(systemMetrics.accuracy * 100).toFixed(1)}%
                    </motion.div>
                  </div>
                </div>
                <motion.div
                  className="relative w-12 h-12"
                  whileHover={{ scale: 1.1 }}
                >
                  <svg
                    className="w-12 h-12 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <motion.path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={`${systemMetrics.accuracy * 100}, 100`}
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{
                        strokeDasharray: `${systemMetrics.accuracy * 100}, 100`,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 to-indigo-50/90 backdrop-blur-sm"></div>
            <div className="relative p-4 sm:p-5 lg:p-6 border border-purple-200/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-2 bg-purple-100/80 rounded-xl"
                  >
                    <Users className="w-5 h-5 text-purple-600" />
                  </motion.div>
                  <div>
                    <div className="text-sm text-slate-600 font-semibold">
                      Active Sessions
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="text-2xl font-bold text-purple-700"
                    >
                      {systemMetrics.activeSessions}
                    </motion.div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {Array.from({
                    length: Math.min(5, systemMetrics.activeSessions),
                  }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-2 h-6 bg-purple-400 rounded-full"
                    ></motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 to-blue-50/90 backdrop-blur-sm"></div>
            <div className="relative p-4 sm:p-5 lg:p-6 border border-indigo-200/50 rounded-2xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-semibold flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                    Response Time:
                  </span>
                  <span className="text-lg font-bold text-indigo-700">
                    {formatResponseTime(systemMetrics.responseTime)}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200/60 rounded-full h-3 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, ((3 - systemMetrics.responseTime) / 3) * 100)}%`,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 h-3 rounded-full shadow-lg relative overflow-hidden"
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

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur-sm"></div>
            <div className="relative p-4 sm:p-5 lg:p-6 border border-emerald-200/50 rounded-2xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-semibold flex items-center">
                    <Gauge className="w-4 h-4 mr-2 text-emerald-600" />
                    System Uptime:
                  </span>
                  <span className="text-lg font-bold text-emerald-700">
                    {formatUptime(systemMetrics.uptime)}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200/60 rounded-full h-3 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${systemMetrics.uptime}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-3 rounded-full shadow-lg relative overflow-hidden"
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

          <motion.div
            whileHover={{ scale: 1.03, x: 4 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 to-gray-50/90 backdrop-blur-sm"></div>
            <div className="relative p-4 border border-slate-200/50 rounded-2xl">
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0.7)",
                      "0 0 0 10px rgba(34, 197, 94, 0)",
                      "0 0 0 0 rgba(34, 197, 94, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-emerald-500 rounded-full"
                />
                <span className="text-sm text-slate-600 font-semibold">
                  System Online & Operational
                </span>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Cpu className="w-4 h-4 text-emerald-600" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
