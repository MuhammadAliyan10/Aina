import React from "react";
import SettingsPage from "./SettingPage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setting",
};

const page = () => {
  return <SettingsPage />;
};

export default page;
