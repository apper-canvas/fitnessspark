import React from "react";

const Loading = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
        ))}
      </div>
    </div>
  );
};

export default Loading;