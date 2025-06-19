import { useState, useCallback, useRef, useEffect } from "react";
import { Message, UserProfile, SystemMetrics, AnalysisResult } from "./types";
import { AIService } from "./ai-service";
import { useHydrationSafeDate } from "@/shared/lib/use-hydration-safe-date";

const createInitialUserProfile = (date: Date): UserProfile => ({
  riskLevel: "low",
  sessionCount: 1,
  lastInteraction: date,
  sentimentHistory: [],
  totalMessages: 0,
  averageConfidence: 0.8,
});

const initialSystemMetrics: SystemMetrics = {
  accuracy: 0.87,
  processedMessages: 1245,
  activeSessions: 23,
  alertsGenerated: 3,
  responseTime: 1.2,
  uptime: 99.8,
};

const createInitialMessages = (date: Date): Message[] => [
  {
    id: 1,
    type: "bot",
    content:
      "Hello! I'm here to listen and support you. How are you feeling today?",
    timestamp: date,
    sentiment: "neutral",
    confidence: 0.8,
  },
];

export const useDepressionDetection = () => {
  const { createNewDate } = useHydrationSafeDate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    createInitialUserProfile(new Date()),
  );
  const [systemMetrics, setSystemMetrics] =
    useState<SystemMetrics>(initialSystemMetrics);

  const aiService = useRef(new AIService());
  const conversationHistory = useRef<string[]>([]);

  // Test AI connection on component mount
  useEffect(() => {
    const testAI = async () => {
      console.log("🔍 Testing AI connection...");
      const isConnected = await aiService.current.testConnection();
      if (isConnected) {
        console.log("✅ AI connection successful");
      } else {
        console.log("❌ AI connection failed - will use fallbacks");
      }
    };
    testAI();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages = createInitialMessages(createNewDate());
      setMessages(initialMessages);
    }
  }, [messages.length, createNewDate]);

  const updateUserProfile = useCallback(
    (analysis: AnalysisResult) => {
      setUserProfile((prev) => {
        const newSentimentHistory = [
          ...prev.sentimentHistory.slice(-9),
          analysis.sentiment,
        ];
        const totalMessages = prev.totalMessages + 1;
        const averageConfidence =
          (prev.averageConfidence * prev.totalMessages + analysis.confidence) /
          totalMessages;

        return {
          ...prev,
          riskLevel: analysis.riskLevel,
          sentimentHistory: newSentimentHistory,
          totalMessages,
          averageConfidence,
          lastInteraction: createNewDate(),
        };
      });
    },
    [createNewDate],
  );

  const updateSystemMetrics = useCallback((analysis: AnalysisResult) => {
    setSystemMetrics((prev) => ({
      ...prev,
      processedMessages: prev.processedMessages + 1,
      alertsGenerated:
        analysis.riskLevel === "high"
          ? prev.alertsGenerated + 1
          : prev.alertsGenerated,
      responseTime: Math.random() * 2 + 0.5,
      accuracy: Math.min(0.95, prev.accuracy + (Math.random() - 0.5) * 0.02),
    }));
  }, []);

  const processUserInput = useCallback(
    async (text: string): Promise<AnalysisResult> => {
      try {
        const analysis = await aiService.current.analyzeUserInput(
          text,
          conversationHistory.current,
        );
        updateUserProfile(analysis);
        updateSystemMetrics(analysis);
        return analysis;
      } catch (error) {
        console.error("Error processing user input:", error);
        const fallbackAnalysis: AnalysisResult = {
          sentiment: "neutral",
          riskLevel: "low",
          confidence: 0.5,
          score: 0,
          keywords: [],
          linguisticPatterns: {
            firstPersonCount: 0,
            negationCount: 0,
            depressionKeywords: [],
            positiveKeywords: [],
          },
        };
        return fallbackAnalysis;
      }
    },
    [updateUserProfile, updateSystemMetrics],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMessage: Message = {
        id: messages.length + 1,
        type: "user",
        content: text,
        timestamp: createNewDate(),
      };

      setMessages((prev) => [...prev, userMessage]);
      conversationHistory.current.push(text);
      setIsTyping(true);

      try {
        const analysis = await processUserInput(text);

        const aiResponse = await aiService.current.generateTherapeuticResponse(
          text,
          analysis,
          conversationHistory.current,
        );

        setTimeout(
          () => {
            const botMessage: Message = {
              id: messages.length + 2,
              type: "bot",
              content: aiResponse.content,
              timestamp: createNewDate(),
              sentiment: analysis.sentiment,
              confidence: analysis.confidence,
              riskLevel: analysis.riskLevel,
            };

            setMessages((prev) => [...prev, botMessage]);
            conversationHistory.current.push(aiResponse.content);
            setIsTyping(false);
          },
          Math.random() * 1000 + 1000,
        );
      } catch (error) {
        console.error("Error sending message:", error);

        setTimeout(() => {
          const fallbackMessage: Message = {
            id: messages.length + 2,
            type: "bot",
            content:
              "I'm here to listen and support you. Could you tell me more about how you're feeling?",
            timestamp: createNewDate(),
            sentiment: "neutral",
            confidence: 0.7,
          };

          setMessages((prev) => [...prev, fallbackMessage]);
          setIsTyping(false);
        }, 1500);
      }
    },
    [messages.length, processUserInput, createNewDate],
  );

  const toggleListening = useCallback(() => {
    setIsListening((prev) => !prev);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages(createInitialMessages(createNewDate()));
    conversationHistory.current = [];
    setUserProfile((prev) => ({
      ...prev,
      sessionCount: prev.sessionCount + 1,
      sentimentHistory: [],
      totalMessages: 0,
    }));
  }, [createNewDate]);

  const exportConversation = useCallback(() => {
    const conversationData = {
      messages,
      userProfile,
      systemMetrics,
      timestamp: createNewDate().toISOString(),
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mental-health-session-${createNewDate().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages, userProfile, systemMetrics, createNewDate]);

  return {
    messages,
    userProfile,
    systemMetrics,
    isTyping,
    isListening,
    sendMessage,
    toggleListening,
    processUserInput,
    clearConversation,
    exportConversation,
  };
};
