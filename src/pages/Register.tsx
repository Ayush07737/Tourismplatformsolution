import { SignUp } from '@clerk/clerk-react';

const signUpRedirectUrl = `${window.location.origin}/`;
const signInUrl = `${window.location.origin}/login`;

/** Clerk sign-up (email + Google, etc.). Redirects to home after success. */
export function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <SignUp
        signInUrl={signInUrl}
        afterSignUpUrl={signUpRedirectUrl}
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
