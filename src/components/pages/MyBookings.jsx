import React from "react";
import BookingsList from "@/components/organisms/BookingsList";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-3xl text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">
            View and manage your upcoming facility reservations.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/book-facility")}
          className="hidden sm:flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={20} />
          Book Facility
        </Button>
      </div>

      <BookingsList />
    </div>
  );
};

export default MyBookings;