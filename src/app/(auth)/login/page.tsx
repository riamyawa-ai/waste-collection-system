import { LoginForm } from "@/components/forms/LoginForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: `Sign In | ${APP_NAME}`,
  description: `Sign in to your ${APP_NAME} account to manage waste collection services.`,
};

export default function LoginPage() {
  return <LoginForm />;
}
