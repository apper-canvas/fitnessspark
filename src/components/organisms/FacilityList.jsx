import React, { useState, useEffect } from "react";
import FacilityCard from "@/components/molecules/FacilityCard";
import TimeSlot from "@/components/molecules/TimeSlot";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { facilityService } from "@/services/api/facilityService";
import { timeSlotService } from "@/services/api/timeSlotService";
import { bookingService } from "@/services/api/bookingService";
import { creditService } from "@/services/api/creditService";
import { toast } from "react-toastify";
import { format, addDays, isToday, isTomorrow } from "date-fns";
const FacilityList = () => {
const [facilities, setFacilities] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFacility, setExpandedFacility] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [credits, setCredits] = useState(10);
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate array of next 7 days starting from today
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  useEffect(() => {
    loadData();
  }, [selectedDate]);
  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [facilitiesData, timeSlotsData] = await Promise.all([
        facilityService.getAll(),
        timeSlotService.getAll()
      ]);
      setFacilities(facilitiesData);
      setTimeSlots(timeSlotsData);
    } catch (err) {
      setError(err.message || "Failed to load facilities");
    } finally {
      setLoading(false);
    }
  };

const handleBookSlot = async (timeSlot) => {
    try {
      // Check credits first
      const currentCredits = await creditService.getCredits();
      setCredits(currentCredits);
      
      if (currentCredits < 1) {
        toast.error("Insufficient credits to make a booking!");
        return;
      }

      // Show confirmation dialog
      setPendingSlot(timeSlot);
      setShowCreditConfirm(true);
    } catch (err) {
      toast.error(err.message || "Failed to check credits");
    }
  };

  const confirmBooking = async () => {
    if (!pendingSlot) return;
    
    try {
      setBookingSlot(pendingSlot.Id);
      setShowCreditConfirm(false);
      
      const facility = facilities.find(f => f.Id === pendingSlot.facilityId);
      
      const booking = {
        facilityId: pendingSlot.facilityId,
        facilityName: facility.name,
        date: pendingSlot.date,
        startTime: pendingSlot.startTime,
        endTime: pendingSlot.endTime,
        status: "confirmed"
      };

      await bookingService.create(booking);
      
      // Update time slot availability
      await timeSlotService.update(pendingSlot.Id, { isAvailable: false });
      
      // Update credits display
      const newCredits = await creditService.getCredits();
      setCredits(newCredits);
      
      // Refresh data
      await loadData();
      
      toast.success(`Successfully booked ${facility.name} for ${pendingSlot.startTime}! 1 credit deducted.`);
    } catch (err) {
      toast.error(err.message || "Failed to book facility");
    } finally {
      setBookingSlot(null);
      setPendingSlot(null);
    }
  };

  const cancelBooking = () => {
    setShowCreditConfirm(false);
    setPendingSlot(null);
  };

const getFacilityTimeSlots = (facilityId) => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    return timeSlots.filter(slot => 
      slot.facilityId === facilityId && slot.date === selectedDateStr
    );
  };

  const getAvailableSlots = (facilityId) => {
    return getFacilityTimeSlots(facilityId).filter(slot => slot.isAvailable).length;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;
  if (facilities.length === 0) return <Empty message="No facilities available" />;

const formatDateDisplay = (date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE dd");
  };

  const goToPreviousDate = () => {
    const currentIndex = availableDates.findIndex(date => 
      format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  const goToNextDate = () => {
    const currentIndex = availableDates.findIndex(date => 
      format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  const canGoBack = () => {
    const currentIndex = availableDates.findIndex(date => 
      format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );
    return currentIndex > 0;
  };

  const canGoForward = () => {
    const currentIndex = availableDates.findIndex(date => 
      format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );
    return currentIndex < availableDates.length - 1;
  };

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-outfit font-bold text-xl text-gray-900">
            Select Date
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousDate}
              disabled={!canGoBack()}
              className="p-2"
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextDate}
              disabled={!canGoForward()}
              className="p-2"
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {availableDates.map((date) => {
            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            return (
              <button
                key={format(date, "yyyy-MM-dd")}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] ${
                  isSelected
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{formatDateDisplay(date)}</div>
                  <div className="text-xs opacity-80">
                    {format(date, "MMM dd")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.Id}
            facility={facility}
            availableSlots={getAvailableSlots(facility.Id)}
            totalSlots={getFacilityTimeSlots(facility.Id).length}
            onClick={() => setExpandedFacility(
              expandedFacility === facility.Id ? null : facility.Id
            )}
          />
        ))}
      </div>

      {expandedFacility && (
        <div className="animate-slide-in">
          {facilities.filter(f => f.Id === expandedFacility).map((facility) => (
            <Card key={facility.Id} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-surface rounded-lg">
                    <ApperIcon name={facility.icon} size={24} className="text-primary" />
                  </div>
                  <div>
<h3 className="font-outfit font-bold text-xl text-gray-900">
                      {facility.name}
                    </h3>
                    <p className="text-gray-600">
                      Available time slots for {formatDateDisplay(selectedDate)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedFacility(null)}
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {getFacilityTimeSlots(facility.Id).map((timeSlot) => (
                  <TimeSlot
                    key={timeSlot.Id}
                    timeSlot={timeSlot}
                    onBook={handleBookSlot}
                    className={`
                      ${bookingSlot === timeSlot.Id ? 'opacity-50 cursor-wait' : ''}
                    `}
                  />
                ))}
              </div>

{getFacilityTimeSlots(facility.Id).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Clock" size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No time slots available for {formatDateDisplay(selectedDate)}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilityList;