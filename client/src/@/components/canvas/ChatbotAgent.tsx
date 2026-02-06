import { useState, useRef, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
}

const ChatbotAgent = memo(() => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'agent',
            content: t('chatbot.welcome'),
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        try {
            // Build history for API (exclude welcome message if needed)
            const history = updatedMessages
                .filter(msg => msg.id !== 'welcome')
                .map(msg => ({
                    role: msg.role,
                    content: msg.content,
                }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: history.slice(0, -1), // Exclude current message from history
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const agentMessage: Message = {
                id: `agent-${Date.now()}`,
                role: 'agent',
                content: data.response,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'agent',
                content: t('chatbot.error'),
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Container - button shifts left when chat opens */}
            <div className={cn(
                "absolute bottom-4 top-4 z-50 flex items-end pointer-events-none",
                "transition-all duration-500 ease-out",
                isOpen ? "right-4" : "right-4"
            )}>
                {/* Floating Button - On the left side, shifts left when chat opens */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "pointer-events-auto",
                        "w-16 h-16 rounded-2xl flex-shrink-0",
                        "bg-gradient-to-br from-violet-600 to-indigo-700",
                        "shadow-lg shadow-violet-500/30",
                        "flex items-center justify-center",
                        "hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40",
                        "transition-all duration-300 ease-out",
                        "border border-violet-400/20",
                        "group self-end",
                        isOpen && "mr-4"
                    )}
                    title={t('chatbot.title')}
                >
                    <Bot className={cn(
                        "w-7 h-7 text-white transition-transform duration-300",
                        isOpen ? "rotate-0" : "group-hover:scale-110"
                    )} />
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#13111C] animate-pulse" />
                    )}
                </button>

                {/* Chat Panel - Full height, appears to the right of button */}
                <div
                    className={cn(
                        "pointer-events-auto h-full flex flex-col",
                        "bg-[#13111C]/95 backdrop-blur-xl border border-[#4A4955] rounded-2xl",
                        "shadow-2xl shadow-black/50 overflow-hidden",
                        "transition-all duration-500 ease-out",
                        isOpen
                            ? "w-[400px] opacity-100"
                            : "w-0 opacity-0 border-0"
                    )}
                >
                    {/* Header */}
                    <div className={cn(
                        "flex items-center gap-3 p-4 border-b border-[#4A4955] bg-[#1C1926]/80 backdrop-blur-md flex-shrink-0",
                        "transition-opacity duration-300",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-white font-semibold text-lg truncate">{t('chatbot.title')}</h2>
                            <p className="text-[#A1A1AA] text-xs truncate">{t('chatbot.subtitle')}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={cn(
                        "flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#4A4955] scrollbar-track-transparent",
                        "transition-opacity duration-300",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3",
                                    message.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                {message.role === 'agent' && (
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                                        message.role === 'user'
                                            ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-br-md"
                                            : "bg-[#1C1926] text-[#E4E4E7] border border-[#4A4955] rounded-bl-md"
                                    )}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-[#1C1926] border border-[#4A4955] rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={cn(
                        "p-4 border-t border-[#4A4955] bg-[#1C1926]/80 backdrop-blur-md flex-shrink-0",
                        "transition-opacity duration-300",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('chatbot.input_placeholder')}
                                className={cn(
                                    "flex-1 bg-[#13111C] border border-[#4A4955] rounded-xl px-4 py-3",
                                    "text-white placeholder-[#71717A] text-sm",
                                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50",
                                    "transition-all duration-200"
                                )}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className={cn(
                                    "p-3 rounded-xl flex-shrink-0",
                                    "bg-gradient-to-br from-violet-600 to-indigo-700",
                                    "text-white shadow-lg shadow-violet-500/20",
                                    "hover:shadow-xl hover:shadow-violet-500/30",
                                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg",
                                    "transition-all duration-200"
                                )}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

ChatbotAgent.displayName = 'ChatbotAgent';

export default ChatbotAgent;
