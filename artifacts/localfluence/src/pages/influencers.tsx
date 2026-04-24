import { useState } from "react";
import { useListInfluencers, useListInfluencerCategories, useListInfluencerCities } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "wouter";
import { MapPin, Users, Search, FilterX } from "lucide-react";
import { motion } from "framer-motion";

export default function Influencers() {
  const [city, setCity] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");

  const { data: cities } = useListInfluencerCities();
  const { data: categories } = useListInfluencerCategories();

  const queryParams: any = {};
  if (city && city !== "all") queryParams.city = city;
  if (category && category !== "all") queryParams.category = category;
  if (q) queryParams.q = q;

  const { data: influencers, isLoading } = useListInfluencers(queryParams);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(searchInput);
  };

  const clearFilters = () => {
    setCity("all");
    setCategory("all");
    setQ("");
    setSearchInput("");
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Discover Local Creators</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Find the perfect voices to amplify your brand in your neighborhood.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-8 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or bio..." 
              className="pl-9 h-11"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities?.map(c => (
                  <SelectItem key={c.city} value={c.city}>{c.city} ({c.count})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(c => (
                  <SelectItem key={c.category} value={c.category} className="capitalize">{c.category} ({c.count})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="h-11 md:w-auto w-full">Search</Button>
          {(city !== "all" || category !== "all" || q) && (
            <Button type="button" variant="ghost" onClick={clearFilters} className="h-11 px-3" title="Clear filters">
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" className="text-primary" />
        </div>
      ) : influencers && influencers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {influencers.map((influencer, i) => (
            <motion.div
              key={influencer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link href={`/influencers/${influencer.id}`}>
                <Card className="h-full overflow-hidden hover-elevate transition-all duration-300 cursor-pointer border-transparent hover:border-primary/20">
                  <CardContent className="p-0">
                    <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                      {influencer.avatarUrl ? (
                        <img 
                          src={influencer.avatarUrl} 
                          alt={influencer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-serif text-muted-foreground/30">
                          {influencer.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16 text-white">
                        <h3 className="font-bold text-xl truncate">{influencer.name}</h3>
                        <div className="flex items-center text-sm text-white/90 mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                          <span className="truncate">{influencer.city}{influencer.area ? `, ${influencer.area}` : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-secondary/10 text-secondary rounded-full capitalize">
                          {influencer.category}
                        </span>
                        <div className="flex items-center text-sm font-bold text-foreground">
                          <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          {(influencer.followers / 1000).toFixed(1)}k
                        </div>
                      </div>
                      {influencer.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {influencer.bio}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No creators found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We couldn't find any influencers matching your current filters. Try adjusting your search criteria.
          </p>
          <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
}
