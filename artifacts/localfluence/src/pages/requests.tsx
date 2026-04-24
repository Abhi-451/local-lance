import { useState } from "react";
import { 
  useListMyRequests, 
  getListMyRequestsQueryKey,
  useUpdateRequestStatus,
  ListMyRequestsStatus 
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, UserCircle, CheckCircle2, XCircle, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function Requests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const queryParams = statusFilter !== "all" ? { status: statusFilter as ListMyRequestsStatus } : {};
  
  const { data: requests, isLoading } = useListMyRequests(queryParams, {
    query: { queryKey: getListMyRequestsQueryKey(queryParams) }
  });

  const updateStatus = useUpdateRequestStatus();

  const handleUpdateStatus = (id: number, newStatus: any) => {
    updateStatus.mutate({
      id,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListMyRequestsQueryKey({ status: statusFilter as any }) });
        toast({
          title: "Status updated",
          description: `Request has been marked as ${newStatus}.`,
        });
      }
    });
  };

  const isBusiness = user?.role === "business";

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Collaboration Requests</h1>
        <p className="text-muted-foreground mt-2">Manage your partnership proposals and ongoing collaborations.</p>
      </div>

      <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="mb-8 bg-muted/50 p-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : !requests || requests.length === 0 ? (
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
                  {isBusiness ? <UserCircle className="h-8 w-8" /> : <Store className="h-8 w-8" />}
                </div>
                <h3 className="text-xl font-bold mb-2">No requests found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {statusFilter === "all" 
                    ? (isBusiness ? "You haven't sent any collaboration requests yet." : "You haven't received any collaboration requests yet.")
                    : `You have no ${statusFilter} requests.`}
                </p>
                {isBusiness && statusFilter === "all" && (
                  <Button asChild>
                    <Link href="/influencers">Find Influencers</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <Card key={request.id} className="overflow-hidden">
                  <div className={`h-1.5 w-full ${
                    request.status === 'accepted' ? 'bg-secondary' :
                    request.status === 'rejected' ? 'bg-destructive' :
                    request.status === 'completed' ? 'bg-primary' :
                    'bg-accent'
                  }`} />
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            request.status === 'accepted' ? 'bg-secondary/10 text-secondary' :
                            request.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                            request.status === 'completed' ? 'bg-primary/10 text-primary' :
                            'bg-accent/20 text-accent-foreground'
                          }`}>
                            {request.status}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {format(new Date(request.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">
                            {isBusiness ? request.influencerName : request.businessName}
                          </h3>
                          {request.campaignTitle && (
                            <div className="text-sm font-medium text-muted-foreground mt-1">
                              Campaign: <Link href={isBusiness ? `/campaigns/${request.campaignId}` : "#"} className={isBusiness ? "text-primary hover:underline" : ""}>{request.campaignTitle}</Link>
                            </div>
                          )}
                        </div>
                        
                        {request.message && (
                          <div className="bg-muted/40 p-4 rounded-lg mt-2 text-sm text-foreground/90 italic border-l-4 border-muted">
                            "{request.message}"
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[200px] justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                        {/* Influencer Actions */}
                        {!isBusiness && request.status === "pending" && (
                          <>
                            <Button 
                              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                              onClick={() => handleUpdateStatus(request.id, "accepted")}
                              disabled={updateStatus.isPending}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleUpdateStatus(request.id, "rejected")}
                              disabled={updateStatus.isPending}
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Decline
                            </Button>
                          </>
                        )}

                        {/* Business Actions */}
                        {isBusiness && request.status === "accepted" && (
                          <Button 
                            className="w-full"
                            onClick={() => handleUpdateStatus(request.id, "completed")}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                          </Button>
                        )}
                        
                        <Button variant="secondary" className="w-full" asChild>
                          <Link href={`/messages/${isBusiness ? request.influencerId : request.businessId}`}>
                            Message
                          </Link>
                        </Button>
                        
                        {isBusiness && (
                          <Button variant="outline" className="w-full" asChild>
                            <Link href={`/influencers/${request.influencerId}`}>View Profile</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
