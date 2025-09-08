"use client";
import { motion, AnimatePresence } from "framer-motion";

// For now, we only have one type of playable diagram. More can be added here.
export function SeesawDiagram({ left_pan, right_pan }) {
  return (
    <div className="my-6 flex flex-col items-center">
      <div className="flex justify-between w-full items-center">
        <AnimatePresence>
          <motion.div
            key={left_pan}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-2/5 h-20 bg-blue-100 border-2 border-blue-400 rounded-lg flex items-center justify-center p-2"
          >
            <p className="text-lg font-bold text-blue-800">{left_pan}</p>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          <motion.div
            key={right_pan}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-2/5 h-20 bg-green-100 border-2 border-green-400 rounded-lg flex items-center justify-center p-2"
          >
            <p className="text-lg font-bold text-green-800">{right_pan}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="w-full h-1 bg-gray-600"></div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "30px solid transparent",
          borderRight: "30px solid transparent",
          borderTop: "40px solid #4A5568",
        }}
      />
      <p className="text-sm text-gray-600 mt-1">Equals Sign (=)</p>
    </div>
  );
}
