import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, BarChart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await admin.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-8"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🛡️ Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, plans, and system settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-foreground">
                  {(stats?.activeCampaigns || 0) + (stats?.activeFollowCampaigns || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <BarChart className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total DMs Sent</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalDMs || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold text-foreground">${stats?.mrr || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Plan Distribution */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Plan Distribution</h2>
          <div className="space-y-3">
            {stats?.planDistribution?.map((plan: any) => (
              <div key={plan.name} className="flex items-center justify-between">
                <span className="text-foreground">{plan.name}</span>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-primary"
                      style={{ 
                        width: `${stats.totalUsers > 0 ? (plan.user_count / stats.totalUsers) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="w-16 text-right font-medium text-foreground">
                    {plan.user_count} users
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Actions</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/admin/plans')}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Plans
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/admin/stats')}
            >
              <BarChart className="mr-2 h-4 w-4" />
              View Statistics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
