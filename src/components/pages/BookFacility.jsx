import React from "react";
import FacilityList from "@/components/organisms/FacilityList";

const BookFacility = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-3xl text-gray-900 mb-2">
            Book a Facility
          </h1>
          <p className="text-gray-600">
            Choose from our available facilities and book your preferred time slot.
          </p>
        </div>
      </div>

      <FacilityList />
    </div>
  );
};

export default BookFacility;