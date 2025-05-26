import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  AlertTriangle,
  Phone,
  Users,
  BookOpen,
  Headphones,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const SupportResourcesCard: React.FC = () => {
  const resources = [
    {
      id: 1,
      title: "Crisis Hotline",
      description: "24/7 Emergency Support",
      icon: AlertTriangle,
      color: "red",
      action: () => window.open("tel:988", "_self"),
      urgent: true,
    },
    {
      id: 2,
      title: "Find Therapist",
      description: "Professional Help Near You",
      icon: Users,
      color: "blue",
      action: () =>
        window.open("https://www.psychologytoday.com/us/therapists", "_blank"),
      urgent: false,
    },
    {
      id: 3,
      title: "Self-Help Resources",
      description: "Coping Strategies & Tools",
      icon: BookOpen,
      color: "green",
      action: () =>
        window.open(
          "https://www.nimh.nih.gov/health/topics/depression",
          "_blank",
        ),
      urgent: false,
    },
    {
      id: 4,
      title: "Meditation & Mindfulness",
      description: "Guided Relaxation",
      icon: Headphones,
      color: "purple",
      action: () => window.open("https://www.headspace.com", "_blank"),
      urgent: false,
    },
    {
      id: 5,
      title: "Support Groups",
      description: "Connect with Others",
      icon: Phone,
      color: "indigo",
      action: () =>
        window.open(
          "https://www.nami.org/Support-Education/Support-Groups",
          "_blank",
        ),
      urgent: false,
    },
  ];

  return (
    <motion.div
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 via-white/20 to-pink-50/40"></div>
      <div className="pattern-overlay absolute inset-0 opacity-20"></div>

      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-slate-800 text-xl flex items-center">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="mr-4 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-r from-rose-600 to-pink-600 p-3 rounded-2xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            Support Resources
          </h3>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="w-6 h-6 text-rose-500" />
          </motion.div>
        </div>

        <div className="space-y-4">
          {resources.map((resource, index) => {
            const IconComponent = resource.icon;

            return (
              <motion.button
                key={resource.id}
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.03, x: 6, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={resource.action}
                className="w-full text-left relative overflow-hidden rounded-2xl group"
              >
                <div
                  className={`absolute inset-0 ${
                    resource.urgent
                      ? "bg-gradient-to-br from-red-50/90 to-rose-50/90"
                      : resource.color === "blue"
                        ? "bg-gradient-to-br from-blue-50/90 to-indigo-50/90"
                        : resource.color === "green"
                          ? "bg-gradient-to-br from-emerald-50/90 to-green-50/90"
                          : resource.color === "purple"
                            ? "bg-gradient-to-br from-purple-50/90 to-violet-50/90"
                            : "bg-gradient-to-br from-indigo-50/90 to-blue-50/90"
                  } backdrop-blur-sm`}
                ></div>

                <div
                  className={`relative p-6 border ${
                    resource.urgent
                      ? "border-red-200/60"
                      : resource.color === "blue"
                        ? "border-blue-200/60"
                        : resource.color === "green"
                          ? "border-emerald-200/60"
                          : resource.color === "purple"
                            ? "border-purple-200/60"
                            : "border-indigo-200/60"
                  } rounded-2xl transition-all duration-300`}
                >
                  {resource.urgent && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full shadow-lg"
                    ></motion.div>
                  )}

                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{
                        rotate: resource.urgent ? [0, -15, 15, -15, 0] : 360,
                        scale: 1.1,
                      }}
                      transition={{ duration: resource.urgent ? 0.6 : 0.4 }}
                      className="relative"
                    >
                      <div
                        className={`absolute inset-0 ${
                          resource.urgent
                            ? "bg-red-200/50"
                            : resource.color === "blue"
                              ? "bg-blue-200/50"
                              : resource.color === "green"
                                ? "bg-emerald-200/50"
                                : resource.color === "purple"
                                  ? "bg-purple-200/50"
                                  : "bg-indigo-200/50"
                        } rounded-2xl blur-md`}
                      ></div>
                      <div
                        className={`relative p-3 rounded-2xl shadow-lg ${
                          resource.urgent
                            ? "bg-gradient-to-br from-red-100 to-rose-100"
                            : resource.color === "blue"
                              ? "bg-gradient-to-br from-blue-100 to-indigo-100"
                              : resource.color === "green"
                                ? "bg-gradient-to-br from-emerald-100 to-green-100"
                                : resource.color === "purple"
                                  ? "bg-gradient-to-br from-purple-100 to-violet-100"
                                  : "bg-gradient-to-br from-indigo-100 to-blue-100"
                        }`}
                      >
                        <IconComponent
                          className={`w-6 h-6 ${
                            resource.urgent
                              ? "text-red-600"
                              : resource.color === "blue"
                                ? "text-blue-600"
                                : resource.color === "green"
                                  ? "text-emerald-600"
                                  : resource.color === "purple"
                                    ? "text-purple-600"
                                    : "text-indigo-600"
                          }`}
                        />
                      </div>
                    </motion.div>

                    <div className="flex-1 space-y-1">
                      <div
                        className={`font-bold flex items-center space-x-2 ${
                          resource.urgent
                            ? "text-red-800 text-base"
                            : resource.color === "blue"
                              ? "text-blue-800 text-sm"
                              : resource.color === "green"
                                ? "text-emerald-800 text-sm"
                                : resource.color === "purple"
                                  ? "text-purple-800 text-sm"
                                  : "text-indigo-800 text-sm"
                        }`}
                      >
                        <span>{resource.title}</span>
                        {resource.urgent && (
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0],
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-red-600"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </motion.div>
                        )}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          resource.urgent
                            ? "text-red-700"
                            : resource.color === "blue"
                              ? "text-blue-700"
                              : resource.color === "green"
                                ? "text-emerald-700"
                                : resource.color === "purple"
                                  ? "text-purple-700"
                                  : "text-indigo-700"
                        } opacity-90`}
                      >
                        {resource.description}
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ x: 4, scale: 1.1 }}
                      className={`p-2 rounded-xl ${
                        resource.urgent
                          ? "bg-red-100/80 text-red-600"
                          : resource.color === "blue"
                            ? "bg-blue-100/80 text-blue-600"
                            : resource.color === "green"
                              ? "bg-emerald-100/80 text-emerald-600"
                              : resource.color === "purple"
                                ? "bg-purple-100/80 text-purple-600"
                                : "bg-indigo-100/80 text-indigo-600"
                      } group-hover:shadow-lg transition-all duration-300`}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-sm"></div>
          <div className="relative p-6 border border-amber-200/50 rounded-2xl">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </motion.div>
                <div className="text-sm font-bold text-amber-800">
                  Remember: You&apos;re Not Alone
                </div>
                <motion.div
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </motion.div>
              </div>
              <div className="text-xs text-amber-700 font-medium">
                Professional help is available 24/7. Your mental health matters.
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-4 relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/90 to-rose-50/90 backdrop-blur-sm"></div>
          <div className="relative p-4 border border-red-200/50 rounded-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                ></motion.div>
                <div className="text-xs text-red-700 font-bold">
                  Emergency: Call 988 (Suicide & Crisis Lifeline)
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
