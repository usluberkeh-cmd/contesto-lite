import type { SupabaseClient } from "@supabase/supabase-js";

import { sanitizeNextPath } from "@/lib/auth/next-path";
import { isProfileComplete } from "@/lib/profile-completion";
import {
  PROFILE_REQUIRED_REDIRECT_PATH,
  SUBMIT_FINE_RESUME_PATH,
  isSubmitFineResumePath,
} from "@/lib/submit-fine-flow";

type ResolvePostAuthPathArgs = {
  supabase: SupabaseClient;
  requestedNextPath: string;
  fallbackPath?: string;
  authenticatedUserId?: string;
};

export const resolvePostAuthPathForResumeFlow = async ({
  supabase,
  requestedNextPath,
  fallbackPath = "/",
  authenticatedUserId,
}: ResolvePostAuthPathArgs): Promise<string> => {
  const safeRequestedPath = sanitizeNextPath(requestedNextPath);

  if (!isSubmitFineResumePath(safeRequestedPath)) {
    return safeRequestedPath;
  }

  let userId = authenticatedUserId;

  if (!userId) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return sanitizeNextPath(fallbackPath);
    }

    userId = user.id;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Profile lookup failed during auth redirect:", profileError);
    return SUBMIT_FINE_RESUME_PATH;
  }

  // # Reason: Resume submission requires mandatory identity + phone fields before submitting the draft.
  if (!isProfileComplete(profile)) {
    return PROFILE_REQUIRED_REDIRECT_PATH;
  }

  return SUBMIT_FINE_RESUME_PATH;
};
