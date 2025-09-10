// FILE: app/components/TopicIntakeScreen.jsx
// -------------------------------------------------
// RE-ARCHITECTED - This component now takes structured data from the API and
// formats it perfectly every time. It renders the AI's suggested options
// as clickable buttons for a better user experience.
// -------------------------------------------------
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AssistantMessage = ({ message, onOptionClick }) => {
  // If content is just a string, render it simply
  if (typeof message.content === "string") {
    return <p className="whitespace-pre-line">{message.content}</p>;
  }

  // If content is a structured object, render the formatted list
  return (
    <div>
      <p className="whitespace-pre-line">{message.content.introText}</p>
      <div className="space-y-2 mt-3">
        {message.content.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onOptionClick(option)}
            className="w-full text-left text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors"
          >
            {`${String.fromCharCode(65 + index)}) ${option}`}
          </button>
        ))}
      </div>
      <p className="whitespace-pre-line mt-3 text-sm text-gray-600">
        {message.content.suggestionText}
      </p>
    </div>
  );
};

export default function TopicIntakeScreen({
  onGenerateCurriculum,
  onBack,
  isLoading,
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey there! I can create a personalized learning plan for you. What topic is on your mind today? 😊",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (content) => {
    if (!content.trim() && !isLoading) return;

    const userMessage = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/clarify-painpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!response.ok) throw new Error("The tutor is currently unavailable.");

      const data = await response.json();

      // The content can be a string OR our new structured message object
      const assistantMessage = {
        role: "assistant",
        content: data.message ? data.message : data.responseText,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.isFinal && data.painPoint) {
        setTimeout(() => {
          onGenerateCurriculum(data.painPoint);
        }, 1500);
      }
    } catch (err) {
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I had a little trouble connecting. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col h-[95vh]">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-black p-2 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-center flex-1">
          <h2 className="text-xl font-bold text-gray-800">Master a Topic</h2>
          <p className="text-sm text-gray-500">Let's narrow it down together</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-grow overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-xs sm:max-w-sm text-sm md:text-base ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-lg"
                  : "bg-gray-200 text-gray-800 rounded-bl-lg"
              }`}
            >
              <AssistantMessage
                message={msg}
                onOptionClick={handleSendMessage}
              />
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="p-3 rounded-2xl bg-gray-200 text-gray-500 rounded-bl-lg">
              <div className="flex items-center justify-center space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4">
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && handleSendMessage(inputValue)
            }
            placeholder="Type your topic here..."
            className="flex-grow p-3 border-2 border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isTyping || isLoading}
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            className="bg-blue-600 text-white font-bold p-3 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isTyping || isLoading || !inputValue.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
