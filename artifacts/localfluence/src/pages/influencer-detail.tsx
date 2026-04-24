import { useState } from "react";
import { 
  useGetInfluencer, 
  getGetInfluencerQueryKey,
  useListMyCampaigns,
  useCreateRequest
} from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Users, MessageSquare, Instagram, Youtube, Send, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function InfluencerDetail() {
  const [, params] = useRoute("/influencers/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [message, setMessage] = useState("");

  const { data: influencer, isLoading } = useGetInfluencer(id, {
    query: { enabled: !!id, queryKey: getGetInfluencerQueryKey(id) }
  });

  const { data: campaigns } = useListMyCampaigns({
    query: { enabled: user?.role === "business" }
  });

  const createRequest = useCreateRequest();

  const handleSendRequest = () => {
    createRequest.mutate({
      data: {
        influencerId: id,
        campaignId: selectedCampaign && selectedCampaign !== "none" ? parseInt(selectedCampaign, 10) : undefined,
        message: message || undefined
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Request sent!",
          description: `Your collaboration request to ${influencer?.name} has been sent.`,
        });
        setRequestDialogOpen(false);
        setMessage("");
        setSelectedCampaign("");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to send request."
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <Spinner size="xl" className="text-primary" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Influencer not found</h2>
        <Button asChild><Link href="/influencers">Back to Directory</Link></Button>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full bg-muted relative">
        {influencer.coverUrl ? (
          <img src={influencer.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="container mx-auto px-4 md:px-8 absolute bottom-4 left-0 right-0 z-10">
          <Button variant="ghost" size="sm" asChild className="mb-4 bg-background/50 backdrop-blur hover:bg-background/80">
            <Link href="/influencers"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Discover</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-16 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Profile Info */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <Card className="shadow-lg border-transparent pt-12 relative">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full border-4 border-background overflow-hidden bg-muted shadow-md">
                {influencer.avatarUrl ? (
                  <img src={influencer.avatarUrl} alt={influencer.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-muted-foreground/50">
                    {influencer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              
              <CardContent className="text-center pt-4 pb-6 px-6">
                <h1 className="text-2xl font-bold font-serif">{influencer.name}</h1>
                <div className="flex items-center justify-center text-muted-foreground mt-2 mb-4 text-sm">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  {influencer.city}{influencer.area ? `, ${influencer.area}` : ''}
                </div>
                
                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-sm font-semibold rounded-full capitalize mb-6">
                  {influencer.category}
                </span>
                
                <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-around mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground flex items-center justify-center">
                      <Users className="h-5 w-5 mr-1.5 text-muted-foreground" />
                      {(influencer.followers / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">Followers</div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 mb-6">
                  {influencer.instagramUrl && (
                    <a href={influencer.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {influencer.youtubeUrl && (
                    <a href={influencer.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                </div>

                <div className="space-y-3">
                  {user?.role === "business" && (
                    <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full text-base h-12 shadow-md">
                          <Send className="mr-2 h-4 w-4" /> Request Collab
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl">Collaborate with {influencer.name}</DialogTitle>
                          <DialogDescription>
                            Send a request to see if they're interested in working with your brand.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Link to a Campaign (Optional)</label>
                            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a campaign" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None (General inquiry)</SelectItem>
                                {campaigns?.map(c => (
                                  <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Message (Optional)</label>
                            <Textarea 
                              placeholder="Hi! We love your content and would love to work together..."
                              className="min-h-[120px] resize-none"
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleSendRequest} disabled={createRequest.isPending}>
                            {createRequest.isPending ? <Spinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Button variant="secondary" className="w-full h-12" asChild>
                    <Link href={`/messages/${influencer.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Bio & Content */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <Card className="shadow-sm border-transparent h-full">
              <CardContent className="p-6 md:p-10">
                <h2 className="text-2xl font-serif font-bold mb-6">About {influencer.name.split(' ')[0]}</h2>
                
                {influencer.bio ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap text-muted-foreground">{influencer.bio}</p>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">This creator hasn't added a bio yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
