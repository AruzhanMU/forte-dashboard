import React, { useState, useEffect } from 'react';
import {
    User, Brain, Layout, Server, Calendar, CheckCircle,
    AlertCircle, Terminal, Share2, Clock, Trophy, Save,
    ExternalLink, RefreshCw
} from 'lucide-react';

// --- КОНФИГУРАЦИЯ ДАТЫ И ДАННЫХ ---
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
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = HACKATHON_END_DATE - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex space-x-3 text-center bg-slate-900 p-3 rounded-lg border border-slate-700 shadow-inner">
            <div className="flex flex-col">
                <span className="text-xl font-mono font-bold text-red-400">{timeLeft.days}</span>
                <span className="text-[10px] uppercase text-slate-500">Дней</span>
            </div>
            <span className="text-slate-600 font-bold self-center">:</span>
            <div className="flex flex-col">
                <span className="text-xl font-mono font-bold text-red-400">{timeLeft.hours}</span>
                <span className="text-[10px] uppercase text-slate-500">Часов</span>
            </div>
            <span className="text-slate-600 font-bold self-center">:</span>
            <div className="flex flex-col">
                <span className="text-xl font-mono font-bold text-red-400">{timeLeft.minutes}</span>
                <span className="text-[10px] uppercase text-slate-500">Мин</span>
            </div>
        </div>
    );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ ---

const App = () => {
    const [activeTab, setActiveTab] = useState('roles');
    const [selectedDay, setSelectedDay] = useState(1);
    const [rolesData, setRolesData] = useState(INITIAL_ROLES);

    // Загрузка из LocalStorage при старте
    useEffect(() => {
        const saved = localStorage.getItem('forteHackathonProgress');
        if (saved) {
            try {
                setRolesData(JSON.parse(saved));
            } catch (e) {
                console.error("Ошибка чтения сейва", e);
            }
        }
    }, []);

    // Сохранение при каждом изменении
    useEffect(() => {
        localStorage.setItem('forteHackathonProgress', JSON.stringify(rolesData));
    }, [rolesData]);

    const toggleTask = (roleId, taskId) => {
        setRolesData(prev => prev.map(role => {
            if (role.id !== roleId) return role;
            return {
                ...role,
                tasks: role.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                )
            };
        }));
    };

    const resetProgress = () => {
        if(confirm("Сбросить весь прогресс? Это нельзя отменить.")) {
            setRolesData(INITIAL_ROLES);
            localStorage.removeItem('forteHackathonProgress');
        }
    };

    // Подсчет общего прогресса
    const totalTasks = rolesData.reduce((acc, r) => acc + r.tasks.length, 0);
    const completedTasks = rolesData.reduce((acc, r) => acc + r.tasks.filter(t => t.completed).length, 0);
    const totalPercent = Math.round((completedTasks / totalTasks) * 100) || 0;

    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans p-4 md:p-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Top Bar: Title & Global Status */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                            ForteBank AI Hackathon
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-800">Task #4</span>
                            <span className="text-sm">AI Business Analyst Strategy</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <div className="text-xs uppercase text-slate-500 font-bold mb-1">До дедлайна</div>
                            <CountdownTimer />
                        </div>

                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full md:w-48 relative overflow-hidden">
                            <div className="flex justify-between text-sm font-bold mb-2 relative z-10">
                                <span className="text-slate-300">Общий прогресс</span>
                                <span className={totalPercent === 100 ? "text-green-400" : "text-blue-400"}>{totalPercent}%</span>
                            </div>
                            <ProgressBar current={completedTasks} total={totalTasks} colorClass="bg-gradient-to-r from-blue-500 to-purple-500" />
                            {totalPercent === 100 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 text-yellow-400 font-bold animate-pulse">
                                    <Trophy className="w-5 h-5 mr-2" /> WE ARE READY!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation & Actions */}
                <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-4">
                    <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-full">
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center ${activeTab === 'roles' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Роли & Задачи
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center ${activeTab === 'timeline' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Спринт (Дни)
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={resetProgress}
                            className="text-xs text-slate-600 hover:text-red-400 flex items-center transition-colors px-3 py-2"
                            title="Сбросить прогресс"
                        >
                            <RefreshCw className="w-3 h-3 mr-1" /> Reset
                        </button>
                        <div className="flex items-center text-green-500 text-xs bg-green-950/30 px-3 py-1.5 rounded-full border border-green-900/50">
                            <Save className="w-3 h-3 mr-1.5" />
                            Auto-save on
                        </div>
                    </div>
                </div>

                {/* --- ROLES VIEW --- */}
                {activeTab === 'roles' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {rolesData.map((role) => {
                            const roleCompleted = role.tasks.filter(t => t.completed).length;
                            const roleTotal = role.tasks.length;
                            const isDone = roleCompleted === roleTotal;

                            return (
                                <div key={role.id} className={`bg-slate-900 rounded-xl overflow-hidden border-t-4 ${role.color} shadow-xl flex flex-col relative group`}>
                                    {/* Header */}
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

                                    {/* Tech Stack */}
                                    <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50">
                                        <div className="flex flex-wrap gap-2">
                                            {role.tech.map((t, i) => (
                                                <span key={i} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                            {t}
                          </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tasks List */}
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

                {/* --- TIMELINE VIEW --- */}
                {activeTab === 'timeline' && (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="flex overflow-x-auto border-b border-slate-800 scrollbar-hide">
                            {SPRINT_PLAN.map((day) => {
                                // Check if all tasks for this day are done across all roles
                                const dayTasks = rolesData.flatMap(r => r.tasks.filter(t => t.day === day.day));
                                const isDayComplete = dayTasks.length > 0 && dayTasks.every(t => t.completed);

                                return (
                                    <button
                                        key={day.day}
                                        onClick={() => setSelectedDay(day.day)}
                                        className={`
                      flex-1 min-w-[120px] p-4 text-center border-r border-slate-800 transition-colors relative
                      ${selectedDay === day.day ? 'bg-blue-900/20' : 'hover:bg-slate-800'}
                    `}
                                    >
                                        {isDayComplete && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>}
                                        <div className={`text-xs font-bold uppercase mb-1 ${selectedDay === day.day ? 'text-blue-400' : 'text-slate-500'}`}>
                                            Day {day.day}
                                        </div>
                                        <div className={`text-sm font-medium ${selectedDay === day.day ? 'text-white' : 'text-slate-400'}`}>
                                            {day.theme}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-lg font-bold shadow-lg shadow-blue-900/50">
                      {selectedDay}
                    </span>
                                        <span>{SPRINT_PLAN[selectedDay - 1].theme}</span>
                                    </h2>
                                    <p className="text-slate-400 mt-2 ml-12">
                                        Цель: <span className="text-blue-300">{SPRINT_PLAN[selectedDay - 1].goal}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {rolesData.map((role) => {
                                    const dailyTasks = role.tasks.filter(t => t.day === selectedDay);

                                    return (
                                        <div key={role.id} className="bg-slate-950/50 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all">
                                            <div className="flex items-center mb-4 pb-3 border-b border-slate-800">
                                                <IconMap name={role.iconName} className={`w-5 h-5 mr-3 ${role.id === 1 ? 'text-purple-400' : role.id === 2 ? 'text-blue-400' : 'text-green-400'}`} />
                                                <span className="font-bold text-slate-200">{role.title}</span>
                                            </div>

                                            <div className="space-y-3">
                                                {dailyTasks.length > 0 ? dailyTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => toggleTask(role.id, task.id)}
                                                        className={`
                              p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-all
                              ${task.completed
                                                            ? 'bg-green-900/10 border-green-900/30'
                                                            : 'bg-slate-800 border-slate-700 hover:bg-slate-800/80'
                                                        }
                            `}
                                                    >
                                                        <div className={`
                                mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                                ${task.completed ? 'bg-green-500 border-green-500 text-slate-900' : 'border-slate-600 bg-slate-900'}
                             `}>
                                                            {task.completed && <CheckCircle className="w-3 h-3" />}
                                                        </div>
                                                        <span className={`text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                               {task.text}
                             </span>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-8 text-slate-600 text-sm italic border border-dashed border-slate-800 rounded-lg">
                                                        Нет задач на этот день.<br/>Помогите коллегам!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Resources */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800">
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex items-center justify-between hover:border-blue-500/50 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded text-blue-400"><Share2 className="w-5 h-5" /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">GitHub Repo</div>
                                <div className="text-xs text-slate-500">Код проекта</div>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex items-center justify-between hover:border-orange-500/50 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded text-orange-400"><Layout className="w-5 h-5" /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">Figma / Miro</div>
                                <div className="text-xs text-slate-500">Дизайн и схемы</div>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-orange-400" />
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex items-center justify-between hover:border-green-500/50 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded text-green-400"><Terminal className="w-5 h-5" /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">API Docs</div>
                                <div className="text-xs text-slate-500">Swagger / Postman</div>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-green-400" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default App;