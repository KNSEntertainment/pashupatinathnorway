"use client";

import { useTranslations } from "next-intl";
import { 
  FileText,
  Lightbulb,
  Download
} from "lucide-react";
import SectionHeader from "./SectionHeader";

interface BoardMember {
  name: string;
  position: string;
  type: "executive" | "member" | "advisor";
}

interface Report {
  year: string;
  title: string;
  url: string;
}

export default function Management() {
  const t = useTranslations("management");

  const foundingCommittee: BoardMember[] = [
    { name: "Jitendra Bikram Shahi", position: t("chairperson"), type: "executive" },
    { name: "Anush Khadka", position: t("secretary"), type: "executive" },
    { name: "Bikram Basnet", position: t("treasurer"), type: "executive" },
    { name: "Hemanta Bhandari", position: t("joint_secretary"), type: "executive" },
    { name: "Sagar Aryal", position: t("joint_treasurer"), type: "executive" },
    { name: "Abishkar Bastola", position: t("member"), type: "member" },
    { name: "Bishnu Gautam", position: t("member"), type: "member" },
    { name: "Biswas Bajgai", position: t("member"), type: "member" },
    { name: "Geeban Uprety", position: t("member"), type: "member" },
    { name: "Ghanashyam Bartaula", position: t("member"), type: "member" },
    { name: "Hari Bahadur Baniya", position: t("member"), type: "member" },
    { name: "Ishwori Prasad Khanal", position: t("member"), type: "member" },
    { name: "Khumanand S. Dhungana", position: t("member"), type: "member" },
    { name: "Paban Acharya", position: t("member"), type: "member" },
    { name: "Prabina Munakarmi", position: t("member"), type: "member" },
    { name: "Ratna Prasad Sapkota", position: t("member"), type: "member" },
    { name: "Siddhant Ghale", position: t("member"), type: "member" },
    { name: "Sita Shiwani Shrestha", position: t("member"), type: "member" },
    { name: "Sunil Dhungana", position: t("member"), type: "member" },
    { name: "Suresh Kumar Yadav", position: t("member"), type: "member" },
    { name: "Tika Acharya", position: t("member"), type: "member" },
    { name: "Youbaraj Bhandari", position: t("member"), type: "member" }
  ];

  const advisors: BoardMember[] = [
    { name: "Manish Budhathoki", position: t("advisor"), type: "advisor" },
    { name: "Kumar Pandit", position: t("advisor"), type: "advisor" },
    { name: "Sanjeev Kumar Thapa", position: t("advisor"), type: "advisor" },
    { name: "Jiban Bahadur Shahi", position: t("advisor"), type: "advisor" },
    { name: "Saligram Aryal", position: t("advisor"), type: "advisor" },
    { name: "Deependra Acharya", position: t("advisor"), type: "advisor" }
  ];

  const annualReports: Report[] = [
    { 
      year: "2025", 
      title: t("annual_report_2025"),
      url: "https://drive.google.com/file/d/1G175qOtMsbTG1qL6CDLfKLa7YcHheNCQ/view"
    }
  ];

  // const missionItems = [
  //   {
  //     icon: <Building className="w-6 h-6" />,
  //     title: t("temple_construction"),
  //     description: t("temple_construction_desc")
  //   },
  //   {
  //     icon: <Heart className="w-6 h-6" />,
  //     title: t("religious_services"),
  //     description: t("religious_services_desc")
  //   },
  //   {
  //     icon: <Calendar className="w-6 h-6" />,
  //     title: t("cultural_spiritual_events"),
  //     description: t("cultural_spiritual_events_desc")
  //   },
  //   {
  //     icon: <Users className="w-6 h-6" />,
  //     title: t("community_support"),
  //     description: t("community_support_desc")
  //   }
  // ];

  


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
          {foundingCommittee.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand_primary to-brand_secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col items-start gap-1 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.position}</p>
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
            {advisors.map((advisor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-purple-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                    {advisor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{advisor.name}</h3>
                    <p className="text-xs text-gray-500">{advisor.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Purpose Section */}
      {/* <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Target className="w-8 h-8 text-brand_primary" />
            {t("mission_purpose_title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {missionItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-brand_primary to-brand_secondary rounded-xl flex items-center justify-center text-white mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div> */}

      {/* Annual Reports Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-brand_primary" />
              {t("annual_reports_title")}
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {annualReports.map((report, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand_primary/10 rounded-lg flex items-center justify-center group-hover:bg-brand_primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-brand_primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600">{t("year")}: {report.year}</p>
                  </div>
                </div>
                <a 
                  href={report.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand_secondary hover:text-brand_secondary/60 transition-colors"
                >
                  <span className="hidden md:block text-sm font-medium">{t("download")}</span>
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
