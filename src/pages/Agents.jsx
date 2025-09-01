import React, { useState, useEffect, useRef, useCallback } from 'react';
import { agentSDK } from "@/agents";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, User, Send, PlusCircle, Scan, Search, Zap } from 'lucide-react';
import MessageBubble from '../components/agents/MessageBubble';
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

const availableAgents = [
    { name: 'scanner_agent', label: 'Store Scanner', icon: Scan, description: 'Analyze store health and performance' },
    { name: 'seo_agent', label: 'SEO Expert', icon: Search, description: 'Optimize content for search engines' },
    { name: 'performance_agent', label: 'Performance Engineer', icon: Zap, description: 'Speed up your store' }
];

export default function Agents() {
    const [selectedAgent, setSelectedAgent] = useState('scanner_agent');
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const loadConversations = useCallback(async () => {
        try {
            setError(null);
            const convos = await agentSDK.listConversations({ agent_name: selectedAgent });
            setConversations(convos);
            
            // Reset active conversation when switching agents
            setActiveConversation(null);
            setMessages([]);
            
            if (convos.length > 0) {
                setActiveConversation(convos[0]);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            setError('Failed to load conversations. The agent may not be properly configured.');
            setConversations([]);
        }
    }, [selectedAgent]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        if (activeConversation) {
            try {
                const unsubscribe = agentSDK.subscribeToConversation(activeConversation.id, (data) => {
                    setMessages(data.messages || []);
                    setIsLoading(false);
                });
                return () => {
                    if (unsubscribe && typeof unsubscribe === 'function') {
                        unsubscribe();
                    }
                };
            } catch (error) {
                console.error('Error subscribing to conversation:', error);
                setError('Failed to connect to conversation. Please refresh.');
            }
        }
    }, [activeConversation]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const createNewConversation = async () => {
        try {
            setError(null);
            const newConvo = await agentSDK.createConversation({
                agent_name: selectedAgent,
                metadata: { 
                    name: `${availableAgents.find(a => a.name === selectedAgent)?.label} Chat ${conversations.length + 1}` 
                }
            });
            setConversations(prev => [newConvo, ...prev]);
            setActiveConversation(newConvo);
        } catch (error) {
            console.error('Error creating conversation:', error);
            setError('Failed to create new conversation. Please check the agent configuration.');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || isLoading) return;

        setIsLoading(true);
        setError(null);
        
        const userMessage = { role: 'user', content: newMessage };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        
        try {
            await agentSDK.addMessage(activeConversation, userMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            setError(`Failed to send message: ${error.response?.data?.detail || error.message}`);
            setIsLoading(false);
            // Remove the message that failed to send
            setMessages(prev => prev.slice(0, -1));
        }
    };

    const currentAgent = availableAgents.find(agent => agent.name === selectedAgent);
    const AgentIcon = currentAgent?.icon || Bot;

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
                <Card className="bg-gray-900 border-red-500/30 p-6 max-w-md">
                    <div className="text-center">
                        <Bot className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <h2 className="text-xl font-medium text-red-400 mb-2">Agent Connection Error</h2>
                        <p className="text-gray-400 mb-4 text-sm">{error}</p>
                        <div className="space-y-2">
                            <Button onClick={() => { setError(null); loadConversations(); }} className="bg-purple-600 hover:bg-purple-700 w-full">
                                Retry Connection
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedAgent('scanner_agent')} className="border-gray-700 text-gray-300 w-full">
                                Switch to Scanner Agent
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-gray-950 text-white">
            {/* Sidebar */}
            <aside className="w-80 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Bot className="text-purple-400" /> AI Agents
                    </h2>
                    <div className="mt-3">
                        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableAgents.map(agent => {
                                    const Icon = agent.icon;
                                    return (
                                        <SelectItem key={agent.name} value={agent.name}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4" />
                                                {agent.label}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="p-4">
                    <Button onClick={createNewConversation} className="w-full bg-purple-600 hover:bg-purple-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Conversation
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {conversations.map(convo => (
                            <button 
                                key={convo.id}
                                onClick={() => setActiveConversation(convo)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${activeConversation?.id === convo.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
                            >
                                <p className="font-medium truncate">{convo.metadata?.name || 'New Conversation'}</p>
                                <p className="text-xs text-gray-400 truncate capitalize">{convo.agent_name.replace('_', ' ')}</p>
                            </button>
                        ))}
                        {conversations.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                <AgentIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No conversations yet</p>
                                <p className="text-sm">Create your first conversation</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Chat Window */}
            <main className="flex-1 flex flex-col">
                {activeConversation ? (
                    <>
                        <header className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <AgentIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-cyan-400">{currentAgent?.label || 'AI Agent'}</h3>
                                    <p className="text-xs text-gray-400">{currentAgent?.description || 'AI Assistant'} • Online</p>
                                </div>
                            </div>
                        </header>
                        <ScrollArea className="flex-1 p-6">
                            <div className="max-w-4xl mx-auto">
                                <AnimatePresence>
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            key={`${activeConversation.id}-${index}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <MessageBubble message={msg} />
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start mb-4"
                                        >
                                            <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <span className="text-gray-300 ml-2">{currentAgent?.label} is thinking...</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                        <footer className="p-6 border-t border-gray-800 bg-gray-900">
                            <div className="max-w-4xl mx-auto">
                                <form onSubmit={handleSendMessage} className="relative">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Ask ${currentAgent?.label} anything...`}
                                        className="bg-gray-800 border-cyan-500/30 h-12 pr-12 text-white placeholder-gray-400 focus:border-cyan-400"
                                        disabled={isLoading}
                                    />
                                    <Button 
                                        type="submit" 
                                        size="icon" 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700" 
                                        disabled={isLoading || !newMessage.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                        <div className="text-gray-500">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                <AgentIcon className="h-12 w-12 text-white" />
                            </div>
                            <h2 className="text-xl font-medium text-cyan-400">{currentAgent?.label || 'AI Agent'}</h2>
                            <p className="mb-2">{currentAgent?.description || 'AI Assistant'}</p>
                            <p className="text-xs text-gray-600">Select a conversation or start a new one to begin.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}