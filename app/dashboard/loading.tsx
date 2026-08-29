import { LoadingLoader } from "@/components/Elements/loading-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <LoadingLoader />
    </div>
  );
}
