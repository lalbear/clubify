"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { apiClient } from "@/lib/api";

interface SalesAnalyticsProps {
  onAnalyticsUpdated?: () => void;
}

export default function SalesAnalytics({ onAnalyticsUpdated }: SalesAnalyticsProps) {
  const [open, setOpen] = useState(false);
  const [sales, setSales] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    salesByProduct: {},
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSalesData();
    }
  }, [open]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSales();
      if (response.success) {
        setSales(response.sales || []);
        setAnalytics(response.analytics || {
          totalSales: 0,
          salesByProduct: {},
          totalTransactions: 0
        });
      }
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductColor = (index: number) => {
    const colors = [
      "#3B82F6", // Blue
      "#10B981", // Green
      "#F59E0B", // Yellow
      "#EF4444", // Red
      "#8B5CF6", // Purple
      "#06B6D4", // Cyan
      "#84CC16", // Lime
      "#F97316", // Orange
    ];
    return colors[index % colors.length];
  };

  const renderPieChart = () => {
    const products = Object.entries(analytics.salesByProduct);
    if (products.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No sales data available</p>
        </div>
      );
    }

    // Calculate total for percentage calculation
    const total = products.reduce((sum, [, data]: [string, any]) => sum + data.amount, 0);
    
    // Create pie chart segments
    let currentAngle = 0;
    const segments = products.map(([productName, data]: [string, any], index) => {
      const percentage = (data.amount / total) * 100;
      const angle = (data.amount / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      return {
        productName,
        data,
        percentage,
        startAngle,
        endAngle,
        color: getProductColor(index)
      };
    });

    return (
      <div className="space-y-4">
        {/* Pie Chart Visualization */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg width="256" height="256" className="transform -rotate-90">
              {segments.map((segment, index) => {
                const radius = 100;
                const centerX = 128;
                const centerY = 128;
                
                const startAngleRad = (segment.startAngle * Math.PI) / 180;
                const endAngleRad = (segment.endAngle * Math.PI) / 180;
                
                const x1 = centerX + radius * Math.cos(startAngleRad);
                const y1 = centerY + radius * Math.sin(startAngleRad);
                const x2 = centerX + radius * Math.cos(endAngleRad);
                const y2 = centerY + radius * Math.sin(endAngleRad);
                
                const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">${analytics.totalSales.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm font-medium">{segment.productName}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">${segment.data.amount.toFixed(2)}</div>
                <div className="text-xs text-gray-600">{segment.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          View Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales Analytics</DialogTitle>
          <DialogDescription>
            View detailed sales analytics and product performance.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.totalSales.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(analytics.salesByProduct).length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Distribution</CardTitle>
                <CardDescription>
                  Product sales breakdown with visual representation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderPieChart()}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Latest sales transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No sales recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {sales.slice(0, 5).map((sale) => (
                      <div key={sale._id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{sale.product?.name}</h4>
                          <p className="text-sm text-gray-600">
                            {sale.quantity} × ${sale.unitPrice} • {sale.buyer?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${sale.totalAmount}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}





