import React, { useState, useEffect, useRef } from 'react';
import {
    User, Brain, Layout, Server, Calendar, CheckCircle,
    AlertCircle, Terminal, Share2, Trophy, Save,
    ExternalLink, RefreshCw, Wifi, WifiOff, FileText,
    Flame, Zap, Clock, Shield
} from 'lucide-react';

// --- ИМПОРТ FIREBASE ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

// --- 🛠️ НАСТРОЙКИ (ВСТАВЬ СВОИ КЛЮЧИ НИЖЕ) ---
const firebaseConfig = {
    apiKey: "AIzaSyAHqP6W8w4dnV7TuG0ryXIzCLGQstO89o0",
    authDomain: "forte-dashboard.firebaseapp.com",
    projectId: "forte-dashboard",
    storageBucket: "forte-dashboard.firebasestorage.app",
    messagingSenderId: "965435370678",
    appId: "1:965435370678:web:eab582c1f56ded2c624a17",
    measurementId: "G-1FLR1SPQX3"
};

// Инициализация Firebase
let db;
try {
    if (firebaseConfig.apiKey !== "ВСТАВЬ_СЮДА_API_KEY") {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    }
} catch (e) {
    console.error("Firebase init error:", e);
}

// --- КОНСТАНТЫ ---
const HACKATHON_END_DATE = new Date('2025-11-28T12:00:00');

const INITIAL_ROLES = [
    {
        id: 1,
        title: "AI Architect",
        subtitle: "Backend Logic & Prompt Engineering",
        iconName: "Brain",
        color: "border-purple-500",
        bg: "from-purple-900/20 to-purple-900/5",
        tech: ["LangGraph", "Python", "OpenAI", "Pydantic"],
        tasks: [
            { id: 'r1d1', day: 1, priority: 'High', text: "Проектирование графа состояний (FSM) в LangGraph", completed: false },
            { id: 'r1d2', day: 2, priority: 'High', text: "Написание системных промптов (Interview & Critic)", completed: false },
            { id: 'r1d3', day: 3, priority: 'Med', text: "Валидация через Pydantic (Structured Output)", completed: false },
            { id: 'r1d4', day: 4, priority: 'Med', text: "Настройка RAG (ChromaDB) для документов банка", completed: false },
            { id: 'r1d5', day: 5, priority: 'Low', text: "Оптимизация контекстного окна и CoT", completed: false },
            { id: 'r1d6', day: 6, priority: 'High', text: "Тестирование edge-кейсов и галлюцинаций", completed: false }
        ]
    },
    {
        id: 2,
        title: "Frontend Lead",
        subtitle: "UX/UI & Real-time Visualization",
        iconName: "Layout",
        color: "border-blue-500",
        bg: "from-blue-900/20 to-blue-900/5",
        tech: ["Next.js", "Tailwind", "Mermaid", "WebSocket"],
        tasks: [
            { id: 'r2d1', day: 1, priority: 'High', text: "Инициализация Next.js, ShadCN UI, Dark Mode", completed: false },
            { id: 'r2d2', day: 2, priority: 'High', text: "Верстка Split-Screen (Чат / Документ)", completed: false },
            { id: 'r2d3', day: 3, priority: 'High', text: "Интеграция Mermaid.js (Live render)", completed: false },
            { id: 'r2d4', day: 4, priority: 'Med', text: "Стриминг ответов (SSE) на фронт", completed: false },
            { id: 'r2d5', day: 5, priority: 'Low', text: "Полировка UI: скелетоны, анимации, мобайл", completed: false },
            { id: 'r2d6', day: 6, priority: 'Med', text: "Запись демо-видео интерфейса", completed: false }
        ]
    },
    {
        id: 3,
        title: "Integration Engineer",
        subtitle: "API, Infrastructure & Docs",
        iconName: "Server",
        color: "border-green-500",
        bg: "from-green-900/20 to-green-900/5",
        tech: ["FastAPI", "Confluence", "Docker", "XML"],
        tasks: [
            { id: 'r3d1', day: 1, priority: 'High', text: "FastAPI каркас и Docker Compose", completed: false },
            { id: 'r3d2', day: 2, priority: 'Med', text: "Изучение Confluence Storage Format (XHTML)", completed: false },
            { id: 'r3d3', day: 3, priority: 'High', text: "Генератор XML для таблиц Confluence", completed: false },
            { id: 'r3d4', day: 4, priority: 'High', text: "API Contracts (связь фронта и бэка)", completed: false },
            { id: 'r3d5', day: 5, priority: 'High', text: "Логика 'Publish to Confluence' + Error handling", completed: false },
            { id: 'r3d6', day: 6, priority: 'Med', text: "Деплой и Питч-дек (Презентация)", completed: false }
        ]
    }
];

const SPRINT_PLAN = [
    { day: 1, theme: "Foundation", goal: "Работающий Hello World на всем стеке" },
    { day: 2, theme: "Core Logic", goal: "Бот умеет задавать вопросы по сценарию" },
    { day: 3, theme: "Visualization", goal: "Бот рисует диаграммы, API генерирует XML" },
    { day: 4, theme: "Integration", goal: "Фронт общается с Бэком, Бэк с Confluence" },
    { day: 5, theme: "Polish", goal: "Красивый UI и работающая кнопка 'Опубликовать'" },
    { day: 6, theme: "Testing & Pitch", goal: "Запись демо, тесты, презентация" },
    { day: 7, theme: "Submission", goal: "Финальная сборка и отправка" }
];

// --- КОМПОНЕНТЫ UI ---

const IconMap = ({ name, className }) => {
    switch(name) {
        case 'Brain': return <Brain className={className} />;
        case 'Layout': return <Layout className={className} />;
        case 'Server': return <Server className={className} />;
        default: return <User className={className} />;
    }
};

const PriorityBadge = ({ level }) => {
    const colors = {
        High: "bg-red-500/20 text-red-300 border-red-500/30",
        Med: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        Low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    };
    return (
        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${colors[level] || colors.Low}`}>
      {level}
    </span>
    );
};

const ProgressBar = ({ current, total, colorClass, isDone }) => {
    const percent = Math.round((current / total) * 100) || 0;
    return (
        <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden relative">
            {isDone && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
            <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    );
};

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = HACKATHON_END_DATE - now;
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const TimeBlock = ({ val, label }) => (
        <div className="flex flex-col items-center w-10 md:w-12">
            <span className="text-lg md:text-xl font-mono font-bold text-white drop-shadow-glow">{val}</span>
            <span className="text-[8px] md:text-[9px] uppercase text-slate-500 font-bold">{label}</span>
        </div>
    );
    return (
        <div className="flex items-center justify-center space-x-1 bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700 shadow-lg">
            <TimeBlock val={timeLeft.days} label="Days" />
            <span className="text-slate-600 font-bold -mt-3">:</span>
            <TimeBlock val={timeLeft.hours} label="Hrs" />
            <span className="text-slate-600 font-bold -mt-3">:</span>
            <TimeBlock val={timeLeft.minutes} label="Min" />
            <span className="text-slate-600 font-bold -mt-3">:</span>
            <TimeBlock val={timeLeft.seconds} label="Sec" />
        </div>
    );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ ---

const App = () => {
    const [activeTab, setActiveTab] = useState('roles');
    const [selectedDay, setSelectedDay] = useState(1);
    const [rolesData, setRolesData] = useState(INITIAL_ROLES);
    const [sharedNotes, setSharedNotes] = useState("");
    const [isOnline, setIsOnline] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);

    // Синхронизация
    useEffect(() => {
        if (!db) {
            const saved = localStorage.getItem('forteHackathonProgress');
            if (saved) setRolesData(JSON.parse(saved));
            const savedNotes = localStorage.getItem('forteHackathonNotes');
            if (savedNotes) setSharedNotes(savedNotes);
            return;
        }

        setIsConfigured(true);
        const unsub = onSnapshot(doc(db, "hackathon", "progress"), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setRolesData(data.roles || INITIAL_ROLES);
                setSharedNotes(data.notes || "");
                setIsOnline(true);
            } else {
                setDoc(doc(db, "hackathon", "progress"), { roles: INITIAL_ROLES, notes: "" });
            }
        }, (error) => {
            console.error("Sync error:", error);
            setIsOnline(false);
        });

        return () => unsub();
    }, []);

    // Сохранение задач
    const toggleTask = async (roleId, taskId) => {
        const newData = rolesData.map(role => {
            if (role.id !== roleId) return role;
            return {
                ...role,
                tasks: role.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                )
            };
        });
        setRolesData(newData);

        if (db) {
            await setDoc(doc(db, "hackathon", "progress"), { roles: newData }, { merge: true });
        } else {
            localStorage.setItem('forteHackathonProgress', JSON.stringify(newData));
        }
    };

    // Сохранение заметок (Debounced manual save not needed, just onBlur or onChange throttled)
    const handleNotesChange = async (e) => {
        const text = e.target.value;
        setSharedNotes(text); // Optimistic UI
    };

    const saveNotesToDb = async () => {
        if (db) {
            await setDoc(doc(db, "hackathon", "progress"), { notes: sharedNotes }, { merge: true });
        } else {
            localStorage.setItem('forteHackathonNotes', sharedNotes);
        }
    }

    // Reset Logic
    const resetProgress = async () => {
        if(confirm("⚠️ Сбросить ВЕСЬ командный прогресс?")) {
            const emptyData = INITIAL_ROLES;
            setRolesData(emptyData);
            setSharedNotes("");
            if(db) {
                await setDoc(doc(db, "hackathon", "progress"), { roles: emptyData, notes: "" });
            } else {
                localStorage.setItem('forteHackathonProgress', JSON.stringify(emptyData));
                localStorage.setItem('forteHackathonNotes', "");
            }
        }
    }

    const totalTasks = rolesData.reduce((acc, r) => acc + r.tasks.length, 0);
    const completedTasks = rolesData.reduce((acc, r) => acc + r.tasks.filter(t => t.completed).length, 0);
    const totalPercent = Math.round((completedTasks / totalTasks) * 100) || 0;

    return (
        <div className="min-h-screen bg-[#0B1120] text-gray-100 font-sans pb-20 selection:bg-blue-500/30">

            {/* Top Gradient Line */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="max-w-7xl mx-auto px-4 py-6 md:p-8 space-y-8">

                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                    {/* Background Glow */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-1000"></div>

                    <div className="relative z-10 text-center lg:text-left">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center justify-center lg:justify-start gap-3">
                            FORTE<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">HACK</span>
                        </h1>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="bg-slate-800/80 text-slate-300 text-xs font-mono px-3 py-1 rounded border border-slate-700">
                TASK_04: BUSINESS_ANALYST
              </span>
                            {isConfigured ? (
                                <span className={`flex items-center text-xs px-2 py-1 rounded border transition-colors ${isOnline ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                   {isOnline ? <Wifi className="w-3 h-3 mr-1.5 animate-pulse" /> : <WifiOff className="w-3 h-3 mr-1.5" />}
                                    {isOnline ? 'LIVE SYNC' : 'OFFLINE'}
                 </span>
                            ) : (
                                <span className="flex items-center text-xs px-2 py-1 rounded border bg-orange-500/10 text-orange-400 border-orange-500/20">
                   <AlertCircle className="w-3 h-3 mr-1.5" /> Local Mode
                 </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-4 w-full lg:w-auto relative z-10">
                        <CountdownTimer />

                        <div className="w-full md:w-72">
                            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                                <span className="text-slate-400 flex items-center"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Team Progress</span>
                                <span className={totalPercent === 100 ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "text-blue-400"}>{totalPercent}%</span>
                            </div>
                            <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                                {/* Progress Bar stripes */}
                                <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 z-10 w-full h-full`}></div>
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 relative z-0 ${totalPercent === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'}`}
                                    style={{ width: `${totalPercent}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="flex flex-wrap justify-between items-center border-b border-slate-800/60 pb-4 gap-4">
                    <div className="flex space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60 backdrop-blur">
                        {['roles', 'timeline', 'notes'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                  px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center capitalize
                  ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }
                `}
                            >
                                {tab === 'roles' && <User className="w-4 h-4 mr-2" />}
                                {tab === 'timeline' && <Calendar className="w-4 h-4 mr-2" />}
                                {tab === 'notes' && <FileText className="w-4 h-4 mr-2" />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={resetProgress} className="text-xs text-slate-600 hover:text-red-400 flex items-center px-3 py-2 transition-colors hover:bg-red-950/10 rounded">
                            <RefreshCw className="w-3 h-3 mr-1.5" /> Reset All
                        </button>
                        {db && (
                            <div className="flex items-center text-green-400 text-[10px] font-mono bg-green-950/20 px-3 py-1.5 rounded border border-green-900/30">
                                <Save className="w-3 h-3 mr-1.5" /> AUTO-SAVE ON
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ROLES VIEW --- */}
                {activeTab === 'roles' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {rolesData.map((role) => {
                            const roleCompleted = role.tasks.filter(t => t.completed).length;
                            const roleTotal = role.tasks.length;
                            const isDone = roleCompleted === roleTotal;

                            return (
                                <div key={role.id} className={`
                  bg-slate-900/40 rounded-2xl border backdrop-blur-sm flex flex-col transition-all duration-500 group hover:-translate-y-1
                  ${isDone ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.15)]' : `border-slate-800 hover:${role.color.replace('border', 'border')}`}
                `}>
                                    {/* Card Header */}
                                    <div className={`p-6 rounded-t-2xl bg-gradient-to-b ${isDone ? 'from-green-900/20 to-green-900/5' : role.bg}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl border shadow-lg ${isDone ? 'bg-green-500 text-slate-950 border-green-400' : 'bg-slate-950 border-slate-800 text-slate-200'}`}>
                                                <IconMap name={role.iconName} className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-black ${isDone ? 'text-green-400' : 'text-white'}`}>
                                                    {Math.round((roleCompleted/roleTotal)*100)}%
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                            {role.title}
                                            {isDone && <Shield className="w-4 h-4 text-green-400 fill-green-400/20" />}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-mono mb-4">{role.subtitle}</p>

                                        <ProgressBar current={roleCompleted} total={roleTotal} isDone={isDone} colorClass={isDone ? 'bg-green-500' : 'bg-blue-500'} />

                                        {/* Tech Tags */}
                                        <div className="flex flex-wrap gap-1.5 mt-4">
                                            {role.tech.map((t, i) => (
                                                <span key={i} className="px-2 py-1 bg-slate-950/50 rounded text-[10px] font-bold text-slate-300 border border-slate-700/50">
                            {t}
                          </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tasks List */}
                                    <div className="p-4 space-y-2 flex-1 bg-slate-950/30 rounded-b-2xl border-t border-slate-800/50">
                                        {role.tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                onClick={() => toggleTask(role.id, task.id)}
                                                className={`
                          flex items-start p-3 rounded-lg cursor-pointer border transition-all duration-200 group/task relative overflow-hidden
                          ${task.completed
                                                    ? 'bg-green-900/10 border-green-900/20'
                                                    : 'bg-slate-900/40 border-slate-800 hover:border-blue-500/30 hover:bg-slate-800/60'
                                                }
                        `}
                                            >
                                                {/* Left Checkbox */}
                                                <div className={`
                          mt-0.5 mr-3 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors border
                          ${task.completed ? 'bg-green-500 border-green-500 text-slate-900' : 'border-slate-600 bg-slate-950 group-hover/task:border-blue-400'}
                        `}>
                                                    {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                                                </div>

                                                <div className="flex-1 z-10">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-1.5 rounded">D{task.day}</span>
                                                            <PriorityBadge level={task.priority} />
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm leading-snug font-medium transition-colors ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200 group-hover/task:text-white'}`}>
                                                        {task.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- SHARED BRAIN (NOTES) --- */}
                {activeTab === 'notes' && (
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-1 backdrop-blur-sm flex flex-col h-[600px]">
                        <div className="bg-slate-900/80 p-4 rounded-t-xl border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Flame className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="font-bold text-white">Shared Brain</h3>
                                    <p className="text-xs text-slate-400">Общий блокнот команды (Real-time)</p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Auto-saving...
                            </div>
                        </div>
                        <textarea
                            value={sharedNotes}
                            onChange={handleNotesChange}
                            onBlur={saveNotesToDb}
                            placeholder="Пишите сюда ссылки, JSON схемы, идеи для промптов или просто мысли... (Видно всем участникам)"
                            className="flex-1 bg-[#0F172A] text-slate-200 p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed selection:bg-yellow-500/30"
                            spellCheck="false"
                        />
                    </div>
                )}

                {/* --- TIMELINE VIEW --- */}
                {activeTab === 'timeline' && (
                    <div className="bg-slate-900/40 rounded-2xl border border-slate-800 backdrop-blur-sm overflow-hidden">
                        <div className="flex overflow-x-auto border-b border-slate-800 scrollbar-hide">
                            {SPRINT_PLAN.map((day) => (
                                <button
                                    key={day.day}
                                    onClick={() => setSelectedDay(day.day)}
                                    className={`
                    flex-1 min-w-[120px] p-4 text-center border-r border-slate-800/50 transition-all relative group
                    ${selectedDay === day.day ? 'bg-blue-900/20' : 'hover:bg-slate-800/40'}
                  `}
                                >
                                    <div className={`text-xs font-bold uppercase mb-1 ${selectedDay === day.day ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                        Day {day.day}
                                    </div>
                                    <div className={`text-sm font-medium truncate px-2 ${selectedDay === day.day ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                        {day.theme}
                                    </div>
                                    {selectedDay === day.day && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 md:p-8 min-h-[400px]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-900/50">
                                    {selectedDay}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{SPRINT_PLAN[selectedDay - 1].theme}</h2>
                                    <p className="text-blue-300 text-sm flex items-center mt-1">
                                        <Clock className="w-3 h-3 mr-1.5" />
                                        Goal: {SPRINT_PLAN[selectedDay - 1].goal}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {rolesData.map((role) => {
                                    const dailyTasks = role.tasks.filter(t => t.day === selectedDay);
                                    if (dailyTasks.length === 0) return null;

                                    return (
                                        <div key={role.id} className="bg-slate-950/40 rounded-xl border border-slate-800/60 overflow-hidden">
                                            <div className={`px-4 py-3 border-b border-slate-800/60 flex items-center bg-slate-900/30`}>
                                                <div className={`w-2 h-2 rounded-full mr-2 ${role.id === 1 ? 'bg-purple-500' : role.id === 2 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                                <span className="font-bold text-slate-300 text-sm">{role.title}</span>
                                            </div>
                                            <div className="p-3 space-y-2">
                                                {dailyTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => toggleTask(role.id, task.id)}
                                                        className={`
                               p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-all
                               ${task.completed
                                                            ? 'bg-green-900/5 border-green-900/10 opacity-50 grayscale'
                                                            : 'bg-slate-800/20 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                                                        }
                            `}
                                                    >
                                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                            {task.completed && <CheckCircle className="w-3 h-3 text-slate-900" />}
                                                        </div>
                                                        <span className="text-sm text-slate-300 font-medium">{task.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FOOTER RESTORED --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-800/50">
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 flex items-center justify-between transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform"><Share2 className="w-5 h-5" /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">GitHub Repo</div>
                                <div className="text-xs text-slate-500">Source Code</div>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                    </a>

                    <a href="https://figma.com" target="_blank" rel="noreferrer" className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-pink-500/50 flex items-center justify-between transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 group-hover:scale-110 transition-transform"><Layout className="w-5 h-5" /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">Figma Design</div>
                                <div className="text-xs text-slate-500">UI & Flows</div>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-pink-400" />
                    </a>

                    <a href="#" className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-green-500/50 flex items-center justify-between transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-400 group-hover:scale-110 transition-transform"><Terminal className="w-5 h-5" /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">API Documentation</div>
                                <div className="text-xs text-slate-500">Endpoints & Schema</div>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-green-400" />
                    </a>
                </div>

                <div className="text-center text-slate-700 text-xs font-mono py-4">
                    ENGINEERED FOR FORTEBANK AI HACKATHON • 2025
                </div>

            </div>
        </div>
    );
};

export default App;