// FILE: app/components/PastPapersScreen.jsx
// -------------------------------------------------
// REDESIGNED - The UI of this component has been completely overhauled to match the premium
// aesthetic of the QReaderScreen.
// - Upgraded container with a gradient background and larger shadow.
// - Modernized filter controls with icons and better styling.
// - Paper selection items are now visually rich "cards" with hover effects.
// - Improved loading and error states for a more polished feel.
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Make sure you have lucide-react installed: npm install lucide-react
import {
  Book,
  Calendar,
  GraduationCap,
  ChevronLeft,
  ArrowRight,
  BookCopy,
} from "lucide-react";

const MOCK_FILTERS = {
  grades: ["Grade 12", "Grade 11", "Grade 10"],
  subjects: ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting"],
  years: ["2023", "2022", "2021", "2020"],
};

const FilterSelect = ({ id, label, value, onChange, options, icon: Icon }) => (
  <div>
    <label
      htmlFor={id}
      className="flex items-center text-sm font-bold text-gray-700 mb-2"
    >
      <Icon size={16} className="mr-2 text-gray-500" />
      {label}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const PaperCard = ({ paper, onStartSession, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: index * 0.08,
      type: "spring",
      stiffness: 300,
      damping: 25,
    }}
  >
    <button
      onClick={() => onStartSession(paper)}
      className="w-full p-5 rounded-2xl text-left transition-all duration-300 border-2 bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-xl group"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-800 transition-colors duration-300">
            {paper.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {paper.stats?.question_count} Questions | {paper.subject}
          </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-600 transition-colors duration-300">
          <ArrowRight
            size={20}
            className="text-blue-600 group-hover:text-white transition-colors duration-300"
          />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-700">Key Topics:</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
          {paper.stats?.topics?.join(", ")}
        </p>
      </div>
    </button>
  </motion.div>
);

export default function PastPapersScreen({ onStartSession, onBack }) {
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    grade: "Grade 12",
    subject: "Mathematics",
    year: "2023",
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchPapers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/mock-data/mock-papers.json`);
        if (!response.ok) throw new Error("Could not find mock paper data.");
        const data = await response.json();
        setPapers(data);
      } catch (err) {
        setError(
          "Could not load papers. Please ensure mock-papers.json is in the /public/mock-data directory."
        );
        console.error(err);
      } finally {
        setTimeout(() => setIsLoading(false), 500); // Simulate loading for better UX
      }
    };
    fetchPapers();
  }, [filters]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-6 md:p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="text-blue-700 hover:text-blue-900 transition-colors duration-200 flex items-center gap-1"
        >
          <ChevronLeft size={20} /> Back to Home
        </button>
      </div>

      <div className="text-center mb-8">
        <motion.h2
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-extrabold text-blue-900"
        >
          Past Paper Trainer
        </motion.h2>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 mt-2 max-w-xl mx-auto"
        >
          Select a paper to transform it into an interactive study session with
          AI-powered tools.
        </motion.p>
      </div>

      {/* Filter UI */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-md"
      >
        <FilterSelect
          id="grade"
          label="Grade"
          value={filters.grade}
          onChange={handleFilterChange}
          options={MOCK_FILTERS.grades}
          icon={GraduationCap}
        />
        <FilterSelect
          id="subject"
          label="Subject"
          value={filters.subject}
          onChange={handleFilterChange}
          options={MOCK_FILTERS.subjects}
          icon={BookCopy}
        />
        <FilterSelect
          id="year"
          label="Year"
          value={filters.year}
          onChange={handleFilterChange}
          options={MOCK_FILTERS.years}
          icon={Calendar}
        />
      </motion.div>

      {/* Papers List */}
      <div className="space-y-4 min-h-[30vh]">
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center pt-16 text-gray-600"
            >
              <svg
                className="animate-spin h-6 w-6 text-blue-500 mr-3"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Finding papers...
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-8 text-red-600 bg-red-50 rounded-lg"
            >
              {error}
            </motion.div>
          ) : papers.length === 0 ? (
            <motion.div
              key="no-papers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-16 text-gray-500"
            >
              <h3 className="font-bold text-lg">No Papers Found</h3>
              <p>Try adjusting your filters to find a different paper.</p>
            </motion.div>
          ) : (
            papers.map((paper, index) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onStartSession={onStartSession}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
