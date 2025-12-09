import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
    title: `Reset Password | ${APP_NAME}`,
    description: `Set a new password for your ${APP_NAME} account.`,
};

export default function ResetPasswordPage() {
    return <ResetPasswordForm />;
}
