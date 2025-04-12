import React from "react";
import IntegrationsPage from "./IntegrationPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integration",
};

const page = () => {
  return <IntegrationsPage />;
};

export default page;
