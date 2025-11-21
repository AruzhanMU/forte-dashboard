import React, { useState, useEffect } from 'react';
import {
    User, Brain, Layout, Server, Calendar, CheckCircle,
    AlertCircle, Terminal, Share2, Trophy, Save,
    ExternalLink, RefreshCw, Wifi, WifiOff
} from 'lucide-react';

// --- ИМПОРТ FIREBASE ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAHqP6W8w4dnV7TuG0ryXIzCLGQstO89o0",
    authDomain: "forte-dashboard.firebaseapp.com",
    projectId: "forte-dashboard",
    storageBucket: "forte-dashboard.firebasestorage.app",
    messagingSenderId: "965435370678",
    appId: "1:965435370678:web:eab582c1f56ded2c624a17",
    measurementId: "G-1FLR1SPQX3"
};

// Инициализация Firebase (безопасная проверка, чтобы не падало при пустом конфиге)
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
        tech: ["LangGraph", "Python", "OpenAI API", "Pydantic"],
        tasks: [
            { id: 'r1d1', day: 1, text: "Проектирование графа состояний (FSM) в LangGraph", completed: false },
            { id: 'r1d2', day: 2, text: "Написание системных промптов (Interview & Critic)", completed: false },
            { id: 'r1d3', day: 3, text: "Валидация через Pydantic (Structured Output)", completed: false },
            { id: 'r1d4', day: 4, text: "Настройка RAG (ChromaDB) для документов банка", completed: false },
            { id: 'r1d5', day: 5, text: "Оптимизация контекстного окна и CoT", completed: false },
            { id: 'r1d6', day: 6, text: "Тестирование edge-кейсов и галлюцинаций", completed: false }
        ]
    },
    {
        id: 2,
        title: "Frontend Lead",
        subtitle: "UX/UI & Real-time Visualization",
        iconName: "Layout",
        color: "border-blue-500",
        bg: "from-blue-900/20 to-blue-900/5",
        tech: ["Next.js", "Tailwind", "Mermaid.js", "WebSocket"],
        tasks: [
            { id: 'r2d1', day: 1, text: "Инициализация Next.js, ShadCN UI, Dark Mode", completed: false },
            { id: 'r2d2', day: 2, text: "Верстка Split-Screen (Чат / Документ)", completed: false },
            { id: 'r2d3', day: 3, text: "Интеграция Mermaid.js (Live render)", completed: false },
            { id: 'r2d4', day: 4, text: "Стриминг ответов (SSE) на фронт", completed: false },
            { id: 'r2d5', day: 5, text: "Полировка UI: скелетоны, анимации, мобайл", completed: false },
            { id: 'r2d6', day: 6, text: "Запись демо-видео интерфейса", completed: false }
        ]
    },
    {
        id: 3,
        title: "Integration Engineer",
        subtitle: "API, Infrastructure & Docs",
        iconName: "Server",
        color: "border-green-500",
        bg: "from-green-900/20 to-green-900/5",
        tech: ["FastAPI", "Confluence API", "Docker", "XML"],
        tasks: [
            { id: 'r3d1', day: 1, text: "FastAPI каркас и Docker Compose", completed: false },
            { id: 'r3d2', day: 2, text: "Изучение Confluence Storage Format (XHTML)", completed: false },
            { id: 'r3d3', day: 3, text: "Генератор XML для таблиц Confluence", completed: false },
            { id: 'r3d4', day: 4, text: "API Contracts (связь фронта и бэка)", completed: false },
            { id: 'r3d5', day: 5, text: "Логика 'Publish to Confluence' + Error handling", completed: false },
            { id: 'r3d6', day: 6, text: "Деплой и Питч-дек (Презентация)", completed: false }
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

const ProgressBar = ({ current, total, colorClass }) => {
    const percent = Math.round((current / total) * 100) || 0;
    return (
        <div className="w-full bg-slate-900 rounded-full h-2.5 mt-2 overflow-hidden">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`}
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
            <span className="text-xl md:text-2xl font-mono font-bold text-red-400">{val}</span>
            <span className="text-[9px] md:text-[10px] uppercase text-slate-500">{label}</span>
        </div>
    );

    const Separator = () => <span className="text-slate-600 font-bold text-xl mb-3">:</span>;

    return (
        <div className="flex items-center justify-center space-x-1 md:space-x-2 bg-slate-900 p-2 md:p-3 rounded-lg border border-slate-700 shadow-inner">
            <TimeBlock val={timeLeft.days} label="Дней" />
            <Separator />
            <TimeBlock val={timeLeft.hours} label="Часов" />
            <Separator />
            <TimeBlock val={timeLeft.minutes} label="Мин" />
            <Separator />
            <TimeBlock val={timeLeft.seconds} label="Сек" />
        </div>
    );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ ---

const App = () => {
    const [activeTab, setActiveTab] = useState('roles');
    const [selectedDay, setSelectedDay] = useState(1);
    const [rolesData, setRolesData] = useState(INITIAL_ROLES);
    const [isOnline, setIsOnline] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);

    // Подключение к Firebase и синхронизация
    useEffect(() => {
        if (!db) {
            // Если конфига нет, читаем из localStorage (оффлайн режим)
            const saved = localStorage.getItem('forteHackathonProgress');
            if (saved) setRolesData(JSON.parse(saved));
            return;
        }

        setIsConfigured(true);
        // Слушаем изменения в базе данных в реальном времени
        const unsub = onSnapshot(doc(db, "hackathon", "progress"), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setRolesData(docSnapshot.data().roles);
                setIsOnline(true);
            } else {
                // Если документа нет, создаем его
                setDoc(doc(db, "hackathon", "progress"), { roles: INITIAL_ROLES });
            }
        }, (error) => {
            console.error("Sync error:", error);
            setIsOnline(false);
        });

        return () => unsub();
    }, []);

    const toggleTask = async (roleId, taskId) => {
        // Оптимистичное обновление (сразу меняем UI)
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

        // Если Firebase подключен - отправляем в облако
        if (db) {
            try {
                await setDoc(doc(db, "hackathon", "progress"), { roles: newData }, { merge: true });
            } catch (e) {
                console.error("Error writing document: ", e);
                alert("Ошибка сохранения в облако! Проверьте консоль.");
            }
        } else {
            // Иначе сохраняем локально
            localStorage.setItem('forteHackathonProgress', JSON.stringify(newData));
        }
    };

    // Подсчет общего прогресса
    const totalTasks = rolesData.reduce((acc, r) => acc + r.tasks.length, 0);
    const completedTasks = rolesData.reduce((acc, r) => acc + r.tasks.filter(t => t.completed).length, 0);
    const totalPercent = Math.round((completedTasks / totalTasks) * 100) || 0;

    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans p-4 md:p-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Warning if not configured */}
                {!isConfigured && (
                    <div className="bg-orange-900/20 border border-orange-700/50 p-4 rounded-lg text-orange-200 text-sm flex items-center justify-between">
            <span className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Режим LocalStorage (только на этом устройстве). Чтобы синхронизировать с друзьями, добавь ключи Firebase в App.jsx.
            </span>
                    </div>
                )}

                {/* Top Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                            ForteBank AI Hackathon
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-800">Task #4</span>
                            {isConfigured && (
                                <span className={`flex items-center text-xs px-2 py-0.5 rounded border ${isOnline ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                  {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                                    {isOnline ? 'Online Sync' : 'Connecting...'}
                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                        <CountdownTimer />

                        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 w-full md:w-64 relative overflow-hidden">
                            <div className="flex justify-between text-sm font-bold mb-2 relative z-10">
                                <span className="text-slate-300">Общий прогресс</span>
                                <span className={totalPercent === 100 ? "text-green-400" : "text-blue-400"}>{totalPercent}%</span>
                            </div>
                            <ProgressBar current={completedTasks} total={totalTasks} colorClass="bg-gradient-to-r from-blue-500 to-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-4">
                    <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-full">
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center ${activeTab === 'roles' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Роли
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center ${activeTab === 'timeline' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Спринт
                        </button>
                    </div>
                </div>

                {/* Roles View */}
                {activeTab === 'roles' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {rolesData.map((role) => {
                            const roleCompleted = role.tasks.filter(t => t.completed).length;
                            const roleTotal = role.tasks.length;
                            const isDone = roleCompleted === roleTotal;

                            return (
                                <div key={role.id} className={`bg-slate-900 rounded-xl overflow-hidden border-t-4 ${role.color} shadow-xl flex flex-col relative group`}>
                                    <div className={`p-6 bg-gradient-to-b ${role.bg}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 shadow-lg">
                                                <IconMap name={role.iconName} className={`w-6 h-6 ${isDone ? 'text-green-400' : 'text-slate-200'}`} />
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-white">{roleCompleted}/{roleTotal}</span>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Задач</div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">{role.title}</h3>
                                        <p className="text-xs text-slate-400 font-mono">{role.subtitle}</p>
                                        <ProgressBar current={roleCompleted} total={roleTotal} colorClass={isDone ? 'bg-green-500' : 'bg-blue-500'} />
                                    </div>

                                    <div className="p-4 space-y-2 flex-1 bg-slate-900">
                                        {role.tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                onClick={() => toggleTask(role.id, task.id)}
                                                className={`
                          flex items-start p-3 rounded-lg cursor-pointer border transition-all duration-200 group/item
                          ${task.completed
                                                    ? 'bg-slate-900/50 border-green-900/30 opacity-60'
                                                    : 'bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80'
                                                }
                        `}
                                            >
                                                <div className={`
                          mt-0.5 mr-3 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                          ${task.completed ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-slate-600 group-hover/item:border-blue-400'}
                        `}>
                                                    {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-xs font-bold px-1.5 rounded ${task.completed ? 'text-slate-500' : 'bg-slate-700 text-slate-300'}`}>Day {task.day}</span>
                                                    </div>
                                                    <p className={`text-sm leading-snug ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
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

                {/* Timeline View */}
                {activeTab === 'timeline' && (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="flex overflow-x-auto border-b border-slate-800 scrollbar-hide">
                            {SPRINT_PLAN.map((day) => (
                                <button
                                    key={day.day}
                                    onClick={() => setSelectedDay(day.day)}
                                    className={`
                    flex-1 min-w-[120px] p-4 text-center border-r border-slate-800 transition-colors relative
                    ${selectedDay === day.day ? 'bg-blue-900/20' : 'hover:bg-slate-800'}
                  `}
                                >
                                    <div className={`text-xs font-bold uppercase mb-1 ${selectedDay === day.day ? 'text-blue-400' : 'text-slate-500'}`}>
                                        Day {day.day}
                                    </div>
                                    <div className={`text-sm font-medium ${selectedDay === day.day ? 'text-white' : 'text-slate-400'}`}>
                                        {day.theme}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                <span className="text-blue-400">Day {selectedDay}:</span> {SPRINT_PLAN[selectedDay - 1].theme}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {rolesData.map((role) => {
                                    const dailyTasks = role.tasks.filter(t => t.day === selectedDay);
                                    return dailyTasks.length > 0 && (
                                        <div key={role.id} className="bg-slate-950/50 rounded-xl p-5 border border-slate-800">
                                            <div className="flex items-center mb-4 pb-3 border-b border-slate-800">
                                                <IconMap name={role.iconName} className="w-5 h-5 mr-3 text-slate-400" />
                                                <span className="font-bold text-slate-200">{role.title}</span>
                                            </div>
                                            <div className="space-y-3">
                                                {dailyTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => toggleTask(role.id, task.id)}
                                                        className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 ${task.completed ? 'opacity-50' : ''}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                            {task.completed && <CheckCircle className="w-3 h-3 text-slate-900" />}
                                                        </div>
                                                        <span className="text-sm text-slate-200">{task.text}</span>
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

                <div className="text-center text-slate-600 text-xs pt-8">
                    ForteBank Hackathon Sync v2.0
                </div>

            </div>
        </div>
    );
};

export default App;