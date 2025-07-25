import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const FacilityCard = ({ facility, availableSlots, totalSlots, onClick, className }) => {
  const availabilityPercentage = totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;
  
  const getAvailabilityColor = (percentage) => {
    if (percentage >= 70) return "bg-accent";
    if (percentage >= 30) return "bg-warning";
    return "bg-error";
  };

  const getAvailabilityText = (percentage) => {
    if (percentage >= 70) return "High Availability";
    if (percentage >= 30) return "Limited Availability";
    return "Low Availability";
  };

  const getAvailabilityVariant = (percentage) => {
    if (percentage >= 70) return "success";
    if (percentage >= 30) return "warning";
    return "error";
  };

  return (
    <Card 
      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-surface rounded-lg">
            <ApperIcon name={facility.icon} size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-outfit font-semibold text-lg text-gray-900">
              {facility.name}
            </h3>
            <p className="text-sm text-gray-500">{facility.type}</p>
          </div>
        </div>
        <Badge variant={getAvailabilityVariant(availabilityPercentage)}>
          {availableSlots} available
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{getAvailabilityText(availabilityPercentage)}</span>
          <span className="font-medium text-gray-900">{Math.round(availabilityPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getAvailabilityColor(availabilityPercentage)}`}
            style={{ width: `${availabilityPercentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default FacilityCard;