import { useFrame } from '@/components/farcaster-provider'
import { APP_URL } from '@/lib/constants'
import { useMutation } from '@tanstack/react-query'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'

interface ShareStatsParams {
  tipperTotal: number;
  earnerTotal: number;
  tipperTokens: { [symbol: string]: number };
  earnerTokens: { [symbol: string]: number };
}

// Custom hook for sharing functionality
export function useShareStats() {
  const { context } = useMiniAppContext();
  const { actions } = useFrame();

  const shareStats = ({ tipperTotal, earnerTotal, tipperTokens, earnerTokens }: ShareStatsParams) => {
    const username = context?.user?.username || '';
    const fid = context?.user?.fid || '';
    const pfpurl = context?.user?.pfpUrl || '';
    
    const shareUrl = `${APP_URL}/share/${fid}?username=${encodeURIComponent(username)}&tipped=${tipperTotal.toFixed(4)}&earned=${earnerTotal.toFixed(4)}&tippedTokens=${encodeURIComponent(JSON.stringify(tipperTokens))}&earnedTokens=${encodeURIComponent(JSON.stringify(earnerTokens))}&pfpurl=${encodeURIComponent(pfpurl)}`;

    const castMessage = `onchain tips, onchain flex.\nstart tipping, and check your stats.`;

    if (actions) {
      actions.composeCast({
        text: castMessage,
        embeds: [shareUrl],
      });
    }
  };

  return { shareStats, actions };
}

interface FarcasterActionsProps {
  tipperTotal?: number;
  earnerTotal?: number;
  tipperTokens?: { [symbol: string]: number };
  earnerTokens?: { [symbol: string]: number };
}

export function FarcasterActions({ 
  tipperTotal = 0, 
  earnerTotal = 0, 
  tipperTokens = {}, 
  earnerTokens = {}
}: FarcasterActionsProps) {
  const { shareStats, actions } = useShareStats();

  const handleShare = () => {
    shareStats({ tipperTotal, earnerTotal, tipperTokens, earnerTokens });
  };

  return (
    <div className="space-y-4 border border-[#333] rounded-md p-4">
      <h2 className="text-xl font-bold text-left">sdk.actions</h2>
      <div className="flex flex-row space-x-4 justify-start items-start">
        {actions ? (
          <div className="flex flex-col space-y-4 justify-start">
            <button
              type="button"
              className="bg-white text-black rounded-md p-2 text-sm"
              onClick={() => actions.addFrame()}
            >
              addFrame
            </button>
            <button
              type="button"
              className="bg-white text-black rounded-md p-2 text-sm"
              onClick={() => actions.close()}
            >
              close
            </button>
            <button
              type="button"
              className="bg-white text-black rounded-md p-2 text-sm"
              onClick={handleShare}
            >
              Share Montip Stats
            </button>
            <button
              type="button"
              className="bg-white text-black rounded-md p-2 text-sm"
              onClick={() => actions.openUrl('https://docs.monad.xyz')}
            >
              openUrl
            </button>
            <button
              type="button"
              className="bg-white text-black rounded-md p-2 text-sm"
              onClick={() => actions.viewProfile({ fid: 17979 })}
            >
              viewProfile
            </button>
          </div>
        ) : (
          <p className="text-sm text-left">Actions not available</p>
        )}
      </div>
    </div>
  )
}