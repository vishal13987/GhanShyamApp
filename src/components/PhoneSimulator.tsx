import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Video, 
  Mic, 
  FileText, 
  User, 
  Activity, 
  MapPin, 
  Bell, 
  Sliders, 
  CheckCircle, 
  ShieldAlert, 
  Upload, 
  Smartphone, 
  Wifi, 
  Battery, 
  Sparkles, 
  TrendingUp, 
  Phone, 
  Clock, 
  Navigation, 
  Star, 
  CreditCard, 
  ArrowRight,
  Send,
  Volume2
} from "lucide-react";
import { Case, Reminder, PharmacyClinic } from "../types";
import { translations, languages } from "../translations";

// Sample dermatological test gallery
const SAMPLE_PHOTOS = [
  {
    name: "Dry Eczema Patch",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Dry, scaly patch on my wrist that has been itching intensely, especially during dry weather."
  },
  {
    name: "Acute Plant Rash",
    url: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=400&auto=format&fit=crop&q=80",
    description: "Fierce red spots with tiny weeping blisters that showed up on my calf after weeding the garden."
  },
  {
    name: "Sunburn / Heat Rash",
    url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&auto=format&fit=crop&q=80",
    description: "Mild burning red rash on my shoulders after spending hours in the direct summer sun."
  }
];

const MOCK_LOCATIONS: PharmacyClinic[] = [
  {
    id: "loc-1",
    name: "Apex Clinical Dermatology",
    type: "clinic",
    distance: "1.2 miles",
    rating: 4.8,
    openNow: true,
    phone: "+1 (555) 019-2834",
    address: "742 Evergreen Terrace, Medical District",
    delivery: false,
    coords: { lat: 40, lng: 50 }
  },
  {
    id: "loc-2",
    name: "CareFirst 24/7 Pharmacy",
    type: "pharmacy",
    distance: "0.4 miles",
    rating: 4.6,
    openNow: true,
    phone: "+1 (555) 014-9921",
    address: "109 Medical Center Parkway",
    delivery: true,
    coords: { lat: 45, lng: 55 }
  },
  {
    id: "loc-3",
    name: "Metro Skin Institute & Hospital",
    type: "clinic",
    distance: "3.5 miles",
    rating: 4.9,
    openNow: false,
    phone: "+1 (555) 012-3300",
    address: "900 Broadway Ave, Dermatology Wing",
    delivery: false,
    coords: { lat: 38, lng: 48 }
  },
  {
    id: "loc-4",
    name: "DermRx Express & Compounds",
    type: "pharmacy",
    distance: "1.8 miles",
    rating: 4.4,
    openNow: true,
    phone: "+1 (555) 018-7744",
    address: "410 Oak Lane, Near Metro Station",
    delivery: true,
    coords: { lat: 42, lng: 52 }
  }
];

interface PhoneSimulatorProps {
  cases: Case[];
  onNewCaseSubmitted: (newCase: Case) => void;
  onCheckInSubmitted: (caseId: string, status: 'improving' | 'no-change' | 'worse', photoUrl: string, notes: string) => void;
  onPatientMessageSent: (caseId: string, message: string) => void;
  onApprovePrescription?: (caseId: string, prescription: any) => void;
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
}

export function PhoneSimulator({
  cases,
  onNewCaseSubmitted,
  onCheckInSubmitted,
  onPatientMessageSent,
  onApprovePrescription,
  activeCaseId,
  setActiveCaseId
}: PhoneSimulatorProps) {
  // Mobile app navigation state
  const [screen, setScreen] = useState<string>("splash");
  const [langCode, setLangCode] = useState<string>("en");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<boolean>(false);
  const [profile, setProfile] = useState({
    name: "Ayla Vance",
    age: "28",
    gender: "Female",
    allergies: "Penicillin, Strawberries",
    meds: "Daily Multivitamin",
    sleepTime: "22:30",
    mealTime: "08:00,12:30,19:00"
  });

  // Multimodal symptom capture state
  const [photo, setPhoto] = useState<string>("");
  const [videoFile, setVideoFile] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [voiceFile, setVoiceFile] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voicePlayback, setVoicePlayback] = useState<boolean>(false);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [voiceTrans, setVoiceTrans] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [textSymptom, setTextSymptom] = useState<string>("");
  const [duration, setDuration] = useState<string>("3 days");
  const [itchScale, setItchScale] = useState<number>(5);
  const [spreading, setSpreading] = useState<boolean>(false);
  const [triggers, setTriggers] = useState<string>("");

  // AI analysis wait trigger
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Maps / Location filters
  const [mapFilter, setMapFilter] = useState<'all' | 'pharmacy' | 'clinic'>('all');
  const [mapOpenNow, setMapOpenNow] = useState<boolean>(false);
  const [mapDelivery, setMapDelivery] = useState<boolean>(false);
  const [selectedMapItem, setSelectedMapItem] = useState<PharmacyClinic | null>(MOCK_LOCATIONS[0]);

  // Photo slider value
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check-in state
  const [checkInStatus, setCheckInStatus] = useState<'improving' | 'no-change' | 'worse'>('improving');
  const [checkInNotes, setCheckInNotes] = useState<string>("");
  const [checkInPhoto, setCheckInPhoto] = useState<string>("");

  // Chat message input
  const [chatInput, setChatInput] = useState<string>("");

  // Monetization level state
  const [premiumPlan, setPremiumPlan] = useState<'free' | 'paid'>('free');

  // Adherence calendar tracking
  const [takenReminders, setTakenReminders] = useState<string[]>([]);
  const [streak, setStreak] = useState<number>(4);

  // Dynamic localization variables
  const t = translations[langCode] || translations["en"];
  const isRtl = languages.find(l => l.code === langCode)?.dir === "rtl";

  // Auto load active cases if available
  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  // Helper simulated voice audio visualizer lines
  const [waveform, setWaveform] = useState<number[]>([10, 20, 15, 30, 25, 45, 12, 18, 32, 10]);

  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setWaveform(prev => prev.map(() => Math.floor(Math.random() * 35) + 5));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceDuration(v => v + 1);
      }, 1000);
    } else {
      setVoiceDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Video recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVideo) {
      interval = setInterval(() => {
        setVideoDuration(v => {
          if (v >= 30) {
            setIsRecordingVideo(false);
            return 30;
          }
          return v + 1;
        });
      }, 1000);
    } else {
      setVideoDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVideo]);

  const handleStartVoiceRecord = () => {
    setIsRecordingVoice(true);
    setVoiceFile(false);
    setVoiceTrans("");
  };

  const handleStopVoiceRecord = async () => {
    setIsRecordingVoice(false);
    setVoiceFile(true);
    setIsTranscribing(true);

    // Call voice to text translator simulator
    try {
      const response = await fetch("/api/voice-to-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceDescription: textSymptom || "Severe itch on wrist spreading rapidly",
          language: langCode === "ar" ? "العربية" : "English"
        })
      });
      const data = await response.json();
      setVoiceTrans(data.originalText);
      setTextSymptom(prev => prev ? `${prev}\n[Transcribed Voice]: ${data.englishTranslation}` : `[Transcribed Voice]: ${data.englishTranslation}`);
    } catch (e) {
      console.error(e);
      setVoiceTrans("A red dry circular patch that is burning when scratched.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStartVideoRecord = () => {
    setIsRecordingVideo(true);
    setVideoFile(false);
  };

  const handleStopVideoRecord = () => {
    setIsRecordingVideo(false);
    setVideoFile(true);
  };

  // Submit diagnostic payload to server API (Gemini orFallback)
  const handleAnalyzeSymptom = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textSymptom: textSymptom || "Unknown skin irritation",
          itchScale,
          duration,
          spreading,
          triggers,
          language: langCode === "ar" ? "العربية" : "English",
          photoBase64: photo.startsWith("data:") ? photo : null
        })
      });

      const analysisResult = await response.json();

      // Create case payload
      const casePayload = {
        patientName: profile.name,
        patientAge: parseInt(profile.age) || 28,
        patientGender: profile.gender,
        patientAllergies: profile.allergies,
        patientMeds: profile.meds,
        patientSleepTime: profile.sleepTime,
        patientMealTime: profile.mealTime,
        language: langCode === "ar" ? "العربية" : "English",
        photoUrl: photo || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        videoUrl: videoFile ? "Simulated Skin Movement Clip (22s)" : undefined,
        voiceTranscription: voiceFile ? voiceTrans || "Simulated Voice description text" : undefined,
        textSymptom: textSymptom || "Intense skin itching and rash.",
        duration,
        itchScale,
        spreading,
        triggers,
        analysisResult
      };

      const submitRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(casePayload)
      });
      
      const newCaseObj = await submitRes.json();
      onNewCaseSubmitted(newCaseObj);
      setActiveCaseId(newCaseObj.id);

      // If condition is classified as URGENT, auto route straight to Clinical map screen!
      if (analysisResult.severity === "Urgent") {
        setScreen("locator");
      } else {
        setScreen("results");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Drag slider calculations for visual comparison
  const handleTouchSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  // Generate automated timing list based on active Level 2/3 and profile settings
  const getSimulatedReminders = (): Reminder[] => {
    if (!activeCase) return [];
    const list: Reminder[] = [];
    const mealTimes = profile.mealTime.split(",");
    
    // Level 2 OTC Medicine reminders
    if (activeCase.carePlan?.level2) {
      list.push({
        id: "rem-otc-1",
        caseId: activeCase.id,
        medicineName: activeCase.carePlan.level2.medicine,
        time: "08:30",
        mealRelation: "after",
        status: takenReminders.includes("rem-otc-1") ? "taken" : "pending",
        date: "2026-07-16"
      });
      list.push({
        id: "rem-otc-2",
        caseId: activeCase.id,
        medicineName: activeCase.carePlan.level2.medicine,
        time: "19:30",
        mealRelation: "after",
        status: takenReminders.includes("rem-otc-2") ? "taken" : "pending",
        date: "2026-07-16"
      });
    }

    // Level 3 Prescribed Medicine reminders (If Signed)
    if (activeCase.carePlan?.level3 && activeCase.carePlan.level3.isSigned) {
      const relation = activeCase.carePlan.level3.mealRelation;
      
      // Map to breakfast (08:00), lunch (12:30), dinner (19:00) with proper timing offset
      let morningTime = relation === "before" ? "07:30" : relation === "after" ? "08:30" : "10:00";
      let eveningTime = relation === "before" ? "18:30" : relation === "after" ? "19:30" : "16:00";

      list.push({
        id: "rem-rx-1",
        caseId: activeCase.id,
        medicineName: activeCase.carePlan.level3.medicine,
        time: morningTime,
        mealRelation: relation,
        status: takenReminders.includes("rem-rx-1") ? "taken" : "pending",
        date: "2026-07-16"
      });
      list.push({
        id: "rem-rx-2",
        caseId: activeCase.id,
        medicineName: activeCase.carePlan.level3.medicine,
        time: eveningTime,
        mealRelation: relation,
        status: takenReminders.includes("rem-rx-2") ? "taken" : "pending",
        date: "2026-07-16"
      });
    }

    return list;
  };

  const handleToggleReminder = (remId: string) => {
    if (takenReminders.includes(remId)) {
      setTakenReminders(prev => prev.filter(id => id !== remId));
    } else {
      setTakenReminders(prev => [...prev, remId]);
      setStreak(s => s + 1);
    }
  };

  const handleSendChatText = () => {
    if (!chatInput.trim()) return;
    onPatientMessageSent(activeCase.id, chatInput.trim());
    setChatInput("");
  };

  const handleAddProgressCheckIn = () => {
    onCheckInSubmitted(
      activeCase.id, 
      checkInStatus, 
      checkInPhoto || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
      checkInNotes || "Checking in."
    );
    setCheckInNotes("");
    setCheckInPhoto("");
    setScreen("progress");
  };

  // Simulate file upload or capture
  const handleSimulatedGalleryImage = (sample: typeof SAMPLE_PHOTOS[0]) => {
    setPhoto(sample.url);
    setTextSymptom(sample.description);
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-950/60 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Immersive Phone Frame Design */}
      <div className="relative w-[385px] h-[780px] bg-black rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[12px] border-slate-900 flex flex-col overflow-hidden select-none">
        
        {/* Notch / Speaker Sensor */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1"></div>
          <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full mb-1 ml-2 border border-neutral-800"></div>
        </div>

        {/* Status Bar */}
        <div className="h-10 px-6 pt-2 flex justify-between items-center text-xs text-white bg-black/40 z-40">
          <div className="font-semibold">9:41 AM</div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-tight bg-slate-800 text-slate-300 px-1 py-0.2 rounded">5G</span>
            <Battery className="w-4 h-4 text-emerald-500 fill-emerald-500" />
          </div>
        </div>

        {/* Dynamic Phone Screens */}
        <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col overflow-y-auto overflow-x-hidden relative scrollbar-none" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          
          {/* SCREEN: Splash screen */}
          {screen === "splash" && (
            <div className="flex-1 flex flex-col justify-between items-center px-6 py-12 text-center bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900">
              <div className="my-auto flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 animate-pulse">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white font-sans mb-2">SkinSense</h1>
                <p className="text-slate-400 text-sm max-w-[240px]">AI-Powered Multilingual Skin Health Companion</p>
                
                {/* Visual Signal Indicator */}
                <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold font-mono">Core AI Connected</span>
                </div>
              </div>
              
              <button 
                id="btn-splash-start"
                onClick={() => setScreen("lang-select")}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SCREEN: Language Picker */}
          {screen === "lang-select" && (
            <div className="flex-1 flex flex-col justify-between px-6 py-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{t.pickLanguage}</h2>
                <p className="text-xs text-slate-400 mb-6">Choose your primary language. The app interface, AI summaries, and doctor logs will localize automatically.</p>
                
                <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {languages.map((l) => (
                    <button
                      id={`lang-${l.code}`}
                      key={l.code}
                      onClick={() => setLangCode(l.code)}
                      className={`py-3 px-4 rounded-xl text-sm font-medium border text-left flex justify-between items-center transition-all ${
                        langCode === l.code 
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                          : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{l.name}</span>
                      {langCode === l.code && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-lang-continue"
                onClick={() => setScreen("consent")}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-1"
              >
                {t.agreeBtn.split(" ")[0]} & Continue
              </button>
            </div>
          )}

          {/* SCREEN: Consent Form */}
          {screen === "consent" && (
            <div className="flex-1 flex flex-col justify-between px-6 py-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t.welcomeConsent}</h2>
                </div>

                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 text-xs leading-relaxed text-slate-300 max-h-[380px] overflow-y-auto">
                  <p className="mb-3 font-semibold text-amber-400">⚠️ IMPORTANT MEDICAL NOTICE</p>
                  <p className="mb-4">{t.consentText}</p>
                  <p className="mb-3 font-semibold text-indigo-400">HIPAA & GDPR Compliance Shield</p>
                  <p className="text-[11px] text-slate-400">
                    All photo streams, video logs, and vocal logs are instantly encrypted at rest and in transit via SHA-256 protocols. Your medical data remains completely secure and is accessible only to you and licensed board-certified dermatologists evaluating your case in our portal.
                  </p>
                </div>
              </div>

              <button
                id="btn-consent-agree"
                onClick={() => setScreen("login")}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-sm shadow-md"
              >
                {t.agreeBtn}
              </button>
            </div>
          )}

          {/* SCREEN: Phone OTP Login */}
          {screen === "login" && (
            <div className="flex-1 flex flex-col justify-between px-6 py-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{t.phoneLogin}</h2>
                <p className="text-xs text-slate-400 mb-6">Sign up or verify your clinic profile securely via Phone OTP.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">{t.enterPhone}</label>
                    <div className="flex gap-2">
                      <span className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 font-medium flex items-center">+1</span>
                      <input
                        id="input-login-phone"
                        type="tel"
                        placeholder="(555) 019-2834"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div className="animate-fade-in space-y-2">
                      <label className="block text-xs text-slate-400 font-medium mb-1">{t.enterOTP}</label>
                      <input
                        id="input-login-otp"
                        type="text"
                        placeholder="777888"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-center text-white font-mono tracking-widest focus:outline-none focus:border-indigo-500"
                      />
                      {otpError && (
                        <p className="text-[11px] text-red-400 font-medium">Invalid verification code. Please enter code '777888'.</p>
                      )}
                      <div className="p-3 bg-indigo-950/30 border border-indigo-900/30 rounded-xl">
                        <p className="text-[11px] text-indigo-300 leading-relaxed font-sans">{t.otpSentMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!otpSent ? (
                <button
                  id="btn-login-send"
                  disabled={!phone}
                  onClick={() => setOtpSent(true)}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                    phone ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {t.sendOTP}
                </button>
              ) : (
                <button
                  id="btn-login-verify"
                  onClick={() => {
                    if (otp === "777888") {
                      setScreen("profile");
                    } else {
                      setOtpError(true);
                    }
                  }}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-sm"
                >
                  {t.verifyBtn}
                </button>
              )}
            </div>
          )}

          {/* SCREEN: Profile Setup */}
          {screen === "profile" && (
            <div className="flex-1 flex flex-col justify-between px-6 py-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">{t.profileSetup}</h2>
                </div>

                <div className="space-y-3 text-xs overflow-y-auto max-h-[460px] pr-1">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">{t.fullName}</label>
                    <input
                      id="profile-name"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">{t.age}</label>
                      <input
                        id="profile-age"
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">{t.gender}</label>
                      <select
                        id="profile-gender"
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">{t.allergies}</label>
                    <input
                      id="profile-allergies"
                      type="text"
                      placeholder={t.allergiesPlaceholder}
                      value={profile.allergies}
                      onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">{t.currentMeds}</label>
                    <input
                      id="profile-meds"
                      type="text"
                      placeholder={t.currentMedsPlaceholder}
                      value={profile.meds}
                      onChange={(e) => setProfile({ ...profile, meds: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">{t.sleepTime}</label>
                    <input
                      id="profile-sleep"
                      type="time"
                      value={profile.sleepTime}
                      onChange={(e) => setProfile({ ...profile, sleepTime: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">{t.mealTime}</label>
                    <input
                      id="profile-meals"
                      type="text"
                      value={profile.mealTime}
                      onChange={(e) => setProfile({ ...profile, mealTime: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                id="btn-profile-save"
                onClick={() => setScreen("symptoms-input")}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-xs"
              >
                {t.saveProfile}
              </button>
            </div>
          )}

          {/* SCREEN: Symptom Intake Capture Portal */}
          {screen === "symptoms-input" && (
            <div className="flex-1 flex flex-col justify-between px-5 py-5 space-y-4">
              <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">{t.symptomTitle}</h2>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">Case #{cases.length + 1}</span>
                </div>

                {/* Test Gallery Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-slate-400 font-semibold tracking-wide">🔬 Try Skin Test Gallery</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SAMPLE_PHOTOS.map((sample, idx) => (
                      <button
                        key={idx}
                        id={`btn-sample-skin-${idx}`}
                        onClick={() => handleSimulatedGalleryImage(sample)}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          photo === sample.url 
                            ? 'bg-indigo-600/30 border-indigo-500' 
                            : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <img src={sample.url} className="w-full h-10 object-cover rounded-md mb-1" alt={sample.name} referrerPolicy="no-referrer" />
                        <span className="text-[9px] text-slate-300 font-medium truncate block">{sample.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multimodal input grid: Photo + Video */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Photo upload / capture simulator */}
                  <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center relative overflow-hidden group">
                    {photo ? (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden mb-1.5">
                        <img src={photo} className="w-full h-full object-cover" alt="Patient Skin" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => setPhoto("")}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black text-[9px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 flex flex-col justify-center items-center">
                        <Camera className="w-8 h-8 text-indigo-400 mb-1" />
                        <span className="text-[11px] font-semibold text-slate-200">{t.capturePhoto}</span>
                        <span className="text-[8px] text-slate-500 leading-tight mt-0.5 px-2">Tips: closer, bright light</span>
                      </div>
                    )}
                    <label className="w-full mt-auto">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setPhoto(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <span className="w-full py-1 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 border border-indigo-500/20">
                        <Upload className="w-3 h-3" /> Upload
                      </span>
                    </label>
                  </div>

                  {/* Video movement capture simulator */}
                  <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center justify-between">
                    <div className="flex flex-col items-center my-auto">
                      <Video className={`w-8 h-8 mb-1 ${isRecordingVideo ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
                      <span className="text-[11px] font-semibold text-slate-200">{t.recordVideo.split(" ")[0]} Movement</span>
                      {isRecordingVideo ? (
                        <span className="text-[9px] text-red-400 font-mono mt-0.5">00:{videoDuration.toString().padStart(2, '0')}s / 30s</span>
                      ) : videoFile ? (
                        <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">✓ Video Captured</span>
                      ) : (
                        <span className="text-[8px] text-slate-500 leading-tight mt-0.5">Slowly rotate camera</span>
                      )}
                    </div>
                    
                    {!isRecordingVideo ? (
                      <button 
                        id="btn-record-video-start"
                        onClick={handleStartVideoRecord}
                        className="w-full py-1 bg-indigo-600/20 text-indigo-300 text-[10px] font-bold rounded-lg border border-indigo-500/20"
                      >
                        {videoFile ? "Record Again" : "Start Video"}
                      </button>
                    ) : (
                      <button 
                        id="btn-record-video-stop"
                        onClick={handleStopVideoRecord}
                        className="w-full py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg"
                      >
                        Stop Recording
                      </button>
                    )}
                  </div>
                </div>

                {/* Voice Input capture simulator with active SVG audio wave visualizer */}
                <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Mic className={`w-4 h-4 ${isRecordingVoice ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
                      <span className="text-xs font-semibold text-slate-200">{t.voiceNote}</span>
                    </div>
                    {voiceFile && !isRecordingVoice && (
                      <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">✓ Transcribed</span>
                    )}
                  </div>

                  {isRecordingVoice ? (
                    <div className="flex flex-col items-center space-y-1.5 py-1.5 bg-red-950/20 border border-red-900/10 rounded-xl">
                      {/* Interactive Waveform Grid */}
                      <div className="flex items-center gap-1.5 h-10 px-6">
                        {waveform.map((h, i) => (
                          <div 
                            key={i} 
                            style={{ height: `${h}px` }} 
                            className="w-1 bg-red-500 rounded-full transition-all duration-150"
                          ></div>
                        ))}
                      </div>
                      <span className="text-[10px] text-red-400 font-mono">Recording Voice... 00:{voiceDuration.toString().padStart(2, '0')}s</span>
                    </div>
                  ) : isTranscribing ? (
                    <div className="p-3 bg-slate-900/60 rounded-xl flex items-center gap-2 justify-center">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] text-indigo-300">{t.transcribing}</span>
                    </div>
                  ) : voiceTrans ? (
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">Original Audio Transcript ({langCode.toUpperCase()})</p>
                      <p className="text-xs italic text-indigo-200 leading-normal">"{voiceTrans}"</p>
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-500">{t.voiceTip}</p>
                  )}

                  <div className="flex gap-2">
                    {!isRecordingVoice ? (
                      <button
                        id="btn-voice-record-start"
                        onClick={handleStartVoiceRecord}
                        className="flex-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-bold rounded-xl border border-indigo-500/20 flex items-center justify-center gap-1"
                      >
                        <Mic className="w-3 h-3" /> Hold & Record description
                      </button>
                    ) : (
                      <button
                        id="btn-voice-record-stop"
                        onClick={handleStopVoiceRecord}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1"
                      >
                        Stop & Transcribe with AI
                      </button>
                    )}
                  </div>
                </div>

                {/* Text Intake Form */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{t.howLong}</label>
                    <input
                      id="input-symptom-duration"
                      type="text"
                      placeholder="e.g., 3 days, 2 weeks"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex justify-between">
                      <span>{t.itchScale}</span>
                      <span className="text-indigo-400 font-bold font-mono text-[13px]">{itchScale} / 10</span>
                    </label>
                    <input
                      id="input-symptom-itch"
                      type="range"
                      min={1}
                      max={10}
                      value={itchScale}
                      onChange={(e) => setItchScale(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 px-1 mt-0.5 font-mono">
                      <span>1 (Mild)</span>
                      <span>5 (Medium)</span>
                      <span>10 (Severe)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.isSpreading}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="btn-symptom-spreading-yes"
                        onClick={() => setSpreading(true)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                          spreading ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {t.yes}
                      </button>
                      <button
                        id="btn-symptom-spreading-no"
                        onClick={() => setSpreading(false)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                          !spreading ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {t.no}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{t.triggers}</label>
                    <input
                      id="input-symptom-triggers"
                      type="text"
                      placeholder={t.triggersPlaceholder}
                      value={triggers}
                      onChange={(e) => setTriggers(e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{t.notesLabel} (Symptom Text Box)</label>
                    <textarea
                      id="input-symptom-text"
                      placeholder="Type details about the spot, color, irritation triggers..."
                      rows={3}
                      value={textSymptom}
                      onChange={(e) => setTextSymptom(e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <button
                id="btn-symptom-submit"
                disabled={isAnalyzing}
                onClick={handleAnalyzeSymptom}
                className={`w-full py-3 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isAnalyzing 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t.submitCase}
                  </>
                )}
              </button>
            </div>
          )}

          {/* SCREEN: AI Diagnostic Results & Care Plan */}
          {screen === "results" && activeCase && (
            <div className="flex-1 flex flex-col justify-between px-5 py-5 space-y-4">
              <div className="space-y-4 overflow-y-auto max-h-[580px] pr-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-white flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {t.resultsTitle}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    activeCase.severity === 'Mild' ? 'bg-emerald-500/10 text-emerald-400' :
                    activeCase.severity === 'Moderate' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {activeCase.severity}
                  </span>
                </div>

                {/* Conditions Confidence list */}
                <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-2xl space-y-2.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">Predicted Skin Conditions</span>
                  <div className="space-y-2">
                    {activeCase.conditions.map((c, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-200">{c.name}</span>
                          <span className="text-indigo-400 font-bold">{c.confidence}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            style={{ width: `${c.confidence}%` }} 
                            className="bg-indigo-500 h-full rounded-full"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Disclaimer Block */}
                <div className="p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-400 leading-normal italic">{t.disclaimer}</p>
                </div>

                {/* Care Guidance Tiers Accordion style */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">{t.carePlanTitle}</h3>

                  {/* TIER 1 Care details */}
                  <div className="bg-emerald-950/10 border border-emerald-900/30 p-3.5 rounded-2xl space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t.level1Title}
                    </span>
                    <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-1 leading-relaxed">
                      {activeCase.carePlan?.level1.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* TIER 2 OTC guidance details */}
                  {activeCase.carePlan?.level2 && (
                    <div className="bg-amber-950/10 border border-amber-900/30 p-3.5 rounded-2xl space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        {t.level2Title}
                      </span>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-200">{activeCase.carePlan.level2.medicine}</p>
                        <p className="text-[11px] text-slate-300 leading-normal">{activeCase.carePlan.level2.instructions}</p>
                        <p className="text-[9px] text-amber-400 leading-relaxed italic border-t border-amber-900/10 pt-1 mt-1">{activeCase.carePlan.level2.disclaimer}</p>
                      </div>
                    </div>
                  )}

                  {/* TIER 3 Prescribed Care details (Approved vs Pending Doctor) */}
                  <div className="bg-indigo-950/10 border border-indigo-900/30 p-3.5 rounded-2xl space-y-1.5">
                    <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {t.level3Title}
                    </span>

                    {activeCase.carePlan?.level3?.isSigned ? (
                      <div className="space-y-2.5">
                        <div className="space-y-1 border-b border-indigo-900/20 pb-2">
                          <p className="text-[11px] font-bold text-slate-100 flex justify-between">
                            <span>{activeCase.carePlan.level3.medicine}</span>
                            <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.2 rounded uppercase">Approved</span>
                          </p>
                          <p className="text-[11px] text-slate-300">Dosage: {activeCase.carePlan.level3.dosage}</p>
                          <p className="text-[11px] text-slate-300">Frequency: {activeCase.carePlan.level3.frequency}</p>
                          <p className="text-[11px] text-slate-300 flex items-center gap-1 capitalize">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            Take: {activeCase.carePlan.level3.mealRelation} food ({activeCase.carePlan.level3.duration})
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-400 bg-indigo-950/20 p-2 rounded-lg">
                          <p className="font-semibold text-slate-300">Dermatologist Notes:</p>
                          <p className="italic">"{activeCase.carePlan.level3.specialNotes}"</p>
                        </div>
                        <div className="flex justify-between items-center text-[9px] pt-1">
                          <div className="text-slate-400">
                            Verified by: <span className="font-semibold text-slate-300">{activeCase.carePlan.level3.doctorName}</span>
                          </div>
                          <div className="font-cursive text-indigo-300 border-b border-dashed border-indigo-500 px-1">
                            {activeCase.carePlan.level3.doctorSignature}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 py-1">
                        <p className="text-[10px] text-slate-400 leading-normal">{t.level3Pending}</p>
                        <div className="flex flex-col gap-2.5 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                            <span className="text-[10px] text-indigo-300 font-semibold font-mono">Dermatologist Review Queued</span>
                          </div>
                          {onApprovePrescription && (
                            <button
                              id="btn-simulate-prescription-sign"
                              onClick={() => {
                                onApprovePrescription(activeCase.id, {
                                  medicine: activeCase.carePlan?.level3?.medicine || "Hydrocortisone 2.5% Ointment",
                                  dosage: activeCase.carePlan?.level3?.dosage || "Apply a small pea-sized amount to the lesion",
                                  frequency: activeCase.carePlan?.level3?.frequency || "Twice daily",
                                  mealRelation: activeCase.carePlan?.level3?.mealRelation || "after",
                                  duration: activeCase.carePlan?.level3?.duration || "7 days",
                                  specialNotes: "Wash hands thoroughly before and after application. Avoid eyes.",
                                  doctorName: "Dr. Catherine Shaw, MD",
                                  doctorSignature: "Catherine Shaw"
                                });
                              }}
                              className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
                            >
                              ⚡ Simulate Physician Approval
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Consult messaging section with doctor if pending / active */}
                <div className="border border-slate-800 bg-slate-950/40 p-3 rounded-2xl space-y-2.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">Dermatology Chat Console</span>
                  <div className="max-h-32 overflow-y-auto space-y-2 text-xs pr-1">
                    {activeCase.chats && activeCase.chats.length > 0 ? (
                      activeCase.chats.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-2 rounded-xl max-w-[80%] leading-relaxed ${
                            msg.sender === 'patient' 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-slate-800 text-slate-200 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-500 mt-0.5 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-500 italic text-center py-2">No active messages. You can start typing below to notify clinical support.</p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      id="input-results-chat"
                      type="text"
                      placeholder={t.chatPlaceholder}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none"
                    />
                    <button
                      id="btn-results-chat-send"
                      onClick={handleSendChatText}
                      className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  id="btn-results-nav-reminders"
                  onClick={() => setScreen("reminders")}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
                >
                  <Bell className="w-3.5 h-3.5 text-indigo-400" />
                  Reminders
                </button>
                <button
                  id="btn-results-nav-progress"
                  onClick={() => setScreen("progress")}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Track Healing
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Medicine Reminder Engine */}
          {screen === "reminders" && activeCase && (
            <div className="flex-1 flex flex-col justify-between px-5 py-5 space-y-4">
              <div className="space-y-4 overflow-y-auto max-h-[580px] pr-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-white flex items-center gap-1">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    {t.remindersTitle}
                  </h2>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold text-indigo-400 flex items-center gap-1 font-mono">
                    <span>🔥 {streak} Days Streak</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono block mb-2">My Dosing Calendar (Today)</span>
                  
                  {/* Daily calendar dots */}
                  <div className="flex justify-between gap-1 mb-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-[9px] text-slate-500 font-mono">{day}</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                          idx < 4 ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-500'
                        }`}>
                          {idx + 13}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reminder Schedule list */}
                <div className="space-y-2.5">
                  {getSimulatedReminders().length > 0 ? (
                    getSimulatedReminders().map((rem) => (
                      <div 
                        key={rem.id} 
                        className={`p-3.5 rounded-2xl border transition-all flex justify-between items-center ${
                          rem.status === 'taken' 
                            ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-300' 
                            : 'bg-slate-800/40 border-slate-800 text-slate-100'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold">{rem.medicineName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded font-semibold text-slate-300">⏰ {rem.time}</span>
                            <span className="flex items-center gap-0.5 font-sans font-medium">
                              {rem.mealRelation === "after" ? "🍽️➡️💊 After Food" : rem.mealRelation === "before" ? "💊➡️🍽️ Before Food" : "⏰ Empty Stomach"}
                            </span>
                          </div>
                        </div>

                        <button
                          id={`btn-rem-toggle-${rem.id}`}
                          onClick={() => handleToggleReminder(rem.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 ${
                            rem.status === 'taken'
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {rem.status === 'taken' ? "✓ Taken" : t.takenBtn}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 italic space-y-1 bg-slate-800/20 border border-dashed border-slate-800 rounded-2xl">
                      <p>No active medications or schedules configured.</p>
                      <p className="text-[10px] text-slate-600">Once your Doctor confirms a Tier 3 prescription, your smart dosing schedule will auto-populate here.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-rem-back-results"
                  onClick={() => setScreen("results")}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                >
                  Back to Case
                </button>
                <button
                  id="btn-rem-to-locator"
                  onClick={() => setScreen("locator")}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Map Clinics
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Map Locator Pharmacies & Clinics */}
          {screen === "locator" && (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Dynamic Map Visual Canvas */}
              <div className="relative h-[240px] bg-slate-950 border-b border-slate-800 flex items-center justify-center overflow-hidden">
                
                {/* Simulated Grid Road Map */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                
                {/* Simulated Medical Roads */}
                <div className="absolute top-1/2 left-0 w-full h-3 bg-slate-800"></div>
                <div className="absolute top-0 left-1/3 w-3 h-full bg-slate-800"></div>
                <div className="absolute top-0 left-2/3 w-3 h-full bg-slate-800"></div>

                {/* Patient Pin */}
                <div className="absolute top-1/2 left-1/3 transform -translate-x-1.5 -translate-y-1.5 z-30">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-white animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-indigo-400 whitespace-nowrap bg-slate-900 px-1 rounded">My Location</span>
                </div>

                {/* Pharmacy/Clinic Pins */}
                {MOCK_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    id={`btn-map-pin-${loc.id}`}
                    onClick={() => setSelectedMapItem(loc)}
                    className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 p-1 rounded-lg flex flex-col items-center gap-0.5 transition-all ${
                      selectedMapItem?.id === loc.id ? 'scale-110 z-30' : 'opacity-80'
                    }`}
                    style={{ 
                      top: loc.id === "loc-1" ? "35%" : loc.id === "loc-2" ? "65%" : loc.id === "loc-3" ? "20%" : "80%",
                      left: loc.id === "loc-1" ? "55%" : loc.id === "loc-2" ? "20%" : loc.id === "loc-3" ? "80%" : "60%"
                    }}
                  >
                    <div className={`p-1 rounded-full border shadow-md ${
                      selectedMapItem?.id === loc.id 
                        ? 'bg-rose-500 text-white border-white' 
                        : loc.type === 'pharmacy' ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-slate-800 text-indigo-400 border-slate-700'
                    }`}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 bg-slate-900/90 px-1 rounded max-w-[80px] truncate">{loc.name.split(" ")[0]}</span>
                  </button>
                ))}

                {/* Urgent alert overlay if case is Urgent */}
                {activeCase && activeCase.severity === 'Urgent' && (
                  <div className="absolute top-3 left-3 right-3 bg-red-950/90 border border-red-900 text-red-300 p-2.5 rounded-xl z-40 text-[10px] space-y-1 shadow-lg leading-relaxed font-sans">
                    <p className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      CRITICAL URGENT PROTOCOL
                    </p>
                    <p>Fever risk or complicated tissue spreading detected. Seek clinical evaluation. Proceed to nearest clinic below immediately.</p>
                  </div>
                )}
              </div>

              {/* Location Controls & Detail Sheet */}
              <div className="p-4 bg-slate-900 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <h3 className="font-bold text-white">Nearby Facilities</h3>
                    <div className="flex gap-1">
                      {["all", "pharmacy", "clinic"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setMapFilter(f as any)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize ${
                            mapFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Facility Details Panel */}
                  {selectedMapItem && (
                    <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            selectedMapItem.type === 'pharmacy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {selectedMapItem.type}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1">{selectedMapItem.name}</h4>
                          <p className="text-[10px] text-slate-400">{selectedMapItem.address}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 font-mono">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {selectedMapItem.rating}
                          </span>
                          <span className="text-[9px] text-slate-500">{selectedMapItem.distance}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-slate-800/60 pt-2 mt-1">
                        <span className={`font-medium ${selectedMapItem.openNow ? 'text-emerald-400' : 'text-red-400'}`}>
                          ● {selectedMapItem.openNow ? 'Open Now' : 'Closed'}
                        </span>
                        {selectedMapItem.delivery && (
                          <span className="text-indigo-400 font-medium">✓ Home Delivery Available</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a 
                          href={`tel:${selectedMapItem.phone}`}
                          className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 border border-slate-700"
                        >
                          <Phone className="w-3 h-3" /> Call Clinic
                        </a>
                        <button 
                          onClick={() => alert(`Navigating route to ${selectedMapItem.name}`)}
                          className="py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-md shadow-indigo-600/10"
                        >
                          <Navigation className="w-3 h-3" /> Get Route
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-1">
                  <button
                    id="btn-locator-back-case"
                    onClick={() => setScreen("results")}
                    className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                  >
                    Back to Case
                  </button>
                  <button
                    id="btn-locator-to-premium"
                    onClick={() => setScreen("premium")}
                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-indigo-200" />
                    Pro Consulting
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SCREEN: Healing Progress Tracker Comparison Slider */}
          {screen === "progress" && activeCase && (
            <div className="flex-1 flex flex-col justify-between px-5 py-5 space-y-4">
              <div className="space-y-4 overflow-y-auto max-h-[580px] pr-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-white flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    {t.progressTitle}
                  </h2>
                </div>

                {/* Draggable Before/After Photo Slider */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono block">Weekly Visual Chronology</span>
                  
                  {activeCase.checkins && activeCase.checkins.length > 0 ? (
                    <div 
                      ref={containerRef}
                      className="relative w-full h-[180px] rounded-2xl overflow-hidden border border-slate-800 select-none cursor-ew-resize"
                      onMouseMove={(e) => isDraggingSlider && handleTouchSlider(e.clientX)}
                      onMouseDown={() => setIsDraggingSlider(true)}
                      onMouseUp={() => setIsDraggingSlider(false)}
                      onMouseLeave={() => setIsDraggingSlider(false)}
                      onTouchMove={(e) => handleTouchSlider(e.touches[0].clientX)}
                    >
                      {/* Before Photo (Day 1 baseline) */}
                      <img 
                        src={activeCase.photoUrl} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        alt="Before" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-3 bg-black/60 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                        {t.beforeLabel}
                      </div>

                      {/* After Photo (Latest check-in slider layer) */}
                      <div 
                        className="absolute inset-y-0 right-0 overflow-hidden" 
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <img 
                          src={activeCase.checkins[activeCase.checkins.length - 1].photoUrl} 
                          className="absolute inset-y-0 right-0 w-full h-full object-cover" 
                          style={{ width: containerRef.current?.getBoundingClientRect().width || 345, maxWidth: 'none' }}
                          alt="After" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-3 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                          {t.afterLabel}
                        </div>
                      </div>

                      {/* Drag Handle Bar */}
                      <div 
                        className="absolute inset-y-0 w-0.5 bg-indigo-400 z-10 flex items-center justify-center cursor-ew-resize"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-indigo-300 flex items-center justify-center text-white text-xs shadow-md">
                          ↔
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-800/20 border border-dashed border-slate-800 rounded-2xl italic">
                      No check-ins logged yet. Submit your first progress update below to unlock the Chronological comparison slider.
                    </div>
                  )}
                </div>

                {/* Submitting check-in log */}
                <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                  <span className="text-[10.5px] font-bold text-slate-200 block">{t.howIsHealing}</span>
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { code: 'improving', text: t.improving.split(" ")[0], color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
                      { code: 'no-change', text: "Unchanged", color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
                      { code: 'worse', text: t.worse.split(" ")[0], color: 'bg-red-500/15 text-red-400 border-red-500/30' }
                    ].map((st) => (
                      <button
                        key={st.code}
                        id={`btn-checkin-status-${st.code}`}
                        onClick={() => setCheckInStatus(st.code as any)}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border text-center transition-all ${
                          checkInStatus === st.code 
                            ? 'bg-indigo-600 text-white border-indigo-500' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {st.text}
                      </button>
                    ))}
                  </div>

                  {/* Add Check-in camera/photo stream selector */}
                  <div className="flex gap-2.5 pt-1 items-center">
                    <label className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setCheckInPhoto(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <span className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                        <Camera className="w-3.5 h-3.5 text-indigo-400" />
                        {checkInPhoto ? "Change Photo" : "Upload Today's Photo"}
                      </span>
                    </label>
                    {checkInPhoto && (
                      <img src={checkInPhoto} className="w-10 h-10 object-cover rounded-xl border border-slate-700" alt="Checkin preview" referrerPolicy="no-referrer" />
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-medium mb-1">{t.notesLabel}</label>
                    <input
                      id="input-checkin-notes"
                      type="text"
                      placeholder="e.g., Rash has faded slightly, itching feels lower today."
                      value={checkInNotes}
                      onChange={(e) => setCheckInNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    id="btn-checkin-submit"
                    onClick={handleAddProgressCheckIn}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl"
                  >
                    {t.submitCheckIn}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-progress-back-case"
                  onClick={() => setScreen("results")}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                >
                  Back to Case
                </button>
                <button
                  id="btn-progress-to-reminders"
                  onClick={() => setScreen("reminders")}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  Dosing Calendar
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Premium Subscription & Monetization tier */}
          {screen === "premium" && (
            <div className="flex-1 flex flex-col justify-between px-6 py-6 text-center">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto animate-bounce">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">Unlock SkinSense Pro</h2>
                <p className="text-xs text-slate-400">Upgrade to unlock unlimited AI skin checks, direct dermatologist prescription pathways, and real-time consulting calls.</p>

                <div className="space-y-3 pt-2">
                  <div className={`p-4 rounded-2xl border text-left transition-all ${
                    premiumPlan === 'free' ? 'bg-indigo-600/10 border-indigo-500' : 'bg-slate-800/40 border-slate-800'
                  }`} onClick={() => setPremiumPlan('free')}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-200">Standard Care Plan</span>
                      <span className="text-xs font-bold text-indigo-400">Free</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Level 1 Self-care instructions, Level 2 OTC pharmacy recommendations, and basic meal-synchronized medicine alarms.</p>
                  </div>

                  <div className={`p-4 rounded-2xl border text-left transition-all ${
                    premiumPlan === 'paid' ? 'bg-indigo-600/10 border-indigo-500' : 'bg-slate-800/40 border-slate-800'
                  }`} onClick={() => setPremiumPlan('paid')}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                        Professional Consulting
                        <span className="text-[8px] uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.2 rounded font-mono">POPULAR</span>
                      </span>
                      <span className="text-xs font-bold text-indigo-400">$29 / case</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Level 3 direct dermatologist clinic diagnostics, live consultation video calls, digitally signed e-prescriptions, and continuous escalation triggers.</p>
                  </div>
                </div>

                {/* Referral Tracking box */}
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-left space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 font-mono">Pharmacy Booking Commissions</span>
                  <p className="text-[11px] text-slate-300">You earned <span className="text-emerald-400 font-bold">$4.50</span> from automated local compounding bookings this month.</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  id="btn-premium-toggle"
                  onClick={() => {
                    setPremiumPlan(premiumPlan === 'free' ? 'paid' : 'free');
                    alert(`Subscription updated successfully. Active tier: ${premiumPlan === 'free' ? 'Paid Premium' : 'Free Standard'}`);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-xs shadow-lg"
                >
                  {premiumPlan === 'free' ? "Subscribe to Premium Consulting" : "Switch back to Free Tier"}
                </button>
                <button
                  id="btn-premium-back-case"
                  onClick={() => setScreen("results")}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Simulated Phone Home Navigation Bar Indicator */}
        <div className="h-6 bg-black flex items-center justify-center pb-2 z-40">
          <div className="w-36 h-1 bg-white rounded-full"></div>
        </div>

      </div>
    </div>
  );
}
