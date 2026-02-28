export type ProfileCompletionCandidate = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

const hasMinTrimmedLength = (
  value: string | null | undefined,
  minLength: number
): boolean => {
  return typeof value === "string" && value.trim().length >= minLength;
};

const hasNonEmptyTrimmedValue = (
  value: string | null | undefined
): boolean => {
  return typeof value === "string" && value.trim().length > 0;
};

export const isProfileComplete = (
  profile: ProfileCompletionCandidate | null | undefined
): boolean => {
  if (!profile) {
    return false;
  }

  // # Reason: Contact flow requires clear identity + reachable phone before a fine can be submitted.
  return (
    hasMinTrimmedLength(profile.first_name, 2) &&
    hasMinTrimmedLength(profile.last_name, 2) &&
    hasNonEmptyTrimmedValue(profile.phone)
  );
};
