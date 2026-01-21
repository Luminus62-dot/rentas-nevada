"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ToastContext";
import { Conversation, Message } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function MessagingCenter({ userId, role, initialConversationId, onSelect }: {
    userId: string,
    role: string,
    initialConversationId?: string | null,
    onSelect?: (id: string | null) => void
}) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { t } = useI18n();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [presenceUsers, setPresenceUsers] = useState<any>({});
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Scroll to bottom on messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Track user typing and broadcast
    const handleTyping = (value: string) => {
        setNewMessage(value);
        if (!activeConv) return;

        if ((window as any).broadcastTyping) {
            (window as any).broadcastTyping(value.length > 0);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if ((window as any).broadcastTyping) (window as any).broadcastTyping(false);
        }, 3000);
    };

    // Load Conversations
    async function loadConversations() {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from("conversations")
                .select("*, listing:listing_id(title), tenant:tenant_id(id, full_name), landlord:landlord_id(id, full_name)")
                .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
                .order("updated_at", { ascending: false });

            if (error) throw error;
            if (data) {
                const fetched = data as Conversation[];
                // Filter is now mostly for safety, as DB trigger will un-hide them on new messages
                const filtered = fetched.filter(c =>
                    role === 'landlord' ? c.deleted_by_landlord !== true : c.deleted_by_tenant !== true
                );
                setConversations(filtered);

                // Sync activeConv with refreshed data if it exists
                if (activeConv) {
                    const match = fetched.find(c => c.id === activeConv.id);
                    if (match && (match.updated_at !== activeConv.updated_at || match.status !== activeConv.status)) {
                        setActiveConv(match);
                    }
                }
            }
        } catch (err) {
            console.error("Error loading conversations:", err);
        }
    }

    // Initial Load and Realtime for conversations list
    useEffect(() => {
        loadConversations().finally(() => setLoading(false));

        const channel = supabase
            .channel(`user_convs_${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' },
                payload => {
                    const conv = payload.new as any;
                    if (conv && (conv.tenant_id === userId || conv.landlord_id === userId)) {
                        loadConversations();
                    }
                })
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED') {
                    console.warn(`MessagingCenter: Conversation channel status: ${status}`, userId);
                }
            });

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    // Handle deep-linking / initial ID
    useEffect(() => {
        if (!initialConversationId) return;

        async function focusAndUnhide() {
            // Find in current list
            let found = conversations.find(c => c.id === initialConversationId);

            if (!found) {
                const { data, error } = await supabase
                    .from("conversations")
                    .select("*, listing:listing_id(title), tenant:tenant_id(id, full_name), landlord:landlord_id(id, full_name)")
                    .eq("id", initialConversationId)
                    .single();
                if (!error && data) found = data as Conversation;
            }

            if (found) {
                setActiveConv(found);
                // Ensure it's not deleted locally
                setConversations(prev => {
                    const exists = prev.some(c => c.id === found!.id);
                    if (exists) return prev.map(c => c.id === found!.id ? { ...found!, deleted_by_landlord: false, deleted_by_tenant: false } : c);
                    return [found!, ...prev];
                });
                // Unhide in DB
                const updateField = role === 'landlord' ? { deleted_by_landlord: false } : { deleted_by_tenant: false };
                await supabase.from("conversations").update(updateField).eq("id", found.id);
            }
        }
        focusAndUnhide();
    }, [initialConversationId]);

    // Sync parent state
    useEffect(() => {
        if (onSelect) onSelect(activeConv?.id || null);
    }, [activeConv?.id]);

    // Channel for Active Conversation (Messages & Presence)
    useEffect(() => {
        if (!activeConv) {
            setMessages([]);
            return;
        }

        async function loadMessages() {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", activeConv!.id)
                .order("created_at", { ascending: true });
            if (!error) setMessages(data || []);
        }
        loadMessages().then(() => scrollToBottom("auto"));

        const channel = supabase
            .channel(`chat_room_${activeConv.id}`, { config: { presence: { key: userId } } })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
                payload => {
                    const newMsg = payload.new as Message;
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        // Replace optimistic if exists
                        const optimisticIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === newMsg.content);
                        if (optimisticIndex !== -1) {
                            const updated = [...prev];
                            updated[optimisticIndex] = newMsg;
                            return updated;
                        }
                        return [...prev, newMsg];
                    });
                })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${activeConv.id}` },
                payload => {
                    setActiveConv(prev => prev ? { ...prev, ...payload.new } : null);
                })
            .on('presence', { event: 'sync' }, () => {
                setPresenceUsers(channel.presenceState());
            })
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                if (payload.senderId !== userId) setIsTyping(payload.typing);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() });
                } else {
                    console.warn(`MessagingCenter: Room channel status for ${activeConv.id}: ${status}`);
                }
            });

        (window as any).broadcastTyping = (typing: boolean) => {
            channel.send({ type: 'broadcast', event: 'typing', payload: { senderId: userId, typing } });
        };

        return () => {
            supabase.removeChannel(channel);
            delete (window as any).broadcastTyping;
        };
    }, [activeConv?.id, userId]);

    async function sendMessage() {
        if (!newMessage.trim() || !activeConv) return;
        const content = newMessage.trim();
        setNewMessage("");

        if ((window as any).broadcastTyping) (window as any).broadcastTyping(false);

        // Optimistic
        const tempId = 'temp-' + Date.now();
        const optimisticMsg: Message = {
            id: tempId,
            conversation_id: activeConv.id,
            sender_id: userId,
            content,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        const { error, data } = await supabase.from("messages").insert({
            conversation_id: activeConv.id,
            sender_id: userId,
            content
        }).select().single();

        if (error) {
            showToast(t("messaging.errorSending"), "error");
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } else if (data) {
            // Update will come through realtime too, but we can sync now
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        }
    }

    async function deleteConversation(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm(t("messaging.hideChat"))) return;
        const updateField = role === 'landlord' ? { deleted_by_landlord: true } : { deleted_by_tenant: true };
        const { error } = await supabase.from("conversations").update(updateField).eq("id", id);
        if (!error) {
            setConversations(prev => prev.filter(c => c.id !== id));
            if (activeConv?.id === id) setActiveConv(null);
        }
    }

    async function finishConversation() {
        if (!activeConv) return;
        if (!confirm(t("messaging.finishConfirm"))) return;
        const { error } = await supabase.from("conversations").update({ status: 'finished' }).eq("id", activeConv.id);
        if (!error) showToast(t("messaging.closed"));
    }

    if (loading) return <div className="p-10 text-center animate-pulse text-muted-foreground">{t("messaging.loading")}</div>;

    return (
        <div className="flex bg-card/40 border border-border/50 rounded-3xl overflow-hidden h-[600px] shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-border/20 flex flex-col bg-muted/10">
                <div className="p-6 border-b border-border/20">
                    <h3 className="font-bold text-xl tracking-tight">Chats</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-10 text-center text-sm text-muted-foreground italic">{t("messaging.empty")}</div>
                    ) : (
                        conversations.map(conv => {
                            const otherUser = role === 'landlord' ? conv.tenant : conv.landlord;
                            const isOnline = presenceUsers[otherUser?.id || ""];
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConv(conv)}
                                    className={`w-full p-4 text-left transition-all relative group ${activeConv?.id === conv.id ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`font-bold text-sm truncate ${activeConv?.id === conv.id ? 'text-primary' : 'text-foreground'}`}>
                                            {otherUser?.full_name || t("messaging.userFallback")}
                                            {isOnline && <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2" />}
                                        </p>
                                        <span className="text-[9px] opacity-50">{new Date(conv.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate opacity-80">{conv.listing?.title}</p>
                                    <button onClick={(e) => deleteConversation(conv.id, e)} className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 text-[10px] hover:text-red-500">🗑️</button>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-transparent to-muted/5">
                {activeConv ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-border/20 flex items-center justify-between bg-background/20 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                    {(role === 'landlord' ? activeConv.tenant?.full_name : activeConv.landlord?.full_name)?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{role === 'landlord' ? activeConv.tenant?.full_name : activeConv.landlord?.full_name}</h4>
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{activeConv.listing?.title}</p>
                                </div>
                            </div>
                            {role === 'landlord' && activeConv.status !== 'finished' && (
                                <button onClick={finishConversation} className="text-[10px] font-bold bg-green-500 text-green-700 px-3 py-1 rounded-full">✅ {t("messaging.finish")}</button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeConv.status === 'finished' && (
                                <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-center text-xs text-green-800 font-medium">{t("messaging.finished")}</div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] ${msg.sender_id === userId ? 'bg-primary text-white rounded-tr-none' : 'bg-card border border-border/40 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="text-[10px] text-muted-foreground italic ml-2 animate-pulse">{t("messaging.typing")}</div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {activeConv.status !== 'finished' && (
                            <div className="p-4 border-t border-border/20">
                                <div className="flex gap-2 bg-card border border-border/40 rounded-xl p-1 shadow-sm">
                                    <input
                                        type="text"
                                        placeholder={t("messaging.messagePlaceholder")}
                                        className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                                        value={newMessage}
                                        onChange={e => handleTyping(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    />
                                    <button onClick={sendMessage} className="bg-primary text-white px-4 rounded-lg font-bold text-sm">{t("messaging.send")}</button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50">
                        <span className="text-4xl mb-2">💬</span>
                        <p className="text-sm">{t("messaging.selectChat")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
