"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Fade from "@mui/material/Fade";
import InputAdornment from "@mui/material/InputAdornment";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import TablePagination from "@mui/material/TablePagination";
import { useTheme } from "@mui/material/styles";
import {
  Restaurant, Scale, Print, CheckCircle, Warning, Info, Schedule, Close,
  Verified, LocalHospital, Delete, Edit, Add,
  History, AutoAwesome, SmartToy, FileUpload, ContentPaste,
  EmojiNature, MonitorHeart, WaterDrop, LocalDining, Refresh,
  CheckCircleOutline, FitnessCenter, Upload, Search, Bolt, Spa,
  ViewAgenda, TableRows, WbSunny, Bedtime, FreeBreakfast, LunchDining,
  LocalCafe, Nightlife, Translate, Psychology
} from "@mui/icons-material";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useAppSelector } from "../redux/hooks";
import { HistoryRecord, DietHistoryRecord } from "../types/clinical";
import DietAnalysisLoader from "./DietAnalysisLoader";
import DietHistoryTable from "./DietHistoryTable";

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
  electrolyteLimits: {
    sodium: string;
    potassium: string;
    phosphorus: string;
    calcium: string;
    magnesium?: string;
    iron?: string;
    vitaminD?: string;
    vitaminB12?: string;
    uricAcid?: string;
  };
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
  customCalories: string;
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
  customCalories: "",
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

  // Separate History Analysed Patient Form State (does NOT overwrite Manual Entry)
  const [historyForm, setHistoryForm] = useState<PatientFormData | null>(null);

  const updateHistoryForm = (field: keyof PatientFormData, value: string) =>
    setHistoryForm((prev) => (prev ? { ...prev, [field]: value } : null));

  // Separate Prescription Upload Preferences State (does NOT overwrite Manual Entry)
  const [rxFormPreferences, setRxFormPreferences] = useState({
    dietaryPreference: "Vegetarian (Shakahari)",
    language: "Hindi",
    customCalories: ""
  });

  // Prescription Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [isParsingRx, setIsParsingRx] = useState(false);
  const [rxParsed, setRxParsed] = useState(false);

  // Redux: Active analysis & History records
  const authUser = useAppSelector((s: any) => s.auth?.currentUser || s.auth?.user);
  const activeAnalysis = useAppSelector((s: any) => s.clinical.analysisResult);
  const historyList: HistoryRecord[] = useAppSelector((s: any) => s.clinical.historyList) ?? [];

  const [historySearch, setHistorySearch] = useState("");
  const [debouncedHistorySearch, setDebouncedHistorySearch] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");

  // Paginated History Patient state (fetches full archive with 5, 10, 15, 20 per page)
  const [historyPatients, setHistoryPatients] = useState<HistoryRecord[]>(historyList);
  const [historyTotalRecords, setHistoryTotalRecords] = useState<number>(historyList.length);
  const [historyPage, setHistoryPage] = useState<number>(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState<number>(5);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHistorySearch(historySearch.trim());
      setHistoryPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [historySearch]);

  const fetchHistoryPatients = useCallback(async (
    targetPage: number = historyPage,
    searchQuery: string = debouncedHistorySearch,
    currentLimit: number = historyRowsPerPage
  ) => {
    setHistoryLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("arpan_auth_token") : "";
      const apiPage = targetPage + 1;
      const params = new URLSearchParams({
        page: apiPage.toString(),
        limit: currentLimit.toString(),
      });
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/history?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setHistoryPatients(json.data);
          setHistoryTotalRecords(json.pagination?.totalRecords ?? json.data.length);
        }
      }
    } catch (err) {
      console.error("Error fetching patients for diets:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, debouncedHistorySearch, historyRowsPerPage]);

  useEffect(() => {
    fetchHistoryPatients(historyPage, debouncedHistorySearch, historyRowsPerPage);
  }, [historyPage, debouncedHistorySearch, historyRowsPerPage, fetchHistoryPatients]);

  // Visual View toggle for meal schedule
  const [mealScheduleView, setMealScheduleView] = useState<"cards" | "table">("cards");
  // View toggle for history patients (table vs cards) - defaulted to table view
  const [historyView, setHistoryView] = useState<"cards" | "table">("table");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [aiDietPlan, setAiDietPlan] = useState<AIDietPlan | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [dietRefreshKey, setDietRefreshKey] = useState<number>(0);
  const [rxProgress, setRxProgress] = useState(0);

  // Editable Meal Schedule Popup State
  const [editMealsOpen, setEditMealsOpen] = useState(false);
  const [tempMealSchedule, setTempMealSchedule] = useState<EditableMealSlot[]>([]);

  // Editable Overview (Plan Name, Daily Target Calories, Summary)
  const [editOverviewOpen, setEditOverviewOpen] = useState(false);
  const [tempOverview, setTempOverview] = useState({ planName: "", targetCalories: 1750, summary: "" });

  // Editable Electrolytes & Organ Safety (9 items)
  const [editElectrolytesOpen, setEditElectrolytesOpen] = useState(false);
  const [tempElectrolytes, setTempElectrolytes] = useState({
    sodium: "",
    potassium: "",
    phosphorus: "",
    calcium: "",
    magnesium: "",
    iron: "",
    vitaminD: "",
    vitaminB12: "",
    uricAcid: ""
  });

  // Editable Recommended Foods
  const [editRecFoodsOpen, setEditRecFoodsOpen] = useState(false);
  const [tempRecFoods, setTempRecFoods] = useState<string[]>([]);

  // Editable Foods to Avoid
  const [editAvoidFoodsOpen, setEditAvoidFoodsOpen] = useState(false);
  const [tempAvoidFoods, setTempAvoidFoods] = useState<string[]>([]);

  // Editable Crucial Safety Alerts
  const [editAlertsOpen, setEditAlertsOpen] = useState(false);
  const [tempAlerts, setTempAlerts] = useState<string[]>([]);

  // Editable Guidance & Habits (Hydration, Lifestyle Advice, Follow-Up)
  const [editGuidanceOpen, setEditGuidanceOpen] = useState(false);
  const [tempGuidance, setTempGuidance] = useState({
    hydrationGuidance: "",
    lifestyleAdvice: [] as string[],
    followUpNote: ""
  });

  // Filter history records
  const filteredHistory = historyPatients;

  // Active AI Provider state
  const [activeAiProvider, setActiveAiProvider] = useState<'gemini' | 'deepseek'>('deepseek');
  const [dietAiProvider, setDietAiProvider] = useState<string>('deepseek');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAiChanged = (e: any) => {
        if (e.detail?.provider) {
          setActiveAiProvider(e.detail.provider);
        }
      };
      window.addEventListener('ai-provider-changed', handleAiChanged);
      fetch('/api/admin/ai-settings')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.activeProvider) {
            setActiveAiProvider(d.activeProvider);
          }
        })
        .catch(() => {});
      return () => window.removeEventListener('ai-provider-changed', handleAiChanged);
    }
  }, []);

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
            dietaryPreference: rxFormPreferences.dietaryPreference,
            language: rxFormPreferences.language || "Hindi",
            customCalories: rxFormPreferences.customCalories
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
    setHistoryForm({
      patientName: record.patientName || pi.patientName || "",
      age: String(record.age || pi.age || ""),
      gender: record.gender || pi.gender || "Male",
      weightKg: String(pi.weight || ""),
      heightCm: "",
      disease: record.disease || pi.disease || "",
      dietaryPreference: "Vegetarian (Shakahari)",
      language: "Hindi",
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
      totalCholesterol: String(pi.totalCholesterol || ""),
      customCalories: ""
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
    setHistoryForm({
      patientName: pi.patientName || "",
      age: String(pi.age || ""),
      gender: pi.gender || "Male",
      weightKg: String(pi.weight || ""),
      heightCm: "",
      disease: pi.disease || "",
      dietaryPreference: "Vegetarian (Shakahari)",
      language: "Hindi",
      customCalories: "",
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
    const activeForm = inputMode === "history" ? historyForm : form;
    if (!activeForm || !activeForm.patientName || !activeForm.age || !activeForm.gender || !activeForm.disease) {
      toast.error(inputMode === "history" ? "Please select a patient from analysed records first." : "Please enter Patient Name, Age, Gender, and Medical Condition.");
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
      const activeWeight = Number(activeForm.weightKg) || 0;
      const activeHeight = Number(activeForm.heightCm) / 100 || 0;
      const calculatedBmi = activeHeight > 0 && activeWeight > 0 ? (activeWeight / (activeHeight * activeHeight)).toFixed(1) : undefined;
      const res = await fetch("/api/diet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...activeForm, bmi: calculatedBmi ? parseFloat(calculatedBmi) : undefined })
      });
      const json = await res.json();
      clearInterval(progressTimer);
      setGenProgress(100);
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to generate diet plan.");
        return;
      }
      setAiDietPlan(json.data);
      if (json.provider) {
        setDietAiProvider(json.provider);
      } else {
        setDietAiProvider(activeAiProvider);
      }
      confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
      toast.success("Indian Diet & Electrolyte Plan ready!");

      // Persist to MongoDB archive via /api/diet/history (auto prunes to latest 2000 records)
      try {
        await fetch("/api/diet/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            patientName: activeForm.patientName,
            age: activeForm.age,
            gender: activeForm.gender,
            disease: activeForm.disease,
            dietaryPreference: activeForm.dietaryPreference || "Vegetarian (Shakahari)",
            targetCalories: json.data?.targetCalories || Number(activeForm.customCalories) || 1750,
            language: activeForm.language || "Hindi",
            planName: json.data?.planName || "Indian Clinical Diet Plan",
            summary: json.data?.summary || "",
            dietPlan: json.data,
            patientForm: activeForm,
            analysedBy: authUser?.name || "Dr. Yashwant Dubey",
          }),
        });
        setDietRefreshKey((prev) => prev + 1);
      } catch (saveErr) {
        console.warn("Failed to save diet plan history to MongoDB:", saveErr);
      }

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

  // Load saved diet plan record from MongoDB history table
  const handleLoadDietRecord = (record: DietHistoryRecord) => {
    if (record.patientForm) {
      setForm((prev) => ({
        ...prev,
        ...record.patientForm,
      }));
      setHistoryForm(record.patientForm);
    } else {
      const restored = {
        ...EMPTY_FORM,
        patientName: record.patientName,
        age: String(record.age || ""),
        gender: record.gender || "Male",
        disease: record.disease || "",
        dietaryPreference: record.dietaryPreference || "Vegetarian (Shakahari)",
        language: record.language || "Hindi",
        customCalories: String(record.targetCalories || "1750"),
      };
      setForm(restored);
      setHistoryForm(restored);
    }
    if (record.dietPlan) {
      setAiDietPlan(record.dietPlan);
    }
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
    toast.success(`Loaded clinical nutrition plan for: ${record.patientName}`);
    setTimeout(() => {
      const el = document.getElementById("diet-plan-result");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  // Open printable diet sheet directly from history record
  const handlePrintDietRecord = (record: DietHistoryRecord) => {
    if (record.dietPlan) {
      setAiDietPlan(record.dietPlan);
    }
    setPrintOpen(true);
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

  // 1. Overview Edit Handlers
  const handleOpenEditOverview = () => {
    if (!aiDietPlan) return;
    setTempOverview({
      planName: aiDietPlan.planName || "",
      targetCalories: aiDietPlan.targetCalories || 1750,
      summary: aiDietPlan.summary || ""
    });
    setEditOverviewOpen(true);
  };

  const handleSaveOverview = () => {
    if (!aiDietPlan) return;
    setAiDietPlan({
      ...aiDietPlan,
      planName: tempOverview.planName.trim() || aiDietPlan.planName,
      targetCalories: Number(tempOverview.targetCalories) || aiDietPlan.targetCalories,
      summary: tempOverview.summary.trim() || aiDietPlan.summary
    });
    setEditOverviewOpen(false);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
    toast.success("Diet plan overview updated!");
  };

  // 2. Electrolyte & Safety Check Edit Handlers
  const handleOpenEditElectrolytes = () => {
    if (!aiDietPlan) return;
    const limits = aiDietPlan.electrolyteLimits || ({} as any);
    setTempElectrolytes({
      sodium: limits.sodium || "",
      potassium: limits.potassium || "",
      phosphorus: limits.phosphorus || "",
      calcium: limits.calcium || "",
      magnesium: limits.magnesium || "",
      iron: limits.iron || "",
      vitaminD: limits.vitaminD || "",
      vitaminB12: limits.vitaminB12 || "",
      uricAcid: limits.uricAcid || ""
    });
    setEditElectrolytesOpen(true);
  };

  const handleSaveElectrolytes = () => {
    if (!aiDietPlan) return;
    setAiDietPlan({
      ...aiDietPlan,
      electrolyteLimits: {
        ...aiDietPlan.electrolyteLimits,
        sodium: tempElectrolytes.sodium.trim(),
        potassium: tempElectrolytes.potassium.trim(),
        phosphorus: tempElectrolytes.phosphorus.trim(),
        calcium: tempElectrolytes.calcium.trim(),
        magnesium: tempElectrolytes.magnesium.trim(),
        iron: tempElectrolytes.iron.trim(),
        vitaminD: tempElectrolytes.vitaminD.trim(),
        vitaminB12: tempElectrolytes.vitaminB12.trim(),
        uricAcid: tempElectrolytes.uricAcid.trim()
      }
    });
    setEditElectrolytesOpen(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    toast.success("Electrolyte & mineral safety limits updated!");
  };

  // 3. Recommended Foods Edit Handlers
  const handleOpenEditRecFoods = () => {
    if (!aiDietPlan) return;
    setTempRecFoods([...(aiDietPlan.recommendedFoods || [])]);
    setEditRecFoodsOpen(true);
  };

  const handleSaveRecFoods = () => {
    if (!aiDietPlan) return;
    const cleaned = tempRecFoods.map((f) => f.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      toast.warning("Keep at least one recommended food item.");
      return;
    }
    setAiDietPlan({
      ...aiDietPlan,
      recommendedFoods: cleaned
    });
    setEditRecFoodsOpen(false);
    toast.success("Recommended foods list updated!");
  };

  // 4. Foods to Avoid Edit Handlers
  const handleOpenEditAvoidFoods = () => {
    if (!aiDietPlan) return;
    setTempAvoidFoods([...(aiDietPlan.foodsToAvoid || [])]);
    setEditAvoidFoodsOpen(true);
  };

  const handleSaveAvoidFoods = () => {
    if (!aiDietPlan) return;
    const cleaned = tempAvoidFoods.map((f) => f.trim()).filter(Boolean);
    setAiDietPlan({
      ...aiDietPlan,
      foodsToAvoid: cleaned
    });
    setEditAvoidFoodsOpen(false);
    toast.success("Foods to avoid list updated!");
  };

  // 5. Crucial Safety Alerts Edit Handlers
  const handleOpenEditAlerts = () => {
    if (!aiDietPlan) return;
    setTempAlerts([...(aiDietPlan.avoidanceAlerts || [])]);
    setEditAlertsOpen(true);
  };

  const handleSaveAlerts = () => {
    if (!aiDietPlan) return;
    const cleaned = tempAlerts.map((a) => a.trim()).filter(Boolean);
    setAiDietPlan({
      ...aiDietPlan,
      avoidanceAlerts: cleaned
    });
    setEditAlertsOpen(false);
    toast.success("Safety alerts updated!");
  };

  // 6. Guidance & Habits Edit Handlers (Hydration, Lifestyle, Follow-Up)
  const handleOpenEditGuidance = () => {
    if (!aiDietPlan) return;
    setTempGuidance({
      hydrationGuidance: aiDietPlan.hydrationGuidance || "",
      lifestyleAdvice: [...(aiDietPlan.lifestyleAdvice || [])],
      followUpNote: aiDietPlan.followUpNote || ""
    });
    setEditGuidanceOpen(true);
  };

  const handleSaveGuidance = () => {
    if (!aiDietPlan) return;
    setAiDietPlan({
      ...aiDietPlan,
      hydrationGuidance: tempGuidance.hydrationGuidance.trim() || aiDietPlan.hydrationGuidance,
      lifestyleAdvice: tempGuidance.lifestyleAdvice.map((t) => t.trim()).filter(Boolean),
      followUpNote: tempGuidance.followUpNote.trim() || aiDietPlan.followUpNote
    });
    setEditGuidanceOpen(false);
    toast.success("Hydration, habits & follow-up updated!");
  };

  const handleResetAll = () => {
    setAiDietPlan(null);
    setForm({
      ...EMPTY_FORM,
      patientName: patientName || "",
      age: patientAge ? String(patientAge) : "",
      disease: patientDisease || ""
    });
    setHistoryForm(null);
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
    <Box>
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
            {aiDietPlan && (
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
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
              </Stack>
            )}
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
                      totalCholesterol: "218",
                      customCalories: ""
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

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Food or Medicine Allergies"
                    value={form.allergies}
                    onChange={(e) => updateForm("allergies", e.target.value)}
                    placeholder="e.g. Peanuts, Milk/Lactose, Gluten"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Other Health Notes"
                    value={form.comorbidities}
                    onChange={(e) => updateForm("comorbidities", e.target.value)}
                    placeholder="e.g. Fatty liver, high uric acid, acidity"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Target Calories / Day (Dietitian Target)"
                    value={form.customCalories}
                    onChange={(e) => updateForm("customCalories", e.target.value)}
                    placeholder="e.g. 1600 or 1800 (Auto AI if blank)"
                    helperText="Optional: Set custom daily calorie goal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kcal</InputAdornment>
                    }}
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

              {/* Diet Plan Language, Dietary Preference & Target Calories Selector */}
              <Box sx={{ maxWidth: 750, mx: "auto", mt: 2.5, mb: 1.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="rx-diet-lang-label" sx={{ fontWeight: 600 }}>
                        Diet Plan Language / भाषा
                      </InputLabel>
                      <Select
                        labelId="rx-diet-lang-label"
                        label="Diet Plan Language / भाषा"
                        value={rxFormPreferences.language}
                        onChange={(e) => setRxFormPreferences((p) => ({ ...p, language: e.target.value }))}
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
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="rx-diet-pref-label" sx={{ fontWeight: 600 }}>
                        Dietary Preference / भोजन
                      </InputLabel>
                      <Select
                        labelId="rx-diet-pref-label"
                        label="Dietary Preference / भोजन"
                        value={rxFormPreferences.dietaryPreference}
                        onChange={(e) => setRxFormPreferences((p) => ({ ...p, dietaryPreference: e.target.value }))}
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
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Calories / Day "
                      value={rxFormPreferences.customCalories}
                      onChange={(e) => setRxFormPreferences((p) => ({ ...p, customCalories: e.target.value }))}
                      placeholder="e.g. 1600"
                      helperText="Optional: Auto AI if blank"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">kcal</InputAdornment>
                      }}
                      inputProps={{
                        sx: { pr: 0.5 }
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"
                      }}
                    />
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
                      {historyTotalRecords} patient record{historyTotalRecords === 1 ? "" : "s"} available &bull; Page {historyPage + 1} of {Math.max(1, Math.ceil(historyTotalRecords / historyRowsPerPage))}
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

              {/* Pagination Controls with selectable per-page (5, 10, 15, 20) */}
              <TablePagination
                component="div"
                count={historyTotalRecords}
                page={historyPage}
                onPageChange={(_, newPage) => setHistoryPage(newPage)}
                rowsPerPage={historyRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setHistoryRowsPerPage(parseInt(e.target.value, 10));
                  setHistoryPage(0);
                }}
                rowsPerPageOptions={[5, 10, 15, 20]}
                labelRowsPerPage="Per page:"
                sx={{
                  mt: 1,
                  borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
                  ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                    fontWeight: 600,
                    fontSize: "0.85rem"
                  }
                }}
              />

              {selectedHistoryId && historyForm && (
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
                          setHistoryForm(null);
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
                          {historyForm.patientName}
                        </Typography>
                        <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                          <Chip
                            label={`${historyForm.age} Years`}
                            size="small"
                            sx={{ fontWeight: 800, height: 24, fontSize: "0.75rem" }}
                          />
                          <Chip
                            label={historyForm.gender}
                            size="small"
                            sx={{ fontWeight: 800, height: 24, fontSize: "0.75rem" }}
                          />
                          {historyForm.weightKg && (
                            <Chip
                              icon={<Scale sx={{ fontSize: "14px !important" }} />}
                              label={`${historyForm.weightKg} kg`}
                              size="small"
                              sx={{ fontWeight: 700, height: 24, fontSize: "0.75rem" }}
                            />
                          )}
                        </Stack>
                      </Stack>

                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>
                        <strong>Primary Diagnosis:</strong> {historyForm.disease}
                      </Typography>

                      {/* Vitals quick badges if present */}
                      {(historyForm.bpSystolic || historyForm.hba1c || historyForm.creatinine || historyForm.fastingGlucose) && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} mt={1}>
                          {historyForm.bpSystolic && (
                            <Chip
                              label={`BP: ${historyForm.bpSystolic}/${historyForm.bpDiastolic || "80"} mmHg`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                            />
                          )}
                          {historyForm.hba1c && (
                            <Chip
                              label={`HbA1c: ${historyForm.hba1c}%`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                            />
                          )}
                          {historyForm.fastingGlucose && (
                            <Chip
                              label={`Fasting Sugar: ${historyForm.fastingGlucose} mg/dL`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                            />
                          )}
                          {historyForm.creatinine && (
                            <Chip
                              label={`Creatinine: ${historyForm.creatinine} mg/dL`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                            />
                          )}
                        </Stack>
                      )}
                    </Box>

                    <Divider sx={{ my: 2, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />

                    {/* Clean 3-Column Diet Preferences, Language & Target Calories Form */}
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={5}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="history-diet-pref-label" sx={{ fontWeight: 600 }}>
                              Dietary Preference / भोजन का प्रकार
                            </InputLabel>
                            <Select
                              labelId="history-diet-pref-label"
                              label="Dietary Preference / भोजन का प्रकार"
                              value={historyForm.dietaryPreference}
                              onChange={(e) => updateHistoryForm("dietaryPreference", e.target.value)}
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

                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="history-diet-lang-label" sx={{ fontWeight: 600 }}>
                              Diet Plan Language / भाषा
                            </InputLabel>
                            <Select
                              labelId="history-diet-lang-label"
                              label="Diet Plan Language / भाषा"
                              value={historyForm.language}
                              onChange={(e) => updateHistoryForm("language", e.target.value)}
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

                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Calories / Day"
                            value={historyForm.customCalories}
                            onChange={(e) => updateHistoryForm("customCalories", e.target.value)}
                            placeholder="e.g. 1600"
                            helperText="Optional (Auto AI)"
                            InputProps={{
                              endAdornment: <InputAdornment position="end">kcal</InputAdornment>
                            }}
                            inputProps={{
                              sx: { pr: 0.5 }
                            }}
                            sx={{
                              borderRadius: 1.5,
                              bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Fade>
              )}
            </Paper>
          )}

          {/* Generate Button Section (For Manual Entry & Selected Patient) */}
          {inputMode !== "prescription" && (() => {
            const activeForm = inputMode === "history" ? historyForm : form;
            const isGenDisabled = isGenerating || !activeForm || !activeForm.patientName || !activeForm.age || !activeForm.gender || !activeForm.disease;
            return (
              <Box sx={{ textAlign: "center", my: 3.5 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerateDiet}
                  disabled={isGenDisabled}
                  startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : (activeAiProvider === 'deepseek' ? <Psychology /> : <AutoAwesome />)}
                  sx={{
                    borderRadius: "50px",
                    px: { xs: 4, sm: 6 },
                    py: 1.8,
                    fontSize: { xs: "0.95rem", sm: "1.05rem" },
                    fontWeight: 900,
                    background: activeAiProvider === 'deepseek'
                      ? "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)"
                      : "linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)",
                    boxShadow: activeAiProvider === 'deepseek'
                      ? "0 8px 32px rgba(79,70,229,0.35)"
                      : "0 8px 32px rgba(0,201,167,0.35)",
                    "&:hover": {
                      background: activeAiProvider === 'deepseek'
                        ? "linear-gradient(135deg, #4338CA 0%, #1D4ED8 100%)"
                        : "linear-gradient(135deg, #00B395 0%, #5a4bd1 100%)"
                    },
                    "&:disabled": { background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }
                  }}
                >
                  {isGenerating
                    ? `Analysing Clinical Profile with ${activeAiProvider === 'deepseek' ? 'DeepSeek AI' : 'Gemini AI'}... ${genProgress}%`
                    : (activeAiProvider === 'deepseek' ? "Generate Indian Diet Plan with DeepSeek AI" : "Generate Indian Diet Plan with Gemini AI")}
                </Button>
                {(!activeForm || !activeForm.patientName || !activeForm.age || !activeForm.gender || !activeForm.disease) && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    {inputMode === "history"
                      ? "* Please select an analysed patient above to generate diet plan"
                      : "* Patient Name, Age, Gender, and Medical Condition required"}
                  </Typography>
                )}
              </Box>
            );
          })()}

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

                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={0.5}>
                      {dietAiProvider === 'deepseek' ? (
                        <Chip
                          icon={<Psychology sx={{ fontSize: "14px !important", color: "#FFF !important" }} />}
                          label="DeepSeek AI (DeepSeek-V3)"
                          size="small"
                          sx={{ bgcolor: "#4F46E5", color: "#FFF", fontWeight: 800, fontSize: "0.74rem" }}
                        />
                      ) : (
                        <Chip
                          icon={<AutoAwesome sx={{ fontSize: "14px !important", color: "#FFF !important" }} />}
                          label="Google Gemini (3.8 Flash)"
                          size="small"
                          sx={{ bgcolor: "#00C9A7", color: "#FFF", fontWeight: 800, fontSize: "0.74rem" }}
                        />
                      )}
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

                  {/* Calorie Goal Visual Circle/Card with Edit Overview Button */}
                  <Stack spacing={1} alignItems="center">
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
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit fontSize="small" />}
                      onClick={handleOpenEditOverview}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        borderColor: isDark ? "rgba(0,201,167,0.4)" : "#00C9A7",
                        color: isDark ? "#26e7c6" : "#007A65",
                        bgcolor: isDark ? "rgba(0,201,167,0.08)" : "rgba(0,201,167,0.06)",
                        "&:hover": { bgcolor: "rgba(0,201,167,0.15)" }
                      }}
                    >
                      Edit Overview
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              {/* Crucial Safety Alert (if any) */}
              {aiDietPlan.avoidanceAlerts?.length > 0 && (
                <Alert
                  severity="error"
                  sx={{ mb: 3, borderRadius: 2 }}
                  icon={<Warning />}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<Edit fontSize="small" />}
                      onClick={handleOpenEditAlerts}
                      sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                    >
                      Edit Alerts
                    </Button>
                  }
                >
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
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MonitorHeart sx={{ color: "#FFB703" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      Electrolyte & Organ Safety Check (Salt, Potassium & Minerals)
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit fontSize="small" />}
                    onClick={handleOpenEditElectrolytes}
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2,
                      fontSize: "0.78rem",
                      borderColor: "#FFB703",
                      color: "#FFB703",
                      "&:hover": { borderColor: "#E5A500", bgcolor: "rgba(255,183,3,0.08)" }
                    }}
                  >
                    Edit Safety Check
                  </Button>
                </Stack>
                <Grid container spacing={2}>
                  {[
                    {
                      mineral: "Salt (Sodium Na)",
                      badge: "Strict Salt Control",
                      statusColor: "#FFB703",
                      icon: "🧂",
                      text: aiDietPlan.electrolyteLimits.sodium || "Strict Salt Control (< 1,500 mg/day) - Avoid pickles, papad & table salt",
                      simpleRule: "Zero pickles, zero papad, no extra table salt"
                    },
                    {
                      mineral: "Potassium (K)",
                      badge: "Heart & Kidney Balance",
                      statusColor: "#00B4D8",
                      icon: "🍌",
                      text: aiDietPlan.electrolyteLimits.potassium || "Balanced Potassium - Enjoy fresh coconut water, amla & bottle gourd in moderation",
                      simpleRule: "Moderate tender coconut water, amla & bottle gourd"
                    },
                    {
                      mineral: "Phosphorus (P)",
                      badge: "Kidney Safe",
                      statusColor: "#6C5CE7",
                      icon: "⚡",
                      text: aiDietPlan.electrolyteLimits.phosphorus || "Kidney-Safe Phosphorus - Light yellow dals, avoid heavily processed snacks",
                      simpleRule: "Light yellow dals, avoid heavily processed cheeses"
                    },
                    {
                      mineral: "Calcium (Ca)",
                      badge: "Strong Bones",
                      statusColor: "#00C9A7",
                      icon: "🥛",
                      text: aiDietPlan.electrolyteLimits.calcium || "Strong Bones Calcium - 1 bowl low-fat curd and 1 glass skimmed milk daily",
                      simpleRule: "1 bowl fresh curd and 1 cup skimmed milk daily"
                    },
                    {
                      mineral: "Magnesium (Mg)",
                      badge: "Muscle & Nerve Calm",
                      statusColor: "#10B981",
                      icon: "🥑",
                      text: aiDietPlan.electrolyteLimits.magnesium || "Relaxing Magnesium - Pumpkin seeds, almonds, steamed spinach & soaked methi for muscle relaxation",
                      simpleRule: "Pumpkin seeds, almonds, steamed spinach & soaked methi"
                    },
                    {
                      mineral: "Iron (Fe)",
                      badge: "Haemoglobin & Blood",
                      statusColor: "#EF4444",
                      icon: "🩸",
                      text: aiDietPlan.electrolyteLimits.iron || "Haemoglobin Booster Iron - Steamed palak dal, roasted chana, beetroot & amla with Vitamin C",
                      simpleRule: "Palak, beetroot, roasted chana paired with lemon juice"
                    },
                    {
                      mineral: "Vitamin D",
                      badge: "Sunlight & Immunity",
                      statusColor: "#F59E0B",
                      icon: "☀️",
                      text: aiDietPlan.electrolyteLimits.vitaminD || "Sunlight & Bone Vitamin D - 15 mins gentle morning sun exposure, fortified dairy & mushrooms",
                      simpleRule: "15 mins morning sunlight & fortified milk/curd"
                    },
                    {
                      mineral: "Vitamin B12",
                      badge: "Nerve & Energy",
                      statusColor: "#8B5CF6",
                      icon: "🧬",
                      text: aiDietPlan.electrolyteLimits.vitaminB12 || "Nerve & Energy Vitamin B12 - Low-fat paneer, fermented curd, fortified foods, or clinical supplement",
                      simpleRule: "Daily curd/paneer or clinical supplement for vegetarians"
                    },
                    {
                      mineral: "Uric Acid Watch",
                      badge: "Joint & Kidney Safety",
                      statusColor: "#EC4899",
                      icon: "🧪",
                      text: aiDietPlan.electrolyteLimits.uricAcid || "Purine & Uric Acid Control - Drink 2.5-3L water, avoid sugary drinks & purine-heavy foods, enjoy amla",
                      simpleRule: "Drink 2.5-3L water, avoid sugary drinks & high-purine foods"
                    }
                  ].map((el) => (
                    <Grid item xs={12} sm={6} md={4} key={el.mineral}>
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
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
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit fontSize="small" />}
                        onClick={handleOpenEditRecFoods}
                        sx={{
                          fontWeight: 800,
                          borderRadius: 2,
                          fontSize: "0.75rem",
                          borderColor: "#00C9A7",
                          color: "#00C9A7",
                          "&:hover": { borderColor: "#00967D", bgcolor: "rgba(0,201,167,0.08)" }
                        }}
                      >
                        Edit Foods
                      </Button>
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
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
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit fontSize="small" />}
                        onClick={handleOpenEditAvoidFoods}
                        sx={{
                          fontWeight: 800,
                          borderRadius: 2,
                          fontSize: "0.75rem",
                          borderColor: "#FF4D6D",
                          color: "#FF4D6D",
                          "&:hover": { borderColor: "#E03E5D", bgcolor: "rgba(255,77,109,0.08)" }
                        }}
                      >
                        Edit Avoid List
                      </Button>
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
              <Paper variant="outlined" sx={{ p: 2.8, mb: 3, borderRadius: 2.5, bgcolor: paperBg }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: isDark ? "#A5B4FC" : "#4338CA" }}>
                    Hydration, Healthy Daily Habits & Clinical Follow-Up Guidance
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit fontSize="small" />}
                    onClick={handleOpenEditGuidance}
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2,
                      fontSize: "0.78rem",
                      borderColor: "#6C5CE7",
                      color: "#6C5CE7",
                      "&:hover": { borderColor: "#5a4bd1", bgcolor: "rgba(108,92,231,0.08)" }
                    }}
                  >
                    Edit Guidance & Habits
                  </Button>
                </Stack>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        bgcolor: isDark ? "rgba(0,180,216,0.05)" : "rgba(0,180,216,0.03)",
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
                        bgcolor: isDark ? "rgba(6,214,160,0.05)" : "rgba(6,214,160,0.03)",
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
                        bgcolor: isDark ? "rgba(108,92,231,0.05)" : "rgba(108,92,231,0.03)",
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
              </Paper>

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
              p: { xs: 0.5, sm: 1 },
              m: { xs: 1, sm: 2 },
              width: { xs: "calc(100% - 16px)", sm: "auto" },
              maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              backgroundImage: "none"
            }
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pb: 1.5,
              gap: 1.5,
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ bgcolor: "rgba(108,92,231,0.15)", p: 0.8, borderRadius: 1.5, flexShrink: 0 }}>
                <Edit sx={{ color: "#6C5CE7" }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1rem", sm: "1.2rem" }, lineHeight: 1.3 }}>
                  Customize Daily Indian Meal Schedule & Portions
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>
                  Change timings, food items, portions, or add and delete meal slots
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setEditMealsOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2.5 }, overflowY: "auto" }}>
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
                      p: { xs: 1.8, sm: 2.2 },
                      borderRadius: 2,
                      bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                      position: "relative"
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
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
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Time"
                          placeholder="e.g. 06:30 AM"
                          value={meal.time}
                          onChange={(e) => handleUpdateTempMeal(index, "time", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={isCustom ? 4 : 4}>
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
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Custom Meal Slot Name"
                            placeholder="e.g. Post-Workout Snack"
                            value={meal.customMealName ?? ""}
                            onChange={(e) => handleCustomMealNameChange(index, e.target.value)}
                            helperText="Custom name"
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
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
              flexWrap: "wrap",
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

        {/* =========================================================================
          POPUP MODAL: EDIT PLAN OVERVIEW (NAME, CALORIES, SUMMARY)
         ========================================================================= */}
        <Dialog
          open={editOverviewOpen}
          onClose={() => setEditOverviewOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2.5,
              p: { xs: 0.5, sm: 1 },
              m: { xs: 1, sm: 2 },
              width: { xs: "calc(100% - 16px)", sm: "auto" },
              maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              backgroundImage: "none"
            }
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pb: 1.5,
              gap: 1.5,
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ bgcolor: "rgba(0,201,167,0.15)", p: 0.8, borderRadius: 1.5, flexShrink: 0 }}>
                <Edit sx={{ color: "#00C9A7" }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1rem", sm: "1.2rem" }, lineHeight: 1.3 }}>
                  Edit Diet Plan Overview
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>
                  Customize protocol name, daily energy target, and patient summary
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setEditOverviewOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 2, sm: 2.5 }, overflowY: "auto" }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Plan Protocol Name"
                value={tempOverview.planName}
                onChange={(e) => setTempOverview({ ...tempOverview, planName: e.target.value })}
                placeholder="e.g. Indian Diabetes & Heart Wellness Diet Plan"
              />
              <TextField
                fullWidth
                type="number"
                label="Daily Target Calories (kcal/day)"
                value={tempOverview.targetCalories}
                onChange={(e) => setTempOverview({ ...tempOverview, targetCalories: Number(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kcal/day</InputAdornment>
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Patient Summary"
                value={tempOverview.summary}
                onChange={(e) => setTempOverview({ ...tempOverview, summary: e.target.value })}
                placeholder="Reassuring clinical summary for the patient..."
              />
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
              flexWrap: "wrap",
              gap: 1
            }}
          >
            <Button onClick={() => setEditOverviewOpen(false)} sx={{ color: "text.secondary", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircle />}
              onClick={handleSaveOverview}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3, bgcolor: "#00C9A7", "&:hover": { bgcolor: "#00967D" } }}
            >
              Save Overview
            </Button>
          </DialogActions>
        </Dialog>

        {/* =========================================================================
          POPUP MODAL: EDIT CRUCIAL SAFETY ALERTS
         ========================================================================= */}
        <Dialog
          open={editAlertsOpen}
          onClose={() => setEditAlertsOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2.5,
              p: { xs: 0.5, sm: 1 },
              m: { xs: 1, sm: 2 },
              width: { xs: "calc(100% - 16px)", sm: "auto" },
              maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              backgroundImage: "none"
            }
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pb: 1.5,
              gap: 1.5,
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ bgcolor: "rgba(255,77,109,0.15)", p: 0.8, borderRadius: 1.5, flexShrink: 0 }}>
                <Warning sx={{ color: "#FF4D6D" }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1rem", sm: "1.2rem" }, lineHeight: 1.3 }}>
                  Edit Crucial Safety Alerts
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>
                  Vital dietary safety warnings for diabetes, BP, and kidney health
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setEditAlertsOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 2, sm: 2.5 }, overflowY: "auto" }}>
            <Stack spacing={1.5}>
              {tempAlerts.map((alert, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    label={`Alert #${idx + 1}`}
                    value={alert}
                    onChange={(e) => {
                      const copy = [...tempAlerts];
                      copy[idx] = e.target.value;
                      setTempAlerts(copy);
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setTempAlerts(tempAlerts.filter((_, i) => i !== idx))}
                    sx={{ flexShrink: 0 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Box textAlign="center" mt={1}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setTempAlerts([...tempAlerts, ""])}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Add Safety Alert
                </Button>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
              flexWrap: "wrap",
              gap: 1
            }}
          >
            <Button onClick={() => setEditAlertsOpen(false)} sx={{ color: "text.secondary", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CheckCircle />}
              onClick={handleSaveAlerts}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
            >
              Save Alerts
            </Button>
          </DialogActions>
        </Dialog>

        {/* =========================================================================
          POPUP MODAL: EDIT ELECTROLYTE & ORGAN SAFETY CHECK (ALL 9 MINERALS)
         ========================================================================= */}
        <Dialog
          open={editElectrolytesOpen}
          onClose={() => setEditElectrolytesOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2.5,
              p: { xs: 0.5, sm: 1 },
              m: { xs: 1, sm: 2 },
              width: { xs: "calc(100% - 16px)", sm: "auto" },
              maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              backgroundImage: "none"
            }
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pb: 1.5,
              gap: 1.5,
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ bgcolor: "rgba(255,183,3,0.15)", p: 0.8, borderRadius: 1.5, flexShrink: 0 }}>
                <MonitorHeart sx={{ color: "#FFB703" }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "0.95rem", sm: "1.15rem" }, lineHeight: 1.3 }}>
                  Edit Electrolyte &amp; Organ Safety Limits
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: { xs: "0.72rem", sm: "0.8rem" } }}>
                  Adjust clinical guidelines for all 9 key electrolytes, minerals, vitamins, and uric acid
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setEditElectrolytesOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2.5 }, overflowY: "auto" }}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {[
                { key: "sodium", label: "🧂 Salt (Sodium Na)", placeholder: "e.g. Strict Salt Control (< 1,500 mg/day) - Avoid pickles, papad" },
                { key: "potassium", label: "🍌 Potassium (K)", placeholder: "e.g. Balanced Potassium - Moderate coconut water & bottle gourd" },
                { key: "phosphorus", label: "⚡ Phosphorus (P)", placeholder: "e.g. Kidney-Safe Phosphorus - Light yellow dals, avoid processed snacks" },
                { key: "calcium", label: "🥛 Calcium (Ca)", placeholder: "e.g. Strong Bones Calcium - 1 bowl curd and 1 glass skimmed milk" },
                { key: "magnesium", label: "🥑 Magnesium (Mg)", placeholder: "e.g. Relaxing Magnesium - Pumpkin seeds, almonds & spinach" },
                { key: "iron", label: "🩸 Iron (Fe)", placeholder: "e.g. Haemoglobin Booster - Steamed palak dal, roasted chana & amla" },
                { key: "vitaminD", label: "☀️ Vitamin D", placeholder: "e.g. Sunlight & Bone Vitamin D - 15 mins morning sun, fortified dairy" },
                { key: "vitaminB12", label: "🧬 Vitamin B12", placeholder: "e.g. Nerve & Energy B12 - Paneer, curd, fortified foods or supplement" },
                { key: "uricAcid", label: "🧪 Uric Acid Watch", placeholder: "e.g. Purine & Uric Acid Control - Drink 2.5-3L water, avoid sugary sodas" }
              ].map((m) => (
                <Grid item xs={12} sm={6} key={m.key}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    maxRows={4}
                    label={m.label}
                    placeholder={m.placeholder}
                    value={(tempElectrolytes as any)[m.key]}
                    onChange={(e) => setTempElectrolytes({ ...tempElectrolytes, [m.key]: e.target.value })}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
              flexWrap: "wrap",
              gap: 1
            }}
          >
            <Button onClick={() => setEditElectrolytesOpen(false)} sx={{ color: "text.secondary", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircle />}
              onClick={handleSaveElectrolytes}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3, bgcolor: "#00C9A7", "&:hover": { bgcolor: "#00967D" } }}
            >
              Save Electrolyte Limits
            </Button>
          </DialogActions>
        </Dialog>

        {/* =========================================================================
          POPUP MODAL: EDIT RECOMMENDED FOODS (EAT THIS)
         ========================================================================= */}


        <Dialog
          open={editRecFoodsOpen}
          onClose={() => setEditRecFoodsOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2.5,
              p: { xs: 0.5, sm: 1 },
              m: { xs: 1, sm: 2 },
              width: { xs: "calc(100% - 16px)", sm: "auto" },
              maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              backgroundImage: "none"
            }
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pb: 1.5,
              gap: 1.5,
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ bgcolor: "rgba(0,201,167,0.15)", p: 0.8, borderRadius: 1.5, flexShrink: 0 }}>
                <CheckCircle sx={{ color: "#00C9A7" }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1rem", sm: "1.2rem" }, lineHeight: 1.3 }}>
                  Edit Wholesome Recommended Foods
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>
                  Add, edit, or remove foods recommended for this patient
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setEditRecFoodsOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 2, sm: 2.5 }, overflowY: "auto" }}>
            <Stack spacing={1.5}>
              {tempRecFoods.map((food, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    maxRows={4}
                    label={`Recommended Food #${idx + 1}`}
                    value={food}
                    onChange={(e) => {
                      const copy = [...tempRecFoods];
                      copy[idx] = e.target.value;
                      setTempRecFoods(copy);
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setTempRecFoods(tempRecFoods.filter((_, i) => i !== idx))}
                    sx={{ flexShrink: 0, mt: 0.5 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Box textAlign="center" mt={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setTempRecFoods([...tempRecFoods, ""])}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Add Recommended Food
                </Button>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
              flexWrap: "wrap",
              gap: 1
            }}
          >
            <Button onClick={() => setEditRecFoodsOpen(false)} sx={{ color: "text.secondary", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircle />}
              onClick={handleSaveRecFoods}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3, bgcolor: "#00C9A7", "&:hover": { bgcolor: "#00967D" } }}
            >
              Save Foods
            </Button>
          </DialogActions>
        </Dialog>

        {/* =========================================================================
          POPUP MODAL: EDIT FOODS TO AVOID (AVOID THIS)
         ========================================================================= */}
        <Dialog
          open={editAvoidFoodsOpen}
          onClose={() => setEditAvoidFoodsOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2.5,
              p: { xs: 0.5, sm: 1 },
              m: { xs: 1, sm: 2 },
              width: { xs: "calc(100% - 16px)", sm: "auto" },
              maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              backgroundImage: "none"
            }
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pb: 1.5,
              gap: 1.5,
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ bgcolor: "rgba(255,77,109,0.15)", p: 0.8, borderRadius: 1.5, flexShrink: 0 }}>
                <Warning sx={{ color: "#FF4D6D" }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1rem", sm: "1.2rem" }, lineHeight: 1.3 }}>
                  Edit Foods to Avoid Or Strictly Limit
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>
                  Add, edit, or remove items the patient must restrict or eliminate
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setEditAvoidFoodsOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 2, sm: 2.5 }, overflowY: "auto" }}>
            <Stack spacing={1.5}>
              {tempAvoidFoods.map((item, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    maxRows={4}
                    label={`Food to Avoid #${idx + 1}`}
                    value={item}
                    onChange={(e) => {
                      const copy = [...tempAvoidFoods];
                      copy[idx] = e.target.value;
                      setTempAvoidFoods(copy);
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setTempAvoidFoods(tempAvoidFoods.filter((_, i) => i !== idx))}
                    sx={{ flexShrink: 0, mt: 0.5 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Box textAlign="center" mt={1}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setTempAvoidFoods([...tempAvoidFoods, ""])}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Add Item to Avoid
                </Button>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
              flexWrap: "wrap",
              gap: 1
            }}
          >
            <Button onClick={() => setEditAvoidFoodsOpen(false)} sx={{ color: "text.secondary", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CheckCircle />}
              onClick={handleSaveAvoidFoods}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
            >
              Save Avoid List
            </Button>
          </DialogActions>
        </Dialog>

        {/* =========================================================================
          POPUP MODAL: EDIT GUIDANCE, LIFESTYLE HABITS & DOCTOR FOLLOW-UP
         ========================================================================= */}
        <Dialog
          open={editGuidanceOpen}
          onClose={() => setEditGuidanceOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2.5,
              p: { xs: 0.5, sm: 1 },
              m: { xs: 1, sm: 2 },
              width: { xs: "calc(100% - 16px)", sm: "auto" },
              maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              backgroundImage: "none"
            }
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pb: 1.5,
              gap: 1.5,
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ bgcolor: "rgba(108,92,231,0.15)", p: 0.8, borderRadius: 1.5, flexShrink: 0 }}>
                <FitnessCenter sx={{ color: "#6C5CE7" }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1rem", sm: "1.2rem" }, lineHeight: 1.3 }}>
                  Edit Hydration, Lifestyle Habits &amp; Doctor Follow-Up
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>
                  Customize daily fluids, healthy physical habits, and follow-up timeline
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setEditGuidanceOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 2, sm: 2.5 }, overflowY: "auto" }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Hydration & Fluid Guidance"
                value={tempGuidance.hydrationGuidance}
                onChange={(e) => setTempGuidance({ ...tempGuidance, hydrationGuidance: e.target.value })}
                placeholder="e.g. Drink 8-10 glasses water daily, warm jeera water, fresh buttermilk"
              />

              <Divider />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Healthy Daily Habits & Lifestyle Tips:
              </Typography>
              {tempGuidance.lifestyleAdvice.map((tip, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    maxRows={4}
                    label={`Daily Habit #${idx + 1}`}
                    value={tip}
                    onChange={(e) => {
                      const copy = [...tempGuidance.lifestyleAdvice];
                      copy[idx] = e.target.value;
                      setTempGuidance({ ...tempGuidance, lifestyleAdvice: copy });
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      const copy = tempGuidance.lifestyleAdvice.filter((_, i) => i !== idx);
                      setTempGuidance({ ...tempGuidance, lifestyleAdvice: copy });
                    }}
                    sx={{ flexShrink: 0, mt: 0.5 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Box textAlign="center">
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setTempGuidance({ ...tempGuidance, lifestyleAdvice: [...tempGuidance.lifestyleAdvice, ""] })}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Add Daily Habit
                </Button>
              </Box>

              <Divider />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Doctor Clinical Follow-Up Note"
                value={tempGuidance.followUpNote}
                onChange={(e) => setTempGuidance({ ...tempGuidance, followUpNote: e.target.value })}
                placeholder="e.g. Check fasting sugar and BP weekly. Follow-up review with doctor in 4 weeks."
              />
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
              flexWrap: "wrap",
              gap: 1
            }}
          >
            <Button onClick={() => setEditGuidanceOpen(false)} sx={{ color: "text.secondary", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircle />}
              onClick={handleSaveGuidance}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3, bgcolor: "#00C9A7", "&:hover": { bgcolor: "#00967D" } }}
            >
              Save Guidance & Habits
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
              m: { xs: 1, sm: 2 },
              width: { xs: "calc(100% - 16px)", sm: "auto" },
              maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
              bgcolor: "#FFFFFF !important",
              color: "#0F172A !important",
              backgroundImage: "none !important"
            }
          }}
        >
          <DialogTitle
            sx={{
              m: 0,
              p: { xs: 1.5, sm: 2 },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              bgcolor: "#FFFFFF !important",
              borderBottom: "1px solid #E2E8F0 !important"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1 }}>
              <LocalHospital sx={{ color: "#00C9A7", flexShrink: 0 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A !important", fontSize: { xs: "0.95rem", sm: "1.15rem" } }}>
                Official Indian Clinical Dietary Prescription
              </Typography>
            </Stack>
            <IconButton onClick={() => setPrintOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent id="printable-diets" sx={{ p: { xs: 1.5, sm: 3, md: 4 }, overflowY: "auto", overflowX: "hidden", bgcolor: "#FFFFFF !important", color: "#1E293B !important" }}>
            <Box sx={{ border: "2px solid #00C9A7", borderRadius: 2, p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#00967D !important", mb: 0.5, fontSize: { xs: "1.1rem", sm: "1.4rem" } }}>
                ARPAN CLINICAL ASSISTANT — CLINICAL NUTRITION DEPARTMENT
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#475569 !important", mb: 2 }}>
                Personalized Indian Clinical Dietary & Electrolyte Prescription
              </Typography>
              <Divider sx={{ mb: 2, borderColor: "#E2E8F0 !important" }} />
              {aiDietPlan && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A !important", mb: 2, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
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
                    <Typography key={i} variant="body2" sx={{ mb: 2, color: "#334155 !important" }}>
                      <strong style={{ color: "#0F172A" }}>
                        {ms.time} ({ms.mealName}) [{ms.portion}]:
                      </strong>{" "}
                      {ms.focus} — <em>{ms.clinicalNote}</em>
                    </Typography>
                  ))}

                  <Divider sx={{ my: 2, borderColor: "#E2E8F0 !important" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "#00967D !important" }}>
                    Electrolyte, Mineral & Organ Safety Limits (Salt, Potassium & Minerals):
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                    • <strong>Sodium (Salt):</strong> {aiDietPlan.electrolyteLimits.sodium}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                    • <strong>Potassium (K):</strong> {aiDietPlan.electrolyteLimits.potassium}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                    • <strong>Phosphorus (P):</strong> {aiDietPlan.electrolyteLimits.phosphorus}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                    • <strong>Calcium (Ca):</strong> {aiDietPlan.electrolyteLimits.calcium}
                  </Typography>
                  {aiDietPlan.electrolyteLimits.magnesium && (
                    <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                      • <strong>Magnesium (Mg):</strong> {aiDietPlan.electrolyteLimits.magnesium}
                    </Typography>
                  )}
                  {aiDietPlan.electrolyteLimits.iron && (
                    <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                      • <strong>Iron (Fe):</strong> {aiDietPlan.electrolyteLimits.iron}
                    </Typography>
                  )}
                  {aiDietPlan.electrolyteLimits.vitaminD && (
                    <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                      • <strong>Vitamin D:</strong> {aiDietPlan.electrolyteLimits.vitaminD}
                    </Typography>
                  )}
                  {aiDietPlan.electrolyteLimits.vitaminB12 && (
                    <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                      • <strong>Vitamin B12:</strong> {aiDietPlan.electrolyteLimits.vitaminB12}
                    </Typography>
                  )}
                  {aiDietPlan.electrolyteLimits.uricAcid && (
                    <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                      • <strong>Uric Acid:</strong> {aiDietPlan.electrolyteLimits.uricAcid}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2, borderColor: "#E2E8F0 !important" }} />
                  <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                    <strong>Hydration Guidance:</strong> {aiDietPlan.hydrationGuidance}
                  </Typography>
                  {aiDietPlan.lifestyleAdvice?.length > 0 && (
                    <Typography variant="body2" sx={{ color: "#334155 !important", mb: 1 }}>
                      <strong>Lifestyle Advice:</strong> {aiDietPlan.lifestyleAdvice.join(" · ")}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "#64748B !important", display: "block", mt: 4 }}>
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
          <DialogActions sx={{ p: 2.5, bgcolor: "#FFFFFF !important", borderTop: "1px solid #E2E8F0 !important", flexWrap: "wrap", gap: 1 }}>
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

        {/* Full Page Analysis Loader for Diet Generation */}
        <DietAnalysisLoader
          open={isGenerating || isParsingRx}
          onFinished={() => {
            const el = document.getElementById("diet-plan-result");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </Card>

      {/* Dynamic Diet Plan Consultation History Table */}
      <DietHistoryTable
        onLoadRecord={handleLoadDietRecord}
        onPrintRecord={handlePrintDietRecord}
        refreshTrigger={dietRefreshKey}
      />
    </Box>
  );
}

