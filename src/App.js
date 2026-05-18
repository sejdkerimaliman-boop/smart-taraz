```react
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Settings, 
  Home, 
  MessageSquare, 
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Info,
  PhoneCall,
  User,
  LogOut,
  Send,
  X,
  Loader2,
  Image as ImageIcon,
  Check,
  Plus
} from 'lucide-react';

const App = () => {
  // --- Инициализация және Сақтау ---
  const [activeTab, setActiveTab] = useState('home');
  const [showToast, setShowToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Локальді сақтау: Пайдаланушы мәліметтері (Тараз, Қазақстан дефолт бойынша)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('city_app_user_kz');
    return saved ? JSON.parse(saved) : { 
      name: 'Асхат', 
      city: 'Тараз', 
      avatar: null 
    };
  });

  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('city_app_reports_kz');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'Жолдар', title: 'Орталықтағы шұңқыр', status: 'Жұмыста', date: '12.05.2024', priority: 'Жоғары' },
      { id: 2, type: 'Жарық', title: 'Шам жанбайды', status: 'Орындалды', date: '10.05.2024', priority: 'Орташа' },
    ];
  });

  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('city_app_chat_kz');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Сәлеметсіз бе! Сізге қалай көмектесе аламын? Су, жарық немесе қоқыс шығару туралы сұрай аласыз.', sender: 'bot', time: '10:00' }
    ];
  });

  const [polls, setPolls] = useState([
    { id: 1, title: 'Жамбыл даңғылындағы жаңа саябақ', votes: 1240, voted: false },
    { id: 2, title: 'Жағалауды қайта құру', votes: 856, voted: true }
  ]);

  // Мәліметтерді синхрондау
  useEffect(() => localStorage.setItem('city_app_user_kz', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('city_app_reports_kz', JSON.stringify(reports)), [reports]);
  useEffect(() => localStorage.setItem('city_app_chat_kz', JSON.stringify(chatMessages)), [chatMessages]);

  // --- Чат Логикасы ---
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const getBotResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('су')) return "Су арнасының мәліметінше, сіздің ауданыңызда жоспарлы өшірулер жоқ. Егер су болмаса, біз техникалық қолдауға өтінім жібере аламыз.";
    if (lower.includes('жарық') || lower.includes('электр')) return "'ТаразЭнерго' қосалқы станциясында жөндеу жұмыстары жүріп жатыр. Қалпына келтіру бүгін сағат 18:00-ге жоспарланған.";
    if (lower.includes('қоқыс') || lower.includes('тазалық')) return "Қоқыс шығару кесте бойынша жүзеге асырылады: Дүйсенбі, Сәрсенбі, Жұма. Келесі келу уақыты — ертең таңертең.";
    return "Сіздің хабарламаңыз қабылданды. Оператор 15 минут ішінде хабарласады.";
  };

  const sendMessage = () => {
    if (!inputMsg.trim()) return;
    const now = new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), text: inputMsg, sender: 'user', time: now };
    
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = inputMsg;
    setInputMsg('');

    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        text: getBotResponse(currentInput), 
        sender: 'bot', 
        time: new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' }) 
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  // --- Өтінімдерді басқару ---
  const [isReporting, setIsReporting] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', category: 'ТҮКШ', description: '', photo: null });
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewReport(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUser(prev => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const report = {
        id: Date.now(),
        type: newReport.category,
        title: newReport.title,
        status: 'Жіберілді',
        date: new Date().toLocaleDateString('kk-KZ'),
        priority: 'Орташа',
        photo: newReport.photo
      };
      setReports([report, ...reports]);
      setIsSubmitting(false);
      setIsReporting(false);
      setNewReport({ title: '', category: 'ТҮКШ', description: '', photo: null });
      notify('Өтінім сәтті тіркелді!');
    }, 1200);
  };

  // --- Профильді басқару ---
  const [editMode, setEditMode] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const startEditing = (field) => {
    setEditMode(field);
    setTempValue(user[field]);
  };

  const saveProfile = () => {
    setUser(prev => ({ ...prev, [editMode]: tempValue }));
    setEditMode(null);
    notify('Профиль жаңартылды');
  };

  const notify = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Орындалды': return 'bg-emerald-100 text-emerald-700';
      case 'Жұмыста': return 'bg-indigo-100 text-indigo-700';
      case 'Жіберілді': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 max-w-md mx-auto shadow-2xl overflow-hidden border-x border-gray-200 relative">
      
      {/* Хабарлама */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-2xl text-sm font-medium shadow-2xl animate-in fade-in zoom-in slide-in-from-top-4 duration-300 text-center min-w-[200px]">
          {showToast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
             Smart Taraz
          </h1>
          <div className="flex items-center text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
            <MapPin size={10} className="mr-1 text-indigo-500" /> {user.city}, Қазақстан
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => notify("Жаңа хабарлама жоқ")} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Негізгі контент */}
      <main className="flex-1 overflow-y-auto p-4 pb-28">
        
        {/* БАСТЫ БЕТ */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
              <h2 className="text-lg font-bold opacity-90">Қайырлы күн, {user.name}!</h2>
              <p className="text-xs opacity-70 mt-1 leading-relaxed">Қалада бәрі тыныш. Жамбыл облысында ауа райы ашық болады деп күтілуде.</p>
              <button onClick={() => setIsReporting(true)} className="mt-4 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">
                Өтінім қалдыру
              </button>
            </div>

            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Сервистер</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveTab('emergency')} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95">
                  <div className="p-3 bg-red-50 rounded-2xl text-red-500"><PhoneCall size={24} /></div>
                  <span className="text-xs font-bold">Көмек</span>
                </button>
                <button onClick={() => setActiveTab('polls')} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Info size={24} /></div>
                  <span className="text-xs font-bold">Сауалнама</span>
                </button>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Менің белсенділігім</h2>
                <button className="text-xs text-indigo-600 font-bold" onClick={() => setActiveTab('reports')}>Барлығы</button>
              </div>
              <div className="space-y-3">
                {reports.slice(0, 2).map(report => (
                  <div key={report.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer active:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${getStatusColor(report.status)}`}>
                        {report.status === 'Орындалды' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{report.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{report.type} • {report.date}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ӨТІНІМДЕР ТАБЫ */}
        {activeTab === 'reports' && (
          <div className="space-y-4 animate-in slide-in-from-right duration-500">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black">Өтінімдер</h2>
               <button onClick={() => setIsReporting(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">
                 Қосу +
               </button>
             </div>
             <div className="space-y-4">
                {reports.length > 0 ? reports.map(report => (
                  <div key={report.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-3">
                       <span className={`text-[10px] uppercase font-black tracking-tighter px-3 py-1 rounded-full ${getStatusColor(report.status)}`}>
                         {report.status}
                       </span>
                       <span className="text-[10px] font-bold text-slate-300 italic">{report.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 leading-tight mb-1">{report.title}</h4>
                    <p className="text-xs font-medium text-slate-500">Сала: {report.type}</p>
                    {report.photo && (
                      <div className="mt-3 w-full h-32 overflow-hidden rounded-2xl">
                        <img src={report.photo} alt="Report" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="flex flex-col items-center py-20 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <AlertTriangle size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">Тізім бос</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* ЧАТ ТАБЫ */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-180px)] animate-in slide-in-from-right duration-500">
            <div className="flex-1 space-y-4 overflow-y-auto px-1 pt-2 pb-4 no-scrollbar">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                    {msg.text}
                    <div className={`text-[9px] font-bold mt-2 uppercase opacity-60 ${msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>{msg.time}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-xl items-center">
              <input 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Мәселені жазыңыз..."
                className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm font-medium"
              />
              <button 
                onClick={sendMessage} 
                disabled={!inputMsg.trim()}
                className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 active:scale-90 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* САУАЛНАМА ТАБЫ */}
        {activeTab === 'polls' && (
          <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setActiveTab('home')} className="p-2 bg-white rounded-xl shadow-sm"><ChevronRight className="rotate-180" size={20}/></button>
              <h2 className="text-xl font-bold">Сауалнамалар</h2>
            </div>
            {polls.map(poll => (
              <div key={poll.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 leading-snug">{poll.title}</h4>
                <button 
                  onClick={() => {
                    setPolls(polls.map(p => p.id === poll.id ? { ...p, voted: !p.voted, votes: p.voted ? p.votes - 1 : p.votes + 1 } : p));
                    notify(poll.voted ? 'Дауыс кері қайтарылды' : 'Дауысыңыз қабылданды!');
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md active:scale-95 ${poll.voted ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-900 text-white shadow-slate-200'}`}
                >
                  {poll.voted ? 'Таңдау жасалды ✓' : 'Қатысу'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ШҰҒЫЛ БАЙЛАНЫС ТАБЫ */}
        {activeTab === 'emergency' && (
           <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
             <div className="flex items-center gap-4 mb-6">
               <button onClick={() => setActiveTab('home')} className="p-2 bg-white rounded-xl shadow-sm"><ChevronRight className="rotate-180" size={20}/></button>
               <h2 className="text-xl font-bold text-red-600">Шұғыл байланыс</h2>
             </div>
             {[
               { name: 'Бірыңғай құтқару қызметі', tel: '112' },
               { name: 'Жедел жәрдем', tel: '103' },
               { name: 'Полиция', tel: '102' },
               { name: 'Газ қызметі', tel: '104' },
             ].map(s => (
               <a href={`tel:${s.tel}`} key={s.tel} className="flex justify-between items-center bg-white p-5 rounded-[2rem] border border-red-50 hover:border-red-100 transition-colors shadow-sm active:bg-red-50">
                 <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{s.name}</div>
                   <div className="text-slate-900 font-black text-2xl tracking-tighter">{s.tel}</div>
                 </div>
                 <div className="bg-red-500 p-4 rounded-3xl text-white shadow-lg shadow-red-100 active:scale-90 transition-transform">
                   <PhoneCall size={24} />
                 </div>
               </a>
             ))}
           </div>
        )}

        {/* ПРОФИЛЬ ТАБЫ */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <h2 className="text-2xl font-black mb-8">Баптаулар</h2>
            
            <div className="flex flex-col items-center pb-8 border-b border-slate-100">
              <div className="relative group">
                <div 
                  onClick={() => avatarInputRef.current.click()}
                  className="w-28 h-28 bg-gradient-to-tr from-indigo-100 to-blue-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-inner overflow-hidden cursor-pointer active:opacity-80"
                >
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <User size={56} />
                  )}
                </div>
                <input type="file" hidden ref={avatarInputRef} accept="image/*" onChange={handleAvatarUpload} />
                <button 
                  onClick={() => avatarInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-100 text-indigo-600 active:scale-90"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{user.city}, Қазақстан</p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="bg-white p-4 rounded-[2rem] border border-slate-100 space-y-2">
                 <div className="px-2 py-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Пайдаланушы аты</label>
                   {editMode === 'name' ? (
                     <div className="flex items-center gap-2 mt-1 animate-in fade-in duration-200">
                       <input 
                         autoFocus
                         className="flex-1 bg-slate-50 px-3 py-2 rounded-xl text-sm font-bold border border-indigo-200 focus:outline-none"
                         value
