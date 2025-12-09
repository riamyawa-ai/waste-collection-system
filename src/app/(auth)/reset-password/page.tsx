import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password | EcoCollect Panabo",
    description: "Set a new password for your EcoCollect Panabo account.",
};

export default function ResetPasswordPage() {
    return <ResetPasswordForm />;
}
