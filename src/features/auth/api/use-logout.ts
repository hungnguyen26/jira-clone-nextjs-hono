import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { toast } from "sonner";

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
        if(!response.ok) throw new Error("Failed to logout")
        return await response.json();
    },
    onSuccess: ()=>{
      toast.success("Logged out")
      route.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"]});
      queryClient.invalidateQueries({ queryKey: ["workspaces"]});
    },
    onError:()=>{
      toast.error("Failed to log out")
    }
  });

  return mutation;
};