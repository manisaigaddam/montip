import { APP_URL } from '@/lib/constants';
import { Metadata } from 'next';

export async function generateMetadata({ params, searchParams }: { params: { fid: string }, searchParams: { [key: string]: string | string[] } }) {
  const { fid } = params;
  // Forward all query params to the OG card
  const qp = new URLSearchParams({ ...searchParams, fid });
  const ogCardUrl = `${APP_URL}/api/og-card?${qp.toString()}`;
  const frame = {
    version: 'next',
    imageUrl: ogCardUrl,
    button: {
      title: 'Tip now!',
      action: {
        type: 'launch_frame',
        url: APP_URL,
        name: 'Montip',
        splashImageUrl: `${APP_URL}/images/splash.png`,
        splashBackgroundColor: '#ffffff',
      },
    },
  };
  return {
    title: 'Montip Stats',
    openGraph: {
      title: 'Montip Stats',
      images: [ogCardUrl],
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  } satisfies Metadata;
}

export default function SharePage() {
  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h1>Share this page to show your Montip stats!</h1>
      <p>Copy the URL and share it in Farcaster to get your rich card.</p>
    </div>
  );
}
