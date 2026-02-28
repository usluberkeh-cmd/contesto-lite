import { NextRequest, NextResponse } from "next/server";

import { resolvePostAuthPathForResumeFlow } from "@/lib/auth/post-auth-redirect";
import { sanitizeNextPath } from "@/lib/auth/next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const destination = await resolvePostAuthPathForResumeFlow({
          supabase,
          requestedNextPath: next,
          fallbackPath: next,
        });

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${destination}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${destination}`);
        } else {
          return NextResponse.redirect(`${origin}${destination}`);
        }
      }
    } catch (error) {
      console.error("Auth callback error:", error);
    }
  }

  // Authentication failed - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
