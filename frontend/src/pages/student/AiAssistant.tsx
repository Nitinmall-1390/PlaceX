import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils';
import { Panel } from '../../components/ui/Panel';
import { aiApi } from '../../services/api';
import {
  Send,
  BrainCircuit,
  Sparkles,
  User,
  Bot,
  Terminal,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

function StudentAiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "SYSTEM INITIALIZED // PlaceX AI Career Advisor ready.\n\nI am configured to assist you with:\n• ATS Resume Optimization & Skill Gap Analysis\n• Job Match Evaluation & Technical Prep\n• Placement Strategy & Mock Technical Questions\n\nSubmit your query below or select a preset command.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Analyze my skills gap for Full Stack roles',
    'Prepare me for a React & Node.js technical round',
    'What ATS improvements should I make to my resume?',
    'How do I answer behavioral questions using STAR methodology?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    const tempAiId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: tempAiId, role: 'assistant', content: '', isTyping: true },
    ]);

    try {
      const chatHistory = newHistory.map((m) => ({ role: m.role, content: m.content }));
      const response = (await aiApi.chat(chatHistory)) as { reply?: string; message?: string };
      const replyContent = response.reply || response.message || 'AI Advisor processed your request successfully.';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiId
            ? { ...m, content: replyContent, isTyping: false }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiId
            ? {
                ...m,
                content:
                  'AI ADVISOR ADVICE:\n\n1. Focus on core Computer Science fundamentals (Data Structures, Algorithms, OS, DBMS).\n2. Highlight production projects with clear metrics (e.g. reduced load times by 40%).\n3. Tailor your resume key skills to match target job descriptions.',
                isTyping: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Panel
        id="PANEL 01"
        label="AI CAREER ADVISOR ENGINE"
        title="Interactive Career & ATS Assistant"
        subtitle="Powered by Gemini LLM placement intelligence"
        action={
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#34D399] bg-[#34D399]/10 px-2 py-1 border border-[#34D399]/30">
            <Sparkles className="h-3.5 w-3.5 text-[#F2A93B]" />
            <span>LLM ONLINE</span>
          </div>
        }
      >
        <div className="flex flex-col h-[calc(100vh-16rem)]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 bg-[#4C8DFF]/10 border border-[#4C8DFF]/30 text-[#4C8DFF] flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] p-3.5 border transition-all',
                    message.role === 'user'
                      ? 'bg-[#171B24] text-[#E7EAF0] border-[#4C8DFF]/40'
                      : 'bg-[#0A0C10] text-[#E7EAF0] border-[#262B38]'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5 text-[10px] text-[#565E70] uppercase">
                    <span>{message.role === 'user' ? '// CANDIDATE' : '// AI ADVISOR'}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  {message.isTyping && (
                    <div className="flex items-center gap-1.5 mt-2 text-[#4C8DFF]">
                      <span className="font-mono text-[10px] animate-pulse">PROCESSING AI MODEL...</span>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 bg-[#262B38] text-[#E7EAF0] flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Commands & Input */}
          <div className="border-t border-[#262B38] pt-4 mt-2 space-y-3">
            {messages.length <= 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-2.5 bg-[#0A0C10] hover:bg-[#171B24] border border-[#262B38] text-left font-mono text-xs text-[#8B93A7] hover:text-[#E7EAF0] transition-colors flex items-center justify-between"
                  >
                    <span>{prompt}</span>
                    <Terminal className="h-3 w-3 text-[#4C8DFF]" />
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question or career query..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  'px-4 py-2.5 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors flex items-center gap-1.5',
                  (!inputValue.trim() || isLoading) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span>SEND</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default StudentAiAssistant;
