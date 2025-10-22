import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Send, Users, TrendingUp, Target, UserPlus, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { dashboard, campaigns as campaignsAPI } from '@/lib/api';
import { DashboardSkeleton } from '@/components/loading/PageSkeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({ totalDMs: 0, activeCampaigns: 0, connectedAccounts: 0, totalTargets: 0 });
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [statsData, campaignsData] = await Promise.all([
        dashboard.stats(),
        campaignsAPI.list()
      ]);
      setStats(statsData);
      setRecentCampaigns(campaignsData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <DashboardSkeleton />;
  }
  
  const totalDMs = stats.totalDMs;
  const activeCampaigns = stats.activeCampaigns;
  const totalAccounts = stats.connectedAccounts;
  const totalTargets = stats.totalTargets;

  const statsDisplay = [
    { label: 'Total DMs Sent', value: totalDMs, icon: Send, color: 'text-primary' },
    { label: 'Active Campaigns', value: activeCampaigns, icon: TrendingUp, color: 'text-success' },
    { label: 'Connected Accounts', value: totalAccounts, icon: Users, color: 'text-warning' },
    { label: 'Total Targets', value: totalTargets, icon: Target, color: 'text-info' },
  ];
  
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your outreach overview.</p>
          </div>
          <Button onClick={() => navigate('/campaigns/new')} className="bg-gradient-primary">
            Create Campaign
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsDisplay.map((stat) => (
            <Card key={stat.label} className="p-4 shadow-md transition-all hover:shadow-lg cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
                View All →
              </Button>
            </div>
            <div className="p-4 space-y-2">
              {recentCampaigns.length === 0 ? (
                <div className="py-8 text-center">
                  <Send className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <p className="mt-2 text-sm text-muted-foreground">No campaigns yet</p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-gradient-primary"
                    onClick={() => navigate('/campaigns/new')}
                  >
                    Create Campaign
                  </Button>
                </div>
              ) : (
                recentCampaigns.map((campaign) => (
                  <div 
                    key={campaign.id} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${
                        campaign.status === 'active' ? 'bg-success animate-pulse' : 'bg-muted'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.stats_sent}/{campaign.stats_total} sent
                        </p>
                      </div>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'paused' ? 'secondary' : 'outline'} className="text-xs shrink-0">
                      {campaign.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="shadow-md">
            <div className="border-b border-border p-4">
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="grid gap-3 p-4">
              <Button onClick={() => navigate('/campaigns/new')} variant="outline" className="justify-start">
                <Send className="mr-2 h-4 w-4" />
                Create DM Campaign
              </Button>
              <Button onClick={() => navigate('/follow-campaigns/new')} variant="outline" className="justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Follow Campaign
              </Button>
              <Button onClick={() => navigate('/accounts')} variant="outline" className="justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Accounts
              </Button>
              <Button onClick={() => navigate('/settings')} variant="outline" className="justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
