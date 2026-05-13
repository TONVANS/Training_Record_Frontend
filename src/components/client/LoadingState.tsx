"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "ກຳລັງໂຫຼດ..." }: LoadingStateProps) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
    <Loader2 size={36} className="animate-spin text-[#1275e2]" />
    <p className="text-sm font-medium text-gray-400">{message}</p>
  </div>
);
