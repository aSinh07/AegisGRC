import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Shield, 
  Layers, 
  Code2, 
  RefreshCw, 
  HelpCircle,
  Terminal,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isVoice?: boolean;
}

export const FloatingCyberBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Greetings! I am the AegisGRC Cyber Advisory Assistant. Ask me anything about our unified control plane, ISO 27001/42001 & DPDP compliance, SQL Injection (CWE-89), XSS, or tool integrations (Wapiti, Burp, Nmap, Wireshark). You can also click the microphone to talk with me via Live Voice!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickChips = [
    'What does AegisGRC do?',
    'How is SQL Injection (CWE-89) fixed?',
    'What is the DPDP Act 2023 requirement?',
    'Explain ISO 27001 vs ISO 42001',
    'How does Wapiti & Burp integration work?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Speech synthesis for voice output
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/popup-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });
      const data = await response.json();
      const botReply = data.answer || 'I am ready to assist with your GRC compliance and vulnerability management needs.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(botReply);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'bot',
        text: 'AegisGRC unifies infrastructure scans, vulnerability correlation, and automated regulatory mapping (ISO 27001, ISO 42001, DPDP Act 2023) with isolated AI remediation guidance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle voice conversation mode
  const toggleVoiceMode = async () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsVoiceActive(true);
    // Simulate initial voice greeting
    const voiceGreeting = 'Voice channel activated with gemini-3.8-live. Speak your security question or click any framework topic.';
    speakText(voiceGreeting);

    const voiceMsg: ChatMessage = {
      id: `voice-${Date.now()}`,
      sender: 'bot',
      text: '🎙️ Live Voice Channel Connected (gemini-3.8-live model). I am listening and will speak responses out loud.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true,
    };
    setMessages((prev) => [...prev, voiceMsg]);
  };

  return (
    <div className="no-print fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Pop-Up Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] rounded-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">Aegis Cyber Guide</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono text-cyan-400">Live AI &amp; Voice Assistant</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
              </button>

              <button
                onClick={toggleVoiceMode}
                title={isVoiceActive ? 'Disable Live Voice' : 'Enable Live Voice (Gemini Live)'}
                className={`p-1.5 rounded-lg transition-colors ${
                  isVoiceActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                }`}
              >
                {isVoiceActive ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Query Chips */}
          <div className="p-2 border-b border-slate-900 bg-slate-900/60 overflow-x-auto scrollbar-none flex gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 hover:border-cyan-500 hover:text-cyan-300 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs p-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span className="font-mono text-[11px]">Analyzing GRC knowledge base...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about ISO 27001, SQLi, XSS, DPDP..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 font-mono"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all duration-300"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
        </span>
        <Bot className="h-5 w-5" />
        <span className="hidden sm:inline">GRC Assistant &amp; Voice</span>
      </button>
    </div>
  );
};
