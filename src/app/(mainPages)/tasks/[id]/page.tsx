import React from "react";

import { Metadata } from "next";
import PageWithProvider from "./WorkFlowPage";

export const metadata: Metadata = {
  title: "Workflow",
};

const page = () => {
  return <PageWithProvider />;
};

export default page;
