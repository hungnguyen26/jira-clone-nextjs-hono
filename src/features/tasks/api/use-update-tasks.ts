import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ReponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"],200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>;

export const useUpdateTask = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
  ReponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({json, param}) => {
        const response = await client.api.tasks[":taskId"]["$patch"]({ json, param });
        if(!response.ok) throw new Error("Failed to update task")

        return await response.json();
    },
    onSuccess: ({data})=>{
      toast.success("Task updated")
      
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["tasks"]});
      queryClient.invalidateQueries({ queryKey: ["task", data.$id]});

    },
    onError: () => {
      toast.error("Failed to update task");
    }
  });

  return mutation;
};