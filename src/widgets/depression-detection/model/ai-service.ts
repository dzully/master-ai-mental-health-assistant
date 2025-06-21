import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  AnalysisResult,
  AIResponse,
  LinguisticAnalysisResult,
  KeywordAnalysisResult,
} from "./types";
import { mlClusteringService } from "./ml-clustering-service";

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

// Real clinical depression indicators based on DSM-5 and validated research
const DEPRESSION_INDICATORS = {
  // Cognitive indicators - validated markers from clinical literature
  cognitive: [
    "worthless",
    "hopeless",
    "helpless",
    "useless",
    "failure",
    "burden",
    "stupid",
    "incompetent",
    "inadequate",
    "guilty",
    "ashamed",
    "defeated",
    "trapped",
    "stuck",
    "can't cope",
    "overwhelmed",
    "pointless",
    "meaningless",
  ],

  // Emotional indicators - clinical emotional markers
  emotional: [
    "sad",
    "depressed",
    "down",
    "blue",
    "miserable",
    "empty",
    "numb",
    "lonely",
    "isolated",
    "abandoned",
    "rejected",
    "unloved",
    "disconnected",
    "anxious",
    "worried",
    "fearful",
    "panicked",
    "stressed",
    "tense",
  ],

  // Behavioral indicators - observable behavior changes
  behavioral: [
    "can't sleep",
    "insomnia",
    "sleeping too much",
    "tired",
    "exhausted",
    "withdrawn",
    "isolating",
    "avoiding",
    "procrastinating",
    "unmotivated",
    "lost interest",
    "can't concentrate",
    "forgetful",
    "indecisive",
    "crying",
    "irritable",
    "angry",
    "restless",
    "agitated",
  ],

  // Somatic indicators - physical symptoms
  somatic: [
    "headache",
    "fatigue",
    "weakness",
    "dizzy",
    "nauseous",
    "appetite",
    "weight loss",
    "weight gain",
    "aches",
    "pains",
    "chest pain",
    "shortness of breath",
    "stomach problems",
    "digestive issues",
  ],

  // Suicidal ideation - crisis indicators (requires immediate attention)
  suicidal: [
    "want to die",
    "kill myself",
    "end it all",
    "suicide",
    "not worth living",
    "better off dead",
    "disappear",
    "give up",
    "can't go on",
    "end the pain",
    "hurt myself",
    "self harm",
    "cutting",
    "overdose",
  ],
};

// PHQ-9 Depression Questionnaire criteria for automated assessment
// Based on "Patient Health Questionnaire-9" - most validated depression screening tool
const PHQ9_CRITERIA = {
  // Over the last 2 weeks, how often have you been bothered by...
  symptoms: [
    {
      id: 1,
      criterion: "Little interest or pleasure in doing things",
      keywords: [
        "no interest",
        "no pleasure",
        "don't enjoy",
        "lost interest",
        "unmotivated",
        "apathetic",
      ],
    },
    {
      id: 2,
      criterion: "Feeling down, depressed, or hopeless",
      keywords: [
        "depressed",
        "down",
        "sad",
        "hopeless",
        "blue",
        "miserable",
        "despair",
      ],
    },
    {
      id: 3,
      criterion: "Trouble falling or staying asleep, or sleeping too much",
      keywords: [
        "can't sleep",
        "insomnia",
        "wake up",
        "sleeping too much",
        "tired",
        "sleep problems",
      ],
    },
    {
      id: 4,
      criterion: "Feeling tired or having little energy",
      keywords: [
        "tired",
        "exhausted",
        "fatigue",
        "no energy",
        "drained",
        "worn out",
      ],
    },
    {
      id: 5,
      criterion: "Poor appetite or overeating",
      keywords: [
        "no appetite",
        "not eating",
        "overeating",
        "weight loss",
        "weight gain",
        "food",
      ],
    },
    {
      id: 6,
      criterion: "Feeling bad about yourself or that you are a failure",
      keywords: [
        "failure",
        "worthless",
        "disappointed",
        "let down",
        "not good enough",
        "hate myself",
      ],
    },
    {
      id: 7,
      criterion: "Trouble concentrating on things",
      keywords: [
        "can't concentrate",
        "can't focus",
        "distracted",
        "forgetful",
        "mind blank",
        "confused",
      ],
    },
    {
      id: 8,
      criterion: "Moving or speaking slowly, or being fidgety/restless",
      keywords: [
        "slow",
        "sluggish",
        "restless",
        "fidgety",
        "agitated",
        "can't sit still",
      ],
    },
    {
      id: 9,
      criterion: "Thoughts of being better off dead or hurting yourself",
      keywords: [
        "better off dead",
        "hurt myself",
        "kill myself",
        "suicide",
        "self harm",
        "end it all",
      ],
    },
  ],

  // Scoring: 0-4 (not at all, several days, more than half, nearly every day)
  // Total: 0-27 points
  severityLevels: {
    minimal: { range: [0, 4], description: "Minimal depression" },
    mild: { range: [5, 9], description: "Mild depression" },
    moderate: { range: [10, 14], description: "Moderate depression" },
    moderatelySevere: {
      range: [15, 19],
      description: "Moderately severe depression",
    },
    severe: { range: [20, 27], description: "Severe depression" },
  },
};

// Evidence-based therapeutic interventions based on clinical guidelines
const THERAPEUTIC_INTERVENTIONS = {
  low: {
    primaryApproach: "Supportive counseling and psychoeducation",
    techniques: [
      "Active listening and validation",
      "Psychoeducation about depression",
      "Behavioral activation strategies",
      "Sleep hygiene education",
      "Stress management techniques",
    ],
    interventions: [
      "Daily mood tracking",
      "Pleasant activity scheduling",
      "Social connection encouragement",
      "Exercise recommendations",
      "Mindfulness practices",
    ],
    copingStrategies: [
      "Deep breathing exercises",
      "Progressive muscle relaxation",
      "Journaling thoughts and feelings",
      "Establishing daily routines",
      "Gratitude practices",
    ],
  },

  medium: {
    primaryApproach: "Cognitive Behavioral Therapy (CBT) techniques",
    techniques: [
      "Cognitive restructuring",
      "Thought challenging exercises",
      "Problem-solving therapy",
      "Mindfulness-based interventions",
      "Interpersonal therapy techniques",
    ],
    interventions: [
      "Professional mental health referral",
      "Structured activity scheduling",
      "Social support assessment",
      "Safety planning discussion",
      "Medication evaluation consideration",
    ],
    copingStrategies: [
      "Thought record keeping",
      "Behavioral experiments",
      "Grounding techniques (5-4-3-2-1)",
      "Progressive goal setting",
      "Social skills practice",
    ],
  },

  high: {
    primaryApproach: "Crisis intervention and immediate safety planning",
    techniques: [
      "Suicide risk assessment",
      "Crisis de-escalation",
      "Safety planning intervention",
      "Emergency resource activation",
      "Immediate professional consultation",
    ],
    interventions: [
      "Immediate professional intervention required",
      "Emergency services contact if needed",
      "24/7 crisis hotline referral",
      "Family/support system notification",
      "Follow-up safety checks",
    ],
    copingStrategies: [
      "Crisis hotline numbers readily available",
      "Remove means of self-harm",
      "Stay with trusted person",
      "Emergency room if immediate danger",
      "Crisis text lines and apps",
    ],
  },
};

// Real crisis resources - validated emergency contacts
// const CRISIS_RESOURCES = {
//   immediate: {
//     "National Suicide Prevention Lifeline": "988",
//     "Crisis Text Line": "Text HOME to 741741",
//     "Emergency Services": "911",
//     "National Domestic Violence Hotline": "1-800-799-7233"
//   },

//   professional: {
//     "Psychology Today Therapist Finder": "psychologytoday.com/us/therapists",
//     "SAMHSA Treatment Locator": "findtreatment.samhsa.gov",
//     "National Alliance on Mental Illness": "nami.org",
//     "Mental Health America": "mhanational.org"
//   },

//   selfHelp: {
//     "MindShift App": "Free anxiety and depression app",
//     "Headspace": "Meditation and mindfulness",
//     "7 Cups": "Free emotional support",
//     "NAMI Peer Support Groups": "Local peer support meetings"
//   }
// };

/**
 * AIService orchestrates the interaction with the generative AI model,
 * including response generation, user input analysis, and fallback mechanisms.
 */
export class AIService {
  private model = google("models/gemini-2.0-flash-exp");
  private responseCount = 0;
  private isInitialized = false;

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
      `You are Dr. Siti, a warm and empathetic Malaysian mental health professional who understands local culture and speaks like a caring friend. You're knowledgeable about both Western psychology and Asian cultural values, using accessible language while offering culturally-sensitive insights.`,
      `You are Ahmad, a friendly Malaysian counselor who combines professional expertise with a relaxed, approachable style. You understand the multicultural Malaysian context and talk like someone who genuinely cares about respecting cultural diversity and family values.`,
      `You are Li Wei, a supportive Malaysian mental health expert who feels like a wise friend from the community. You're understanding of cultural pressures, use everyday language, and always have practical advice that respects Malaysian values and customs.`,
      `You are Priya, a compassionate Malaysian therapist who believes in people's strength while understanding the importance of family and community in Malaysian culture. You talk casually but with deep cultural insight, like a trusted friend who understands local challenges.`,
    ];
    const selectedPersonality =
      personalities[this.responseCount % personalities.length];

    return `${selectedPersonality}
User message: "${userMessage}"
Context: ${context}
Risk level detected: ${analysisResult.riskLevel}
Recent conversation: ${conversationHistory.slice(-3).join(" | ")}

Respond like a caring Malaysian friend who happens to be a mental health expert. Your response should be:
- 4-5 sentences in a warm, conversational tone like talking to a close friend in the Malaysian context.
- Use casual, everyday language that resonates with Malaysian culture - avoid overly clinical or formal terms.
- Show understanding of Malaysian cultural values including family respect, community support, and cultural diversity.
- Be sensitive to potential cultural stigma around mental health in Malaysian society.
- FOCUS ON PROVIDING PRACTICAL SOLUTIONS, ADVICE, AND ACTIONABLE STEPS that work within Malaysian cultural context.
- Consider family dynamics, work-life balance, and cultural expectations common in Malaysia.
- Suggest culturally appropriate coping strategies that respect Malaysian values.
- Only ask a question if you genuinely need more information to provide better help.
- Sound like a real Malaysian who genuinely cares and understands local challenges.

Generate the response in this EXACT JSON format (ensure all quotes are properly escaped):
{
  "content": "Your friendly, culturally-aware response with practical advice suited for Malaysian context.",
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
            "Selamat sejahtera! I'm really glad you're here today. Whether you prefer to chat in English or Bahasa Malaysia, this is your safe space. Apa khabar? How are you feeling?",
          supportiveElements: ["warmth", "welcoming", "cultural_inclusivity"],
          recommendedActions: ["open_dialogue"],
          followUpSuggestions: [
            "What's been on your mind lately? Apa yang anda fikirkan?",
          ],
        },
        medium: {
          content:
            "Hello there. Terima kasih for reaching out - I know discussing feelings can sometimes feel challenging in our Malaysian culture. I'm here to listen without judgment. What would you like to share?",
          supportiveElements: [
            "presence",
            "cultural_sensitivity",
            "availability",
          ],
          recommendedActions: ["gentle_exploration"],
          followUpSuggestions: ["How has your day been? Bagaimana hari anda?"],
        },
        high: {
          content:
            "Hello, I'm here for you. It takes real courage to reach out, especially when mental health topics can feel stigmatized in our society. You're not alone in this journey.",
          supportiveElements: [
            "validation",
            "courage_recognition",
            "anti_stigma",
          ],
          recommendedActions: ["immediate_support"],
          followUpSuggestions: [
            "What's feeling most difficult right now? Apa yang paling susah untuk anda sekarang?",
          ],
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
            "I hear you saying this is hard for you. Life pressures, whether from work, family expectations, or personal challenges, can feel overwhelming - and that's completely understandable in our fast-paced Malaysian society.",
          supportiveElements: ["hearing", "normalization", "cultural_context"],
          recommendedActions: ["validate_struggle"],
          followUpSuggestions: [
            "What's making it feel particularly difficult today? Apa yang buat anda rasa susah?",
          ],
        },
        medium: {
          content:
            "It takes courage to acknowledge when things are difficult, especially when there might be pressure to 'be strong' for family or cultural expectations. I want you to know that struggling doesn't define your worth.",
          supportiveElements: [
            "courage",
            "worth_affirmation",
            "cultural_pressure_awareness",
          ],
          recommendedActions: ["separate_struggle_from_identity"],
          followUpSuggestions: [
            "What's one small thing that might bring you a moment of peace? Maybe something that connects you to your roots or culture?",
          ],
        },
        high: {
          content:
            "I can hear how much pain you're in, and I want you to know that your feelings are completely valid. Even if cultural or family expectations make it hard to express vulnerability, you don't have to carry this burden alone.",
          supportiveElements: [
            "pain_recognition",
            "validation",
            "cultural_validation",
          ],
          recommendedActions: ["share_burden"],
          followUpSuggestions: [
            "Is there anyone in your life who supports you? Adakah ada orang yang boleh tolong anda?",
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
        "Maaf, saya nak pastikan saya faham betul. Can you tell me more about how you're feeling? You can share in English or Bahasa Malaysia - whatever feels more comfortable.",
      connection_error:
        "I'm having some technical difficulties, but I'm still here for you. Saya masih ada untuk anda. What's on your mind?",
      default:
        "I'm here to listen and support you. Saya di sini untuk dengar dan sokong anda. How are you doing right now?",
    };
    return fallbacks[situation] || fallbacks.default;
  }

  // --- User Input Analysis Methods ---

  async analyzeUserInput(text: string): Promise<AnalysisResult> {
    // Initialize ML clustering model if not already done
    await this.ensureInitialized();

    const linguisticAnalysis = this.performLinguisticAnalysis(text);
    const keywordAnalysis = this.performKeywordAnalysis(text);

    // Generate base analysis using enhanced fallback method
    const baseAnalysis = this.getFallbackAnalysis(
      text,
      linguisticAnalysis,
      keywordAnalysis,
    );

    // Integrate ML clustering if model is available
    try {
      const clusterAssignment =
        await mlClusteringService.assignToCluster(baseAnalysis);

      if (clusterAssignment) {
        // Enhanced analysis with k-means clustering results
        const phq9Estimation =
          mlClusteringService.estimatePHQ9FromCluster(clusterAssignment);
        const therapeuticRecommendations =
          mlClusteringService.generateTherapeuticRecommendations(
            clusterAssignment,
          );

        // Get cluster-based risk level
        const clusters = mlClusteringService.getCurrentClusters();
        const assignedCluster = clusters[clusterAssignment.clusterId];
        const clusterRiskLevel =
          assignedCluster?.riskLevel || baseAnalysis.riskLevel;

        // Use cluster risk level if confidence is high enough, otherwise blend with base analysis
        const finalRiskLevel =
          clusterAssignment.confidence > 0.7
            ? clusterRiskLevel
            : this.blendRiskLevels(baseAnalysis.riskLevel, clusterRiskLevel);

        // Update sentiment based on risk level
        const finalSentiment = this.getSentimentFromRiskLevel(
          finalRiskLevel,
          baseAnalysis.sentiment,
        );

        // Debug logging for ML clustering
        console.log("🧠 ML Clustering Debug:", {
          baseRisk: baseAnalysis.riskLevel,
          clusterRisk: clusterRiskLevel,
          clusterConfidence: clusterAssignment.confidence,
          finalRisk: finalRiskLevel,
          clusterId: clusterAssignment.clusterId,
        });

        return {
          ...baseAnalysis,
          riskLevel: finalRiskLevel,
          sentiment: finalSentiment,
          clusterAssignment,
          phq9Estimation,
          therapeuticRecommendations,
          clinicalIndicators: {
            ...baseAnalysis.clinicalIndicators,
            phq9Score: phq9Estimation.totalScore,
            severityLevel: phq9Estimation.severityCategory,
            diagnosticConfidence: phq9Estimation.confidenceLevel,
            recommendedInterventions: therapeuticRecommendations.interventions,
          },
          confidence: Math.max(
            baseAnalysis.confidence,
            clusterAssignment.confidence,
          ),
        };
      }
    } catch (error) {
      console.error("ML clustering assignment failed:", error);
    }

    return baseAnalysis;
  }

  private performLinguisticAnalysis(text: string): LinguisticAnalysisResult {
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    // Research-validated linguistic markers for depression
    const firstPersonPronouns = ["i", "me", "my", "myself", "mine"];
    const negationWords = [
      "not",
      "no",
      "never",
      "nothing",
      "can't",
      "won't",
      "don't",
      "couldn't",
      "wouldn't",
      "shouldn't",
    ];
    const absolutistWords = [
      "always",
      "never",
      "completely",
      "totally",
      "entirely",
      "absolutely",
      "forever",
      "constantly",
    ];
    const intensifiers = [
      "very",
      "extremely",
      "really",
      "so",
      "too",
      "quite",
      "rather",
      "incredibly",
      "tremendously",
    ];

    // Count linguistic markers
    const firstPersonCount = words.filter((word) =>
      firstPersonPronouns.includes(word.replace(/[^\w]/g, "")),
    ).length;

    const negationCount = words.filter((word) =>
      negationWords.includes(word.replace(/[^\w]/g, "")),
    ).length;

    const absolutistCount = words.filter((word) =>
      absolutistWords.includes(word.replace(/[^\w]/g, "")),
    ).length;

    const intensifierCount = words.filter((word) =>
      intensifiers.includes(word.replace(/[^\w]/g, "")),
    ).length;

    // Calculate sentence complexity (research shows simpler sentences in depression)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const sentenceComplexity =
      avgWordsPerSentence > 15
        ? "complex"
        : avgWordsPerSentence > 10
          ? "moderate"
          : "simple";

    // Emotional intensity based on linguistic markers
    const emotionalIntensityScore =
      (intensifierCount + absolutistCount) / words.length;
    const emotionalIntensity =
      emotionalIntensityScore > 0.05
        ? "high"
        : emotionalIntensityScore > 0.02
          ? "moderate"
          : "low";

    return {
      firstPersonCount,
      negationCount,
      intensifierCount: absolutistCount + intensifierCount,
      sentenceComplexity,
      emotionalIntensity,
      wordCount: words.length,
      sentenceCount: sentences.length,
    };
  }

  private performKeywordAnalysis(text: string): KeywordAnalysisResult {
    const lowerText = text.toLowerCase();

    // Extract depression-related keywords using clinical indicators
    const depressionKeywords: string[] = [];
    const positiveKeywords: string[] = [];
    const riskKeywords: string[] = [];

    // Check all depression indicator categories
    Object.values(DEPRESSION_INDICATORS)
      .flat()
      .forEach((keyword) => {
        if (lowerText.includes(keyword.toLowerCase())) {
          depressionKeywords.push(keyword);

          // Flag high-risk suicidal keywords
          if (DEPRESSION_INDICATORS.suicidal.includes(keyword)) {
            riskKeywords.push(keyword);
          }
        }
      });

    // Positive indicators (protective factors)
    const positiveIndicators = [
      "happy",
      "joy",
      "grateful",
      "thankful",
      "blessed",
      "excited",
      "hopeful",
      "confident",
      "proud",
      "accomplished",
      "successful",
      "loved",
      "supported",
      "motivated",
      "energetic",
      "peaceful",
      "calm",
      "relaxed",
      "content",
      "optimistic",
      "positive",
      "cheerful",
      "upbeat",
      "encouraged",
    ];

    positiveIndicators.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        positiveKeywords.push(keyword);
      }
    });

    return {
      depressionKeywords,
      positiveKeywords,
      riskKeywords,
    };
  }

  // Calculate PHQ-9 score based on user input
  private calculatePHQ9Score(text: string): number {
    let score = 0;
    const lowerText = text.toLowerCase();

    PHQ9_CRITERIA.symptoms.forEach((symptom) => {
      const matchedKeywords = symptom.keywords.filter((keyword) =>
        lowerText.includes(keyword.toLowerCase()),
      );

      if (matchedKeywords.length > 0) {
        // Estimate severity based on language intensity
        if (
          lowerText.includes("every day") ||
          lowerText.includes("always") ||
          lowerText.includes("constantly")
        ) {
          score += 3; // Nearly every day
        } else if (
          lowerText.includes("often") ||
          lowerText.includes("usually") ||
          lowerText.includes("most")
        ) {
          score += 2; // More than half the days
        } else if (
          lowerText.includes("sometimes") ||
          lowerText.includes("few")
        ) {
          score += 1; // Several days
        } else {
          score += 1; // Default for any mention
        }
      }
    });

    return Math.min(score, 27); // Cap at maximum PHQ-9 score
  }

  private getFallbackAnalysis(
    text: string,
    linguisticAnalysis: LinguisticAnalysisResult,
    keywordAnalysis: KeywordAnalysisResult,
  ): AnalysisResult {
    // Evidence-based scoring algorithm
    let score = 0;
    let riskLevel: "low" | "medium" | "high" = "low";
    let sentiment: "positive" | "neutral" | "concerning" | "negative" =
      "neutral";

    // Calculate PHQ-9 estimated score
    const phq9Score = this.calculatePHQ9Score(text);

    // Score based on linguistic patterns (research-validated weights)
    score += linguisticAnalysis.firstPersonCount * 0.5; // High first-person usage indicator
    score += linguisticAnalysis.negationCount * 1.0; // Negative language strong indicator
    score += keywordAnalysis.depressionKeywords.length * 2.0; // Depression keywords weighted heavily
    score -= keywordAnalysis.positiveKeywords.length * 1.5; // Positive keywords protective

    // Additional contextual scoring for specific phrases
    const lowerText = text.toLowerCase();

    // High-risk phrases (immediate elevation)
    const highRiskPhrases = [
      "feel like dying",
      "want to die",
      "end it all",
      "can't go on",
      "nothing matters",
      "give up",
      "hopeless",
      "worthless",
      "burden",
      "tired of living",
      "no point",
      "can't cope",
    ];

    // Medium-risk phrases
    const mediumRiskPhrases = [
      "feeling down",
      "very sad",
      "can't sleep",
      "no energy",
      "anxious",
      "overwhelmed",
      "stressed out",
      "difficult time",
      "struggling",
    ];

    // Check for high-risk phrases
    highRiskPhrases.forEach((phrase) => {
      if (lowerText.includes(phrase)) {
        score += 5; // Significant elevation
      }
    });

    // Check for medium-risk phrases
    mediumRiskPhrases.forEach((phrase) => {
      if (lowerText.includes(phrase)) {
        score += 1.5; // Moderate elevation
      }
    });

    // Risk assessment based on suicidal ideation
    if (keywordAnalysis.riskKeywords.length > 0) {
      score += 10; // Immediate elevation for suicidal content
      riskLevel = "high";
      sentiment = "concerning";
    }

    // Enhanced risk level determination with more sensitive thresholds
    if (riskLevel !== "high") {
      // Higher sensitivity for depression detection
      if (
        phq9Score >= 15 ||
        score >= 7 ||
        keywordAnalysis.depressionKeywords.length >= 4
      ) {
        riskLevel = "high";
        sentiment = "concerning";
      } else if (
        phq9Score >= 10 ||
        score >= 3.5 ||
        keywordAnalysis.depressionKeywords.length >= 2
      ) {
        riskLevel = "medium";
        sentiment = "negative";
      } else if (
        phq9Score >= 5 ||
        score >= 1.5 ||
        keywordAnalysis.depressionKeywords.length >= 1
      ) {
        riskLevel = "low";
        sentiment =
          keywordAnalysis.positiveKeywords.length >
          keywordAnalysis.depressionKeywords.length
            ? "neutral"
            : "negative";
      } else {
        riskLevel = "low";
        sentiment =
          keywordAnalysis.positiveKeywords.length > 0 ? "positive" : "neutral";
      }
    }

    // Debug logging to understand what's happening
    console.log("🔍 Risk Analysis Debug:", {
      text: text.substring(0, 50) + "...",
      phq9Score,
      score,
      depressionKeywords: keywordAnalysis.depressionKeywords,
      positiveKeywords: keywordAnalysis.positiveKeywords,
      riskKeywords: keywordAnalysis.riskKeywords,
      finalRiskLevel: riskLevel,
      finalSentiment: sentiment,
    });

    // Calculate confidence based on available indicators
    const totalIndicators =
      keywordAnalysis.depressionKeywords.length +
      keywordAnalysis.positiveKeywords.length +
      keywordAnalysis.riskKeywords.length +
      (linguisticAnalysis.firstPersonCount > 3 ? 1 : 0) +
      (linguisticAnalysis.negationCount > 2 ? 1 : 0);

    const confidence = Math.min(0.95, 0.6 + totalIndicators * 0.05);

    return {
      sentiment,
      riskLevel,
      confidence,
      score,
      keywords: keywordAnalysis.depressionKeywords,
      clinicalIndicators: {
        phq9Score,
        symptomClusters: this.identifySymptomClusters(
          keywordAnalysis.depressionKeywords,
        ),
        riskFactors: keywordAnalysis.riskKeywords,
        protectiveFactors: keywordAnalysis.positiveKeywords,
      },
      linguisticPatterns: {
        firstPersonCount: linguisticAnalysis.firstPersonCount,
        negationCount: linguisticAnalysis.negationCount,
        depressionKeywords: keywordAnalysis.depressionKeywords,
        positiveKeywords: keywordAnalysis.positiveKeywords,
        sentenceComplexity: linguisticAnalysis.sentenceComplexity,
        emotionalIntensity: linguisticAnalysis.emotionalIntensity,
      },
      therapeuticRecommendations: {
        primaryApproach: THERAPEUTIC_INTERVENTIONS[riskLevel].primaryApproach,
        interventions: THERAPEUTIC_INTERVENTIONS[riskLevel].interventions,
        urgency: riskLevel,
      },
    };
  }

  private identifySymptomClusters(keywords: string[]): string[] {
    const clusters: string[] = [];

    const cognitiveSymptoms = DEPRESSION_INDICATORS.cognitive.filter((k) =>
      keywords.includes(k),
    );
    const emotionalSymptoms = DEPRESSION_INDICATORS.emotional.filter((k) =>
      keywords.includes(k),
    );
    const behavioralSymptoms = DEPRESSION_INDICATORS.behavioral.filter((k) =>
      keywords.includes(k),
    );
    const somaticSymptoms = DEPRESSION_INDICATORS.somatic.filter((k) =>
      keywords.includes(k),
    );

    if (cognitiveSymptoms.length >= 2) clusters.push("Cognitive symptoms");
    if (emotionalSymptoms.length >= 2) clusters.push("Emotional symptoms");
    if (behavioralSymptoms.length >= 2) clusters.push("Behavioral symptoms");
    if (somaticSymptoms.length >= 1) clusters.push("Somatic symptoms");

    return clusters;
  }

  private blendRiskLevels(
    baseRisk: "low" | "medium" | "high",
    clusterRisk: "low" | "medium" | "high",
  ): "low" | "medium" | "high" {
    const riskScores = { low: 1, medium: 2, high: 3 };
    const baseScore = riskScores[baseRisk];
    const clusterScore = riskScores[clusterRisk];

    // Weighted average (70% cluster, 30% base analysis)
    const blendedScore = clusterScore * 0.7 + baseScore * 0.3;

    if (blendedScore >= 2.5) return "high";
    if (blendedScore >= 1.5) return "medium";
    return "low";
  }

  private getSentimentFromRiskLevel(
    riskLevel: "low" | "medium" | "high",
    baseSentiment: "positive" | "neutral" | "concerning" | "negative",
  ): "positive" | "neutral" | "concerning" | "negative" {
    // Risk level should influence sentiment
    switch (riskLevel) {
      case "high":
        return "concerning";
      case "medium":
        return baseSentiment === "positive" ? "neutral" : "negative";
      case "low":
        return baseSentiment;
      default:
        return baseSentiment;
    }
  }

  /**
   * Ensures the ML clustering model is initialized with sample data
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await mlClusteringService.initializeWithSampleData();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize ML clustering:", error);
      // Continue without clustering
    }
  }
}
