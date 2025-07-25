import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { creditService } from '@/services/api/creditService';
import { cn } from '@/utils/cn';

const Membership = () => {
  const [membershipData, setMembershipData] = useState(null);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const creditPackages = [
    { id: 1, credits: 5, price: 9.99, popular: false },
    { id: 2, credits: 10, price: 17.99, popular: true },
    { id: 3, credits: 20, price: 29.99, popular: false }
  ];

  useEffect(() => {
    loadMembershipData();
  }, []);

  const loadMembershipData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [credits, membership, history] = await Promise.all([
        creditService.getCredits(),
        creditService.getMembershipStatus(),
        creditService.getUsageHistory()
      ]);
      
      setMembershipData({ credits, ...membership });
      setUsageHistory(history);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load membership data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCredits = async (packageItem) => {
    try {
      setPurchasing(packageItem.id);
      
      await creditService.purchaseCredits(packageItem.credits, packageItem.price);
      
      toast.success(`Successfully purchased ${packageItem.credits} credits!`);
      await loadMembershipData();
    } catch (err) {
      toast.error('Failed to purchase credits');
    } finally {
      setPurchasing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-accent text-white';
      case 'expired': return 'bg-error text-white';
      case 'trial': return 'bg-warning text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUsageTypeIcon = (type) => {
    switch (type) {
      case 'booking': return 'Calendar';
      case 'purchase': return 'Plus';
      case 'refund': return 'RotateCcw';
      default: return 'CreditCard';
    }
  };

  const getUsageTypeColor = (type) => {
    switch (type) {
      case 'booking': return 'text-error';
      case 'purchase': return 'text-accent';
      case 'refund': return 'text-info';
      default: return 'text-gray-500';
    }
  };

  const filteredHistory = usageHistory.filter(item => {
    if (historyFilter === 'all') return true;
    return item.type === historyFilter;
  });

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadMembershipData} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership</h1>
          <p className="text-gray-600 mt-2">Manage your credits and membership status</p>
        </div>
      </div>

      {/* Membership Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ApperIcon name="CreditCard" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900">{membershipData?.credits || 0}</p>
              <p className="text-sm text-gray-500">Credits</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-full">
              <ApperIcon name="Users" size={24} className="text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Membership Status</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(membershipData?.status)}>
                  {membershipData?.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-full">
              <ApperIcon name="Calendar" size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Renewal Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {membershipData?.renewalDate 
                  ? format(new Date(membershipData.renewalDate), 'MMM dd, yyyy')
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Credit Packages */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <Card key={pkg.id} className={cn(
              "p-6 relative",
              pkg.popular && "ring-2 ring-primary"
            )}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-3 py-1">Most Popular</Badge>
                </div>
              )}
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <ApperIcon name="Zap" size={32} className="text-primary" />
                  <span className="text-3xl font-bold text-gray-900">{pkg.credits}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">Credits</p>
                <p className="text-2xl font-bold text-primary mb-6">${pkg.price}</p>
                
                <Button
                  onClick={() => handlePurchaseCredits(pkg)}
                  disabled={purchasing === pkg.id}
                  className="w-full"
                >
                  {purchasing === pkg.id ? (
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Loader2" size={16} className="animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage History */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Usage History</h2>
          
          <div className="flex items-center gap-4">
            <select
              value={historyFilter}
              onChange={(e) => {
                setHistoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Transactions</option>
              <option value="booking">Bookings</option>
              <option value="purchase">Purchases</option>
              <option value="refund">Refunds</option>
            </select>
          </div>
        </div>

        {paginatedHistory.length === 0 ? (
          <Empty 
            icon="History"
            title="No usage history"
            description="Your credit usage history will appear here"
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Description</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Credits</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(item.date), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ApperIcon 
                            name={getUsageTypeIcon(item.type)} 
                            size={16} 
                            className={getUsageTypeColor(item.type)}
                          />
                          <span className="text-sm font-medium capitalize">{item.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className={cn(
                        "px-6 py-4 text-sm font-medium text-right",
                        item.type === 'booking' ? 'text-error' : 'text-accent'
                      )}>
                        {item.type === 'booking' ? '-' : '+'}{Math.abs(item.credits)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} entries
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ApperIcon name="ChevronLeft" size={16} />
                    </Button>
                    
                    <span className="px-3 py-1 text-sm text-gray-600">
                      {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ApperIcon name="ChevronRight" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Membership;