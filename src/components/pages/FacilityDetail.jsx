import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { facilityService } from '@/services/api/facilityService';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';

const FacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadFacilityDetail();
  }, [id]);

  const loadFacilityDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const facilityData = await facilityService.getDetailedById(parseInt(id));
      setFacility(facilityData);
    } catch (err) {
      console.error('Error loading facility detail:', err);
      setError('Failed to load facility details');
      toast.error('Failed to load facility details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'success', text: 'Open', icon: 'CheckCircle' },
      closed: { variant: 'error', text: 'Closed', icon: 'XCircle' },
      maintenance: { variant: 'warning', text: 'Maintenance', icon: 'Wrench' }
    };
    
    const config = statusConfig[status] || statusConfig.open;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <ApperIcon name={config.icon} size={14} />
        {config.text}
      </Badge>
    );
  };

  const getCurrentStatus = () => {
    if (!facility) return 'closed';
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [openHour, openMinute] = facility.operatingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = facility.operatingHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    if (facility.status === 'maintenance') return 'maintenance';
    if (currentTime >= openTime && currentTime <= closeTime) return 'open';
    return 'closed';
  };

  const handleBookNow = () => {
    navigate('/book-facility', { state: { selectedFacilityId: facility.Id } });
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadFacilityDetail} />;
  if (!facility) return <Error message="Facility not found" />;

  const currentStatus = getCurrentStatus();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="ArrowLeft" size={20} />
          Back
        </Button>
        {getStatusBadge(currentStatus)}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="p-0 overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={facility.images[selectedImage]}
                alt={facility.name}
                className="w-full h-full object-cover"
              />
              {facility.images.length > 1 && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {facility.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        selectedImage === index ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {facility.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {facility.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${facility.name} ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-16 object-cover rounded-lg cursor-pointer transition-all ${
                      selectedImage === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="font-outfit font-bold text-xl text-gray-900 mb-4">About This Facility</h2>
            <p className="text-gray-600 leading-relaxed">{facility.description}</p>
          </Card>

          {/* Equipment */}
          <Card className="p-6">
            <h2 className="font-outfit font-bold text-xl text-gray-900 mb-4">Available Equipment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facility.equipment.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                  <ApperIcon name="CheckCircle" size={20} className="text-accent" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Amenities */}
          <Card className="p-6">
            <h2 className="font-outfit font-bold text-xl text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facility.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                  <ApperIcon name="Star" size={20} className="text-warning" />
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Facility Header */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-surface rounded-lg">
                <ApperIcon name={facility.icon} size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="font-outfit font-bold text-2xl text-gray-900">{facility.name}</h1>
                <p className="text-gray-600">{facility.type}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleBookNow}
              className="w-full"
              disabled={currentStatus === 'maintenance'}
            >
              <ApperIcon name="Calendar" size={20} className="mr-2" />
              Book Now
            </Button>
          </Card>

          {/* Operating Hours */}
          <Card className="p-6">
            <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Clock" size={20} className="text-primary" />
              Operating Hours
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Open</span>
                <span className="font-medium text-gray-900">{facility.operatingHours.open}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Close</span>
                <span className="font-medium text-gray-900">{facility.operatingHours.close}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Status</span>
                  {getStatusBadge(currentStatus)}
                </div>
              </div>
            </div>
          </Card>

          {/* Capacity Info */}
          <Card className="p-6">
            <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Users" size={20} className="text-primary" />
              Capacity Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Maximum Capacity</span>
                <span className="font-medium text-gray-900">{facility.capacity} people</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Booking Duration</span>
                <span className="font-medium text-gray-900">1 hour slots</span>
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-6">
            <h3 className="font-outfit font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Phone" size={20} className="text-primary" />
              Need Help?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ApperIcon name="Phone" size={16} className="text-gray-400" />
                <span className="text-gray-600">Call reception for assistance</span>
              </div>
              <div className="flex items-center gap-3">
                <ApperIcon name="MapPin" size={16} className="text-gray-400" />
                <span className="text-gray-600">Ground floor, main building</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetail;