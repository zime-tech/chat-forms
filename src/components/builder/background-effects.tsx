"use client";

export default function BackgroundEffects() {
  return (
    <div className="relative z-1">
      <div className="absolute top-0 left-0 w-full h-40 bg-purple-600/10 blur-[100px] rounded-full animate-pulse"></div>
      <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full animate-pulse delay-150"></div>
      <div className="absolute top-60 left-20 w-60 h-60 bg-indigo-600/5 blur-[100px] rounded-full animate-pulse delay-300"></div>
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-fuchsia-500/5 blur-[100px] rounded-full"></div>
    </div>
  );
}
