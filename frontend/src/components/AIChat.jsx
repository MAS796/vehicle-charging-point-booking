import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "../styles/ai-components.css";

const INITIAL_MESSAGE =
  "Hello. I am your EV charging assistant.\n\nYou can ask about charging time, cost, stations, battery health, and booking help.";

const QUICK_QUESTIONS = [
  "How long to charge my EV?",
  "Best time to charge?",
  "Battery health tips",
  "Find nearby stations",
];

function extractReply(payload) {
  if (!payload) return "";

  const direct =
    payload.reply ||
    payload.message ||
    payload.answer ||
    payload.detail ||
    payload.response;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  if (Array.isArray(payload.messages) && payload.messages.length > 0) {
    const lastMessage = payload.messages[payload.messages.length - 1];
    if (typeof lastMessage === "string" && lastMessage.trim()) return lastMessage.trim();
    if (typeof lastMessage?.content === "string" && lastMessage.content.trim()) {
      return lastMessage.content.trim();
    }
  }

  return "";
}

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: INITIAL_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? message).trim();
    if (!text || isLoading) return;

    const userMessage = {
      type: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: text });
      const reply = extractReply(res?.data);
      const botText = reply || "I could not generate a response. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: botText,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        "Sorry, I am having trouble connecting right now.";
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: detail,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="ai-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div className="ai-header-info">
          <h3>EV AI Assistant</h3>
          <span className="ai-status">
            <span className="status-dot" />
            Online
          </span>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type} ${msg.isError ? "error" : ""}`}>
            {msg.type === "bot" && <div className="bot-avatar">AI</div>}
            <div className="message-content">
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot">
            <div className="bot-avatar">AI</div>
            <div className="message-content typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-questions">
        {QUICK_QUESTIONS.map((q) => (
          <button key={q} onClick={() => sendMessage(q)} className="quick-btn" disabled={isLoading}>
            {q}
          </button>
        ))}
      </div>

      <div className="ai-chat-input">
        <input
          type="text"
          placeholder="Ask about EV charging..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button onClick={() => sendMessage()} disabled={isLoading || !message.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
