import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateCampaign, getListMyCampaignsQueryKey } from "@workspace/api-client-react";
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
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const campaignSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Please provide more details." }),
  budget: z.coerce.number().min(1, { message: "Budget must be greater than 0." }),
  location: z.string().min(2, { message: "Location is required." }),
  deliverables: z.string().min(10, { message: "Please specify what you expect." }),
});

export default function NewCampaign() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCampaign = useCreateCampaign();

  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
      location: "",
      deliverables: "",
    },
  });

  function onSubmit(values: z.infer<typeof campaignSchema>) {
    createCampaign.mutate({ data: values }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListMyCampaignsQueryKey() });
        toast({
          title: "Campaign created!",
          description: "Your campaign is now active and ready for influencers.",
        });
        setLocation(`/campaigns/${data.id}`);
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to create campaign.",
        });
      }
    });
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3 text-muted-foreground">
        <Link href="/campaigns"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaigns</Link>
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Create New Campaign</h1>
        <p className="text-muted-foreground mt-2">Describe what you're looking for to attract the right local creators.</p>
      </div>

      <Card className="shadow-md border-primary/10">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Summer Menu Launch - Foodies Wanted" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Downtown Austin or specific neighborhood" {...field} className="h-11" />
                    </FormControl>
                    <FormDescription>Where does this take place?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input type="number" min="0" step="50" {...field} className="pl-8 h-11" />
                        </div>
                      </FormControl>
                      <FormDescription>Total compensation</FormDescription>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell creators about your brand and the goal of this campaign..." 
                        className="min-h-[120px] resize-y"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliverables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Deliverables</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. 1 Instagram Reel and 3 Stories..." 
                        className="min-h-[100px] resize-y"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>What exactly do you need them to post?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button type="button" variant="outline" className="mr-3 h-11" asChild>
                  <Link href="/campaigns">Cancel</Link>
                </Button>
                <Button type="submit" className="h-11 px-8" disabled={createCampaign.isPending}>
                  {createCampaign.isPending ? <Spinner className="mr-2 h-5 w-5" /> : null}
                  Create Campaign
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
