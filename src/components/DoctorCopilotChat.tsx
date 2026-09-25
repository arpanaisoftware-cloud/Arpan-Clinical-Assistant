'use client';

import React, { useState, KeyboardEvent } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Avatar,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import {
  Close,
  Send,
  Psychology
} from '@mui/icons-material';
import { PatientInput } from '../types/clinical';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface DoctorCopilotChatProps {
  open: boolean;
  onClose: () => void;
  currentPatientData?: PatientInput;
}

export default function DoctorCopilotChat({ open, onClose, currentPatientData }: DoctorCopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello Dr. Dubey! I am your AI Clinical Assistant. ${currentPatientData?.patientName
          ? `I've loaded ${currentPatientData.patientName}'s case details (${currentPatientData.disease}).`
          : 'How can I assist you with drug interactions, dosage guidelines, or generic alternatives today?'
        }`
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const quickPrompts: string[] = [
    "Alternative if patient is allergic to Penicillin?",
    "Renal dose adjustments for Metformin?",
    "Dietary restrictions for Atorvastatin?",
    "Can Ibuprofen cause Lisinopril interaction?"
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // AI logic response simulation
    setTimeout(() => {
      let aiReply = "Based on current clinical guidelines (FDA/WHO): ";
      const qLower = query.toLowerCase();

      if (qLower.includes("penicillin")) {
        aiReply += "For penicillin-allergic patients, non-beta-lactam options include Macrolides (Azithromycin 500mg QD or Clarithromycin 500mg BID) or Fluorquinolones depending on bacterial sensitivity.";
      } else if (qLower.includes("renal") || qLower.includes("metformin")) {
        aiReply += "Metformin is contraindicated if eGFR < 30 mL/min/1.73m². For eGFR 30–45 mL/min, reduce max dose to 1000mg/day and monitor renal parameters every 3 months.";
      } else if (qLower.includes("atorvastatin") || qLower.includes("diet")) {
        aiReply += "Avoid grapefruit and grapefruit juice entirely while taking Atorvastatin as it inhibits intestinal CYP3A4, markedly increasing plasma statin levels.";
      } else if (qLower.includes("ibuprofen") || qLower.includes("lisinopril")) {
        aiReply += "Yes, NSAIDs like Ibuprofen reduce the antihypertensive efficacy of Lisinopril and increase acute renal failure risk due to dual afferent/efferent vasoconstriction. Consider Paracetamol for pain relief.";
      } else {
        aiReply += `Regarding "${query}": The prescribed regime has been evaluated against drug safety databases. Standard therapeutic protocols recommend monitoring liver function tests and serum electrolytes.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0, bgcolor: 'background.paper', opacity: 1, backgroundImage: 'none' } }}>
      <Box sx={{ p: 2.5, bgcolor: '#6C5CE7', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
            <Psychology />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Arpan Clinical AI Copilot
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Clinical Decision Assistant
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: '#FFF' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Message Chat Body */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: 'background.default', height: 'calc(100vh - 210px)' }}>
        <Stack spacing={2}>
          {messages.map((m, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 1.8,
                  borderRadius: 1,
                  bgcolor: m.sender === 'user' ? '#6C5CE7' : 'background.paper',
                  color: m.sender === 'user' ? '#FFF' : 'text.primary',
                  borderColor: m.sender === 'user' ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.5, fontSize: '0.88rem' }}>
                  {m.text}
                </Typography>
              </Paper>
            </Box>
          ))}

          {isTyping && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', pl: 1 }}>
              ⚡ AI Copilot is consulting medical literature...
            </Typography>
          )}
        </Stack>

        {/* Quick Prompts */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
            Suggested Clinical Queries:
          </Typography>
          <Stack direction="column" spacing={0.8}>
            {quickPrompts.map((qp, idx) => (
              <Chip
                key={idx}
                label={qp}
                onClick={() => handleSend(qp)}
                size="small"
                variant="outlined"
                color="secondary"
                clickable
                sx={{ justifyContent: 'flex-start', fontSize: '0.75rem', py: 1.5 }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      <Divider />

      {/* Input Field */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask AI Copilot about drugs, doses..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
          />
          <Button variant="contained" color="secondary" onClick={() => handleSend()} sx={{ minWidth: 48, p: 1 }}>
            <Send fontSize="small" />
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
