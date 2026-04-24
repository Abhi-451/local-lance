import { useListMyCampaigns } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Campaigns() {
  const { data: campaigns, isLoading } = useListMyCampaigns();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Your Campaigns</h1>
          <p className="text-muted-foreground mt-2">Manage your active local marketing initiatives.</p>
        </div>
        <Button asChild className="h-11">
          <Link href="/campaigns/new">
            <Plus className="mr-2 h-5 w-5" /> New Campaign
          </Link>
        </Button>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <Card className="bg-muted/20 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create your first campaign to start finding local influencers to partner with your brand.
            </p>
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="mr-2 h-4 w-4" /> Create Campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="h-full hover-elevate transition-shadow cursor-pointer">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{campaign.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {campaign.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm mt-4 pt-4 border-t border-border">
                    <div className="flex items-center text-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                      <span className="truncate">{campaign.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-foreground">
                        <DollarSign className="h-4 w-4 mr-2 text-secondary/70" />
                        <span className="font-medium">${campaign.budget}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
