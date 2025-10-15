import React, { useState, useRef } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { motion } from "framer-motion";
import { X, MessageCircle, Send } from "lucide-react";
import "../styles/Chatbot.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // ⚙️ Replace this with the logged-in user's ID
  const userId = 1; // Or dynamically get from auth context/session

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 🔗 Backend endpoint (adjust for your setup)
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          question: input,
        }),
      });

      if (!response.ok) throw new Error("Backend returned an error");

      const data = await response.json();

      // Expect backend response { reply: "..." }
      const botReply: Message = {
        sender: "bot",
        text: data.reply || "Sorry, I didn’t understand that.",
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Unable to reach the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Close chatbot when user clicks outside modal
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="chatbot-button"
        whileHover={{ scale: 1.1 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Modal */}
      {isOpen && (
        <div className="chatbot-overlay" onClick={handleOverlayClick}>
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="chatbot-modal"
          >
            <div className="chatbot-header">
              <h2>Chat with AI</h2>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender === "user" ? "user" : "bot"}`}
                >
                  {msg.text}
                </div>
              ))}

              {loading && <div className="message bot">Typing...</div>}
            </div>

            <div className="chatbot-input">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your question..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend} className="send-btn" disabled={loading}>
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
