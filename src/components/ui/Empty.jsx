import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useNavigate } from "react-router-dom";

const Empty = ({ 
  message = "No data available", 
  actionText = "Get Started",
  actionPath = "/book-facility" 
}) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <ApperIcon name="Calendar" size={48} className="mx-auto text-gray-300" />
      </div>
      <h3 className="font-outfit font-semibold text-lg text-gray-900 mb-2">
        {message}
      </h3>
      <p className="text-gray-600 mb-6">
        Start booking facilities to see them appear here.
      </p>
      <Button 
        onClick={() => navigate(actionPath)}
        className="inline-flex items-center gap-2"
      >
        <ApperIcon name="Plus" size={16} />
        {actionText}
      </Button>
    </div>
  );
};

export default Empty;