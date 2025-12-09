import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Forgot Password | EcoCollect Panabo",
    description: "Reset your EcoCollect Panabo account password.",
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
