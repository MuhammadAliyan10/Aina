import React from "react";
import WorkflowPage from "./WorkflowPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflow",
};

const page = () => {
  return <WorkflowPage />;
};

export default page;
