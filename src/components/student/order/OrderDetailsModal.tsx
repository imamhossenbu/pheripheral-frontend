// // "use client";

// // import React, { useEffect, useRef, useState } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import {
// //   X,
// //   Download,
// //   MapPin,
// //   MessageSquare,
// //   Send,
// //   Package,
// // } from "lucide-react";
// // import { io, Socket } from "socket.io-client";
// // import { api } from "@/lib/api";
// // import { fetchTrackingHistory, OrderTracking } from "@/lib/staff/order-api";

// // interface ModalProps {
// //   orderId: string;
// //   isOpen: boolean;
// //   onClose: () => void;
// // }

// // export default function OrderDetailsModal({
// //   orderId,
// //   isOpen,
// //   onClose,
// // }: ModalProps) {
// //   const [order, setOrder] = useState<any>(null);
// //   const [messages, setMessages] = useState<any[]>([]);
// //   // const [currentLocation, setCurrentLocation] = useState<any>(null);
// //   const [tracking, setTracking] = useState<OrderTracking[]>([]);
// // const [currentLocation, setCurrentLocation] = useState<OrderTracking | null>(null);

// // useEffect(() => {
// //     if (!isOpen) return;

// //     fetchTrackingHistory(orderId)
// //         .then((data) => {
// //             setTracking(data);
// //             if (data.length) {
// //                 setCurrentLocation(data[0]); // latest update
// //             }
// //         })
// //         .catch(console.error);
// // }, [orderId, isOpen]);
// //   const [newMessage, setNewMessage] = useState("");


// //   const socketRef = useRef<Socket | null>(null);

// //   useEffect(() => {
// //     if (!isOpen) return;

// //     const fetchData = async () => {
// //       const { data } = await api.get(`/orders/${orderId}`);
// //       setOrder(data);
// //     };
// //     fetchData();

// //     socketRef.current = io("http://localhost:3000/order-tracking", {
// //       auth: { token: localStorage.getItem("token") },
// //     });

// //     socketRef.current.emit("subscribeToOrder", { orderId });
// //     socketRef.current.on("subscribed", (data) => {
// //       setMessages(data.messages);
// //       setCurrentLocation(data.current);
// //     });
// //     socketRef.current.on("locationUpdate", (loc) => setCurrentLocation(loc));
// //     socketRef.current.on("newMessage", (msg) =>
// //       setMessages((prev) => [...prev, msg]),
// //     );

// //     return () => {
// //       socketRef.current?.disconnect();
// //     };
// //   }, [isOpen, orderId]);

// //   const handleSendMessage = () => {
// //     if (!newMessage.trim()) return;
// //     socketRef.current?.emit("sendMessage", { orderId, message: newMessage });
// //     setNewMessage("");
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <AnimatePresence>
// //       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
// //         <motion.div
// //           initial={{ opacity: 0, scale: 0.95 }}
// //           animate={{ opacity: 1, scale: 1 }}
// //           exit={{ opacity: 0, scale: 0.95 }}
// //           className="bg-surface-0 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-surface-200"
// //         >
// //           {/* Header */}
// //           <div className="p-6 border-b flex justify-between items-center bg-surface-50">
// //             <h2 className="text-lg font-black text-brand-600">
// //               Order #{orderId.slice(-6).toUpperCase()}
// //             </h2>
// //             <button
// //               onClick={onClose}
// //               className="p-2 hover:bg-surface-200 rounded-full"
// //             >
// //               <X className="w-5 h-5" />
// //             </button>
// //           </div>

// //           <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto">
// //             {/* Info & Tracking */}
// //             <div className="space-y-6">
// //               <button
// //                 onClick={() => window.open(`/api/orders/${orderId}/invoice`)}
// //                 className="flex items-center gap-2 bg-brand-500 text-white px-4 py-3 rounded-lg w-full text-xs font-black uppercase hover:bg-brand-600"
// //               >
// //                 <Download className="w-4 h-4" /> Download Invoice
// //               </button>
// //               <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
// //                 <h3 className="font-bold flex items-center gap-2 mb-2">
// //                   <MapPin className="text-brand-500 w-4 h-4" /> Live Tracking
// //                 </h3>
// //                 <p className="text-xs text-text-muted">
// //                   {currentLocation
// //                     ? `Status: ${currentLocation.stage}`
// //                     : "No live updates yet."}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* Chat */}
// //             <div className="bg-surface-0 border rounded-xl flex flex-col h-64">
// //               <div className="p-3 border-b font-bold text-xs">Support Chat</div>
// //               <div className="flex-1 overflow-y-auto p-3 space-y-2">
// //                 {messages.map((m, i) => (
// //                   <div
// //                     key={i}
// //                     className={`p-2 rounded text-[10px] ${m.sender.role === "STUDENT" ? "bg-brand-50 ml-auto w-fit" : "bg-surface-100"}`}
// //                   >
// //                     {m.message}
// //                   </div>
// //                 ))}
// //               </div>
// //               <div className="p-3 border-t flex gap-2">
// //                 <input
// //                   value={newMessage}
// //                   onChange={(e) => setNewMessage(e.target.value)}
// //                   className="flex-1 border rounded p-2 text-xs"
// //                   placeholder="Type here..."
// //                 />
// //                 <button
// //                   onClick={handleSendMessage}
// //                   className="bg-brand-500 text-white p-2 rounded"
// //                 >
// //                   <Send className="w-4 h-4" />
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </motion.div>
// //       </div>
// //     </AnimatePresence>
// //   );
// // }


// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   X,
//   Download,
//   MapPin,
//   Send,
//   MessageSquare,
//   Package,
// } from "lucide-react";
// import { io, Socket } from "socket.io-client";
// import { api } from "@/lib/api";
// import { fetchTrackingHistory, OrderTracking } from "@/lib/staff/order-api";

// interface ModalProps {
//   orderId: string;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function OrderDetailsModal({
//   orderId,
//   isOpen,
//   onClose,
// }: ModalProps) {
//   const [order, setOrder] = useState<any>(null);
//   const [messages, setMessages] = useState<any[]>([]);
//   const [tracking, setTracking] = useState<OrderTracking[]>([]);
//   const [currentLocation, setCurrentLocation] = useState<OrderTracking | null>(null);
//   const [newMessage, setNewMessage] = useState("");
//   const socketRef = useRef<Socket | null>(null);
//   const chatEndRef = useRef<HTMLDivElement | null>(null);

//   // অটো-স্ক্রোল চ্যাট বক্সের নিচে নিয়ে যাওয়ার জন্য
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // REST API: অর্ডার বেসিক ডাটা এবং প্রাথমিক ট্র্যাকিং হিস্ট্রি লোড
//   useEffect(() => {
//     if (!isOpen) return;

//     const fetchData = async () => {
//       try {
//         const { data } = await api.get(`/orders/${orderId}`);
//         setOrder(data);
//       } catch (err) {
//         console.error("Failed to fetch order info:", err);
//       }
//     };

//     fetchData();

//     fetchTrackingHistory(orderId)
//       .then((data) => {
//         setTracking(data);
//         if (data && data.length > 0) {
//           setCurrentLocation(data[0]); // সর্বশেষ ট্র্যাকিং আপডেট সেট
//         }
//       })
//       .catch(console.error);
//   }, [orderId, isOpen]);

//   // Socket.io: রিয়েল-টাইম লাইভ চ্যাট ও লোকেশন সিঙ্ক
//   useEffect(() => {
//     if (!isOpen) return;

//     // সকেট কানেকশন ইনিশিয়েট
//     socketRef.current = io("http://localhost:3000/order-tracking", {
//       auth: { token: localStorage.getItem("token") },
//     });

//     // অর্ডারে সাবস্ক্রাইব করা
//     socketRef.current.emit("subscribeToOrder", { orderId });

//     // ইনিশিয়াল ডাটা রিসিভ
//     socketRef.current.on("subscribed", (data) => {
//       if (data?.messages) setMessages(data.messages);
//       if (data?.current) setCurrentLocation(data.current);
//     });

//     // লাইভ লোকেশন আপডেট ইভেন্ট লিসেনার
//     socketRef.current.on("locationUpdate", (loc: OrderTracking) => {
//       setCurrentLocation(loc);
//       setTracking((prev) => [loc, ...prev]); // হিস্ট্রির শুরুতেও অ্যাড করে দেওয়া হলো
//     });

//     // রিয়েল-টাইম নতুন মেসেজ হ্যান্ডলার
//     socketRef.current.on("newMessage", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     // মেমোরি লিক বন্ধ করতে আনমাউন্ট ও ডিসকানেক্ট
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, [isOpen, orderId]);

//   // মেসেজ সেন্ড করার ফাংশন
//   const handleSendMessage = () => {
//     if (!newMessage.trim()) return;
//     socketRef.current?.emit("sendMessage", { orderId, message: newMessage.trim() });
//     setNewMessage("");
//   };

//   // ইনপুট বক্সে Enter চাপলে মেসেজ সেন্ড করার হ্যান্ডলার
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.95 }}
//           className="bg-surface-0 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-surface-300"
//         >
//           {/* Header */}
//           <div className="p-5 border-b border-surface-300 flex justify-between items-center bg-surface-50">
//             <div className="flex items-center gap-2">
//               <Package className="w-5 h-5 text-brand-500" />
//               <h2 className="text-base font-bold text-text-primary">
//                 Order Reference: <span className="font-mono text-brand-600">#{orderId.slice(-6).toUpperCase()}</span>
//               </h2>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-1.5 hover:bg-surface-200 text-text-secondary hover:text-text-primary rounded-xl transition-colors border border-surface-300 bg-surface-0 shadow-sm"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>

//           {/* Modal Grid Content */}
//           <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">

//             {/* Left Side: Actions & Tracking System */}
//             <div className="space-y-4">
//               <button
//                 onClick={() => window.open(`/api/orders/${orderId}/invoice`)}
//                 className="flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-3 rounded-xl w-full text-xs font-bold uppercase hover:bg-brand-700 shadow-sm transition-colors"
//               >
//                 <Download className="w-4 h-4" /> Download Invoice Sheet
//               </button>

//               <div className="bg-surface-50 p-5 rounded-2xl border border-surface-300 space-y-3">
//                 <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
//                   <MapPin className="text-brand-500 w-4 h-4" /> Fleet Tracking Status
//                 </h3>
//                 <div className="p-3 bg-surface-0 rounded-xl border border-surface-200">
//                   <p className="text-xs text-text-secondary font-medium">Current Hub Stage:</p>
//                   <p className="text-sm font-bold text-text-primary mt-0.5">
//                     {currentLocation ? currentLocation.stage : "Awaiting transmission..."}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Right Side: Operational Support Chat */}
//             <div className="bg-surface-0 border border-surface-300 rounded-2xl flex flex-col h-[350px] overflow-hidden shadow-sm">
//               <div className="p-4 border-b border-surface-300 bg-surface-50 font-bold text-xs text-text-primary flex items-center gap-2">
//                 <MessageSquare className="w-3.5 h-3.5 text-brand-500" /> Live Logs / Support Chat
//               </div>

//               {/* Chat Container */}
//               <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-surface-50/50">
//                 {messages.length === 0 ? (
//                   <div className="text-center text-text-muted text-xs mt-10 font-medium">No conversion logs found.</div>
//                 ) : (
//                   messages.map((m, i) => {
//                     const isStudent = m.sender?.role === "STUDENT";
//                     return (
//                       <div
//                         key={i}
//                         className={`flex flex-col max-w-[80%] ${isStudent ? "ml-auto items-end" : "mr-auto items-start"}`}
//                       >
//                         <div
//                           className={`p-3 rounded-2xl text-xs font-medium shadow-sm border ${isStudent
//                               ? "bg-brand-500 text-white border-brand-600 rounded-tr-none"
//                               : "bg-surface-0 text-text-primary border-surface-300 rounded-tl-none"
//                             }`}
//                         >
//                           {m.message}
//                         </div>
//                         <span className="text-[9px] font-mono text-text-muted mt-1 px-1">
//                           {isStudent ? "Student" : `${m.sender?.firstName || 'Staff'}`}
//                         </span>
//                       </div>
//                     );
//                   })
//                 )}
//                 <div ref={chatEndRef} />
//               </div>

//               {/* Chat Controls */}
//               <div className="p-3 border-t border-surface-300 bg-surface-0 flex gap-2 items-center">
//                 <input
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   className="flex-1 border border-surface-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-500 transition-all text-text-primary placeholder-text-muted"
//                   placeholder="Type updates or message..."
//                 />
//                 <button
//                   onClick={handleSendMessage}
//                   disabled={!newMessage.trim()}
//                   className="bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-xl transition-all disabled:opacity-40 shadow-sm"
//                 >
//                   <Send className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// }



"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { orderService, type Order } from "@/lib/api/OrderApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Package,
  Receipt,
  MapPin,
  MessageSquare,
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


const LiveMap = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="h-52 w-full bg-surface-100 flex items-center justify-center text-xs text-text-muted">Loading Live Satellite Vector...</div>
});

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

const ORDER_STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  PROCESSING: { label: "Processing", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Truck className="w-3.5 h-3.5" /> },
  COMPLETED: { label: "Completed", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CANCELLED: { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const PAYMENT_STATUS_META: Record<string, { label: string; color: string }> = {
  UNPAID: { label: "Unpaid", color: "text-red-600 bg-red-50 border-red-200" },
  PARTIAL: { label: "Partial", color: "text-amber-600 bg-amber-50 border-amber-200" },
  PAID: { label: "Paid", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  REFUNDED: { label: "Refunded", color: "text-purple-600 bg-purple-50 border-purple-200" },
};

const TRACKING_STAGE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PLACED: { label: "Order Placed", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Package className="w-3.5 h-3.5" /> },
  CONFIRMED: { label: "Confirmed", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  PREPARING: { label: "Preparing", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-600 bg-orange-50 border-orange-200", icon: <Truck className="w-3.5 h-3.5" /> },
  DELIVERED: { label: "Delivered", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

function orderStatusMeta(status?: string) { return ORDER_STATUS_META[status ?? ""] ?? { label: status ?? "PENDING", color: "text-gray-600 bg-gray-50 border-gray-200", icon: <Clock className="w-3.5 h-3.5" /> }; }
function paymentStatusMeta(status?: string) { return PAYMENT_STATUS_META[status ?? ""] ?? { label: status ?? "UNPAID", color: "text-gray-600 bg-gray-50 border-gray-200" }; }
function trackingStageMeta(stage?: string) { return TRACKING_STAGE_META[stage ?? ""] ?? { label: stage ?? "", color: "text-gray-600 bg-gray-50 border-gray-200", icon: <Navigation className="w-3.5 h-3.5" /> }; }

let _socket: Socket | null = null;
function getSocket(token: string): Socket {
  if (!_socket) {
    _socket = io(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/order-tracking`, {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return _socket;
}

function StatusBadge({ label, color, icon }: { label: string; color: string; icon?: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${color}`}>
      {icon} {label}
    </span>
  );
}

// ─── MAIN MODAL COMPONENT ───────────────────────────────────────────────────────

interface ModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string; // কারেন্ট লগইন করা ইউজারের আইডি পাস করতে হবে প্রপস থেকে
}

export default function OrderDetailsModal({ orderId, isOpen, onClose, currentUserId }: ModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [currentLocation, setCurrentLocation] = useState<TrackingPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    // REST API থেকে মূল অর্ডারের বিবরণ নিয়ে আসা
    api.get(`/orders/${orderId}`)
      .then(({ data }) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load order details");
        setLoading(false);
      });

    const token = localStorage.getItem("token") || "";
    const socket = getSocket(token);
    socketRef.current = socket;

    socket.emit("subscribeToOrder", { orderId });

    socket.on("subscribed", (data) => {
      if (data?.messages) setMessages(data.messages);
      if (data?.current) setCurrentLocation(data.current);
    });

    socket.on("locationUpdate", (loc: TrackingPoint) => {
      if (loc.orderId === orderId) setCurrentLocation(loc);
    });

    return () => {
      socket.emit("unsubscribeFromOrder", { orderId });
      socket.off("subscribed");
      socket.off("locationUpdate");
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-0 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-surface-300"
        >
          {/* Header */}
          <div className="p-5 border-b border-surface-300 flex justify-between items-center bg-surface-50">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-500" />
              <h2 className="text-base font-bold text-text-primary">
                Manage Order: <span className="font-mono text-brand-600">#{orderId.slice(-6).toUpperCase()}</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-surface-200 text-text-secondary hover:text-text-primary rounded-xl transition-colors border border-surface-300 bg-surface-0 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 gap-2">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-xs text-text-muted font-medium">Fetching sync streams...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">
              {/* Left Column: Metrics & Live Tracking Map */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-3 rounded-xl w-full text-xs font-bold uppercase hover:bg-brand-700 shadow-sm transition-colors"
                >
                  <Receipt className="w-4 h-4" /> View Sheet & Summary
                </button>

                {/* React Leaflet ইন্টিগ্রেটেড প্যানেল */}
                <div className="rounded-xl border border-surface-200 overflow-hidden bg-surface-0 shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-surface-50 border-b border-surface-200">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-500" />
                      <span className="text-xs font-black uppercase text-text-primary">Live Geo-Tracking</span>
                    </div>
                    {currentLocation && (
                      <StatusBadge
                        label={trackingStageMeta(currentLocation.stage).label}
                        color={trackingStageMeta(currentLocation.stage).color}
                        icon={trackingStageMeta(currentLocation.stage).icon}
                      />
                    )}
                  </div>

                  {/* Leaflet ডাইনামিক ম্যাপ রেন্ডার */}
                  <LiveMap tracking={currentLocation} />

                  {currentLocation ? (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-surface-0 text-[10px] text-text-muted font-mono">
                      <span>
                        Node: {currentLocation.staff.firstName} {currentLocation.staff.lastName}
                      </span>
                      {currentLocation.note && <span className="italic">"{currentLocation.note}"</span>}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-text-muted bg-surface-50/50">
                      Location synchronization will initiate upon deployment to logistics.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Chat Integration */}
              <div>
                <ChatPanel
                  orderId={orderId}
                  socket={socketRef.current}
                  initialMessages={messages}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Embedded Sub-Modal for Invoice Spreadsheet */}
      {showInvoiceModal && order && (
        <InvoiceModal order={order} onClose={() => setShowInvoiceModal(false)} />
      )}
    </AnimatePresence>
  );
}

// ─── CHAT PANEL SUB-COMPONENT ──────────────────────────────────────────────────

function ChatPanel({ orderId, socket, initialMessages, currentUserId }: { orderId: string; socket: Socket | null; initialMessages: OrderMessage[]; currentUserId: string; }) {
  const [messages, setMessages] = useState<OrderMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: OrderMessage) => {
      if (msg.orderId === orderId) setMessages((prev) => [...prev, msg]);
    };
    socket.on("newMessage", handler);
    return () => { socket.off("newMessage", handler); };
  }, [socket, orderId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || !socket) return;
    socket.emit("sendMessage", { orderId, message: trimmed });
    setInput("");
  };

  return (
    <div className="flex flex-col h-[360px] border border-surface-200 rounded-2xl overflow-hidden bg-surface-0 shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-200 bg-surface-50">
        <MessageSquare className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-black uppercase text-text-primary">Operational Node logs</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50/30">
        {messages.length === 0 && (
          <p className="text-center text-xs text-text-muted py-12">No communication streams recorded.</p>
        )}
        {messages.map((m) => {
          const isMine = m.sender.id === currentUserId;
          return (
            <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed border ${
                isMine ? "bg-brand-600 text-white border-brand-700 rounded-tr-none" : "bg-surface-0 text-text-primary border-surface-200 rounded-tl-none"
              }`}>
                {m.message}
              </div>
              <span className="text-[9px] font-mono text-text-muted mt-1 px-1">
                {isMine ? "You" : `${m.sender.firstName} (${m.sender.role})`}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 p-3 border-t border-surface-200 bg-surface-0">
        <input
          className="flex-1 text-xs bg-surface-50 border border-surface-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-text-primary"
          placeholder="Dispatch message to client..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="p-2.5 bg-brand-600 text-white rounded-xl disabled:opacity-40 hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── INVOICE MODAL SUB-COMPONENT ────────────────────────────────────────────────

function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void; }) {
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

  const paidAmount = order.payments?.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const balanceDue = Math.max(Number(order.total) - paidAmount, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface-0 rounded-2xl w-full max-w-md shadow-2xl border border-surface-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-500" />
            <h2 className="font-black text-text-primary text-sm">Invoice / Ledger Sheet</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto text-xs">
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-50 text-[10px] uppercase text-text-muted font-bold">
                <tr>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5 text-right">Qty</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 text-text-primary">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2.5">{item.device?.name}</td>
                    <td className="p-2.5 text-right font-mono">{item.quantity}</td>
                    <td className="p-2.5 text-right font-mono">${Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1.5 border-t pt-3 font-mono text-text-secondary">
            <div className="flex justify-between"><span>Subtotal:</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
            <div className="flex justify-between text-brand-600 font-bold"><span>Total Valuation:</span><span>${Number(order.total).toFixed(2)}</span></div>
            <div className="flex justify-between text-emerald-600 font-bold"><span>Paid Amount:</span><span>${paidAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-red-500 font-bold"><span>Balance Due:</span><span>${balanceDue.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="p-4 bg-surface-50 border-t flex gap-2">
          <button onClick={handleDownload} disabled={downloading} className="w-full py-2 bg-brand-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-brand-700 flex items-center justify-center gap-2">
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Download PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}