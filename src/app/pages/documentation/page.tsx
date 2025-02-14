import { CircleAlert } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="h-[100vh] w-full flex justify-center items-center">
      <div className="flex justify-between items-center gap-x-2">
        <CircleAlert className="text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          We are working on this page.
        </p>
        <Link href={"/"} className="text-green-500 underline cursor-pointer">
          Back to home page
        </Link>
      </div>
    </div>
  );
};

export default page;
