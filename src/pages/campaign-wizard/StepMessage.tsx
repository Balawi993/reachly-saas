import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CampaignDraft } from './CampaignWizard';
import { Badge } from '@/components/ui/badge';

interface Props {
  draft: CampaignDraft;
  updateDraft: (updates: Partial<CampaignDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepMessage = ({ draft, updateDraft, onNext, onBack }: Props) => {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!draft.message.trim()) {
      setError('Message template is required');
      return;
    }
    onNext();
  };

  const renderPreview = () => {
    let preview = draft.message;
    preview = preview.replace(/\{\{name\}\}/g, 'Alex Chen');
    preview = preview.replace(/\{\{username\}\}/g, '@alexchen');
    preview = preview.replace(/\{\{field\}\}/g, 'AI/ML');
    preview = preview.replace(/\{\{topic\}\}/g, 'machine learning');
    preview = preview.replace(/\{\{project\}\}/g, 'your latest project');
    return preview || 'Your message preview will appear here...';
  };

  const characterCount = draft.message.length;
  const maxChars = 1000;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Message Template</h2>
        <p className="text-muted-foreground">Craft your personalized outreach message</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Hey {{name}}, noticed your work in the {{field}} space..."
              rows={10}
              value={draft.message}
              onChange={(e) => {
                updateDraft({ message: e.target.value });
                setError('');
              }}
              maxLength={maxChars}
            />
            <div className="flex items-center justify-between text-sm">
              <p className={characterCount > maxChars * 0.9 ? 'text-warning' : 'text-muted-foreground'}>
                {characterCount} / {maxChars} characters
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label>Available Tokens</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer">
                {'{{name}}'}
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                {'{{username}}'}
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                {'{{field}}'}
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                {'{{topic}}'}
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                {'{{project}}'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Click to copy or type these tokens into your message for personalization
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Live Preview</Label>
          <Card className="bg-muted p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary" />
                <div>
                  <p className="font-medium text-foreground">You</p>
                  <p className="text-xs text-muted-foreground">via DM</p>
                </div>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {renderPreview()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-warning bg-warning/10 p-4">
            <h4 className="mb-2 text-sm font-semibold text-foreground">💡 Tips for Better Messages</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Keep it concise and friendly</li>
              <li>• Use tokens for personalization</li>
              <li>• Provide clear value or reason for connecting</li>
              <li>• Avoid generic templates</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} className="bg-gradient-primary">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
