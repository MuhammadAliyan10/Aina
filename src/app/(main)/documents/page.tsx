import React from "react";
import DocumentsPage from "./DocumentsPage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
};

const page = () => {
  return <DocumentsPage />;
};

export default page;
