import { Metadata } from "next";
import DonorsPageClient from "./DonorsPageClient";

export const metadata: Metadata = {
  title: "All Donors - Pashupatinath Norway Temple",
  description: "View all donors who have contributed to building the Pashupatinath Temple in Norway",
};

export default function DonorsPage() {
  return <DonorsPageClient />;
}
