import { useState, useRef, useEffect } from "react";
import { 
  useListMessagesWithUser, 
  getListMessagesWithUserQueryKey,
  useSendMessageToUser
} from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { format } from "date-fns";

export default function MessageDetail() {
  const { user } = useAuth();
  const [, params] = useRoute("/messages/:userId");
  const otherUserId = params?.userId ? parseInt(params.userId, 10) : 0;
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useListMessagesWithUser(otherUserId, {
    query: { 
      enabled: !!otherUserId, 
      queryKey: getListMessagesWithUserQueryKey(otherUserId),
      refetchInterval: 4000 // Poll every 4s
    }
  });

  const sendMessage = useSendMessageToUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    sendMessage.mutate({
      userId: otherUserId,
      data: { content: content.trim() }
    }, {
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries({ queryKey: getListMessagesWithUserQueryKey(otherUserId) });
      }
    });
  };

  if (isLoading && !messages) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] max-w-4xl mx-auto bg-background md:border-x md:border-border">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/messages"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border border-border mr-3">
            <AvatarImage src="" /> {/* We don't have other user profile here easily without a separate query, fallback to generic */}
            <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg leading-none">Chat</h2>
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {!messages || messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Send className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">No messages yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Send a message to start the conversation. Be polite and clear about your local collaboration ideas.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user?.id;
            const showTime = i === 0 || new Date(msg.createdAt).getTime() - new Date(messages[i-1].createdAt).getTime() > 1000 * 60 * 30; // 30 mins
            
            return (
              <div key={msg.id} className="flex flex-col">
                {showTime && (
                  <div className="text-center text-xs text-muted-foreground font-medium my-4">
                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </div>
                )}
                <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-sm' 
                      : 'bg-card border border-border text-card-foreground rounded-tl-sm shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap break-words text-[15px]">{msg.content}</p>
                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 h-12 bg-muted/50 border-transparent focus-visible:bg-background"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-12 w-12 shrink-0 rounded-full"
            disabled={!content.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? <Spinner className="h-5 w-5" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
