import React, { useState, useEffect, useRef } from 'react';
import { Bell, MapPin, AlertTriangle, ChevronRight, Info, PhoneCall, User, Send, Plus, CheckCircle2, Clock, Camera, X, Check } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showToast, setShowToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tempValue, setTempValue] = useState('');
  const [newReport, setNewReport] = useState({ title: '', category: 'ТҮКШ', photo: null });

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('city_user')) || { name: 'Асхат', city: 'Тараз', avatar: null });
  const [reports, setReports] = useState(() => JSON.parse(localStorage.getItem('city_reports')) || [
    { id: 1, type: 'Жолдар', title: 'Орталықтағы шұңқыр', status: 'Жұмыста', date: '12.05.2024', photo: null },
    { id: 2, type: 'Жарық', title: 'Шам жанбайды', status: 'Орындалды', date: '10.05.2024', photo: null }
  ]);
  const [chatMessages, setChatMessages] = useState(() => JSON.parse(localStorage.getItem('city_chat')) || [
    { id: 1, text: 'Сәлеметсіз бе! Сізге қалай көмектесе аламын?', sender: 'bot', time: '10:00' }
  ]);
  const [polls, setPolls] = useState([
    { id: 1, title: 'Жамбыл даңғылындағы жаңа саябақ', votes: 1240, voted: false },
    { id: 2, title: 'Жағалауды қайта құру', votes: 856, voted: true }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  useEffect(() => localStorage.setItem('city_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('city_reports', JSON.stringify(reports)), [reports]);
  useEffect(() => localStorage.setItem('city_chat', JSON.stringify(chatMessages)), [chatMessages]);

  const notify = (msg) => { setShowToast(msg); setTimeout(() => setShowToast(null), 3000); };

  const sendMessage = () => {
    if (!inputMsg.trim()) return;
    const now = new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), text: inputMsg, sender: 'user', time: now };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = inputMsg;
    setInputMsg('');

    setTimeout(() => {
      let reply = "Хабарламаңыз қабылданды. Оператор жақын арада жауап береді.";
      const txt = currentInput.toLowerCase();
      if (txt.includes('су')) reply = "Сіздің ауданыңызда суды өшіру жоспарланбаған. Мәселе тексерілуде.";
      if (txt.includes('жарық') || txt.includes('электр')) reply = "'ТаразЭнерго' жөндеу жұмыстарын жүргізіп жатыр, сағат 18:00-де қосылады.";
      if (txt.includes('қоқыс')) reply = "Қоқыс шығару кестесі: Дүйсенбі, Сәрсенбі, Жұма.";
      
      setChatMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'bot', time: now }]);
    }, 1000);
  };

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') setUser(prev => ({ ...prev, avatar: reader.result }));
        else setNewReport(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!newReport.title.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setReports([{ id: Date.now(), type: newReport.category, title: newReport.title, status: 'Жіберілді', date: new Date().toLocaleDateString('kk-KZ'), photo: newReport.photo }, ...reports]);
      setIsSubmitting(false);
      setIsReporting(false);
      setNewReport({ title: '', category: 'ТҮКШ', photo: null });
      notify('Өтінім сәтті тіркелді!');
    }, 1000);
  };

  const getStatusColor = (s) => {
    if (s === 'Орындалды') return 'bg-emerald-100 text-emerald-700';
    if (s === 'Жұмыста') return 'bg-indigo-100 text-indigo-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 max-w-md mx-auto shadow-2xl overflow-hidden border-x border-gray-200 relative">
      {showToast && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 text-white px-6 py-3 rounded-2xl text-sm font-medium shadow-2xl">{showToast}</div>}

      <header className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">Smart Taraz</h1>
          <div className="flex items-center text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5"><MapPin size={10} className="mr-1 text-indigo-500" /> {user.city}, Қазақстан</div>
        </div>
        <button onClick={() => notify("Жаңа хабарлама жоқ")} className="p-2.5 bg-slate-50 rounded-xl text-slate-600"><Bell size={20} /></button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
              <h2 className="text-lg font-bold">Қайырлы күн, {user.name}!</h2>
              <p className="text-xs opacity-70 mt-1">Қалада бәрі тыныш. Жамбыл облысында ауа райы ашық болады.</p>
              <button onClick={() => { setActiveTab('reports'); setIsReporting(true); }} className="mt-4 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md">Өтінім қалдыру</button>
            </div>
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Сервистер</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveTab('emergency')} className="bg-white p-5 rounded-3xl border flex flex-col items-center gap-3 shadow-sm"><div className="p-3 bg-red-50 rounded-2xl text-red-500"><PhoneCall size={24} /></div><span className="text-xs font-bold">Шұғыл көмек</span></button>
                <button onClick={() => setActiveTab('polls')} className="bg-white p-5 rounded-3xl border flex flex-col items-center gap-3 shadow-sm"><div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Info size={24} /></div><span className="text-xs font-bold">Сауалнама</span></button>
              </div>
            </section>
            <section>
              <div className="flex justify-between items-center mb-4 px-1"><h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Соңғы өтінімдер</h2><button className="text-xs text-indigo-600 font-bold" onClick={() => setActiveTab('reports')}>Барлығы</button></div>
              <div className="space-y-3">
                {reports.slice(0, 2).map(r => (
                  <div key={r.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${getStatusColor(r.status)}`}>{r.status === 'Орындалды' ? <CheckCircle2 size={20} /> : <Clock size={20} />}</div>
                      <div><h4 className="font-bold text-sm">{r.title}</h4><p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{r.type} • {r.date}</p></div>
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
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black">Өтінімдер</h2><button onClick={() => setIsReporting(!isReporting)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">{isReporting ? 'Жабу' : 'Қосу +'}</button></div>
            {isReporting && (
              <form onSubmit={handleSubmitReport} className="bg-white p-5 rounded-[2rem] border shadow-md space-y-3 mb-4">
                <input type="text" placeholder="Мәселенің қысқаша атауы" value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm border focus:outline-none" />
                <select value={newReport.category} onChange={e => setNewReport({...newReport, category: e.target.value})} className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm border focus:outline-none">
                  <option value="ТҮКШ">ТҮКШ (ЖКХ)</option><option value="Жолдар">Жолдар</option><option value="Жарық">Жарықтандыру</option><option value="Тазалық">Қоқыс және Тазалық</option>
                </select>
                <div className="flex items-center gap-3 py-1">
                  <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold"><Camera size={16} /> Сурет қосу</button>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleFile(e, 'report')} />
                  {newReport.photo && <div className="relative w-12 h-12 rounded-lg overflow-hidden border"><img src={newReport.photo} className="w-full h-full object-cover" alt="" /><button type="button" onClick={() => setNewReport({...newReport, photo: null})} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"><X size={10} /></button></div>}
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold shadow-md">{isSubmitting ? 'Жіберілуде...' : 'Өтінімді жолдау'}</button>
              </form>
            )}
            <div className="space-y-4">
              {reports.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-[2rem] border shadow-sm">
                  <div className="flex justify-between items-start mb-3"><span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${getStatusColor(r.status)}`}>{r.status}</span><span className="text-[10px] font-bold text-slate-300">{r.date}</span></div>
                  <h4 className="font-bold text-slate-800 leading-tight mb-1">{r.title}</h4>
                  <p className="text-xs font-medium text-slate-500 mb-2">Сала: {r.type}</p>
                  {r.photo && <div className="w-full h-40 rounded-2xl overflow-hidden mt-2"><img src={r.photo} className="w-full h-full object-cover" alt="" /></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-220px)]">
            <div className="flex-1 space-y-4 overflow-y-auto px-1 pb-4">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border text-slate-700 rounded-tl-none'}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 bg-white p-2 rounded-[2rem] border shadow-xl items-center mt-2">
              <input value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Мәселені жазыңыз..." className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm" />
              <button onClick={sendMessage} disabled={!inputMsg.trim()} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg disabled:opacity-50"><Send size={18} /></button>
            </div>
          </div>
        )}

        {activeTab === 'polls' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Сауалнамалар</h2>
            {polls.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4">
                <h4 className="font-bold text-base text-slate-800">{p.title}</h4>
                <button onClick={() => { setPolls(polls.map(o => o.id === p.id ? { ...o, voted: !o.voted, votes: o.voted ? o.votes - 1 : o.votes + 1 } : o)); notify(p.voted ? 'Дауыс кері қайтарылды' : 'Дауысыңыз қабылданды!'); }} className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest ${p.voted ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>{p.voted ? 'Таңдау жасалды ✓' : 'Қатысу'}</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">Шұғыл байланыс</h2>
            {[{ name: 'Бірыңғай құтқару қызметі', tel: '112' }, { name: 'Жедел жәрдем', tel: '103' }, { name: 'Полиция', tel: '102' }].map(s => (
              <a href={`tel:${s.tel}`} key={s.tel} className="flex justify-between items-center bg-white p-5 rounded-[2rem] border border-red-50 shadow-sm">
                <div><div className="text-[10px] font-black text-slate-400 uppercase mb-1">{s.name}</div><div className="text-slate-900 font-black text-2xl tracking-tighter">{s.tel}</div></div>
                <div className="bg-red-500 p-4 rounded-3xl text-white"><PhoneCall size={20} /></div>
              </a>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black mb-4">Профиль</h2>
            <div className="flex flex-col items-center pb-6 border-b">
              <div className="relative">
                <div onClick={() => avatarInputRef.current.click()} className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-inner overflow-hidden cursor-pointer">{user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <User size={48} />}</div>
                <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => handleFile(e, 'avatar')} />
                <button onClick={() => avatarInputRef.current.click()} className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-2 rounded-xl shadow-md"><Plus size={14} /></button>
              </div>
              <div className="mt-4 text-center w-full max-w-xs">
                {editMode ? (
                  <div className="flex gap-2 items-center justify-center">
                    <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="bg-white border px-3 py-1.5 rounded-xl text-sm font-bold focus:outline-none" />
                    <button onClick={() => { setUser({...user, name: tempValue}); setEditMode(false); notify('Профиль жаңартылды'); }} className="bg-emerald-500 text-white p-2 rounded-xl"><Check size={16}/></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
                    <button onClick={() => { setTempValue(user.name); setEditMode(true); }} className="text-xs text-indigo-600 font-bold underline">Өзгерту</button>
                  </div>
                )}
                <p className="text-slate-400 text-xs font-bold uppercase mt-1">{user.city}, Қазақстан</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t px-6 py-2 flex justify-between items-center z-40 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}><Plus size={20} className={activeTab === 'home' ? 'rotate-45 transition-transform' : ''} /><span className="text-[10px] font-bold mt-1">Басты</span></button>
        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center p-2 ${activeTab === 'reports' ? 'text-indigo-600' : 'text-slate-400'}`}><AlertTriangle size={20} /><span className="text-[10px] font-bold mt-1">Өтінімдер</span></button>
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center p-2 ${activeTab === 'chat' ? 'text-indigo-600' : 'text-slate-400'}`}><Send size={20} /><span className="text-[10px] font-bold mt-1">Чат</span></button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}><User size={20} /><span className="text-[10px] font-bold mt-1">Профиль</span></button>
      </nav>
    </div>
  );
};

export default App;
              
