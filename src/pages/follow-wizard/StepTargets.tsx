import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, Upload, Users } from 'lucide-react';
import { FollowCampaignDraft } from './FollowCampaignWizard';
import { FollowersExtractor } from '@/components/shared/FollowersExtractor';

interface Props {
  draft: FollowCampaignDraft;
  updateDraft: (updates: Partial<FollowCampaignDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepTargets = ({ draft, updateDraft, onNext, onBack }: Props) => {
  const [showFollowerFlow, setShowFollowerFlow] = useState(false);

  const handleFollowersSelected = (followers: any[]) => {
    updateDraft({ selectedFollowers: followers });
    onNext();
  };

  const getTargetCount = () => {
    if (draft.targetSource === 'manual') {
      return draft.manualTargets.split('\n').filter(t => t.trim()).length;
    }
    return draft.selectedFollowers?.length || 0;
  };

  const canProceed = getTargetCount() > 0;

  // Show follower extraction flow
  if (showFollowerFlow && draft.targetSource === 'followers') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Extract Followers</h2>
          <p className="text-muted-foreground">Fetch followers from any Twitter account</p>
        </div>

        <FollowersExtractor
          accountId={draft.accountId}
          onFollowersSelected={handleFollowersSelected}
          initialUsername={draft.followerUsername}
          initialQuantity={draft.followerQuantity}
        />

        <div className="flex justify-start">
          <Button variant="outline" onClick={() => setShowFollowerFlow(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Main selection view
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Select Targets</h2>
        <p className="text-muted-foreground">Choose who you want to follow</p>
      </div>

      <RadioGroup
        value={draft.targetSource}
        onValueChange={(value: 'manual' | 'followers') => updateDraft({ targetSource: value })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div
            className={`cursor-pointer rounded-lg border-2 p-6 transition-colors ${
              draft.targetSource === 'manual'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => updateDraft({ targetSource: 'manual' })}
          >
            <RadioGroupItem value="manual" id="manual" className="sr-only" />
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Manual List</h3>
              <p className="text-sm text-muted-foreground">
                Enter usernames manually to follow them
              </p>
            </div>
          </div>

          <div
            className={`cursor-pointer rounded-lg border-2 p-6 transition-colors ${
              draft.targetSource === 'followers'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => updateDraft({ targetSource: 'followers' })}
          >
            <RadioGroupItem value="followers" id="followers" className="sr-only" />
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Followers Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Extract followers from any Twitter account
              </p>
            </div>
          </div>
        </div>
      </RadioGroup>

      {draft.targetSource === 'manual' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targets">Target Usernames</Label>
            <Textarea
              id="targets"
              placeholder="@username1&#10;@username2&#10;@username3"
              rows={8}
              value={draft.manualTargets}
              onChange={(e) => updateDraft({ manualTargets: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Enter one username per line • {getTargetCount()} usernames entered
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={() => {
            if (draft.targetSource === 'followers') {
              setShowFollowerFlow(true);
            } else {
              onNext();
            }
          }}
          disabled={draft.targetSource === 'manual' && !canProceed}
          className="bg-gradient-primary"
        >
          {draft.targetSource === 'followers' ? 'Extract Followers' : 'Next: Configure Settings'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
