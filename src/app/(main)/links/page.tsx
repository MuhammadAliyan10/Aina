import { CircleAlert } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="flex justify-between items-center gap-x-2">
        <CircleAlert className="text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          We are working on this page.
        </p>
      </div>
    </div>
  );
};

export default page;
