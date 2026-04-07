"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, MessageSquare, LayoutDashboard, Search, Eye, X, Loader2, Bot, User as UserIcon, LogOut } from "lucide-react";

const REF_CODES = {
  "devfur": "DevFurkan",
  "aa": "Anadolu Ajansı",
  "erkn": "ErkanMP",
  "linkedin": "Linkedin",
  "eyl": "Eylül",
  "zmr": "Zümer",
  "abm": "Abim",
  "co1": "Şirket 1",
  "co2": "Şirket 2",
  "co3": "Şirket 3",
  "ftf": "Face to Face",
  "neco": "Necati",
  "cv": "CV",
  "mail": "E-posta",
  "organik": "Organik"
};

interface Session {
  session_id: string;
  ref_code: string;
  message_count: number;
  last_query: string;
  timestamp: string;
}

interface ChatMessage {
  user_message: string;
  bot_response: string;
  timestamp: string;
}

interface DetailModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [detailMessages, setDetailMessages] = useState<ChatMessage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Authentication check
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      fetchSessions(token);
    }
  }, []);

  useEffect(() => {
    if (selectedSession && isAuthenticated) {
      const token = localStorage.getItem("admin_token");
      if (token) {
        fetchSessionDetails(selectedSession.session_id, token);
      }
    }
  }, [selectedSession, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const fetchSessions = async (token: string) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/sessions`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        handleLogout();
        return;
      }

      const data = await response.json();
      setSessions(data.sessions || []);
      
      // İstatistikleri hesapla
      setTotalSessions(data.sessions?.length || 0);
      const totalQuestions = data.sessions?.reduce((sum: number, s: Session) => sum + s.message_count, 0) || 0;
      setTotalQuestions(totalQuestions);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: string, token: string) => {
    try {
      setDetailLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        handleLogout();
        return;
      }

      const data = await response.json();
      setDetailMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to fetch session details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Bugün, ${date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Dün, ${date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("tr-TR");
    }
  };

  const filteredSessions = sessions.filter(session =>
    REF_CODES[session.ref_code as keyof typeof REF_CODES]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {!isAuthenticated ? (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <Loader2 className="animate-spin text-violet-400" size={48} />
        </div>
      ) : (
        <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-violet-500/30 flex">
      
      {/* Sol Menü (Sidebar) */}
      <aside className="w-64 bg-zinc-900/50 border-r border-white/5 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 transition-colors">
            <MessageSquare size={18} />
            <span className="font-medium text-sm">Sohbet Kayıtları</span>
          </a>
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors">
            <LayoutDashboard size={18} />
            <span className="font-medium text-sm">Siteye Git</span>
          </a>
        </nav>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Üst Bar */}
        <header className="h-16 bg-zinc-900/30 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-zinc-100 font-medium tracking-wide">Sohbet Analitiği</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center border-2 border-zinc-900 shadow-md">
              <span className="text-xs font-bold text-white">FB</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
              title="Çıkış Yap"
            >
              <LogOut size={18} />
              <span className="text-sm">Çıkış</span>
            </button>
          </div>
        </header>

        {/* İstatistik Kartları */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-violet-500/10 rounded-xl">
                <Users size={24} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Toplam Oturum</p>
                <p className="text-2xl font-bold text-zinc-100">{totalSessions}</p>
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <MessageSquare size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Toplam Soru</p>
                <p className="text-2xl font-bold text-zinc-100">{totalQuestions}</p>
              </div>
            </div>
          </div>

          {/* Tablo Arama ve Filtreleme */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/80">
              <h3 className="font-semibold text-zinc-100">Son Görüşmeler</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Referans ara..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-950 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            {/* Tablo */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950/50 text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Referans / Firma</th>
                    <th className="px-6 py-4 font-medium">Oturum ID</th>
                    <th className="px-6 py-4 font-medium">Tarih</th>
                    <th className="px-6 py-4 font-medium">Soru Sayısı</th>
                    <th className="px-6 py-4 font-medium">Son Sorduğu</th>
                    <th className="px-6 py-4 font-medium text-right">Detay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                        Veriler yükleniyor...
                      </td>
                    </tr>
                  ) : filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                        Sohbet kaydı bulunamadı
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => (
                      <tr key={session.session_id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide ${
                            session.ref_code === 'organik' ? 'bg-zinc-800 text-zinc-300' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                          }`}>
                            {(REF_CODES[session.ref_code as keyof typeof REF_CODES] || session.ref_code).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{session.session_id}</td>
                        <td className="px-6 py-4 text-zinc-400">{formatDate(session.timestamp)}</td>
                        <td className="px-6 py-4 text-zinc-300">{session.message_count} Mesaj</td>
                        <td className="px-6 py-4 text-zinc-400 truncate max-w-[200px]">{session.last_query}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedSession(session)}
                            className="p-2 bg-zinc-800 hover:bg-violet-600 text-zinc-300 hover:text-white rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Detay Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">Sohbet Detayları</h3>
                <p className="text-xs text-zinc-500 mt-1 font-mono">{selectedSession.session_id}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedSession(null);
                  setDetailMessages([]);
                }}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 border border-white/5 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Referans Kodu</p>
                  <p className="text-sm font-medium text-zinc-100">
                    {REF_CODES[selectedSession.ref_code as keyof typeof REF_CODES] || selectedSession.ref_code}
                  </p>
                </div>
                <div className="bg-zinc-800/50 border border-white/5 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Toplam Soru</p>
                  <p className="text-sm font-medium text-zinc-100">{selectedSession.message_count}</p>
                </div>
              </div>

              {/* Messages */}
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="text-violet-400 animate-spin" />
                </div>
              ) : detailMessages.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  Mesaj bulunamadı
                </div>
              ) : (
                <div className="space-y-4">
                  {detailMessages.map((msg, idx) => (
                    <div key={idx} className="space-y-3">
                      {/* User Message */}
                      <div className="flex gap-3 justify-end">
                        <div className="flex-1 max-w-xs">
                          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
                            <p className="text-sm text-zinc-100">{msg.user_message}</p>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString("tr-TR")}
                          </p>
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <UserIcon size={16} className="text-violet-400" />
                        </div>
                      </div>

                      {/* Bot Response */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Bot size={16} className="text-blue-400" />
                        </div>
                        <div className="flex-1 max-w-xs">
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-sm text-zinc-100">{msg.bot_response}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    )}
    </>
  );
}