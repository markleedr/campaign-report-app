import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Users, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns", selectedClientId],
    queryFn: async () => {
      let query = supabase
        .from("campaigns")
        .select(`
          *,
          client:clients(name),
          ad_proofs(count)
        `)
        .order("created_at", { ascending: false });
      
      if (selectedClientId) {
        query = query.eq("client_id", selectedClientId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto px-6 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your clients and ad proofs</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Clients Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Clients</CardTitle>
                </div>
                <Link to="/clients">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedClientId(null)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    selectedClientId === null ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-sm font-medium">All Clients</span>
                </button>
                {clients?.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      selectedClientId === client.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    }`}
                  >
                    <span className="text-sm font-medium">{client.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  <CardTitle>Campaigns</CardTitle>
                </div>
                <Link to="/clients">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-1 h-3 w-3" />
                    New Campaign
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading campaigns...</p>
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-secondary transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.client?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {campaign.ad_proofs?.[0]?.count || 0} ad{campaign.ad_proofs?.[0]?.count !== 1 ? 's' : ''}
                        </span>
                        <Link to={`/campaign/${campaign.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">
                    {selectedClientId ? "No campaigns for this client yet." : "No campaigns yet. Create your first campaign to get started."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
