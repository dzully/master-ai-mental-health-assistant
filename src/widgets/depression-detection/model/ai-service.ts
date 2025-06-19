import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  AnalysisResult,
  AIResponse,
  LinguisticAnalysisResult,
  KeywordAnalysisResult,
} from "./types";

const google = createGoogleGenerativeAI({
  apiKey:
    process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
    "AIzaSyAwyOQpt541uzCMoC_wbU4WzqHGJVRU9xY", // Note: This is a publicly shared key and should be replaced.
});

// Defines the possible contexts of a user's message for tailored responses.
type MessageContext =
  | "greeting"
  | "sharing"
  | "seeking_help"
  | "positive"
  | "struggling"
  | "general";

// Defines the situations for which a contextual fallback message can be generated.
type FallbackSituation = "parsing_failed" | "connection_error" | "default";

/**
 * AIService orchestrates the interaction with the generative AI model,
 * including response generation, user input analysis, and fallback mechanisms.
 */
export class AIService {
  private model = google("models/gemini-2.0-flash-exp");
  private responseCount = 0;

  /**
   * Verifies the connection to the AI model by sending a test prompt.
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise.
   */
  async testConnection(): Promise<boolean> {
    console.log("🔍 Testing AI model connection...");
    try {
      const { text } = await generateText({
        model: this.model,
        prompt:
          "This is a test prompt to verify API connectivity. Please respond with a short confirmation message.",
      });

      const success = text.trim().length > 0;
      console.log(
        `🔗 Connection test result: ${success ? "SUCCESS" : "FAILED"}`,
      );
      if (success) {
        console.log(
          `📝 AI connection confirmed with response: "${text.trim()}"`,
        );
      } else {
        console.log("📝 AI returned an empty or invalid response.");
      }
      return success;
    } catch (error) {
      console.error("❌ AI Connection Test Error:", error);
      return false;
    }
  }

  /**
   * Generates a therapeutic, context-aware response from the AI.
   * It first tests the connection, then generates a response based on user input analysis.
   * If the AI call fails, it provides a smart fallback response.
   */
  async generateTherapeuticResponse(
    userMessage: string,
    analysisResult: AnalysisResult,
    conversationHistory: string[] = [],
  ): Promise<AIResponse> {
    console.log("🚀 Starting AI response generation for:", userMessage);

    if (!(await this.testConnection())) {
      console.log("❌ AI connection failed. Using smart fallback response.");
      return this.getSmartFallbackResponse(
        userMessage,
        analysisResult.riskLevel,
      );
    }

    const context = this.analyzeMessageContext(userMessage);
    const prompt = this.createResponsePrompt(
      userMessage,
      analysisResult,
      conversationHistory,
      context,
    );

    console.log("🎯 Generated prompt:", prompt.substring(0, 300) + "...");

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.8,
        maxTokens: 500,
      });

      console.log("✅ AI raw response:", text);
      return this.parseAIResponse(text, analysisResult.riskLevel);
    } catch (error) {
      console.error("❌ AI Response Generation Error:", error);
      return this.getSmartFallbackResponse(
        userMessage,
        analysisResult.riskLevel,
      );
    }
  }

  /**
   * Analyzes user input to determine its primary context.
   */
  private analyzeMessageContext(userMessage: string): MessageContext {
    const msg = userMessage.toLowerCase();
    if (msg.length < 15 && (msg.startsWith("hi") || msg.startsWith("hello")))
      return "greeting";
    if (msg.includes("i feel") || msg.includes("i'm") || msg.includes("today"))
      return "sharing";
    if (
      msg.includes("help") ||
      msg.includes("what should") ||
      msg.includes("advice")
    )
      return "seeking_help";
    if (msg.includes("better") || msg.includes("good") || msg.includes("thank"))
      return "positive";
    if (
      msg.includes("hard") ||
      msg.includes("difficult") ||
      msg.includes("struggle")
    )
      return "struggling";
    return "general";
  }

  /**
   * Creates a dynamic and varied prompt for the AI model.
   */
  private createResponsePrompt(
    userMessage: string,
    analysisResult: AnalysisResult,
    conversationHistory: string[],
    context: MessageContext,
  ): string {
    this.responseCount++;
    const personalities = [
      `You are Dr. Sarah, a warm and empathetic mental health professional who talks like a caring friend. You're knowledgeable but down-to-earth, using casual language while offering expert insights.`,
      `You are Alex, a friendly counselor who combines professional expertise with a relaxed, approachable style. You talk like someone who genuinely cares and has been through life's ups and downs.`,
      `You are Jamie, a supportive mental health expert who feels like a wise friend. You're understanding, use everyday language, and always have practical advice that actually helps.`,
      `You are Taylor, a compassionate therapist who believes in people's strength. You talk casually but with deep insight, like a friend who happens to be really good at helping people figure things out.`,
    ];
    const selectedPersonality =
      personalities[this.responseCount % personalities.length];

    return `${selectedPersonality}
User message: "${userMessage}"
Context: ${context}
Risk level detected: ${analysisResult.riskLevel}
Recent conversation: ${conversationHistory.slice(-3).join(" | ")}

Respond like a caring friend who happens to be a mental health expert. Your response should be:
- 4-5 sentences in a warm, conversational tone like talking to a close friend.
- Use casual, everyday language - avoid overly clinical or formal terms.
- Acknowledge what they shared with genuine empathy and understanding.
- FOCUS ON PROVIDING PRACTICAL SOLUTIONS, ADVICE, AND ACTIONABLE STEPS they can try. Give specific suggestions, techniques, or strategies that could help.
- Only ask a question if you genuinely need more information to provide better help. Otherwise, give solutions and advice.
- Sound like a real person who genuinely cares and has helpful ideas to share.
- Use contractions (I'm, you're, that's, etc.) and speak naturally.

Generate the response in this EXACT JSON format (ensure all quotes are properly escaped):
{
  "content": "Your friendly, solution-focused response with practical advice and actionable suggestions.",
  "emotion": "warm|caring|understanding|supportive",
  "followUp": "Only include if you need specific information to help better (keep this empty most of the time).",
  "supportType": "practical-advice|actionable-solutions|coping-strategies|helpful-techniques"
}`;
  }

  /**
   * Parses the JSON response from the AI.
   */
  private parseAIResponse(
    response: string,
    riskLevel: "low" | "medium" | "high",
  ): AIResponse {
    try {
      console.log("🔍 Parsing AI response...");
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      const sanitizedResponse = cleanResponse.replace(/[\n\r\t\b\f]/g, "");
      const parsed = JSON.parse(sanitizedResponse);

      return {
        content: parsed.content || this.getContextualFallback("parsing_failed"),
        supportiveElements: [
          parsed.emotion || "understanding",
          parsed.supportType || "validation",
        ],
        recommendedActions: ["continue_conversation", "active_listening"],
        riskAssessment: {
          level: riskLevel,
          reasoning: `AI generated response with ${parsed.emotion || "neutral"} tone`,
          confidence: 0.8,
        },
        followUpSuggestions: parsed.followUp ? [parsed.followUp] : [],
        resourceRecommendations: [],
      };
    } catch (error) {
      console.error("❌ Failed to parse AI response:", error);
      return this.getSmartFallbackResponse("parsing_error", riskLevel);
    }
  }

  /**
   * Provides a pre-defined, context-aware response when the main AI fails.
   */
  private getSmartFallbackResponse(
    userMessage: string,
    riskLevel: "low" | "medium" | "high",
  ): AIResponse {
    console.log("🎯 Generating smart fallback for:", userMessage);
    const context = this.analyzeMessageContext(userMessage);
    const responses = this.getContextualResponses();
    const responseData =
      responses[context]?.[riskLevel] ?? responses.general.low;

    return {
      content: responseData.content,
      supportiveElements: responseData.supportiveElements,
      recommendedActions: responseData.recommendedActions,
      riskAssessment: {
        level: riskLevel,
        reasoning: "Smart contextual fallback response",
        confidence: 0.7,
      },
      followUpSuggestions: responseData.followUpSuggestions,
      resourceRecommendations: [],
    };
  }

  /**
   * A repository of pre-defined responses for the fallback system.
   */
  private getContextualResponses() {
    // Content is structured as: context -> riskLevel -> response object
    return {
      greeting: {
        low: {
          content:
            "Hello! I'm really glad you're here. How are you feeling today?",
          supportiveElements: ["warmth", "welcoming"],
          recommendedActions: ["open_dialogue"],
          followUpSuggestions: ["What's been on your mind lately?"],
        },
        medium: {
          content:
            "Hi there. Thank you for reaching out. I'm here to listen - what would you like to talk about?",
          supportiveElements: ["presence", "availability"],
          recommendedActions: ["gentle_exploration"],
          followUpSuggestions: ["How has your day been treating you?"],
        },
        high: {
          content:
            "Hello, I'm here for you. It takes courage to reach out, and I want you to know you're not alone.",
          supportiveElements: ["validation", "courage_recognition"],
          recommendedActions: ["immediate_support"],
          followUpSuggestions: ["What's feeling most difficult right now?"],
        },
      },
      sharing: {
        low: {
          content:
            "Thank you for sharing that with me. I can hear that you're going through something. Tell me more about what's happening.",
          supportiveElements: ["gratitude", "attentive_listening"],
          recommendedActions: ["encourage_expression"],
          followUpSuggestions: ["What's been the most challenging part?"],
        },
        medium: {
          content:
            "I really appreciate you opening up about this. It sounds like there's a lot going on for you right now.",
          supportiveElements: ["appreciation", "acknowledgment"],
          recommendedActions: ["validate_experience"],
          followUpSuggestions: ["How are you coping with everything?"],
        },
        high: {
          content:
            "Thank you for trusting me with this. What you're experiencing sounds really difficult, and your feelings are completely valid.",
          supportiveElements: ["trust", "validation"],
          recommendedActions: ["deep_validation"],
          followUpSuggestions: [
            "What kind of support feels most helpful right now?",
          ],
        },
      },
      seeking_help: {
        low: {
          content:
            "I'm honored that you're asking for help - that shows real self-awareness. Let's explore what might be most helpful for you.",
          supportiveElements: ["honor", "self_awareness"],
          recommendedActions: ["collaborative_planning"],
          followUpSuggestions: ["What's your biggest concern right now?"],
        },
        medium: {
          content:
            "Asking for help is a sign of strength, not weakness. I'm here to support you. What feels most overwhelming?",
          supportiveElements: ["strength_recognition", "support"],
          recommendedActions: ["normalize_help_seeking"],
          followUpSuggestions: ["Where would you like to start?"],
        },
        high: {
          content:
            "You did the right thing by reaching out. I'm here to help you through this. You don't have to face this alone.",
          supportiveElements: ["affirmation", "presence"],
          recommendedActions: ["immediate_support"],
          followUpSuggestions: ["What feels most urgent for you right now?"],
        },
      },
      positive: {
        low: {
          content:
            "That's wonderful to hear! I'm so glad things are looking up for you. What's been helping you feel better?",
          supportiveElements: ["celebration", "curiosity"],
          recommendedActions: ["reinforce_positive"],
          followUpSuggestions: ["What else has been going well?"],
        },
        medium: {
          content:
            "I'm really happy to hear some positive news from you. It's important to acknowledge these moments.",
          supportiveElements: ["happiness", "acknowledgment"],
          recommendedActions: ["highlight_progress"],
          followUpSuggestions: ["How can you build on this positive feeling?"],
        },
        high: {
          content:
            "This is such important progress, and I want to celebrate that with you. You should feel proud of yourself.",
          supportiveElements: ["celebration", "pride"],
          recommendedActions: ["celebrate_progress"],
          followUpSuggestions: [
            "What do you think contributed to this positive change?",
          ],
        },
      },
      struggling: {
        low: {
          content:
            "I hear you saying this is hard for you. Sometimes life can feel overwhelming, and that's completely understandable.",
          supportiveElements: ["hearing", "normalization"],
          recommendedActions: ["validate_struggle"],
          followUpSuggestions: [
            "What's making it feel particularly difficult today?",
          ],
        },
        medium: {
          content:
            "It takes courage to acknowledge when things are difficult. I want you to know that struggling doesn't define your worth.",
          supportiveElements: ["courage", "worth_affirmation"],
          recommendedActions: ["separate_struggle_from_identity"],
          followUpSuggestions: [
            "What's one small thing that might bring you a moment of peace?",
          ],
        },
        high: {
          content:
            "I can hear how much pain you're in, and I want you to know that your feelings are completely valid. You don't have to carry this burden alone.",
          supportiveElements: ["pain_recognition", "validation"],
          recommendedActions: ["share_burden"],
          followUpSuggestions: [
            "Is there anyone in your life who supports you?",
          ],
        },
      },
      general: {
        low: {
          content:
            "I'm here to listen to whatever you'd like to share. What's been on your mind?",
          supportiveElements: ["availability", "openness"],
          recommendedActions: ["open_conversation"],
          followUpSuggestions: ["How are you doing today?"],
        },
        medium: {
          content:
            "Thank you for being here. I want to understand how you're feeling. What would be helpful to talk about?",
          supportiveElements: ["gratitude", "understanding"],
          recommendedActions: ["explore_feelings"],
          followUpSuggestions: ["What's been weighing on you lately?"],
        },
        high: {
          content:
            "I'm really glad you're here, and I want you to know that you're safe to share anything with me. What's going on?",
          supportiveElements: ["safety", "welcome"],
          recommendedActions: ["create_safe_space"],
          followUpSuggestions: [
            "What feels most important to talk about right now?",
          ],
        },
      },
    };
  }

  private getContextualFallback(situation: FallbackSituation): string {
    const fallbacks = {
      parsing_failed:
        "I want to make sure I understand you correctly. Can you tell me more about how you're feeling?",
      connection_error:
        "I'm having some technical difficulties, but I'm still here for you. What's on your mind?",
      default:
        "I'm here to listen and support you. How are you doing right now?",
    };
    return fallbacks[situation] || fallbacks.default;
  }

  // --- User Input Analysis Methods ---

  async analyzeUserInput(text: string): Promise<AnalysisResult> {
    const linguisticAnalysis = this.performLinguisticAnalysis(text);
    const keywordAnalysis = this.performKeywordAnalysis(text);

    // Using fallback analysis for now as the AI analysis part is out of scope of the current issue.
    // In a real scenario, you might call another AI model here for analysis.
    return this.getFallbackAnalysis(text, linguisticAnalysis, keywordAnalysis);
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
      "can't",
      "won't",
      "don't",
    ];

    const firstPersonCount = words.filter((word) =>
      firstPersonPronouns.includes(word.replace(/[^\w]/g, "")),
    ).length;

    const negationCount = words.filter((word) =>
      negationWords.some((neg) => word.includes(neg)),
    ).length;

    const avgWordsPerSentence =
      sentences.length > 0 ? words.length / sentences.length : 0;
    const sentenceComplexity =
      avgWordsPerSentence > 15
        ? "complex"
        : avgWordsPerSentence > 8
          ? "moderate"
          : "simple";

    return {
      firstPersonCount,
      negationCount,
      intensifierCount: 0,
      sentenceComplexity,
      emotionalIntensity: "moderate",
      wordCount: words.length,
      sentenceCount: sentences.length,
    };
  }

  private performKeywordAnalysis(text: string): KeywordAnalysisResult {
    const lowerText = text.toLowerCase();
    const depressionKeywords = [
      "sad",
      "depressed",
      "hopeless",
      "worthless",
      "empty",
      "lonely",
      "tired",
    ];
    const positiveKeywords = [
      "happy",
      "good",
      "great",
      "better",
      "excited",
      "hopeful",
    ];

    const foundDepression = depressionKeywords.filter((k) =>
      lowerText.includes(k),
    );
    const foundPositive = positiveKeywords.filter((k) => lowerText.includes(k));

    return {
      depressionKeywords: foundDepression,
      positiveKeywords: foundPositive,
      riskKeywords: [],
    };
  }

  private getFallbackAnalysis(
    text: string,
    linguisticAnalysis: LinguisticAnalysisResult,
    keywordAnalysis: KeywordAnalysisResult,
  ): AnalysisResult {
    const totalScore =
      keywordAnalysis.depressionKeywords.length -
      keywordAnalysis.positiveKeywords.length;
    let sentiment: "positive" | "neutral" | "concerning" | "negative" =
      "neutral";
    let riskLevel: "low" | "medium" | "high" = "low";

    if (totalScore > 2) {
      sentiment = "negative";
      riskLevel = "high";
    } else if (totalScore > 0) {
      sentiment = "concerning";
      riskLevel = "medium";
    } else if (totalScore < -1) {
      sentiment = "positive";
    }

    return {
      sentiment,
      riskLevel,
      confidence: 0.6,
      score: totalScore,
      keywords: [
        ...keywordAnalysis.depressionKeywords,
        ...keywordAnalysis.positiveKeywords,
      ],
      linguisticPatterns: {
        firstPersonCount: linguisticAnalysis.firstPersonCount,
        negationCount: linguisticAnalysis.negationCount,
        depressionKeywords: keywordAnalysis.depressionKeywords,
        positiveKeywords: keywordAnalysis.positiveKeywords,
        sentenceComplexity: linguisticAnalysis.sentenceComplexity,
        emotionalIntensity: linguisticAnalysis.emotionalIntensity,
      },
    };
  }
}
