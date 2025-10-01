"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { authenticationService } from "./Authentication";
import { Suspense } from "react";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      await authenticationService.login(data.email, data.password);
      const returnUrl = searchParams.get("returnUrl") || "/cases";
      router.push(returnUrl);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-20 px-4">
      <section className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6">Login</h2>

        {/* Wrap the form component inside Suspense to fix CSR issues with useSearchParams */}
        <Suspense fallback={<div>Loading...</div>}>
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

            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-24"
            >
              {loading ? "Loading..." : "Login"}
            </Button>

            {error && (
              <div className="bg-red-100 text-red-600 p-2 rounded-md text-center mt-2">
                {error}
              </div>
            )}
          </form>
        </Suspense>
      </section>
    </div>
  );
}
