import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {useForm} from 'react-hook-form';
import {useRegisterAdminMutation} from '../../redux/services/auth'
import {toast} from 'sonner'
type FormData = {
   name: string
   email: string
   password: string
}

export default function SignUpForm() {
  const {
      register,
      handleSubmit,
      reset,
      formState: {errors,isSubmitting}
  } = useForm<FormData>()
  const [showPassword, setShowPassword] = useState(false);
  

  const [createAdmin,{isLoading}] = useRegisterAdminMutation();
  const onSubmit = async (data: FormData) =>{
    try {
      await createAdmin(data).unwrap()
      reset()
      toast.success('Form Submitted')
    } catch (error) {
      console.log(error)
    }
  }
  return (

    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
     
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
          <div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      {...register('name',{required: 'Name is Required'})}
                      placeholder="Enter your name"
                    />
                    {errors.name && <p>{errors.name.message}</p> }
                  </div>
                 
                 
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...register('email',{
                      required: 'Email is required',
                      pattern:{
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email',
                      }
                    })}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p>{errors.email.message}</p>}
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password', {
                        required: 'Password is required',
                        
                      })}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}

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
                {/* <!-- Button --> */}
                <div>
                  <button disabled={isLoading || isSubmitting } className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    {isLoading ? 'Saving... ':'Sign Up'}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
