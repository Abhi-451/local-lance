import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Influencers from "@/pages/influencers";
import InfluencerDetail from "@/pages/influencer-detail";
import Campaigns from "@/pages/campaigns";
import CampaignNew from "@/pages/campaign-new";
import CampaignDetail from "@/pages/campaign-detail";
import Requests from "@/pages/requests";
import Messages from "@/pages/messages";
import MessageDetail from "@/pages/message-detail";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      
      <Route path="/influencers">
        <ProtectedRoute><Influencers /></ProtectedRoute>
      </Route>
      
      <Route path="/influencers/:id">
        <ProtectedRoute><InfluencerDetail /></ProtectedRoute>
      </Route>
      
      <Route path="/campaigns">
        <ProtectedRoute><Campaigns /></ProtectedRoute>
      </Route>
      
      <Route path="/campaigns/new">
        <ProtectedRoute><CampaignNew /></ProtectedRoute>
      </Route>
      
      <Route path="/campaigns/:id">
        <ProtectedRoute><CampaignDetail /></ProtectedRoute>
      </Route>
      
      <Route path="/requests">
        <ProtectedRoute><Requests /></ProtectedRoute>
      </Route>
      
      <Route path="/messages">
        <ProtectedRoute><Messages /></ProtectedRoute>
      </Route>
      
      <Route path="/messages/:userId">
        <ProtectedRoute><MessageDetail /></ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute><Profile /></ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Layout>
              <Router />
            </Layout>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
