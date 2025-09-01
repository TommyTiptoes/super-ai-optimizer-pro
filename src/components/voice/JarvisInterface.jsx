import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JarvisInterface({ onVoiceCommand, onSpeakResponse }) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);
    const synthRef = useRef(null);

    const speak = useCallback((text) => {
        if (synthRef.current && text) {
            // Stop any ongoing speech
            synthRef.current.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.85;
            utterance.pitch = 0.7;
            utterance.volume = 0.9;
            
            // Try to find a suitable voice (preferably British male for that sophisticated AI feel)
            const voices = synthRef.current.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Google UK English Male') || 
                voice.name.includes('Microsoft David Desktop') ||
                voice.name.includes('Daniel') ||
                voice.lang === 'en-GB' && voice.name.includes('Male')
            ) || voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Male'));
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            
            synthRef.current.speak(utterance);
        }
    }, []);

    const handleVoiceCommand = useCallback((command) => {
        const lowerCommand = command.toLowerCase();
        
        // Process voice commands and provide appropriate responses
        if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
            speak("Good day, sir. How may I assist you with your store optimization today?");
        } else if (lowerCommand.includes('scan') || lowerCommand.includes('analyze')) {
            speak("Initiating comprehensive store analysis. Please stand by while I examine your store's performance metrics.");
            onVoiceCommand?.(command);
        } else if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
            speak("Navigating to your optimization dashboard.");
            onVoiceCommand?.(command);
        } else if (lowerCommand.includes('agent') || lowerCommand.includes('assistant')) {
            speak("Accessing AI agent interface. I'm here to help optimize your store.");
            onVoiceCommand?.(command);
        } else if (lowerCommand.includes('storefront') || lowerCommand.includes('create')) {
            speak("Loading the AI Storefront Creator. Shall we build something extraordinary?");
            onVoiceCommand?.(command);
        } else if (lowerCommand.includes('status') || lowerCommand.includes('report')) {
            speak("Generating current store status report.");
            onVoiceCommand?.(command);
        } else if (lowerCommand.includes('optimize') || lowerCommand.includes('improve')) {
            speak("Analyzing optimization opportunities. I'll identify areas for improvement.");
            onVoiceCommand?.(command);
        } else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
            speak("I can scan your store, generate reports, create storefronts, and assist with optimization tasks. Simply speak your request.");
        } else {
            speak("I'm not certain I understood that command. Perhaps you could rephrase your request?");
            onVoiceCommand?.(command);
        }
    }, [speak, onVoiceCommand]);

    useEffect(() => {
        // Check if speech recognition is supported
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(finalTranscript);
                    handleVoiceCommand(finalTranscript);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        // Initialize speech synthesis
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
            
            // Load voices
            const loadVoices = () => {
                synthRef.current.getVoices();
            };
            
            if (synthRef.current.onvoiceschanged !== undefined) {
                synthRef.current.onvoiceschanged = loadVoices;
            }
            loadVoices();
        }

        return () => {
            if (recognitionRef.current && isListening) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening, handleVoiceCommand]);

    const startListening = () => {
        if (recognitionRef.current && isSupported) {
            setIsListening(true);
            setTranscript('');
            recognitionRef.current.start();
            speak("Listening, sir.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    const testVoice = () => {
        speak("Voice interface operational. All systems are functioning within normal parameters.");
    };

    // Expose speak function to parent component
    useEffect(() => {
        onSpeakResponse?.(speak);
    }, [onSpeakResponse, speak]);

    if (!isSupported) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {(isListening || isSpeaking) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4"
                    >
                        <Card className="bg-black/90 border-cyan-500/50 backdrop-blur-sm p-4 min-w-[320px]">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    {isListening && (
                                        <div>
                                            <p className="text-cyan-400 text-sm font-medium">LISTENING...</p>
                                            <p className="text-gray-300 text-xs mt-1">
                                                {transcript || "Awaiting your command, sir..."}
                                            </p>
                                        </div>
                                    )}
                                    {isSpeaking && (
                                        <div>
                                            <p className="text-cyan-400 text-sm font-medium">RESPONDING...</p>
                                            <div className="flex gap-1 mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-1 bg-cyan-400 animate-pulse rounded-full"
                                                        style={{
                                                            height: `${Math.random() * 20 + 8}px`,
                                                            animationDelay: `${i * 0.15}s`
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-3">
                {/* Voice Recognition Button */}
                <Button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-16 h-16 rounded-full transition-all duration-300 ${
                        isListening 
                            ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/50 animate-pulse' 
                            : 'bg-gray-800 hover:bg-gray-700 border border-cyan-500/30'
                    }`}
                >
                    {isListening ? (
                        <MicOff className="w-6 h-6 text-white" />
                    ) : (
                        <Mic className="w-6 h-6 text-cyan-400" />
                    )}
                </Button>

                {/* Speech Test Button */}
                <Button
                    onClick={isSpeaking ? stopSpeaking : testVoice}
                    className={`w-16 h-16 rounded-full transition-all duration-300 ${
                        isSpeaking 
                            ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/50' 
                            : 'bg-gray-800 hover:bg-gray-700 border border-cyan-500/30'
                    }`}
                >
                    {isSpeaking ? (
                        <VolumeX className="w-6 h-6 text-white" />
                    ) : (
                        <Volume2 className="w-6 h-6 text-cyan-400" />
                    )}
                </Button>
            </div>

            {/* Arc Reactor Style Indicator */}
            <div className="absolute -inset-2 pointer-events-none">
                <div className={`w-20 h-20 rounded-full transition-all duration-500 ${
                    isListening || isSpeaking
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20' 
                        : ''
                }`} style={{ 
                    animation: isListening || isSpeaking ? 'spin 3s linear infinite' : 'none' 
                }}>
                    {(isListening || isSpeaking) && (
                        <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50 animate-ping"></div>
                    )}
                </div>
            </div>
        </div>
    );
}