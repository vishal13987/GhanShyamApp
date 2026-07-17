import React, { useState } from "react";
import { 
  Users, 
  Activity, 
  Clock, 
  CheckCircle, 
  FileText, 
  PenTool, 
  MessageSquare, 
  Video, 
  VideoOff, 
  Volume2, 
  AlertCircle, 
  UserCheck, 
  Download, 
  Lock,
  Send,
  Sliders,
  Sparkles
} from "lucide-react";
import { Case } from "../types";

interface DoctorDashboardProps {
  cases: Case[];
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  onApprovePrescription: (caseId: string, prescription: any) => void;
  onDoctorMessageSent: (caseId: string, message: string) => void;
}

export function DoctorDashboard({
  cases,
  activeCaseId,
  setActiveCaseId,
  onApprovePrescription,
  onDoctorMessageSent
}: DoctorDashboardProps) {
  // Local states
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  
  // Prescription editor form states
  const [medName, setMedName] = useState<string>("");
  const [medDosage, setMedDosage] = useState<string>("");
  const [medFrequency, setMedFrequency] = useState<string>("");
  const [medMealRelation, setMedMealRelation] = useState<'before' | 'after' | 'empty'>('after');
  const [medDuration, setMedDuration] = useState<string>("");
  const [medNotes, setMedNotes] = useState<string>("");
  const [doctorSig, setDoctorSig] = useState<string>("Catherine Shaw");

  // Filter queue
  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  // Sync form states with selected case's Level 3 draft
  React.useEffect(() => {
    if (activeCase && activeCase.carePlan?.level3) {
      setMedName(activeCase.carePlan.level3.medicine || "Hydrocortisone 2.5% Ointment");
      setMedDosage(activeCase.carePlan.level3.dosage || "Apply a small pea-sized amount to the lesion");
      setMedFrequency(activeCase.carePlan.level3.frequency || "Twice daily");
      setMedMealRelation(activeCase.carePlan.level3.mealRelation || "after");
      setMedDuration(activeCase.carePlan.level3.duration || "7 days");
      setMedNotes(activeCase.carePlan.level3.specialNotes || "Wash hands thoroughly before and after application.");
    }
  }, [activeCaseId, activeCase]);

  // Sort queue: Urgent cases first, then escalated, then pending, then reviewed
  const sortedCases = [...cases].sort((a, b) => {
    const priority = (item: Case) => {
      if (item.status === 'escalated') return 4;
      if (item.severity === 'Urgent' && item.status === 'pending') return 3;
      if (item.status === 'pending') return 2;
      return 1;
    };
    return priority(b) - priority(a);
  });

  const filteredCases = sortedCases.filter(c => {
    if (queueFilter === 'pending') return c.status === 'pending' || c.status === 'escalated';
    if (queueFilter === 'reviewed') return c.status === 'reviewed';
    return true;
  });

  const handleSignPrescription = () => {
    if (!medName || !medDosage) {
      alert("Please ensure Medicine Name and Dosage fields are complete before signing.");
      return;
    }
    onApprovePrescription(activeCase.id, {
      medicine: medName,
      dosage: medDosage,
      frequency: medFrequency,
      mealRelation: medMealRelation,
      duration: medDuration,
      specialNotes: medNotes,
      doctorName: "Dr. Catherine Shaw, MD",
      doctorSignature: doctorSig
    });
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    onDoctorMessageSent(activeCase.id, chatInput.trim());
    setChatInput("");
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col min-h-[700px] shadow-2xl relative overflow-hidden">
      
      {/* Visual Header Grid */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5 mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">DermAI Clinical Dashboard</h1>
            <p className="text-xs text-slate-400">Board-Certified Dermatologist Workspace & Case Queue</p>
          </div>
        </div>

        {/* Doctor Identity Metadata Badge */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-4 py-1.5 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-300">Dermatologist On Duty: Dr. Catherine Shaw, MD</span>
        </div>
      </div>

      {/* Main clinical space grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COMPONENT: Case list queue */}
        <div className="col-span-3 flex flex-col bg-slate-950/40 border border-slate-800 rounded-2xl p-4 min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Patient Case Queue</h2>
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg">
              {(['all', 'pending', 'reviewed'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setQueueFilter(opt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                    queueFilter === opt ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Cases queue scrollbox */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredCases.length > 0 ? (
              filteredCases.map((c) => {
                const isSelected = c.id === activeCase.id;
                return (
                  <button
                    key={c.id}
                    id={`btn-queue-case-${c.id}`}
                    onClick={() => setActiveCaseId(c.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-600/5' 
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800'
                    }`}
                  >
                    {/* Urgency signal badges */}
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold text-slate-200">{c.patientName}</span>
                      <div className="flex gap-1 items-center">
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase font-mono tracking-wider ${
                          c.severity === 'Mild' ? 'bg-emerald-500/10 text-emerald-400' :
                          c.severity === 'Moderate' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/15 text-rose-400'
                        }`}>
                          {c.severity}
                        </span>
                        {c.status === 'escalated' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                      </div>
                    </div>

                    <div className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">
                      {c.textSymptom}
                    </div>

                    {/* Footer log details */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-800/60 pt-1.5 mt-0.5">
                      <span>Age: {c.patientAge} | {c.patientGender.charAt(0)}</span>
                      <span className="font-semibold text-slate-400 uppercase">
                        {c.status === 'reviewed' ? '✓ SIGNED' : c.status === 'escalated' ? '🚨 ESCALATED' : '🕒 WAITING'}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-8">No matching active cases found in the queue.</p>
            )}
          </div>
        </div>

        {/* MIDDLE COMPONENT: Case details viewer */}
        <div className="col-span-5 flex flex-col bg-slate-950/20 border border-slate-800 rounded-2xl p-5 min-h-0 overflow-y-auto pr-3 scrollbar-none space-y-4">
          
          <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">{activeCase.patientName}</h2>
              <p className="text-[11px] text-slate-400">Submitted on: {new Date(activeCase.timestamp).toLocaleString()}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
              activeCase.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {activeCase.status === 'reviewed' ? 'Reviewed' : activeCase.status === 'escalated' ? 'Urgent Escalation' : 'Awaiting Review'}
            </span>
          </div>

          {/* Skin photograph visual container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-[220px] bg-slate-950">
            <img 
              src={activeCase.photoUrl} 
              className="w-full h-full object-cover" 
              alt="Dermatological Skin Tissue" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 left-3 bg-black/60 text-[10px] text-slate-300 px-2 py-1 rounded-lg backdrop-blur-sm border border-slate-800/50">
              📸 High-Resolution Patient Upload Skin Photograph
            </div>
          </div>

          {/* Patient Metadata Card grid */}
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 font-mono">Clinical Profile</span>
              <p className="text-slate-200">Age: <span className="font-semibold text-slate-100">{activeCase.patientAge} Years</span></p>
              <p className="text-slate-200">Gender: <span className="font-semibold text-slate-100">{activeCase.patientGender}</span></p>
              <p className="text-slate-200">Preferred Language: <span className="font-semibold text-slate-100">{activeCase.language}</span></p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 font-mono">Patient Risks</span>
              <p className="text-red-400">Allergies: <span className="font-bold text-red-300">{activeCase.patientAllergies}</span></p>
              <p className="text-slate-300">Medications: <span className="font-semibold text-slate-200">{activeCase.patientMeds}</span></p>
            </div>
          </div>

          {/* Symptom questionnaire results */}
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 font-mono">Intake Questionnaire Results</h3>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500 block text-[9px]">Symptoms Duration</span>
                <span className="font-bold text-slate-200">{activeCase.duration}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">Itch/Pain Scale</span>
                <span className="font-bold text-indigo-400">{activeCase.itchScale} / 10</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">Spreading Lesion</span>
                <span className="font-bold text-slate-200">{activeCase.spreading ? "Yes" : "No"}</span>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-2.5 mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Exposure Triggers</span>
                <span className="font-medium text-slate-200">{activeCase.triggers || "None reported"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Patient Description Text</span>
                <p className="italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">"{activeCase.textSymptom}"</p>
              </div>
              {activeCase.voiceTranscription && (
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Voice Transcription Translation</span>
                  <p className="italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 text-indigo-300">"{activeCase.voiceTranscription}"</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Diagnostic Draft results */}
          <div className="p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-xl space-y-2.5">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Automatically Drafted Diagnostic Suggestion
            </span>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">{activeCase.conditions[0]?.name || "Atopic Dermatitis"}</span>
                <span className="text-indigo-400">{activeCase.conditions[0]?.confidence || 85}% Confidence</span>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-950/30 p-2.5 rounded-lg space-y-1 leading-relaxed">
                <p className="font-bold text-indigo-300">Draft Care Suggestion (Level 3):</p>
                <p>Medicine: {activeCase.carePlan?.level3?.medicine || "Corticosteroid 0.1% Cream"}</p>
                <p>Dosage: {activeCase.carePlan?.level3?.dosage || "Apply thin layer twice daily"}</p>
                <p>Frequency: {activeCase.carePlan?.level3?.frequency || "Twice daily"}</p>
                <p>Meal Timing: Take {activeCase.carePlan?.level3?.mealRelation || "after"} food</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: Video, chat and Prescription panel */}
        <div className="col-span-4 flex flex-col bg-slate-950/40 border border-slate-800 rounded-2xl p-4 min-h-0 space-y-4">
          
          {/* Live Video Call and Chat widget */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-48 shrink-0 relative">
            {isVideoActive ? (
              <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
                
                {/* Simulated Main remote stream: Patient */}
                <div className="absolute inset-0">
                  <img 
                    src={activeCase.photoUrl} 
                    className="w-full h-full object-cover blur-sm opacity-40" 
                    alt="Patient Stream" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <Video className="w-8 h-8 text-rose-500 animate-pulse mb-1" />
                    <span className="text-xs font-bold text-slate-100">Live Consult call with {activeCase.patientName}</span>
                    <span className="text-[9px] text-emerald-400">Secure Peer-to-Peer HIPAA Tunnel Connected</span>
                  </div>
                </div>

                {/* Simulated Local self-view: Doctor */}
                <div className="absolute bottom-2 right-2 w-20 h-14 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-md">
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                {/* Call controller bar */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-15">
                  <button 
                    id="btn-consult-mute-video"
                    onClick={() => setIsVideoActive(false)}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold rounded-full shadow-md"
                  >
                    Disconnect
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-2">
                <Video className="w-8 h-8 text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-white">Start Direct Video Consultation</p>
                  <p className="text-[9px] text-slate-500 leading-normal max-w-[220px]">Establish HIPAA encrypted consulting audio/video connection to finalize patient prescription.</p>
                </div>
                <button
                  id="btn-consult-start"
                  onClick={() => setIsVideoActive(true)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold shadow-md shadow-indigo-600/10"
                >
                  Connect Consult Call
                </button>
              </div>
            )}
          </div>

          {/* Chat messaging logs with patient */}
          <div className="border border-slate-850 rounded-2xl bg-slate-950/60 p-3.5 flex-1 flex flex-col min-h-0 space-y-2">
            <span className="text-[9.5px] uppercase tracking-wider font-semibold text-slate-500 font-mono shrink-0">Live Patient Correspondence</span>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
              {activeCase.chats && activeCase.chats.length > 0 ? (
                activeCase.chats.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'doctor' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-2 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'doctor' 
                        ? 'bg-rose-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-500 mt-0.5 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-500 italic text-center py-6 my-auto">No chat logs recorded.</p>
              )}
            </div>

            <div className="flex gap-1.5 shrink-0">
              <input
                id="input-doc-chat"
                type="text"
                placeholder="Reply to patient..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button
                id="btn-doc-chat-send"
                onClick={handleSendChat}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* e-Prescription Authorizer form */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shrink-0 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <PenTool className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Clinical Digital Prescription</h3>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div>
                <label className="block text-slate-400 font-semibold mb-0.5">Approved Medicine Name</label>
                <input
                  id="prescription-med"
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-0.5">Dosage / Amount</label>
                  <input
                    id="prescription-dosage"
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-0.5">Frequency</label>
                  <input
                    id="prescription-frequency"
                    type="text"
                    value={medFrequency}
                    onChange={(e) => setMedFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-0.5">Meal Offset</label>
                  <select
                    id="prescription-meal"
                    value={medMealRelation}
                    onChange={(e) => setMedMealRelation(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none"
                  >
                    <option value="after">🍽️➡️💊 After Food</option>
                    <option value="before">💊➡️🍽️ Before Food</option>
                    <option value="empty">⏰ Empty Stomach</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-0.5">Treatment Duration</label>
                  <input
                    id="prescription-duration"
                    type="text"
                    value={medDuration}
                    onChange={(e) => setMedDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-0.5">Clinical Notes & Administration Warnings</label>
                <input
                  id="prescription-notes"
                  type="text"
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              {/* Digital Clinical Signature Pad field */}
              <div>
                <label className="block text-slate-400 font-semibold mb-0.5">Physician Electronic Signature (E-Sign Name)</label>
                <div className="flex gap-2">
                  <input
                    id="prescription-sig"
                    type="text"
                    value={doctorSig}
                    onChange={(e) => setDoctorSig(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-white focus:outline-none font-cursive italic text-[13px] text-rose-400"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-prescription-sign"
              onClick={handleSignPrescription}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Approve, E-Sign & Lock Case Plan
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
