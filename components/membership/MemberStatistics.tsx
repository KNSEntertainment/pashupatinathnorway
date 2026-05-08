"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, MapPin, Activity } from "lucide-react";

interface MemberStats {
  totalMembers: number;
  generalMembersCount: number;
  activeMembersCount: number;
  recentRegistrations: number;
  growthPercentage: number;
  topFylke: Array<{ _id: string; count: number }>;
  lastUpdated: string;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  duration = 2000, 
  suffix = "", 
  prefix = "" 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * value);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = "#3b82f6",
  label
}) => {
  const [progress, setProgress] = useState(0);
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-2000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">
          <AnimatedNumber value={value} />
        </span>
        <span className="text-xs text-gray-600 mt-1">{label}</span>
      </div>
    </div>
  );
};

export default function MemberStatistics() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/membership/statistics");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-blue-200 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-blue-200 rounded"></div>
              <div className="h-16 bg-blue-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">Unable to load member statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
          Community Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Members with animated number */}
        <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Members</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            <AnimatedNumber value={stats.totalMembers} />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
          </div>
        </div>

        {/* Member Type Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <CircularProgress
              value={stats.activeMembersCount}
              max={stats.totalMembers}
              size={100}
              strokeWidth={6}
              color="#10b981"
              label="Active"
            />
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <CircularProgress
              value={stats.generalMembersCount}
              max={stats.totalMembers}
              size={100}
              strokeWidth={6}
              color="#3b82f6"
              label="General"
            />
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${stats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-sm font-medium text-gray-700">30-Day Growth</span>
          </div>
          <div className={`text-lg font-bold ${stats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.growthPercentage >= 0 ? '+' : ''}{stats.growthPercentage}%
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">New Members (30 days)</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            <AnimatedNumber value={stats.recentRegistrations} />
          </div>
        </div>

        {/* Top Counties */}
        {stats.topFylke && stats.topFylke.length > 0 && (
          <div className="p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Top Counties</span>
            </div>
            <div className="space-y-2">
              {stats.topFylke.map((fylke, index) => (
                <div key={fylke._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {index + 1}. {fylke._id}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    <AnimatedNumber value={fylke.count} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
