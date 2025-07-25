import React, { useState } from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import QRCode from "qrcode";
import { format, parseISO } from "date-fns";

const BookingCard = ({ booking, onCancel, onCheckIn, className }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const bookingDate = parseISO(booking.date);
const isToday = format(new Date(), "yyyy-MM-dd") === booking.date;
  
  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        bookingId: booking.Id,
        facilityName: booking.facilityName,
        date: booking.date,
        time: `${booking.startTime}-${booking.endTime}`,
        timestamp: new Date().toISOString()
      });
      const url = await QRCode.toDataURL(qrData);
      setQrCodeUrl(url);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleQRClick = () => {
    setShowQRModal(false);
    onCheckIn(booking.Id);
  };

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
          <div className="flex items-center gap-2">
            <Badge 
              variant={booking.status === "confirmed" ? "success" : "warning"}
            >
              {booking.status}
            </Badge>
            {booking.isCheckedIn && (
              <Badge variant="info">
                Checked In
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {booking.status === "confirmed" && !booking.isCheckedIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={generateQRCode}
                className="text-primary hover:bg-primary/10"
              >
                <ApperIcon name="QrCode" size={16} />
              </Button>
            )}
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
      </div>
      
      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-outfit font-semibold text-lg text-gray-900">
                Check-In QR Code
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:bg-gray-100"
              >
                <ApperIcon name="X" size={16} />
              </Button>
            </div>
            <div className="text-center">
              <div 
                className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                onClick={handleQRClick}
              >
                {qrCodeUrl && (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Click the QR code to check in
              </p>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  {booking.facilityName} • {booking.date} • {booking.startTime}-{booking.endTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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