import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

const FunctionDisplay = ({ toolCall }) => {
    const [expanded, setExpanded] = useState(false);
    const name = toolCall?.name || 'Function';
    const status = toolCall?.status || 'pending';
    const results = toolCall?.results;
    
    const parsedResults = (() => {
        if (!results) return null;
        try {
            return typeof results === 'string' ? JSON.parse(results) : results;
        } catch {
            return results;
        }
    })();
    
    const isError = results && (
        (typeof results === 'string' && /error|failed/i.test(results)) ||
        (parsedResults?.success === false)
    );
    
    const statusConfig = {
        pending: { icon: Clock, color: 'text-gray-400', text: 'Pending' },
        running: { icon: Loader2, color: 'text-purple-400', text: 'Running...', spin: true },
        in_progress: { icon: Loader2, color: 'text-purple-400', text: 'Running...', spin: true },
        completed: isError ? 
            { icon: AlertCircle, color: 'text-red-500', text: 'Failed' } : 
            { icon: CheckCircle2, color: 'text-emerald-400', text: 'Success' },
        success: { icon: CheckCircle2, color: 'text-emerald-400', text: 'Success' },
        failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
        error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
    }[status] || { icon: Zap, color: 'text-gray-500', text: '' };
    
    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                    "hover:bg-gray-800",
                    expanded ? "bg-gray-800 border-gray-600" : "bg-gray-900 border-gray-700"
                )}
            >
                <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span className="text-gray-300">{formattedName}</span>
                {statusConfig.text && (
                    <span className={cn("text-gray-400", isError && "text-red-400")}>
                        • {statusConfig.text}
                    </span>
                )}
                {!statusConfig.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-gray-500 transition-transform ml-auto", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-gray-700 space-y-2">
                    {toolCall.arguments_string && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Parameters:</div>
                            <pre className="bg-gray-800/50 rounded-md p-2 text-xs text-gray-300 whitespace-pre-wrap">
                                {(() => {
                                    try {
                                        return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                                    } catch {
                                        return toolCall.arguments_string;
                                    }
                                })()}
                            </pre>
                        </div>
                    )}
                    {parsedResults && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Result:</div>
                            <pre className="bg-gray-800/50 rounded-md p-2 text-xs text-gray-300 whitespace-pre-wrap max-h-48 overflow-auto">
                                {typeof parsedResults === 'object' ? 
                                    JSON.stringify(parsedResults, null, 2) : parsedResults}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    
    return (
        <div className={cn("flex gap-3 my-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="h-8 w-8 rounded-lg bg-purple-900/50 flex items-center justify-center mt-0.5 border border-purple-800">
                    <Zap className="h-4 w-4 text-purple-400" />
                </div>
            )}
            <div className={cn("max-w-[85%] w-fit", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-2.5",
                        isUser ? "bg-purple-600 text-white" : "bg-gray-800 border border-gray-700 text-gray-200"
                    )}>
                        {isUser ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                            <ReactMarkdown 
                                className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                components={{
                                    code: ({ inline, className, children, ...props }) => !inline ? (
                                        <div className="relative group/code my-2">
                                            <pre className="bg-gray-900/80 text-gray-200 rounded-lg p-3 overflow-x-auto">
                                                <code className={className} {...props}>{children}</code>
                                            </pre>
                                            <Button
                                                size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100"
                                                onClick={() => navigator.clipboard.writeText(String(children))}
                                            >
                                                <Copy className="h-3 w-3 text-gray-400" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <code className="px-1 py-0.5 rounded bg-gray-700 text-purple-300 text-xs">{children}</code>
                                    ),
                                    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{children}</a>,
                                    p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
                
                {message.tool_calls?.length > 0 && (
                    <div className="space-y-1 mt-2">
                        {message.tool_calls.map((toolCall, idx) => (
                            <FunctionDisplay key={idx} toolCall={toolCall} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}