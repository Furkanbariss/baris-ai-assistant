<<<<<<< HEAD
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Merhaba! Ben Furkan Barış'ın yapay zeka kariyer asistanıyım. Eğitimim, projelerim veya yeteneklerim hakkında bana dilediğiniz soruyu sorabilirsiniz." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refCode, setRefCode] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get("ref");
    if (ref) {
      setRefCode(ref);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]); 

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userText,
          ref_code: refCode || "bos",
          session_id: "web_session_1"
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

  return (
    /* Arka planı OLED siyahına (#050505) çektik */
    <div className="flex flex-col h-[100dvh] bg-[#050505] text-gray-200 font-sans selection:bg-indigo-500/30">
      
      {/* Üst Bilgi Çubuğu */}
      <header className="fixed top-0 w-full z-10 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/10">
            <Sparkles size={18} className="text-white md:w-5 md:h-5" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-semibold text-gray-100 tracking-wide">Barış AI</h1>
            <p className="text-[10px] md:text-xs text-indigo-400/80 font-medium tracking-wider uppercase">Kariyer Asistanı</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 bg-white/5 rounded-full border border-white/5">
          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="text-[10px] md:text-xs font-medium text-emerald-400/90 tracking-wide">Aktif</span>
        </div>
      </header>

      {/* Sohbet Alanı */}
      <main className="flex-1 overflow-y-auto pt-24 md:pt-28 pb-28 md:pb-32 px-3 md:px-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-2.5 md:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center shrink-0 shadow-md mt-1">
                  <Bot size={14} className="text-gray-300 md:w-4 md:h-4" />
                </div>
              )}
              
              {/* Bot balonunu çok koyu karbon gri (#111111) yaptık */}
              <div className={`p-3 md:p-4 text-[13px] md:text-base shadow-lg leading-relaxed ${
                msg.role === "user" 
                  ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl rounded-tr-sm max-w-[92%] md:max-w-[85%] shadow-blue-900/10 whitespace-pre-wrap" 
                  : "bg-[#111111] border border-white/5 text-gray-300 rounded-2xl rounded-tl-sm max-w-[92%] md:max-w-[90%]"
              }`}>
                {msg.role === "bot" ? (
                  <ReactMarkdown 
                    components={{
                      a: ({node, ...props}) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" 
                           className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/30 hover:decoration-indigo-300 underline-offset-4 transition-all font-medium break-all md:break-normal" />
                      ),
                      strong: ({node, ...props}) => <strong {...props} className="font-semibold text-gray-100" />,
                      p: ({node, ...props}) => <p {...props} className="mb-3 md:mb-4 last:mb-0" />,
                      ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 md:pl-5 mb-3 md:mb-4 space-y-1" />,
                      li: ({node, ...props}) => <li {...props} className="pl-1" />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                  <User size={14} className="text-indigo-400 md:w-4 md:h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Bot Yazıyor Göstergesi */}
          {isLoading && (
            <div className="flex gap-2.5 md:gap-4 justify-start">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center shrink-0 shadow-md mt-1">
                <Bot size={14} className="text-gray-300 md:w-4 md:h-4" />
              </div>
              <div className="px-4 py-3 md:px-5 md:py-4 bg-[#111111] border border-white/5 text-gray-300 rounded-2xl rounded-tl-sm flex items-center gap-1.5 w-fit shadow-lg">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Mesaj Gönderme Çubuğu */}
      <footer className="fixed bottom-0 w-full bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-10 md:pt-12 pb-4 md:pb-6 px-3 md:px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={sendMessage} className="relative flex items-center group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={refCode ? "Bir şeyler sorun..." : "Geçerli bir URL gerekli."}
              disabled={isLoading || !refCode}
              /* Input kutusu da #111111 oldu */
              className="w-full bg-[#111111] text-gray-200 text-sm md:text-base border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-4 pr-12 md:pr-14 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={isLoading || !refCode || !input.trim()}
              className="absolute right-1.5 md:right-2 bg-indigo-700 hover:bg-indigo-600 text-white p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-indigo-900/20"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin md:w-[18px] md:h-[18px]" /> : <Send size={16} className="md:w-[18px] md:h-[18px]" />}
            </button>
          </form>
          <p className="text-center text-[9px] md:text-[10px] text-gray-600 mt-2.5 md:mt-3 font-medium tracking-wide">
            Yapay zeka asistanı hata yapabilir. Lütfen önemli bilgileri özgeçmiş üzerinden teyit edin.
          </p>
        </div>
      </footer>
    </div>
  );
}
