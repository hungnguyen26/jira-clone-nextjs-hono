import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ReponseType = InferResponseType<typeof client.api.auth.logout["$post"]>;

export const useLogout = () => {
  const route = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<
  ReponseType,
  Error
  >({
    mutationFn: async () => {
        const response = await client.api.auth.logout["$post"]();
        return await response.json();
    },
    onSuccess: ()=>{
      route.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"]});
    }
  });

  return mutation;
};