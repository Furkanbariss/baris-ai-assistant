"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2, Sparkles, ArrowRight, Menu, X, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";

// GitHub SVG İkonu
const GithubIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.8 0-1.4-.5-2.8-1.5-3.8.1-.3.2-1.8-.1-3.7-1-.3-3.9 1.6-3.9 1.6A13.9 13.9 0 0 0 12 4c-1.3 0-2.6.2-3.9.5 0 0-2.9-1.9-3.9-1.6-.3 1.9-.2 3.4-.1 3.7A5.5 5.5 0 0 0 2.5 12c0 5.3 3 6.5 6 6.8-.9.2-1.7.9-1.9 2.1-.5.3-1.8.8-3.3-.1-1.3-1-1.3-2.6-1.3-2.6" />
  </svg>
);

// LinkedIn SVG İkonu
const LinkedinIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface Message {
  role: "user" | "bot";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "Öne çıkan projeleri ve başarıları nelerdir?",
  "Furkan hakkında detaylı bilgi verebilir misin?"
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Merhaba! Ben ***Furkan Barış*** tarafından geliştirilmiş bir yapay zeka kariyer asistanıyım. Eğitimim, projelerim veya yeteneklerim hakkında bana dilediğiniz soruyu sorabilirsiniz." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get("ref");
    
    // GÜNCELLENDİ: Artık ref yoksa bile bir ID oluşturuyoruz
    const uniqueId = Math.random().toString(36).substring(2, 8);
    if (ref) {
      setRefCode(ref);
      setSessionId(`${ref}_${uniqueId}`);
    } else {
      setRefCode("organik");
      setSessionId(`web_${uniqueId}`); // Direkt gelenler "web_..." olarak kaydedilecek
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, isLoading]); 

  const submitMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          ref_code: refCode || "bos",
          session_id: sessionId || "anonim"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [...prev, { role: "bot", text: `⚠️ Hata: ${data.detail || "Bir şeyler ters gitti."}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Sunucuya ulaşılamıyor. Lütfen backend'in çalıştığından emin olun." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(input);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#09090b] text-zinc-200 font-sans selection:bg-violet-500/30 relative overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      <div className={`absolute top-0 left-0 h-full w-72 sm:w-80 bg-zinc-900/95 backdrop-blur-2xl border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <h2 className="text-lg font-semibold text-zinc-100">İletişim Bilgileri</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-10 text-center space-y-3 shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-1 shadow-lg shadow-violet-900/20">
              <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-900">
                <User size={40} className="text-zinc-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-100">Furkan Barış Sönmezışık</h3>
              <p className="text-sm text-violet-400 font-medium mt-1">Bilgisayar Mühendisi</p>
            </div>
          </div>

          <div className="space-y-3 w-full shrink-0">
            <a href="mailto:sonmezisikfurkanbaris@gmail.com" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group overflow-hidden">
              <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-violet-600/20 transition-colors shrink-0">
                <Mail size={20} className="text-zinc-400 group-hover:text-violet-400" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs text-zinc-500 font-medium">E-Posta</span>
                <span className="text-sm text-zinc-200 truncate">sonmezisikfurkanbaris@gmail.com</span>
              </div>
            </a>

            <a href="https://linkedin.com/in/furkanbariss" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group overflow-hidden">
              <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-[#0A66C2]/20 transition-colors shrink-0">
                <LinkedinIcon size={20} className="text-zinc-400 group-hover:text-[#0A66C2]" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs text-zinc-500 font-medium">LinkedIn</span>
                <span className="text-sm text-zinc-200 truncate">/in/furkanbariss</span>
              </div>
            </a>

            <a href="https://github.com/FurkanBaris" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group overflow-hidden">
              <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-zinc-600 transition-colors shrink-0">
                <GithubIcon size={20} className="text-zinc-400 group-hover:text-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs text-zinc-500 font-medium">GitHub</span>
                <span className="text-sm text-zinc-200 truncate">github.com/FurkanBaris</span>
              </div>
            </a>
          </div>

          {/* YENİ: Yapay Zeka Yönlendirme Notu */}
          <div className="mt-6 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3.5 flex items-start gap-3 shrink-0">
            <Bot size={18} className="text-violet-400 shrink-0 mt-0.5" />
            <p className="text-[12px] leading-relaxed text-zinc-400">
              Daha detaylı iletişim bilgileri, referanslar veya <strong className="text-zinc-300 font-semibold">CV dosyası</strong> talepleriniz için doğrudan yapay zeka asistanıyla sohbete geçebilirsiniz.
            </p>
          </div>
          
        </div>
        
        <div className="p-6 border-t border-white/10 text-center shrink-0">
          <p className="text-[11px] text-zinc-500">Mülakatlar için tasarlanmış yapay zeka asistanı. <br/> © 2026 Furkan Barış Sönmezışık</p>
        </div>
      </div>

      <header className="absolute top-4 left-0 w-full z-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-2xl px-3 md:px-5 py-3 flex justify-between items-center shadow-lg shadow-black/20">
          
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-300"
            >
              <Menu size={20} />
            </button>
            
            <div className="w-px h-6 bg-white/10 hidden md:block"></div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center shadow-inner border border-white/10">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-[14px] md:text-base font-semibold text-zinc-100 tracking-wide">Barış AI</h1>
                <p className="text-[9px] md:text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Portfolyo Asistanı</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-full border border-white/5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
            <span className="text-[10px] md:text-[11px] font-medium text-zinc-300 hidden md:inline">Sistem Aktif</span>
            <span className="text-[10px] font-medium text-zinc-300 md:hidden">Aktif</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pt-28 px-4 md:px-8 custom-scrollbar z-10">
        <div className="max-w-3xl mx-auto space-y-8 md:space-y-10 flex flex-col min-h-full">
          
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 md:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-1 shadow-sm backdrop-blur-sm">
                  <Bot size={15} className="text-zinc-400" />
                </div>
              )}
              
              <div className={`p-4 md:p-5 text-[14px] md:text-[15px] leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-[24px] rounded-tr-[8px] max-w-[88%] md:max-w-[80%] shadow-violet-900/20" 
                  : "bg-zinc-900/80 backdrop-blur-md border border-white/5 text-zinc-300 rounded-[24px] rounded-tl-[8px] max-w-[92%] md:max-w-[85%]"
              }`}>
                {msg.role === "bot" ? (
                  <ReactMarkdown 
                    components={{
                      a: ({node, ...props}) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" 
                           className="text-violet-400 hover:text-violet-300 underline decoration-violet-400/30 hover:decoration-violet-300 underline-offset-4 transition-all font-medium" />
                      ),
                      strong: ({node, ...props}) => <strong {...props} className="font-semibold text-zinc-100" />,
                      p: ({node, ...props}) => <p {...props} className="mb-4 last:mb-0" />,
                      ul: ({node, ...props}) => <ul {...props} className="list-disc pl-5 mb-4 space-y-2" />,
                      li: ({node, ...props}) => <li {...props} className="pl-1" />,
                      img: ({node, ...props}) => (
                        <img {...props} className="w-full max-w-md rounded-2xl mt-5 border border-white/10 shadow-lg object-cover" loading="lazy" />
                      )
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                  <User size={15} className="text-violet-400" />
                </div>
              )}
            </div>
          ))}

          {messages.length === 1 && (
            <div className="pl-11 md:pl-12 pt-2 flex flex-col gap-3">
              <p className="text-[12px] text-zinc-500 font-medium tracking-wide">Önerilen Sorular</p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {SUGGESTED_QUESTIONS.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => submitMessage(question)}
                    disabled={isLoading || !refCode}
                    className="group flex items-center gap-2 text-[13px] md:text-sm text-left bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 border border-white/5 hover:border-violet-500/40 py-2.5 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{question}</span>
                    <ArrowRight size={14} className="text-zinc-600 group-hover:text-violet-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3 md:gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-1 backdrop-blur-sm">
                <Bot size={15} className="text-zinc-400" />
              </div>
              <div className="px-5 py-4 bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-[24px] rounded-tl-[8px] flex items-center gap-1.5 w-fit">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}

          <div className="h-32 md:h-40 shrink-0 pointer-events-none"></div>
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="absolute bottom-6 md:bottom-8 left-0 w-full px-4 md:px-8 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form onSubmit={handleFormSubmit} className="relative flex items-center bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-1.5 shadow-2xl shadow-black/50 transition-all focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Yeteneklerim hakkında bir soru sorun..."
              disabled={isLoading} // refCode şartı kalktı!
              className="w-full bg-transparent text-zinc-200 text-[14px] md:text-[15px] py-3.5 pl-5 pr-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()} // refCode şartı kalktı!
              className="bg-zinc-100 hover:bg-white text-zinc-900 p-3 rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 mr-0.5"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
            </button>
          </form>
          <div className="text-center mt-3 flex justify-center">
            <span className="text-[10px] md:text-[11px] text-zinc-500 font-medium tracking-wide bg-zinc-900/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
              Yapay zeka hata yapabilir. Lütfen kritik bilgileri özgeçmişten teyit edin.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}