import React from "react";
import AIAssistantPage from "./AssistantPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistant",
};

const page = () => {
  return <AIAssistantPage />;
};

export default page;
