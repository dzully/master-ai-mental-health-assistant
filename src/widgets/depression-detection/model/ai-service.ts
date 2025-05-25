import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AnalysisResult, AIResponse } from "./types";

const google = createGoogleGenerativeAI({
  apiKey:
    process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
    "AIzaSyAwyOQpt541uzCMoC_wbU4WzqHGJVRU9xY",
});

export class AIService {
  private model = google("models/gemini-2.0-flash-exp");

  async analyzeUserInput(
    text: string,
    conversationHistory: string[] = [],
  ): Promise<AnalysisResult> {
    const analysisPrompt = `
You are an expert clinical psychologist specializing in depression detection through conversational analysis. 

Analyze the following user message for signs of depression, considering:
1. Linguistic patterns (first-person pronouns, negation patterns)
2. Depression-related keywords and phrases
3. Emotional tone and sentiment
4. Risk indicators based on clinical research

User message: "${text}"

Previous conversation context: ${conversationHistory.slice(-3).join(" | ")}

Provide analysis in this exact JSON format:
{
  "sentiment": "positive|neutral|concerning|negative",
  "riskLevel": "low|medium|high",
  "confidence": 0.0-1.0,
  "score": numeric_score,
  "keywords": ["detected", "keywords"],
  "linguisticPatterns": {
    "firstPersonCount": number,
    "negationCount": number,
    "depressionKeywords": ["keyword1", "keyword2"],
    "positiveKeywords": ["keyword1", "keyword2"]
  }
}

Base your analysis on validated depression detection research and clinical indicators.
`;

    try {
      const { text: response } = await generateText({
        model: this.model,
        prompt: analysisPrompt,
        temperature: 0.3,
      });

      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return this.getFallbackAnalysis(text);
    }
  }

  async generateTherapeuticResponse(
    userMessage: string,
    analysisResult: AnalysisResult,
    conversationHistory: string[] = [],
  ): Promise<AIResponse> {
    const responsePrompt = `
You are a compassionate AI mental health assistant trained in evidence-based therapeutic approaches including:
- Cognitive Behavioral Therapy (CBT)
- Behavioral Activation Therapy
- Supportive counseling techniques
- Crisis intervention protocols

User message: "${userMessage}"
Risk level: ${analysisResult.riskLevel}
Sentiment: ${analysisResult.sentiment}
Confidence: ${analysisResult.confidence}

Recent conversation: ${conversationHistory.slice(-3).join(" | ")}

Generate a therapeutic response that:
1. Validates the user's feelings
2. Provides appropriate support based on risk level
3. Uses evidence-based therapeutic techniques
4. Maintains professional boundaries
5. Includes crisis intervention if high risk detected

Respond in this exact JSON format:
{
  "content": "Your empathetic and therapeutic response here",
  "supportiveElements": ["validation", "technique_used", "approach"],
  "recommendedActions": ["action1", "action2"],
  "riskAssessment": {
    "level": "low|medium|high",
    "reasoning": "Clinical reasoning for assessment",
    "confidence": 0.0-1.0
  }
}

Keep responses warm, professional, and therapeutically appropriate.
`;

    try {
      const { text: response } = await generateText({
        model: this.model,
        prompt: responsePrompt,
        temperature: 0.7,
      });

      return this.parseResponseData(response);
    } catch (error) {
      console.error("AI Response Generation Error:", error);
      return this.getFallbackResponse(analysisResult.riskLevel);
    }
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanResponse);

      return {
        sentiment: parsed.sentiment || "neutral",
        riskLevel: parsed.riskLevel || "low",
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        score: parsed.score || 0,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
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
        },
      };
    } catch (error) {
      console.error("Failed to parse AI analysis response:", error);
      return this.getFallbackAnalysis(response);
    }
  }

  private parseResponseData(response: string): AIResponse {
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanResponse);

      return {
        content:
          parsed.content ||
          "I'm here to listen and support you. How are you feeling right now?",
        supportiveElements: Array.isArray(parsed.supportiveElements)
          ? parsed.supportiveElements
          : [],
        recommendedActions: Array.isArray(parsed.recommendedActions)
          ? parsed.recommendedActions
          : [],
        riskAssessment: {
          level: parsed.riskAssessment?.level || "low",
          reasoning:
            parsed.riskAssessment?.reasoning || "Standard supportive response",
          confidence: Math.max(
            0,
            Math.min(1, parsed.riskAssessment?.confidence || 0.7),
          ),
        },
      };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return this.getFallbackResponse("low");
    }
  }

  private getFallbackAnalysis(text: string): AnalysisResult {
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
      linguisticPatterns: {
        firstPersonCount,
        negationCount,
        depressionKeywords: foundDepKeywords,
        positiveKeywords: foundPosKeywords,
      },
    };
  }

  private getFallbackResponse(
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
