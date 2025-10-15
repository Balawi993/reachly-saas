import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, MessageSquare } from 'lucide-react';

export default function Conversations() {
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // TODO: Implement real conversations API
  const mockConversations: any[] = [];
  const conversation = null;
  const target = null;
  const campaign = null;

  return (
    <div className="flex h-screen bg-background">
      <div className="w-80 border-r border-border">
        <div className="border-b border-border p-4">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Conversations</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

        <div className="overflow-y-auto">
          {mockConversations.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto max-w-sm space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No conversations yet</h3>
                <p className="text-muted-foreground">
                  Start a campaign to begin conversations with your targets
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {conversation && target ? (
          <>
            <div className="border-b border-border p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={target.avatar} />
                  <AvatarFallback>{target.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-foreground">{target.name}</h2>
                  <p className="text-sm text-muted-foreground">{target.handle}</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {campaign?.name}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {conversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md rounded-lg p-4 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`mt-1 text-xs ${
                        msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && setMessage('')}
                />
                <Button className="bg-gradient-primary" disabled>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
