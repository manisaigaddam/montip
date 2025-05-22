import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    
  "accountAssociation": {
    "header": "eyJmaWQiOjI3MjI5MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGQ5MzA2ZEM4YmQ3RTk2NzI0OGIxZGY4YjA4Qzk1QTQwY0I3M2JGRjkifQ",
    "payload": "eyJkb21haW4iOiJtb250aXAudmVyY2VsLmFwcCJ9",
    "signature": "MHgzZDdmMzk1YzRhYzc5Y2Y5ZGM4YzIzMzBlYTYyMDkzMGRkOGE2NTBjNDliYjUwODQ4ZTMzMzZmNTMwYjgyYmUzMzFlZTM4ODZmY2U4NWYyZjIyYTVmNWMxOGQ3Y2E3ODdhN2YzMzkxMDVhZGNmNDFlNzljNDRhZGNjM2Q2NzVjZDFj"
  },

    // TODO: Add account association
    frame: {
      version: "1",
      name: "Montip",
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/feed.png`,
      screenshotUrls: [],
      tags: ["monad", "farcaster", "miniapp", "montip"],
      primaryCategory: "developer-tools",
      buttonTitle: "Launch Montip",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  };

  return NextResponse.json(farcasterConfig);
}
