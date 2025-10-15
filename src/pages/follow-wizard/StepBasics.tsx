import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { FollowCampaignDraft } from './FollowCampaignWizard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Props {
  draft: FollowCampaignDraft;
  updateDraft: (updates: Partial<FollowCampaignDraft>) => void;
  onNext: () => void;
}

export const StepBasics = ({ draft, updateDraft, onNext }: Props) => {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadAccounts();
  }, []);
  
  const loadAccounts = async () => {
    try {
      const { accounts } = await import('@/lib/api');
      const data = await accounts.list();
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const canProceed = draft.name && draft.accountId;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Campaign Basics</h2>
        <p className="text-muted-foreground">Give your follow campaign a name and select an account</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Tech Influencers Follow"
            value={draft.name}
            onChange={(e) => updateDraft({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">Connected Account *</Label>
          <Select value={draft.accountId} onValueChange={(value) => updateDraft({ accountId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={account.avatar} />
                      <AvatarFallback>{account.username[0]}</AvatarFallback>
                    </Avatar>
                    <span>{account.username}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This account will be used to follow the targeted users
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} className="bg-gradient-primary">
          Next: Select Targets
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
