import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";

const TimeSlot = ({ timeSlot, onBook, className }) => {
  const handleClick = () => {
    if (timeSlot.isAvailable && onBook) {
      onBook(timeSlot);
    }
  };

  return (
    <Button
      variant={timeSlot.isAvailable ? "success" : "secondary"}
      size="sm"
      onClick={handleClick}
      disabled={!timeSlot.isAvailable}
      className={cn(
        "time-slot",
        timeSlot.isAvailable 
          ? "time-slot-available" 
          : "time-slot-booked",
        className
      )}
    >
      {timeSlot.startTime}
    </Button>
  );
};

export default TimeSlot;