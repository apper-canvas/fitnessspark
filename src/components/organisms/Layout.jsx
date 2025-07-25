import React from "react";
import Header from "@/components/organisms/Header";
import Navigation from "@/components/organisms/Navigation";
import MobileNavigation from "@/components/organisms/MobileNavigation";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      
      <main className="px-6 py-8 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
};

export default Layout;