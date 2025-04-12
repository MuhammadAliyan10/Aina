import React from "react";
import CalendarPage from "./CalendarPage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar",
};

const page = () => {
  return <CalendarPage />;
};

export default page;
