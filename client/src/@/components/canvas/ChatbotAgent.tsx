import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, X, Send, Sparkles, Paperclip, Image as ImageIcon, File, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pb } from '@/lib/pocketbase';

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
    files?: { name: string; type: string; size: number }[];
}

const ChatbotAgent = memo(() => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [panelWidth, setPanelWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'agent',
            content: t('chatbot.welcome'),
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Handle auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const calculatedWidth = (window.innerWidth - 16) - e.clientX;
            if (calculatedWidth >= 300 && calculatedWidth <= 800) {
                setPanelWidth(calculatedWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, resize, stopResizing]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && selectedFiles.length === 0) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: new Date(),
            files: selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size }))
        };

        const agentMessageId = `agent-${Date.now()}`;
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setSelectedFiles([]);
        setIsTyping(true);

        try {
            const history = updatedMessages
                .filter(msg => msg.id !== 'welcome')
                .map(msg => ({
                    role: msg.role,
                    content: msg.content,
                }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pb.authStore.token}`
                },
                body: JSON.stringify({
                    message: input,
                    history: history.slice(0, -1),
                    // Note: file data would be sent here if backend supported it
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            const initialAgentMessage: Message = {
                id: agentMessageId,
                role: 'agent',
                content: '',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, initialAgentMessage]);
            setIsTyping(false);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                setMessages(prev => prev.map(msg =>
                    msg.id === agentMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                ));
            }
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
            <div className={cn(
                "absolute bottom-4 top-4 z-50 flex items-end pointer-events-none",
                "transition-all duration-500 ease-out",
                isOpen ? "right-4" : "right-4"
            )}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "pointer-events-auto relative w-16 h-16 rounded-2xl flex-shrink-0",
                        "bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/30",
                        "flex items-center justify-center hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40",
                        "transition-all duration-300 ease-out border border-violet-400/20 group self-end",
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

                <div
                    style={{ width: isOpen ? `${panelWidth}px` : '0px' }}
                    className={cn(
                        "pointer-events-auto h-full flex flex-col relative",
                        "bg-[#13111C]/95 backdrop-blur-xl border border-[#4A4955] rounded-2xl",
                        "shadow-2xl shadow-black/50 overflow-hidden transition-all duration-500 ease-out",
                        isResizing && "transition-none",
                        isOpen ? "opacity-100" : "opacity-0 border-0"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {isDragging && (
                        <div className="absolute inset-0 z-50 bg-violet-600/20 backdrop-blur-sm border-2 border-dashed border-violet-500 flex items-center justify-center rounded-2xl m-2">
                            <div className="bg-[#1C1926] p-4 rounded-xl shadow-xl flex flex-col items-center gap-2">
                                <Paperclip className="w-8 h-8 text-violet-400 animate-bounce" />
                                <span className="text-white text-sm font-medium">Drop files here</span>
                            </div>
                        </div>
                    )}

                    {isOpen && (
                        <div
                            onMouseDown={startResizing}
                            className={cn(
                                "absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize",
                                "hover:bg-violet-500/50 transition-colors z-50",
                                isResizing && "bg-violet-500/70"
                            )}
                        />
                    )}

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

                    <div className={cn(
                        "flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#4A4955] scrollbar-track-transparent",
                        "transition-opacity duration-300",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn("flex gap-3", message.role === 'user' ? "justify-end" : "justify-start")}
                            >
                                {message.role === 'agent' && (
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className="flex flex-col gap-1 max-w-[80%]">
                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                                            message.role === 'user'
                                                ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-br-md"
                                                : "bg-[#1C1926] text-[#E4E4E7] border border-[#4A4955] rounded-bl-md"
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                    {message.files && message.files.length > 0 && (
                                        <div className={cn("flex flex-wrap gap-2 mt-1", message.role === 'user' ? "justify-end" : "justify-start")}>
                                            {message.files.map((file, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-[#1C1926] border border-[#4A4955] rounded-lg px-2 py-1 text-[10px] text-[#A1A1AA]">
                                                    {file.type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <File className="w-3 h-3" />}
                                                    <span className="truncate max-w-[100px]">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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

                    <div className={cn(
                        "p-4 border-t border-[#4A4955] bg-[#1C1926]/80 backdrop-blur-md flex-shrink-0",
                        "transition-opacity duration-300",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}>
                        {selectedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="relative group bg-[#13111C] border border-violet-500/30 rounded-lg p-2 pr-8 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-2">
                                            {file.type.startsWith('image/') ? (
                                                <ImageIcon className="w-4 h-4 text-violet-400" />
                                            ) : (
                                                <File className="w-4 h-4 text-violet-400" />
                                            )}
                                            <span className="text-xs text-[#E4E4E7] truncate max-w-[120px]">{file.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute right-1 top-1 p-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-end gap-2 bg-[#13111C] border border-[#4A4955] rounded-xl p-2 focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50 transition-all">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                onChange={handleFileSelect}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 rounded-lg text-[#71717A] hover:bg-[#1C1926] hover:text-violet-400 transition-all flex-shrink-0"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={t('chatbot.input_placeholder')}
                                rows={1}
                                className={cn(
                                    "flex-1 bg-transparent border-none px-2 py-2 text-white placeholder-[#71717A] text-sm",
                                    "focus:outline-none resize-none min-h-[40px] max-h-[200px]"
                                )}
                            />
                            <button
                                onClick={handleSend}
                                disabled={(!input.trim() && selectedFiles.length === 0) || isTyping}
                                className={cn(
                                    "p-2.5 rounded-lg flex-shrink-0 bg-gradient-to-br from-violet-600 to-indigo-700",
                                    "text-white shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30",
                                    "disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
