import { Metadata } from "next";
import { APP_URL } from "@/lib/constants";
import { NextRequest } from "next/server";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function generateStatsFrame(
  username: string,
  totalTipped: string,
  totalEarned: string,
  pfpUrl: string
) {
  const frame = {
    version: "next",
    imageUrl: `${APP_URL}/api/stats-image?username=${encodeURIComponent(username)}&totalTipped=${encodeURIComponent(totalTipped)}&totalEarned=${encodeURIComponent(totalEarned)}&pfpUrl=${encodeURIComponent(pfpUrl)}`,
    button: {
      title: `Montip now!`,
      action: {
        type: "launch_frame",
        name: "Montip",
        url: APP_URL,
        splashImageUrl: `${APP_URL}/images/splash.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };

  return frame;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const username = (searchParams.username as string) || "Unknown";
  const totalTipped = (searchParams.totalTipped as string) || "0";
  const totalEarned = (searchParams.totalEarned as string) || "0";
  const pfpUrl = (searchParams.pfpUrl as string) || "";

  const frame = await generateStatsFrame(username, totalTipped, totalEarned, pfpUrl);

  return {
    title: `Montip now!`,
    description: `${username} has tipped ${totalTipped} MON and earned ${totalEarned} MON on Montip!`,
    openGraph: {
      title: `Montip now!`,
      description: `${username} has tipped ${totalTipped} MON and earned ${totalEarned} MON on Montip!`,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function SharePage({ searchParams }: PageProps) {
  const username = (searchParams.username as string) || "Unknown";
  const totalTipped = (searchParams.totalTipped as string) || "0";
  const totalEarned = (searchParams.totalEarned as string) || "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Check out my Montip stats!</h1>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">@{username}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-700">{totalTipped}</div>
              <div className="text-sm text-purple-600">MON Tipped</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">{totalEarned}</div>
              <div className="text-sm text-blue-600">MON Earned</div>
            </div>
          </div>
          <p className="text-gray-600 mt-6">
            Join Montip to tip your favorite Farcaster users with Monad tokens!
          </p>
        </div>
      </div>
    </div>
  );
} 
