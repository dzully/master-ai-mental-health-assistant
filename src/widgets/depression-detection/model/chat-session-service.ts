import { localStorageService } from "@/shared/lib/local-storage";
import {
  ChatSession,
  ChatSessionMetadata,
  Message,
  UserProfile,
  SessionSummary,
} from "./types";

class ChatSessionService {
  private static instance: ChatSessionService;
  private readonly SESSIONS_KEY = "depression_chat_sessions";
  private readonly ACTIVE_SESSION_KEY = "active_session_id";
  private readonly MAX_SESSIONS = 50;

  public static getInstance(): ChatSessionService {
    if (!ChatSessionService.instance) {
      ChatSessionService.instance = new ChatSessionService();
    }
    return ChatSessionService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateSessionTitle(messages: Message[]): string {
    const userMessages = messages.filter((msg) => msg.type === "user");
    if (userMessages.length === 0) return "New Conversation";

    const firstUserMessage = userMessages[0].content;
    const words = firstUserMessage.split(" ").slice(0, 6).join(" ");
    return words.length > 30
      ? `${words.substring(0, 30)}...`
      : words || "New Conversation";
  }

  private calculateSessionSummary(session: ChatSession): SessionSummary {
    const { messages, createdAt, updatedAt } = session;
    const userMessages = messages.filter((msg) => msg.type === "user");
    const botMessages = messages.filter((msg) => msg.type === "bot");

    const riskLevels = botMessages
      .map((msg) => msg.riskLevel)
      .filter(
        (level): level is "low" | "medium" | "high" => level !== undefined,
      );

    const sentiments = botMessages
      .map((msg) => msg.sentiment)
      .filter(
        (
          sentiment,
        ): sentiment is "positive" | "neutral" | "concerning" | "negative" =>
          sentiment !== undefined,
      );

    const averageRiskLevel = this.calculateAverageRiskLevel(riskLevels);
    const dominantSentiment = this.calculateDominantSentiment(sentiments);
    const keyTopics = this.extractKeyTopics(userMessages);
    const sessionDuration = updatedAt.getTime() - createdAt.getTime();
    const lastMessage =
      messages[messages.length - 1]?.content.substring(0, 100) || "";

    return {
      messageCount: messages.length,
      averageRiskLevel,
      dominantSentiment,
      keyTopics,
      sessionDuration,
      lastMessage,
    };
  }

  private calculateAverageRiskLevel(
    riskLevels: ("low" | "medium" | "high")[],
  ): "low" | "medium" | "high" {
    if (riskLevels.length === 0) return "low";

    const riskScores = riskLevels.map((level) => {
      switch (level) {
        case "high":
          return 3;
        case "medium":
          return 2;
        case "low":
          return 1;
        default:
          return 1;
      }
    });

    const average =
      riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;

    if (average >= 2.5) return "high";
    if (average >= 1.5) return "medium";
    return "low";
  }

  private calculateDominantSentiment(
    sentiments: ("positive" | "neutral" | "concerning" | "negative")[],
  ): "positive" | "neutral" | "concerning" | "negative" {
    if (sentiments.length === 0) return "neutral";

    const counts = sentiments.reduce(
      (acc, sentiment) => {
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).reduce((a, b) =>
      counts[a[0]] > counts[b[0]] ? a : b,
    )[0] as "positive" | "neutral" | "concerning" | "negative";
  }

  private extractKeyTopics(userMessages: Message[]): string[] {
    // Clinical topic categories based on validated mental health assessments
    // These align with DSM-5 criteria and common therapeutic themes
    const clinicalTopics = {
      // Mood and emotional state
      mood: [
        "mood",
        "feeling",
        "emotion",
        "sad",
        "happy",
        "angry",
        "frustrated",
        "upset",
        "down",
        "blue",
      ],

      // Anxiety and stress
      anxiety: [
        "anxiety",
        "anxious",
        "worried",
        "stress",
        "stressed",
        "panic",
        "nervous",
        "tense",
        "overwhelmed",
      ],

      // Sleep and energy
      sleep: [
        "sleep",
        "tired",
        "exhausted",
        "insomnia",
        "fatigue",
        "energy",
        "rest",
        "wake",
        "sleeping",
      ],

      // Relationships and social
      relationships: [
        "family",
        "friends",
        "relationship",
        "partner",
        "spouse",
        "children",
        "parents",
        "social",
        "alone",
        "lonely",
        "isolated",
      ],

      // Work and achievement
      work: [
        "work",
        "job",
        "career",
        "school",
        "performance",
        "achievement",
        "success",
        "failure",
        "productivity",
      ],

      // Physical health
      health: [
        "health",
        "pain",
        "sick",
        "illness",
        "medication",
        "doctor",
        "physical",
        "body",
        "symptoms",
      ],

      // Coping and behavior
      coping: [
        "coping",
        "managing",
        "dealing",
        "handling",
        "struggle",
        "difficulty",
        "challenge",
        "problem",
      ],

      // Self-worth and identity
      identity: [
        "self",
        "identity",
        "worth",
        "value",
        "confidence",
        "self-esteem",
        "purpose",
        "meaning",
      ],

      // Crisis indicators
      crisis: [
        "suicide",
        "death",
        "dying",
        "hurt",
        "harm",
        "end",
        "give up",
        "hopeless",
        "trapped",
      ],

      // Substance use
      substance: [
        "alcohol",
        "drinking",
        "drugs",
        "substance",
        "medication",
        "pills",
        "smoking",
      ],
    };

    const foundTopics = new Set<string>();
    const allText = userMessages
      .map((msg) => msg.content.toLowerCase())
      .join(" ");

    // Analyze message content for clinical topics
    Object.entries(clinicalTopics).forEach(([category, keywords]) => {
      const matchCount = keywords.filter((keyword) =>
        allText.includes(keyword.toLowerCase()),
      ).length;

      // Add topic if multiple keywords match (indicates genuine topic discussion)
      if (matchCount >= 2 || (category === "crisis" && matchCount >= 1)) {
        foundTopics.add(category);
      }
    });

    // Add specific high-frequency keywords as topics
    const specificKeywords = [
      "depression",
      "therapy",
      "counseling",
      "treatment",
      "support",
    ];
    specificKeywords.forEach((keyword) => {
      if (allText.includes(keyword)) {
        foundTopics.add(keyword);
      }
    });

    return Array.from(foundTopics).slice(0, 6); // Limit to most relevant topics
  }

  public createSession(userProfile: UserProfile): ChatSession {
    const now = new Date();
    const session: ChatSession = {
      id: this.generateSessionId(),
      title: "New Conversation",
      messages: [
        {
          id: 1,
          type: "bot",
          content:
            "Hello! I'm here to listen and support you. How are you feeling today?",
          timestamp: now,
          sentiment: "neutral",
          confidence: 0.8,
        },
      ],
      userProfile,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    this.saveSession(session);
    this.setActiveSession(session.id);
    return session;
  }

  public saveSession(session: ChatSession): boolean {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex((s) => s.id === session.id);

      const updatedSession = {
        ...session,
        updatedAt: new Date(),
        title: this.generateSessionTitle(session.messages),
        sessionSummary: this.calculateSessionSummary(session),
      };

      if (existingIndex !== -1) {
        sessions[existingIndex] = updatedSession;
      } else {
        sessions.unshift(updatedSession);
      }

      if (sessions.length > this.MAX_SESSIONS) {
        sessions.splice(this.MAX_SESSIONS);
      }

      return localStorageService.setItem(this.SESSIONS_KEY, sessions);
    } catch (error) {
      console.error("Failed to save session:", error);
      return false;
    }
  }

  public getSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    const session = sessions.find((session) => session.id === sessionId);
    if (!session) return null;

    return {
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    };
  }

  public getAllSessions(): ChatSession[] {
    const sessions =
      localStorageService.getItem<ChatSession[]>(this.SESSIONS_KEY) || [];
    return sessions
      .map((session) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
        isActive: session.isActive,
      }))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public getSessionsMetadata(): ChatSessionMetadata[] {
    const sessions = this.getAllSessions();
    return sessions
      .map((session) => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        lastMessage:
          session.messages[session.messages.length - 1]?.content || "",
        riskLevel: session.sessionSummary?.averageRiskLevel || "low",
        isActive: session.isActive,
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }

  public deleteSession(sessionId: string): boolean {
    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(
        (session) => session.id !== sessionId,
      );

      if (this.getActiveSessionId() === sessionId) {
        localStorageService.removeItem(this.ACTIVE_SESSION_KEY);
      }

      return localStorageService.setItem(this.SESSIONS_KEY, filteredSessions);
    } catch (error) {
      console.error("Failed to delete session:", error);
      return false;
    }
  }

  public setActiveSession(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    const sessions = this.getAllSessions();
    sessions.forEach((s) => (s.isActive = s.id === sessionId));

    localStorageService.setItem(this.SESSIONS_KEY, sessions);
    return localStorageService.setItem(this.ACTIVE_SESSION_KEY, sessionId);
  }

  public getActiveSessionId(): string | null {
    return localStorageService.getItem<string>(this.ACTIVE_SESSION_KEY);
  }

  public getActiveSession(): ChatSession | null {
    const activeId = this.getActiveSessionId();
    return activeId ? this.getSession(activeId) : null;
  }

  public updateSessionMessages(
    sessionId: string,
    messages: Message[],
  ): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    session.messages = messages;
    return this.saveSession(session);
  }

  public updateSessionProfile(
    sessionId: string,
    userProfile: UserProfile,
  ): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    session.userProfile = userProfile;
    return this.saveSession(session);
  }

  public clearAllSessions(): boolean {
    try {
      localStorageService.removeItem(this.SESSIONS_KEY);
      localStorageService.removeItem(this.ACTIVE_SESSION_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear all sessions:", error);
      return false;
    }
  }

  public exportSessions(): string {
    const sessions = this.getAllSessions();
    return JSON.stringify(sessions, null, 2);
  }

  public importSessions(data: string): boolean {
    try {
      const sessions = JSON.parse(data) as ChatSession[];
      return localStorageService.setItem(this.SESSIONS_KEY, sessions);
    } catch (error) {
      console.error("Failed to import sessions:", error);
      return false;
    }
  }
}

export const chatSessionService = ChatSessionService.getInstance();
