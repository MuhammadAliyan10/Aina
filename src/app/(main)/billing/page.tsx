import React from "react";
import BillingPage from "./BillingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
};

const page = () => {
  return <BillingPage />;
};

export default page;
