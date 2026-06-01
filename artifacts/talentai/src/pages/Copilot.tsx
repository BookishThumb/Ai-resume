import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useCopilotChat } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  suggestions?: string[];
}

const STARTER_SUGGESTIONS = [
  "Show me top candidates",
  "Find React developers",
  "Compare top applicants",
  "Recommend interview questions",
  "What are my hiring metrics?",
  "Who is ready for an offer?",
];

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I'm your AI recruitment copilot. I can help you find candidates, compare applicants, get interview questions, analyze your pipeline, and more. What would you like to know?",
      suggestions: STARTER_SUGGESTIONS.slice(0, 4),
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const copilotChat = useCopilotChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || copilotChat.isPending) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    copilotChat.mutate({ data: { message: text } }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, {
          role: "ai",
          content: data.response,
          suggestions: data.suggestions,
        }]);
      },
      onError: () => {
        setMessages(prev => [...prev, {
          role: "ai",
          content: "I encountered an error. Please try again.",
        }]);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-0px)]">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold font-heading">Recruiter Copilot</h1>
              <p className="text-xs text-muted-foreground">AI-powered recruitment assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-primary to-blue-500 shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                    : "bg-white/10"
                }`}>
                  {msg.role === "ai" ? <Brain className="w-4 h-4 text-white" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] space-y-3 ${msg.role === "user" ? "items-end" : ""}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "ai"
                      ? "glass-panel rounded-tl-none"
                      : "bg-primary/15 border border-primary/20 rounded-tr-none"
                  }`} data-testid={`message-${msg.role}-${i}`}>
                    {msg.content}
                  </div>

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                          data-testid={`suggestion-${s.slice(0, 20)}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {copilotChat.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-primary/60"
                      animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder="Ask anything about your recruitment pipeline..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
              disabled={copilotChat.isPending}
              data-testid="input-copilot-message"
            />
            <Button type="submit" disabled={!input.trim() || copilotChat.isPending} className="gap-2" data-testid="button-send-message">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
