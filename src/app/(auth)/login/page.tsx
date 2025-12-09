import { LoginForm } from "@/components/forms/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | EcoCollect Panabo",
  description: "Sign in to your EcoCollect Panabo account to manage waste collection services.",
};

export default function LoginPage() {
  return <LoginForm />;
}
