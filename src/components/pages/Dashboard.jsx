import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addDays, endOfWeek, format, isWithinInterval, startOfWeek } from "date-fns";
import Chart from "react-apexcharts";
import { timeSlotService } from "@/services/api/timeSlotService";
import { bookingService } from "@/services/api/bookingService";
import { facilityService } from "@/services/api/facilityService";
import ApperIcon from "@/components/ApperIcon";
import BookingCard from "@/components/molecules/BookingCard";
import DashboardStats from "@/components/organisms/DashboardStats";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
const Dashboard = () => {
  const navigate = useNavigate();
  const [todayBookings, setTodayBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [favoriteFacilities, setFavoriteFacilities] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState({ options: {}, series: [] });
const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteTimes, setFavoriteTimes] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [bookings, facilities] = await Promise.all([
        bookingService.getAll(),
        facilityService.getAll()
      ]);

      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
// Today's bookings
      const todayBookings = bookings.filter(booking => booking.date === today);
      setTodayBookings(todayBookings);
      
      // Calculate favorite times (most frequently booked facility-time combinations)
      const timeSlotCounts = {};
      bookings.forEach(booking => {
        const key = `${booking.facilityName}-${booking.startTime}`;
        timeSlotCounts[key] = (timeSlotCounts[key] || 0) + 1;
      });
      
      const favoriteSlots = Object.entries(timeSlotCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([key, count]) => {
          const [facilityName, startTime] = key.split('-');
          const facility = facilities.find(f => f.name === facilityName);
          return {
            facilityName,
            facilityId: facility?.Id,
            startTime,
            count
          };
        })
        .filter(slot => slot.facilityId);
      
      setFavoriteTimes(favoriteSlots);
      // Upcoming bookings (next 3 days)
      const next3Days = Array.from({ length: 3 }, (_, i) => format(addDays(now, i + 1), "yyyy-MM-dd"));
      const upcomingBookings = bookings.filter(booking => next3Days.includes(booking.date));
      setUpcomingBookings(upcomingBookings);
      
      // Calculate favorite facilities (most booked)
      const facilityBookings = {};
      bookings.forEach(booking => {
        facilityBookings[booking.facilityId] = (facilityBookings[booking.facilityId] || 0) + 1;
      });
      
      const sortedFacilities = facilities
        .map(facility => ({
          ...facility,
          bookingCount: facilityBookings[facility.Id] || 0
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 3);
      
      setFavoriteFacilities(sortedFacilities);
      
      // Weekly chart data
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      
      const dailyBookings = weekDays.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        return bookings.filter(booking => booking.date === dayStr).length;
      });
      
      setWeeklyChartData({
        options: {
          chart: {
            type: 'area',
            height: 300,
            toolbar: { show: false },
            foreColor: '#6B7280'
          },
          dataLabels: { enabled: false },
          stroke: {
            curve: 'smooth',
            width: 3,
            colors: ['#2563EB']
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.4,
              opacityTo: 0.1,
              stops: [0, 100]
            },
            colors: ['#2563EB']
          },
          grid: {
            borderColor: '#E5E7EB',
            strokeDashArray: 3
          },
          xaxis: {
            categories: weekDays.map(day => format(day, 'EEE')),
            axisBorder: { show: false },
            axisTicks: { show: false }
          },
          yaxis: {
            title: { text: 'Bookings' }
          },
          tooltip: {
            theme: 'light'
          }
        },
        series: [{
          name: 'Bookings',
          data: dailyBookings
        }]
      });
      
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const allBookings = [...todayBookings, ...upcomingBookings];
      const booking = allBookings.find(b => b.Id === bookingId);
      if (!booking) return;

      // Find and update the corresponding time slot
      const timeSlots = await timeSlotService.getAll();
      const timeSlot = timeSlots.find(slot => 
        slot.facilityId === booking.facilityId &&
        slot.date === booking.date &&
        slot.startTime === booking.startTime
      );

      if (timeSlot) {
        await timeSlotService.update(timeSlot.Id, { isAvailable: true });
      }

      // Delete the booking
      await bookingService.delete(bookingId);
      
      // Refresh dashboard
      await loadDashboardData();
      
      toast.success("Booking cancelled successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  const handleQuickBook = (facilityId) => {
navigate(`/book-facility?facility=${facilityId}`);
  };

  const handleQuickRebook = async (favoriteTime) => {
    try {
      // Create a mock booking object for rebooking
      const mockBooking = {
        facilityId: favoriteTime.facilityId,
        facilityName: favoriteTime.facilityName,
        startTime: favoriteTime.startTime
      };
      
      await bookingService.rebook(null, mockBooking);
      toast.success(`Successfully booked ${favoriteTime.facilityName} at ${favoriteTime.startTime}!`);
    } catch (error) {
      toast.error(error.message || 'Failed to book favorite time slot');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;
return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-3xl text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Ready for your workout? Check your activity and book your favorite facilities.
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

      <DashboardStats />

      {/* Weekly Usage Chart */}
      <Card className="p-6">
        <h2 className="font-outfit font-bold text-xl text-gray-900 mb-6">
          Weekly Activity
        </h2>
        <Chart 
          options={weeklyChartData.options}
          series={weeklyChartData.series}
          type="area"
          height={300}
        />
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-outfit font-bold text-xl text-gray-900">
              Today's Bookings
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/my-bookings")}
              className="text-primary hover:bg-primary/10"
            >
              View All
            </Button>
          </div>

          {todayBookings.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Calendar" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No bookings for today</p>
              <Button onClick={() => navigate("/book-facility")}>
                Book a Facility
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayBookings.slice(0, 3).map((booking) => (
                <BookingCard
                  key={booking.Id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-outfit font-bold text-xl text-gray-900">
              Next 3 Days
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/my-bookings")}
              className="text-primary hover:bg-primary/10"
            >
              View All
            </Button>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="CalendarDays" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No upcoming bookings</p>
              <Button onClick={() => navigate("/book-facility")}>
                Schedule Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 3).map((booking) => (
                <BookingCard
                  key={booking.Id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Favorite Facilities Quick Book */}
        <Card className="p-6">
          <h2 className="font-outfit font-bold text-xl text-gray-900 mb-6">
            Quick Book Favorites
          </h2>
          <div className="space-y-4">
            {favoriteFacilities.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Heart" size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No favorite facilities yet</p>
                <Button onClick={() => navigate("/book-facility")}>
                  Explore Facilities
                </Button>
              </div>
            ) : (
              favoriteFacilities.map((facility) => (
                <Button
                  key={facility.Id}
                  variant="secondary"
                  className="w-full justify-start gap-3 p-4"
                  onClick={() => handleQuickBook(facility.Id)}
                >
                  <ApperIcon name={facility.icon} size={20} />
                  <div className="text-left">
                    <div className="font-medium">{facility.name}</div>
                    <div className="text-sm text-gray-500">
                      {facility.bookingCount} sessions
                    </div>
                  </div>
                </Button>
              ))
            )}
{/* Favorite Times Section */}
            {favoriteTimes.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Heart" size={20} className="text-red-500" />
                    <h2 className="font-outfit font-semibold text-xl text-gray-900">
                      Favorite Times
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500">Quick rebook your favorites</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {favoriteTimes.map((favoriteTime, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                          <ApperIcon 
                            name={favoriteTime.facilityName === 'Pool' ? 'Waves' : 
                                  favoriteTime.facilityName === 'Gym' ? 'Dumbbell' :
                                  favoriteTime.facilityName === 'Tennis Court' ? 'Trophy' : 'Activity'} 
                            size={16} 
                            className="text-primary" 
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{favoriteTime.facilityName}</p>
                          <p className="text-sm text-gray-600">{favoriteTime.startTime} • Booked {favoriteTime.count} times</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleQuickRebook(favoriteTime)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ApperIcon name="RotateCcw" size={14} />
                        Rebook
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            <Button
              variant="primary"
              className="w-full justify-start gap-3 p-4"
              onClick={() => navigate("/book-facility")}
            >
              <ApperIcon name="Plus" size={20} />
              <div className="text-left">
                <div className="font-medium">Book Any Facility</div>
                <div className="text-sm opacity-90">Browse all options</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>

      {/* Mobile Quick Action Button */}
      <div className="sm:hidden fixed bottom-20 right-4">
        <Button 
          onClick={() => navigate("/book-facility")}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <ApperIcon name="Plus" size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;