import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <ApperIcon name="AlertCircle" size={48} className="mx-auto text-error" />
      </div>
      <h3 className="font-outfit font-semibold text-lg text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="inline-flex items-center gap-2">
          <ApperIcon name="RefreshCw" size={16} />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;