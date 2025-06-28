import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ReponseType = InferResponseType<typeof client.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>;

export const useLogin = () => {
  const route = useRouter();
  const queryClient = useQueryClient();


  const mutation = useMutation<
  ReponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({json}) => {
        const response = await client.api.auth.login["$post"]({ json });
        return await response.json();
    },
    onSuccess: ()=>{
      route.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"]});
    }
  });

  return mutation;
};