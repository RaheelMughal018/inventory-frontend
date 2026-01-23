import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Power GeniX - SignIn"
        description="Welcome to the World of Power GeniX"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
