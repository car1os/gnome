export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">WHOOP Dashboard</h1>
          <p className="text-foreground/60">
            View your recovery, sleep, and strain trends
          </p>
        </div>

        <a
          href="/api/auth/login"
          className="inline-block px-8 py-3 bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
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
    <p className="text-recovery-red text-sm">
      {messages[error] || `Error: ${error}`}
    </p>
  );
}
