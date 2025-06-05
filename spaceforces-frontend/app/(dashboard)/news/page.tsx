"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Newspaper,
  Rocket,
  Search,
  Star,
  X,
} from "lucide-react";
import {
  getSpaceNews,
  getNewsSites,
  type SpaceNewsArticle,
  type SpaceNewsParams,
} from "@/services/getSpaceNews";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

function SearchParamsProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  return <>{children}</>;
}

export default function NewsPage() {
  // State for articles and loading
  const [articles, setArticles] = useState<SpaceNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [newsSites, setNewsSites] = useState<string[]>([]);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNewsSite, setSelectedNewsSite] = useState<string>("");
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<string>("-published_at");
  const [activeTab, setActiveTab] = useState("all");

  const ITEMS_PER_PAGE = 12;

  // Fetch articles based on current filters
  const fetchArticles = async (page = 1) => {
    setLoading(true);

    try {
      const params: SpaceNewsParams = {
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
        ordering: sortOrder,
        has_event: false,
        has_launch: false,
      };

      // Add filters if they're set
      if (searchQuery) params.search = searchQuery;
      if (selectedNewsSite) params.news_site = selectedNewsSite;
      if (isFeaturedOnly) params.is_featured = true;

      // Add filter for launches or events based on active tab
      if (activeTab === "launches") params.has_launch = true;
      if (activeTab === "events") params.has_event = true;

      const response = await getSpaceNews(params);
      setArticles(response.results);
      setTotalCount(response.count);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to fetch space news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch news sites for filter
  const fetchNewsSites = async () => {
    try {
      const sites = await getNewsSites();
      setNewsSites(sites);
    } catch (error) {
      console.error("Error fetching news sites:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchArticles();
    fetchNewsSites();
  }, []);

  // Apply filters
  const applyFilters = () => {
    fetchArticles(1); // Reset to first page when applying filters

    // Update URL with search params
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedNewsSite) params.set("news_site", selectedNewsSite);
    if (isFeaturedOnly) params.set("is_featured", "true");
    if (sortOrder !== "-published_at") params.set("ordering", sortOrder);

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.pushState({}, "", newUrl);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedNewsSite("");
    setIsFeaturedOnly(false);
    setSortOrder("-published_at");
    setActiveTab("all");

    // Reset URL
    window.history.pushState({}, "", window.location.pathname);

    // Fetch articles with reset filters
    fetchArticles(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1A0033] to-[#2E0854] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center text-white">
            <Newspaper className="mr-2 h-6 w-6 text-[#E6E6FA]" />
            Space News
          </h1>
          <p className="text-white/70">Stay updated with the latest news from the cosmos</p>
        </div>

        {/* Search and Filters */}
        <Suspense fallback={<div>Loading...</div>}>
          <SearchParamsProvider>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="relative w-full md:w-auto md:flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  type="search"
                  placeholder="Search space news..."
                  className="w-full pl-8 bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyFilters();
                  }}
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-[#2E0854] border-[#9370DB]/30 text-white">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Options</h4>

                      <div className="space-y-2">
                        <Label htmlFor="news-site">News Source</Label>
                        <Select value={selectedNewsSite} onValueChange={setSelectedNewsSite}>
                          <SelectTrigger className="bg-[#4B0082]/30 border-[#9370DB]/30 text-white">
                            <SelectValue placeholder="All Sources" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2E0854] border-[#9370DB]/30 text-white">
                            <SelectItem value="">All Sources</SelectItem>
                            {newsSites.map((site) => (
                              <SelectItem key={site} value={site}>
                                {site}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sort-order">Sort By</Label>
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                          <SelectTrigger className="bg-[#4B0082]/30 border-[#9370DB]/30 text-white">
                            <SelectValue placeholder="Newest First" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2E0854] border-[#9370DB]/30 text-white">
                            <SelectItem value="-published_at">Newest First</SelectItem>
                            <SelectItem value="published_at">Oldest First</SelectItem>
                            <SelectItem value="-updated_at">Recently Updated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={isFeaturedOnly}
                          onCheckedChange={(checked) => setIsFeaturedOnly(checked === true)}
                        />
                        <Label
                          htmlFor="featured"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Featured Articles Only
                        </Label>
                      </div>

                      <div className="flex justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            applyFilters();
                          }}
                          className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </SearchParamsProvider>
        </Suspense>

        {/* Tabs for different views */}
        <Tabs
          defaultValue="all"
          className="mb-6"
          onValueChange={(value) => {
            setActiveTab(value);
            fetchArticles(1);
          }}
        >
          <TabsList className="bg-[#4B0082]/30 border border-[#9370DB]/30">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
            >
              All News
            </TabsTrigger>
            <TabsTrigger
              value="launches"
              className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
            >
              Launch News
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
            >
              Event News
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm overflow-hidden"
              >
                <Skeleton className="h-48 w-full bg-[#4B0082]/30" />
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 bg-[#4B0082]/30 mb-2" />
                  <Skeleton className="h-4 w-full bg-[#4B0082]/30" />
                  <Skeleton className="h-4 w-2/3 bg-[#4B0082]/30 mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/3 bg-[#4B0082]/30" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm overflow-hidden flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image_url || "/placeholder.svg?height=192&width=384"}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    {article.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500/80 text-black">
                          <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge
                        variant="outline"
                        className="bg-[#4B0082]/30 text-white/90 hover:bg-[#4B0082]/50"
                      >
                        {article.news_site}
                      </Badge>
                      <div className="flex items-center text-xs text-white/60">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.published_at)}
                      </div>
                    </div>
                    <CardTitle className="mt-2 line-clamp-2 text-white">{article.title}</CardTitle>
                    <CardDescription className="text-white/70 line-clamp-3 mt-1">
                      {article.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-1">
                      {article.launches && article.launches.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-[#4B0082]/30 text-white/90 hover:bg-[#4B0082]/50"
                        >
                          <Rocket className="h-3 w-3 mr-1" /> Launch
                        </Badge>
                      )}
                      {article.events && article.events.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-[#4B0082]/30 text-white/90 hover:bg-[#4B0082]/50"
                        >
                          Event
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
                      asChild
                    >
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        Read Full Article
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchArticles(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-white/70">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchArticles(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Rocket className="h-16 w-16 text-[#9370DB]/50 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
            <p className="text-white/70 text-center max-w-md mb-6">
              {searchQuery || selectedNewsSite || isFeaturedOnly
                ? "No articles match your search criteria. Try adjusting your filters."
                : "There are no articles available at the moment. Please check back later."}
            </p>
            {(searchQuery || selectedNewsSite || isFeaturedOnly) && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
