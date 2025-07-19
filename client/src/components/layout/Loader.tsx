import React from "react";

// --- Component Loader thống nhất ---
export const Loader: React.FC = () => (
  <div className="w-full flex flex-col items-center justify-center h-screen bg-[#212121]">
    <div className="ball">
      <div className="inner">
        <div className="line"></div>
        <div className="line line--two"></div>
        <div className="oval"></div>
        <div className="oval oval--two"></div>
      </div>
    </div>
    <div className="shadow-ball"></div>
  </div>
);
