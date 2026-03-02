export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">WHOOP Dashboard</h1>
          <p className="text-text-muted text-sm">
            View your recovery, sleep, and strain trends
          </p>
        </div>

        <a
          href="/api/auth/login"
          className="inline-block px-6 py-2 bg-accent text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
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
