import React from "react";
import SupportPage from "./SupportPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
};

const page = () => {
  return <SupportPage />;
};

export default page;
