/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

import toast from "react-hot-toast";
import { ChatHistoryItem, deviceDetailsApi } from "@/lib/api/deviceDetailsApi";

interface DeviceAiChatProps {
  deviceId: string;
}

export default function DeviceAiChat({ deviceId }: DeviceAiChatProps) {
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const userMessage = input.trim();
    if (!userMessage) return;

    // 🛡️ ক্লায়েন্ট সাইড থেকে চেক যেন এম্পটি আইডি সাবমিট না হয়
    if (!deviceId) {
      toast.error("Runtime Exception: Device identity mapping is pending.");
      return;
    }

    setInput("");
    const updatedHistory: ChatHistoryItem[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      // API payload পাঠানোর সময় আইডি স্ট্রিং ক্যাস্টিং ফোর্স করা হয়েছে
      const response = await deviceDetailsApi.askAiAboutDevice(
        String(deviceId),
        userMessage,
        messages,
      );
      setMessages([
        ...updatedHistory,
        { role: "assistant", content: response.reply },
      ]);
    } catch (err: any) {
      toast.error(err.message || "AI Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-surface-300 bg-surface-0 shadow-sm flex flex-col h-[400px]">
      <div className="p-4 border-b border-surface-200 bg-surface-50 flex items-center gap-2 rounded-t-xl">
        <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
        <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
          Hardware AI Assistant
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-muted p-4">
            <Bot className="w-8 h-8 text-surface-300 stroke-[1.5] mb-2" />
            <p className="text-xs font-semibold">
              Query specifications, variants or borrow rules about this
              peripheral setup.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="p-1.5 h-7 w-7 rounded-lg bg-brand-500 text-surface-0 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent-500 text-surface-0 rounded-br-none"
                  : "bg-surface-50 border border-surface-200 text-text-secondary rounded-bl-none font-medium"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="p-1.5 h-7 w-7 rounded-lg bg-surface-200 text-text-secondary flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start items-center text-xxs font-bold text-text-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
            <span>AI Matrix computing...</span>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-surface-200 bg-surface-50 rounded-b-xl flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask system AI assistant..."
          disabled={loading || !deviceId}
          className="flex-1 text-xs p-2.5 rounded-lg border border-surface-300 bg-surface-0 text-text-primary outline-none focus:border-brand-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !deviceId}
          className="p-2.5 rounded-lg bg-brand-500 text-surface-0 hover:bg-brand-600 disabled:bg-surface-200 disabled:text-text-muted active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
