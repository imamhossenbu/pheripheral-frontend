"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { orderService, type Order } from "@/lib/api/OrderApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Package,
  Receipt,
  MapPin,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Download,
  X,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Navigation,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Sender {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface OrderMessage {
  id: string;
  orderId: string;
  message: string;
  createdAt: string;
  sender: Sender;
}

interface TrackingPoint {
  id: string;
  orderId: string;
  latitude: number;
  longitude: number;
  stage: string;
  note?: string;
  recordedAt: string;
  staff: { id: string; firstName: string; lastName: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ORDER_STATUS_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  PROCESSING: {
    label: "Processing",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const PAYMENT_STATUS_META: Record<string, { label: string; color: string }> = {
  UNPAID: { label: "Unpaid", color: "text-red-600 bg-red-50 border-red-200" },
  PARTIAL: {
    label: "Partial",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  PAID: {
    label: "Paid",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
};

const TRACKING_STAGE_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PLACED: {
    label: "Order Placed",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: <Package className="w-3.5 h-3.5" />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  PREPARING: {
    label: "Preparing",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

function orderStatusMeta(status?: string) {
  return (
    ORDER_STATUS_META[status ?? ""] ?? {
      label: status ?? "PENDING",
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: <Clock className="w-3.5 h-3.5" />,
    }
  );
}

function paymentStatusMeta(status?: string) {
  return (
    PAYMENT_STATUS_META[status ?? ""] ?? {
      label: status ?? "UNPAID",
      color: "text-gray-600 bg-gray-50 border-gray-200",
    }
  );
}

function trackingStageMeta(stage?: string) {
  return (
    TRACKING_STAGE_META[stage ?? ""] ?? {
      label: stage ?? "",
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: <Navigation className="w-3.5 h-3.5" />,
    }
  );
}

// ─── Socket singleton ─────────────────────────────────────────────────────────

let _socket: Socket | null = null;

function getSocket(token: string): Socket {
  if (!_socket) {
    _socket = io(`${process.env.NEXT_PUBLIC_API_URL}/order-tracking`, {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return _socket;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({
  label,
  color,
  icon,
}: {
  label: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${color}`}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({
  orderId,
  socket,
  initialMessages,
  currentUserId,
}: {
  orderId: string;
  socket: Socket | null;
  initialMessages: OrderMessage[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<OrderMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: OrderMessage) => {
      if (msg.orderId === orderId) setMessages((prev) => [...prev, msg]);
    };
    socket.on("newMessage", handler);
    return () => {
      socket.off("newMessage", handler);
    };
  }, [socket, orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || !socket) return;
    socket.emit("sendMessage", { orderId, message: trimmed });
    setInput("");
  };

  return (
    <div className="flex flex-col h-72 border border-surface-200 rounded-xl overflow-hidden bg-surface-0">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-200 bg-surface-50">
        <MessageSquare className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-black uppercase text-text-primary">
          Order Chat
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-xs text-text-muted py-6">
            No messages yet. Ask us anything about your order.
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.sender.id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  isMine
                    ? "bg-brand-500 text-white rounded-br-none"
                    : "bg-surface-100 text-text-primary rounded-bl-none"
                }`}
              >
                {m.message}
              </div>
              <span className="text-[9px] text-text-muted mt-0.5 px-1">
                {isMine ? "You" : `${m.sender.firstName} (${m.sender.role})`} ·{" "}
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 p-2 border-t border-surface-200 bg-surface-0">
        <input
          className="flex-1 text-xs bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 outline-none focus:border-brand-400 text-text-primary placeholder:text-text-muted"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="p-2 bg-brand-500 text-white rounded-lg disabled:opacity-40 hover:bg-brand-600 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Tracking Panel ───────────────────────────────────────────────────────────

function TrackingPanel({
  orderId,
  socket,
  initialCurrent,
}: {
  orderId: string;
  socket: Socket | null;
  initialCurrent: TrackingPoint | null;
}) {
  const [current, setCurrent] = useState<TrackingPoint | null>(initialCurrent);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: TrackingPoint & { orderId: string }) => {
      if (data.orderId === orderId) setCurrent(data as TrackingPoint);
    };
    socket.on("locationUpdate", handler);
    return () => {
      socket.off("locationUpdate", handler);
    };
  }, [socket, orderId]);

  if (!current) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-surface-300 bg-surface-50 text-text-muted text-xs">
        <Navigation className="w-4 h-4 shrink-0" />
        <span>
          Location tracking will appear here once your order is out for
          delivery.
        </span>
      </div>
    );
  }

  const stageMeta = trackingStageMeta(current.stage);
  const mapUrl = `https://maps.google.com/maps?q=${current.latitude},${current.longitude}&z=15&output=embed`;

  return (
    <div className="rounded-xl border border-surface-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-50 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-black uppercase text-text-primary">
            Live Location
          </span>
        </div>
        <StatusBadge
          label={stageMeta.label}
          color={stageMeta.color}
          icon={stageMeta.icon}
        />
      </div>
      <iframe
        src={mapUrl}
        className="w-full h-52 border-0"
        loading="lazy"
        title="Order location"
      />
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-0 text-[10px] text-text-muted">
        <span>
          {current.staff.firstName} {current.staff.lastName} · Updated{" "}
          {new Date(current.recordedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {current.note && <span className="italic">"{current.note}"</span>}
      </div>
    </div>
  );
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────

function InvoiceModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await orderService.downloadInvoice(order.id, order.orderNumber);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Could not download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const orderMeta = orderStatusMeta(order.status);
  const payMeta = paymentStatusMeta(order.paymentStatus);

  // Paid amount from payments array
  const paidAmount = order.payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const balanceDue = Math.max(Number(order.total) - paidAmount, 0);

  const invoiceLabel = order.invoice
    ? `Invoice ${order.invoice.invoiceNumber}`
    : `Proforma — ${order.orderNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-0 rounded-2xl w-full max-w-md shadow-xl border border-surface-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-500" />
            <div>
              <h2 className="font-black text-text-primary text-sm">
                {invoiceLabel}
              </h2>
              {!order.invoice && (
                <p className="text-[10px] text-amber-500 font-semibold">
                  Draft — payment not yet confirmed
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-b border-surface-200 bg-surface-50">
          <div className="text-[10px] text-text-muted">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <StatusBadge
            label={orderMeta.label}
            color={orderMeta.color}
            icon={orderMeta.icon}
          />
          <StatusBadge
            label={payMeta.label}
            color={payMeta.color}
            icon={<CreditCard className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Items table */}
        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-surface-50">
                <tr>
                  <th className="text-left px-3 py-2 font-black uppercase text-[10px] text-text-muted">
                    Item
                  </th>
                  <th className="text-right px-3 py-2 font-black uppercase text-[10px] text-text-muted">
                    Qty
                  </th>
                  <th className="text-right px-3 py-2 font-black uppercase text-[10px] text-text-muted">
                    Unit
                  </th>
                  <th className="text-right px-3 py-2 font-black uppercase text-[10px] text-text-muted">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {order.items.map((item) => {
                  const name = item.variant
                    ? `${item.device.name} (${item.variant.name})`
                    : item.device.name;
                  return (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-text-primary">{name}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-right text-text-secondary">
                        ${Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-text-primary font-semibold">
                        ${Number(item.total).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Discount</span>
              <span>− ${Number(order.discount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Tax</span>
              <span>+ ${Number(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-text-primary pt-2 border-t border-surface-200 text-sm">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between text-emerald-600 text-[10px]">
                <span>Paid</span>
                <span>${paidAmount.toFixed(2)}</span>
              </div>
            )}
            {balanceDue > 0 && (
              <div className="flex justify-between text-red-500 font-bold text-[10px]">
                <span>Balance Due</span>
                <span>${balanceDue.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="text-[10px] text-text-muted bg-surface-50 rounded-lg p-3 border border-surface-200">
              <span className="font-black uppercase">Note: </span>
              {order.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-surface-200">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-xs font-black uppercase px-4 py-3 rounded-xl transition-colors"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? "Generating PDF…" : "Download Invoice PDF"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  socket,
  currentUserId,
}: {
  order: Order;
  socket: Socket | null;
  currentUserId: string;
}) {
  const canTrack =
    order.status === "PROCESSING" || order.status === "COMPLETED";

  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"track" | "chat">(canTrack ? "track" : "chat");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [trackingData, setTrackingData] = useState<{
    current: TrackingPoint | null;
    messages: OrderMessage[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const subscribedRef = useRef(false);

  const openDetails = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (trackingData) return;

    setLoadingDetails(true);
    try {
      if (socket && !subscribedRef.current) {
        socket.emit(
          "subscribeToOrder",
          { orderId: order.id },
          (response: {
            current: TrackingPoint | null;
            messages: OrderMessage[];
          }) => {
            if (response)
              setTrackingData({
                current: response.current,
                messages: response.messages,
              });
            setLoadingDetails(false);
          },
        );
        subscribedRef.current = true;
        return; // loading set inside callback
      } else {
        // REST fallback
        const [trackRes, msgRes] = await Promise.all([
          api
            .get(`/orders/${order.id}/tracking/current`)
            .catch(() => ({ data: null })),
          api.get(`/orders/${order.id}/messages`).catch(() => ({ data: [] })),
        ]);
        setTrackingData({ current: trackRes.data, messages: msgRes.data });
      }
    } catch {
      toast.error("Could not load order details");
    } finally {
      setLoadingDetails(false);
    }
  }, [expanded, order.id, socket, trackingData]);

  useEffect(() => {
    return () => {
      if (socket && subscribedRef.current) {
        socket.emit("unsubscribeFromOrder", { orderId: order.id });
      }
    };
  }, [socket, order.id]);

  const orderMeta = orderStatusMeta(order.status);
  const payMeta = paymentStatusMeta(order.paymentStatus);

  return (
    <>
      <motion.div
        layout
        className="bg-surface-0 rounded-2xl border border-surface-200 overflow-hidden shadow-sm hover:border-brand-300 transition-colors"
      >
        {/* ── Row ── */}
        <div className="flex items-center justify-between p-5 gap-3 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-2.5 bg-brand-50 rounded-xl shrink-0">
              <Package className="w-5 h-5 text-brand-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-text-primary text-sm">
                {order.orderNumber}
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap ml-auto">
            {/* Total */}
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black uppercase text-text-muted">
                Total
              </p>
              <p className="font-black text-text-primary text-sm">
                ${Number(order.total).toFixed(2)}
              </p>
            </div>

            {/* Status badges */}
            <StatusBadge
              label={orderMeta.label}
              color={orderMeta.color}
              icon={orderMeta.icon}
            />
            <StatusBadge
              label={payMeta.label}
              color={payMeta.color}
              icon={<CreditCard className="w-3.5 h-3.5" />}
            />

            {/* Invoice button */}
            <button
              onClick={() => setInvoiceOpen(true)}
              title="View Invoice"
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <Receipt className="w-4 h-4 text-text-secondary" />
            </button>

            {/* Expand button */}
            <button
              onClick={openDetails}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase text-brand-500 hover:text-brand-600 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {expanded ? "Less" : "Details"}
            </button>
          </div>
        </div>

        {/* ── Expanded ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-surface-200"
            >
              <div className="p-5 space-y-4">
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin w-5 h-5 text-brand-500" />
                  </div>
                ) : (
                  <>
                    {/* Tab switcher */}
                    <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
                      {canTrack && (
                        <button
                          onClick={() => setTab("track")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-colors ${
                            tab === "track"
                              ? "bg-surface-0 text-brand-500 shadow-sm"
                              : "text-text-muted hover:text-text-primary"
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Track
                        </button>
                      )}
                      <button
                        onClick={() => setTab("chat")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-colors ${
                          tab === "chat"
                            ? "bg-surface-0 text-brand-500 shadow-sm"
                            : "text-text-muted hover:text-text-primary"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat
                      </button>
                    </div>

                    {tab === "track" && canTrack && (
                      <TrackingPanel
                        orderId={order.id}
                        socket={socket}
                        initialCurrent={trackingData?.current ?? null}
                      />
                    )}
                    {tab === "chat" && (
                      <ChatPanel
                        orderId={order.id}
                        socket={socket}
                        initialMessages={trackingData?.messages ?? []}
                        currentUserId={currentUserId}
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {invoiceOpen && (
          <InvoiceModal order={order} onClose={() => setInvoiceOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Replace with your auth hook (e.g. useAuth())
  const token =
    typeof window !== "undefined" ? (localStorage.getItem("token") ?? "") : "";
  const currentUserId =
    typeof window !== "undefined"
      ? (localStorage.getItem("user_id") ?? "")
      : "";

  useEffect(() => {
    if (!token) return;
    const s = getSocket(token);
    setSocket(s);
    return () => {
      setSocket(null);
    };
  }, [token]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        // backend returns { data: Order[], meta: {...} }
        setOrders(Array.isArray(data) ? data : (data.data ?? []));
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-6 md:p-8 bg-surface-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Track deliveries, chat with staff, and download invoices.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin w-7 h-7 text-brand-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-10 h-10 text-surface-300 mx-auto mb-3" />
            <p className="font-black text-text-muted uppercase text-sm">
              No orders yet
            </p>
            <p className="text-xs text-text-muted mt-1">
              Your orders will appear here once you place them.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                socket={socket}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
