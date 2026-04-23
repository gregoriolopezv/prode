"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export function useAuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const sync = useMutation(api.users.sync);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    sync({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
    });
  }, [isLoaded, isSignedIn, user, sync]);
}
