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

export interface ClinicalIndicators {
  phq9Score?: number;
  symptomClusters?: string[];
  riskFactors?: string[];
  protectiveFactors?: string[];
}

export interface LinguisticPatterns {
  firstPersonCount: number;
  negationCount: number;
  depressionKeywords: string[];
  positiveKeywords: string[];
  sentenceComplexity?: string;
  emotionalIntensity?: string;
}

export interface TherapeuticRecommendations {
  primaryApproach?: string;
  interventions?: string[];
  urgency?: "low" | "medium" | "high";
}

export interface AnalysisResult {
  sentiment: "positive" | "neutral" | "concerning" | "negative";
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  score: number;
  keywords: string[];
  clinicalIndicators?: ClinicalIndicators;
  linguisticPatterns: LinguisticPatterns;
  therapeuticRecommendations?: TherapeuticRecommendations;
}

export interface RiskAssessment {
  level: "low" | "medium" | "high";
  reasoning: string;
  confidence: number;
  safetyPlan?: string[];
}

export interface AIResponse {
  content: string;
  therapeuticTechniques?: string[];
  supportiveElements: string[];
  recommendedActions: string[];
  copingStrategies?: string[];
  riskAssessment: RiskAssessment;
  followUpSuggestions?: string[];
  resourceRecommendations?: string[];
}

export interface LinguisticAnalysisResult {
  firstPersonCount: number;
  negationCount: number;
  intensifierCount: number;
  sentenceComplexity: string;
  emotionalIntensity: string;
  wordCount: number;
  sentenceCount: number;
}

export interface KeywordAnalysisResult {
  depressionKeywords: string[];
  positiveKeywords: string[];
  riskKeywords: string[];
}

export interface ConversationalContext {
  consistentNegativeThemes: boolean;
  escalatingConcerns: boolean;
  conversationLength: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  userProfile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  sessionSummary?: SessionSummary;
}

export interface SessionSummary {
  messageCount: number;
  averageRiskLevel: "low" | "medium" | "high";
  dominantSentiment: "positive" | "neutral" | "concerning" | "negative";
  keyTopics: string[];
  sessionDuration: number;
  lastMessage: string;
}

export interface ChatSessionMetadata {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage: string;
  riskLevel: "low" | "medium" | "high";
  isActive: boolean;
}
