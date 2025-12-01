export const dynamic = "force-dynamic";
export const revalidate = 0;

import AuthPage from "../page";

export default function SignUpPage() {
  return <AuthPage defaultTab="signup" />;
}