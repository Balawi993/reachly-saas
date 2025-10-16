import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Save, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clearAuthToken, userSettings, subscription } from '@/lib/api';
import { useEffect, useState } from 'react';
import { SettingsSkeleton } from '@/components/loading/PageSkeleton';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, subData] = await Promise.all([
        userSettings.getProfile(),
        subscription.get().catch(() => null)
      ]);
      
      setProfile({
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: profileData.email || ''
      });
      
      setSubscriptionData(subData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userSettings.updateProfile(profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await userSettings.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  const UsageBar = ({ label, used, limit }: { label: string; used: number; limit: number }) => {
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    const isNearLimit = percentage >= 80;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className={`font-medium ${isNearLimit ? 'text-warning' : 'text-foreground'}`}>
            {used} / {limit}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${
              isNearLimit ? 'bg-warning' : 'bg-gradient-primary'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Subscription & Usage */}
        {subscriptionData && (
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Your Plan</h2>
              <Badge variant="default" className="text-base">
                {subscriptionData.plan_name}
              </Badge>
            </div>

            <div className="space-y-4">
              <UsageBar
                label="DMs This Month"
                used={subscriptionData.dms_used_this_period || 0}
                limit={subscriptionData.max_dms_per_month || 0}
              />
              
              <UsageBar
                label="Follows This Month"
                used={subscriptionData.follows_used_this_period || 0}
                limit={subscriptionData.max_follows_per_month || 0}
              />

              <div className="grid gap-4 pt-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">Connected Accounts</p>
                  <p className="text-lg font-semibold text-foreground">
                    - / {subscriptionData.max_accounts}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">DM Campaigns</p>
                  <p className="text-lg font-semibold text-foreground">
                    - / {subscriptionData.max_active_dm_campaigns === 999 ? '∞' : subscriptionData.max_active_dm_campaigns}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">Follow Campaigns</p>
                  <p className="text-lg font-semibold text-foreground">
                    - / {subscriptionData.max_active_follow_campaigns === 999 ? '∞' : subscriptionData.max_active_follow_campaigns}
                  </p>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-primary"
                onClick={() => navigate('/plans')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Profile</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-gradient-primary text-lg text-primary-foreground">
                  DU
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" disabled>
                Change Avatar
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-primary">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Security</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              />
            </div>
            <Button onClick={handleUpdatePassword} disabled={saving} variant="outline">
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </Card>

        <Card className="border-destructive/50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Logout</p>
              <p className="text-sm text-muted-foreground">End your current session</p>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
