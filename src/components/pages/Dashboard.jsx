import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addDays, endOfWeek, format, isWithinInterval, startOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import Chart from "react-apexcharts";
import { timeSlotService } from "@/services/api/timeSlotService";
import { bookingService } from "@/services/api/bookingService";
import { facilityService } from "@/services/api/facilityService";
import { creditService } from "@/services/api/creditService";
import ApperIcon from "@/components/ApperIcon";
import BookingCard from "@/components/molecules/BookingCard";
import DashboardStats from "@/components/organisms/DashboardStats";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
const Dashboard = () => {
  const navigate = useNavigate();
const [todayBookings, setTodayBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [favoriteFacilities, setFavoriteFacilities] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState({ options: {}, series: [] });
  const [monthlyChartData, setMonthlyChartData] = useState({ options: {}, series: [] });
  const [peakUsageTimes, setPeakUsageTimes] = useState([]);
  const [activityStats, setActivityStats] = useState({});
  const [achievements, setAchievements] = useState([]);
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
      
      const [bookings, facilities, usageHistory, membershipStatus] = await Promise.all([
        bookingService.getAll(),
        facilityService.getAll(),
        creditService.getUsageHistory(),
        creditService.getMembershipStatus()
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

      // Monthly chart data
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const monthDays = Array.from({ length: 30 }, (_, i) => addDays(monthStart, i));
      
      const monthlyDailyBookings = monthDays.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        return bookings.filter(booking => booking.date === dayStr).length;
      });

      setMonthlyChartData({
        options: {
          chart: {
            type: 'line',
            height: 300,
            toolbar: { show: false },
            foreColor: '#6B7280'
          },
          dataLabels: { enabled: false },
          stroke: {
            curve: 'smooth',
            width: 2,
            colors: ['#10B981']
          },
          grid: {
            borderColor: '#E5E7EB',
            strokeDashArray: 3
          },
          xaxis: {
            categories: monthDays.map(day => format(day, 'd')),
            axisBorder: { show: false },
            axisTicks: { show: false },
            title: { text: 'Day of Month' }
          },
          yaxis: {
            title: { text: 'Sessions' }
          },
          tooltip: {
            theme: 'light'
          }
        },
        series: [{
          name: 'Sessions',
          data: monthlyDailyBookings
        }]
      });

      // Calculate peak usage times
      const hourCounts = {};
      bookings.forEach(booking => {
        const hour = parseInt(booking.startTime.split(':')[0]);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakTimes = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour, count]) => ({
          time: `${hour}:00`,
          count,
          percentage: Math.round((count / bookings.length) * 100)
        }));

      setPeakUsageTimes(peakTimes);

      // Calculate activity statistics
      const totalSessions = bookings.length;
      const creditsSpent = usageHistory
        .filter(entry => entry.type === 'booking')
        .reduce((sum, entry) => sum + Math.abs(entry.credits), 0);
      
      const membershipDays = Math.floor(
        (now - new Date(membershipStatus.joinDate)) / (1000 * 60 * 60 * 24)
      );

      const weeklyAverage = Math.round(totalSessions / Math.max(membershipDays / 7, 1));
      const monthlyAverage = Math.round(totalSessions / Math.max(membershipDays / 30, 1));

      setActivityStats({
        totalSessions,
        creditsSpent,
        membershipDays,
        weeklyAverage,
        monthlyAverage,
        averageSessionsPerWeek: weeklyAverage,
        thisWeekSessions: dailyBookings.reduce((sum, count) => sum + count, 0),
        thisMonthSessions: monthlyDailyBookings.reduce((sum, count) => sum + count, 0)
      });

      // Calculate achievements
      const achievementsList = [];
      
      if (totalSessions >= 1) {
        achievementsList.push({ 
          name: 'First Session', 
          description: 'Completed your first booking',
          icon: 'Star',
          variant: 'success',
          unlocked: true
        });
      }
      
      if (totalSessions >= 10) {
        achievementsList.push({ 
          name: 'Regular Member', 
          description: 'Completed 10+ sessions',
          icon: 'Trophy',
          variant: 'primary',
          unlocked: true
        });
      }
      
      if (totalSessions >= 25) {
        achievementsList.push({ 
          name: 'Fitness Enthusiast', 
          description: 'Completed 25+ sessions',
          icon: 'Award',
          variant: 'secondary',
          unlocked: true
        });
      }
      
      if (totalSessions >= 50) {
        achievementsList.push({ 
          name: 'Fitness Champion', 
          description: 'Achieved 50+ sessions',
          icon: 'Crown',
          variant: 'warning',
          unlocked: true
        });
      }

      if (weeklyAverage >= 3) {
        achievementsList.push({ 
          name: 'Consistency Pro', 
          description: 'Average 3+ sessions per week',
          icon: 'Target',
          variant: 'success',
          unlocked: true
        });
      }

      // Add locked achievements
      if (totalSessions < 100) {
        achievementsList.push({ 
          name: 'Century Club', 
          description: 'Complete 100 sessions',
          icon: 'Medal',
          variant: 'default',
          unlocked: false,
          progress: totalSessions,
          target: 100
        });
      }

      setAchievements(achievementsList);
      
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
{/* My Activity Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="font-outfit font-bold text-2xl text-gray-900 mb-2">
            My Activity Dashboard
          </h2>
          <p className="text-gray-600">Track your fitness journey and achievements</p>
        </div>

        {/* Activity Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <ApperIcon name="Calendar" size={24} className="text-primary" />
              <div className="text-2xl font-bold text-gray-900">{activityStats.totalSessions || 0}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <ApperIcon name="CreditCard" size={24} className="text-accent" />
              <div className="text-2xl font-bold text-gray-900">{activityStats.creditsSpent || 0}</div>
              <div className="text-sm text-gray-600">Credits Spent</div>
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <ApperIcon name="TrendingUp" size={24} className="text-secondary" />
              <div className="text-2xl font-bold text-gray-900">{activityStats.weeklyAverage || 0}</div>
              <div className="text-sm text-gray-600">Weekly Average</div>
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <ApperIcon name="Clock" size={24} className="text-warning" />
              <div className="text-2xl font-bold text-gray-900">{activityStats.membershipDays || 0}</div>
              <div className="text-sm text-gray-600">Member Days</div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weekly Usage Chart */}
          <Card className="p-6">
            <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4">
              Weekly Activity
            </h3>
            <Chart 
              options={weeklyChartData.options}
              series={weeklyChartData.series}
              type="area"
              height={250}
            />
          </Card>

          {/* Monthly Usage Chart */}
          <Card className="p-6">
            <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4">
              Monthly Trend
            </h3>
            <Chart 
              options={monthlyChartData.options}
              series={monthlyChartData.series}
              type="line"
              height={250}
            />
          </Card>
        </div>

        {/* Peak Usage Times & Favorite Facilities */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Peak Usage Times */}
          <Card className="p-6">
            <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Clock" size={20} />
              Peak Usage Times
            </h3>
            <div className="space-y-3">
              {peakUsageTimes.map((peak, index) => (
                <div key={peak.time} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{peak.time}</div>
                      <div className="text-sm text-gray-600">{peak.count} sessions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">{peak.percentage}%</div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${peak.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Enhanced Favorite Facilities */}
          <Card className="p-6">
            <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Heart" size={20} />
              Favorite Facilities
            </h3>
            <div className="space-y-3">
              {favoriteFacilities.map((facility, index) => (
                <div key={facility.Id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-sm text-gray-600">{facility.bookingCount} visits</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {Math.round((facility.bookingCount / (activityStats.totalSessions || 1)) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Achievement Badges */}
        <Card className="p-6">
          <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <ApperIcon name="Award" size={20} />
            Achievement Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  achievement.unlocked 
                    ? 'border-primary/20 bg-primary/5 hover:bg-primary/10' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    <ApperIcon name={achievement.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{achievement.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{achievement.description}</div>
                    {!achievement.unlocked && achievement.progress && achievement.target && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">
                          {achievement.progress}/{achievement.target}
                        </div>
                        <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <Badge variant={achievement.variant} className="text-xs">
                      Unlocked
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Progress Tracking */}
        <Card className="p-6">
          <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <ApperIcon name="BarChart3" size={20} />
            Progress Tracking
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">This Week</span>
                  <span className="text-sm text-gray-600">
                    {activityStats.thisWeekSessions || 0} / 5 sessions
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((activityStats.thisWeekSessions || 0) / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">This Month</span>
                  <span className="text-sm text-gray-600">
                    {activityStats.thisMonthSessions || 0} / 20 sessions
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((activityStats.thisMonthSessions || 0) / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(((activityStats.totalSessions || 0) / Math.max(activityStats.membershipDays || 1, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Daily Consistency Rate</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-warning/10 rounded-lg">
                <div className="text-lg font-bold text-accent">
                  Next Goal: {activityStats.totalSessions < 50 ? '50 Sessions' : '100 Sessions'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {activityStats.totalSessions < 50 
                    ? `${50 - (activityStats.totalSessions || 0)} sessions to go`
                    : `${100 - (activityStats.totalSessions || 0)} sessions to go`
                  }
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

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