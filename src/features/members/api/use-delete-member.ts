import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ReponseType = InferResponseType<typeof client.api.members[":memberId"]["$delete"],200>;
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$delete"]>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();


  const mutation = useMutation<
  ReponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({param}) => {
        const response = await client.api.members[":memberId"]["$delete"]({ param });
        
        if(!response.ok) throw new Error("Failed to delete member")

        return await response.json();
    },
    onSuccess: ()=>{
      toast.success("Member deleted")
      queryClient.invalidateQueries({ queryKey: ["members"]});
    },
    onError: () => {
      toast.error("Failed to deleted member");
    }
  });

  return mutation;
};