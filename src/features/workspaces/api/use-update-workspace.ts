import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ReponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>;

export const useUpdateWorkspace = () => {
  const router = useRouter();
  
  const queryClient = useQueryClient();

  const mutation = useMutation<
  ReponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({form, param}) => {
        const response = await client.api.workspaces[":workspaceId"]["$patch"]({ form , param });
        if(!response.ok) throw new Error("Failed to update workspace")

        return await response.json();
    },
    onSuccess: ({ data })=>{
      toast.success("Workspace updated");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["workspaces"]});
      queryClient.invalidateQueries({ queryKey: ["workspace", data.$id]});
    },
    onError: () => {
      toast.error("Failed to create workspace");
    }
  });

  return mutation;
};