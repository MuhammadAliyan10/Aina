import React from "react";
import AppInsightsPage from "./AppInsightPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insight",
};

const page = () => {
  return <AppInsightsPage />;
};

export default page;
