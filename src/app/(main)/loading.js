import { FeedSkeleton } from "@/components/ui/Skeleton";

// Route-level fallback for every page under (main) that doesn't ship its
// own loading.js. Server components here fetch before rendering, so without
// this the app froze on the previous screen during navigation.
export default function Loading() {
  return <FeedSkeleton count={5} />;
}
