import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ReponseType = InferResponseType<typeof client.api.auth.register["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>;


export const useRegister = () => {
  const route = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<
  ReponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({json}) => {
        const response = await client.api.auth.register["$post"]({ json });
        
        if(!response.ok) throw new Error("Failed to register")
        
        return await response.json();
    },
    onSuccess: ()=>{
      toast.success("Registered")
      route.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"]});
    },
    onError: ()=>{
      toast.error("Failed to register");
    }
  });

  return mutation;
};