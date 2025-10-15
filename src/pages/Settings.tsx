import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clearAuthToken } from '@/lib/api';

export default function Settings() {
  const navigate = useNavigate();

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

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
                <Input id="firstName" defaultValue="Demo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="User" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="demo@reachly.com" />
            </div>

            <Button onClick={handleSave} className="bg-gradient-primary">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Security</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button onClick={handleSave} variant="outline">
              Update Password
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
