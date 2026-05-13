"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) => (
  <div className={`col-span-full py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center ${className}`}>
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
      <Icon size={32} className="text-gray-300" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm font-medium text-gray-500 mb-6">{description}</p>
    {action}
  </div>
);
