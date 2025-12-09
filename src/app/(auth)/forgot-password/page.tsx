import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
    title: `Forgot Password | ${APP_NAME}`,
    description: `Reset your ${APP_NAME} account password.`,
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
