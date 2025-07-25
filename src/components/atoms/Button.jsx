import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "default", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700 hover:scale-105 focus:ring-primary",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:scale-102 focus:ring-gray-300",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 hover:scale-102",
    success: "bg-accent text-white hover:bg-green-600 hover:scale-105 focus:ring-accent"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    default: "px-6 py-3 text-sm rounded-lg",
    lg: "px-8 py-4 text-base rounded-xl"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;