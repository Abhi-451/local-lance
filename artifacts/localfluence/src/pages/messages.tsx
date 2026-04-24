import { useListConversations } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Messages() {
  const { data: conversations, isLoading } = useListConversations();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-2">Chat with your local connections.</p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <Card className="bg-muted/20 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No messages yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              When you send or receive collaboration requests, your conversations will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {conversations.map((convo, i) => (
            <Link key={convo.otherUserId} href={`/messages/${convo.otherUserId}`}>
              <div className={`flex items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                i !== conversations.length - 1 ? 'border-b border-border' : ''
              }`}>
                <div className="relative">
                  <Avatar className="h-14 w-14 border border-border">
                    <AvatarImage src={convo.otherUserAvatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {convo.otherUserName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {convo.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-card">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
                
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-base truncate pr-2">{convo.otherUserName}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {convo.lastMessage}
                    </p>
                    {convo.otherUserRole && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-2">
                        {convo.otherUserRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
