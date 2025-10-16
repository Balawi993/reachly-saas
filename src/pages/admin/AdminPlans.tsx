import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Users } from 'lucide-react';
import { admin } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await admin.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setEditData({
      name: plan.name,
      price: plan.price,
      max_accounts: plan.max_accounts,
      max_dms_per_month: plan.max_dms_per_month,
      max_follows_per_month: plan.max_follows_per_month,
      max_active_dm_campaigns: plan.max_active_dm_campaigns,
      max_active_follow_campaigns: plan.max_active_follow_campaigns,
    });
  };

  const handleSave = async () => {
    if (!selectedPlan) return;

    try {
      await admin.updatePlan(selectedPlan.id, editData);
      toast.success('Plan updated successfully');
      setSelectedPlan(null);
      loadPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-8"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plans Management</h1>
          <p className="text-muted-foreground">Manage subscription plans and limits</p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-bold text-primary">${plan.price}<span className="text-sm text-muted-foreground">/mo</span></p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accounts:</span>
                  <span className="font-medium text-foreground">{plan.max_accounts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DMs/month:</span>
                  <span className="font-medium text-foreground">{plan.max_dms_per_month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Follows/month:</span>
                  <span className="font-medium text-foreground">{plan.max_follows_per_month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DM Campaigns:</span>
                  <span className="font-medium text-foreground">{plan.max_active_dm_campaigns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Follow Campaigns:</span>
                  <span className="font-medium text-foreground">{plan.max_active_follow_campaigns}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {plan.subscriber_count || 0} subscribers
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Edit Plan Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Plan: {selectedPlan?.name}</DialogTitle>
              <DialogDescription>
                Update plan limits and pricing
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plan Name</Label>
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={editData.price || 0}
                    onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Accounts</Label>
                  <Input
                    type="number"
                    value={editData.max_accounts || 0}
                    onChange={(e) => setEditData({ ...editData, max_accounts: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Max DMs/month</Label>
                  <Input
                    type="number"
                    value={editData.max_dms_per_month || 0}
                    onChange={(e) => setEditData({ ...editData, max_dms_per_month: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Follows/month</Label>
                  <Input
                    type="number"
                    value={editData.max_follows_per_month || 0}
                    onChange={(e) => setEditData({ ...editData, max_follows_per_month: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Max Active DM Campaigns</Label>
                  <Input
                    type="number"
                    value={editData.max_active_dm_campaigns || 0}
                    onChange={(e) => setEditData({ ...editData, max_active_dm_campaigns: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Active Follow Campaigns</Label>
                  <Input
                    type="number"
                    value={editData.max_active_follow_campaigns || 0}
                    onChange={(e) => setEditData({ ...editData, max_active_follow_campaigns: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
