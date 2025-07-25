import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg hover:scale-102",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;