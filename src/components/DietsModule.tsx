"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Card, CardContent, Typography, Grid, Box, Button, Chip, Stack, Paper,
  Divider, Alert, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, useTheme, CircularProgress, LinearProgress, Fade,
  InputAdornment, ToggleButton, ToggleButtonGroup, Tooltip,
  FormControl, InputLabel, Select
} from "@mui/material";
import {
  Restaurant, Scale, Print, CheckCircle, Warning, Info, Schedule, Close,
  Verified, LocalHospital, Delete, Edit, Add,
  History, AutoAwesome, SmartToy, FileUpload, ContentPaste,
  EmojiNature, MonitorHeart, WaterDrop, LocalDining, Refresh,
  CheckCircleOutline, FitnessCenter, Upload, Search, Bolt, Spa,
  ViewAgenda, TableRows, WbSunny, Bedtime, FreeBreakfast, LunchDining,
  LocalCafe, Nightlife, Translate
} from "@mui/icons-material";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useAppSelector } from "../redux/hooks";
import { HistoryRecord } from "../types/clinical";

interface MealSlot {
  time: string;
  mealName: string;
  portion: string;
  focus: string;
  clinicalNote: string;
}

interface EditableMealSlot extends MealSlot {
  slotType?: string;
  customMealName?: string;
}

interface AIDietPlan {
  planName: string;
  targetCalories: number;
  summary: string;
  macroBreakdown: { carbs: string; protein: string; fats: string; fiber: string };
  electrolyteLimits: { sodium: string; potassium: string; phosphorus: string; calcium: string };
  recommendedFoods: string[];
  foodsToAvoid: string[];
  hydrationGuidance: string;
  mealSchedule: MealSlot[];
  indianSpiceTherapy: Array<{ spice: string; benefit: string }>;
  lifestyleAdvice: string[];
  avoidanceAlerts: string[];
  followUpNote: string;
}

interface PatientFormData {
  patientName: string;
  age: string;
  gender: string;
  weightKg: string;
  heightCm: string;
  disease: string;
  dietaryPreference: string;
  language: string;
  allergies: string;
  comorbidities: string;
  bpSystolic: string;
  bpDiastolic: string;
  hba1c: string;
  fastingGlucose: string;
  creatinine: string;
  egfr: string;
  sodiumNa: string;
  potassiumK: string;
  totalCholesterol: string;
}

const EMPTY_FORM: PatientFormData = {
  patientName: "",
  age: "",
  gender: "",
  weightKg: "",
  heightCm: "",
  disease: "",
  dietaryPreference: "Vegetarian (Shakahari)",
  language: "Hindi",
  allergies: "",
  comorbidities: "",
  bpSystolic: "",
  bpDiastolic: "",
  hba1c: "",
  fastingGlucose: "",
  creatinine: "",
  egfr: "",
  sodiumNa: "",
  potassiumK: "",
  totalCholesterol: ""
};

type InputMode = "manual" | "prescription" | "history";

const DIETARY_PREFERENCES = [
  "Vegetarian (Shakahari)",
  "Lacto-Vegetarian (Dairy & Pulses)",
  "Jain (Satvik - No Onion, Garlic, Root Veggies)",
  "Non-Vegetarian (Fish, Eggs, Lean Chicken)",
  "Vegan (Plant-Based, Dairy-Free)"
];

const DIET_LANGUAGES = [
  { value: "Hindi", label: "Hindi (हिंदी)" },
  { value: "English", label: "English" },
  { value: "Hinglish", label: "Hinglish (बोलचाल की हिंदी)" }
];

const MEAL_SLOT_OPTIONS = [
  { value: "Early Morning", label: "Early Morning" },
  { value: "Breakfast", label: "Breakfast (Nashta)" },
  { value: "Mid-Morning Snack", label: "Mid-Morning Snack (Fruits / Sprouts)" },
  { value: "Lunch", label: "Lunch (Dopahar Ka Bhojan)" },
  { value: "Evening Snack", label: "Evening Snack / Tea Time" },
  { value: "Dinner", label: "Dinner (Ratri Bhojan)" },
  { value: "Bedtime Drink", label: "Bedtime Drink (Haldi Doodh / Soother)" }
];

const matchStandardSlot = (name: string): string | null => {
  if (!name) return null;
  const exact = MEAL_SLOT_OPTIONS.find((opt) => opt.value.toLowerCase() === name.trim().toLowerCase());
  if (exact) return exact.value;
  const lower = name.toLowerCase();
  if (lower === "early morning" || lower === "early morning drink" || lower.includes("wake") || (lower.includes("morning") && !lower.includes("mid"))) {
    return "Early Morning";
  }
  if (lower.includes("breakfast") || lower.includes("nashta")) {
    return "Breakfast";
  }
  if (lower.includes("mid-morning") || lower.includes("refreshment")) {
    return "Mid-Morning Snack";
  }
  if (lower.includes("lunch") || lower.includes("thali") || lower.includes("dopahar")) {
    return "Lunch";
  }
  if (lower.includes("evening") || lower.includes("tea") || lower.includes("sandhya")) {
    return "Evening Snack";
  }
  if (lower.includes("dinner") || lower.includes("ratri")) {
    return "Dinner";
  }
  if (lower.includes("bedtime") || lower.includes("soother") || lower.includes("haldi doodh")) {
    return "Bedtime Drink";
  }
  return null;
};

interface DietsModuleProps {
  patientName?: string;
  patientAge?: number | string;
  patientDisease?: string;
}

export default function DietsModule({ patientName = "", patientAge = "", patientDisease = "" }: DietsModuleProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [form, setForm] = useState<PatientFormData>({
    ...EMPTY_FORM,
    patientName: patientName || "",
    age: patientAge ? String(patientAge) : "",
    disease: patientDisease || ""
  });

  const updateForm = (field: keyof PatientFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Prescription Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [isParsingRx, setIsParsingRx] = useState(false);
  const [rxParsed, setRxParsed] = useState(false);

  // Redux: Active analysis & History records
  const activeAnalysis = useAppSelector((s: any) => s.clinical.analysisResult);
  const historyList: HistoryRecord[] = useAppSelector((s: any) => s.clinical.historyList) ?? [];

  const [historySearch, setHistorySearch] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");

  // Visual View toggle for meal schedule
  const [mealScheduleView, setMealScheduleView] = useState<"cards" | "table">("cards");
  // View toggle for history patients (table vs cards) - defaulted to table view
  const [historyView, setHistoryView] = useState<"cards" | "table">("table");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [aiDietPlan, setAiDietPlan] = useState<AIDietPlan | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [rxProgress, setRxProgress] = useState(0);

  // Editable Meal Schedule Popup State
  const [editMealsOpen, setEditMealsOpen] = useState(false);
  const [tempMealSchedule, setTempMealSchedule] = useState<EditableMealSlot[]>([]);

  // Filter history records
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return historyList;
    const q = historySearch.toLowerCase();
    return historyList.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.disease.toLowerCase().includes(q)
    );
  }, [historyList, historySearch]);

  // BMI Calculation
  const w = Number(form.weightKg) || 0;
  const h = Number(form.heightCm) / 100 || 0;
  const bmi = h > 0 ? (w / (h * h)).toFixed(1) : "0.0";
  const bmiVal = parseFloat(bmi);
  let bmiStatus = "Healthy Weight";
  let bmiColor = "#00C9A7";
  if (bmiVal >= 30) {
    bmiStatus = "Obese (Weight-loss goal)";
    bmiColor = "#FF4D6D";
  } else if (bmiVal >= 25) {
    bmiStatus = "Overweight (Mild deficit)";
    bmiColor = "#FFB703";
  } else if (bmiVal > 0 && bmiVal < 18.5) {
    bmiStatus = "Underweight (Nourishing meals)";
    bmiColor = "#00B4D8";
  }

  const getToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("arpan_auth_token") || "";
    return "";
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload JPEG, PNG, WebP, or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }
    setUploadedFile(file);
    setRxParsed(false);
    if (file.type !== "application/pdf") {
      setUploadedPreviewUrl(URL.createObjectURL(file));
    } else {
      setUploadedPreviewUrl(null);
    }
  }, []);

  const handleParseRx = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a prescription file first.");
      return;
    }
    setIsParsingRx(true);
    setRxProgress(10);
    const progressTimer = setInterval(() => {
      setRxProgress((prev) => {
        if (prev >= 94) return prev;
        const inc = Math.floor(Math.random() * 8) + 6;
        return Math.min(prev + inc, 94);
      });
    }, 280);

    const reader = new FileReader();
    reader.readAsDataURL(uploadedFile);
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/diet/parse-rx", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: uploadedFile.type,
            dietaryPreference: form.dietaryPreference,
            language: form.language || "Hindi"
          })
        });
        const json = await res.json();
        clearInterval(progressTimer);
        setRxProgress(100);
        if (!res.ok || !json.success) {
          toast.error(json.message || "Failed to parse prescription.");
          setIsParsingRx(false);
          return;
        }
        const d = json.data;
        const p = d.patientInfo || d;
        setForm((prev) => ({
          ...prev,
          patientName: p.patientName ?? prev.patientName,
          age: p.age ? String(p.age) : prev.age,
          gender: p.gender ?? prev.gender,
          weightKg: p.weightKg ? String(p.weightKg) : prev.weightKg,
          heightCm: p.heightCm ? String(p.heightCm) : prev.heightCm,
          disease: p.disease ?? prev.disease,
          allergies: p.allergies ?? prev.allergies,
          comorbidities: p.comorbidities ?? prev.comorbidities,
          bpSystolic: p.bpSystolic ? String(p.bpSystolic) : prev.bpSystolic,
          bpDiastolic: p.bpDiastolic ? String(p.bpDiastolic) : prev.bpDiastolic,
          hba1c: p.hba1c ? String(p.hba1c) : prev.hba1c,
          fastingGlucose: p.fastingGlucose ? String(p.fastingGlucose) : prev.fastingGlucose,
          creatinine: p.creatinine ? String(p.creatinine) : prev.creatinine,
          egfr: p.egfr ? String(p.egfr) : prev.egfr,
          sodiumNa: p.sodiumNa ? String(p.sodiumNa) : prev.sodiumNa,
          potassiumK: p.potassiumK ? String(p.potassiumK) : prev.potassiumK,
          totalCholesterol: p.totalCholesterol ? String(p.totalCholesterol) : prev.totalCholesterol
        }));
        if (d.dietPlan) {
          setAiDietPlan(d.dietPlan);
          confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
          toast.success("Prescription scanned & Indian Diet Plan generated in a single step!");
          setTimeout(() => {
            const el = document.getElementById("diet-plan-result");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 250);
        } else {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
          toast.success("Prescription read successfully!");
        }
        setRxParsed(true);
      } catch (err: any) {
        clearInterval(progressTimer);
        toast.error(err.message || "Error reading prescription.");
      } finally {
        setIsParsingRx(false);
      }
    };
    reader.onerror = () => {
      clearInterval(progressTimer);
      toast.error("Failed to read file.");
      setIsParsingRx(false);
    };
  };

  const loadPatientRecord = (record: HistoryRecord) => {
    const pi = record.patientInput || record.analysisResult?.patientInfo;
    if (!pi) {
      toast.error("No clinical patient details found in this record.");
      return;
    }
    setSelectedHistoryId(record.id);
    setForm({
      patientName: record.patientName || pi.patientName || "",
      age: String(record.age || pi.age || ""),
      gender: record.gender || pi.gender || "Male",
      weightKg: String(pi.weight || ""),
      heightCm: "",
      disease: record.disease || pi.disease || "",
      dietaryPreference: "Vegetarian (Shakahari)",
      language: form.language || "Hindi",
      allergies: pi.allergies || "",
      comorbidities: pi.comorbidities || "",
      bpSystolic: String(pi.bpSystolic || ""),
      bpDiastolic: String(pi.bpDiastolic || ""),
      hba1c: String(pi.hba1c || ""),
      fastingGlucose: String(pi.fastingGlucose || ""),
      creatinine: String(pi.creatinine || ""),
      egfr: String(pi.egfr || ""),
      sodiumNa: String(pi.sodiumNa || ""),
      potassiumK: String(pi.potassiumK || ""),
      totalCholesterol: String(pi.totalCholesterol || "")
    });
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
    toast.success(`Loaded: ${record.patientName} (${record.id})`);
  };

  const loadFromActiveAnalysis = () => {
    if (!activeAnalysis?.patientInfo) {
      toast.error("No active patient analysis on dashboard.");
      return;
    }
    const pi = activeAnalysis.patientInfo;
    setSelectedHistoryId("ACTIVE-SESSION");
    setForm({
      patientName: pi.patientName || "",
      age: String(pi.age || ""),
      gender: pi.gender || "Male",
      weightKg: String(pi.weight || ""),
      heightCm: "",
      disease: pi.disease || "",
      dietaryPreference: "Vegetarian (Shakahari)",
      language: form.language || "Hindi",
      allergies: pi.allergies || "",
      comorbidities: pi.comorbidities || "",
      bpSystolic: String(pi.bpSystolic || ""),
      bpDiastolic: String(pi.bpDiastolic || ""),
      hba1c: String(pi.hba1c || ""),
      fastingGlucose: String(pi.fastingGlucose || ""),
      creatinine: String(pi.creatinine || ""),
      egfr: String(pi.egfr || ""),
      sodiumNa: String(pi.sodiumNa || ""),
      potassiumK: String(pi.potassiumK || ""),
      totalCholesterol: String(pi.totalCholesterol || "")
    });
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    toast.success(`Loaded active patient: ${pi.patientName}`);
  };

  const handleGenerateDiet = async () => {
    if (!form.patientName || !form.age || !form.gender || !form.disease) {
      toast.error("Please enter Patient Name, Age, Gender, and Medical Condition.");
      return;
    }
    setIsGenerating(true);
    setGenProgress(10);
    const progressTimer = setInterval(() => {
      setGenProgress((prev) => {
        if (prev >= 94) return prev;
        const inc = Math.floor(Math.random() * 8) + 5;
        return Math.min(prev + inc, 94);
      });
    }, 280);

    setAiDietPlan(null);
    try {
      const calculatedBmi = h > 0 ? parseFloat(bmi) : undefined;
      const res = await fetch("/api/diet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...form, bmi: calculatedBmi })
      });
      const json = await res.json();
      clearInterval(progressTimer);
      setGenProgress(100);
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to generate diet plan.");
        return;
      }
      setAiDietPlan(json.data);
      confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
      toast.success("Indian Diet & Electrolyte Plan ready!");
      setTimeout(() => {
        const el = document.getElementById("diet-plan-result");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 250);
    } catch (err: any) {
      clearInterval(progressTimer);
      toast.error(err.message || "Network error generating diet plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  // =========================================================================
  // MEAL SCHEDULE EDITING HANDLERS (POPUP DIALOG)
  // =========================================================================
  const handleOpenEditMeals = () => {
    if (!aiDietPlan?.mealSchedule) return;
    const initialList: EditableMealSlot[] = aiDietPlan.mealSchedule.map((m) => {
      const isExact = MEAL_SLOT_OPTIONS.some(
        (opt) => opt.value.toLowerCase() === m.mealName.trim().toLowerCase()
      );
      if (isExact) {
        const found = MEAL_SLOT_OPTIONS.find(
          (opt) => opt.value.toLowerCase() === m.mealName.trim().toLowerCase()
        )!;
        return {
          ...m,
          slotType: found.value,
          mealName: found.value,
          customMealName: ""
        };
      }
      const matched = matchStandardSlot(m.mealName);
      if (matched) {
        return {
          ...m,
          slotType: matched,
          mealName: matched,
          customMealName: ""
        };
      }
      return {
        ...m,
        slotType: "Custom",
        customMealName: m.mealName || ""
      };
    });
    setTempMealSchedule(initialList);
    setEditMealsOpen(true);
  };

  const handleUpdateTempMeal = (index: number, field: keyof EditableMealSlot, val: string) => {
    setTempMealSchedule((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSlotTypeChange = (index: number, newSlotType: string) => {
    setTempMealSchedule((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      if (newSlotType === "Custom") {
        const existingCustom = cur.customMealName?.trim() || "";
        copy[index] = {
          ...cur,
          slotType: "Custom",
          customMealName: existingCustom,
          mealName: existingCustom || "Custom Meal"
        };
      } else {
        copy[index] = {
          ...cur,
          slotType: newSlotType,
          mealName: newSlotType
        };
      }
      return copy;
    });
  };

  const handleCustomMealNameChange = (index: number, customName: string) => {
    setTempMealSchedule((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        customMealName: customName,
        mealName: customName
      };
      return copy;
    });
  };

  const handleAddTempMeal = () => {
    setTempMealSchedule((prev) => [
      ...prev,
      {
        time: "05:00 PM",
        slotType: "Evening Snack",
        mealName: "Evening Snack",
        customMealName: "",
        portion: "1 Small Katori",
        focus: "Roasted Chana / Sprouted Moong Chaat with fresh lemon & cucumber",
        clinicalNote: "Clean Indian energy snack that keeps blood sugar steady"
      }
    ]);
  };

  const handleDeleteTempMeal = (index: number) => {
    if (tempMealSchedule.length <= 1) {
      toast.warning("Keep at least one meal slot in the schedule.");
      return;
    }
    setTempMealSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveMealSchedule = () => {
    if (!aiDietPlan) return;
    if (tempMealSchedule.length === 0) {
      toast.error("Please add at least one meal slot.");
      return;
    }
    const sanitized: MealSlot[] = tempMealSchedule.map((m, idx) => {
      let finalName = m.mealName?.trim();
      if (m.slotType === "Custom") {
        finalName = m.customMealName?.trim() || m.mealName?.trim() || `Custom Meal #${idx + 1}`;
      } else if (m.slotType) {
        finalName = m.slotType;
      }
      return {
        time: m.time?.trim() || "Flexible",
        mealName: finalName || `Meal Slot #${idx + 1}`,
        portion: m.portion?.trim() || "Standard Portion",
        focus: m.focus?.trim() || "Balanced Indian meal",
        clinicalNote: m.clinicalNote?.trim() || "Nutritional support"
      };
    });
    setAiDietPlan({
      ...aiDietPlan,
      mealSchedule: sanitized
    });
    setEditMealsOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    toast.success("Meal schedule updated successfully!");
  };

  // Quick inline delete of a meal slot directly from the visual cards or table
  const handleDeleteMealSlotDirect = (index: number) => {
    if (!aiDietPlan?.mealSchedule) return;
    if (aiDietPlan.mealSchedule.length <= 1) {
      toast.warning("Keep at least one meal slot in the schedule.");
      return;
    }
    const updated = aiDietPlan.mealSchedule.filter((_, i) => i !== index);
    setAiDietPlan({
      ...aiDietPlan,
      mealSchedule: updated
    });
    toast.info("Meal slot removed.");
  };

  const handleResetAll = () => {
    setAiDietPlan(null);
    setForm({
      ...EMPTY_FORM,
      patientName: patientName || "",
      age: patientAge ? String(patientAge) : "",
      disease: patientDisease || ""
    });
    setUploadedFile(null);
    setUploadedPreviewUrl(null);
    setRxParsed(false);
    setSelectedHistoryId("");
    setHistorySearch("");
    setGenProgress(0);
    setRxProgress(0);
    toast.info("Diet planner reset. You can now start fresh.");
  };

  const paperBg = isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF";
  const sectionBorder = isDark ? "rgba(0,201,167,0.2)" : "#E2E8F0";

  const modeConfigs = [
    {
      value: "manual" as InputMode,
      label: "1. Manual Entry",
      icon: <ContentPaste fontSize="small" />,
      color: "#00C9A7",
      desc: "Fill in patient health details by hand"
    },
    {
      value: "prescription" as InputMode,
      label: "2. Prescription Upload",
      icon: <FileUpload fontSize="small" />,
      color: "#6C5CE7",
      desc: "Upload Rx image / PDF for instant AI extraction"
    },
    {
      value: "history" as InputMode,
      label: "3. From Analysed Data",
      icon: <History fontSize="small" />,
      color: "#FFB703",
      desc: "Pick a patient from previously analysed cases"
    }
  ];

  // Helper icons for meal timeline
  const getMealVisual = (name: string, time: string) => {
    const lower = (name + " " + time).toLowerCase();
    if (lower.includes("wake") || lower.includes("morning") || lower.includes("6:") || lower.includes("7:")) {
      return { icon: <WbSunny sx={{ color: "#FFB703" }} />, tag: "Wake Up", color: "#FFB703" };
    }
    if (lower.includes("breakfast") || lower.includes("8:") || lower.includes("9:")) {
      return { icon: <FreeBreakfast sx={{ color: "#00C9A7" }} />, tag: "Breakfast", color: "#00C9A7" };
    }
    if (lower.includes("mid") || lower.includes("snack") || lower.includes("11:")) {
      return { icon: <Spa sx={{ color: "#00B4D8" }} />, tag: "Mid-Morning", color: "#00B4D8" };
    }
    if (lower.includes("lunch") || lower.includes("thali") || lower.includes("1:") || lower.includes("2:")) {
      return { icon: <LunchDining sx={{ color: "#6C5CE7" }} />, tag: "Lunch Thali", color: "#6C5CE7" };
    }
    if (lower.includes("tea") || lower.includes("evening") || lower.includes("5:")) {
      return { icon: <LocalCafe sx={{ color: "#FF9F43" }} />, tag: "Evening Snack", color: "#FF9F43" };
    }
    if (lower.includes("dinner") || lower.includes("8:") || lower.includes("night")) {
      return { icon: <Nightlife sx={{ color: "#00C9A7" }} />, tag: "Light Dinner", color: "#00C9A7" };
    }
    return { icon: <Bedtime sx={{ color: "#8E44AD" }} />, tag: "Bedtime", color: "#8E44AD" };
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.28)" : "0 4px 20px rgba(0,0,0,0.06)",
        background: isDark
          ? "linear-gradient(180deg, rgba(16,24,44,0.98) 0%, rgba(10,15,29,0.99) 100%)"
          : "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        border: `1px solid ${sectionBorder}`
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3.5 } }}>
        {/* Module Header */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
              <Box
                sx={{
                  bgcolor: "rgba(0, 201, 167, 0.12)",
                  p: 1.2,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Restaurant sx={{ color: "#00C9A7", fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: "1.3rem", sm: "1.7rem", md: "1.9rem" } }}>
                  Clinical Diet Planner & Electrolyte Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                  Easy-to-follow, home-cooked Indian diet plans made simple for patients and families
                </Typography>
              </Box>
            </Stack>

          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {aiDietPlan && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Print />}
                onClick={() => setPrintOpen(true)}
                sx={{
                  borderRadius: 2,
                  px: 2.8,
                  py: 1.1,
                  fontWeight: 800,
                  boxShadow: "0 4px 14px rgba(0, 201, 167, 0.35)",
                  whiteSpace: "nowrap"
                }}
              >
                Print Patient Diet Sheet
              </Button>
            )}
            {(aiDietPlan || form.patientName || uploadedFile || selectedHistoryId) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Refresh />}
                onClick={handleResetAll}
                sx={{
                  borderRadius: 2,
                  px: 2.2,
                  py: 1.1,
                  fontWeight: 800,
                  borderWidth: 1.5,
                  whiteSpace: "nowrap",
                  "&:hover": { borderWidth: 1.5, bgcolor: "rgba(255, 77, 109, 0.08)" }
                }}
              >
                Reset
              </Button>
            )}
          </Stack>
        </Stack>

        {/* 3 Source Selection Cards */}
        <Grid container spacing={2} mb={3}>
          {modeConfigs.map((mode) => (
            <Grid item xs={12} sm={4} key={mode.value}>
              <Paper
                variant="outlined"
                onClick={() => setInputMode(mode.value)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: "pointer",
                  border: inputMode === mode.value ? `2px solid ${mode.color}` : `1px solid ${sectionBorder}`,
                  bgcolor: inputMode === mode.value ? `${mode.color}14` : paperBg,
                  transition: "all 0.2s ease",
                  transform: inputMode === mode.value ? "translateY(-2px)" : "none",
                  boxShadow: inputMode === mode.value ? `0 8px 24px ${mode.color}25` : "none",
                  "&:hover": { border: `2px solid ${mode.color}`, bgcolor: `${mode.color}0A` }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      color: mode.color,
                      display: "flex",
                      p: 1.1,
                      bgcolor: `${mode.color}18`,
                      borderRadius: 1.5
                    }}
                  >
                    {mode.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: inputMode === mode.value ? mode.color : "text.primary",
                        fontSize: "0.9rem"
                      }}
                    >
                      {mode.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.74rem" }}>
                      {mode.desc}
                    </Typography>
                  </Box>
                  {inputMode === mode.value && (
                    <CheckCircle sx={{ color: mode.color, fontSize: 20, flexShrink: 0 }} />
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 1. MANUAL ENTRY */}
        {inputMode === "manual" && (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3, bgcolor: paperBg, borderColor: sectionBorder }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ContentPaste sx={{ color: "#00C9A7", fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#00C9A7" }}>
                  Patient Profile & Health Details
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<Bolt />}
                sx={{ borderRadius: 2, fontWeight: 700, fontSize: "0.75rem" }}
                onClick={() => {
                  setForm({
                    patientName: "Sandeep",
                    age: "56",
                    gender: "Male",
                    weightKg: "76",
                    heightCm: "168",
                    disease: "Type 2 Diabetes, High Blood Pressure",
                    dietaryPreference: "Vegetarian (Shakahari)",
                    language: "Hindi",
                    allergies: "None",
                    comorbidities: "Mild Kidney Concern (CKD Stage 3)",
                    bpSystolic: "146",
                    bpDiastolic: "92",
                    hba1c: "8.1",
                    fastingGlucose: "168",
                    creatinine: "1.4",
                    egfr: "54",
                    sodiumNa: "139",
                    potassiumK: "4.3",
                    totalCholesterol: "218"
                  });
                  toast.info("Demo patient 'Sandeep' loaded.");
                }}
              >
                Load Sample Indian Patient
              </Button>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Patient Name *"
                  value={form.patientName}
                  onChange={(e) => updateForm("patientName", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Age *"
                  value={form.age}
                  onChange={(e) => updateForm("age", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Gender *"
                  value={form.gender}
                  onChange={(e) => updateForm("gender", e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Weight (kg)"
                  value={form.weightKg}
                  onChange={(e) => updateForm("weightKg", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Height (cm)"
                  value={form.heightCm}
                  onChange={(e) => updateForm("heightCm", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Medical Condition / Health Goal *"
                  value={form.disease}
                  onChange={(e) => updateForm("disease", e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, High BP, Weight Loss, Kidney care"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="manual-diet-pref-label" sx={{ fontWeight: 600 }}>
                    Dietary Preference
                  </InputLabel>
                  <Select
                    labelId="manual-diet-pref-label"
                    label="Dietary Preference"
                    value={form.dietaryPreference}
                    onChange={(e) => updateForm("dietaryPreference", e.target.value)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    {DIETARY_PREFERENCES.map((pref) => (
                      <MenuItem key={pref} value={pref}>
                        {pref}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="manual-diet-lang-label" sx={{ fontWeight: 600 }}>
                    Diet Language / भाषा
                  </InputLabel>
                  <Select
                    labelId="manual-diet-lang-label"
                    label="Diet Language / भाषा"
                    value={form.language}
                    onChange={(e) => updateForm("language", e.target.value)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    {DIET_LANGUAGES.map((lang) => (
                      <MenuItem key={lang.value} value={lang.value} sx={{ fontWeight: 700 }}>
                        {lang.value === "Hindi" ? "🇮🇳 " : lang.value === "English" ? "🇬🇧 " : "🗣️ "}
                        {lang.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Food or Medicine Allergies"
                  value={form.allergies}
                  onChange={(e) => updateForm("allergies", e.target.value)}
                  placeholder="e.g. Peanuts, Milk/Lactose, Gluten"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Other Health Notes"
                  value={form.comorbidities}
                  onChange={(e) => updateForm("comorbidities", e.target.value)}
                  placeholder="e.g. Fatty liver, high uric acid, acidity"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#6C5CE7", display: "block", mb: 1.5 }}>
              HEALTH READINGS & LAB VALUES (Optional — helps AI fine-tune salt & kidney limits)
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Blood Pressure (Upper/Sys)"
                  value={form.bpSystolic}
                  onChange={(e) => updateForm("bpSystolic", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Blood Pressure (Lower/Dia)"
                  value={form.bpDiastolic}
                  onChange={(e) => updateForm("bpDiastolic", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="HbA1c Sugar (%)"
                  value={form.hba1c}
                  onChange={(e) => updateForm("hba1c", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Fasting Sugar (mg/dL)"
                  value={form.fastingGlucose}
                  onChange={(e) => updateForm("fastingGlucose", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Kidney Creatinine (mg/dL)"
                  value={form.creatinine}
                  onChange={(e) => updateForm("creatinine", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="eGFR Kidney Score"
                  value={form.egfr}
                  onChange={(e) => updateForm("egfr", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Blood Sodium (mEq/L)"
                  value={form.sodiumNa}
                  onChange={(e) => updateForm("sodiumNa", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Blood Potassium (mEq/L)"
                  value={form.potassiumK}
                  onChange={(e) => updateForm("potassiumK", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Cholesterol (mg/dL)"
                  value={form.totalCholesterol}
                  onChange={(e) => updateForm("totalCholesterol", e.target.value)}
                />
              </Grid>

              {w > 0 && h > 0 && (
                <Grid item xs={12} sm={8}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      borderColor: bmiColor,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      bgcolor: isDark ? `${bmiColor}12` : `${bmiColor}0A`
                    }}
                  >
                    <Scale sx={{ color: bmiColor, fontSize: 28 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Body Mass Index (BMI)
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: bmiColor }}>
                        {bmi} kg/m² — {bmiStatus}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* 2. PRESCRIPTION UPLOAD */}
        {inputMode === "prescription" && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              mb: 3,
              bgcolor: paperBg,
              borderColor: "rgba(108,92,231,0.3)"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <FileUpload sx={{ color: "#6C5CE7", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#6C5CE7" }}>
                Upload Prescription — AI Vision Reads Your Doctor's Note
              </Typography>
            </Stack>

            <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }} icon={<SmartToy fontSize="small" />}>
              Take a clear picture of your doctor's prescription or upload a PDF. Our AI vision instantly reads the diagnosis, medicines, and vitals to customize your Indian diet plan.
            </Alert>

            <Box
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelect({ target: { files: [file] } } as any);
              }}
              sx={{
                border: `2px dashed ${uploadedFile ? "#6C5CE7" : isDark ? "rgba(108,92,231,0.4)" : "#CBD5E1"}`,
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: uploadedFile ? "rgba(108,92,231,0.06)" : paperBg,
                transition: "all 0.2s ease",
                "&:hover": { border: "2px dashed #6C5CE7", bgcolor: "rgba(108,92,231,0.06)" },
                mb: 2
              }}
            >
              <input ref={fileInputRef} type="file" hidden accept="image/*,.pdf" onChange={handleFileSelect} />
              {uploadedFile ? (
                <Stack alignItems="center" spacing={1}>
                  {uploadedPreviewUrl && (
                    <Box
                      component="img"
                      src={uploadedPreviewUrl}
                      alt="Prescription Preview"
                      sx={{ maxHeight: 220, maxWidth: "100%", borderRadius: 1.5, objectFit: "contain", mb: 1 }}
                    />
                  )}
                  {!uploadedPreviewUrl && <LocalHospital sx={{ fontSize: 52, color: "#6C5CE7" }} />}
                  <Chip label={uploadedFile.name} color="secondary" size="small" sx={{ fontWeight: 700, maxWidth: "80%" }} />
                  <Typography variant="caption" color="text.secondary">
                    {(uploadedFile.size / 1024).toFixed(1)} KB · Ready to scan
                  </Typography>
                  {rxParsed && (
                    <Chip
                      icon={<CheckCircleOutline />}
                      label="Successfully scanned by AI"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={1}>
                  <Upload sx={{ fontSize: 48, color: isDark ? "rgba(108,92,231,0.6)" : "#94A3B8" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Click or drag prescription photo here
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports JPG, PNG, PDF
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* Diet Plan Language & Dietary Preference Selector */}
            <Box sx={{ maxWidth: 620, mx: "auto", mt: 2.5, mb: 1.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="rx-diet-lang-label" sx={{ fontWeight: 600 }}>
                      Diet Plan Language / भाषा
                    </InputLabel>
                    <Select
                      labelId="rx-diet-lang-label"
                      label="Diet Plan Language / भाषा"
                      value={form.language}
                      onChange={(e) => updateForm("language", e.target.value)}
                      sx={{
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"
                      }}
                    >
                      {DIET_LANGUAGES.map((lang) => (
                        <MenuItem key={lang.value} value={lang.value} sx={{ fontWeight: 700 }}>
                          {lang.value === "Hindi" ? "🇮🇳 " : lang.value === "English" ? "🇬🇧 " : "🗣️ "}
                          {lang.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="rx-diet-pref-label" sx={{ fontWeight: 600 }}>
                      Dietary Preference / भोजन का प्रकार
                    </InputLabel>
                    <Select
                      labelId="rx-diet-pref-label"
                      label="Dietary Preference / भोजन का प्रकार"
                      value={form.dietaryPreference}
                      onChange={(e) => updateForm("dietaryPreference", e.target.value)}
                      sx={{
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"
                      }}
                    >
                      {DIETARY_PREFERENCES.map((pref) => (
                        <MenuItem key={pref} value={pref} sx={{ fontWeight: 600 }}>
                          {pref}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Single Action Button: Generate Indian Diet Plan */}
            <Box sx={{ textAlign: "center", my: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleParseRx}
                disabled={!uploadedFile || isParsingRx}
                startIcon={isParsingRx ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                sx={{
                  borderRadius: "50px",
                  px: { xs: 4, sm: 6 },
                  py: 1.8,
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)",
                  boxShadow: "0 8px 32px rgba(0,201,167,0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #00B395 0%, #5a4bd1 100%)" },
                  "&:disabled": { background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }
                }}
              >
                {isParsingRx ? `Analysing Prescription... ${rxProgress}%` : "Generate Indian Diet Plan"}
              </Button>
              {!uploadedFile && (
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  * Please upload a prescription image or PDF to generate diet plan
                </Typography>
              )}
            </Box>

            {/* Progress Bar during Analysis */}
            {isParsingRx && (
              <Box sx={{ width: "100%", maxWidth: 640, mx: "auto", mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#6C5CE7" }}>
                    {rxProgress < 40
                      ? "Reading prescription text & medications..."
                      : rxProgress < 75
                        ? "Extracting vital parameters & clinical details..."
                        : "Generating personalized Indian diet & electrolyte plan..."}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: "#6C5CE7" }}>
                    {rxProgress}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={rxProgress}
                  sx={{
                    height: 9,
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(108,92,231,0.2)" : "#EDE9FE",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 2,
                      background: "linear-gradient(90deg, #6C5CE7 0%, #00C9A7 100%)"
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        )}

        {/* 3. FROM ANALYSED DATA (SPECIAL SELECT OPTIONS) */}
        {inputMode === "history" && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              mb: 3,
              bgcolor: paperBg,
              borderColor: "rgba(255,183,3,0.3)"
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              mb={2}
              gap={1.5}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <History sx={{ color: "#FFB703", fontSize: 22 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFB703" }}>
                    Select an Already Analysed Patient
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {filteredHistory.length} patient records found · Switch between Card and Table view
                  </Typography>
                </Box>
              </Stack>

              {/* View Switcher: Table vs Cards */}
              <ToggleButtonGroup
                size="small"
                value={historyView}
                exclusive
                onChange={(_, val) => val && setHistoryView(val)}
                sx={{ bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9", borderRadius: 2 }}
              >
                <ToggleButton value="table" sx={{ fontWeight: 700, px: 1.8, fontSize: "0.75rem" }}>
                  <TableRows sx={{ fontSize: 16, mr: 0.8 }} /> Table
                </ToggleButton>
                <ToggleButton value="cards" sx={{ fontWeight: 700, px: 1.8, fontSize: "0.75rem" }}>
                  <ViewAgenda sx={{ fontSize: 16, mr: 0.8 }} /> Cards
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Option A: Active Session Patient Card (if available) */}
            {activeAnalysis?.patientInfo && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2.5,
                  borderRadius: 2,
                  borderColor: "#00C9A7",
                  bgcolor: isDark ? "rgba(0,201,167,0.08)" : "rgba(0,201,167,0.04)"
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                      <Bolt sx={{ color: "#00C9A7" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#00C9A7" }}>
                        Currently Active Patient on Screen
                      </Typography>
                      <Chip label="Current Session" color="success" size="small" sx={{ fontWeight: 800, height: 20 }} />
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {activeAnalysis.patientInfo.patientName} ({activeAnalysis.patientInfo.age}Y,{" "}
                      {activeAnalysis.patientInfo.gender}) — {activeAnalysis.patientInfo.disease}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Safety Score: {activeAnalysis.safetyScore}/100 · {activeAnalysis.medications?.length || 0} Prescribed Medicines
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AutoAwesome />}
                    onClick={loadFromActiveAnalysis}
                    sx={{
                      borderRadius: 1.5,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                      bgcolor: "#00C9A7",
                      "&:hover": { bgcolor: "#00967D" }
                    }}
                  >
                    Select Active Patient
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Search Filter for Analysed History */}
            <Stack direction="row" spacing={1.5} mb={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search patient by name, Rx ID, or health condition..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>

            {filteredHistory.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                {historyList.length === 0
                  ? "No previous prescriptions found. Analyze one on the dashboard or enter details manually."
                  : "No patients matched your search."}
              </Alert>
            ) : historyView === "cards" ? (
              <Grid container spacing={1.5} mb={2}>
                {filteredHistory.map((rec) => {
                  const isSelected = selectedHistoryId === rec.id;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={rec.id}>
                      <Paper
                        variant="outlined"
                        onClick={() => loadPatientRecord(rec)}
                        sx={{
                          p: 1.8,
                          borderRadius: 2,
                          cursor: "pointer",
                          borderColor: isSelected ? rec.color || "#FFB703" : sectionBorder,
                          borderWidth: isSelected ? 2 : 1,
                          bgcolor: isSelected
                            ? isDark
                              ? "rgba(255,183,3,0.12)"
                              : "rgba(255,183,3,0.08)"
                            : paperBg,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: rec.color || "#FFB703",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                          }
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                          <Chip
                            label={rec.id}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: "rgba(255,255,255,0.08)", fontSize: "0.72rem" }}
                          />
                          <Chip
                            label={`${rec.safetyScore}/100`}
                            size="small"
                            sx={{
                              bgcolor: rec.color || "#00C9A7",
                              color: "#FFF",
                              fontWeight: 800,
                              fontSize: "0.72rem"
                            }}
                          />
                        </Stack>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.2 }}>
                          {rec.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {rec.age}Y · {rec.gender} · {rec.date}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDark ? "#94A3B8" : "#475569",
                            display: "block",
                            fontWeight: 600,
                            mt: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {rec.disease}
                        </Typography>
                        {isSelected && (
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
                            label="Selected"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800, mt: 1, width: "100%" }}
                          />
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  mb: 2,
                  bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                  borderColor: sectionBorder,
                  overflowX: "auto"
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontSize: "0.78rem" }}>Rx ID & Date</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: "0.78rem" }}>Patient Details</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: "0.78rem" }}>Medical Condition</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, fontSize: "0.78rem" }}>Safety Score</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, fontSize: "0.78rem" }}>Medicines</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.78rem" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredHistory.map((rec) => {
                      const isSelected = selectedHistoryId === rec.id;
                      return (
                        <TableRow
                          key={rec.id}
                          hover
                          onClick={() => loadPatientRecord(rec)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: isSelected
                              ? isDark
                                ? "rgba(255,183,3,0.12) !important"
                                : "rgba(255,183,3,0.08) !important"
                              : "inherit",
                            "&:hover": {
                              bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9"
                            }
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={rec.id}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.72rem",
                                bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.3 }}>
                              {rec.date}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.85rem" }}>
                              {rec.patientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rec.age}Y · {rec.gender}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                                color: isDark ? "#E2E8F0" : "#334155",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {rec.disease}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${rec.safetyScore}/100`}
                              size="small"
                              sx={{
                                bgcolor: rec.color || "#00C9A7",
                                color: "#FFF",
                                fontWeight: 800,
                                fontSize: "0.72rem"
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${rec.medCount || 0} Meds`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {isSelected ? (
                              <Chip
                                icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
                                label="Selected"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 800 }}
                              />
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadPatientRecord(rec);
                                }}
                                sx={{
                                  borderRadius: 1.5,
                                  fontWeight: 700,
                                  fontSize: "0.72rem",
                                  textTransform: "none",
                                  px: 1.5
                                }}
                              >
                                Select
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {selectedHistoryId && (
              <Fade in>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    mt: 2.5,
                    borderRadius: 2.5,
                    background: isDark
                      ? "linear-gradient(135deg, rgba(0,201,167,0.12) 0%, rgba(108,92,231,0.08) 100%)"
                      : "linear-gradient(135deg, rgba(0,201,167,0.06) 0%, rgba(108,92,231,0.04) 100%)",
                    border: "1.5px solid",
                    borderColor: isDark ? "rgba(0,201,167,0.4)" : "#00C9A7",
                    boxShadow: "0 6px 20px rgba(0,201,167,0.08)"
                  }}
                >
                  {/* Top Bar: Badge & Deselect Action */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    flexWrap="wrap"
                    gap={1}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "#00C9A7",
                          color: "#FFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,201,167,0.4)"
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 900,
                          color: "#00C9A7",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          fontSize: "0.76rem"
                        }}
                      >
                        Loaded Patient for Diet Plan
                      </Typography>
                      <Chip
                        label="Ready for Indian Diet Analysis"
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          height: 22,
                          bgcolor: isDark ? "rgba(0,201,167,0.18)" : "rgba(0,201,167,0.12)",
                          color: isDark ? "#00E0BA" : "#00967D"
                        }}
                      />
                    </Stack>

                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setSelectedHistoryId("");
                        setForm(EMPTY_FORM);
                      }}
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { color: "#FF4D6D", bgcolor: "rgba(255, 77, 109, 0.08)" }
                      }}
                    >
                      ✕ Change Patient
                    </Button>
                  </Stack>

                  {/* Patient Primary Details Summary */}
                  <Box sx={{ mb: 2.5 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1.5}
                      mb={1}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                        {form.patientName}
                      </Typography>
                      <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                        <Chip
                          label={`${form.age} Years`}
                          size="small"
                          sx={{ fontWeight: 800, height: 24, fontSize: "0.75rem" }}
                        />
                        <Chip
                          label={form.gender}
                          size="small"
                          sx={{ fontWeight: 800, height: 24, fontSize: "0.75rem" }}
                        />
                        {form.weightKg && (
                          <Chip
                            icon={<Scale sx={{ fontSize: "14px !important" }} />}
                            label={`${form.weightKg} kg`}
                            size="small"
                            sx={{ fontWeight: 700, height: 24, fontSize: "0.75rem" }}
                          />
                        )}
                      </Stack>
                    </Stack>

                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>
                      <strong>Primary Diagnosis:</strong> {form.disease}
                    </Typography>

                    {/* Vitals quick badges if present */}
                    {(form.bpSystolic || form.hba1c || form.creatinine || form.fastingGlucose) && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} mt={1}>
                        {form.bpSystolic && (
                          <Chip
                            label={`BP: ${form.bpSystolic}/${form.bpDiastolic || "80"} mmHg`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                          />
                        )}
                        {form.hba1c && (
                          <Chip
                            label={`HbA1c: ${form.hba1c}%`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                          />
                        )}
                        {form.fastingGlucose && (
                          <Chip
                            label={`Fasting Sugar: ${form.fastingGlucose} mg/dL`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                          />
                        )}
                        {form.creatinine && (
                          <Chip
                            label={`Creatinine: ${form.creatinine} mg/dL`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                          />
                        )}
                      </Stack>
                    )}
                  </Box>

                  <Divider sx={{ my: 2, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />

                  {/* Clean 2-Column Diet Preferences & Language Form (Zero Overlap) */}
                  <Box>


                    <Grid container spacing={2}>
                      <Grid item xs={12} md={7}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="history-diet-pref-label" sx={{ fontWeight: 600 }}>
                            Dietary Preference / भोजन का प्रकार
                          </InputLabel>
                          <Select
                            labelId="history-diet-pref-label"
                            label="Dietary Preference / भोजन का प्रकार"
                            value={form.dietaryPreference}
                            onChange={(e) => updateForm("dietaryPreference", e.target.value)}
                            sx={{
                              borderRadius: 1.5,
                              bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"
                            }}
                          >
                            {DIETARY_PREFERENCES.map((pref) => (
                              <MenuItem key={pref} value={pref} sx={{ fontWeight: 600, py: 1 }}>
                                {pref}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="history-diet-lang-label" sx={{ fontWeight: 600 }}>
                            Diet Plan Language / भाषा
                          </InputLabel>
                          <Select
                            labelId="history-diet-lang-label"
                            label="Diet Plan Language / भाषा"
                            value={form.language}
                            onChange={(e) => updateForm("language", e.target.value)}
                            sx={{
                              borderRadius: 1.5,
                              bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"
                            }}
                          >
                            {DIET_LANGUAGES.map((lang) => (
                              <MenuItem key={lang.value} value={lang.value} sx={{ fontWeight: 700, py: 1 }}>
                                {lang.value === "Hindi" ? "🇮🇳 " : lang.value === "English" ? "🇬🇧 " : "🗣️ "}
                                {lang.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Fade>
            )}
          </Paper>
        )}



        {/* Generate Button Section (For Manual Entry & Selected Patient) */}
        {inputMode !== "prescription" && (
          <Box sx={{ textAlign: "center", my: 3.5 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateDiet}
              disabled={isGenerating || !form.patientName || !form.age || !form.gender || !form.disease}
              startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
              sx={{
                borderRadius: "50px",
                px: { xs: 4, sm: 6 },
                py: 1.8,
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                fontWeight: 900,
                background: "linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)",
                boxShadow: "0 8px 32px rgba(0,201,167,0.35)",
                "&:hover": { background: "linear-gradient(135deg, #00B395 0%, #5a4bd1 100%)" },
                "&:disabled": { background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }
              }}
            >
              {isGenerating ? `Analysing Clinical Profile... ${genProgress}%` : "Generate Indian Diet Plan"}
            </Button>
            {(!form.patientName || !form.age || !form.gender || !form.disease) && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                * Patient Name, Age, Gender, and Medical Condition required
              </Typography>
            )}
          </Box>
        )}

        {isGenerating && (
          <Box sx={{ mb: 3, maxWidth: 640, mx: "auto" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#00C9A7" }}>
                {genProgress < 30
                  ? "Assessing kidney function, blood sugar & clinical health..."
                  : genProgress < 65
                    ? "Structuring authentic Indian meal timings & portion sizes..."
                    : genProgress < 90
                      ? "Balancing potassium, sodium & daily hydration needs..."
                      : "Finalizing patient-friendly Indian diet chart..."}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color: "#00C9A7" }}>
                {genProgress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={genProgress}
              sx={{
                height: 10,
                borderRadius: 2,
                bgcolor: isDark ? "rgba(0,201,167,0.15)" : "#E6FAF6",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #00C9A7, #6C5CE7)"
                }
              }}
            />
          </Box>
        )}

        {/* =========================================================================
            VISUAL & SIMPLE DIET PLAN RESULTS SECTION
           ========================================================================= */}
        {aiDietPlan && (
          <Box id="diet-plan-result">


            {/* 1. HERO VISUAL PLAN CARD */}
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2.5, md: 3.5 },
                mb: 3,
                borderRadius: 2.5,
                background: isDark
                  ? "linear-gradient(135deg, rgba(0,201,167,0.16) 0%, rgba(108,92,231,0.14) 100%)"
                  : "linear-gradient(135deg, rgba(0,201,167,0.1) 0%, rgba(108,92,231,0.08) 100%)",
                borderColor: "#00C9A7",
                boxShadow: "0 8px 30px rgba(0,201,167,0.12)"
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2.5}
              >
                <Box sx={{ maxWidth: 700 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                    <Box
                      sx={{
                        bgcolor: "#00C9A7",
                        color: "#FFF",
                        p: 1,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <LocalDining sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: isDark ? "#26e7c6" : "#00967D" }}>
                      {aiDietPlan.planName}
                    </Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: isDark ? "#E2E8F0" : "#334155", lineHeight: 1.6, fontSize: "0.95rem" }}>
                    {aiDietPlan.summary}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
                      label={`Patient: ${form.patientName} (${form.age}Y, ${form.gender})`}
                      size="small"
                      sx={{ fontWeight: 700, bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#FFF" }}
                    />
                    <Chip
                      icon={<Spa sx={{ fontSize: "14px !important" }} />}
                      label={form.dietaryPreference}
                      size="small"
                      color="secondary"
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      icon={<Translate sx={{ fontSize: "14px !important" }} />}
                      label={`Language: ${form.language || "Hindi"}`}
                      size="small"
                      sx={{ fontWeight: 700, bgcolor: "rgba(108,92,231,0.15)", color: "#6C5CE7" }}
                    />
                  </Stack>
                </Box>

                {/* Calorie Goal Visual Circle/Card */}
                <Paper
                  elevation={0}
                  sx={{
                    px: 3.5,
                    py: 2,
                    borderRadius: 3,
                    bgcolor: "#00C9A7",
                    color: "#FFF",
                    textAlign: "center",
                    flexShrink: 0,
                    boxShadow: "0 8px 24px rgba(0,201,167,0.4)"
                  }}
                >
                  <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1.5, opacity: 0.9 }}>
                    Daily Energy Goal
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, my: 0.2 }}>
                    {aiDietPlan.targetCalories}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, opacity: 0.95 }}>
                    Calories / Day
                  </Typography>
                </Paper>
              </Stack>
            </Paper>

            {/* Crucial Safety Alert (if any) */}
            {aiDietPlan.avoidanceAlerts?.length > 0 && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} icon={<Warning />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Crucial Safety Alerts:
                </Typography>
                <Stack spacing={0.4}>
                  {aiDietPlan.avoidanceAlerts.map((a, i) => (
                    <Typography key={i} variant="body2">
                      • {a}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            )}

            {/* 2. DAILY INDIAN MEAL SCHEDULE & PORTIONS (EDITABLE POPUP + CARDS/TABLE VIEW) */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.8,
                mb: 3,
                borderRadius: 2.5,
                bgcolor: paperBg,
                borderTop: "4px solid #6C5CE7"
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                mb={2.5}
                gap={1.5}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Schedule sx={{ color: "#6C5CE7" }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#6C5CE7" }}>
                      Daily Indian Meal Schedule & Portions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {aiDietPlan.mealSchedule?.length || 0} Meal Slots · Completely customizable
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  {/* EDIT / CUSTOMIZE MEALS POPUP BUTTON */}
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Edit />}
                    onClick={handleOpenEditMeals}
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2,
                      px: 2.2,
                      py: 0.8,
                      fontSize: "0.82rem",
                      boxShadow: "0 4px 14px rgba(108,92,231,0.35)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Edit / Customize Meals
                  </Button>

                  {/* View Switcher: Cards vs Table */}
                  <ToggleButtonGroup
                    size="small"
                    value={mealScheduleView}
                    exclusive
                    onChange={(_, val) => val && setMealScheduleView(val)}
                    sx={{ bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9", borderRadius: 2 }}
                  >
                    <ToggleButton value="cards" sx={{ fontWeight: 700, px: 1.8, fontSize: "0.75rem" }}>
                      <ViewAgenda sx={{ fontSize: 16, mr: 0.8 }} /> Cards
                    </ToggleButton>
                    <ToggleButton value="table" sx={{ fontWeight: 700, px: 1.8, fontSize: "0.75rem" }}>
                      <TableRows sx={{ fontSize: 16, mr: 0.8 }} /> Table
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>

              {/* VIEW 1: VISUAL MEAL CARDS (WITH INLINE EDIT & DELETE) */}
              {mealScheduleView === "cards" && (
                <Grid container spacing={2}>
                  {aiDietPlan.mealSchedule?.map((item, idx) => {
                    const visual = getMealVisual(item.mealName, item.time);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.2,
                            borderRadius: 2,
                            bgcolor: isDark ? `${visual.color}0A` : `${visual.color}06`,
                            border: `1.5px solid ${visual.color}35`,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            transition: "all 0.2s ease",
                            position: "relative",
                            "&:hover": {
                              borderColor: visual.color,
                              transform: "translateY(-2px)",
                              boxShadow: `0 6px 18px ${visual.color}15`
                            }
                          }}
                        >
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                              <Chip
                                icon={visual.icon}
                                label={item.time}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: `${visual.color}18`,
                                  color: visual.color,
                                  fontSize: "0.75rem"
                                }}
                              />
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Chip
                                  label={item.portion}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#FFF",
                                    fontSize: "0.72rem",
                                    border: "1px solid rgba(0,0,0,0.08)"
                                  }}
                                />
                                <Tooltip title="Edit this meal">
                                  <IconButton
                                    size="small"
                                    onClick={handleOpenEditMeals}
                                    sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "#6C5CE7" } }}
                                  >
                                    <Edit sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete meal slot">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteMealSlotDirect(idx)}
                                    sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "#FF4D6D" } }}
                                  >
                                    <Delete sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>

                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: visual.color, mb: 0.5 }}>
                              {item.mealName}
                            </Typography>

                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 1.5, lineHeight: 1.5 }}>
                              {item.focus}
                            </Typography>
                          </Box>

                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.2,
                              borderRadius: 1.5,
                              bgcolor: isDark ? "rgba(0,0,0,0.2)" : "#FFFFFF",
                              borderColor: "rgba(0,0,0,0.06)"
                            }}
                          >
                            <Typography variant="caption" sx={{ color: isDark ? "#94A3B8" : "#64748B", fontStyle: "italic", display: "block" }}>
                              💡 {item.clinicalNote}
                            </Typography>
                          </Paper>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {/* VIEW 2: DETAILED TABLE WITH ACTIONS */}
              {mealScheduleView === "table" && (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: isDark ? "rgba(108,92,231,0.15)" : "rgba(108,92,231,0.06)" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Meal Slot</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Household Portion</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Recommended Indian Food & Ingredients</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Why This Helps</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {aiDietPlan.mealSchedule?.map((item, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 800, color: "#00C9A7", whiteSpace: "nowrap" }}>
                            {item.time}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{item.mealName}</TableCell>
                          <TableCell sx={{ color: "text.secondary", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                            {item.portion}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{item.focus}</TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                              {item.clinicalNote}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={handleOpenEditMeals} sx={{ color: "#6C5CE7" }}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleDeleteMealSlotDirect(idx)} sx={{ color: "#FF4D6D" }}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            {/* 3. VISUAL ELECTROLYTE TRAFFIC LIGHT WATCH */}
            <Paper variant="outlined" sx={{ p: 2.8, mb: 3, borderRadius: 2.5, bgcolor: paperBg }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <MonitorHeart sx={{ color: "#FFB703" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  Electrolyte & Organ Safety Check (Salt, Potassium & Minerals)
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                {[
                  {
                    mineral: "Salt (Sodium Na)",
                    badge: "Strict Salt Control",
                    statusColor: "#FFB703",
                    icon: "🧂",
                    text: aiDietPlan.electrolyteLimits.sodium,
                    simpleRule: "Zero pickles, zero papad, no extra table salt"
                  },
                  {
                    mineral: "Potassium (K)",
                    badge: "Heart & Kidney Balance",
                    statusColor: "#00B4D8",
                    icon: "🍌",
                    text: aiDietPlan.electrolyteLimits.potassium,
                    simpleRule: "Moderate tender coconut water, amla & bottle gourd"
                  },
                  {
                    mineral: "Phosphorus (P)",
                    badge: "Kidney Safe",
                    statusColor: "#6C5CE7",
                    icon: "⚡",
                    text: aiDietPlan.electrolyteLimits.phosphorus,
                    simpleRule: "Light yellow dals, avoid heavily processed cheeses"
                  },
                  {
                    mineral: "Calcium (Ca)",
                    badge: "Strong Bones",
                    statusColor: "#00C9A7",
                    icon: "🥛",
                    text: aiDietPlan.electrolyteLimits.calcium,
                    simpleRule: "1 bowl fresh curd and 1 cup skimmed milk daily"
                  }
                ].map((el) => (
                  <Grid item xs={12} sm={6} md={3} key={el.mineral}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? `${el.statusColor}0C` : `${el.statusColor}08`,
                        border: `1px solid ${el.statusColor}35`,
                        height: "100%"
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography sx={{ fontSize: "1.3rem" }}>{el.icon}</Typography>
                        <Chip
                          label={el.badge}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: `${el.statusColor}20`,
                            color: el.statusColor,
                            fontSize: "0.7rem",
                            height: 22
                          }}
                        />
                      </Stack>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {el.mineral}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600, mb: 1, color: isDark ? "#CBD5E1" : "#475569" }}>
                        {el.text}
                      </Typography>
                      <Typography variant="caption" sx={{ color: el.statusColor, fontWeight: 700, display: "block" }}>
                        👉 {el.simpleRule}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* 5. SIDE-BY-SIDE: "EAT THIS 🟢" vs "AVOID THIS 🔴" */}
            <Grid container spacing={2.5} mb={3}>
              {/* Eat This Card */}
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.8,
                    borderRadius: 2.5,
                    bgcolor: paperBg,
                    border: "1.5px solid rgba(0, 201, 167, 0.4)",
                    height: "100%"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Box sx={{ bgcolor: "rgba(0, 201, 167, 0.15)", p: 0.8, borderRadius: 1.5 }}>
                      <CheckCircle sx={{ color: "#00C9A7" }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#00C9A7" }}>
                        Eat More Of These Wholesome Indian Foods
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Gentle on sugar, blood pressure, and digestion
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={1.2}>
                    {aiDietPlan.recommendedFoods.map((rf, i) => (
                      <Paper
                        key={i}
                        variant="outlined"
                        sx={{
                          p: 1.3,
                          borderRadius: 1.5,
                          bgcolor: isDark ? "rgba(0, 201, 167, 0.06)" : "rgba(0, 201, 167, 0.04)",
                          borderColor: "rgba(0, 201, 167, 0.2)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.2
                        }}
                      >
                        <CheckCircle sx={{ color: "#00C9A7", fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          {rf}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              {/* Avoid This Card */}
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.8,
                    borderRadius: 2.5,
                    bgcolor: paperBg,
                    border: "1.5px solid rgba(255, 77, 109, 0.4)",
                    height: "100%"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Box sx={{ bgcolor: "rgba(255, 77, 109, 0.15)", p: 0.8, borderRadius: 1.5 }}>
                      <Warning sx={{ color: "#FF4D6D" }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#FF4D6D" }}>
                        Foods to Avoid Or Strictly Limit
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        High salt, deep-fried oil, or instant sugar spikes
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={1.2}>
                    {aiDietPlan.foodsToAvoid.map((fa, i) => (
                      <Paper
                        key={i}
                        variant="outlined"
                        sx={{
                          p: 1.3,
                          borderRadius: 1.5,
                          bgcolor: isDark ? "rgba(255, 77, 109, 0.06)" : "rgba(255, 77, 109, 0.04)",
                          borderColor: "rgba(255, 77, 109, 0.2)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.2
                        }}
                      >
                        <Warning sx={{ color: "#FF4D6D", fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          {fa}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* 5. VISUAL INDIAN SPICE BOX (MASALA DABBA 🌶️) */}
            {aiDietPlan.indianSpiceTherapy?.length > 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.8,
                  mb: 3,
                  borderRadius: 2.5,
                  bgcolor: paperBg,
                  borderColor: "rgba(255,183,3,0.3)"
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <EmojiNature sx={{ color: "#FFB703", fontSize: 24 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#FFB703" }}>
                      Indian Spice Therapy: Healing Spices in Your Kitchen
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Natural ayurvedic and kitchen spices that improve insulin response and digestion
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={1.5}>
                  {aiDietPlan.indianSpiceTherapy.map((s, i) => (
                    <Grid item xs={12} sm={6} md={2.4} key={i}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          textAlign: "center",
                          bgcolor: isDark ? "rgba(255,183,3,0.08)" : "rgba(255,183,3,0.05)",
                          border: "1px solid rgba(255,183,3,0.25)",
                          height: "100%"
                        }}
                      >
                        <Box sx={{ fontSize: "2rem", mb: 0.5 }}>🌿</Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#FFB703", mb: 0.5 }}>
                          {s.spice}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: "block" }}>
                          {s.benefit}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* 7. HYDRATION, LIFESTYLE & FOLLOW-UP CARDS */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: paperBg,
                    borderColor: "rgba(0,180,216,0.3)",
                    height: "100%"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <WaterDrop sx={{ color: "#00B4D8" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#00B4D8" }}>
                      Hydration & Healthy Fluids
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                    {aiDietPlan.hydrationGuidance}
                  </Typography>
                  <Stack direction="row" spacing={0.5} mt={2}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 22,
                          height: 30,
                          borderRadius: 1,
                          bgcolor: "rgba(0, 180, 216, 0.2)",
                          border: "1.5px solid #00B4D8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "#00B4D8",
                          fontWeight: 800
                        }}
                      >
                        💧
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={5}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: paperBg,
                    borderColor: "rgba(6,214,160,0.3)",
                    height: "100%"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <FitnessCenter sx={{ color: "#06D6A0", fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#06D6A0" }}>
                      Healthy Daily Habits
                    </Typography>
                  </Stack>
                  <Stack spacing={0.8}>
                    {aiDietPlan.lifestyleAdvice?.map((tip, i) => (
                      <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                        <CheckCircle sx={{ color: "#06D6A0", fontSize: 16, mt: 0.3, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: "0.82rem", lineHeight: 1.4 }}>
                          {tip}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: paperBg,
                    borderColor: "rgba(108,92,231,0.3)",
                    height: "100%"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <MonitorHeart sx={{ color: "#6C5CE7", fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#6C5CE7" }}>
                      Doctor Follow-Up
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontSize: "0.85rem", fontStyle: "italic", color: "text.secondary", lineHeight: 1.5 }}>
                    {aiDietPlan.followUpNote}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Bottom Actions */}
            <Box textAlign="center" mt={3.5}>
              <Button
                variant="outlined"
                disabled={isGenerating}
                startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                onClick={handleGenerateDiet}
                sx={{ fontWeight: 800, borderRadius: "50px", px: 4, py: 1 }}
              >
                {isGenerating ? `Analysing... ${genProgress}%` : "Regenerate Indian Diet Plan"}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>

      {/* =========================================================================
          POPUP MODAL: EDIT DAILY INDIAN MEAL SCHEDULE & PORTIONS
         ========================================================================= */}
      <Dialog
        open={editMealsOpen}
        onClose={() => setEditMealsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            p: 1,
            bgcolor: isDark ? "#1E293B" : "#FFFFFF",
            backgroundImage: "none"
          }
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ bgcolor: "rgba(108,92,231,0.15)", p: 0.8, borderRadius: 1.5 }}>
              <Edit sx={{ color: "#6C5CE7" }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Customize Daily Indian Meal Schedule & Portions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Change timings, food items, portions, or add and delete meal slots
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setEditMealsOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ my: 2.5 }}>

          <Stack spacing={2.5}>
            {tempMealSchedule.map((meal, index) => {
              const isCustom = meal.slotType === "Custom";
              const selectValue = isCustom
                ? "Custom"
                : (meal.slotType || (MEAL_SLOT_OPTIONS.some((o) => o.value === meal.mealName) ? meal.mealName : "Custom"));
              const displayTitle = isCustom
                ? (meal.customMealName?.trim() || meal.mealName?.trim() || "Custom Meal")
                : (meal.slotType || meal.mealName || `Meal Slot #${index + 1}`);

              return (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{
                    p: 2.2,
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                    position: "relative"
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Chip
                      label={`Meal Slot #${index + 1}: ${displayTitle}`}
                      color="secondary"
                      size="small"
                      sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                    />
                    <Tooltip title="Delete this meal slot">
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteTempMeal(index)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          borderRadius: 1.5,
                          px: 1.2
                        }}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </Stack>

                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Time"
                        placeholder="e.g. 06:30 AM"
                        value={meal.time}
                        onChange={(e) => handleUpdateTempMeal(index, "time", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={isCustom ? 4.5 : 5}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Meal Slot Name"
                        value={selectValue}
                        onChange={(e) => handleSlotTypeChange(index, e.target.value)}
                      >
                        {MEAL_SLOT_OPTIONS.map((opt, i) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {i + 1}. {opt.label}
                          </MenuItem>
                        ))}
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem value="Custom" sx={{ fontWeight: 800, color: "#6C5CE7" }}>
                          ✏️ Custom (Choose Custom to give it your own name)
                        </MenuItem>
                      </TextField>
                    </Grid>

                    {isCustom && (
                      <Grid item xs={12} sm={4.5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Custom Meal Slot Name"
                          placeholder="e.g. Post-Workout Snack, Mid-Afternoon Tea"
                          value={meal.customMealName ?? ""}
                          onChange={(e) => handleCustomMealNameChange(index, e.target.value)}
                          helperText="Type any custom name for this slot"
                          sx={{
                            bgcolor: isDark ? "rgba(108,92,231,0.08)" : "rgba(108,92,231,0.04)",
                            borderRadius: 1
                          }}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} sm={isCustom ? 12 : 4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Household Portion"
                        placeholder="e.g. 2 Phulkas + 1 Katori Dal"
                        value={meal.portion}
                        onChange={(e) => handleUpdateTempMeal(index, "portion", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        label="Recommended Indian Food & Ingredients"
                        placeholder="e.g. 2 Jowar Rotis (no ghee) + 1 Katori Yellow Moong Dal + Lauki Sabzi + Cucumber Salad + 1 Glass Spiced Chaas"
                        value={meal.focus}
                        onChange={(e) => handleUpdateTempMeal(index, "focus", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Why This Helps (Plain Language Benefit)"
                        placeholder="e.g. Delivers slow-burning morning energy and prevents sudden sugar jumps"
                        value={meal.clinicalNote}
                        onChange={(e) => handleUpdateTempMeal(index, "clinicalNote", e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>

          {/* Add New Meal Slot Button */}
          <Box mt={2.5} textAlign="center">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Add />}
              onClick={handleAddTempMeal}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                px: 3,
                py: 1,
                borderStyle: "dashed"
              }}
            >
              Add New Meal Slot
            </Button>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
            gap: 1
          }}
        >
          <Button
            onClick={() => setEditMealsOpen(false)}
            sx={{ color: "text.secondary", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircle />}
            onClick={handleSaveMealSchedule}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              px: 3,
              bgcolor: "#00C9A7",
              boxShadow: "0 4px 14px rgba(0,201,167,0.35)",
              "&:hover": { bgcolor: "#00967D" }
            }}
          >
            Save & Apply Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Printable Clinical Diet Prescription Dialog */}
      <Dialog
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: "#FFFFFF !important",
            color: "#0F172A !important",
            backgroundImage: "none !important"
          }
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#FFFFFF !important",
            borderBottom: "1px solid #E2E8F0 !important"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocalHospital sx={{ color: "#00C9A7" }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A !important" }}>
              Official Indian Clinical Dietary Prescription
            </Typography>
          </Stack>
          <IconButton onClick={() => setPrintOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent id="printable-diets" sx={{ p: 4, bgcolor: "#FFFFFF !important", color: "#1E293B !important" }}>
          <Box sx={{ border: "2px solid #00C9A7", borderRadius: 2, p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#00967D !important", mb: 0.5 }}>
              ARPAN CLINICAL ASSISTANT — CLINICAL NUTRITION DEPARTMENT
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "#475569 !important", mb: 2 }}>
              Personalized Indian Clinical Dietary & Electrolyte Prescription
            </Typography>
            <Divider sx={{ mb: 2, borderColor: "#E2E8F0 !important" }} />
            {aiDietPlan && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A !important", mb: 1 }}>
                  Patient: {form.patientName} ({form.age}Y, {form.gender}) | Condition: {form.disease}
                  {form.weightKg ? ` | Weight: ${form.weightKg}kg` : ""}
                  {bmiVal > 0 ? ` | BMI: ${bmi} kg/m²` : ""} | Dietary Preference: {form.dietaryPreference} | Language: {form.language || "Hindi"}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#00967D !important", mb: 0.5 }}>
                  Prescribed Protocol: {aiDietPlan.planName} (Target: {aiDietPlan.targetCalories} kcal/day)
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569 !important", mb: 2 }}>
                  {aiDietPlan.summary}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: "#00967D !important" }}>
                  Daily Indian Meal Schedule:
                </Typography>
                {aiDietPlan.mealSchedule?.map((ms, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, color: "#334155 !important" }}>
                    <strong style={{ color: "#0F172A" }}>
                      {ms.time} ({ms.mealName}) [{ms.portion}]:
                    </strong>{" "}
                    {ms.focus} — <em>{ms.clinicalNote}</em>
                  </Typography>
                ))}

                <Divider sx={{ my: 2, borderColor: "#E2E8F0 !important" }} />
                <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                  <strong>Electrolyte Limits:</strong> Sodium: {aiDietPlan.electrolyteLimits.sodium} | Potassium:{" "}
                  {aiDietPlan.electrolyteLimits.potassium} | Phosphorus: {aiDietPlan.electrolyteLimits.phosphorus}
                </Typography>
                <Typography variant="body2" sx={{ color: "#334155 !important", mb: 2 }}>
                  <strong>Hydration:</strong> {aiDietPlan.hydrationGuidance}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B !important", display: "block" }}>
                  Doctor Follow-Up: {aiDietPlan.followUpNote}
                </Typography>
              </>
            )}
            <Divider sx={{ my: 2, borderColor: "#E2E8F0 !important" }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Verified sx={{ color: "#00C9A7" }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569 !important" }}>
                Digitally Verified by Clinical Nutrition Specialist · Arpan Clinical Care OS
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#FFFFFF !important", borderTop: "1px solid #E2E8F0 !important" }}>
          <Button
            onClick={() => setPrintOpen(false)}
            variant="outlined"
            sx={{ color: "#475569 !important", borderColor: "#CBD5E1 !important" }}
          >
            Close
          </Button>
          <Button
            onClick={() => window.print()}
            variant="contained"
            color="primary"
            startIcon={<Print />}
            sx={{ bgcolor: "#00C9A7 !important", fontWeight: 800 }}
          >
            Print Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
