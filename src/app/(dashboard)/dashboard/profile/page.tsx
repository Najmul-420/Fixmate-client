import type { Metadata } from "next";
import ProfileView from "@/components/dashboard/ProfileView";

export const metadata: Metadata = {
  title: "My Profile | FixMate",
  description: "Manage your FixMate profile details and profile photo.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
