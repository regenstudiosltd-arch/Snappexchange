"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Lightbulb, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const presetQuestions = [
  { icon: Lightbulb, text: "Budgeting Tips", color: "text-[#F59E0B]", bgColor: "bg-[#F59E0B]/10" },
  { icon: TrendingUp, text: "Saving Advice", color: "text-[#059669]", bgColor: "bg-[#059669]/10" },
  { icon: DollarSign, text: "Investment 101", color: "text-[#DC2626]", bgColor: "bg-[#DC2626]/10" },
];

const aiResponses: Record<string, string> = {
  "budgeting tips": "Here are some budgeting tips for you:\n\n1. Follow the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings\n2. Track every expense for at least a month to understand your spending patterns\n3. Use mobile money statements to monitor your transactions\n4. Set up automatic transfers to your savings on payday\n5. Review and adjust your budget monthly\n\nWould you like help setting up a personalized budget?",
  
  "saving advice": "Great savings strategies:\n\n1. Start small - even ₵10/day adds up to ₵3,650/year\n2. Join a susu group for accountability and discipline\n3. Save windfalls (bonuses, gifts) immediately\n4. Use the 24-hour rule before making purchases over ₵100\n5. Set specific goals with deadlines\n6. Automate your savings\n\nYour current savings rate is excellent! Keep it up!",
  
  "investment 101": "Investment basics for beginners:\n\n1. Emergency fund first - save 3-6 months of expenses\n2. Understand risk vs reward\n3. Start with low-risk options: treasury bills, fixed deposits\n4. Diversify - don't put all eggs in one basket\n5. Think long-term (5+ years)\n6. Only invest money you can afford to lose\n\nWould you like to explore investment options available in Ghana?",
};

export function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your SnappX AI Financial Assistant. I'm here to help you with budgeting, saving strategies, and financial advice. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage;
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate AI response
    let aiResponse = "";
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("budget")) {
      aiResponse = aiResponses["budgeting tips"];
    } else if (lowerText.includes("sav")) {
      aiResponse = aiResponses["saving advice"];
    } else if (lowerText.includes("invest")) {
      aiResponse = aiResponses["investment 101"];
    } else if (lowerText.includes("goal") || lowerText.includes("target")) {
      aiResponse = "Setting financial goals is crucial! Here's what I recommend:\n\n1. Make goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)\n2. Break large goals into smaller milestones\n3. Use our Goals feature to track progress\n4. Celebrate small wins along the way\n5. Review and adjust goals quarterly\n\nWhat goal would you like to set?";
    } else if (lowerText.includes("group") || lowerText.includes("susu")) {
      aiResponse = "Savings groups (susu) are powerful! Benefits:\n\n1. Built-in accountability from group members\n2. Rotating payouts help with large expenses\n3. Social support and motivation\n4. Learn from others' financial strategies\n5. Access to group loans in emergencies\n\nTip: Choose groups with members you trust and similar financial goals.";
    } else {
      aiResponse = `I understand you're asking about "${text}". I can help you with:\n\n• Budgeting strategies\n• Saving tips and tricks\n• Investment basics\n• Setting financial goals\n• Managing susu groups\n\nPlease ask me anything specific about these topics!`;
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handlePresetQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC2626] via-[#F59E0B] to-[#059669] flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>AI Financial Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">Get personalized financial advice</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Preset Questions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-3">Quick topics:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presetQuestions.map((preset, index) => {
              const Icon = preset.icon;
              return (
                <button
                  key={index}
                  onClick={() => handlePresetQuestion(preset.text)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 hover:border-[#F59E0B]/50 transition-all ${preset.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${preset.color}`} />
                  <span>{preset.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DC2626] via-[#F59E0B] to-[#059669] flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[#DC2626] text-white"
                    : "bg-gray-100 text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DC2626] via-[#F59E0B] to-[#059669] flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about budgeting, saving, or investing..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
              disabled={!inputMessage.trim() || isTyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
