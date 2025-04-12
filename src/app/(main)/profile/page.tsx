import React from "react";
import ProfilePage from "./ProfilePage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

const page = () => {
  return <ProfilePage />;
};

export default page;
