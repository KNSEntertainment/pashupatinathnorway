"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { 
  Lightbulb,
} from "lucide-react";
import SectionHeader from "./SectionHeader";

interface BoardMember {
  _id?: string;
  name: string;
  position: string;
  type: "executive" | "member" | "advisor";
  membershipId?: string;
  email?: string;
  phone?: string;
  displayOrder?: number;
}

interface MembershipData {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  membershipType: string;
  membershipId: string;
  email: string;
  phone: string;
  position?: string;
  displayOrder?: number;
}

export default function Management() {
  const t = useTranslations("management");
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  
  const fetchBoardMembers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch from membership system for executive and advisor types
      const membershipResponse = await fetch("/api/membership?type=Executive,Advisor");
      let members: BoardMember[] = [];
      if (membershipResponse.ok) {
        const membershipData = await membershipResponse.json();
        members = membershipData.map((member: MembershipData) => ({
          name: `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`,
          position: member.position || (member.membershipType === "Executive" ? t("executive_member") : t("advisor")),
          type: member.membershipType.toLowerCase() as "executive" | "advisor",
          membershipId: member.membershipId,
          email: member.email,
          phone: member.phone,
          displayOrder: member.displayOrder,
          _id: `membership-${member._id}`
        }));
      }
      
      // Sort by type first, then by displayOrder for executives, then by name
      const sortedMembers = members.sort((a, b) => {
        const typeOrder: Record<string, number> = { executive: 0, advisor: 1 };
        if (typeOrder[a.type] !== typeOrder[b.type]) {
          return typeOrder[a.type] - typeOrder[b.type];
        }
        
        // For executive members, sort by displayOrder if available, then by name
        if (a.type === "executive" && b.type === "executive") {
          const aOrder = a.displayOrder ?? 999;
          const bOrder = b.displayOrder ?? 999;
          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }
        }
        
        return a.name.localeCompare(b.name);
      });

      setMembers(sortedMembers as BoardMember[]);
    } catch (error) {
      console.error("Error fetching members:", error);
      // If API fails, show empty array
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBoardMembers();
  }, [t, fetchBoardMembers]);

  // Filter members by type
  const executiveMembers = members.filter(m => m.type === "executive");
  const advisors = members.filter(m => m.type === "advisor");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand_primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="text-center mb-6 md:mb-8">
          <SectionHeader heading={t("current_board_members")} subtitle={t("board_description")} />
        </header>
      </div>


      {/* Current Board Members Section */}
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {executiveMembers.map((member: BoardMember, index: number) => (
            <div
              key={member._id || index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    member.type === "executive" 
                      ? "bg-gradient-to-br from-yellow-500 to-yellow-600" 
                      : "bg-gradient-to-br from-brand_primary to-brand_secondary"
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col items-start gap-1 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.position}</p>
                    {/* {member.membershipId && (
                      <p className="text-xs text-gray-400">ID: {member.membershipId}</p>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisors Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Lightbulb className="w-8 h-8 text-purple-600" />
              {t("advisors_title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {advisors.map((advisor: BoardMember, index: number) => (
              <div
                key={advisor._id || index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-purple-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                    {advisor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{advisor.name}</h3>
                    <p className="text-xs text-gray-500">{advisor.position}</p>
                    {/* {advisor.membershipId && (
                      <p className="text-xs text-gray-400">ID: {advisor.membershipId}</p>
                    )} */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

  

    </div>
  );
}
