import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);

  const username = searchParams.get('username') || 'User';
  const tipped = searchParams.get('tipped') || '0.0000';
  const earned = searchParams.get('earned') || '0.0000';
  const pfpurl = searchParams.get('pfpurl') || '';

  // Safe JSON parse helpers
  function safeParse(obj: string | null) {
    try {
      if (!obj) return {};
      return JSON.parse(obj);
    } catch {
      return {};
    }
  }

  const tippedTokens = safeParse(searchParams.get('tippedTokens'));
  const earnedTokens = safeParse(searchParams.get('earnedTokens'));

  // Prepare sorted, sliced token lists (max 4)
  const sortedTipped = Object.entries(tippedTokens)
    .filter(([_, v]) => Number(v) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 4);
  const sortedEarned = Object.entries(earnedTokens)
    .filter(([_, v]) => Number(v) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #a280ff 0%, #5b4dcf 100%)',
          position: 'relative',
        }}
      >
        {/* Card inner white area */}
        <div style={{
          background: 'rgba(255,255,255,0.96)',
          borderRadius: 28,
          boxShadow: '0 2px 16px #0001',
          width: 520,
          maxWidth: '90%',
          margin: '0 auto',
          padding: '32px 32px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Profile section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16, minHeight: 120, justifyContent: 'center' }}>
            {pfpurl ? (
              <img
                src={pfpurl}
                width={96}
                height={96}
                style={{ borderRadius: '50%', border: '4px solid #a280ff', marginBottom: 8, objectFit: 'cover', background: '#eee', boxShadow: '0 2px 8px #a280ff44' }}
                alt="Profile"
              />
            ) : (
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#e0e0e0', border: '4px solid #a280ff', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#a280ff' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" fill="#a280ff33"/><rect x="4" y="16" width="16" height="4" rx="2" fill="#a280ff33"/></svg>
              </div>
            )}
            <span style={{ fontSize: 36, fontWeight: 800, color: '#5b4dcf', letterSpacing: 1, marginBottom: 6, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
              @{username}
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#5b4dcf', marginBottom: 24, letterSpacing: 0.5, fontFamily: 'Inter, sans-serif' }}>
            🚀 Check out my Montip stats!
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 48, width: '100%' }}>
            {/* Tipped section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 }}>
              <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: 20, marginBottom: 8, letterSpacing: 0.5 }}>Tipped</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                {sortedTipped.length === 0 ? (
                  <span style={{ color: '#aaa', fontSize: 18 }}>-</span>
                ) : (
                  sortedTipped.map(([symbol, amt]) => (
                    <span key={symbol} style={{ color: '#222', fontSize: 18, fontFamily: 'monospace', fontWeight: 600 }}>
                      {Number(amt).toFixed(4)} {symbol}
                    </span>
                  ))
                )}
              </div>
            </div>
            {/* Earned section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 }}>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: 20, marginBottom: 8, letterSpacing: 0.5 }}>Earned</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                {sortedEarned.length === 0 ? (
                  <span style={{ color: '#aaa', fontSize: 18 }}>-</span>
                ) : (
                  sortedEarned.map(([symbol, amt]) => (
                    <span key={symbol} style={{ color: '#222', fontSize: 18, fontFamily: 'monospace', fontWeight: 600 }}>
                      {Number(amt).toFixed(4)} {symbol}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}