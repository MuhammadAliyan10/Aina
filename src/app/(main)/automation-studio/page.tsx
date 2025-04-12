import React from "react";
import AutomationStudioPage from "./AutomationStudioPage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation Studio",
};

const page = () => {
  return <AutomationStudioPage />;
};

export default page;
