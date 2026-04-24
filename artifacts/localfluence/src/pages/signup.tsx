import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignup } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Store, UserCircle, Check } from "lucide-react";
import { motion } from "framer-motion";

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  name: z.string().min(2, { message: "Name is required." }),
  role: z.enum(["business", "influencer"], { required_error: "Please select an account type." }),
  city: z.string().optional(),
});

export default function Signup() {
  const [location, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const { toast } = useToast();
  const signupMutation = useSignup();

  // Check URL params for pre-selected role
  const urlParams = new URLSearchParams(window.location.search);
  const initialRole = urlParams.get("role") as "business" | "influencer" | null;

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: initialRole || undefined,
      city: "",
    },
  });

  const selectedRole = form.watch("role");

  function onSubmit(values: z.infer<typeof signupSchema>) {
    signupMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        setAuthContext(data.token, data.user);
        toast({
          title: "Account created",
          description: "Welcome to Localfluence!",
        });
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message || "An error occurred during signup.",
        });
      },
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-muted/20">
      <Card className="w-full max-w-xl shadow-lg border-primary/10">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-serif font-bold text-primary">Join Localfluence</CardTitle>
          <CardDescription className="text-base">
            Create an account to start connecting locally
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">I want to...</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => field.onChange("business")}
                          className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl text-center transition-all ${
                            field.value === "business" 
                              ? "border-primary bg-primary/5 text-primary shadow-sm" 
                              : "border-border hover:border-primary/50 text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          {field.value === "business" && (
                            <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-0.5">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <Store className={`h-10 w-10 mb-3 ${field.value === "business" ? "text-primary" : ""}`} />
                          <h3 className={`font-semibold mb-1 ${field.value === "business" ? "text-foreground" : ""}`}>Find Influencers</h3>
                          <p className="text-xs">I'm a local business looking to collaborate.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => field.onChange("influencer")}
                          className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl text-center transition-all ${
                            field.value === "influencer" 
                              ? "border-secondary bg-secondary/5 text-secondary shadow-sm" 
                              : "border-border hover:border-secondary/50 text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          {field.value === "influencer" && (
                            <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground rounded-full p-0.5">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <UserCircle className={`h-10 w-10 mb-3 ${field.value === "influencer" ? "text-secondary" : ""}`} />
                          <h3 className={`font-semibold mb-1 ${field.value === "influencer" ? "text-foreground" : ""}`}>Partner with Brands</h3>
                          <p className="text-xs">I'm a creator looking for local collaborations.</p>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <motion.div 
                initial={false} 
                animate={{ opacity: selectedRole ? 1 : 0.5, pointerEvents: selectedRole ? "auto" : "none" }}
                className="space-y-5 pt-4 border-t border-border"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedRole === "business" ? "Business Name" : "Full Name"}</FormLabel>
                      <FormControl>
                        <Input placeholder={selectedRole === "business" ? "e.g. Daily Grind Coffee" : "e.g. Jane Doe"} {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. San Francisco" {...field} className="h-11" />
                      </FormControl>
                      <FormDescription>Where are you based?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" type="email" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className={`w-full h-12 text-lg font-medium ${
                    selectedRole === "influencer" ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground" : ""
                  }`} 
                  disabled={signupMutation.isPending || !selectedRole}
                >
                  {signupMutation.isPending ? <Spinner className="mr-2 h-5 w-5" /> : null}
                  Create Account
                </Button>
              </motion.div>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
