// components/HomePageSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton from ShadCN

const LoadingHomeSkeleton: React.FC = () => {
  return (
    <div className="m-10">
      <div className="flex flex-col justify-center h-screen">
        {/* Skeleton for the title */}
        <Skeleton className="h-10 w-64 mb-4" />

        {/* Skeleton for the description */}
        <Skeleton className="h-6 w-96 mb-6" />

        {/* Skeleton for Login section */}
        <div className="my-2">
          <Skeleton className="h-6 w-80" />
        </div>
        <div className="flex mb-6">
          <Skeleton className="h-12 w-40" />
        </div>

        {/* Skeleton for User Info Section */}
        <section className="my-4 mx-4 md:mx-0">
          <div className="flex items-center gap-x-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-80" />
          </div>
        </section>

        {/* Skeleton for Terms & Conditions Section */}
        <section className="my-6">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96 mt-4" />
          </div>

          {/* Skeleton for Terms cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <div className="p-4 border rounded-lg shadow-sm">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoadingHomeSkeleton;
