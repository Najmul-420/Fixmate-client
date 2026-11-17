import type { Metadata } from "next";
import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In | FixMate",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      {/* Suspense required: the form reads the `redirect` search param. */}
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
