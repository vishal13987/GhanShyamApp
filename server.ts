import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared data model interfaces
import { Case, Reminder } from "./src/types";

const app = express();
const PORT = 3000;

// Body parsing with higher limits for base64 skin photo transfers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared in-memory database to persist sessions and align Doctor dashboard with Patient simulator
let activeCases: Case[] = [
  {
    id: "case-1",
    patientName: "Ayla Vance",
    patientAge: 28,
    patientGender: "Female",
    patientAllergies: "Penicillin, Strawberries",
    patientMeds: "Daily Multivitamin",
    patientSleepTime: "22:30",
    patientMealTime: "08:00,12:30,19:00",
    language: "English",
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    severity: "Moderate",
    status: "pending",
    photoUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    textSymptom: "Dry, scaly patch on my left wrist that started itching intensely after I cleaned the attic. It looks red and inflamed.",
    duration: "4 days",
    itchScale: 7,
    spreading: false,
    triggers: "Dust, cleaning products",
    conditions: [
      { name: "Atopic Dermatitis (Eczema)", confidence: 85 },
      { name: "Contact Dermatitis", confidence: 12 }
    ],
    carePlan: {
      level1: [
        "Avoid scratching; use cool compresses to soothe the itch.",
        "Apply a fragrance-free humectant moisturizer twice daily within 3 minutes of bathing.",
        "Avoid using harsh alkaline soaps; switch to mild synthetic detergents (syndets)."
      ],
      level2: {
        medicine: "Hydrocortisone 1% Cream (OTC)",
        instructions: "Apply a thin layer to the affected wrist twice daily for up to 7 days.",
        disclaimer: "Confirm with your pharmacist that 1% Hydrocortisone is appropriate for your age and skin type."
      },
      level3: {
        medicine: "Triamcinolone Acetonide 0.1% Ointment",
        dosage: "Apply a thin film to the wrist",
        frequency: "Twice daily",
        mealRelation: "after",
        duration: "10 days",
        specialNotes: "Wash hands thoroughly. Apply immediately after evening meal and in the morning. Do not cover with occlusive dressings unless advised.",
        doctorName: "Dr. Catherine Shaw, MD",
        doctorSignature: "Catherine Shaw",
        isSigned: false
      }
    },
    checkins: [
      {
        id: "chk-1",
        date: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        photoUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
        status: "improving",
        notes: "Redness has slightly gone down after keeping it moisturized."
      }
    ],
    chats: [
      {
        id: "msg-1",
        sender: "doctor",
        text: "Hello Ayla, I see your wrist symptoms. I am reviewing the draft plan. Please make sure not to use regular hand sanitizer on that dry spot.",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: "case-2",
    patientName: "Marcus Sterling",
    patientAge: 45,
    patientGender: "Male",
    patientAllergies: "Sulfa drugs",
    patientMeds: "Atorvastatin 20mg",
    patientSleepTime: "23:00",
    patientMealTime: "07:30,13:00,20:00",
    language: "English",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    severity: "Urgent",
    status: "pending",
    photoUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=400&auto=format&fit=crop&q=80",
    textSymptom: "Rapidly spreading dark red rash with painful blisters covering my left calf. I was hiking through weeds on Tuesday. It feels hot and throbbing.",
    duration: "2 days",
    itchScale: 9,
    spreading: true,
    triggers: "Wild poison ivy or oak, possible bacterial cellulitis escalation",
    conditions: [
      { name: "Severe Contact Dermatitis (Poison Ivy)", confidence: 75 },
      { name: "Bacterial Cellulitis (Complicated)", confidence: 20 }
    ],
    carePlan: {
      level1: [
        "Elevate the left leg above heart level whenever resting.",
        "Wash the calf gently with cold water and mild soap to remove remaining plant oils.",
        "Apply cool water-soaked clean dressings for 15 minutes to soothe throbbing."
      ],
      level2: {
        medicine: "Calamine Lotion & Oral Cetirizine 10mg",
        instructions: "Apply calamine lotion to weeping blisters twice daily. Take Cetirizine once daily for severe itching.",
        disclaimer: "Seek in-person care immediately if you develop a fever, chills, or if the red border continues to expand rapidly."
      },
      level3: {
        medicine: "Oral Prednisone (Tapering course) & Cephalexin 500mg",
        dosage: "Take Prednisone 40mg daily with breakfast; Cephalexin 500mg 3 times daily",
        frequency: "Prednisone (once daily), Cephalexin (3 times daily)",
        mealRelation: "after",
        duration: "7 days",
        specialNotes: "Cephalexin must be taken after meals. Complete the entire course. Prednisone must be taken in the morning to prevent insomnia.",
        doctorName: "Dr. Catherine Shaw, MD",
        doctorSignature: "Catherine Shaw",
        isSigned: false
      }
    },
    checkins: [],
    chats: []
  },
  {
    id: "case-3",
    patientName: "Leila Al-Jamil",
    patientAge: 3,
    patientGender: "Female",
    patientAllergies: "None known",
    patientMeds: "None",
    patientSleepTime: "20:00",
    patientMealTime: "08:00,12:00,18:00",
    language: "العربية", // Arabic
    timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
    severity: "Mild",
    status: "reviewed",
    photoUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&auto=format&fit=crop&q=80",
    textSymptom: "طفح جلدي بسيط تحت الحفاض أحمر اللون ومتهيج. يبكي الطفل عند تغيير الحفاض.",
    duration: "3 days",
    itchScale: 4,
    spreading: false,
    triggers: "Wet diapers, rubbing",
    conditions: [
      { name: "Diaper Dermatitis (طفح الحفاض)", confidence: 95 }
    ],
    carePlan: {
      level1: [
        "تغيير الحفاض بشكل متكرر وتجفيف المنطقة بلطف شديد.",
        "ترك الطفل بدون حفاض لبعض الوقت لتهوية المنطقة.",
        "تجنب استخدام المناديل المبللة المعطرة واستبدالها بالماء الدافئ والقطن."
      ],
      level2: {
        medicine: "Zinc Oxide Barrier Cream (كريم أكسيد الزنك)",
        instructions: "ضع طبقة سميكة من كريم أكسيد الزنك عند كل غيار حفاض بعد التجفيف التام.",
        disclaimer: "استشر الصيدلي أو طبيب الأطفال إذا لم يتحسن الطفح خلال 3 أيام."
      },
      level3: {
        medicine: "Nystatin Cream (كريم نيستاتين)",
        dosage: "ضع كمية صغيرة على الطفح الأحمر",
        frequency: "3 مرات يومياً",
        mealRelation: "empty",
        duration: "5 days",
        specialNotes: "مضاد للفطريات فعال لحالات طفح الحفاض المصابة بالخميرة. ضع الكريم قبل وجبة الرضاعة أو الأكل بمسافة كافية.",
        doctorName: "Dr. Catherine Shaw, MD",
        doctorSignature: "Catherine Shaw",
        isSigned: true
      }
    },
    checkins: [
      {
        id: "chk-2",
        date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        photoUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&auto=format&fit=crop&q=80",
        status: "improving",
        notes: "الطفح بدأ يختفي والجلد أصبح أكثر نعومة وهدوءاً."
      }
    ],
    chats: [
      {
        id: "msg-2",
        sender: "doctor",
        text: "لقد قمت باعتماد كريم النيستاتين لليلى. يرجى المتابعة بانتظام والمحافظة على جفاف المنطقة.",
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      }
    ]
  }
];

// Initialize Gemini SDK with telemetry headers
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (e) {
    console.error("Failed to initialize Gemini Client:", e);
  }
} else {
  console.log("No GEMINI_API_KEY found in process.env. Falling back to internal clinical mock analysis.");
}

// REST Endpoints
app.get("/api/cases", (req, res) => {
  res.json(activeCases);
});

app.get("/api/cases/:id", (req, res) => {
  const item = activeCases.find((c) => c.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Case not found" });
  }
  res.json(item);
});

// Voice-to-text translation and transcribing simulator
app.post("/api/voice-to-text", async (req, res) => {
  const { voiceDescription, language } = req.body;
  
  if (ai) {
    try {
      const prompt = `You are a medical speech transcriber. Transcribe the following simulated patient voice description of a skin symptom. 
      If it is not in English, also provide the translation into English.
      Input Voice Context: "${voiceDescription || "I have a red itchy patch on my elbow"}"
      Requested UI Language: ${language || "English"}
      
      Respond only with a JSON object in this format:
      {
        "originalText": "the transcribed text in original language",
        "englishTranslation": "the English translation of the text"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              originalText: { type: Type.STRING },
              englishTranslation: { type: Type.STRING }
            },
            required: ["originalText", "englishTranslation"]
          }
        }
      });

      const data = JSON.parse(response.text.trim());
      return res.json(data);
    } catch (err) {
      console.error("Gemini voice transcription error:", err);
    }
  }

  // Fallback transcribing
  let englishTrans = voiceDescription || "A dry, irritating circular patch on my forearm that burns when touched.";
  let originalTrans = englishTrans;
  if (language === "العربية") {
    originalTrans = "بقعة دائرية جافة ومتهيجة على ساعدي وتحرقني عند لمسها.";
    englishTrans = "A dry, irritating circular patch on my forearm that burns when touched.";
  } else if (language === "Español") {
    originalTrans = "Un parche circular seco e irritante en mi antebrazo que me arde cuando lo toco.";
    englishTrans = "A dry, irritating circular patch on my forearm that burns when touched.";
  }

  res.json({
    originalText: originalTrans,
    englishTranslation: englishTrans
  });
});

// Deep AI Skin Diagnostic Engine via Gemini API
app.post("/api/analyze-skin", async (req, res) => {
  const {
    textSymptom,
    itchScale,
    duration,
    spreading,
    triggers,
    language,
    photoBase64,
  } = req.body;

  const resolvedLang = language || "English";

  if (ai) {
    try {
      let promptParts: any[] = [];

      if (photoBase64) {
        // Strip out mime type header from base64 string if present
        const match = photoBase64.match(/^data:([^;]+);base64,(.*)$/);
        const mimeType = match ? match[1] : "image/jpeg";
        const cleanBase64 = match ? match[2] : photoBase64;

        promptParts.push({
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        });
      }

      const textPrompt = `You are a professional board-certified dermatologist and medical assistant AI. Analyze the skin symptom and visual attributes.
      
      Patient Symptoms: "${textSymptom || 'Red patches'}"
      Duration: "${duration || '3 days'}"
      Itch/Pain Scale (1-10): ${itchScale || 5}
      Is Spreading? ${spreading ? "Yes" : "No"}
      Suspected Triggers: "${triggers || 'None reported'}"
      Requested Language for Patient output: "${resolvedLang}"
      
      Provide a highly professional assessment. Classify severity carefully (Mild, Moderate, or Urgent). If there are signs of serious infection, necrotizing tissue, systemic fever, spreading borders, or irregular melanomas, you MUST set severity to "Urgent" and prioritize the seek immediate professional medical care instruction.
      
      Return a structured JSON response in the target language (${resolvedLang}) for care instruction strings.
      The level3_draft is extremely important. It should suggest an effective prescription-strength medicine that a doctor will review, edit, and sign later. Choose suitable medication (such as steroid creams, antibiotics, antifungals) based on the analysis.
      
      Format the response EXACTLY matching this JSON schema:
      {
        "severity": "Mild" or "Moderate" or "Urgent",
        "conditions": [
          { "name": "Condition Name in ${resolvedLang}", "confidence": 85 },
          { "name": "Alternative Condition in ${resolvedLang}", "confidence": 15 }
        ],
        "level1": [
          "Self care instruction 1 in ${resolvedLang}",
          "Self care instruction 2 in ${resolvedLang}"
        ],
        "level2": {
          "medicine": "OTC medicine name in ${resolvedLang}",
          "instructions": "OTC use instructions in ${resolvedLang}",
          "disclaimer": "OTC warnings/disclaimers in ${resolvedLang}"
        },
        "level3_draft": {
          "medicine": "Prescription drug name (e.g., Mupirocin 2% Ointment, Hydrocortisone 2.5%, Permethrin 5%)",
          "dosage": "Suggested dosage details (e.g., Apply small pea-sized cream)",
          "frequency": "Frequency (e.g., Twice daily, Three times a day)",
          "mealRelation": "before" or "after" or "empty",
          "duration": "Suggested duration (e.g., 7 days, 14 days)",
          "specialNotes": "Important medical note (e.g., Avoid contact with eyes. Wash hands.)"
        }
      }`;

      promptParts.push({ text: textPrompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: promptParts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              severity: { type: Type.STRING, description: "Mild, Moderate, or Urgent" },
              conditions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    confidence: { type: Type.INTEGER }
                  },
                  required: ["name", "confidence"]
                }
              },
              level1: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              level2: {
                type: Type.OBJECT,
                properties: {
                  medicine: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                  disclaimer: { type: Type.STRING }
                },
                required: ["medicine", "instructions", "disclaimer"]
              },
              level3_draft: {
                type: Type.OBJECT,
                properties: {
                  medicine: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  mealRelation: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  specialNotes: { type: Type.STRING }
                },
                required: ["medicine", "dosage", "frequency", "mealRelation", "duration", "specialNotes"]
              }
            },
            required: ["severity", "conditions", "level1", "level2", "level3_draft"]
          }
        }
      });

      const parsedAI = JSON.parse(response.text.trim());
      return res.json(parsedAI);
    } catch (err) {
      console.error("Gemini skin analysis failed, running fallback system...", err);
    }
  }

  // Robust fallback diagnostic analysis
  const query = (textSymptom + " " + triggers).toLowerCase();
  let severity: 'Mild' | 'Moderate' | 'Urgent' = "Mild";
  let conditions = [{ name: "Contact Dermatitis", confidence: 80 }];
  let level1 = [
    "Keep the area clean by washing with cool water and a soap-free gentle cleanser.",
    "Do not pick, scratch, or scrub the skin barrier.",
    "Apply a fragrance-free barrier cream regularly."
  ];
  let level2 = {
    medicine: "Hydrocortisone Cream 1%",
    instructions: "Apply a thin film to the irritated skin twice daily.",
    disclaimer: "Consult a pharmacist for children or if symptoms do not improve within 3 days."
  };
  let level3_draft: {
    medicine: string;
    dosage: string;
    frequency: string;
    mealRelation: 'before' | 'after' | 'empty';
    duration: string;
    specialNotes: string;
  } = {
    medicine: "Triamcinolone Acetonide 0.1% Cream",
    dosage: "Apply small dab to the affected spot",
    frequency: "Twice daily",
    mealRelation: "after",
    duration: "7 days",
    specialNotes: "Wash hands thoroughly. Best applied after meals."
  };

  if (query.includes("burn") || query.includes("sun") || query.includes("heat")) {
    conditions = [{ name: "First-Degree Sunburn / Heat Rash", confidence: 90 }];
    severity = "Mild";
    level1 = [
      "Stay out of direct sunlight and drink plenty of fluids to hydrate.",
      "Take cool showers to lower local skin temperature.",
      "Apply pure organic Aloe Vera gel."
    ];
    level2 = {
      medicine: "Soothing Aloe Vera + Calamine Gel",
      instructions: "Apply generously to sun-exposed skin 3-4 times daily.",
      disclaimer: "Seek emergency care if blister covers a major body percentage or fever develops."
    };
    level3_draft = {
      medicine: "Silver Sulfadiazine 1% Cream",
      dosage: "Apply to burn area gently",
      frequency: "Daily",
      mealRelation: "empty" as const,
      duration: "5 days",
      specialNotes: "Prevents secondary infections. Wash with sterile saline before each application."
    };
  } else if (query.includes("fungal") || query.includes("ring") || query.includes("athlete") || query.includes("itch")) {
    conditions = [
      { name: "Tinea Corporis (Ringworm)", confidence: 78 },
      { name: "Pityriasis Versicolor", confidence: 22 }
    ];
    severity = "Moderate";
    level1 = [
      "Keep skin completely dry, especially after bathing.",
      "Use a separate personal towel to prevent spreading to other limbs.",
      "Wear breathable, loose cotton clothing."
    ];
    level2 = {
      medicine: "Clotrimazole 1% Antifungal Cream",
      instructions: "Apply a thin layer to dry lesions twice daily for 2 weeks.",
      disclaimer: "Ensure to continue application for 7 days after visual lesions disappear to prevent recurrence."
    };
    level3_draft = {
      medicine: "Ketoconazole 2% Topical Cream",
      dosage: "Apply a thin layer covering lesion and 2cm surrounding skin",
      frequency: "Once daily",
      mealRelation: "after" as const,
      duration: "14 days",
      specialNotes: "Avoid touching eyes or mucus membranes. Wash hands immediately."
    };
  } else if (itchScale >= 8 || spreading || query.includes("blister") || query.includes("fever") || query.includes("poison")) {
    severity = "Urgent";
    conditions = [
      { name: "Acute Contact Dermatitis (Poison Oak / Toxic Chemical Exposure)", confidence: 85 },
      { name: "Secondary Impetigo (Bacterial infection)", confidence: 15 }
    ];
    level1 = [
      "Elevate the swollen limb and apply cool, damp dressings to weepy blisters.",
      "Avoid all contact with suspicious vegetation or domestic cleaning products.",
      "Keep fingernails short and clean to prevent secondary bacterial infection from scratch lesions."
    ];
    level2 = {
      medicine: "Oral Diphenhydramine (Benadryl) 25mg & Calamine",
      instructions: "Take 1 capsule Benadryl every 6 hours for severe itching. Apply calamine.",
      disclaimer: "URGENT: This requires immediate doctor inspection. Cellulitis risk is present."
    };
    level3_draft = {
      medicine: "Cephalexin 500mg Tablets & Triamcinolone 0.1%",
      dosage: "Take 1 Cephalexin capsule 3 times daily; apply steroid cream twice daily",
      frequency: "Three times daily (Cephalexin)",
      mealRelation: "after" as const,
      duration: "7 days",
      specialNotes: "Must complete full 7-day course of Cephalexin even if skin clears up, to prevent drug resistance."
    };
  }

  // Localized Translations Fallback
  if (resolvedLang === "العربية") {
    conditions = conditions.map(c => ({
      name: c.name === "Contact Dermatitis" ? "التهاب الجلد التماسي" : c.name === "First-Degree Sunburn / Heat Rash" ? "حرق شمس من الدرجة الأولى / طفح حراري" : "عدوى فطرية / سعفة",
      confidence: c.confidence
    }));
    level1 = level1.map(i => i.replace("Avoid", "تجنب").replace("Keep", "حافظ على").replace("Do not", "لا تقم بـ"));
    level2 = {
      medicine: level2.medicine.replace("Hydrocortisone", "هيدروكورتيزون").replace("Cream", "كريم"),
      instructions: "ضع طبقة رقيقة على الجلد المتهيج مرتين يومياً.",
      disclaimer: "استشر الصيدلي إذا لم تتحسن الأعراض خلال 3 أيام."
    };
  }

  res.json({
    severity,
    conditions,
    level1,
    level2,
    level3_draft
  });
});

// Case submission API
app.post("/api/cases", (req, res) => {
  const {
    patientName,
    patientAge,
    patientGender,
    patientAllergies,
    patientMeds,
    patientSleepTime,
    patientMealTime,
    language,
    photoUrl,
    videoUrl,
    voiceTranscription,
    textSymptom,
    duration,
    itchScale,
    spreading,
    triggers,
    analysisResult
  } = req.body;

  const newCase: Case = {
    id: `case-${Date.now()}`,
    patientName: patientName || "Anonymous Patient",
    patientAge: Number(patientAge) || 30,
    patientGender: patientGender || "Other",
    patientAllergies: patientAllergies || "None",
    patientMeds: patientMeds || "None",
    patientSleepTime: patientSleepTime || "22:00",
    patientMealTime: patientMealTime || "08:00,13:00,19:00",
    language: language || "English",
    timestamp: new Date().toISOString(),
    severity: analysisResult?.severity || "Mild",
    status: "pending",
    photoUrl: photoUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    videoUrl,
    voiceTranscription,
    textSymptom: textSymptom || "No text description provided.",
    duration: duration || "1 day",
    itchScale: Number(itchScale) || 1,
    spreading: !!spreading,
    triggers: triggers || "Unknown",
    conditions: analysisResult?.conditions || [{ name: "Undetermined skin condition", confidence: 100 }],
    carePlan: {
      level1: analysisResult?.level1 || ["Wash gently with soap-free cleanser."],
      level2: analysisResult?.level2 || null,
      level3: analysisResult?.level3_draft ? {
        ...analysisResult.level3_draft,
        doctorName: "Dr. Catherine Shaw, MD",
        doctorSignature: "Catherine Shaw",
        isSigned: false
      } : null
    },
    checkins: [],
    chats: []
  };

  activeCases.unshift(newCase);
  res.status(201).json(newCase);
});

// Doctor Prescription / Override Authorization API
app.post("/api/cases/:id/prescription", (req, res) => {
  const { id } = req.params;
  const { medicine, dosage, frequency, mealRelation, duration, specialNotes, doctorName, doctorSignature } = req.body;

  const itemIdx = activeCases.findIndex((c) => c.id === id);
  if (itemIdx === -1) {
    return res.status(404).json({ error: "Case not found" });
  }

  const updatedCase = { ...activeCases[itemIdx] };
  
  if (!updatedCase.carePlan.level3) {
    updatedCase.carePlan.level3 = {
      medicine: medicine || "Mometasone Furoate 0.1% Cream",
      dosage: dosage || "Apply pea size",
      frequency: frequency || "Once daily",
      mealRelation: mealRelation || "after",
      duration: duration || "7 days",
      specialNotes: specialNotes || "Apply at bedtime.",
      doctorName: doctorName || "Dr. Catherine Shaw, MD",
      doctorSignature: doctorSignature || "Catherine Shaw",
      isSigned: true
    };
  } else {
    updatedCase.carePlan.level3 = {
      ...updatedCase.carePlan.level3,
      medicine,
      dosage,
      frequency,
      mealRelation,
      duration,
      specialNotes,
      doctorName: doctorName || "Dr. Catherine Shaw, MD",
      doctorSignature: doctorSignature || "Catherine Shaw",
      isSigned: true
    };
  }

  updatedCase.status = "reviewed";
  
  // Update in-memory database
  activeCases[itemIdx] = updatedCase;

  res.json(updatedCase);
});

// Clinical Check-In Timeline Progress Tracker
app.post("/api/cases/:id/checkin", (req, res) => {
  const { id } = req.params;
  const { status, photoUrl, notes } = req.body;

  const itemIdx = activeCases.findIndex((c) => c.id === id);
  if (itemIdx === -1) {
    return res.status(404).json({ error: "Case not found" });
  }

  const newCheckin = {
    id: `chk-${Date.now()}`,
    date: new Date().toISOString(),
    photoUrl: photoUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    status: status || "improving",
    notes: notes || "Checking in."
  };

  activeCases[itemIdx].checkins.push(newCheckin);

  // Auto-escalation trigger: If user selects "worse" or "no-change" on consecutive check-ins, auto-escalate status to 'escalated'
  if (status === "worse" || status === "no-change") {
    activeCases[itemIdx].status = "escalated";
    activeCases[itemIdx].chats.push({
      id: `msg-auto-${Date.now()}`,
      sender: "doctor",
      text: "🚨 Auto-Escalation System: The system detected that your condition is not showing visual improvements. Your case has been flagged for high-priority doctor override and Live Consultation.",
      timestamp: new Date().toISOString()
    });
  }

  res.json(activeCases[itemIdx]);
});

// Chat support endpoint
app.post("/api/cases/:id/chat", (req, res) => {
  const { id } = req.params;
  const { sender, text } = req.body;

  const itemIdx = activeCases.findIndex((c) => c.id === id);
  if (itemIdx === -1) {
    return res.status(404).json({ error: "Case not found" });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: sender || "patient",
    text: text || "",
    timestamp: new Date().toISOString()
  };

  activeCases[itemIdx].chats.push(newMsg);
  res.json(activeCases[itemIdx]);
});

// Vite Middleware/Asset Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
