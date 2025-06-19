import { useState, useCallback, useRef, useEffect } from "react";
import {
  Message,
  UserProfile,
  SystemMetrics,
  AnalysisResult,
  ChatSession,
  ChatSessionMetadata,
} from "./types";
import { AIService } from "./ai-service";
import { chatSessionService } from "./chat-session-service";
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

export const useChatSessionManager = () => {
  const { createNewDate } = useHydrationSafeDate();

  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null,
  );
  const [sessionsList, setSessionsList] = useState<ChatSessionMetadata[]>([]);
  const [systemMetrics, setSystemMetrics] =
    useState<SystemMetrics>(initialSystemMetrics);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const aiService = useRef(new AIService());
  const conversationHistory = useRef<string[]>([]);

  const loadSessions = useCallback(() => {
    const sessions = chatSessionService.getSessionsMetadata();
    setSessionsList(sessions);
  }, []);

  const loadActiveSession = useCallback(() => {
    const activeSession = chatSessionService.getActiveSession();
    if (activeSession) {
      setCurrentSession(activeSession);
      conversationHistory.current = activeSession.messages
        .map((msg) => msg.content)
        .slice(1);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadActiveSession();
  }, [loadSessions, loadActiveSession]);

  const updateUserProfile = useCallback(
    (analysis: AnalysisResult, session: ChatSession) => {
      const newSentimentHistory = [
        ...session.userProfile.sentimentHistory.slice(-9),
        analysis.sentiment,
      ];
      const totalMessages = session.userProfile.totalMessages + 1;
      const averageConfidence =
        (session.userProfile.averageConfidence *
          session.userProfile.totalMessages +
          analysis.confidence) /
        totalMessages;

      const updatedProfile: UserProfile = {
        ...session.userProfile,
        riskLevel: analysis.riskLevel,
        sentimentHistory: newSentimentHistory,
        totalMessages,
        averageConfidence,
        lastInteraction: createNewDate(),
      };

      return updatedProfile;
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
    [updateSystemMetrics],
  );

  const createNewSession = useCallback(() => {
    const initialProfile = createInitialUserProfile(createNewDate());
    const newSession = chatSessionService.createSession(initialProfile);

    setCurrentSession(newSession);
    conversationHistory.current = [];
    loadSessions();

    return newSession;
  }, [createNewDate, loadSessions]);

  const selectSession = useCallback(
    (sessionId: string) => {
      const session = chatSessionService.getSession(sessionId);
      if (session) {
        chatSessionService.setActiveSession(sessionId);
        setCurrentSession(session);
        conversationHistory.current = session.messages
          .filter((msg) => msg.type === "user")
          .map((msg) => msg.content);
        loadSessions();
      }
    },
    [loadSessions],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      chatSessionService.deleteSession(sessionId);

      if (currentSession?.id === sessionId) {
        const remainingSessions = chatSessionService.getAllSessions();
        if (remainingSessions.length > 0) {
          selectSession(remainingSessions[0].id);
        } else {
          createNewSession();
        }
      }

      loadSessions();
    },
    [currentSession?.id, selectSession, createNewSession, loadSessions],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !currentSession) return;

      const userMessage: Message = {
        id: currentSession.messages.length + 1,
        type: "user",
        content: text,
        timestamp: createNewDate(),
      };

      const updatedMessages = [...currentSession.messages, userMessage];

      const updatedSession: ChatSession = {
        ...currentSession,
        messages: updatedMessages,
        updatedAt: createNewDate(),
      };

      setCurrentSession(updatedSession);
      conversationHistory.current.push(text);
      setIsTyping(true);

      try {
        const analysis = await processUserInput(text);
        const updatedProfile = updateUserProfile(analysis, updatedSession);

        const aiResponse = await aiService.current.generateTherapeuticResponse(
          text,
          analysis,
          conversationHistory.current,
        );

        setTimeout(
          () => {
            const botMessage: Message = {
              id: updatedMessages.length + 1,
              type: "bot",
              content: aiResponse.content,
              timestamp: createNewDate(),
              sentiment: analysis.sentiment,
              confidence: analysis.confidence,
              riskLevel: analysis.riskLevel,
            };

            const finalMessages = [...updatedMessages, botMessage];
            const finalSession: ChatSession = {
              ...updatedSession,
              messages: finalMessages,
              userProfile: updatedProfile,
              updatedAt: createNewDate(),
            };

            setCurrentSession(finalSession);
            chatSessionService.saveSession(finalSession);
            conversationHistory.current.push(aiResponse.content);
            setIsTyping(false);
            loadSessions();
          },
          Math.random() * 1000 + 1000,
        );
      } catch (error) {
        console.error("Error sending message:", error);

        setTimeout(() => {
          const fallbackMessage: Message = {
            id: updatedMessages.length + 1,
            type: "bot",
            content:
              "I'm here to listen and support you. Could you tell me more about how you're feeling?",
            timestamp: createNewDate(),
            sentiment: "neutral",
            confidence: 0.7,
          };

          const finalMessages = [...updatedMessages, fallbackMessage];
          const finalSession: ChatSession = {
            ...updatedSession,
            messages: finalMessages,
            updatedAt: createNewDate(),
          };

          setCurrentSession(finalSession);
          chatSessionService.saveSession(finalSession);
          setIsTyping(false);
          loadSessions();
        }, 1500);
      }
    },
    [
      currentSession,
      processUserInput,
      updateUserProfile,
      createNewDate,
      loadSessions,
    ],
  );

  const toggleListening = useCallback(() => {
    setIsListening((prev) => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

  const exportSessions = useCallback(() => {
    const data = chatSessionService.exportSessions();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mental-health-sessions-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const importSessions = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (chatSessionService.importSessions(data)) {
          loadSessions();
          const sessions = chatSessionService.getAllSessions();
          if (sessions.length > 0) {
            selectSession(sessions[0].id);
          }
        }
      };
      reader.readAsText(file);
    },
    [loadSessions, selectSession],
  );

  const clearAllSessions = useCallback(() => {
    chatSessionService.clearAllSessions();
    createNewSession();
    loadSessions();
  }, [createNewSession, loadSessions]);

  useEffect(() => {
    if (!currentSession && sessionsList.length === 0) {
      createNewSession();
    }
  }, [currentSession, sessionsList.length, createNewSession]);

  return {
    currentSession,
    sessionsList,
    systemMetrics,
    isTyping,
    isListening,
    sidebarVisible,
    sendMessage,
    toggleListening,
    toggleSidebar,
    createNewSession,
    selectSession,
    deleteSession,
    exportSessions,
    importSessions,
    clearAllSessions,
  };
};
