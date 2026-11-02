'use client';

import React, { useRef, useState, useEffect } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Translate from '@mui/icons-material/Translate';
import {
  lookupWordSync,
  transliterateWord,
  transliterateHinglishText,
  isPreservedEnglishToken,
  convertHindiDigitsToArabic
} from '@/lib/transliterate';

export interface HinglishTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChangeValue: (value: string) => void;
  phoneticEnabled?: boolean;
}

export default function HinglishTextField({
  value = '',
  onChangeValue,
  phoneticEnabled = false,
  InputProps,
  ...rest
}: HinglishTextFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Maintain local state for instant 0ms typing & backspacing without waiting for parent re-render
  const [localValue, setLocalValue] = useState<string>(() => convertHindiDigitsToArabic(value || ''));
  const localValueRef = useRef(localValue);
  localValueRef.current = localValue;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync from props if external value changes (e.g. initial load, dialog open, or batch transliterate)
  useEffect(() => {
    const normalized = convertHindiDigitsToArabic(value || '');
    if (normalized !== localValueRef.current) {
      setLocalValue(normalized);
      localValueRef.current = normalized;
    }
  }, [value]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Flush pending changes to parent immediately
  const flushToParent = (val: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onChangeValue(val);
  };

  const scheduleParentSync = (val: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChangeValue(val);
      debounceTimerRef.current = null;
    }, 150);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const rawVal = e.target.value;
    const normalized = convertHindiDigitsToArabic(rawVal);
    // Instant local state update: 0ms latency for typing and backspace!
    setLocalValue(normalized);
    localValueRef.current = normalized;
    scheduleParentSync(normalized);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<any>) => {
    if (rest.onKeyDown) {
      rest.onKeyDown(e);
    }

    if (!phoneticEnabled) return;

    // When space is pressed, check word before cursor and convert
    if (e.key === ' ' || e.code === 'Space') {
      const target = (e.target as HTMLInputElement | HTMLTextAreaElement) || inputRef.current;
      const currentVal = localValueRef.current;
      const cursor = target?.selectionStart ?? currentVal.length;

      const textBefore = currentVal.slice(0, cursor);
      const textAfter = currentVal.slice(cursor);
      const match = textBefore.match(/([A-Za-z0-9_'-]+)$/);

      if (match) {
        const rawWord = match[1];

        // If it's a number, clinical unit, or measurement (e.g. 100, 30gm, 100mg, 150kcal, gm, etc.), preserve in English as digits!
        if (isPreservedEnglishToken(rawWord)) {
          return;
        }

        // If a number is attached to a word (e.g. "100roti" or "2phulka"), separate them so number stays 100/2
        const numWordMatch = rawWord.match(/^(\d+(?:\.\d+)?)([A-Za-z]+)$/);
        if (numWordMatch) {
          e.preventDefault();
          const numPart = numWordMatch[1];
          const wordPart = numWordMatch[2];
          const wordStart = textBefore.length - rawWord.length;
          const syncMatch = lookupWordSync(wordPart);
          const hindiWord = syncMatch || (await transliterateWord(wordPart));
          const cleanHindi = convertHindiDigitsToArabic(hindiWord);
          const newText = textBefore.slice(0, wordStart) + numPart + ' ' + cleanHindi + ' ' + textAfter;
          const newCursor = wordStart + numPart.length + 1 + cleanHindi.length + 1;
          const cleanNewText = convertHindiDigitsToArabic(newText);
          setLocalValue(cleanNewText);
          localValueRef.current = cleanNewText;
          flushToParent(cleanNewText);
          requestAnimationFrame(() => {
            if (target && target.setSelectionRange) {
              target.setSelectionRange(newCursor, newCursor);
            }
          });
          return;
        }

        if (/^[A-Za-z]+$/.test(rawWord)) {
          // Prevent default space insertion immediately so cursor and word sync cleanly
          e.preventDefault();
          const wordStart = textBefore.length - rawWord.length;

          // Try synchronous lookup first (0ms)
          const syncMatch = lookupWordSync(rawWord);
          if (syncMatch) {
            const cleanHindi = convertHindiDigitsToArabic(syncMatch);
            const newText = textBefore.slice(0, wordStart) + cleanHindi + ' ' + textAfter;
            const newCursor = wordStart + cleanHindi.length + 1;
            const cleanNewText = convertHindiDigitsToArabic(newText);
            setLocalValue(cleanNewText);
            localValueRef.current = cleanNewText;
            flushToParent(cleanNewText);
            requestAnimationFrame(() => {
              if (target && target.setSelectionRange) {
                target.setSelectionRange(newCursor, newCursor);
              }
            });
            return;
          }

          // Asynchronous lookup fallback
          const hindiWord = await transliterateWord(rawWord);
          const cleanHindi = convertHindiDigitsToArabic(hindiWord);
          const newText = textBefore.slice(0, wordStart) + cleanHindi + ' ' + textAfter;
          const newCursor = wordStart + cleanHindi.length + 1;
          const cleanNewText = convertHindiDigitsToArabic(newText);
          setLocalValue(cleanNewText);
          localValueRef.current = cleanNewText;
          flushToParent(cleanNewText);
          requestAnimationFrame(() => {
            if (target && target.setSelectionRange) {
              target.setSelectionRange(newCursor, newCursor);
            }
          });
        }
      }
    }
  };

  const handleBlur = async (e: React.FocusEvent<any>) => {
    if (rest.onBlur) {
      rest.onBlur(e);
    }

    // Flush any pending changes to parent immediately on blur
    flushToParent(localValueRef.current);

    if (!phoneticEnabled) return;

    const currentVal = localValueRef.current;
    // On blur, if there are any remaining English letters, transliterate them
    if (/[A-Za-z]/.test(currentVal)) {
      const converted = await transliterateHinglishText(currentVal);
      if (converted && converted !== currentVal) {
        const clean = convertHindiDigitsToArabic(converted);
        setLocalValue(clean);
        localValueRef.current = clean;
        flushToParent(clean);
      }
    } else if (/[०-९]/.test(currentVal)) {
      const clean = convertHindiDigitsToArabic(currentVal);
      setLocalValue(clean);
      localValueRef.current = clean;
      flushToParent(clean);
    }
  };

  const handleManualConvert = async () => {
    const currentVal = localValueRef.current;
    if (!currentVal || !currentVal.trim()) return;
    const converted = await transliterateHinglishText(currentVal);
    if (converted) {
      const clean = convertHindiDigitsToArabic(converted);
      setLocalValue(clean);
      localValueRef.current = clean;
      flushToParent(clean);
    }
  };

  // Custom adornment when phonetic mode is active
  const endAdornment = phoneticEnabled ? (
    <InputAdornment position="end" sx={{ alignSelf: rest.multiline ? 'flex-start' : 'center', mt: rest.multiline ? 1 : 0 }}>
      <Tooltip title="Phonetic Hinglish active: Numbers stay like 100. Space converts words to Hindi. Click to transliterate full field now.">
        <IconButton
          size="small"
          onClick={handleManualConvert}
          sx={{
            p: 0.4,
            bgcolor: 'rgba(108, 92, 231, 0.1)',
            '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.2)' }
          }}
        >
          <Translate sx={{ fontSize: 14, color: '#6C5CE7' }} />
        </IconButton>
      </Tooltip>
      {InputProps?.endAdornment}
    </InputAdornment>
  ) : (
    InputProps?.endAdornment
  );

  return (
    <TextField
      {...rest}
      value={localValue}
      inputRef={inputRef}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      InputProps={{
        ...InputProps,
        endAdornment
      }}
    />
  );
}
