import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  AnalysisResult,
  AIResponse,
  LinguisticAnalysisResult,
  KeywordAnalysisResult,
  ConversationalContext,
} from "./types";

const google = createGoogleGenerativeAI({
  apiKey:
    process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
    "AIzaSyAwyOQpt541uzCMoC_wbU4WzqHGJVRU9xY",
});

export class AIService {
  private model = google("models/gemini-2.0-flash-exp");

  private readonly depressionIndicators = {
    cognitive: [
      "worthless",
      "hopeless",
      "helpless",
      "useless",
      "failure",
      "burden",
      "nothing matters",
      "pointless",
      "meaningless",
      "empty",
      "numb",
      "can't think",
      "confused",
      "forgetful",
      "indecisive",
      "overwhelmed",
    ],
    emotional: [
      "sad",
      "depressed",
      "down",
      "blue",
      "miserable",
      "devastated",
      "heartbroken",
      "lonely",
      "isolated",
      "abandoned",
      "rejected",
      "angry",
      "irritated",
      "frustrated",
      "anxious",
      "worried",
      "scared",
    ],
    behavioral: [
      "can't sleep",
      "insomnia",
      "sleeping too much",
      "tired",
      "exhausted",
      "no energy",
      "can't eat",
      "overeating",
      "withdrawn",
      "avoiding",
      "procrastinating",
      "can't concentrate",
      "restless",
      "agitated",
    ],
    somatic: [
      "headache",
      "stomach ache",
      "chest pain",
      "muscle tension",
      "fatigue",
      "weakness",
      "dizzy",
      "nauseous",
      "appetite loss",
      "weight loss",
      "weight gain",
      "aches",
      "pains",
    ],
    suicidal: [
      "want to die",
      "kill myself",
      "end it all",
      "not worth living",
      "better off dead",
      "suicide",
      "self-harm",
      "hurt myself",
      "disappear",
      "give up",
      "can't go on",
      "no point",
    ],
  };

  private readonly positiveIndicators = [
    "happy",
    "joy",
    "excited",
    "grateful",
    "thankful",
    "blessed",
    "hopeful",
    "optimistic",
    "confident",
    "proud",
    "accomplished",
    "loved",
    "supported",
    "connected",
    "peaceful",
    "calm",
    "relaxed",
    "motivated",
    "energetic",
    "focused",
    "clear",
    "determined",
  ];

  private readonly therapeuticApproaches = {
    low: {
      techniques: [
        "active_listening",
        "validation",
        "psychoeducation",
        "behavioral_activation",
      ],
      interventions: [
        "mood_tracking",
        "activity_scheduling",
        "social_connection",
      ],
    },
    medium: {
      techniques: [
        "cognitive_restructuring",
        "problem_solving",
        "coping_skills",
        "mindfulness",
      ],
      interventions: [
        "professional_referral",
        "safety_planning",
        "support_system_activation",
      ],
    },
    high: {
      techniques: [
        "crisis_intervention",
        "safety_assessment",
        "immediate_support",
      ],
      interventions: [
        "emergency_resources",
        "professional_intervention",
        "continuous_monitoring",
      ],
    },
  };

  async analyzeUserInput(
    text: string,
    conversationHistory: string[] = [],
  ): Promise<AnalysisResult> {
    const linguisticAnalysis = this.performLinguisticAnalysis(text);
    const keywordAnalysis = this.performKeywordAnalysis(text);
    // Contextual analysis for future enhancement
    // const contextualAnalysis = this.analyzeConversationalContext(text, conversationHistory);

    const analysisPrompt = `
You are an expert clinical psychologist specializing in depression detection through conversational analysis based on validated research methodologies.

Analyze the following user message using evidence-based clinical indicators:

User message: "${text}"
Conversation context: ${conversationHistory.slice(-5).join(" | ")}

Linguistic patterns detected:
- First-person pronouns: ${linguisticAnalysis.firstPersonCount}
- Negation patterns: ${linguisticAnalysis.negationCount}
- Sentence complexity: ${linguisticAnalysis.sentenceComplexity}
- Emotional intensity: ${linguisticAnalysis.emotionalIntensity}

Keyword analysis:
- Depression indicators: ${keywordAnalysis.depressionKeywords.length}
- Positive indicators: ${keywordAnalysis.positiveKeywords.length}
- Risk keywords: ${keywordAnalysis.riskKeywords.length}

Clinical assessment criteria:
1. PHQ-9 symptom indicators (mood, anhedonia, sleep, energy, appetite, concentration, psychomotor, guilt, suicidal ideation)
2. Beck Depression Inventory markers
3. Linguistic depression markers from research literature
4. Contextual risk factors and protective factors

Provide analysis in this exact JSON format:
{
  "sentiment": "positive|neutral|concerning|negative",
  "riskLevel": "low|medium|high",
  "confidence": 0.0-1.0,
  "score": numeric_score_0_to_100,
  "keywords": ["detected", "keywords"],
  "clinicalIndicators": {
    "phq9Score": estimated_score_0_to_27,
    "symptomClusters": ["cognitive", "emotional", "behavioral", "somatic"],
    "riskFactors": ["identified", "risk", "factors"],
    "protectiveFactors": ["identified", "protective", "factors"]
  },
  "linguisticPatterns": {
    "firstPersonCount": ${linguisticAnalysis.firstPersonCount},
    "negationCount": ${linguisticAnalysis.negationCount},
    "depressionKeywords": ${JSON.stringify(keywordAnalysis.depressionKeywords)},
    "positiveKeywords": ${JSON.stringify(keywordAnalysis.positiveKeywords)},
    "sentenceComplexity": "${linguisticAnalysis.sentenceComplexity}",
    "emotionalIntensity": "${linguisticAnalysis.emotionalIntensity}"
  },
  "therapeuticRecommendations": {
    "primaryApproach": "recommended_therapeutic_approach",
    "interventions": ["intervention1", "intervention2"],
    "urgency": "low|medium|high"
  }
}

Base your analysis on validated depression detection research, clinical assessment tools, and evidence-based practices.
`;

    try {
      const { text: response } = await generateText({
        model: this.model,
        prompt: analysisPrompt,
        temperature: 0.2,
        maxTokens: 1000,
      });

      return this.parseEnhancedAnalysisResponse(
        response,
        linguisticAnalysis,
        keywordAnalysis,
      );
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return this.getEnhancedFallbackAnalysis(text);
    }
  }

  async generateTherapeuticResponse(
    userMessage: string,
    analysisResult: AnalysisResult,
    conversationHistory: string[] = [],
  ): Promise<AIResponse> {
    const therapeuticContext =
      this.therapeuticApproaches[analysisResult.riskLevel];

    const responsePrompt = `
You are a compassionate AI mental health assistant trained in evidence-based therapeutic approaches including:
- Cognitive Behavioral Therapy (CBT)
- Behavioral Activation Therapy (BAT)
- Dialectical Behavior Therapy (DBT) skills
- Motivational Interviewing (MI)
- Crisis intervention protocols
- Trauma-informed care principles

User message: "${userMessage}"
Risk level: ${analysisResult.riskLevel}
Sentiment: ${analysisResult.sentiment}
Confidence: ${analysisResult.confidence}
Clinical indicators: ${JSON.stringify(analysisResult.clinicalIndicators || {})}

Conversation history: ${conversationHistory.slice(-3).join(" | ")}

Recommended therapeutic techniques: ${therapeuticContext.techniques.join(", ")}
Suggested interventions: ${therapeuticContext.interventions.join(", ")}

Generate a therapeutic response that:
1. Validates the user's emotional experience using reflective listening
2. Applies appropriate evidence-based therapeutic techniques
3. Provides psychoeducation when relevant
4. Includes behavioral activation strategies for depression
5. Maintains therapeutic alliance and rapport
6. Addresses safety concerns if high risk detected
7. Offers concrete coping strategies and resources

Response guidelines by risk level:
- Low risk: Supportive, educational, skill-building focus
- Medium risk: More structured intervention, coping skills, professional resources
- High risk: Crisis intervention, safety planning, immediate professional referral

Respond in this exact JSON format:
{
  "content": "Your empathetic and therapeutically informed response here",
  "therapeuticTechniques": ["technique1", "technique2"],
  "supportiveElements": ["validation", "normalization", "hope_instillation"],
  "recommendedActions": ["specific_action1", "specific_action2"],
  "copingStrategies": ["strategy1", "strategy2"],
  "riskAssessment": {
    "level": "${analysisResult.riskLevel}",
    "reasoning": "Clinical reasoning for assessment based on evidence",
    "confidence": 0.0-1.0,
    "safetyPlan": ["safety_step1", "safety_step2"]
  },
  "followUpSuggestions": ["suggestion1", "suggestion2"],
  "resourceRecommendations": ["resource1", "resource2"]
}

Ensure responses are warm, professional, non-judgmental, and therapeutically appropriate while maintaining clear boundaries.
`;

    try {
      const { text: response } = await generateText({
        model: this.model,
        prompt: responsePrompt,
        temperature: 0.6,
        maxTokens: 1200,
      });

      return this.parseEnhancedResponseData(response, analysisResult.riskLevel);
    } catch (error) {
      console.error("AI Response Generation Error:", error);
      return this.getEnhancedFallbackResponse(analysisResult.riskLevel);
    }
  }

  private performLinguisticAnalysis(text: string): LinguisticAnalysisResult {
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    const firstPersonPronouns = ["i", "me", "my", "myself", "mine"];
    const negationWords = [
      "not",
      "no",
      "never",
      "nothing",
      "nobody",
      "nowhere",
      "neither",
      "nor",
      "can't",
      "won't",
      "don't",
      "doesn't",
      "didn't",
      "isn't",
      "aren't",
      "wasn't",
      "weren't",
    ];
    const intensifiers = [
      "very",
      "extremely",
      "really",
      "so",
      "too",
      "quite",
      "absolutely",
      "completely",
      "totally",
    ];

    const firstPersonCount = words.filter((word) =>
      firstPersonPronouns.includes(word.replace(/[^\w]/g, "")),
    ).length;

    const negationCount = words.filter((word) =>
      negationWords.some((neg) => word.includes(neg)),
    ).length;

    const intensifierCount = words.filter((word) =>
      intensifiers.includes(word.replace(/[^\w]/g, "")),
    ).length;

    const avgWordsPerSentence =
      sentences.length > 0 ? words.length / sentences.length : 0;
    const sentenceComplexity =
      avgWordsPerSentence > 15
        ? "complex"
        : avgWordsPerSentence > 8
          ? "moderate"
          : "simple";

    const emotionalIntensity =
      intensifierCount > 2 ? "high" : intensifierCount > 0 ? "moderate" : "low";

    return {
      firstPersonCount,
      negationCount,
      intensifierCount,
      sentenceComplexity,
      emotionalIntensity,
      wordCount: words.length,
      sentenceCount: sentences.length,
    };
  }

  private performKeywordAnalysis(text: string): KeywordAnalysisResult {
    const lowerText = text.toLowerCase();

    const depressionKeywords: string[] = [];
    const positiveKeywords: string[] = [];
    const riskKeywords: string[] = [];

    // Check for depression indicators across categories
    Object.entries(this.depressionIndicators).forEach(
      ([category, keywords]) => {
        keywords.forEach((keyword) => {
          if (lowerText.includes(keyword)) {
            depressionKeywords.push(keyword);
            if (category === "suicidal") {
              riskKeywords.push(keyword);
            }
          }
        });
      },
    );

    // Check for positive indicators
    this.positiveIndicators.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        positiveKeywords.push(keyword);
      }
    });

    return {
      depressionKeywords: [...new Set(depressionKeywords)],
      positiveKeywords: [...new Set(positiveKeywords)],
      riskKeywords: [...new Set(riskKeywords)],
    };
  }

  private analyzeConversationalContext(
    text: string,
    history: string[],
  ): ConversationalContext {
    const recentHistory = history.slice(-3).join(" ").toLowerCase();
    const currentText = text.toLowerCase();

    const consistentNegativeThemes = this.depressionIndicators.emotional.some(
      (emotion) =>
        recentHistory.includes(emotion) && currentText.includes(emotion),
    );

    const escalatingConcerns =
      history.length > 0 &&
      this.depressionIndicators.suicidal.some((risk) =>
        currentText.includes(risk),
      );

    return {
      consistentNegativeThemes,
      escalatingConcerns,
      conversationLength: history.length,
    };
  }

  private parseEnhancedAnalysisResponse(
    response: string,
    linguisticAnalysis: LinguisticAnalysisResult,
    keywordAnalysis: KeywordAnalysisResult,
  ): AnalysisResult {
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanResponse);

      return {
        sentiment: parsed.sentiment || "neutral",
        riskLevel: parsed.riskLevel || "low",
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        score: parsed.score || 0,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        clinicalIndicators: parsed.clinicalIndicators || {},
        linguisticPatterns: {
          firstPersonCount: parsed.linguisticPatterns?.firstPersonCount || 0,
          negationCount: parsed.linguisticPatterns?.negationCount || 0,
          depressionKeywords: Array.isArray(
            parsed.linguisticPatterns?.depressionKeywords,
          )
            ? parsed.linguisticPatterns.depressionKeywords
            : [],
          positiveKeywords: Array.isArray(
            parsed.linguisticPatterns?.positiveKeywords,
          )
            ? parsed.linguisticPatterns.positiveKeywords
            : [],
          sentenceComplexity:
            parsed.linguisticPatterns?.sentenceComplexity || "unknown",
          emotionalIntensity:
            parsed.linguisticPatterns?.emotionalIntensity || "unknown",
        },
        therapeuticRecommendations: parsed.therapeuticRecommendations || {},
      };
    } catch (error) {
      console.error("Failed to parse AI analysis response:", error);
      return this.getEnhancedFallbackAnalysis(
        response,
        linguisticAnalysis,
        keywordAnalysis,
      );
    }
  }

  private parseEnhancedResponseData(
    response: string,
    riskLevel: "low" | "medium" | "high",
  ): AIResponse {
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanResponse);

      return {
        content:
          parsed.content ||
          "I'm here to listen and support you. How are you feeling right now?",
        therapeuticTechniques: Array.isArray(parsed.therapeuticTechniques)
          ? parsed.therapeuticTechniques
          : [],
        supportiveElements: Array.isArray(parsed.supportiveElements)
          ? parsed.supportiveElements
          : [],
        recommendedActions: Array.isArray(parsed.recommendedActions)
          ? parsed.recommendedActions
          : [],
        copingStrategies: Array.isArray(parsed.copingStrategies)
          ? parsed.copingStrategies
          : [],
        riskAssessment: {
          level: riskLevel,
          reasoning:
            parsed.riskAssessment?.reasoning || "Standard supportive response",
          confidence: Math.max(
            0,
            Math.min(1, parsed.riskAssessment?.confidence || 0.7),
          ),
          safetyPlan: Array.isArray(parsed.riskAssessment?.safetyPlan)
            ? parsed.riskAssessment.safetyPlan
            : [],
        },
        followUpSuggestions: Array.isArray(parsed.followUpSuggestions)
          ? parsed.followUpSuggestions
          : [],
        resourceRecommendations: Array.isArray(parsed.resourceRecommendations)
          ? parsed.resourceRecommendations
          : [],
      };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return this.getEnhancedFallbackResponse(riskLevel);
    }
  }

  private getEnhancedFallbackAnalysis(text: string): AnalysisResult {
    const depressionKeywords = [
      "sad",
      "depressed",
      "hopeless",
      "worthless",
      "empty",
      "lonely",
      "tired",
      "exhausted",
      "sleep",
      "insomnia",
      "anxious",
      "worry",
      "nothing matters",
      "give up",
      "pointless",
      "burden",
      "hate myself",
    ];

    const positiveKeywords = [
      "happy",
      "good",
      "great",
      "better",
      "excited",
      "hopeful",
      "grateful",
      "content",
      "peaceful",
      "confident",
      "motivated",
    ];

    const textLower = text.toLowerCase();
    let depressionScore = 0;
    let positivityScore = 0;
    const foundDepKeywords: string[] = [];
    const foundPosKeywords: string[] = [];

    depressionKeywords.forEach((word) => {
      if (textLower.includes(word)) {
        depressionScore += 1;
        foundDepKeywords.push(word);
      }
    });

    positiveKeywords.forEach((word) => {
      if (textLower.includes(word)) {
        positivityScore += 1;
        foundPosKeywords.push(word);
      }
    });

    const firstPersonCount = (textLower.match(/\b(i|me|my|myself)\b/g) || [])
      .length;
    const negationCount = (
      textLower.match(/\b(not|no|never|nothing|nobody)\b/g) || []
    ).length;

    const totalScore =
      depressionScore -
      positivityScore +
      firstPersonCount * 0.1 +
      negationCount * 0.3;

    let sentiment: "positive" | "neutral" | "concerning" | "negative" =
      "neutral";
    let riskLevel: "low" | "medium" | "high" = "low";
    let confidence = 0.5;

    if (totalScore > 2) {
      sentiment = "negative";
      riskLevel = "high";
      confidence = Math.min(0.9, 0.6 + totalScore * 0.1);
    } else if (totalScore > 0.5) {
      sentiment = "concerning";
      riskLevel = "medium";
      confidence = 0.7;
    } else if (totalScore < -1) {
      sentiment = "positive";
      riskLevel = "low";
      confidence = 0.8;
    }

    return {
      sentiment,
      riskLevel,
      confidence,
      score: totalScore,
      keywords: [...foundDepKeywords, ...foundPosKeywords],
      clinicalIndicators: {},
      linguisticPatterns: {
        firstPersonCount,
        negationCount,
        depressionKeywords: foundDepKeywords,
        positiveKeywords: foundPosKeywords,
        sentenceComplexity: "unknown",
        emotionalIntensity: "unknown",
      },
      therapeuticRecommendations: {},
    };
  }

  private getEnhancedFallbackResponse(
    riskLevel: "low" | "medium" | "high",
  ): AIResponse {
    const responses = {
      high: {
        content:
          "I hear that you're going through a really difficult time. Your feelings are valid, and I'm here to support you. Would you like to talk about what's been weighing on you?",
        supportiveElements: ["validation", "empathy", "open_invitation"],
        recommendedActions: [
          "professional_help",
          "crisis_resources",
          "continued_conversation",
        ],
      },
      medium: {
        content:
          "I can sense that things might feel challenging right now. It's okay to have difficult days. Would you like to explore what might help you feel a bit better?",
        supportiveElements: ["normalization", "hope", "collaborative_approach"],
        recommendedActions: ["coping_strategies", "self_care", "monitoring"],
      },
      low: {
        content:
          "Thank you for sharing with me. I'm here to listen and support you. How has your day been going?",
        supportiveElements: ["gratitude", "presence", "gentle_inquiry"],
        recommendedActions: ["continued_engagement", "positive_reinforcement"],
      },
    };

    const response = responses[riskLevel];

    return {
      content: response.content,
      supportiveElements: response.supportiveElements,
      recommendedActions: response.recommendedActions,
      riskAssessment: {
        level: riskLevel,
        reasoning: "Fallback assessment based on basic pattern matching",
        confidence: 0.6,
      },
    };
  }
}
