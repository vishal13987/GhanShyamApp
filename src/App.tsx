import React, { useState, useEffect } from "react";
import { PhoneSimulator } from "./components/PhoneSimulator";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { Case } from "./types";
import { Activity, ShieldCheck, Sparkles, HelpCircle, Laptop } from "lucide-react";

export default function App() {
  // Shared full-stack case logs state
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Split View Controller: toggling between Mobile Simulator and Widescreen Hospital Portal
  const [currentView, setCurrentView] = useState<'mobile' | 'doctor'>('mobile');

  // Load patient logs from Node Express backend on mount
  useEffect(() => {
    fetchCases();
    
    // Quick polling to simulate live web socket updates so prescription approvals update instantly
    const interval = setInterval(fetchCases, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch("/api/cases");
      if (!response.ok) throw new Error("Backend offline");
      const data = await response.json();
      setCases(data);
      if (data.length > 0 && !activeCaseId) {
        setActiveCaseId(data[0].id);
      }
    } catch (err) {
      console.error("Error connecting to Express cases endpoint:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Callback when patient submits a brand new skin issue case
  const handleNewCaseSubmitted = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
  };

  // Callback when Doctor approves/edits prescription
  const handleApprovePrescription = async (caseId: string, prescriptionDetails: any) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/prescription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionDetails)
      });
      if (!response.ok) throw new Error("Failed to sign prescription");
      const updatedCase = await response.json();
      
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));
      alert(`Prescription for ${updatedCase.patientName} e-signed and approved! Digital PDF created and synchronization with patient schedule active.`);
    } catch (err) {
      console.error("Prescription approval error:", err);
    }
  };

  // Callback when a patient logs progress check-in
  const handleCheckInSubmitted = async (caseId: string, status: 'improving' | 'no-change' | 'worse', photoUrl: string, notes: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, photoUrl, notes })
      });
      if (!response.ok) throw new Error("Failed to submit progress check-in");
      const updatedCase = await response.json();
      
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));
      
      if (status === "worse" || status === "no-change") {
        alert("Alert: No visual improvement reported. The diagnostic has been auto-escalated to Tier 3 Doctor Queue for high-priority live review.");
      } else {
        alert("Daily chronological log logged. Swipe the comparison slider to analyze progress.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Correspondence chat callbacks
  const handlePatientMessageSent = async (caseId: string, text: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "patient", text })
      });
      const updatedCase = await response.json();
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDoctorMessageSent = async (caseId: string, text: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "doctor", text })
      });
      const updatedCase = await response.json();
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] bg-gradient-to-tr from-[#020617] via-[#0b1329] to-[#020617] text-slate-100 flex flex-col font-sans">
      
      {/* Dynamic Navigation Header */}
      <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">SkinSense Console</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.2 rounded font-mono">v1.2.0</span>
            </div>
            <p className="text-[10px] text-slate-400">AI-Powered Multi-Tier Clinical Dermatology Workspace</p>
          </div>
        </div>

        {/* Unified View Toggle Selector */}
        <div className="flex bg-slate-900 border border-slate-850 p-1.5 rounded-2xl gap-2">
          <button
            id="toggle-view-mobile"
            onClick={() => setCurrentView('mobile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentView === 'mobile' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📱 Simulate Patient App
          </button>
          <button
            id="toggle-view-doctor"
            onClick={() => setCurrentView('doctor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentView === 'doctor' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👩‍⚕️ Simulate Doctor Portal
          </button>
        </div>

        {/* Security Shield Indicator */}
        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-mono">SSL Secure Connection</span>
        </div>
      </header>

      {/* Main split work canvas */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-7xl w-full mx-auto">
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-semibold font-mono">Securing Cloud Run Connection...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center">
            
            {/* Quick Interactive Workspace Guide */}
            <div className="w-full max-w-4xl bg-slate-900/30 border border-slate-850/60 p-4 rounded-2xl mb-6 text-xs flex justify-between items-center gap-4">
              <div className="flex gap-2.5 items-start">
                <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-100">DermAI Clinical Sandbox Guide</p>
                  <p className="text-slate-400 leading-normal">
                    This workspace simulates both the **SkinSense Patient Mobile App** and the **Clinician Web Dashboard** simultaneously. Submit a skin case in the mobile app, and watch it appear instantly in the Doctor's dashboard case queue. Edit and sign the prescription as the Doctor, and see the patient's mobile app reminders automatically schedule!
                  </p>
                </div>
              </div>
              <div className="hidden md:flex gap-1.5 shrink-0 bg-slate-900 px-3 py-1.5 border border-slate-800 rounded-xl font-mono text-[10px] font-bold text-slate-300">
                <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dual Sandbox Syncing Active</span>
              </div>
            </div>

            {/* Render selected view */}
            <div className="w-full flex justify-center items-start animate-fade-in">
              {currentView === 'mobile' ? (
                <div className="w-full flex justify-center">
                  <PhoneSimulator 
                    cases={cases}
                    onNewCaseSubmitted={handleNewCaseSubmitted}
                    onCheckInSubmitted={handleCheckInSubmitted}
                    onPatientMessageSent={handlePatientMessageSent}
                    activeCaseId={activeCaseId}
                    setActiveCaseId={setActiveCaseId}
                  />
                </div>
              ) : (
                <div className="w-full">
                  <DoctorDashboard 
                    cases={cases}
                    activeCaseId={activeCaseId}
                    setActiveCaseId={setActiveCaseId}
                    onApprovePrescription={handleApprovePrescription}
                    onDoctorMessageSent={handleDoctorMessageSent}
                  />
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Hospital System Footer */}
      <footer className="border-t border-slate-950 bg-slate-950/40 py-4 px-6 text-center text-[10px] text-slate-500 font-mono flex flex-col md:flex-row justify-between items-center gap-2 shrink-0">
        <p>© 2026 SkinSense Clinical Technologies Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <span>HIPAA Compliance Certified</span>
          <span>●</span>
          <span>GDPR Encrypted Vault</span>
          <span>●</span>
          <span>Google Workspace Cloud Grounding</span>
        </div>
      </footer>

    </div>
  );
}
