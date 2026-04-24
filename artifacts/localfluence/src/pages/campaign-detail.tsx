import { useGetCampaign, getGetCampaignQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, MapPin, DollarSign, Calendar, Edit, Users } from "lucide-react";
import { format } from "date-fns";

export default function CampaignDetail() {
  const [, params] = useRoute("/campaigns/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: campaign, isLoading } = useGetCampaign(id, {
    query: { enabled: !!id, queryKey: getGetCampaignQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <Spinner size="xl" className="text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Campaign not found</h2>
        <Button asChild><Link href="/campaigns">Back to Campaigns</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3 text-muted-foreground">
        <Link href="/campaigns"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaigns</Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">{campaign.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
            <div className="flex items-center text-foreground bg-primary/10 px-3 py-1 rounded-full text-primary">
              <MapPin className="h-4 w-4 mr-1.5" />
              {campaign.location}
            </div>
            <div className="flex items-center bg-secondary/10 px-3 py-1 rounded-full text-secondary">
              <DollarSign className="h-4 w-4 mr-1" />
              ${campaign.budget}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              Created {format(new Date(campaign.createdAt), "MMM d, yyyy")}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/influencers">
              <Users className="mr-2 h-4 w-4" /> Find Influencers
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4">About this Campaign</h2>
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold mb-4">Expected Deliverables</h2>
            <Card className="border-border shadow-sm bg-muted/30">
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {campaign.deliverables}
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary border-primary text-primary-foreground shadow-md">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-lg mb-2 text-primary-foreground/90">Next Steps</h3>
              <p className="text-sm mb-6 text-primary-foreground/80">
                Start sending requests to local influencers to fill this campaign.
              </p>
              <Button variant="secondary" className="w-full font-bold" asChild>
                <Link href="/influencers">Discover Creators</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
