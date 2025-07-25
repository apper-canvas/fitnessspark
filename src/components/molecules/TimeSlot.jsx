import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";

const TimeSlot = ({ timeSlot, onBook, className, showStatus = false }) => {
  const handleClick = () => {
    if (timeSlot.isAvailable && onBook) {
      onBook(timeSlot);
    }
  };

  const getStatusIndicator = () => {
    if (!showStatus) return null;
    return timeSlot.isAvailable ? (
      <span className="ml-1 text-xs opacity-75">✓</span>
    ) : (
      <span className="ml-1 text-xs opacity-75">✗</span>
    );
  };

  return (
    <Button
      variant={timeSlot.isAvailable ? "success" : "secondary"}
      size="sm"
      onClick={handleClick}
      disabled={!timeSlot.isAvailable}
      className={cn(
        "time-slot relative",
        timeSlot.isAvailable 
          ? "time-slot-available" 
          : "time-slot-booked",
        showStatus && "pr-6",
        className
      )}
    >
      {timeSlot.startTime}
      {getStatusIndicator()}
    </Button>
  );
};

export default TimeSlot;