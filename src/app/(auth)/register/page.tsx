import { RegisterForm } from "@/components/forms/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | EcoCollect Panabo",
  description: "Create your EcoCollect Panabo account to start requesting waste collection services.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
