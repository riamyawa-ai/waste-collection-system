import { RegisterForm } from "@/components/forms/RegisterForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: `Create Account | ${APP_NAME}`,
  description: `Create your ${APP_NAME} account to start requesting waste collection services.`,
};

export default function RegisterPage() {
  return <RegisterForm />;
}
