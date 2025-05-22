import { useFrame } from "../components/farcaster-provider";
import { FrameContext } from "@farcaster/frame-core/dist/context";

export const useMiniAppContext = (): { context: FrameContext | null } => {
  try {
    const { context } = useFrame();
    return { context: context ?? null };
  } catch {
    return { context: null };
  }
};
