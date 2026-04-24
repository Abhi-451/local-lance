import { useAuth } from "@/hooks/useAuth";
import { useGetBusinessDashboard, useGetInfluencerDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Store, UserCircle, Briefcase, CheckCircle, Clock, Plus, Users, Send } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function BusinessDashboardView() {
  const { data: dashboard, isLoading } = useGetBusinessDashboard();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your local campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.campaignCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Collabs</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.activeCollaborations}</div>
          </CardContent>
        </Card>
        
        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Sent</CardTitle>
            <Send className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.requestsSent}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.pendingRequests || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold">Recent Campaigns</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/campaigns">View all</Link>
            </Button>
          </div>
          
          {dashboard.recentCampaigns.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentCampaigns.map(campaign => (
                <Card key={campaign.id} className="hover-elevate transition-shadow">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{campaign.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                    </div>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/campaigns/${campaign.id}`}>Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Store className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold mb-2">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first campaign to start finding local talent.</p>
                <Button asChild>
                  <Link href="/campaigns/new"><Plus className="h-4 w-4 mr-2" /> New Campaign</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold">Recent Requests</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/requests">View all</Link>
            </Button>
          </div>
          
          {dashboard.recentRequests.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentRequests.map(request => (
                <Card key={request.id} className="hover-elevate transition-shadow">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">To: {request.influencerName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          request.status === 'accepted' ? 'bg-secondary/10 text-secondary' :
                          request.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                          request.status === 'completed' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {request.campaignTitle && (
                          <span className="text-xs text-muted-foreground">• {request.campaignTitle}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/influencers/${request.influencerId}`}>Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold mb-2">No requests sent</h3>
                <p className="text-sm text-muted-foreground mb-4">Discover influencers in your area to partner with.</p>
                <Button variant="secondary" asChild>
                  <Link href="/influencers">Discover Creators</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfluencerDashboardView() {
  const { data: dashboard, isLoading } = useGetInfluencerDashboard();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-secondary" />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-2">Manage your local partnerships.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.pendingRequests}</div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Collabs</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.acceptedCollaborations}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalRequests}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold">Recent Requests</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/requests">View all requests</Link>
          </Button>
        </div>
        
        {dashboard.recentRequests.length > 0 ? (
          <div className="space-y-4">
            {dashboard.recentRequests.map(request => (
              <Card key={request.id} className="hover-elevate transition-shadow">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{request.businessName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        request.status === 'accepted' ? 'bg-secondary/10 text-secondary' :
                        request.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        request.status === 'completed' ? 'bg-primary/10 text-primary' :
                        'bg-accent/20 text-accent-foreground'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      {request.campaignTitle && (
                        <span className="text-xs text-muted-foreground font-medium">• {request.campaignTitle}</span>
                      )}
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/requests">Manage</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">It's quiet here</h3>
              <p className="text-muted-foreground max-w-sm mb-6">Make sure your profile is complete so local businesses can find you.</p>
              <Button variant="secondary" asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      {user?.role === "business" ? <BusinessDashboardView /> : <InfluencerDashboardView />}
    </div>
  );
}
