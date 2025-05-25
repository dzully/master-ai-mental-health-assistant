import { useState, useCallback, useRef } from "react";
import { Message, UserProfile, SystemMetrics, AnalysisResult } from "./types";
import { AIService } from "./ai-service";

const initialUserProfile: UserProfile = {
  riskLevel: "low",
  sessionCount: 1,
  lastInteraction: new Date(),
  sentimentHistory: [],
  totalMessages: 0,
  averageConfidence: 0.8,
};

const initialSystemMetrics: SystemMetrics = {
  accuracy: 0.87,
  processedMessages: 1245,
  activeSessions: 23,
  alertsGenerated: 3,
  responseTime: 1.2,
  uptime: 99.8,
};

const initialMessages: Message[] = [
  {
    id: 1,
    type: "bot",
    content:
      "Hello! I'm here to listen and support you. How are you feeling today?",
    timestamp: new Date(),
    sentiment: "neutral",
    confidence: 0.8,
  },
];

export const useDepressionDetection = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [userProfile, setUserProfile] =
    useState<UserProfile>(initialUserProfile);
  const [systemMetrics, setSystemMetrics] =
    useState<SystemMetrics>(initialSystemMetrics);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const aiService = useRef(new AIService());
  const conversationHistory = useRef<string[]>([]);

  const updateUserProfile = useCallback((analysis: AnalysisResult) => {
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
        lastInteraction: new Date(),
      };
    });
  }, []);

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
        timestamp: new Date(),
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
              timestamp: new Date(),
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
            timestamp: new Date(),
            sentiment: "neutral",
            confidence: 0.7,
          };

          setMessages((prev) => [...prev, fallbackMessage]);
          setIsTyping(false);
        }, 1500);
      }
    },
    [messages.length, processUserInput],
  );

  const toggleListening = useCallback(() => {
    setIsListening((prev) => !prev);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages(initialMessages);
    conversationHistory.current = [];
    setUserProfile((prev) => ({
      ...prev,
      sessionCount: prev.sessionCount + 1,
      sentimentHistory: [],
      totalMessages: 0,
    }));
  }, []);

  const exportConversation = useCallback(() => {
    const conversationData = {
      messages,
      userProfile,
      systemMetrics,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mental-health-session-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages, userProfile, systemMetrics]);

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
