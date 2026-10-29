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
import Menu from "@mui/material/Menu";
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
import Restaurant from "@mui/icons-material/Restaurant";
import Scale from "@mui/icons-material/Scale";
import Print from "@mui/icons-material/Print";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Warning from "@mui/icons-material/Warning";
import Info from "@mui/icons-material/Info";
import Schedule from "@mui/icons-material/Schedule";
import Close from "@mui/icons-material/Close";
import Verified from "@mui/icons-material/Verified";
import LocalHospital from "@mui/icons-material/LocalHospital";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import Add from "@mui/icons-material/Add";
import History from "@mui/icons-material/History";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import SmartToy from "@mui/icons-material/SmartToy";
import FileUpload from "@mui/icons-material/FileUpload";
import ContentPaste from "@mui/icons-material/ContentPaste";
import EmojiNature from "@mui/icons-material/EmojiNature";
import MonitorHeart from "@mui/icons-material/MonitorHeart";
import WaterDrop from "@mui/icons-material/WaterDrop";
import LocalDining from "@mui/icons-material/LocalDining";
import Refresh from "@mui/icons-material/Refresh";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import FitnessCenter from "@mui/icons-material/FitnessCenter";
import Upload from "@mui/icons-material/Upload";
import Search from "@mui/icons-material/Search";
import Bolt from "@mui/icons-material/Bolt";
import Spa from "@mui/icons-material/Spa";
import ViewAgenda from "@mui/icons-material/ViewAgenda";
import TableRows from "@mui/icons-material/TableRows";
import WbSunny from "@mui/icons-material/WbSunny";
import Bedtime from "@mui/icons-material/Bedtime";
import FreeBreakfast from "@mui/icons-material/FreeBreakfast";
import LunchDining from "@mui/icons-material/LunchDining";
import LocalCafe from "@mui/icons-material/LocalCafe";
import Nightlife from "@mui/icons-material/Nightlife";
import Translate from "@mui/icons-material/Translate";
import LocalFireDepartment from "@mui/icons-material/LocalFireDepartment";
import EditNote from "@mui/icons-material/EditNote";
import Undo from "@mui/icons-material/Undo";
import Psychology from "@mui/icons-material/Psychology";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useAppSelector } from "../redux/hooks";
import { HistoryRecord, DietHistoryRecord, isSuperAdminUser } from "../types/clinical";
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
    sodium?: string;
    potassium?: string;
    phosphorus?: string;
    calcium?: string;
    magnesium?: string;
    iron?: string;
    vitaminD?: string;
    vitaminB12?: string;
    uricAcid?: string;
    [key: string]: string | undefined;
  };
  recommendedFoods: string[];
  foodsToAvoid: string[];
  hydrationGuidance: string;
  mealSchedule: MealSlot[];
  indianSpiceTherapy?: Array<{ spice: string; benefit: string }>;
  lifestyleAdvice: string[];
  avoidanceAlerts: string[];
  followUpNote?: string;
  remarks?: string[];
}

export interface ElectrolyteItemConfig {
  key: string;
  label: string;
  placeholder: string;
  badge: string;
  statusColor: string;
  icon: string;
  defaultText: string;
  simpleRule: string;
}

export const ALL_ELECTROLYTE_CONFIG: ElectrolyteItemConfig[] = [
  {
    key: "sodium",
    label: "🧂 Salt (Sodium Na)",
    placeholder: "e.g. Strict Salt Control (< 1,500 mg/day) - Avoid pickles, papad",
    badge: "Strict Salt Control",
    statusColor: "#FFB703",
    icon: "🧂",
    defaultText: "Strict Salt Control (< 1,500 mg/day) - Avoid pickles, papad & table salt",
    simpleRule: "Zero pickles, zero papad, no extra table salt"
  },
  {
    key: "potassium",
    label: "🍌 Potassium (K)",
    placeholder: "e.g. Balanced Potassium - Moderate coconut water & bottle gourd",
    badge: "Heart & Kidney Balance",
    statusColor: "#00B4D8",
    icon: "🍌",
    defaultText: "Balanced Potassium - Enjoy fresh coconut water, amla & bottle gourd in moderation",
    simpleRule: "Moderate tender coconut water, amla & bottle gourd"
  },
  {
    key: "phosphorus",
    label: "⚡ Phosphorus (P)",
    placeholder: "e.g. Kidney-Safe Phosphorus - Light yellow dals, avoid processed snacks",
    badge: "Kidney Safe",
    statusColor: "#6C5CE7",
    icon: "⚡",
    defaultText: "Kidney-Safe Phosphorus - Light yellow dals, avoid heavily processed snacks",
    simpleRule: "Light yellow dals, avoid heavily processed cheeses"
  },
  {
    key: "calcium",
    label: "🥛 Calcium (Ca)",
    placeholder: "e.g. Strong Bones Calcium - 1 bowl curd and 1 glass skimmed milk",
    badge: "Strong Bones",
    statusColor: "#00C9A7",
    icon: "🥛",
    defaultText: "Strong Bones Calcium - 1 bowl low-fat curd and 1 glass skimmed milk daily",
    simpleRule: "1 bowl fresh curd and 1 cup skimmed milk daily"
  },
  {
    key: "magnesium",
    label: "🥑 Magnesium (Mg)",
    placeholder: "e.g. Relaxing Magnesium - Pumpkin seeds, almonds & spinach",
    badge: "Muscle & Nerve Calm",
    statusColor: "#10B981",
    icon: "🥑",
    defaultText: "Relaxing Magnesium - Pumpkin seeds, almonds, steamed spinach & soaked methi for muscle relaxation",
    simpleRule: "Pumpkin seeds, almonds, steamed spinach & soaked methi"
  },
  {
    key: "iron",
    label: "🩸 Iron (Fe)",
    placeholder: "e.g. Haemoglobin Booster - Steamed palak dal, roasted chana & amla",
    badge: "Haemoglobin & Blood",
    statusColor: "#EF4444",
    icon: "🩸",
    defaultText: "Haemoglobin Booster Iron - Steamed palak dal, roasted chana, beetroot & amla with Vitamin C",
    simpleRule: "Palak, beetroot, roasted chana paired with lemon juice"
  },
  {
    key: "vitaminD",
    label: "☀️ Vitamin D",
    placeholder: "e.g. Sunlight & Bone Vitamin D - 15 mins morning sun, fortified dairy",
    badge: "Sunlight & Immunity",
    statusColor: "#F59E0B",
    icon: "☀️",
    defaultText: "Sunlight & Bone Vitamin D - 15 mins gentle morning sun exposure, fortified dairy & mushrooms",
    simpleRule: "15 mins morning sunlight & fortified milk/curd"
  },
  {
    key: "vitaminB12",
    label: "🧬 Vitamin B12",
    placeholder: "e.g. Nerve & Energy B12 - Paneer, curd, fortified foods or supplement",
    badge: "Nerve & Energy",
    statusColor: "#8B5CF6",
    icon: "🧬",
    defaultText: "Nerve & Energy Vitamin B12 - Low-fat paneer, fermented curd, fortified foods, or clinical supplement",
    simpleRule: "Daily curd/paneer or clinical supplement for vegetarians"
  },
  {
    key: "uricAcid",
    label: "🧪 Uric Acid Watch",
    placeholder: "e.g. Purine & Uric Acid Control - Drink 2.5-3L water, avoid sugary sodas",
    badge: "Joint & Kidney Safety",
    statusColor: "#EC4899",
    icon: "🧪",
    defaultText: "Purine & Uric Acid Control - Drink 2.5-3L water, avoid sugary drinks & purine-heavy foods, enjoy amla",
    simpleRule: "Drink 2.5-3L water, avoid sugary drinks & high-purine foods"
  }
];

export const formatMacroOnly = (
  val: string | undefined,
  type: "protein" | "fats" | "carbs" = "protein",
  targetCalories: number = 1750,
  fallbackGrams?: string
): string => {
  if (!val && fallbackGrams) {
    const fb = String(fallbackGrams).trim();
    return fb.endsWith("g") ? fb : `${fb}g`;
  }
  const str = String(val || "").trim();

  // 1. Direct match for grams (e.g. "68g", "68 g", "68 gm", "68 grams", "68g (16% Energy)")
  const gramsMatch = str.match(/(\d+)\s*(?:g|gm|grams)\b/i);
  if (gramsMatch) {
    return `${gramsMatch[1]}g`;
  }

  // 2. If it is a percentage (e.g. "16%", "16% Daily Energy"), convert to grams based on targetCalories
  const percentMatch = str.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    if (!isNaN(pct) && pct > 0) {
      const kcalPerGram = type === "fats" ? 9 : 4;
      const calculatedGrams = Math.round((targetCalories * (pct / 100)) / kcalPerGram);
      return `${calculatedGrams}g`;
    }
  }

  // 3. If a raw number is provided (e.g. "68")
  const numMatch = str.match(/^(\d+)$/);
  if (numMatch) {
    return `${numMatch[1]}g`;
  }

  // 4. Default standard Indian clinical macro grams
  if (type === "protein") return `${Math.round((targetCalories * 0.16) / 4)}g`;
  if (type === "fats") return `${Math.round((targetCalories * 0.21) / 9)}g`;
  return `${Math.round((targetCalories * 0.63) / 4)}g`;
};

export const serializeMealSchedule = (schedule?: MealSlot[] | null): string => {
  if (!Array.isArray(schedule)) return "";
  return JSON.stringify(
    schedule.map((m) => ({
      meal: (m.mealName || "").trim().toLowerCase(),
      portion: (m.portion || "").trim().toLowerCase(),
      focus: (m.focus || "").trim().toLowerCase()
    }))
  );
};

interface ActiveElectrolyteItem {
  key: string;
  label: string;
  placeholder: string;
  value: string;
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
    patientName: "",
    age: "",
    gender: "Male",
    disease: ""
  });

  // Track last calculated meal schedule to prevent redundant API calls when nothing changed
  const lastCalculatedScheduleRef = useRef<string>("");

  const handleModeChange = (newMode: InputMode) => {
    if (newMode === "manual" && inputMode !== "manual") {
      // Clear manual form so it stays clean and blank for new manual entry without old analyzed data
      setForm({
        ...EMPTY_FORM,
        patientName: "",
        age: "",
        gender: "Male",
        weightKg: "",
        heightCm: "",
        disease: "",
        dietaryPreference: "Vegetarian (Shakahari)",
        language: "Hindi",
        customCalories: ""
      });
    }
    setInputMode(newMode);
  };

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
  const isSuperAdmin = isSuperAdminUser(authUser);
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

  // Editable Electrolytes & Organ Safety (Dynamic list of textfield sections)
  const [editElectrolytesOpen, setEditElectrolytesOpen] = useState(false);
  const [tempElectrolyteList, setTempElectrolyteList] = useState<ActiveElectrolyteItem[]>([]);
  const [addMineralMenuAnchor, setAddMineralMenuAnchor] = useState<null | HTMLElement>(null);

  // Editable Recommended Foods
  const [editRecFoodsOpen, setEditRecFoodsOpen] = useState(false);
  const [tempRecFoods, setTempRecFoods] = useState<string[]>([]);

  // Editable Foods to Avoid
  const [editAvoidFoodsOpen, setEditAvoidFoodsOpen] = useState(false);
  const [tempAvoidFoods, setTempAvoidFoods] = useState<string[]>([]);

  // Editable Crucial Safety Alerts
  const [editAlertsOpen, setEditAlertsOpen] = useState(false);
  const [tempAlerts, setTempAlerts] = useState<string[]>([]);

  // Editable Guidance & Habits (Hydration, Lifestyle Advice)
  const [editGuidanceOpen, setEditGuidanceOpen] = useState(false);
  const [tempGuidance, setTempGuidance] = useState({
    hydrationGuidance: "",
    lifestyleAdvice: [] as string[]
  });

  // Doctor Remarks state
  const [remarkInput, setRemarkInput] = useState("");

  // Recalculating Nutrition State
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Section Deletion/Visibility State
  const [visibleSections, setVisibleSections] = useState({
    electrolytes: true,
    recommendedFoods: true,
    foodsToAvoid: true,
    hydration: true,
    lifestyle: true
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
        .catch(() => { });
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
          lastCalculatedScheduleRef.current = serializeMealSchedule(d.dietPlan?.mealSchedule);
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
      lastCalculatedScheduleRef.current = serializeMealSchedule(json.data?.mealSchedule);
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
      lastCalculatedScheduleRef.current = serializeMealSchedule(record.dietPlan?.mealSchedule);
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

  const handleSaveMealSchedule = async () => {
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
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
    toast.success("Meal schedule updated successfully!");
  };

  // Recalculate Calories & Macros on explicit button click (token-optimized & conditional)
  const handleRecalculateMacros = async () => {
    if (!aiDietPlan) return;
    const currentScheduleKey = serializeMealSchedule(aiDietPlan.mealSchedule);

    // Only hit API if changes were detected in meal schedule & portions compared to previous
    if (lastCalculatedScheduleRef.current && currentScheduleKey === lastCalculatedScheduleRef.current) {
      toast.info("Meal schedule and portions have not changed. Macronutrients are already up to date.");
      return;
    }

    setIsRecalculating(true);
    let updatedCalories = aiDietPlan.targetCalories;
    let updatedMacro = { ...aiDietPlan.macroBreakdown };

    try {
      const activeForm = inputMode === "history" ? historyForm : form;
      // Token-optimized payload: only send relevant meal name, portion, and dishes (strip time, clinical notes, and irrelevant vitals)
      const optimizedSchedule = (aiDietPlan.mealSchedule || []).map((m) => ({
        mealName: m.mealName,
        portion: m.portion,
        focus: m.focus
      }));

      const res = await fetch("/api/diet/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealSchedule: optimizedSchedule,
          condition: activeForm?.disease || "General Health",
          dietaryPreference: activeForm?.dietaryPreference || "Vegetarian",
          targetCalories: aiDietPlan.targetCalories
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        lastCalculatedScheduleRef.current = currentScheduleKey;
        updatedCalories = Number(data.data.calories) || updatedCalories;
        updatedMacro = {
          carbs: data.data.carbs || updatedMacro.carbs,
          protein: data.data.protein || updatedMacro.protein,
          fats: data.data.fats || updatedMacro.fats,
          fiber: data.data.fiber || updatedMacro.fiber || "25g"
        };
        setAiDietPlan((prev) => prev ? {
          ...prev,
          targetCalories: updatedCalories,
          macroBreakdown: updatedMacro
        } : null);
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.5 } });
        toast.success("Calories & Macronutrient cards recalculated!");
      } else {
        toast.error("Could not recalculate macros, please try again.");
      }
    } catch (err) {
      console.warn("Recalculation error:", err);
      toast.error("Failed to recalculate macros");
    } finally {
      setIsRecalculating(false);
    }
  };

  // Remarks Handlers
  const handleAddRemark = () => {
    if (!remarkInput.trim()) return;
    if (!aiDietPlan) return;
    const currentRemarks = aiDietPlan.remarks || [];
    setAiDietPlan({
      ...aiDietPlan,
      remarks: [...currentRemarks, remarkInput.trim()]
    });
    setRemarkInput("");
    toast.success("Remark added to diet plan!");
  };

  const handleDeleteRemark = (index: number) => {
    if (!aiDietPlan) return;
    const updated = (aiDietPlan.remarks || []).filter((_, i) => i !== index);
    setAiDietPlan({
      ...aiDietPlan,
      remarks: updated
    });
    toast.info("Remark deleted.");
  };

  // Section Deletion & Restoration Handlers
  const handleDeleteSection = (section: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({ ...prev, [section]: false }));
    const sectionNames: Record<string, string> = {
      electrolytes: "Electrolyte safety limits",
      recommendedFoods: "Eat More Foods",
      foodsToAvoid: "Foods to Avoid",
      hydration: "Hydration guidance",
      lifestyle: "Healthy daily habits"
    };
    toast.info(`${sectionNames[section] || "Section"} deleted. You can restore it below anytime.`);
  };

  const handleRestoreSection = (section: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({ ...prev, [section]: true }));
    toast.success("Section restored!");
  };

  const handleRestoreAllSections = () => {
    setVisibleSections({
      electrolytes: true,
      recommendedFoods: true,
      foodsToAvoid: true,
      hydration: true,
      lifestyle: true
    });
    toast.success("All sections restored!");
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

  const handleSaveOverview = async () => {
    if (!aiDietPlan) return;
    const newTargetCalories = Number(tempOverview.targetCalories) || aiDietPlan.targetCalories;
    const caloriesChanged = newTargetCalories !== aiDietPlan.targetCalories;

    if (!caloriesChanged) {
      setAiDietPlan({
        ...aiDietPlan,
        planName: tempOverview.planName.trim() || aiDietPlan.planName,
        targetCalories: newTargetCalories,
        summary: tempOverview.summary.trim() || aiDietPlan.summary
      });
      setEditOverviewOpen(false);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
      toast.success("Diet plan overview updated!");
      return;
    }

    // Daily target Calories changed -> regenerate diet plan accordingly
    setEditOverviewOpen(false);
    setIsGenerating(true);
    setGenProgress(15);
    const progressTimer = setInterval(() => {
      setGenProgress((prev) => {
        if (prev >= 94) return prev;
        const inc = Math.floor(Math.random() * 8) + 5;
        return Math.min(prev + inc, 94);
      });
    }, 280);

    try {
      const activeForm = inputMode === "history" ? historyForm : form;
      const activeWeight = Number(activeForm?.weightKg) || 0;
      const activeHeight = Number(activeForm?.heightCm) / 100 || 0;
      const calculatedBmi = activeHeight > 0 && activeWeight > 0 ? (activeWeight / (activeHeight * activeHeight)).toFixed(1) : undefined;

      const patientPayload = {
        patientName: activeForm?.patientName || "Patient",
        age: activeForm?.age || "45",
        gender: activeForm?.gender || "Male",
        disease: activeForm?.disease || "General Health",
        dietaryPreference: activeForm?.dietaryPreference || "Vegetarian (Shakahari)",
        language: activeForm?.language || "Hindi",
        customCalories: String(newTargetCalories),
        weightKg: activeForm?.weightKg || "",
        heightCm: activeForm?.heightCm || "",
        allergies: activeForm?.allergies || "",
        comorbidities: activeForm?.comorbidities || "",
        bmi: calculatedBmi ? parseFloat(calculatedBmi) : undefined
      };

      const res = await fetch("/api/diet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(patientPayload)
      });
      const json = await res.json();
      clearInterval(progressTimer);
      setGenProgress(100);

      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to regenerate diet plan for updated calorie target.");
        return;
      }

      const updatedPlan: AIDietPlan = {
        ...json.data,
        planName: tempOverview.planName.trim() || json.data.planName,
        targetCalories: newTargetCalories,
        summary: tempOverview.summary.trim() || json.data.summary
      };

      setAiDietPlan(updatedPlan);
      lastCalculatedScheduleRef.current = serializeMealSchedule(updatedPlan.mealSchedule);
      confetti({ particleCount: 85, spread: 90, origin: { y: 0.5 } });
      toast.success(`Diet plan successfully regenerated for ${newTargetCalories} kcal!`);

      // Persist regenerated diet plan to MongoDB history
      try {
        await fetch("/api/diet/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            patientName: patientPayload.patientName,
            age: patientPayload.age,
            gender: patientPayload.gender,
            disease: patientPayload.disease,
            dietaryPreference: patientPayload.dietaryPreference,
            targetCalories: newTargetCalories,
            language: patientPayload.language,
            planName: updatedPlan.planName,
            summary: updatedPlan.summary,
            dietPlan: updatedPlan,
            patientForm: activeForm || form,
            analysedBy: authUser?.name || "Dr. Yashwant Dubey",
          }),
        });
        setDietRefreshKey((prev) => prev + 1);
      } catch (saveErr) {
        console.warn("Failed to persist regenerated diet plan:", saveErr);
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      toast.error(err.message || "Network error regenerating diet plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Electrolyte & Safety Check Edit Handlers
  const handleOpenEditElectrolytes = () => {
    if (!aiDietPlan) return;
    const limits = aiDietPlan.electrolyteLimits || ({} as any);
    const activeItems: ActiveElectrolyteItem[] = [];

    ALL_ELECTROLYTE_CONFIG.forEach((cfg) => {
      // If mineral is in limits and not undefined
      if (cfg.key in limits && limits[cfg.key] !== undefined) {
        activeItems.push({
          key: cfg.key,
          label: cfg.label,
          placeholder: cfg.placeholder,
          value: limits[cfg.key] || ""
        });
      }
    });

    // If limits was empty or newly generated without custom keys, show all 9
    if (activeItems.length === 0 && Object.keys(limits).length === 0) {
      ALL_ELECTROLYTE_CONFIG.forEach((cfg) => {
        activeItems.push({
          key: cfg.key,
          label: cfg.label,
          placeholder: cfg.placeholder,
          value: cfg.defaultText
        });
      });
    }

    setTempElectrolyteList(activeItems);
    setEditElectrolytesOpen(true);
  };

  const handleDeleteTempElectrolyte = (key: string) => {
    const item = tempElectrolyteList.find((i) => i.key === key);
    setTempElectrolyteList((prev) => prev.filter((i) => i.key !== key));
    toast.info(`Removed ${item?.label || key} section.`);
  };

  const handleSaveElectrolytes = () => {
    if (!aiDietPlan) return;
    const newLimits: Record<string, string> = {};
    tempElectrolyteList.forEach((item) => {
      newLimits[item.key] = item.value.trim();
    });

    setAiDietPlan({
      ...aiDietPlan,
      electrolyteLimits: newLimits as any
    });
    setEditElectrolytesOpen(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    toast.success("Electrolyte limits saved!");
  };

  const handleDeleteSingleElectrolyteDirect = (key: string) => {
    if (!aiDietPlan?.electrolyteLimits) return;
    const updated = { ...aiDietPlan.electrolyteLimits };
    delete updated[key];
    setAiDietPlan({
      ...aiDietPlan,
      electrolyteLimits: updated
    });
    toast.info("Electrolyte section removed.");
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

  // 6. Guidance & Habits Edit Handlers (Hydration, Lifestyle)
  const handleOpenEditGuidance = () => {
    if (!aiDietPlan) return;
    setTempGuidance({
      hydrationGuidance: aiDietPlan.hydrationGuidance || "",
      lifestyleAdvice: [...(aiDietPlan.lifestyleAdvice || [])]
    });
    setEditGuidanceOpen(true);
  };

  const handleSaveGuidance = () => {
    if (!aiDietPlan) return;
    setAiDietPlan({
      ...aiDietPlan,
      hydrationGuidance: tempGuidance.hydrationGuidance.trim() || aiDietPlan.hydrationGuidance,
      lifestyleAdvice: tempGuidance.lifestyleAdvice.map((t) => t.trim()).filter(Boolean)
    });
    setEditGuidanceOpen(false);
    toast.success("Hydration & lifestyle habits updated!");
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
                  onClick={() => handleModeChange(mode.value)}
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
                  startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : (isSuperAdmin && activeAiProvider === 'deepseek' ? <Psychology /> : <AutoAwesome />)}
                  sx={{
                    borderRadius: "50px",
                    px: { xs: 4, sm: 6 },
                    py: 1.8,
                    fontSize: { xs: "0.95rem", sm: "1.05rem" },
                    fontWeight: 900,
                    background: isSuperAdmin && activeAiProvider === 'deepseek'
                      ? "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)"
                      : "linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)",
                    boxShadow: isSuperAdmin && activeAiProvider === 'deepseek'
                      ? "0 8px 32px rgba(79,70,229,0.35)"
                      : "0 8px 32px rgba(0,201,167,0.35)",
                    "&:hover": {
                      background: isSuperAdmin && activeAiProvider === 'deepseek'
                        ? "linear-gradient(135deg, #4338CA 0%, #1D4ED8 100%)"
                        : "linear-gradient(135deg, #00B395 0%, #5a4bd1 100%)"
                    },
                    "&:disabled": { background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }
                  }}
                >
                  {isGenerating
                    ? (isSuperAdmin
                        ? `Analysing Clinical Profile with ${activeAiProvider === 'deepseek' ? 'DeepSeek AI' : 'Gemini AI'}... ${genProgress}%`
                        : `Analysing Clinical Profile & Formulating Diet Plan... ${genProgress}%`)
                    : (isSuperAdmin
                        ? (activeAiProvider === 'deepseek' ? "Generate Indian Diet Plan with DeepSeek AI" : "Generate Indian Diet Plan with Gemini AI")
                        : "Generate Comprehensive Indian Diet Plan")}
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
                      {isSuperAdmin ? (
                        dietAiProvider === 'deepseek' ? (
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
                        )
                      ) : (
                        <Chip
                          icon={<AutoAwesome sx={{ fontSize: "14px !important", color: "#FFF !important" }} />}
                          label="Clinical Dietary AI Engine"
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
                              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
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

                              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: visual.color, mb: 0.6, fontSize: "1rem", lineHeight: 1.3 }}>
                                {item.mealName}
                              </Typography>

                              {/* Separate Portion Badge row prevents content collision */}
                              <Box mb={1.2}>
                                <Chip
                                  label={`Portion: ${item.portion}`}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
                                    color: isDark ? "#E2E8F0" : "#334155",
                                    fontSize: "0.72rem",
                                    border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #CBD5E1",
                                    maxWidth: "100%",
                                    height: "auto",
                                    py: 0.35,
                                    "& .MuiChip-label": {
                                      display: "block",
                                      whiteSpace: "normal",
                                      lineHeight: 1.25
                                    }
                                  }}
                                />
                              </Box>

                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.88rem", mb: 1.5, lineHeight: 1.5, wordBreak: "break-word" }}>
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

              {/* 4 NUTRITIONAL MACRONUTRIENT & CALORIE CARDS (SIMILAR TO ELECTROLYTE CARDS / NO DESCRIPTIONS) */}
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2} flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.88rem" }}>
                      Target Calories &amp; Macronutrient Ratio
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                      Key clinical energy and macronutrient distribution (% or numbers only)
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={isRecalculating ? <CircularProgress size={14} color="inherit" /> : <Refresh sx={{ fontSize: 16 }} />}
                    onClick={handleRecalculateMacros}
                    disabled={isRecalculating}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      py: 0.4,
                      px: 1.5,
                      borderColor: isDark ? "rgba(0, 201, 167, 0.4)" : "#00C9A7",
                      color: isDark ? "#6EE7B7" : "#00967D",
                      "&:hover": {
                        bgcolor: isDark ? "rgba(0, 201, 167, 0.1)" : "rgba(0, 201, 167, 0.06)",
                        borderColor: "#00C9A7"
                      }
                    }}
                  >
                    {isRecalculating ? "Updating..." : "Recalculate Macros"}
                  </Button>
                </Stack>

                <Grid container spacing={1.5}>
                  {/* Card 1: Calorie Intake */}
                  <Grid item xs={6} sm={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: isDark ? "#FF6B6B0C" : "#FF6B6B08",
                        border: "1px solid #FF6B6B35",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                          <LocalFireDepartment sx={{ color: "#FF6B6B", fontSize: 20 }} />
                          <Chip
                            label="ENERGY"
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#FF6B6B20",
                              color: "#FF6B6B",
                              fontSize: "0.7rem",
                              height: 22
                            }}
                          />
                        </Stack>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, fontSize: "0.88rem" }}>
                          Calories
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 700, color: isDark ? "#FFA8A8" : "#E03131" }}>
                          {(aiDietPlan.targetCalories || 1750).toLocaleString()} kcal
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Card 2: Protein */}
                  <Grid item xs={6} sm={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: isDark ? "#00C9A70C" : "#00C9A708",
                        border: "1px solid #00C9A735",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                          <FitnessCenter sx={{ color: "#00C9A7", fontSize: 20 }} />
                          <Chip
                            label="PROTEIN"
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#00C9A720",
                              color: "#00C9A7",
                              fontSize: "0.7rem",
                              height: 22
                            }}
                          />
                        </Stack>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, fontSize: "0.88rem" }}>
                          Protein
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 700, color: isDark ? "#6EE7B7" : "#00967D" }}>
                          {formatMacroOnly(aiDietPlan.macroBreakdown?.protein, "protein", aiDietPlan.targetCalories || 1750)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Card 3: Fat */}
                  <Grid item xs={6} sm={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: isDark ? "#FFB7030C" : "#FFB70308",
                        border: "1px solid #FFB70335",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                          <Spa sx={{ color: "#FFB703", fontSize: 20 }} />
                          <Chip
                            label="LIPIDS"
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#FFB70320",
                              color: "#D97706",
                              fontSize: "0.7rem",
                              height: 22
                            }}
                          />
                        </Stack>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, fontSize: "0.88rem" }}>
                          Fat
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 700, color: isDark ? "#FCD34D" : "#D97706" }}>
                          {formatMacroOnly(aiDietPlan.macroBreakdown?.fats, "fats", aiDietPlan.targetCalories || 1750)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Card 4: Carbohydrate */}
                  <Grid item xs={6} sm={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: isDark ? "#4361EE0C" : "#4361EE08",
                        border: "1px solid #4361EE35",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                          <Restaurant sx={{ color: "#4361EE", fontSize: 20 }} />
                          <Chip
                            label="COMPLEX"
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#4361EE20",
                              color: "#4361EE",
                              fontSize: "0.7rem",
                              height: 22
                            }}
                          />
                        </Stack>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, fontSize: "0.88rem" }}>
                          Carbohydrate
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 700, color: isDark ? "#93C5FD" : "#2563EB" }}>
                          {formatMacroOnly(aiDietPlan.macroBreakdown?.carbs, "carbs", aiDietPlan.targetCalories || 1750)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* DOCTOR CLINICAL REMARKS & SPECIAL INSTRUCTIONS */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.8,
                  mb: 3,
                  borderRadius: 2.5,
                  bgcolor: paperBg,
                  borderLeft: "4px solid #6C5CE7"
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2} gap={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ bgcolor: "rgba(108, 92, 231, 0.12)", p: 0.8, borderRadius: 1.5 }}>
                      <EditNote sx={{ color: "#6C5CE7", fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#6C5CE7" }}>
                        Doctor's Clinical Remarks &amp; Special Instructions
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Add or delete specific diet timing rules, personal precautions, or notes for the patient
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={`${(aiDietPlan.remarks || []).length} Remarks`}
                    size="small"
                    color="secondary"
                    sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                  />
                </Stack>

                {/* Remarks List */}
                <Stack spacing={1.2} mb={2.5}>
                  {(aiDietPlan.remarks || []).length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                        borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                        textAlign: "center"
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.85rem" }}>
                        No doctor remarks added yet. Type below to add custom clinical notes that will appear on the patient's print sheet.
                      </Typography>
                    </Paper>
                  ) : (
                    (aiDietPlan.remarks || []).map((remark, rIdx) => (
                      <Paper
                        key={rIdx}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isDark ? "rgba(108, 92, 231, 0.05)" : "rgba(108, 92, 231, 0.03)",
                          borderColor: "rgba(108, 92, 231, 0.2)",
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 1.5
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                          <Chip
                            label={`#${rIdx + 1}`}
                            size="small"
                            sx={{
                              bgcolor: "#6C5CE7",
                              color: "#FFFFFF",
                              fontWeight: 800,
                              fontSize: "0.7rem",
                              height: 22
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.88rem", lineHeight: 1.5, pt: 0.1 }}>
                            {remark}
                          </Typography>
                        </Stack>
                        <Tooltip title="Delete Remark">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRemark(rIdx)}
                            sx={{ flexShrink: 0, "&:hover": { bgcolor: "rgba(255, 77, 109, 0.1)" } }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    ))
                  )}
                </Stack>

                {/* Add Remark Input */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a clinical remark (e.g. Avoid cold drinks before bedtime, drink lukewarm water 30 mins after meals)..."
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRemark();
                      }
                    }}
                    sx={{
                      bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                      "& .MuiOutlinedInput-root": { borderRadius: 2 }
                    }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Add />}
                    onClick={handleAddRemark}
                    disabled={!remarkInput.trim()}
                    sx={{
                      color: "white !important",
                      fontWeight: 800,
                      borderRadius: 2,
                      px: 3,
                      py: 0.9,
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      // bgcolor: "#6C5CE7",
                      "&:hover": { bgcolor: "#5B4AC4" }
                    }}
                  >
                    Add Remark
                  </Button>
                </Stack>
              </Paper>

              {/* 3. VISUAL ELECTROLYTE TRAFFIC LIGHT WATCH */}
              {visibleSections.electrolytes && (
                <Paper variant="outlined" sx={{ p: 2.8, mb: 3, borderRadius: 2.5, bgcolor: paperBg }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MonitorHeart sx={{ color: "#FFB703" }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        Electrolyte &amp; Organ Safety Check (Salt, Potassium &amp; Minerals)
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
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
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete fontSize="small" />}
                        onClick={() => handleDeleteSection("electrolytes")}
                        sx={{
                          fontWeight: 800,
                          borderRadius: 2,
                          fontSize: "0.78rem"
                        }}
                      >
                        Delete Section
                      </Button>
                    </Stack>
                  </Stack>
                  {ALL_ELECTROLYTE_CONFIG.filter((cfg) => aiDietPlan.electrolyteLimits && (cfg.key in aiDietPlan.electrolyteLimits) && (aiDietPlan.electrolyteLimits as any)[cfg.key] !== undefined && (aiDietPlan.electrolyteLimits as any)[cfg.key] !== "").length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: "center", bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC", borderRadius: 2, border: "1px dashed #CBD5E1" }}>
                      <Typography variant="body2" color="text.secondary">
                        All individual electrolyte limits have been removed. Click <strong>Edit Limits</strong> to add or restore mineral sections.
                      </Typography>
                    </Paper>
                  ) : (
                    <Grid container spacing={2}>
                      {ALL_ELECTROLYTE_CONFIG
                        .filter((cfg) => aiDietPlan.electrolyteLimits && (cfg.key in aiDietPlan.electrolyteLimits) && (aiDietPlan.electrolyteLimits as any)[cfg.key] !== undefined && (aiDietPlan.electrolyteLimits as any)[cfg.key] !== "")
                        .map((el) => {
                          const val = (aiDietPlan.electrolyteLimits as any)[el.key] || el.defaultText;
                          return (
                            <Grid item xs={12} sm={6} md={4} key={el.key}>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: isDark ? `${el.statusColor}0C` : `${el.statusColor}08`,
                                  border: `1px solid ${el.statusColor}35`,
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between"
                                }}
                              >
                                <Box>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography sx={{ fontSize: "1.3rem" }}>{el.icon}</Typography>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
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
                                      <Tooltip title={`Remove ${el.label}`}>
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleDeleteSingleElectrolyteDirect(el.key)}
                                          sx={{ p: 0.4 }}
                                        >
                                          <Delete sx={{ fontSize: "1rem" }} />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Stack>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                                    {el.label}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600, mb: 1, color: isDark ? "#CBD5E1" : "#475569" }}>
                                    {val}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: el.statusColor, fontWeight: 700, display: "block" }}>
                                  👉 {el.simpleRule}
                                </Typography>
                              </Paper>
                            </Grid>
                          );
                        })}
                    </Grid>
                  )}
                </Paper>
              )}

              {/* 5. SIDE-BY-SIDE: "EAT THIS 🟢" vs "AVOID THIS 🔴" */}
              {(visibleSections.recommendedFoods || visibleSections.foodsToAvoid) && (
                <Grid container spacing={2.5} mb={3}>
                  {/* Eat This Card */}
                  {visibleSections.recommendedFoods && (
                    <Grid item xs={12} md={visibleSections.foodsToAvoid ? 6 : 12}>
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
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
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
                          <Stack direction="row" spacing={1} alignItems="center">
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
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete fontSize="small" />}
                              onClick={() => handleDeleteSection("recommendedFoods")}
                              sx={{ fontWeight: 800, borderRadius: 2, fontSize: "0.75rem" }}
                            >
                              Delete Section
                            </Button>
                          </Stack>
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
                  )}

                  {/* Avoid This Card */}
                  {visibleSections.foodsToAvoid && (
                    <Grid item xs={12} md={visibleSections.recommendedFoods ? 6 : 12}>
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
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
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
                          <Stack direction="row" spacing={1} alignItems="center">
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
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete fontSize="small" />}
                              onClick={() => handleDeleteSection("foodsToAvoid")}
                              sx={{ fontWeight: 800, borderRadius: 2, fontSize: "0.75rem" }}
                            >
                              Delete Section
                            </Button>
                          </Stack>
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
                  )}
                </Grid>
              )}

              {/* 7. HYDRATION & HEALTHY LIFESTYLE HABITS CARDS */}
              {(visibleSections.hydration || visibleSections.lifestyle) && (
                <Paper variant="outlined" sx={{ p: 2.8, mb: 3, borderRadius: 2.5, bgcolor: paperBg }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: isDark ? "#A5B4FC" : "#4338CA" }}>
                      Hydration &amp; Healthy Daily Lifestyle Habits
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
                      Edit Guidance &amp; Habits
                    </Button>
                  </Stack>
                  <Grid container spacing={2.5}>
                    {visibleSections.hydration && (
                      <Grid item xs={12} sm={visibleSections.lifestyle ? 6 : 12}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            borderRadius: 2.5,
                            bgcolor: isDark ? "rgba(0,180,216,0.05)" : "rgba(0,180,216,0.03)",
                            borderColor: "rgba(0,180,216,0.3)",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                          }}
                        >
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <WaterDrop sx={{ color: "#00B4D8" }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#00B4D8" }}>
                                  Hydration &amp; Healthy Fluids
                                </Typography>
                              </Stack>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Delete fontSize="small" />}
                                onClick={() => handleDeleteSection("hydration")}
                                sx={{ fontWeight: 800, borderRadius: 1.5, fontSize: "0.72rem", py: 0.2 }}
                              >
                                Delete Section
                              </Button>
                            </Stack>
                            <Typography variant="body2" sx={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                              {aiDietPlan.hydrationGuidance}
                            </Typography>
                          </Box>
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
                    )}

                    {visibleSections.lifestyle && (
                      <Grid item xs={12} sm={visibleSections.hydration ? 6 : 12}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            borderRadius: 2.5,
                            bgcolor: isDark ? "rgba(6,214,160,0.05)" : "rgba(6,214,160,0.03)",
                            borderColor: "rgba(6,214,160,0.3)",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                          }}
                        >
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FitnessCenter sx={{ color: "#06D6A0", fontSize: 20 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#06D6A0" }}>
                                  Healthy Daily Habits
                                </Typography>
                              </Stack>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Delete fontSize="small" />}
                                onClick={() => handleDeleteSection("lifestyle")}
                                sx={{ fontWeight: 800, borderRadius: 1.5, fontSize: "0.72rem", py: 0.2 }}
                              >
                                Delete Section
                              </Button>
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
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

              {/* RESTORE BANNER IF ANY SECTION WAS DELETED */}
              {(!visibleSections.electrolytes || !visibleSections.recommendedFoods || !visibleSections.foodsToAvoid || !visibleSections.hydration || !visibleSections.lifestyle) && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2.5,
                    bgcolor: isDark ? "rgba(255, 183, 3, 0.08)" : "rgba(255, 183, 3, 0.05)",
                    border: "1.5px dashed rgba(255, 183, 3, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Undo sx={{ color: "#FFB703" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? "#FCD34D" : "#B45309" }}>
                      Sections removed by doctor:
                    </Typography>
                    <Stack direction="row" spacing={0.8} flexWrap="wrap">
                      {!visibleSections.electrolytes && (
                        <Chip label="+ Restore Electrolytes" size="small" onClick={() => handleRestoreSection("electrolytes")} sx={{ cursor: "pointer", fontWeight: 700 }} />
                      )}
                      {!visibleSections.recommendedFoods && (
                        <Chip label="+ Restore Eat More Foods" size="small" onClick={() => handleRestoreSection("recommendedFoods")} sx={{ cursor: "pointer", fontWeight: 700 }} />
                      )}
                      {!visibleSections.foodsToAvoid && (
                        <Chip label="+ Restore Foods to Avoid" size="small" onClick={() => handleRestoreSection("foodsToAvoid")} sx={{ cursor: "pointer", fontWeight: 700 }} />
                      )}
                      {!visibleSections.hydration && (
                        <Chip label="+ Restore Hydration" size="small" onClick={() => handleRestoreSection("hydration")} sx={{ cursor: "pointer", fontWeight: 700 }} />
                      )}
                      {!visibleSections.lifestyle && (
                        <Chip label="+ Restore Habits" size="small" onClick={() => handleRestoreSection("lifestyle")} sx={{ cursor: "pointer", fontWeight: 700 }} />
                      )}
                    </Stack>
                  </Stack>
                  <Button size="small" variant="text" onClick={handleRestoreAllSections} sx={{ fontWeight: 800, color: "#FFB703" }}>
                    Restore All Sections
                  </Button>
                </Paper>
              )}

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
              variant="outlined"
              color="primary"
              disabled={isRecalculating}
              startIcon={isRecalculating ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
              onClick={async () => {
                if (!aiDietPlan) return;
                const sanitized: MealSlot[] = tempMealSchedule.map((m, idx) => {
                  let finalName = m.mealName?.trim();
                  if (finalName && m.slotType && finalName !== m.slotType) {
                    finalName = `${m.slotType} (${finalName})`;
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
                setIsRecalculating(true);
                try {
                  const res = await fetch("/api/diet/recalculate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mealSchedule: sanitized,
                      patient: form,
                      targetCalories: aiDietPlan.targetCalories
                    })
                  });
                  const data = await res.json();
                  if (data.success && data.data) {
                    setAiDietPlan((prev) => prev ? {
                      ...prev,
                      mealSchedule: sanitized,
                      targetCalories: Number(data.data.calories) || prev.targetCalories,
                      macroBreakdown: {
                        carbs: data.data.carbs || prev.macroBreakdown.carbs,
                        protein: data.data.protein || prev.macroBreakdown.protein,
                        fats: data.data.fats || prev.macroBreakdown.fats,
                        fiber: data.data.fiber || prev.macroBreakdown.fiber || "25g"
                      }
                    } : null);
                    setEditMealsOpen(false);
                    confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
                    toast.success("Meal schedule saved & calories/macros recalculated!");
                  }
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to recalculate macros");
                } finally {
                  setIsRecalculating(false);
                }
              }}
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                px: 2,
                borderColor: "#00C9A7",
                color: isDark ? "#6EE7B7" : "#00967D",
                "&:hover": { bgcolor: "rgba(0,201,167,0.08)", borderColor: "#00967D" }
              }}
            >
              {isRecalculating ? "Recalculating..." : "Recalculate Macros (AI)"}
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
              Save &amp; Apply Changes
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
                  Click the red trash can icon to completely delete any textfield section (e.g. Sodium)
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setEditElectrolytesOpen(false)} size="small" sx={{ flexShrink: 0 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2.5 }, overflowY: "auto" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                Active Sections ({tempElectrolyteList.length} of {ALL_ELECTROLYTE_CONFIG.length})
              </Typography>
              {ALL_ELECTROLYTE_CONFIG.some((cfg) => !tempElectrolyteList.some((item) => item.key === cfg.key)) && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<Add />}
                    onClick={(e) => setAddMineralMenuAnchor(e.currentTarget)}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                  >
                    + Add / Restore Mineral
                  </Button>
                  <Menu
                    anchorEl={addMineralMenuAnchor}
                    open={Boolean(addMineralMenuAnchor)}
                    onClose={() => setAddMineralMenuAnchor(null)}
                  >
                    {ALL_ELECTROLYTE_CONFIG.filter((cfg) => !tempElectrolyteList.some((item) => item.key === cfg.key)).map((cfg) => (
                      <MenuItem
                        key={cfg.key}
                        onClick={() => {
                          setTempElectrolyteList((prev) => [
                            ...prev,
                            {
                              key: cfg.key,
                              label: cfg.label,
                              placeholder: cfg.placeholder,
                              value: (aiDietPlan?.electrolyteLimits as any)?.[cfg.key] || cfg.defaultText
                            }
                          ]);
                          setAddMineralMenuAnchor(null);
                          toast.success(`Added ${cfg.label} section.`);
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{cfg.label}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Stack>

            {tempElectrolyteList.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center", bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC", borderRadius: 2, border: "1px dashed #CBD5E1" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
                  All Electrolyte Textfield Sections Removed
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You have deleted all mineral sections. Click below to restore or add any mineral section.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={(e) => setAddMineralMenuAnchor(e.currentTarget)}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                >
                  Add Mineral Section
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {tempElectrolyteList.map((m) => (
                  <Grid item xs={12} sm={6} key={m.key}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          minRows={2}
                          maxRows={4}
                          label={m.label}
                          placeholder={m.placeholder}
                          value={m.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempElectrolyteList((prev) =>
                              prev.map((item) => (item.key === m.key ? { ...item, value: val } : item))
                            );
                          }}
                        />
                        <Tooltip title={`Delete ${m.label} textfield section`}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTempElectrolyte(m.key)}
                            sx={{
                              flexShrink: 0,
                              mt: 0.5,
                              bgcolor: "rgba(239,68,68,0.1)",
                              "&:hover": { bgcolor: "rgba(239,68,68,0.2)" }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
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
                  Edit Hydration &amp; Healthy Lifestyle Habits
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>
                  Customize daily fluids and healthy physical habits
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
            {/* =========================================================================
                PAGE 1: CLINICAL HEADER, PATIENT INFO, PROTOCOL, MEAL SCHEDULE, REMARKS
               ========================================================================= */}
            <Box className="diet-print-page-1" sx={{ border: "1.5px solid #000000 !important", borderRadius: 1.5, p: { xs: 2, sm: 2.5 }, mb: 2, bgcolor: "#FFFFFF !important", color: "#000000 !important", boxSizing: "border-box" }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5} pb={1} sx={{ borderBottom: "1.5px solid #000000 !important" }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: "#000000 !important", fontSize: { xs: "1.2rem", sm: "1.35rem" }, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    ARPAN CLINICAL ASSISTANT
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#000000 !important", fontSize: "0.86rem", mt: 0.2 }}>
                    Department of Clinical Nutrition &amp; Lifestyle Medicine
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" sx={{ color: "#000000 !important", display: "block", fontWeight: 700, fontSize: "0.8rem" }}>
                    Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#000000 !important", display: "block", fontWeight: 900, fontSize: "0.76rem" }}>
                    PAGE 1
                  </Typography>
                </Box>
              </Stack>

              {aiDietPlan && (
                <>
                  {/* Patient Information Box */}
                  <Box sx={{ bgcolor: "#FFFFFF !important", border: "1.2px solid #000000 !important", borderRadius: 1.2, p: 1.2, mb: 1.5 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 800, display: "block", fontSize: "0.7rem" }}>Patient Name:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: "#000000 !important", fontSize: "0.82rem" }}>{form.patientName || "Patient"}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 800, display: "block", fontSize: "0.7rem" }}>Age / Gender:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: "#000000 !important", fontSize: "0.82rem" }}>{form.age ? `${form.age} Years` : "Adult"} / {form.gender || "Other"}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 800, display: "block", fontSize: "0.7rem" }}>Primary Condition:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: "#000000 !important", fontSize: "0.82rem" }}>{form.disease || "Clinical Nutrition"}</Typography>
                      </Grid>
                      {form.weightKg && (
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 800, display: "block", fontSize: "0.7rem" }}>Weight / BMI:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: "#000000 !important", fontSize: "0.82rem" }}>{form.weightKg} kg {bmiVal > 0 ? `(${bmi} kg/m²)` : ""}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 800, display: "block", fontSize: "0.7rem" }}>Prescribed Protocol &amp; Target:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: "#000000 !important", fontSize: "0.82rem" }}>
                          {aiDietPlan.planName} — Target: {(aiDietPlan.targetCalories || 1750).toLocaleString()} kcal/day
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Clinical Summary */}
                  <Box sx={{ mb: 1.5, p: 0.9, bgcolor: "#FFFFFF !important", border: "1.2px solid #000000 !important", borderRadius: 1.2 }}>
                    <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.35 }}>
                      <strong>Clinical Summary:</strong> {aiDietPlan.summary}
                    </Typography>
                  </Box>

                  {/* 4 Macronutrients Badges (Similar to electrolyte cards in print, clean % / no descriptions) */}
                  <Grid container spacing={1} sx={{ mb: 1.5 }}>
                    <Grid item xs={3}>
                      <Box sx={{ p: 0.7, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#000000 !important", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>
                          CALORIES:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#000000 !important", fontSize: "0.8rem", mt: 0.1 }}>
                          {(aiDietPlan.targetCalories || 1750).toLocaleString()} kcal
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ p: 0.7, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#000000 !important", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>
                          PROTEIN:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#000000 !important", fontSize: "0.8rem", mt: 0.1 }}>
                          {formatMacroOnly(aiDietPlan.macroBreakdown?.protein, "protein", aiDietPlan.targetCalories || 1750)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ p: 0.7, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#000000 !important", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>
                          FAT:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#000000 !important", fontSize: "0.8rem", mt: 0.1 }}>
                          {formatMacroOnly(aiDietPlan.macroBreakdown?.fats, "fats", aiDietPlan.targetCalories || 1750)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ p: 0.7, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#000000 !important", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>
                          CARBS:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#000000 !important", fontSize: "0.8rem", mt: 0.1 }}>
                          {formatMacroOnly(aiDietPlan.macroBreakdown?.carbs, "carbs", aiDietPlan.targetCalories || 1750)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* DISTINCT HEADING 1: DAILY INDIAN MEAL SCHEDULE */}
                  <Box sx={{ bgcolor: "#000000 !important", color: "#FFFFFF !important", px: 1.5, py: 0.6, borderRadius: 1, mb: 1, mt: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: "0.98rem", letterSpacing: "0.5px", textTransform: "uppercase", color: "#FFFFFF !important" }}>
                      1. DAILY INDIAN MEAL SCHEDULE &amp; PORTIONS
                    </Typography>
                  </Box>

                  {/* Meal Slots List with Safe Wrapping */}
                  <Stack spacing={0.7} mb={1.5}>
                    {aiDietPlan.mealSchedule?.map((ms, i) => (
                      <Box key={i} sx={{ p: 0.7, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.3} flexWrap="wrap" gap={0.8}>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: "#000000 !important", fontSize: "0.82rem", flex: "1 1 auto", wordBreak: "break-word" }}>
                            {ms.time} — {ms.mealName}
                          </Typography>
                          <Box sx={{ flexShrink: 0, bgcolor: "#FFFFFF !important", border: "1.2px solid #000000 !important", borderRadius: 1, px: 0.8, py: 0.2 }}>
                            <Typography sx={{ fontWeight: 900, color: "#000000 !important", fontSize: "0.7rem", lineHeight: 1.2 }}>
                              {ms.portion}
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 600, fontSize: "0.76rem", lineHeight: 1.3, wordBreak: "break-word" }}>
                          {ms.focus}
                        </Typography>
                        {ms.clinicalNote && (
                          <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 600, display: "block", mt: 0.3, fontSize: "0.7rem", lineHeight: 1.2, wordBreak: "break-word" }}>
                            {ms.clinicalNote}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </Box>

            {/* =========================================================================
                PAGE 2+: DOCTOR REMARKS, ELECTROLYTES, EAT MORE, FOODS TO AVOID, HYDRATION, SIGNATURES
               ========================================================================= */}
            <Box className="diet-print-page-2" sx={{ border: "1.5px solid #000000 !important", borderRadius: 1.5, p: { xs: 2, sm: 2.5 }, bgcolor: "#FFFFFF !important", color: "#000000 !important", boxSizing: "border-box" }}>
              {/* Header for Page 2 */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} pb={1} sx={{ borderBottom: "1.5px solid #000000 !important" }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#000000 !important", fontSize: "1.15rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    ARPAN CLINICAL ASSISTANT
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 700, fontSize: "0.78rem" }}>
                    Patient: {form.patientName || "Patient"} | Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} | Clinical Protocol Continued
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 900, fontSize: "0.76rem" }}>
                    PAGE 2
                  </Typography>
                </Box>
              </Stack>

              {aiDietPlan && (
                <>
                  {/* DOCTOR CLINICAL REMARKS & SPECIAL INSTRUCTIONS (SPLIT TO PAGE 2) */}
                  <Box className="print-avoid-break" sx={{ mb: 1.8 }}>
                    <Box sx={{ bgcolor: "#000000 !important", color: "#FFFFFF !important", px: 1.5, py: 0.6, borderRadius: 1, mb: 0.8 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: "0.95rem", letterSpacing: "0.5px", textTransform: "uppercase", color: "#FFFFFF !important" }}>
                        DOCTOR CLINICAL REMARKS &amp; SPECIAL INSTRUCTIONS
                      </Typography>
                    </Box>

                    <Box sx={{ p: 0.8, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1 }}>
                      {(aiDietPlan.remarks || []).length > 0 ? (
                        <Stack spacing={0.5}>
                          {(aiDietPlan.remarks || []).map((rem, idx) => (
                            <Typography key={idx} variant="body2" sx={{ color: "#000000 !important", fontWeight: 700, fontSize: "0.78rem", display: "flex", alignItems: "flex-start", gap: 0.8, lineHeight: 1.3 }}>
                              <span>•</span>
                              <span>{rem}</span>
                            </Typography>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 600, fontSize: "0.78rem" }}>
                          Follow the specified portion sizes and timing strictly. Consume fresh, warm home-cooked meals and stay hydrated throughout the day.
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* 2. ELECTROLYTES (IF PRESENT / NOT DELETED) */}
                  {visibleSections.electrolytes && aiDietPlan.electrolyteLimits && (
                    <Box className="print-avoid-break" sx={{ mb: 1.8 }}>
                      <Box sx={{ bgcolor: "#000000 !important", color: "#FFFFFF !important", px: 1.5, py: 0.6, borderRadius: 1, mb: 0.8 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: "0.98rem", letterSpacing: "0.5px", textTransform: "uppercase", color: "#FFFFFF !important" }}>
                          ELECTROLYTE, MINERAL &amp; ORGAN SAFETY LIMITS (SALT, POTASSIUM &amp; MINERALS)
                        </Typography>
                      </Box>
                      <Grid container spacing={1}>
                        {ALL_ELECTROLYTE_CONFIG
                          .filter((cfg) => Boolean((aiDietPlan.electrolyteLimits as any)?.[cfg.key]))
                          .map((cfg) => {
                            const val = (aiDietPlan.electrolyteLimits as any)[cfg.key];
                            return (
                              <Grid item xs={6} key={cfg.key}>
                                <Box sx={{ p: 0.7, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 900, color: "#000000 !important", display: "block", fontSize: "0.72rem" }}>
                                    {cfg.label.toUpperCase()}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#000000 !important", fontSize: "0.8rem", mt: 0.1 }}>
                                    {val}
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                      </Grid>
                    </Box>
                  )}

                  {/* EAT MORE FOODS & FOODS TO AVOID (IF PRESENT / NOT DELETED) */}
                  {(visibleSections.recommendedFoods || visibleSections.foodsToAvoid) && (
                    <Grid container spacing={1.5} className="print-avoid-break" sx={{ mb: 1.8 }}>
                      {visibleSections.recommendedFoods && aiDietPlan.recommendedFoods?.length > 0 && (
                        <Grid item xs={12} md={visibleSections.foodsToAvoid ? 6 : 12}>
                          <Box sx={{ bgcolor: "#000000 !important", color: "#FFFFFF !important", px: 1.2, py: 0.5, borderRadius: 1, mb: 0.8 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: "0.9rem", letterSpacing: "0.5px", textTransform: "uppercase", color: "#FFFFFF !important" }}>
                              EAT MORE OF THESE WHOLESOME INDIAN FOODS
                            </Typography>
                          </Box>
                          <Stack spacing={0.5}>
                            {aiDietPlan.recommendedFoods.map((rf, i) => (
                              <Box key={i} sx={{ p: 0.6, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1, display: "flex", alignItems: "flex-start", gap: 0.8 }}>
                                <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 900, lineHeight: 1, fontSize: "0.85rem" }}>✓</Typography>
                                <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 700, fontSize: "0.76rem", lineHeight: 1.3 }}>
                                  {rf}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Grid>
                      )}

                      {visibleSections.foodsToAvoid && aiDietPlan.foodsToAvoid?.length > 0 && (
                        <Grid item xs={12} md={visibleSections.recommendedFoods ? 6 : 12}>
                          <Box sx={{ bgcolor: "#000000 !important", color: "#FFFFFF !important", px: 1.2, py: 0.5, borderRadius: 1, mb: 0.8 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: "0.9rem", letterSpacing: "0.5px", textTransform: "uppercase", color: "#FFFFFF !important" }}>
                              FOODS TO AVOID OR STRICTLY LIMIT
                            </Typography>
                          </Box>
                          <Stack spacing={0.5}>
                            {aiDietPlan.foodsToAvoid.map((fa, i) => (
                              <Box key={i} sx={{ p: 0.6, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1, display: "flex", alignItems: "flex-start", gap: 0.8 }}>
                                <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 900, lineHeight: 1, fontSize: "0.85rem" }}>✕</Typography>
                                <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 700, fontSize: "0.76rem", lineHeight: 1.3 }}>
                                  {fa}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  )}

                  {/* HYDRATION & HEALTHY HABITS (IF PRESENT / NOT DELETED) */}
                  {(visibleSections.hydration || visibleSections.lifestyle) && (
                    <Box className="print-avoid-break" sx={{ mb: 1.8 }}>
                      <Box sx={{ bgcolor: "#000000 !important", color: "#FFFFFF !important", px: 1.2, py: 0.5, borderRadius: 1, mb: 0.8 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: "0.92rem", letterSpacing: "0.5px", textTransform: "uppercase", color: "#FFFFFF !important" }}>
                          HYDRATION &amp; HEALTHY DAILY HABITS
                        </Typography>
                      </Box>
                      <Box sx={{ p: 0.8, bgcolor: "#FFFFFF !important", border: "1px solid #000000 !important", borderRadius: 1 }}>
                        {visibleSections.hydration && (
                          <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 700, mb: visibleSections.lifestyle ? 0.5 : 0, fontSize: "0.78rem", lineHeight: 1.3 }}>
                            <strong>💧 Hydration Guidance:</strong> {aiDietPlan.hydrationGuidance}
                          </Typography>
                        )}
                        {visibleSections.lifestyle && aiDietPlan.lifestyleAdvice?.length > 0 && (
                          <Typography variant="body2" sx={{ color: "#000000 !important", fontWeight: 700, fontSize: "0.78rem", lineHeight: 1.3 }}>
                            <strong>🌿 Daily Habits:</strong> {aiDietPlan.lifestyleAdvice.join(" · ")}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* SIGNATURE SECTION: DIETICIAN & PATIENT (SOLID B&W) */}
                  <Box className="print-avoid-break" sx={{ mt: 2, pt: 1.5, borderTop: "1.5px solid #000000 !important" }}>
                    <Grid container spacing={2}>
                      {/* Dietician Signature Box */}
                      <Grid item xs={6}>
                        <Box sx={{ border: "1px solid #000000 !important", borderRadius: 1, p: 1.2, bgcolor: "#FFFFFF !important" }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: "#000000 !important", display: "block", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, fontSize: "0.72rem" }}>
                            Clinical Nutritionist / Dietician
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: "#000000 !important", mb: 1.5, fontSize: "0.84rem" }}>
                            Name: {authUser?.name || "Dr. Yashwant Dubey (Clinical Nutrition Specialist)"}
                          </Typography>
                          <Box sx={{ borderBottom: "1.2px dashed #000000 !important", height: 20, mb: 0.5 }} />
                          <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 800, display: "block", fontSize: "0.72rem" }}>
                            Signature of Dietician
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 700, display: "block", mt: 0.2, fontSize: "0.7rem" }}>
                            Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Patient Signature Box */}
                      <Grid item xs={6}>
                        <Box sx={{ border: "1px solid #000000 !important", borderRadius: 1, p: 1.2, bgcolor: "#FFFFFF !important" }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: "#000000 !important", display: "block", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, fontSize: "0.72rem" }}>
                            Patient / Caregiver Acknowledgement
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: "#000000 !important", mb: 1.5, fontSize: "0.84rem" }}>
                            Name: {form.patientName || "Patient"}
                          </Typography>
                          <Box sx={{ borderBottom: "1.2px dashed #000000 !important", height: 20, mb: 0.5 }} />
                          <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 800, display: "block", fontSize: "0.72rem" }}>
                            Signature of Patient
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#000000 !important", fontWeight: 700, display: "block", mt: 0.2, fontSize: "0.7rem" }}>
                            Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Digital Verification */}
                    <Stack direction="row" alignItems="center" spacing={1} mt={1.2}>
                      <Verified sx={{ color: "#000000 !important", fontSize: 18 }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#000000 !important", fontSize: "0.72rem" }}>
                        Digitally Generated &amp; Verified · Arpan Clinical Care OS Clinical Nutrition Department
                      </Typography>
                    </Stack>
                  </Box>
                </>
              )}
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

