"use client";

import React from "react";
import {
  Phone,
  MessageSquare,
  Globe,
  Heart,
  AlertTriangle,
  Users,
} from "lucide-react";
import { m } from "framer-motion";

interface SupportResourcesCardProps {
  userRiskLevel: "low" | "medium" | "high";
}

export const SupportResourcesCard: React.FC<SupportResourcesCardProps> = ({
  userRiskLevel,
}) => {
  // Real crisis resources - verified and current as of 2024
  const crisisResources = [
    {
      name: "988 Suicide & Crisis Lifeline",
      contact: "988",
      description: "24/7 crisis support in English and Spanish",
      icon: Phone,
      type: "crisis",
      priority: 1,
    },
    {
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "24/7 text-based crisis support",
      icon: MessageSquare,
      type: "crisis",
      priority: 1,
    },
    {
      name: "National Domestic Violence Hotline",
      contact: "1-800-799-7233",
      description: "24/7 support for domestic violence situations",
      icon: Phone,
      type: "crisis",
      priority: 2,
    },
  ];

  const professionalResources = [
    {
      name: "Psychology Today",
      contact: "psychologytoday.com/us/therapists",
      description: "Find licensed therapists and psychiatrists",
      icon: Globe,
      type: "professional",
    },
    {
      name: "SAMHSA Treatment Locator",
      contact: "findtreatment.samhsa.gov",
      description: "Locate mental health and substance abuse treatment",
      icon: Globe,
      type: "professional",
    },
    {
      name: "NAMI (National Alliance on Mental Illness)",
      contact: "nami.org | 1-800-950-6264",
      description: "Mental health education, support, and advocacy",
      icon: Users,
      type: "support",
    },
  ];

  const selfHelpResources = [
    {
      name: "MindShift App",
      contact: "Available on app stores",
      description: "Free anxiety and depression management app",
      icon: Heart,
      type: "selfhelp",
    },
    {
      name: "7 Cups",
      contact: "7cups.com",
      description: "Free emotional support from trained listeners",
      icon: MessageSquare,
      type: "selfhelp",
    },
    {
      name: "Crisis Text Line (Non-Crisis)",
      contact: "Text HELLO to 741741",
      description: "Emotional support via text messaging",
      icon: MessageSquare,
      type: "selfhelp",
    },
  ];

  const getResourcesByRiskLevel = () => {
    switch (userRiskLevel) {
      case "high":
        return {
          primary: crisisResources,
          secondary: professionalResources.slice(0, 2),
          title: "Immediate Support Resources",
          urgencyMessage:
            "If you're in immediate danger, please call 911 or go to your nearest emergency room.",
        };
      case "medium":
        return {
          primary: [
            ...crisisResources.slice(0, 2),
            ...professionalResources.slice(0, 2),
          ],
          secondary: selfHelpResources.slice(0, 2),
          title: "Professional Support Resources",
          urgencyMessage:
            "Consider reaching out to a mental health professional for support.",
        };
      default:
        return {
          primary: [
            ...professionalResources.slice(0, 2),
            ...selfHelpResources.slice(0, 2),
          ],
          secondary: crisisResources.slice(0, 2),
          title: "Mental Health Resources",
          urgencyMessage:
            "These resources are available if you need support or guidance.",
        };
    }
  };

  const resources = getResourcesByRiskLevel();

  const getUrgencyColor = () => {
    switch (userRiskLevel) {
      case "high":
        return "bg-red-50 border-red-200 text-red-800";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-6 h-fit"
    >
      <div className="flex items-center space-x-3 mb-6">
        <m.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg"
        >
          <Heart className="w-6 h-6 text-white" />
        </m.div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {resources.title}
          </h3>
          <p className="text-sm text-slate-600">
            Professional & Crisis Support
          </p>
        </div>
      </div>

      {userRiskLevel === "high" && (
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`mb-6 p-4 rounded-xl border-2 ${getUrgencyColor()}`}
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Important</span>
          </div>
          <p className="text-sm">{resources.urgencyMessage}</p>
        </m.div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
            Primary Resources
          </h4>
          <div className="space-y-3">
            {resources.primary.map((resource, index) => (
              <m.div
                key={resource.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50 hover:border-slate-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <resource.icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-slate-800 mb-1">
                      {resource.name}
                    </h5>
                    <p className="text-sm text-slate-600 mb-2">
                      {resource.description}
                    </p>
                    <p className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded-lg inline-block">
                      {resource.contact}
                    </p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        {resources.secondary.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Additional Support
            </h4>
            <div className="space-y-2">
              {resources.secondary.map((resource, index) => (
                <m.div
                  key={resource.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: (resources.primary.length + index) * 0.1,
                  }}
                  className="p-3 bg-white/50 rounded-lg border border-slate-200/30 hover:bg-white/70 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <resource.icon className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {resource.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 ml-5">
                    {resource.contact}
                  </p>
                </m.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50"
      >
        <p className="text-xs text-slate-600 text-center">
          {resources.urgencyMessage}
          <br />
          <span className="text-slate-500">
            Resources verified as of 2024 • Available 24/7
          </span>
        </p>
      </m.div>
    </m.div>
  );
};
