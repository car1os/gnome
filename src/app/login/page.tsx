export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-sm uppercase tracking-[0.25em] font-normal text-foreground">
            WHOOP Dashboard
          </h1>
          <p className="text-[11px] tracking-wider text-text-dim">
            Recovery and strain trends
          </p>
        </div>

        <a
          href="/api/auth/login"
          className="inline-block px-10 py-3 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] hover:opacity-80 transition-opacity duration-300"
        >
          Connect with WHOOP
        </a>

        <LoginError searchParams={searchParams} />
      </div>
    </main>
  );
}

async function LoginError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;

  const messages: Record<string, string> = {
    missing_params: "Missing authorization parameters.",
    invalid_state: "Invalid state parameter. Please try again.",
    auth_failed: "Authentication failed. Please try again.",
  };

  return (
    <p className="text-recovery-red text-[11px] uppercase tracking-wider">
      {messages[error] || `Error: ${error}`}
    </p>
  );
}
