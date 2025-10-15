import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { FollowCampaignDraft } from './FollowCampaignWizard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  draft: FollowCampaignDraft;
  updateDraft: (updates: Partial<FollowCampaignDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepSettings = ({ draft, updateDraft, onNext, onBack }: Props) => {
  const updateSettings = (key: string, value: number | boolean) => {
    updateDraft({
      settings: { ...draft.settings, [key]: value }
    });
  };

  const showHighPacingWarning = draft.settings.followsPerMinute > 10 || draft.settings.dailyCap > 200;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Follow Settings</h2>
        <p className="text-muted-foreground">Configure how follows are executed</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Follows per Minute: {draft.settings.followsPerMinute}</Label>
            <Slider
              value={[draft.settings.followsPerMinute]}
              onValueChange={([value]) => updateSettings('followsPerMinute', value)}
              min={1}
              max={20}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 5-10 follows per minute
            </p>
          </div>

          <div className="space-y-2">
            <Label>Daily Follow Cap: {draft.settings.dailyCap}</Label>
            <Slider
              value={[draft.settings.dailyCap]}
              onValueChange={([value]) => updateSettings('dailyCap', value)}
              min={10}
              max={400}
              step={10}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 100-200 follows per day
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label>Random Delay</Label>
              <p className="text-xs text-muted-foreground">
                Add random delays between follows to appear more natural
              </p>
            </div>
            <Switch
              checked={draft.settings.randomDelay}
              onCheckedChange={(checked) => updateSettings('randomDelay', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label>Auto-Pause on High Failure</Label>
              <p className="text-xs text-muted-foreground">
                Automatically pause if failure rate exceeds 20%
              </p>
            </div>
            <Switch
              checked={draft.settings.autoPauseOnHighFailure}
              onCheckedChange={(checked) => updateSettings('autoPauseOnHighFailure', checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="bg-muted p-6">
            <h3 className="mb-4 font-semibold text-foreground">Estimated Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Follows per hour:</span>
                <span className="font-medium text-foreground">
                  ~{draft.settings.followsPerMinute * 60}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily capacity:</span>
                <span className="font-medium text-foreground">
                  {draft.settings.dailyCap} follows
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Random delays:</span>
                <span className="font-medium text-foreground">
                  {draft.settings.randomDelay ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </Card>

          {showHighPacingWarning && (
            <Alert className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-sm">
                <strong>High pacing detected:</strong> Following too many accounts too quickly may
                trigger spam filters. Consider reducing your pacing for better results.
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-primary bg-primary/10 p-4">
            <h4 className="mb-2 text-sm font-semibold text-foreground">🛡️ Safety Recommendations</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Start with conservative limits</li>
              <li>• Enable random delays</li>
              <li>• Stay under 200 follows per day initially</li>
              <li>• Monitor for issues</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-primary">
          Review Campaign
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
