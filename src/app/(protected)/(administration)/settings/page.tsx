import { Metadata } from "next";
import SettingsPageClient from "./settings-page";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your application settings and preferences",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
