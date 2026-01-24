import { useState } from "react";
import { Link, Navigate } from "react-router";
import {  EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import {toast} from 'sonner'
import {useForm} from 'react-hook-form'
import { useLoginAdminMutation } from "../../redux/services/auth";
import {useNavigate} from 'react-router'
type FormData = {
   email: string
   password: string
}
export default function SignInForm() {
   const {
      register,
      handleSubmit,
      reset,
      formState: {errors}
  } = useForm<FormData>()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);
  const [loginAdmin, {isLoading}] = useLoginAdminMutation();
  const onSubmit = async (data: FormData)=>{
    try {
      const res = await loginAdmin(data).unwrap();
      if(res){
        const token = res.access_token
        localStorage.setItem("access_token", token)
        reset()
        toast.success("Login Form Submitted")
        navigate("/")
      }
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error)
      toast.error(`Invalid Form ${error.message}`)
    }
  }
  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
      </div>
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
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                   placeholder="info@gmail.com"
                   {...register('email',{
                    required: 'Email is required'
                   })}

                    />
                  {errors.email && <p>{errors.email.message} </p>}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                    {...register('password', {
                      required: 'Password is required',
                      
                    })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                  {errors.password && <p>{errors.password.message}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button 
                  // disabled={isLoading || isSubmitting}
                  className="w-full" size="sm">
                    {isLoading ? "saving...":"Sign in"}
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
