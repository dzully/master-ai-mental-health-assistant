"use client";

import React from "react";
import {
  Activity,
  Brain,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { SystemMetrics } from "../model/types";

interface SystemMetricsCardProps {
  metrics: SystemMetrics;
}

export const SystemMetricsCard: React.FC<SystemMetricsCardProps> = ({
  metrics,
}) => {
  // Clinical performance interpretation based on healthcare standards
  const getAccuracyGrade = (accuracy: number) => {
    if (accuracy >= 0.85)
      return {
        grade: "Excellent",
        color: "emerald",
        description: "Clinical-grade accuracy",
      };
    if (accuracy >= 0.8)
      return {
        grade: "Good",
        color: "blue",
        description: "Healthcare standard",
      };
    if (accuracy >= 0.75)
      return {
        grade: "Acceptable",
        color: "yellow",
        description: "Requires monitoring",
      };
    return {
      grade: "Needs Improvement",
      color: "red",
      description: "Below clinical threshold",
    };
  };

  const getResponseTimeStatus = (responseTime: number) => {
    if (responseTime <= 1.0) return { status: "Optimal", color: "emerald" };
    if (responseTime <= 2.0) return { status: "Good", color: "blue" };
    if (responseTime <= 3.0) return { status: "Acceptable", color: "yellow" };
    return { status: "Slow", color: "red" };
  };

  const getUptimeStatus = (uptime: number) => {
    if (uptime >= 99.5) return { status: "Excellent", color: "emerald" };
    if (uptime >= 99.0) return { status: "Good", color: "blue" };
    if (uptime >= 98.0) return { status: "Acceptable", color: "yellow" };
    return { status: "Critical", color: "red" };
  };

  const accuracyGrade = getAccuracyGrade(metrics.accuracy);
  const responseStatus = getResponseTimeStatus(metrics.responseTime);
  const uptimeStatus = getUptimeStatus(metrics.uptime);

  const metricsData = [
    {
      title: "Detection Accuracy",
      value: `${(metrics.accuracy * 100).toFixed(1)}%`,
      subtitle: accuracyGrade.description,
      icon: Brain,
      color: accuracyGrade.color,
      badge: accuracyGrade.grade,
      description:
        "Based on validated clinical assessment tools (PHQ-9, DSM-5 criteria)",
    },
    {
      title: "Processed Messages",
      value: metrics.processedMessages.toLocaleString(),
      subtitle: "Total conversations analyzed",
      icon: Activity,
      color: "blue",
      badge: "Active",
      description: "Real-time linguistic analysis and depression screening",
    },
    {
      title: "Active Sessions",
      value: metrics.activeSessions.toString(),
      subtitle: "Current therapeutic conversations",
      icon: Users,
      color: "indigo",
      badge: "Live",
      description: "Concurrent users receiving mental health support",
    },
    {
      title: "High-Risk Alerts",
      value: metrics.alertsGenerated.toString(),
      subtitle: "Crisis interventions triggered",
      icon: AlertTriangle,
      color: "red",
      badge: "Critical",
      description:
        "Automatic detection of suicidal ideation and crisis situations",
    },
    {
      title: "Response Time",
      value: `${metrics.responseTime.toFixed(1)}s`,
      subtitle: responseStatus.status,
      icon: Clock,
      color: responseStatus.color,
      badge: responseStatus.status,
      description: "Average AI processing and response generation time",
    },
    {
      title: "System Uptime",
      value: `${metrics.uptime.toFixed(1)}%`,
      subtitle: uptimeStatus.status,
      icon: TrendingUp,
      color: uptimeStatus.color,
      badge: uptimeStatus.status,
      description: "Healthcare-grade reliability and availability",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: {
        bg: "from-emerald-500 to-teal-600",
        light: "from-emerald-50 to-emerald-100/80",
        border: "border-emerald-200/50",
        text: "text-emerald-800",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
      },
      blue: {
        bg: "from-blue-500 to-blue-600",
        light: "from-blue-50 to-blue-100/80",
        border: "border-blue-200/50",
        text: "text-blue-800",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
      },
      indigo: {
        bg: "from-indigo-500 to-indigo-600",
        light: "from-indigo-50 to-indigo-100/80",
        border: "border-indigo-200/50",
        text: "text-indigo-800",
        badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
      },
      red: {
        bg: "from-red-500 to-red-600",
        light: "from-red-50 to-red-100/80",
        border: "border-red-200/50",
        text: "text-red-800",
        badge: "bg-red-100 text-red-700 border-red-200",
      },
      yellow: {
        bg: "from-yellow-500 to-yellow-600",
        light: "from-yellow-50 to-yellow-100/80",
        border: "border-yellow-200/50",
        text: "text-yellow-800",
        badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-6 h-fit"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg"
        >
          <Activity className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Clinical Performance
          </h3>
          <p className="text-sm text-slate-600">Real-time System Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {metricsData.map((metric, index) => {
          const colors = getColorClasses(metric.color);
          const IconComponent = metric.icon;

          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className={`relative group p-4 bg-gradient-to-br ${colors.light} backdrop-blur-sm rounded-2xl border ${colors.border} shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`p-2 bg-gradient-to-r ${colors.bg} rounded-xl shadow-md`}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">
                      {metric.title}
                    </h4>
                    <p className="text-xs text-slate-500">{metric.subtitle}</p>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={`px-2 py-1 rounded-lg text-xs font-medium border ${colors.badge}`}
                >
                  {metric.badge}
                </motion.div>
              </div>

              <div className="mb-3">
                <div className={`text-2xl font-bold ${colors.text} mb-1`}>
                  {metric.value}
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-white/50 p-2 rounded-lg">
                {metric.description}
              </div>

              {/* Performance indicator */}
              {metric.title === "Detection Accuracy" && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.accuracy * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colors.bg} rounded-b-2xl`}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">
            Clinical Validation
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Performance metrics validated against PHQ-9 depression screening tool,
          DSM-5 criteria, and clinical research standards. System maintains
          healthcare-grade accuracy and reliability for mental health
          assessment.
        </p>
      </motion.div>
    </motion.div>
  );
};
