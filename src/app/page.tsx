"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrent } from "@/features/auth/api/use-current";
import { useLogout } from "@/features/auth/api/use-logout";
import { Button } from "@/components/ui/button";

export default function Home() {
  const route = useRouter();
  const { data, isLoading } = useCurrent();
  const { mutate } = useLogout();

  useEffect(() => {
    if(!data && !isLoading) {
      route.push("/sign-in");
    }
  }, [data]);

  return (
    <div>
      Only visible to authenticated users
      <Button onClick={() => mutate()}>
        Logout
      </Button>
    </div>
  );
}
