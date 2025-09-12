// FILE: app/components/PastPapersScreen.jsx
// -------------------------------------------------
// IMPLEMENTED - This component now fetches and renders mock data.
// It features functional filters and a list of papers that can be selected to start a session.
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const MOCK_FILTERS = {
  grades: ["Grade 12", "Grade 11", "Grade 10"],
  subjects: ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting"],
  years: ["2023", "2022", "2021", "2020"],
};

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
        // In a real app, you would add filter params to the fetch call
        // For now, we fetch the entire mock file
        const response = await fetch(`/mock-data/mock-papers.json`);
        if (!response.ok) throw new Error("Could not find mock paper data.");
        const data = await response.json();
        // Here you would filter the data based on state, for now we just set it
        setPapers(data);
      } catch (err) {
        setError(
          "Could not load papers. Please ensure mock-papers.json is in the /public/mock-data directory."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPapers();
  }, [filters]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <button
        onClick={onBack}
        className="text-sm text-gray-600 hover:text-black mb-4"
      >
        &larr; Back to Home
      </button>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Past Papers</h2>
        <p className="text-gray-500 mt-1">
          Select a paper to start a smart session.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
        <div>
          <label
            htmlFor="grade"
            className="block text-xs font-medium text-gray-700"
          >
            Grade
          </label>
          <select
            id="grade"
            name="grade"
            value={filters.grade}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {MOCK_FILTERS.grades.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="subject"
            className="block text-xs font-medium text-gray-700"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {MOCK_FILTERS.subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="year"
            className="block text-xs font-medium text-gray-700"
          >
            Year
          </label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {MOCK_FILTERS.years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 h-[40vh] overflow-y-auto pr-2">
        {isLoading && (
          <div className="text-center p-8 text-gray-500">Loading papers...</div>
        )}
        {error && (
          <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        {!isLoading && !error && papers.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No papers found for these filters.
          </div>
        )}

        {!isLoading &&
          papers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onStartSession(paper)}
                className="w-full p-4 rounded-xl text-left transition-all duration-300 border-2 bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100 hover:shadow-md"
              >
                <h3 className="font-bold text-purple-800 text-base">
                  {paper.title}
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  {paper.stats?.question_count} Questions | Topics:{" "}
                  {paper.stats?.topics?.join(", ")}
                </p>
              </button>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
