export interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  sentiment?: "positive" | "neutral" | "concerning" | "negative";
  confidence?: number;
  riskLevel?: "low" | "medium" | "high";
}

export interface UserProfile {
  riskLevel: "low" | "medium" | "high";
  sessionCount: number;
  lastInteraction: Date;
  sentimentHistory: string[];
  totalMessages: number;
  averageConfidence: number;
}

export interface SystemMetrics {
  accuracy: number;
  processedMessages: number;
  activeSessions: number;
  alertsGenerated: number;
  responseTime: number;
  uptime: number;
}

export interface AnalysisResult {
  sentiment: "positive" | "neutral" | "concerning" | "negative";
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  score: number;
  keywords: string[];
  linguisticPatterns: {
    firstPersonCount: number;
    negationCount: number;
    depressionKeywords: string[];
    positiveKeywords: string[];
  };
}

export interface AIResponse {
  content: string;
  supportiveElements: string[];
  recommendedActions: string[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    reasoning: string;
    confidence: number;
  };
}
