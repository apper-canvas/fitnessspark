import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ title, value, icon, gradient = false, className }) => {
  return (
    <Card className={`p-6 ${gradient ? 'bg-gradient-to-br from-primary to-secondary text-white' : ''} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${gradient ? 'text-blue-100' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold font-outfit mt-2 ${gradient ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${gradient ? 'bg-white/20' : 'bg-surface'}`}>
          <ApperIcon 
            name={icon} 
            size={24} 
            className={gradient ? 'text-white' : 'text-primary'}
          />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;