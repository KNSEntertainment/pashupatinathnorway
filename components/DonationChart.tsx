"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Calendar } from "lucide-react";
import { formatNOK } from "@/lib/norwegianCurrency";

interface ChartDataPoint {
  date: string;
  amount: number;
  label: string;
}

interface DonationChartProps {
  className?: string;
}

export default function DonationChart({ className = "" }: DonationChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (selectedPeriod: typeof period) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/donations/analytics?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Chart data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
  };

  // Calculate chart dimensions and scales
  const getChartDimensions = () => {
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 40, bottom: 60, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    return { width, height, padding, chartWidth, chartHeight };
  };

  // Calculate scales for the chart
  const getScales = () => {
    if (data.length === 0) return null;

    const { chartWidth, chartHeight } = getChartDimensions();
    const maxAmount = Math.max(...data.map(d => d.amount));
    const minAmount = 0;
    
    const xScale = (index: number) => (index / (data.length - 1)) * chartWidth;
    const yScale = (amount: number) => chartHeight - ((amount - minAmount) / (maxAmount - minAmount)) * chartHeight;

    return { xScale, yScale, maxAmount, minAmount };
  };

  const scales = getScales();

  const renderChart = () => {
    if (!scales || data.length === 0) return null;

    const { width, height, padding } = getChartDimensions();
    const { xScale, yScale } = scales;

    // Generate path for the line
    const linePath = data
      .map((point, index) => {
        const x = padding.left + xScale(index);
        const y = padding.top + yScale(point.amount);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Generate area path (filled area under the line)
    const areaPath = `${linePath} L ${padding.left + xScale(data.length - 1)} ${padding.top + yScale(0)} L ${padding.left} ${padding.top + yScale(0)} Z`;

    return (
      <svg width={width} height={height} className="w-full h-auto">
        {/* Grid lines */}
        <g className="text-gray-300">
          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = padding.top + (percent / 100) * (height - padding.top - padding.bottom);
            return (
              <line
                key={`h-grid-${percent}`}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Vertical grid lines */}
          {data.map((_, index) => {
            const x = padding.left + xScale(index);
            return (
              <line
                key={`v-grid-${index}`}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={height - padding.bottom}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#gradient)"
          opacity="0.3"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#dc2626"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = padding.left + xScale(index);
          const y = padding.top + yScale(point.amount);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#dc2626"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Y-axis labels */}
        {scales && (
          <g className="text-xs text-gray-600">
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = padding.top + (percent / 100) * (height - padding.top - padding.bottom);
              const amount = (scales.maxAmount * (100 - percent)) / 100;
              return (
                <text
                  key={`y-label-${percent}`}
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-gray-600"
                >
                  {formatNOK(amount)}
                </text>
              );
            })}
          </g>
        )}

        {/* X-axis labels */}
        <g className="text-xs text-gray-600">
          {data.map((point, index) => {
            const x = padding.left + xScale(index);
            const label = period === 'yearly' 
              ? point.label 
              : period === 'monthly'
              ? new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <text
                key={index}
                x={x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                className="fill-gray-600"
                transform={`rotate(-45, ${x}, ${height - padding.bottom + 20})`}
              >
                {label}
              </text>
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            Donation Patterns
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('weekly')}
              className="text-xs"
            >
              Weekly
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('monthly')}
              className="text-xs"
            >
              Monthly
            </Button>
            <Button
              variant={period === 'yearly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('yearly')}
              className="text-xs"
            >
              Yearly
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-80 text-red-600">
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p>No donation data available</p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            {renderChart()}
            
            {/* Summary stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Total Periods</p>
                <p className="font-semibold text-lg">{data.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Highest</p>
                <p className="font-semibold text-lg text-green-600">
                  {formatNOK(Math.max(...data.map(d => d.amount)))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Average</p>
                <p className="font-semibold text-lg">
                  {formatNOK(data.reduce((sum, d) => sum + d.amount, 0) / data.length)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Total</p>
                <p className="font-semibold text-lg text-red-600">
                  {formatNOK(data.reduce((sum, d) => sum + d.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
