import { getIntegrationsAction } from "@/lib/channels/channel.action";
import { tags } from "@/lib/shared/constants";
import { useQuery } from "@tanstack/react-query";

export function useChannels() {
  return useQuery({
    queryKey: [tags.CHANNEL],
    queryFn: async () => {
      const res = await getIntegrationsAction();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}
