import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Search } from 'lucide-react';
import { followers as followersAPI } from '@/lib/api';
import { toast } from 'sonner';

interface FollowersExtractorProps {
  accountId: string;
  onFollowersSelected: (followers: any[]) => void;
  initialUsername?: string;
  initialQuantity?: number;
  showBadges?: boolean;
}

export const FollowersExtractor = ({
  accountId,
  onFollowersSelected,
  initialUsername = '',
  initialQuantity = 100,
  showBadges = false
}: FollowersExtractorProps) => {
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState(initialUsername);
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleExtract = async () => {
    if (!accountId || !username) {
      toast.error('Please select account and enter username');
      return;
    }
    
    setLoading(true);
    try {
      const data = await followersAPI.extract({
        accountId: Number(accountId),
        targetUsername: username.replace('@', ''),
        quantity: quantity
      });
      setFollowers(data);
      // Select all by default
      setSelectedIds(new Set(data.map((f: any) => f.id)));
      
      if (data.length === 0) {
        toast.warning('No followers found');
      } else {
        toast.success(`Found ${data.length} followers`);
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredFollowers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFollowers.map(f => f.id)));
    }
  };

  const handleConfirm = () => {
    const selected = followers.filter(f => selectedIds.has(f.id));
    onFollowersSelected(selected);
  };

  const handleReset = () => {
    setFollowers([]);
    setSelectedIds(new Set());
    setSearchQuery('');
  };

  const filteredFollowers = followers.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Form view (before extraction)
  if (followers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Twitter Username</Label>
          <Input
            id="username"
            placeholder="@username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Enter the username of the account whose followers you want to extract
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Number of Followers</Label>
          <Select
            value={quantity.toString()}
            onValueChange={(value) => setQuantity(parseInt(value))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 followers</SelectItem>
              <SelectItem value="500">500 followers</SelectItem>
              <SelectItem value="1000">1000 followers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="space-y-4 rounded-lg border border-border bg-muted p-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-foreground">Fetching followers from {username}...</p>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <Button
            onClick={handleExtract}
            disabled={!username}
            className="w-full bg-gradient-primary"
          >
            <Search className="mr-2 h-4 w-4" />
            Extract Followers
          </Button>
        )}
      </div>
    );
  }

  // Selection view (after extraction)
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Found {followers.length} followers • {selectedIds.size} selected
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" onClick={toggleAll}>
          {selectedIds.size === filteredFollowers.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-border p-4">
        {filteredFollowers.map((follower) => (
          <div
            key={follower.id}
            className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted"
          >
            <Checkbox
              checked={selectedIds.has(follower.id)}
              onCheckedChange={() => toggleSelection(follower.id)}
            />
            <Avatar>
              <AvatarImage src={follower.avatar} />
              <AvatarFallback>{follower.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground">{follower.name}</p>
              <p className="text-sm text-muted-foreground">{follower.handle}</p>
            </div>
            {showBadges && follower.followers && (
              <Badge variant="secondary">{follower.followers.toLocaleString()} followers</Badge>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1"
        >
          Extract Different Account
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedIds.size === 0}
          className="flex-1 bg-gradient-primary"
        >
          Use Selected ({selectedIds.size})
        </Button>
      </div>
    </div>
  );
};
