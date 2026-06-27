"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  MapPin,
  MessageSquare,
  Send,
  Package,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/api";

interface ModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({
  orderId,
  isOpen,
  onClose,
}: ModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
    };
    fetchData();

    socketRef.current = io("http://localhost:3000/order-tracking", {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("subscribeToOrder", { orderId });
    socketRef.current.on("subscribed", (data) => {
      setMessages(data.messages);
      setCurrentLocation(data.current);
    });
    socketRef.current.on("locationUpdate", (loc) => setCurrentLocation(loc));
    socketRef.current.on("newMessage", (msg) =>
      setMessages((prev) => [...prev, msg]),
    );

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isOpen, orderId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    socketRef.current?.emit("sendMessage", { orderId, message: newMessage });
    setNewMessage("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-0 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-surface-200"
        >
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center bg-surface-50">
            <h2 className="text-lg font-black text-brand-600">
              Order #{orderId.slice(-6).toUpperCase()}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto">
            {/* Info & Tracking */}
            <div className="space-y-6">
              <button
                onClick={() => window.open(`/api/orders/${orderId}/invoice`)}
                className="flex items-center gap-2 bg-brand-500 text-white px-4 py-3 rounded-lg w-full text-xs font-black uppercase hover:bg-brand-600"
              >
                <Download className="w-4 h-4" /> Download Invoice
              </button>
              <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                <h3 className="font-bold flex items-center gap-2 mb-2">
                  <MapPin className="text-brand-500 w-4 h-4" /> Live Tracking
                </h3>
                <p className="text-xs text-text-muted">
                  {currentLocation
                    ? `Status: ${currentLocation.stage}`
                    : "No live updates yet."}
                </p>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-surface-0 border rounded-xl flex flex-col h-64">
              <div className="p-3 border-b font-bold text-xs">Support Chat</div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-[10px] ${m.sender.role === "STUDENT" ? "bg-brand-50 ml-auto w-fit" : "bg-surface-100"}`}
                  >
                    {m.message}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border rounded p-2 text-xs"
                  placeholder="Type here..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-brand-500 text-white p-2 rounded"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
