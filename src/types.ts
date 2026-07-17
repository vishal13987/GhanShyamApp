export interface Case {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientAllergies: string;
  patientMeds: string;
  patientSleepTime: string; // e.g. "22:00"
  patientMealTime: string;  // e.g. "08:00,13:00,19:00"
  language: string;
  timestamp: string;
  severity: 'Mild' | 'Moderate' | 'Urgent';
  status: 'pending' | 'reviewed' | 'escalated';
  photoUrl: string;
  videoUrl?: string;
  voiceUrl?: string;
  voiceTranscription?: string;
  textSymptom: string;
  duration: string;
  itchScale: number; // 1 to 10
  spreading: boolean;
  triggers: string;
  conditions: Array<{ name: string; confidence: number }>;
  carePlan: {
    level1: string[];
    level2: {
      medicine: string;
      instructions: string;
      disclaimer: string;
    } | null;
    level3: {
      medicine: string;
      dosage: string;
      frequency: string;
      mealRelation: 'before' | 'after' | 'empty';
      duration: string;
      specialNotes: string;
      doctorName: string;
      doctorSignature: string;
      isSigned: boolean;
    } | null;
  };
  checkins: Array<{
    id: string;
    date: string;
    photoUrl: string;
    status: 'improving' | 'no-change' | 'worse';
    notes: string;
  }>;
  chats: Array<{
    id: string;
    sender: 'patient' | 'doctor';
    text: string;
    timestamp: string;
  }>;
}

export interface Reminder {
  id: string;
  caseId: string;
  medicineName: string;
  time: string; // e.g., "08:30"
  mealRelation: 'before' | 'after' | 'empty';
  status: 'pending' | 'taken' | 'missed';
  date: string; // e.g., "2026-07-16"
}

export interface PharmacyClinic {
  id: string;
  name: string;
  type: 'pharmacy' | 'clinic';
  distance: string;
  rating: number;
  openNow: boolean;
  phone: string;
  address: string;
  delivery: boolean;
  coords: { lat: number; lng: number };
}
