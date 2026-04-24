import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetMyProfile, getGetMyProfileQueryKey, useUpdateMyProfile } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Save } from "lucide-react";

// Flexible schema that works for both roles
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bio: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  category: z.string().optional(),
  instagramUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  youtubeUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  followers: z.coerce.number().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  coverUrl: z.string().url().optional().or(z.literal("")),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
});

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initializedForId = useRef<number | null>(null);

  const { data: profile, isLoading } = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey() }
  });

  const updateProfile = useUpdateMyProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      city: "",
      area: "",
      category: "",
      instagramUrl: "",
      youtubeUrl: "",
      followers: 0,
      avatarUrl: "",
      coverUrl: "",
      companyName: "",
      industry: "",
      description: "",
    },
  });

  useEffect(() => {
    if (profile && user && initializedForId.current !== user.id) {
      initializedForId.current = user.id;
      form.reset({
        name: profile.name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        area: profile.area || "",
        category: profile.category || "",
        instagramUrl: profile.instagramUrl || "",
        youtubeUrl: profile.youtubeUrl || "",
        followers: profile.followers || 0,
        avatarUrl: profile.avatarUrl || "",
        coverUrl: profile.coverUrl || "",
        companyName: profile.companyName || "",
        industry: profile.industry || "",
        description: profile.description || "",
      });
    }
  }, [profile, user, form]);

  function onSubmit(values: z.infer<typeof profileSchema>) {
    // Clean up empty strings to undefined to match API types
    const cleanedValues = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? undefined : v])
    );

    updateProfile.mutate({ data: cleanedValues }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        });
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: err.message || "Could not save your profile changes.",
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  const isBusiness = user?.role === "business";

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={profile?.avatarUrl || ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {profile?.name?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Your Profile</h1>
          <p className="text-muted-foreground mt-1 capitalize">{user?.role} Account</p>
        </div>
      </div>

      <Card className="shadow-sm border-primary/10">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold border-b border-border pb-2">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11" />
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
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Austin" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Neighborhood / Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. South Congress" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {!isBusiness && (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-bold border-b border-border pb-2">Creator Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. food, fitness, fashion" {...field} className="h-11" />
                          </FormControl>
                          <FormDescription>One word works best</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="followers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Followers</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="instagramUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/..." {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="youtubeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/..." {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="coverUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="h-11" />
                        </FormControl>
                        <FormDescription>Hero image for your profile page</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell businesses about your audience and style..." 
                            className="min-h-[150px] resize-y"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {isBusiness && (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-bold border-b border-border pb-2">Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Restaurant, Retail, Gym" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell influencers about your local business..." 
                            className="min-h-[120px] resize-y"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" className="h-12 px-8" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Spinner className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
