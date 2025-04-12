import { Metadata } from "next";
import DashboardPage from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <DashboardPage />;
}
