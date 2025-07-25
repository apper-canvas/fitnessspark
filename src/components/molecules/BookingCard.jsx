import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format, parseISO } from "date-fns";

const BookingCard = ({ booking, onCancel, className }) => {
  const bookingDate = parseISO(booking.date);
  const isToday = format(new Date(), "yyyy-MM-dd") === booking.date;
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-surface rounded-lg">
            <ApperIcon 
              name={getFacilityIcon(booking.facilityName)} 
              size={20} 
              className="text-primary" 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-outfit font-semibold text-lg text-gray-900">
                {booking.facilityName}
              </h3>
              {isToday && (
                <Badge variant="primary">Today</Badge>
              )}
            </div>
            <p className="text-gray-600 mb-2">
              {format(bookingDate, "EEEE, MMMM d, yyyy")}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ApperIcon name="Clock" size={16} />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={booking.status === "confirmed" ? "success" : "warning"}
          >
            {booking.status}
          </Badge>
          {booking.status === "confirmed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(booking.Id)}
              className="text-error hover:bg-error/10"
            >
              <ApperIcon name="X" size={16} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const getFacilityIcon = (facilityName) => {
  const iconMap = {
    "Pool": "Waves",
    "Tennis Court": "Trophy",
    "Gym": "Dumbbell",
    "Yoga Studio": "Heart",
    "Squash Court": "Target"
  };
  return iconMap[facilityName] || "MapPin";
};

export default BookingCard;