import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RefreshCw, Edit } from 'lucide-react';
import { admin, subscription } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, plansData] = await Promise.all([
        admin.getUsers(),
        subscription.getPlans()
      ]);
      setUsers(usersData);
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedUser || !selectedPlanId) return;

    try {
      await admin.changeUserPlan(selectedUser.id, parseInt(selectedPlanId));
      toast.success('User plan updated successfully');
      setSelectedUser(null);
      loadData();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Failed to change plan');
    }
  };

  const handleResetUsage = async (userId: number) => {
    if (!confirm('Are you sure you want to reset this user\'s usage?')) return;

    try {
      await admin.resetUserUsage(userId);
      toast.success('Usage reset successfully');
      loadData();
    } catch (error) {
      console.error('Error resetting usage:', error);
      toast.error('Failed to reset usage');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen bg-background p-8"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground">Manage user subscriptions and usage</p>
          </div>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>DMs Used</TableHead>
                <TableHead>Follows Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.first_name} {user.last_name}
                    {user.role === 'admin' && (
                      <Badge className="ml-2" variant="default">Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.plan_name || 'No Plan'}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.dms_used_this_period || 0} / {user.max_dms_per_month || 0}
                  </TableCell>
                  <TableCell>
                    {user.follows_used_this_period || 0} / {user.max_follows_per_month || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedPlanId('');
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetUsage(user.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User: {selectedUser?.email}</DialogTitle>
              <DialogDescription>
                Change the user's subscription plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Plan</label>
                <p className="text-sm text-muted-foreground">{selectedUser?.plan_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">New Plan</label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name} - ${plan.price}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleChangePlan} className="w-full">
                Change Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
