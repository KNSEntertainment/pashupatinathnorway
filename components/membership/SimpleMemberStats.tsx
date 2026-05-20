"use client";
import { useState, useEffect } from "react";
import { Users, UserCheck, Crown, Lightbulb } from "lucide-react";

interface MemberStats {
  totalMembers: number;
  generalMembersCount: number;
  activeMembersCount: number;
  executiveMembersCount: number;
  advisorsCount: number;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  duration = 1500 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const startTime = Date.now();
    
    // Ensure value is a valid number, fallback to 0 if not
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * safeValue);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {displayValue.toLocaleString()}
    </span>
  );
};

export default function SimpleMemberStats() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/membership/statistics");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        setStats({
          totalMembers: data.totalMembers || 0,
          generalMembersCount: data.generalMembersCount || 0,
          activeMembersCount: data.activeMembersCount || 0,
          executiveMembersCount: data.executiveMembersCount || 0,
          advisorsCount: data.advisorsCount || 0
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="container mx-auto px-4 my-2 md:my-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 my-2 md:my-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Total Members */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Total Members</div>
              <div className="text-lg font-bold text-gray-900">
                <AnimatedNumber value={stats.totalMembers} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Active Members</div>
              <div className="text-lg font-bold text-green-700">
                <AnimatedNumber value={stats.activeMembersCount} />
              </div>
            </div>
          </div>
        </div>

        {/* General Members */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">General Members</div>
              <div className="text-lg font-bold text-purple-700">
                <AnimatedNumber value={stats.generalMembersCount} />
              </div>
            </div>
          </div>
        </div>

        {/* Executive Members */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Executive Members</div>
              <div className="text-lg font-bold text-amber-700">
                <AnimatedNumber value={stats.executiveMembersCount} />
              </div>
            </div>
          </div>
        </div>

        {/* Advisors */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 shadow-sm border border-teal-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Lightbulb className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Advisors</div>
              <div className="text-lg font-bold text-teal-700">
                <AnimatedNumber value={stats.advisorsCount} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
