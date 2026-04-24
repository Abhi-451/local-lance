import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListFeaturedInfluencers, useListInfluencerCategories, useListInfluencerCities } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, TrendingUp, Store } from "lucide-react";

export default function Landing() {
  const { data: featuredInfluencers } = useListFeaturedInfluencers();
  const { data: categories } = useListInfluencerCategories();
  const { data: cities } = useListInfluencerCities();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-muted/30">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero.png" 
            alt="Warm neighborhood cafe" 
            className="w-full h-full object-cover opacity-20 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground tracking-tight mb-6"
            >
              Where Local Brands Meet Local Voices
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground mb-10"
            >
              Connect with authentic creators in your city. Build meaningful partnerships that drive real neighborhood foot traffic.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
                <Link href="/signup?role=business">I'm a Business</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 bg-background/80 backdrop-blur" asChild>
                <Link href="/signup?role=influencer">I'm an Influencer</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats/Value Props */}
      <section className="py-16 bg-background border-y border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Hyper-Local Focus</h3>
              <p className="text-muted-foreground">Find creators who actually live, work, and influence in your specific neighborhood or city.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                <Store className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Authentic Partnerships</h3>
              <p className="text-muted-foreground">Move beyond transactional ads to genuine experiences that resonate with the local community.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Real Results</h3>
              <p className="text-muted-foreground">Track engagement, manage requests, and measure the impact of your local collaborations seamlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Influencers */}
      {featuredInfluencers && featuredInfluencers.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Meet Local Voices</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover creators who are already shaping the conversation in your city.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredInfluencers.slice(0, 4).map((influencer, i) => (
                <motion.div
                  key={influencer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="h-full overflow-hidden hover-elevate transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                        {influencer.avatarUrl ? (
                          <img 
                            src={influencer.avatarUrl} 
                            alt={influencer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-serif text-muted-foreground/50">
                            {influencer.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 text-white">
                          <h3 className="font-bold text-lg truncate">{influencer.name}</h3>
                          <div className="flex items-center text-sm text-white/80 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{influencer.city}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <span className="text-xs font-medium px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                          {influencer.category}
                        </span>
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          {(influencer.followers / 1000).toFixed(1)}k
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/influencers">Explore All Creators</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Directory Stats */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-6 flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-primary" /> Active Cities
              </h3>
              <div className="flex flex-wrap gap-3">
                {cities?.map(c => (
                  <Link key={c.city} href={`/influencers?city=${encodeURIComponent(c.city)}`}>
                    <div className="px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer text-sm font-medium flex items-center">
                      {c.city} <span className="ml-2 text-muted-foreground text-xs">{c.count}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold mb-6 flex items-center">
                <Store className="h-6 w-6 mr-2 text-secondary" /> Popular Categories
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories?.map(c => (
                  <Link key={c.category} href={`/influencers?category=${encodeURIComponent(c.category)}`}>
                    <div className="px-4 py-2 rounded-full border border-border hover:border-secondary hover:bg-secondary/5 transition-colors cursor-pointer text-sm font-medium flex items-center capitalize">
                      {c.category} <span className="ml-2 text-muted-foreground text-xs">{c.count}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
