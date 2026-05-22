"use client";

import React from "react";
import * as Icons from "lucide-react";

interface DashboardPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: keyof typeof Icons;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

export default function DashboardPageLayout({
  title,
  description,
  children,
  icon,
  actions,
  breadcrumbs,
  headerClassName = "",
  contentClassName = "",
}: DashboardPageLayoutProps) {
  // Get the icon component from the Icons object
  const IconComponent = icon ? (Icons[icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>) : null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className={`mb-8 ${headerClassName}`}>
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="mb-4">
            {breadcrumbs}
          </div>
        )}
        
        {/* Page Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {IconComponent && (
                <div className="p-2 bg-brand_primary/10 rounded-lg">
                  <IconComponent className="w-6 h-6 text-brand_primary" />
                </div>
              )}
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                {title}
              </h1>
            </div>
            {description && (
              <p className="text-sm text-gray-500 mt-1 ml-11">
                {description}
              </p>
            )}
          </div>
          
          {/* Header Actions */}
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className={`space-y-6 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
