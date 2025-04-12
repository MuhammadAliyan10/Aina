import React from "react";
import TasksPage from "./TasksPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
};

const page = () => {
  return <TasksPage />;
};

export default page;
