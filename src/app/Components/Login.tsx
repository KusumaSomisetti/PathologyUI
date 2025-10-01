"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
// import { Card, CardBody } from "@heroui/card"; // (remove if unused)
import { authenticationService } from "./Authentication";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login({ returnUrl }: { returnUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);
    setLoading(true);
    try {
      await authenticationService.login(data.email, data.password);
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-20 px-4">
      <section className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Email</label>
            <Input
              type="email"
              {...register("email", { required: "Email is required" })}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              variant="bordered"
              size="md"
              className="w-full"
            />
          </div>

          <div>
            <label>Password</label>
            <Input
              type="password"
              {...register("password", { required: "Password is required" })}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              variant="bordered"
              size="md"
              className="w-full"
            />
          </div>

          <Button type="submit" color="primary" isLoading={loading} className="w-24">
            {loading ? "Loading..." : "Login"}
          </Button>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded-md text-center mt-2">
              {error}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
