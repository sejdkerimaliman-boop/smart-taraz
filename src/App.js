import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  MapPin, 
  AlertTriangle, 
  ChevronRight,
  Info,
  PhoneCall,
  User,
  Send,
  Plus,
  CheckCircle2,
  Clock
} from 'lucide-react';

const App = () => {
  // --- Инициализация және Сақтау ---
  const [activeTab, setActiveTab] = useState('home');
  const [showToast, setShowToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!newReport.title.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const report = {
        id: Date.now(),
        type: newReport.category,
        title: newReport.title,
        status: 'Жіберілді',
        date: new Date().toLocaleDateString('kk-KZ'),
        priority: 'Орташа',
        photo: null
      };
      setReports([report, ...reports]);
      setIsSubmitting(false);
      setIsReporting(false);
      setNewReport({ title: '', category: 'ТҮКШ', description: '', photo: null });
      notify('Өтінім сәтті тіркелді!');
    }, 1200);
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
      
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-2xl text-sm font-medium shadow-2xl text-center min-w-[200px]">
          {showToast}
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
             Smart Taraz
          </h1>
          <div className="flex items-center text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
            <MapPin size={10} className="mr-1 text-indigo-500" /> {user.city}, Қазақстан
          </div>
        </div>
        <button onClick={() => notify("Жаңа хабарлама жоқ")} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600">
          <Bell size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
              <h2 className="text-lg font-bold opacity-90">Қайырлы күн, {user.name}!</h2>
              <p className="text-xs opacity-70 mt-1 leading-relaxed">Қалада бәрі тыныш. Жамбыл облысында ауа райы ашық болады деп күтілуде.</p>
              <button onClick={() => setActiveTab('reports')} className="mt-4 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md">
                Өтінім қалдыру
              </button>
            </div>

            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Сервистер</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveTab('emergency')} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 shadow-sm">
                  <div className="p-3 bg-red-50 rounded-2xl text-red-500"><PhoneCall size={24} /></div>
                  <span className="text-xs font-bold">Шұғыл көмек</span>
                </button>
                <button onClick={() => setActiveTab('polls')} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 shadow-sm">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Info size={24} /></div>
                  <span className="text-xs font-bold">Сауалнама</span>
                </button>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Соңғы өтінімдер</h2>
                <button className="text-xs text-indigo-600 font-bold" onClick={() => setActiveTab('reports')}>Барлығы</button>
              </div>
              <div className="space-y-3">
                {reports.slice(0, 2).map(report => (
                  <div key={report.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${getStatusColor(report.status)}`}>
                        {report.status === 'Орындалды' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{report.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{report.type} • {report.date}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black">Өтінімдер</h2>
               <button onClick={() => setIsReporting(!isReporting)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                 {isReporting ? 'Жабу' : 'Қосу +'}
               </button>
             </div>

             {isReporting && (
               <form onSubmit={handleSubmitReport} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-md space-y-3 mb-4">
                 <input 
                   type="text" 
                   placeholder="Мәселенің қысқаша атауы" 
                   value={newReport.title}
                   onChange={e => setNewReport({...newReport, title: e.target.value})}
                   className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-indigo-500"
                 />
                 <select 
                   value={newReport.category}
                   onChange={e => setNewReport({...newReport, category: e.target.value})}
                   className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm border focus:outline-none"
                 >
                   <option value="ТҮКШ">ТҮКШ (ЖКХ)</option>
                   <option value="Жолдар">Жолдар</option>
                   <option value="Жарық">Жарықтандыру</option>
                   <option value="Тазалық">Қоқыс және Тазалық</option>
                 </select>
                 <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold shadow-md">
                   {isSubmitting ? 'Жіберілуде...' : 'Өтінімді жолдау'}
                 </button>
               </form>
             )}

             <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                       <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${getStatusColor(report.status)}`}>
                         {report.status}
                       </span>
                       <span className="text-[10px] font-bold text-slate-300">{report.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 leading-tight mb-1">{report.title}</h4>
                    <p className="text-xs font-medium text-slate-500">Сала: {report.type}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-220px)]">
            <div className="flex-1 space-y-4 overflow-y-auto px-1 pb-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                    {msg.text}
                    <div className="text-[9px] font-bold mt-2 opacity-60 text-right">{msg.time}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl items-center mt-2">
              <input 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Мәселені жазыңыз..."
                className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm"
              />
              <button onClick={sendMessage} disabled={!inputMsg.trim()} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'polls' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Сауалнамалар</h2>
            {polls.map(poll => (
              <div key={poll.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <h4 className="font-bold text-base text-slate-800">{poll.title}</h4>
                <button 
                  onClick={() => {
                    setPolls(polls.map(p => p.id === poll.id ? { ...p, voted: !p.voted, votes: p.voted ? p.votes - 1 : p.votes + 1 } : p));
                    notify(poll.voted ? 'Дауыс кері қайтарылды' : 'Дауысыңыз қабылданды!');
                  }}
                  className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${poll.voted ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}
                >
                  {poll.voted ? 'Таңдау жасалды ✓' : 'Қатысу'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'emergency' && (
           <div className="space-y-4">
             <h2 className="text-xl font-bold text-red-600 mb-4">Шұғыл байланыс</h2>
             {[
               { name: 'Бірыңғай құтқару қызметі', tel: '112' },
               { name: 'Жедел жәрдем', tel: '103' },
               { name: 'Полиция', tel: '102' },
               { name: 'Газ қызметі', tel: '104' },
             ].map(s => (
               <a href={`tel:${s.tel}`} key={s.tel} className="flex justify-between items-center bg-white p-5 rounded-[2rem] border border-red-50 shadow-sm">
                 <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{s.name}</div>
                   <div className="text-slate-900 font-black text-2xl tracking-tighter">{s.tel}</div>
                 </div>
                 <div className="bg-red-500 p-4 rounded-3xl text-white">
                   <PhoneCall size={20} />
                 </div>
               </a>
             ))}
           </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black text-left mb-4">Профиль</h2>
            <div className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto shadow-inner">
              <User size={48} />
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{user.city}, Қазақстан</p>
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-2 flex justify-between items-center z-40 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Plus size={20} className={activeTab === 'home' ? 'rotate-45 transition-transform' : ''} />
          <span className="text-[10px] font-bold mt-1">Басты</span>
        </button>
        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center p-2 ${activeTab === 'reports' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <AlertTriangle size={20} />
          <span className="text-[10px] font-bold mt-1">Өтінімдер</span>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center p-2 ${activeTab === 'chat' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Send size={20} />
          <span className="text-[10px] font-bold mt-1">Чат</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <User size={20} />
          <span className="text-[10px] font-bold mt-1">Профиль</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
  
