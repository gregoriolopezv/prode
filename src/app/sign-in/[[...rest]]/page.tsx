import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[80vh]">
      <SignIn fallbackRedirectUrl="/dashboard/leagues" />
    </div>
  );
}
