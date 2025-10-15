import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { CampaignDraft } from './CampaignWizard';
import { toast } from 'sonner';
import { campaigns, accounts } from '@/lib/api';

interface Props {
  draft: CampaignDraft;
  onBack: () => void;
}

export const StepReview = ({ draft, onBack }: Props) => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [account, setAccount] = useState<any>(null);
  
  useEffect(() => {
    loadAccount();
  }, []);
  
  const loadAccount = async () => {
    try {
      const accountsList = await accounts.list();
      const found = accountsList.find((a: any) => a.id.toString() === draft.accountId);
      setAccount(found);
    } catch (error) {
      console.error('Error loading account:', error);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await campaigns.create({
        name: draft.name,
        accountId: Number(draft.accountId),
        tags: draft.tags,
        targetSource: draft.targetSource,
        manualTargets: draft.manualTargets,
        selectedFollowers: draft.selectedFollowers,
        message: draft.message,
        pacing: draft.pacing
      });
      
      setShowSuccess(true);
      toast.success('Campaign created successfully!');
      setTimeout(() => {
        navigate('/campaigns');
      }, 2000);
    } catch (error) {
      toast.error((error as Error).message);
      setCreating(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/20" />
          </div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-success">
            <CheckCircle className="h-12 w-12 text-success-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Campaign Created!</h2>
          <p className="text-muted-foreground">
            Your campaign "{draft.name}" is ready to launch
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate('/campaigns')} variant="outline">
            View All Campaigns
          </Button>
          <Button onClick={() => navigate('/campaigns/new')} className="bg-gradient-primary">
            <Sparkles className="mr-2 h-4 w-4" />
            Create Another
          </Button>
        </div>
      </div>
    );
  }

  const targetCount = draft.targetSource === 'manual'
    ? draft.manualTargets.split('\n').filter(t => t.trim()).length
    : draft.selectedFollowers.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review & Confirm</h2>
        <p className="text-muted-foreground">Double-check everything before creating your campaign</p>
      </div>

      <div className="grid gap-4">
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-foreground">Campaign Basics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground">{draft.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account:</span>
              <span className="font-medium text-foreground">{account?.username}</span>
            </div>
            {draft.tags.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags:</span>
                <div className="flex gap-2">
                  {draft.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-foreground">Targets</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source:</span>
              <Badge variant="outline">
                {draft.targetSource === 'manual' ? 'Manual List' : 'Followers Extraction'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Targets:</span>
              <span className="font-medium text-foreground">{targetCount}</span>
            </div>
            {draft.targetSource === 'followers' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extracted from:</span>
                <span className="font-medium text-foreground">{draft.followerUsername}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-foreground">Message</h3>
          <div className="rounded-lg bg-muted p-4">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {draft.message || 'No message template'}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-foreground">Pacing & Limits</h3>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages/minute:</span>
              <span className="font-medium text-foreground">{draft.pacing.perMinute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily cap:</span>
              <span className="font-medium text-foreground">{draft.pacing.dailyCap}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delay range:</span>
              <span className="font-medium text-foreground">
                {draft.pacing.delayMin}s - {draft.pacing.delayMax}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retry attempts:</span>
              <span className="font-medium text-foreground">{draft.pacing.retryAttempts}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={creating}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleCreate} className="bg-gradient-primary" size="lg" disabled={creating}>
          <CheckCircle className="mr-2 h-5 w-5" />
          {creating ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </div>
  );
};
