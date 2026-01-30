import { SignIn } from '@clerk/clerk-react';

const signInRedirectUrl = `${window.location.origin}/`;
const signUpUrl = `${window.location.origin}/register`;

/** Clerk sign-in (email + Google, etc.). Redirects to home after success. */
export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <SignIn
        signUpUrl={signUpUrl}
        afterSignInUrl={signInRedirectUrl}
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
}
