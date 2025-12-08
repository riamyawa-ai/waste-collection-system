import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50/30">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-leaf/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
