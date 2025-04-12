import React from "react";
import TeamPage from "./TeamPage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team",
};

const page = () => {
  return <TeamPage />;
};

export default page;
