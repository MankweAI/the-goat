// FILE: app/components/HomeworkScreen.jsx
// -------------------------------------------------
// MODIFIED - This component now calls the new unified API.
// The main change is in `handleSubmit` which now calls `onGenerateCurriculum`.
// -------------------------------------------------
"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";

export default function HomeworkScreen({
  onGenerateCurriculum, // This prop will now handle the submission
  onBack,
  isLoading,
}) {
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const { goatPoints, level, currentStreak } = useGamification();

  // Clipboard paste image support
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            setImageFile(file);
            setTextInput("");
            setError(null);
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setImageFile(file);
    setTextInput("");
    setError(null);
  };

  const removeImage = () => {
    setImageFile(null);
  };

  const handleSubmit = () => {
    if (!textInput.trim() && !imageFile) {
      setError("Enter a question or upload a photo.");
      return;
    }
    setError(null);

    const formData = new FormData();
    if (textInput.trim()) formData.append("textInput", textInput.trim());
    if (imageFile) formData.append("imageFile", imageFile);

    // Call the main curriculum generation function passed from page.js
    onGenerateCurriculum(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-black"
        >
          &larr; Back
        </button>
        <h2 className="text-xl text-center font-bold">Start with Homework</h2>
        <div className="w-16"></div>
      </div>

      <div className="space-y-6">
        {/* Image Upload Area */}
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {!imageFile ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 flex flex-col items-center justify-center"
            >
              <span className="text-sm font-medium text-purple-700">
                Upload Homework Image
              </span>
              <span className="text-xs text-purple-500 mt-1">
                or paste an image from clipboard
              </span>
            </motion.button>
          ) : (
            <div className="relative w-full">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Homework preview"
                className="w-full h-40 rounded-xl object-contain border bg-gray-50"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Text Input */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 text-center mb-2">
            Or type your question below
          </h3>
          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              if (imageFile) setImageFile(null);
              setError(null);
            }}
            rows={3}
            placeholder="e.g., I don't get grade 10 algebra, especially when there are brackets and fractions."
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/40 outline-none text-sm resize-none"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || (!imageFile && !textInput.trim())}
          className={`w-full font-bold py-3 px-4 rounded-xl text-white text-sm transition-all ${
            isLoading || (!imageFile && !textInput.trim())
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
          }`}
        >
          {isLoading ? "Analyzing & Building Plan..." : "Create Learning Path"}
        </button>
      </div>
    </motion.div>
  );
}
