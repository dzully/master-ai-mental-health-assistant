import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  AlertTriangle,
  Phone,
  Users,
  BookOpen,
  Headphones,
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

  const getColorClasses = (color: string, urgent: boolean = false) => {
    const baseClasses = urgent
      ? "bg-gradient-to-r border-2 shadow-lg transform hover:scale-105"
      : "bg-gradient-to-r border hover:shadow-lg transform hover:scale-102";

    switch (color) {
      case "red":
        return `${baseClasses} from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200`;
      case "blue":
        return `${baseClasses} from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200`;
      case "green":
        return `${baseClasses} from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200`;
      case "purple":
        return `${baseClasses} from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200`;
      case "indigo":
        return `${baseClasses} from-indigo-50 to-indigo-100 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200`;
      default:
        return `${baseClasses} from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200`;
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "red":
        return "text-red-600";
      case "blue":
        return "text-blue-600";
      case "green":
        return "text-green-600";
      case "purple":
        return "text-purple-600";
      case "indigo":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case "red":
        return "text-red-800";
      case "blue":
        return "text-blue-800";
      case "green":
        return "text-green-800";
      case "purple":
        return "text-purple-800";
      case "indigo":
        return "text-indigo-800";
      default:
        return "text-gray-800";
    }
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
          className="mr-3 p-2 bg-red-100 rounded-xl"
        >
          <Heart className="w-5 h-5 text-red-600" />
        </motion.div>
        Support Resources
      </h3>

      <div className="space-y-3">
        {resources.map((resource, index) => {
          const IconComponent = resource.icon;

          return (
            <motion.button
              key={resource.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={resource.action}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${getColorClasses(resource.color, resource.urgent)}`}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{
                    rotate: resource.urgent ? [0, -10, 10, -10, 0] : 360,
                  }}
                  transition={{ duration: resource.urgent ? 0.5 : 0.3 }}
                  className={`p-2 rounded-lg bg-white/50 ${resource.urgent ? "animate-pulse" : ""}`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${getIconColor(resource.color)}`}
                  />
                </motion.div>
                <div className="flex-1">
                  <div
                    className={`text-sm font-bold ${getTextColor(resource.color)} ${resource.urgent ? "text-base" : ""}`}
                  >
                    {resource.title}
                    {resource.urgent && (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="ml-2 text-red-600"
                      >
                        🚨
                      </motion.span>
                    )}
                  </div>
                  <div
                    className={`text-xs ${getTextColor(resource.color)} opacity-80`}
                  >
                    {resource.description}
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`text-lg ${getTextColor(resource.color)}`}
                >
                  →
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
      >
        <div className="text-center">
          <div className="text-sm font-bold text-amber-800 mb-1">
            Remember: You&apos;re Not Alone
          </div>
          <div className="text-xs text-amber-700">
            Professional help is available 24/7. Your mental health matters.
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-3 text-center"
      >
        <div className="text-xs text-gray-500 font-medium">
          Emergency: Call 988 (Suicide & Crisis Lifeline)
        </div>
      </motion.div>
    </motion.div>
  );
};
