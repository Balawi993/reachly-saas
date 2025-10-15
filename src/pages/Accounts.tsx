import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { accounts as accountsAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function Accounts() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({ username: '', cookies: '' });
  
  useEffect(() => {
    loadAccounts();
  }, []);
  
  const loadAccounts = async () => {
    try {
      const data = await accountsAPI.list();
      setAccountsList(data);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAccount = async () => {
    if (!formData.username || !formData.cookies) {
      toast.error('Please fill all fields');
      return;
    }
    
    setAdding(true);
    try {
      await accountsAPI.create(formData);
      toast.success('Account added successfully!');
      setShowAddDialog(false);
      setFormData({ username: '', cookies: '' });
      loadAccounts();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setAdding(false);
    }
  };
  
  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      await accountsAPI.delete(id);
      toast.success('Account deleted');
      loadAccounts();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };
  
  if (loading) {
    return <div className="min-h-screen bg-background p-8"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
            <p className="text-muted-foreground">Manage your connected Twitter accounts</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Twitter Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username (without @)</Label>
                  <Input 
                    id="username" 
                    placeholder="username" 
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.replace('@', '') })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookies">Twitter Cookies (JSON)</Label>
                  <Textarea 
                    id="cookies" 
                    placeholder='{"auth_token": "...", "ct0": "..."}'
                    rows={6}
                    value={formData.cookies}
                    onChange={(e) => setFormData({ ...formData, cookies: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste cookies from browser DevTools. See documentation for help.
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-primary" 
                  onClick={handleAddAccount}
                  disabled={adding}
                >
                  {adding ? 'Connecting...' : 'Connect Account'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {accountsList.map((account) => (
            <Card key={account.id} className="p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={account.avatar} />
                    <AvatarFallback>{account.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{account.username}</h3>
                      {account.is_valid ? (
                        <Badge variant="default" className="bg-success">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Invalid
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{account.handle}</p>
                    <p className="text-xs text-muted-foreground">
                      Last validated: {account.last_validated ? new Date(account.last_validated).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {accountsList.length === 0 && (
            <Card className="p-12 text-center">
              <div className="mx-auto max-w-sm space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No accounts connected</h3>
                <p className="text-muted-foreground">
                  Connect your first Twitter account to start reaching out
                </p>
                <Button className="bg-gradient-primary" onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
