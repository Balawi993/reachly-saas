import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CampaignDraft } from './CampaignWizard';
import { accounts } from '@/lib/api';

interface Props {
  draft: CampaignDraft;
  updateDraft: (updates: Partial<CampaignDraft>) => void;
  onNext: () => void;
}

export const StepBasics = ({ draft, updateDraft, onNext }: Props) => {
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountsList, setAccountsList] = useState<any[]>([]);
  
  useEffect(() => {
    loadAccounts();
  }, []);
  
  const loadAccounts = async () => {
    try {
      const data = await accounts.list();
      setAccountsList(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!draft.name) newErrors.name = 'Campaign name is required';
    if (!draft.accountId) newErrors.accountId = 'Please select an account';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onNext();
  };

  const addTag = () => {
    if (tagInput && !draft.tags.includes(tagInput)) {
      updateDraft({ tags: [...draft.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateDraft({ tags: draft.tags.filter(t => t !== tag) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Campaign Basics</h2>
        <p className="text-muted-foreground">Let's start with the essential information</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Q4 Founder Outreach"
            value={draft.name}
            onChange={(e) => {
              updateDraft({ name: e.target.value });
              setErrors({ ...errors, name: '' });
            }}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">Select Account *</Label>
          <Select
            value={draft.accountId}
            onValueChange={(value) => {
              updateDraft({ accountId: value });
              setErrors({ ...errors, accountId: '' });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an account" />
            </SelectTrigger>
            <SelectContent>
              {accountsList.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.username} ({account.handle})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.accountId && <p className="text-sm text-destructive">{errors.accountId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (Optional)</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {draft.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} className="bg-gradient-primary">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
