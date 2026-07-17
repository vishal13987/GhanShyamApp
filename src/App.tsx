import React, { useState, useEffect } from "react";
import { PhoneSimulator } from "./components/PhoneSimulator";
import { Case } from "./types";
import { Activity, ShieldCheck, Sparkles, HelpCircle, Smartphone } from "lucide-react";

export default function App() {
  // Shared full-stack case logs state
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load patient logs from Node Express backend on mount
  useEffect(() => {
    fetchCases();
    
    // Quick polling to simulate live updates so prescription approvals update instantly
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

  // Correspondence chat callbacks with auto-doctor-response simulation
  const handlePatientMessageSent = async (caseId: string, text: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "patient", text })
      });
      const updatedCase = await response.json();
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));

      // Simulate clinical reply from the physician shortly after
      setTimeout(async () => {
        try {
          const doctorReplies = [
            "Hello, I am reviewing your case now. Please apply the Level 2 OTC cream as directed in the meantime.",
            "I have examined your skin photographs. I will sign and approve your clinical prescription details shortly.",
            "Please log daily check-ins on the tracker tab so we can check if it is improving over the next 3 days.",
            "Understood. If you feel any sudden warmth, fever, or the rash spreads rapidly, proceed to the nearest clinic.",
            "I have signed and approved your customized Tier 3 prescription. Please view the updated schedule in your reminders tab!"
          ];
          const randomReply = doctorReplies[Math.floor(Math.random() * doctorReplies.length)];
          const docResponse = await fetch(`/api/cases/${caseId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: "doctor", text: randomReply })
          });
          const latestCase = await docResponse.json();
          setCases(prev => prev.map(c => c.id === caseId ? latestCase : c));
        } catch (chatErr) {
          console.error("Auto doctor reply error:", chatErr);
        }
      }, 1500);

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
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.2 rounded font-mono">v1.3.0</span>
            </div>
            <p className="text-[10px] text-slate-400">AI-Powered Multi-Tier Clinical Dermatology Workspace</p>
          </div>
        </div>

        {/* Brand App badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300">
          <Smartphone className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Patient App Simulator Mode</span>
        </div>

        {/* Security Shield Indicator */}
        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-mono">SSL Secure Connection</span>
        </div>
      </header>

      {/* Main work canvas */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-7xl w-full mx-auto">
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-semibold font-mono">Securing Cloud Run Connection...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center">
            
            {/* Quick Interactive Workspace Guide */}
            <div className="w-full max-w-xl bg-slate-900/30 border border-slate-850/60 p-4 rounded-2xl mb-6 text-xs flex justify-between items-center gap-4">
              <div className="flex gap-2.5 items-start">
                <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-100">SkinSense Sandbox Guide</p>
                  <p className="text-slate-400 leading-normal">
                    Submit a skin test in the mobile app below. You can simulate direct chat messages with our dermatologist, trigger **Simulated Physician Approvals** on prescriptions to unlock the smart dosing schedule, and track healing over time.
                  </p>
                </div>
              </div>
            </div>

            {/* Render Patient Simulator */}
            <div className="w-full flex justify-center items-start animate-fade-in">
              <div className="w-full flex justify-center">
                <PhoneSimulator 
                  cases={cases}
                  onNewCaseSubmitted={handleNewCaseSubmitted}
                  onCheckInSubmitted={handleCheckInSubmitted}
                  onPatientMessageSent={handlePatientMessageSent}
                  onApprovePrescription={handleApprovePrescription}
                  activeCaseId={activeCaseId}
                  setActiveCaseId={setActiveCaseId}
                />
              </div>
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
