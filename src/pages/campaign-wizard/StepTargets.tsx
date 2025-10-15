import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, Upload, Users } from 'lucide-react';
import { CampaignDraft } from './CampaignWizard';
import { FollowersExtraction } from './FollowersExtraction';

interface Props {
  draft: CampaignDraft;
  updateDraft: (updates: Partial<CampaignDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepTargets = ({ draft, updateDraft, onNext, onBack }: Props) => {
  const [showFollowerFlow, setShowFollowerFlow] = useState(false);

  if (showFollowerFlow && draft.targetSource === 'followers') {
    return (
      <FollowersExtraction
        draft={draft}
        updateDraft={updateDraft}
        onComplete={onNext}
        onBack={() => setShowFollowerFlow(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Target Audience</h2>
        <p className="text-muted-foreground">Choose how to build your target list</p>
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
                Paste usernames or upload a CSV file with your targets
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
              Enter one username per line or separated by commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv">Or Upload CSV</Label>
            <div className="flex items-center gap-4">
              <Input id="csv" type="file" accept=".csv" disabled />
              <Button variant="outline" disabled>
                Upload
              </Button>
            </div>
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
          className="bg-gradient-primary"
        >
          {draft.targetSource === 'followers' ? 'Extract Followers' : 'Next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
