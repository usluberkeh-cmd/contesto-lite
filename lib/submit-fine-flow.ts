export const SUBMIT_FINE_PATH = "/dashboard/submit-fine";
export const SUBMIT_FINE_RESUME_PATH =
  "/dashboard/submit-fine?resume_submission=1";
export const PROFILE_REQUIRED_REDIRECT_PATH =
  "/dashboard/settings/profile?required=1&origin=submit-fine&resume_submission=1";
export const PROFILE_REQUIRED_REDIRECT_FALLBACK_PATH =
  "/dashboard/settings/profile?required=1&origin=submit-fine&next=/dashboard/submit-fine";

const CONTEXTO_LOCAL_ORIGIN = "https://contesto.local";

export const isSubmitFineResumePath = (nextPath: string): boolean => {
  try {
    const parsedPath = new URL(nextPath, CONTEXTO_LOCAL_ORIGIN);

    return (
      parsedPath.pathname === SUBMIT_FINE_PATH &&
      parsedPath.searchParams.get("resume_submission") === "1" &&
      parsedPath.searchParams.toString() === "resume_submission=1"
    );
  } catch {
    return false;
  }
};
