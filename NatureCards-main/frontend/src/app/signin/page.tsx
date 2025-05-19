"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignIn() {
  const [email, setEmail] = useState("");

  const handleEmailSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signIn("email", { email, callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full bg-green-700 text-white hover:bg-green-600"
              >
                Sign In with Google
              </Button>

              <div className="flex items-center justify-center space-x-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <p className="text-gray-500">or</p>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <Input
                  type="email"
                  className="text-gray-900 bg-white border-gray-200"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-green-700 text-white hover:bg-green-600"
                >
                  Sign In with Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full bg-green-700 text-white hover:bg-green-600"
              >
                Sign up with Google
              </Button>

              <div className="flex items-center justify-center space-x-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <p className="text-gray-500">or</p>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <Input
                  type="email"
                  className="text-gray-900 bg-white border-gray-200"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-green-700 text-white hover:bg-green-600"
                >
                  Sign up with Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
