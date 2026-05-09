import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserApi, getMyParcoursApi, getMyTasksApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";
import type { Task } from "../types/auth";
import TopNav from "../components/TopNav";
import CompanyDocumentsWidget from "../components/CompanyDocumentsWidget";

// ── Helper échéances ─────────────────────────────────────────────────────
const getEcheanceInfo = (echeance?: string, statut?: string) => {
  if (!echeance || statut === "TERMINE") return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(echeance); due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  
  if (diff < 0) return { label: "En retard", color: "#EF4444" };
  if (diff === 0) return { label: "Aujourd'hui", color: "#F97316" };
  if (diff === 1) return { label: "Demain", color: "#F59E0B" };
  if (diff <= 3) return { label: `${diff} jours`, color: "#EAB308" };
  return null;
};

// ── Configuration des phases ─────────────────────────────────────────────
const PHASES = [
  { id: "PHASE_1", name: "Accueil et présentation", icon: "👋", color: "#6366F1", bg: "#EEF2FF" },
  { id: "PHASE_2", name: "Configuration des outils", icon: "🛠️", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "PHASE_3", name: "Formation métier", icon: "🎓", color: "#06B6D4", bg: "#ECFEFF" },
  { id: "PHASE_4", name: "Validation", icon: "✅", color: "#10B981", bg: "#ECFDF5" },
];

// ── Composant Timeline Phase ─────────────────────────────────────────────
const PhaseTimeline = ({ phase, tasks, onTaskClick, currentPhase }: { 
  phase: typeof PHASES[0]; 
  tasks: Task[]; 
  onTaskClick: (task: Task) => void;
  currentPhase: string;
}) => {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const completedTasks = tasks.filter(t => t.statut === "TERMINE").length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isActive = currentPhase === phase.id;
  const isCompleted = progress === 100 && totalTasks > 0;

  return (
    <div className="relative">
      {/* Ligne de connexion */}
      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
      
      <div className="relative flex gap-4">
        {/* Icône de phase */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 z-10
          ${isCompleted ? "bg-emerald-500 text-white" : isActive ? "ring-4 ring-slate-200" : ""}
        `}
          style={{ background: isCompleted ? "#10B981" : phase.bg, color: isCompleted ? "white" : phase.color }}>
          {isCompleted ? "✓" : phase.icon}
        </div>
        
        {/* Contenu de la phase */}
        <div className="flex-1 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-slate-800" style={{ fontFamily: "Sora" }}>
              {phase.name}
            </h3>
            <span className="text-xs text-slate-400">{completedTasks}/{totalTasks} tâches</span>
          </div>
          
          {/* Barre de progression de la phase */}
          {totalTasks > 0 && (
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: phase.color }} />
            </div>
          )}
          
       {/* Liste des tâches de la phase */}
{tasks.length > 0 && (
  <div className="mt-3 space-y-2">
    {tasks.map(task => {
      const echeance = getEcheanceInfo(task.echeance, task.statut);
      const icons: Record<string, string> = { FORMATION: "📹", QUIZ: "🧠", ENTRETIEN: "🤝", SIMPLE: "📄" };
      const isDone = task.statut === "TERMINE";
      const isHovered = hoveredTaskId === task.id;
      
      // 🔥 AJOUTER CETTE LIGNE : Vérifier si la tâche est verrouillée
      const isLocked = task.verrouille === true;
      
      return (
        <div
          key={task.id}
          onClick={() => !isLocked && onTaskClick(task)}  // 🔥 MODIFIER : Ne pas cliquer si verrouillé
          onMouseEnter={() => setHoveredTaskId(task.id)}
          onMouseLeave={() => setHoveredTaskId(null)}
          className={`
            relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
            ${isDone ? "opacity-60" : isLocked ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:scale-[1.01]"}
          `}
          style={{ 
            background: isDone ? "#F8FAFC" : "white", 
            border: "1px solid #E2E8F0",
            ...(isLocked && { cursor: "not-allowed" })
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: phase.bg, color: phase.color }}>
            {isLocked ? "🔒" : (isDone ? "✓" : icons[task.taskType] || "📋")}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isDone ? "text-slate-400 line-through" : isLocked ? "text-slate-400" : "text-slate-700"}`}>
              {task.titre}
            </p>
            {task.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
            )}
          </div>
          {echeance && !isDone && !isLocked && (  // 🔥 MODIFIER : Ne pas afficher l'échéance si verrouillé
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#FEF3C7", color: echeance.color }}>
              {echeance.label}
            </span>
          )}
          
          {/* HOVER : "Voir détails →" qui apparaît - Ne pas montrer si verrouillé */}
          {!isDone && !isLocked && (
            <div className={`
              flex items-center gap-1 text-xs font-medium transition-all duration-300
              ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
            `}
              style={{ color: phase.color }}>
              <span>Voir détails</span>
              <span>→</span>
            </div>
          )}
          
          {/* 🔥 AJOUTER : Badge "Verrouillé" si nécessaire */}
          {isLocked && !isDone && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-medium flex items-center gap-1"
              style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
              🔒 Verrouillé
            </div>
          )}
        </div>
      );
    })}
  </div>
)}
        </div>
      </div>
    </div>
  );
};

// ── Composant principal ──────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleTaskClick = (task: Task) => {
    sessionStorage.setItem("parcours_selected_task", task.id);
    navigate("/parcours");
  };

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: getCurrentUserApi });
  const { data: parcours } = useQuery({ queryKey: ["myParcours"], queryFn: getMyParcoursApi, retry: false });
  const { data: tasks = [] } = useQuery({ queryKey: ["myTasks"], queryFn: getMyTasksApi, retry: false });

  const tasksList = tasks as Task[];
  const total = tasksList.length;
  const completed = tasksList.filter(t => t.statut === "TERMINE").length;
  const progression = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Grouper les tâches par phase
  const tasksByPhase = new Map();
  tasksList.forEach(task => {
    const phase = task.phase || "PHASE_1";
    if (!tasksByPhase.has(phase)) tasksByPhase.set(phase, []);
    tasksByPhase.get(phase).push(task);
  });

  // Déterminer la phase actuelle (première phase non terminée)
  let currentPhase = "PHASE_1";
  for (const phase of PHASES) {
    const phaseTasks = tasksByPhase.get(phase.id) || [];
    const allCompleted = phaseTasks.length > 0 && phaseTasks.every((t: Task) => t.statut === "TERMINE");
    if (!allCompleted && phaseTasks.length > 0) {
      currentPhase = phase.id;
      break;
    }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const progressPercent = progression;

  return (
    <div className="flex min-h-screen" style={{ background: "#F8FAFC" }}>
      <Sidebar role={role as any} />

      <main className="flex-1 overflow-auto" style={{ marginLeft: "var(--sidebar-w)" }}>
        <TopNav showSearch={false} />

        <div className="p-6 lg:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ── Colonne gauche : Timeline du parcours (2/3) ── */}
            <div className="lg:col-span-2 space-y-6">
              
            {/* Header bienvenue + Citation sur la même ligne */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  
                  {/* À gauche : Greeting */}
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Sora" }}>
                      {greeting}, {user?.prenom} 👋
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                      {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  </div>
                  
                  {/* À droite : Citation inspirante */}
                  <div className="bg-slate-50 rounded-xl px-5 py-3 text-center border border-slate-100 max-w-xs">
                    <p className="text-sm text-slate-500 italic">
                      "Chaque grande aventure commence par un premier pas."
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Bienvenue dans l'équipe ! ✨</p>
                  </div>
                  
                </div>
              {/* Carte progression */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Progression d'intégration</p>
                      <p className="text-xs text-[#00AEEF] font-medium mt-0.5">
                        Phase actuelle : {PHASES.find(p => p.id === currentPhase)?.name || "Formation métier"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-slate-800" style={{ fontFamily: "Sora" }}>
                        {progressPercent}%
                      </span>
                      <p className="text-xs text-slate-400">Complété</p>
                    </div>
                  </div>
                </div>
                
                {/* Barre de progression */}
                <div className="px-6 pt-4 pb-2">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #00AEEF, #8DC63F)" }} />
                  </div>
                </div>

                {/* Timeline des phases */}
                <div className="px-6 pb-6 pt-2">
                  {PHASES.map(phase => {
                    const phaseTasks = tasksByPhase.get(phase.id) || [];
                    if (phaseTasks.length === 0) return null;
                    return (
                      <PhaseTimeline
                        key={phase.id}
                        phase={phase}
                        tasks={phaseTasks}
                        onTaskClick={handleTaskClick}
                        currentPhase={currentPhase}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Colonne droite : CompanyDocumentsWidget (1/3) ── */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* 🔥 REMPLACÉ PAR CompanyDocumentsWidget */}
              <CompanyDocumentsWidget />
{/* ── Calendrier des échéances ── */}
{(() => {
  // Récupérer toutes les tâches avec échéance
  const tasksWithEcheance = tasksList.filter(t => t.echeance && t.statut !== "TERMINE");
  
  // Grouper par mois
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Obtenir les jours du mois
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Créer un map des échéances par jour
  const echeancesByDay = new Map();
  tasksWithEcheance.forEach(task => {
    const date = new Date(task.echeance!);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      const day = date.getDate();
      if (!echeancesByDay.has(day)) echeancesByDay.set(day, []);
      echeancesByDay.get(day).push(task);
    }
  });
  
  // Prochaines échéances (toutes, pas seulement ce mois)
  const upcomingTasks = [...tasksWithEcheance]
    .sort((a, b) => new Date(a.echeance!).getTime() - new Date(b.echeance!).getTime())
    .slice(0, 5);
  
  const moisNoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const joursNoms = ["L", "M", "M", "J", "V", "S", "D"];
  
  // Fonction pour obtenir la couleur selon l'urgence
  const getEcheanceColor = (echeance: string) => {
    const diff = Math.ceil((new Date(echeance).getTime() - new Date().getTime()) / 86400000);
    if (diff < 0) return "text-red-500 bg-red-50";
    if (diff === 0) return "text-orange-500 bg-orange-50";
    if (diff === 1) return "text-amber-500 bg-amber-50";
    if (diff <= 3) return "text-yellow-500 bg-yellow-50";
    return "text-emerald-500 bg-emerald-50";
  };
  
  const getEcheanceLabel = (echeance: string) => {
    const diff = Math.ceil((new Date(echeance).getTime() - new Date().getTime()) / 86400000);
    if (diff < 0) return `En retard (J+${Math.abs(diff)})`;
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Demain";
    return `J-${diff}`;
  };
  
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h3 className="font-bold text-slate-800" style={{ fontFamily: "Sora" }}>
              Calendrier des échéances
            </h3>
          </div>
          {tasksWithEcheance.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
              {tasksWithEcheance.length} tâche{tasksWithEcheance.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Mini calendrier */}
        <div className="text-center mb-4">
          <p className="font-semibold text-sm text-slate-700">
            {moisNoms[currentMonth]} {currentYear}
          </p>
        </div>
        
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {joursNoms.map(day => (
            <div key={day} className="text-xs font-medium text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendrier grille */}
        <div className="grid grid-cols-7 gap-1">
          {/* Jours vides avant le 1er du mois */}
          {Array(firstDay === 0 ? 6 : firstDay - 1).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="text-center py-2 text-xs text-slate-300">
              •
            </div>
          ))}
          
          {/* Jours du mois */}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const hasEcheance = echeancesByDay.has(day);
            const isToday = day === today.getDate() && currentMonth === today.getMonth();
            
            return (
              <div
                key={day}
                className={`
                  text-center py-2 text-xs rounded-lg cursor-pointer transition-all duration-200
                  ${hasEcheance ? 'font-bold' : 'font-normal'}
                  ${isToday ? 'ring-2 ring-[#00AEEF] bg-[#00AEEF]/5' : 'hover:bg-slate-100'}
                `}
                onClick={() => {
                  if (hasEcheance) {
                    // Rediriger vers la première tâche de ce jour
                    const firstTask = echeancesByDay.get(day)[0];
                    handleTaskClick(firstTask);
                  }
                }}
                title={hasEcheance ? `${echeancesByDay.get(day).length} tâche(s)` : ""}
              >
                <span className={hasEcheance ? "text-[#00AEEF]" : "text-slate-600"}>
                  {day}
                </span>
                {hasEcheance && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] mx-auto mt-0.5"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Séparateur */}
        <div className="border-t border-slate-100 my-4"></div>
        
        {/* Prochaines échéances */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <span>⏰</span> PROCHAINES ÉCHÉANCES
          </p>
          
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-3xl">🎉</span>
              <p className="text-xs text-slate-400 mt-1">Aucune échéance à venir</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map(task => {
                const icons: Record<string, string> = { FORMATION: "🎓", QUIZ: "🧠", ENTRETIEN: "🤝", SIMPLE: "📄" };
                const colorClass = getEcheanceColor(task.echeance!);
                const label = getEcheanceLabel(task.echeance!);
                
                return (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:translate-x-0.5"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-slate-100">
                      {icons[task.taskType] || "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {task.titre}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {task.taskType}
                      </p>
                    </div>
                    <div className={`text-[10px] font-semibold px-2 py-1 rounded-full ${colorClass}`}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Lien vers parcours complet */}
        <button
          onClick={() => navigate("/parcours")}
          className="w-full mt-4 py-2 rounded-xl text-xs font-medium text-[#00AEEF] border border-[#00AEEF]/20 hover:bg-[#00AEEF]/5 transition"
        >
          Voir toutes mes tâches →
        </button>
      </div>
    </div>
  );
})()}
              {/* Widget encouragement */}
              {progressPercent < 100 && (
                <div className="bg-gradient-to-r from-[#00AEEF]/10 to-[#8DC63F]/10 rounded-2xl p-5 border border-[#00AEEF]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-semibold text-slate-800">Objectif de la semaine</p>
                      <p className="text-xs text-slate-500">Compléter la phase en cours</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/parcours")}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:shadow-md"
                    style={{ background: "linear-gradient(90deg, #00AEEF, #0088B5)" }}
                  >
                    Voir toutes mes tâches →
                  </button>
                </div>
              )}

           
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 