export interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  sentiment?: "positive" | "neutral" | "concerning" | "negative";
  confidence?: number;
  riskLevel?: "low" | "medium" | "high";
  clusterAssignment?: number;
  linguisticFeatures?: LinguisticFeatures;
  semanticEmbedding?: number[];
}

export interface UserProfile {
  riskLevel: "low" | "medium" | "high";
  sessionCount: number;
  lastInteraction: Date;
  sentimentHistory: string[];
  totalMessages: number;
  averageConfidence: number;
  clusterHistory: ClusterAssignment[];
  phq9EstimatedScore?: number;
  trajectoryTrend?: "improving" | "stable" | "declining";
  riskFactors: string[];
  protectiveFactors: string[];
}

export interface SystemMetrics {
  accuracy: number;
  processedMessages: number;
  activeSessions: number;
  alertsGenerated: number;
  responseTime: number;
  uptime: number;
  clusteringAccuracy: number;
  validationMetrics: ValidationMetrics;
}

export interface ValidationMetrics {
  sensitivity: number;
  specificity: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  confidenceInterval: [number, number];
  areaUnderCurve: number;
}

export interface ClusterAssignment {
  clusterId: number;
  confidence: number;
  timestamp: Date;
  features: number[];
  distanceToCenter: number;
}

export interface LinguisticFeatures {
  firstPersonPronounCount: number;
  negationCount: number;
  absolutistWords: number;
  intensifierCount: number;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  sentenceComplexity: "simple" | "moderate" | "complex";
  emotionalIntensity: "low" | "moderate" | "high";
  depressionKeywordDensity: number;
  semanticCoherence: number;
  valenceScore: number;
}

export interface ClinicalIndicators {
  phq9Score?: number;
  phq9ItemScores?: number[];
  symptomClusters?: string[];
  riskFactors?: string[];
  protectiveFactors?: string[];
  severityLevel?:
    | "minimal"
    | "mild"
    | "moderate"
    | "moderately_severe"
    | "severe";
  diagnosticConfidence?: number;
  recommendedInterventions?: string[];
}

export interface LinguisticPatterns {
  firstPersonCount: number;
  negationCount: number;
  depressionKeywords: string[];
  positiveKeywords: string[];
  sentenceComplexity?: string;
  emotionalIntensity?: string;
  semanticPatterns?: SemanticPattern[];
  linguisticMarkers?: LinguisticMarker[];
}

export interface SemanticPattern {
  pattern: string;
  frequency: number;
  significance: number;
  category: "cognitive" | "emotional" | "behavioral" | "somatic" | "suicidal";
}

export interface LinguisticMarker {
  marker: string;
  count: number;
  weight: number;
  category: string;
}

export interface MLClusteringResult {
  clusters: ClusterData[];
  assignments: ClusterAssignment[];
  silhouetteScore: number;
  inertia: number;
  converged: boolean;
  iterations: number;
  optimalK: number;
}

export interface ClusterData {
  id: number;
  centroid: number[];
  size: number;
  riskLevel: "low" | "medium" | "high";
  characteristics: string[];
  avgPHQ9Score: number;
  avgConfidence: number;
}

export interface TherapeuticRecommendations {
  primaryApproach?: string;
  interventions?: string[];
  urgency?: "low" | "medium" | "high";
  cbTechniques?: string[];
  behavioralActivation?: string[];
  mindfulnessExercises?: string[];
  copingStrategies?: string[];
  riskMitigation?: string[];
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
  clusterAssignment?: ClusterAssignment;
  semanticEmbedding?: number[];
  phq9Estimation?: PHQ9Estimation;
  riskFactorAnalysis?: RiskFactorAnalysis;
}

export interface PHQ9Estimation {
  totalScore: number;
  itemScores: number[];
  confidenceLevel: number;
  severityCategory:
    | "minimal"
    | "mild"
    | "moderate"
    | "moderately_severe"
    | "severe";
  clinicalSignificance: boolean;
}

export interface RiskFactorAnalysis {
  identifiedFactors: string[];
  protectiveFactors: string[];
  riskScore: number;
  interventionUrgency: "low" | "medium" | "high" | "crisis";
  recommendedActions: string[];
}

export interface RiskAssessment {
  level: "low" | "medium" | "high";
  reasoning: string;
  confidence: number;
  safetyPlan?: string[];
  clusterBased?: boolean;
  phq9BasedRisk?: number;
  linguisticRiskFactors?: string[];
  immediateInterventionNeeded?: boolean;
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
  clusterSpecificGuidance?: string[];
  evidenceBasedInterventions?: string[];
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
  clusterStability: number;
  linguisticEvolution: LinguisticFeatures[];
  semanticDrift: number;
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
  clusteringHistory?: MLClusteringResult[];
  clinicalTimeline?: ClinicalIndicators[];
}

export interface SessionSummary {
  messageCount: number;
  averageRiskLevel: "low" | "medium" | "high";
  dominantSentiment: "positive" | "neutral" | "concerning" | "negative";
  keyTopics: string[];
  sessionDuration: number;
  lastMessage: string;
  clusterEvolution?: number[];
  phq9Trajectory?: number[];
  riskFactorTrends?: string[];
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
  clusterAssignment?: number;
  avgConfidence?: number;
}
