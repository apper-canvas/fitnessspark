import React, { useState } from "react";
import QRCode from "qrcode";
import { addDays, format, parseISO } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const BookingCard = ({ booking, onCancel, onCheckIn, onRebook, onTransfer, className, showRebook = false }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Mock family members data - in real app this would come from props or context
  const familyMembers = [
    { Id: 1, name: "John Smith", relationship: "Self" },
    { Id: 2, name: "Sarah Smith", relationship: "Spouse" },
    { Id: 3, name: "Emma Smith", relationship: "Daughter" },
    { Id: 4, name: "Michael Smith", relationship: "Son" }
  ];

  const handleTransfer = async () => {
    if (!selectedFamilyMember) return;
    
    setTransferring(true);
    try {
      const selectedMember = familyMembers.find(m => m.Id === parseInt(selectedFamilyMember));
      await onTransfer(booking.Id, selectedMember);
      setShowTransferDialog(false);
      setSelectedFamilyMember('');
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setTransferring(false);
    }
  };

  const closeTransferDialog = () => {
    setShowTransferDialog(false);
    setSelectedFamilyMember('');
  };

  const getCurrentFamilyMember = () => {
    return familyMembers.find(m => m.Id === booking.familyMemberId) || familyMembers[0];
  };

  const getAvailableFamilyMembers = () => {
    return familyMembers.filter(m => m.Id !== booking.familyMemberId);
  };

const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const bookingDate = parseISO(booking.date);
  const isToday = format(new Date(), "yyyy-MM-dd") === booking.date;

  const handleRebook = async () => {
    if (onRebook) {
      await onRebook(booking);
    }
  };
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
            {booking.status === "confirmed" && onTransfer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTransferDialog(true)}
                className="text-info hover:bg-info/10"
                title="Transfer Booking"
              >
                <ApperIcon name="ArrowRightLeft" size={16} />
              </Button>
            )}
            {booking.status === "confirmed" && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(booking.Id)}
                className="text-error hover:bg-error/10"
              >
                <ApperIcon name="X" size={16} />
              </Button>
            )}
            {showRebook && (
              <Button
                onClick={handleRebook}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ApperIcon name="RotateCcw" size={16} />
                Rebook
              </Button>
            )}
          </div>
        </div>

        {/* Transfer Dialog */}
        {showTransferDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transfer Booking
              </h3>
              <p className="text-gray-600 mb-4">
                Transfer this booking to another family member. The booking details will remain the same.
              </p>
              
              <div className="bg-gray-51 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Current Owner:</strong> {getCurrentFamilyMember().name} ({getCurrentFamilyMember().relationship})
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Facility:</strong> {booking.facilityName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Date:</strong> {booking.date}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer to:
                </label>
                <select
                  value={selectedFamilyMember}
                  onChange={(e) => setSelectedFamilyMember(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select family member</option>
                  {getAvailableFamilyMembers().map(member => (
                    <option key={member.Id} value={member.Id}>
                      {member.name} ({member.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={closeTransferDialog}
                  disabled={transferring}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleTransfer}
                  disabled={!selectedFamilyMember || transferring}
                >
                  {transferring ? "Transferring..." : "Transfer Booking"}
                </Button>
              </div>
            </div>
          </div>
        )}
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