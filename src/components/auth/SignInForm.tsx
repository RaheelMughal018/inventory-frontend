import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import { useLoginAdminMutation } from "../../redux/services/auth";

export default function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginAdmin, { isLoading }] = useLoginAdminMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      const res = await loginAdmin({ email: email.trim(), password }).unwrap();
      if (res) {
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("id", res.user.id);
        setEmail("");
        setPassword("");
        handleApiSuccess("Login Successful");
        navigate("/");
      }
    } catch (err: unknown) {
      handleApiError(err, "Invalid Credentials");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto" />
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {error === "Email is required" && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {error === "Password is required" && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    to="/signup"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    If you dont have an account, Sign up
                  </Link>
                </div>
                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    size="sm"
                  >
                    {isLoading ? "Saving..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
