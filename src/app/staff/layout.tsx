"use client";

import { ReactNode } from "react";
import { DashboardLayout } from "@/components/layouts";

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <DashboardLayout role="staff">
      {children}
    </DashboardLayout>
  );
}
