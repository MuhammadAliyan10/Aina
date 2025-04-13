import React from "react";

import { Metadata } from "next";
import SchedulePage from "./SchedulePage";

export const metadata: Metadata = {
  title: "Schedule",
};

const page = () => {
  return <SchedulePage />;
};

export default page;
