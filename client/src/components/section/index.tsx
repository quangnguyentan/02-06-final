import { motion } from "framer-motion";
import * as React from "react";

export const CtaSection: React.FC = () => (
  <motion.section
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        Start Your Language Journey Today
      </h2>
      <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
        Join thousands of learners mastering languages with TalkPal AI.
      </p>
      <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition">
        Get Started Now
      </button>
    </div>
  </motion.section>
);

export default CtaSection;
