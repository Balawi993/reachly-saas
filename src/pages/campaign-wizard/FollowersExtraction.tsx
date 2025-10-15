import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CampaignDraft } from './CampaignWizard';
import { FollowersExtractor } from '@/components/shared/FollowersExtractor';

interface Props {
  draft: CampaignDraft;
  updateDraft: (updates: Partial<CampaignDraft>) => void;
  onComplete: () => void;
  onBack: () => void;
}

export const FollowersExtraction = ({ draft, updateDraft, onComplete, onBack }: Props) => {
  const handleFollowersSelected = (followers: any[]) => {
    updateDraft({ selectedFollowers: followers });
    onComplete();
  };

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
        showBadges={true}
      />

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
};
