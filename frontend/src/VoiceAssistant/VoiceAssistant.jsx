import { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  sendMessageToAI,
  persistMessages,
  createGuestConversation,
  persistGuestConversation,
  loadConversationIndex,
  loadConvMessages,
  setActiveConvId,
  updateGuestConvTitle,
  deleteGuestConversation,
  generateSessionId,
} from '../services/aiService';
import conversationService from '../services/conversationService';
import ChatSidebar from '../components/ChatSidebar/ChatSidebar';
import profileService from '../services/profileService';
import { getStoredVoicePreference, setStoredVoicePreference, speechService } from '../services/speechService';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/VoiceAssistant.module.css';

const SILENCE_TIMEOUT = 3500;
const TEXTAREA_MAX_HEIGHT = 240; // px

const logVoiceDebug = (label, payload) => {
  if (payload !== undefined) {
    console.log(label, payload);
    return;
  }
  console.log(label);
};

const getWelcomeMessage = (language) => {
  if (language === 'ur') {
    return 'السلام علیکم! میں آپ کا ریسٹورنٹ اسسٹنٹ ہوں۔ میں آپ کو ہمارے مینو، قیمتوں، کھانوں کی تجاویز اور آرڈر کے بارے میں مدد کر سکتا ہوں۔';
  }

  return 'Hello! I\'m your restaurant assistant. I can help you with our menu, prices, recommendations and orders.';
};

const getFriendlyErrorMessage = (language) => {
  if (language === 'ur') {
    return 'معذرت، میں ابھی ریسٹورنٹ اسسٹنٹ سے رابطہ نہیں کر سکا۔ براہ کرم دوبارہ کوشش کریں۔';
  }

  return "Sorry, I couldn't connect to the restaurant assistant right now. Please try again.";
};

const getThinkingLabel = (language) => (language === 'ur' ? 'سوچ رہا ہوں...' : 'Thinking...');

const getRecognitionLanguage = (language) => {
  if (language === 'ur') return 'ur-PK';
  return 'en-US';
};

const detectMessageLanguage = (message = '') => {
  const text = String(message || '').trim();
  if (!text) return 'en';
  if (/[\u0600-\u06FF]/u.test(text)) return 'ur';
  const romanUrduTerms = /\b(mujhe|mujhy|main|aik|aur|yeh|hai|nahi|chahiye|chaiye|kya|menu|price|pizza|pepsi|fajita|sasti|gora|biryani|pulao)\b/i;
  return romanUrduTerms.test(text) ? 'ur' : 'en';
};

function VoiceAssistant() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [assistantState, setAssistantState] = useState('idle');
  const [inputValue, setInputValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvIdState] = useState(null);
  const activeConversationRef = useRef(null);
  const conversationBootstrappedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => getStoredVoicePreference());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [speechNotice, setSpeechNotice] = useState('');
  const [profileFallback, setProfileFallback] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const lastActionWasSendRef = useRef(false);
  const lastWasTranscriptRef = useRef(false);
  const authLoadingRef = useRef(false);
  const fetchingProfileRef = useRef(null);
  const userRef = useRef(user);
  const silenceTimerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const currentTranscriptRef = useRef('');
  const lastSubmittedTranscriptRef = useRef('');
  const processingRef = useRef(false);
  // Start with continuous listening disabled so first Start click actually starts recognition
  const continuousListeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const mountedRef = useRef(true);
  const componentInstanceIdRef = useRef(`va_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);
  const recognitionSessionRef = useRef(0);
  const recognitionActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const welcomePlayedRef = useRef(false);
  const lastWelcomeUserIdRef = useRef(null);

  const refreshConversationList = async (authenticated) => {
    if (authenticated) {
      try {
        setConversations(await conversationService.list());
      } catch {
        setConversations([]);
      }
      return;
    }
    setConversations(loadConversationIndex());
  };

  const setActiveConversation = (conversation, nextMessages = []) => {
    activeConversationRef.current = conversation;
    setActiveConvIdState(conversation.id || conversation._id);
    setMessages(nextMessages);
    if (conversation.id) setActiveConvId(conversation.id);
    else setActiveConvId(null);
  };

  const startNewConversation = async (authenticated) => {
    const sessionId = generateSessionId();
    if (authenticated) {
      setActiveConversation({ sessionId, title: 'New Conversation' }, []);
      await refreshConversationList(true);
      return;
    }

    const conversation = createGuestConversation();
    setActiveConversation(conversation, []);
    await refreshConversationList(false);
  };

  const ensureConversationPersisted = async () => {
    const conversation = activeConversationRef.current;
    if (!conversation) return null;

    if (conversation.id) {
      persistGuestConversation(conversation);
      return conversation;
    }

    if (!conversation._id) {
      try {
        const created = await conversationService.create(conversation.sessionId);
        activeConversationRef.current = created;
        setActiveConvIdState(created._id);
        return created;
      } catch {
        return conversation;
      }
    }

    return conversation;
  };

  const selectConversation = async (id) => {
    if (user) {
      try {
        const conversation = await conversationService.get(id);
        if (conversation) setActiveConversation(conversation, conversation.messages || []);
      } catch {
        setSpeechNotice('Unable to load that conversation right now.');
      }
      return;
    }

    const entry = loadConversationIndex().find((conversation) => conversation.id === id);
    if (entry) setActiveConversation(entry, loadConvMessages(id));
  };

  const handleNewChat = () => {
    speechService.stop();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    stopRecognition({ keepState: true });
    startNewConversation(!!user);
  };

  const handleDeleteConversation = async (id) => {
    try {
      if (user) await conversationService.delete(id);
      else deleteGuestConversation(id);
      if (id === activeConvId) await startNewConversation(!!user);
      else await refreshConversationList(!!user);
    } catch {
      setSpeechNotice('Unable to delete that conversation right now.');
    }
  };

  useEffect(() => {
    if (authLoading || conversationBootstrappedRef.current) return;
    conversationBootstrappedRef.current = true;
    startNewConversation(!!user);
  }, [authLoading, user]);

  const previousConversationUserRef = useRef(user?._id || null);
  useEffect(() => {
    const previousUserId = previousConversationUserRef.current;
    const currentUserId = user?._id || null;
    if (!authLoading && previousUserId === null && currentUserId !== null && activeConversationRef.current?.id && messages.some((message) => message.role === 'user')) {
      const guestConversation = activeConversationRef.current;
      conversationService.create(guestConversation.sessionId, guestConversation.title)
        .then((conversation) => conversationService.update(conversation._id, { messages }))
        .then((conversation) => {
          startNewConversation(true);
          refreshConversationList(true);
        })
        .catch(() => refreshConversationList(true));
    }
    if (!authLoading && previousUserId !== null && currentUserId === null) {
      startNewConversation(false);
      refreshConversationList(false);
    }
    previousConversationUserRef.current = currentUserId;
  }, [authLoading, user, messages]);

  const isListening = assistantState === 'listening';
  const isThinking = assistantState === 'processing';
  const statusLabel = {
    idle: selectedLanguage === 'ur' ? 'تیار' : 'Ready',
    listening: selectedLanguage === 'ur' ? 'سن رہا ہوں' : 'Listening',
    processing: selectedLanguage === 'ur' ? 'سوچ رہا ہوں' : 'Thinking',
    speaking: selectedLanguage === 'ur' ? 'بول رہا ہوں' : 'Speaking',
    stopped: selectedLanguage === 'ur' ? 'رک گیا' : 'Stopped',
    error: selectedLanguage === 'ur' ? 'غلطی' : 'Connection Error',
  }[assistantState] || (selectedLanguage === 'ur' ? 'تیار' : 'Ready');

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const clearRestartTimer = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  const scheduleRestart = () => {
    // Automatic restart disabled in manual push-to-start mode
    try { console.log('[VOICE DEBUG] scheduleRestart called but disabled in manual mode'); } catch (e) {}
    return;
  };

  const stopRecognition = (options = {}) => {
    const recognition = recognitionRef.current;
    recognitionActiveRef.current = false;
    logVoiceDebug('[VOICE DEBUG] recognition.stop()', {
      hasRecognition: !!recognition,
      hasStop: !!(recognition && typeof recognition.stop === 'function'),
      keepState: !!options.keepState,
      state: assistantState,
    });

    if (recognition && typeof recognition.stop === 'function') {
      try {
        recognition.stop();
      } catch (error) {
        console.error('[VOICE DEBUG] recognition.stop() threw', error);
      }
    }

    clearSilenceTimer();
    clearRestartTimer();
    currentTranscriptRef.current = '';
    setInterimTranscript('');
    setInputValue('');

    if (!options.keepState) {
      setAssistantState('stopped');
    }
  };

  const startListeningSession = ({ silentRestart = false } = {}) => {
    if (typeof window === 'undefined') return;

    const speechRecognitionAvailable = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const permissionStatus = navigator.permissions && navigator.permissions.query ? 'available' : 'unavailable';
    logVoiceDebug('[VOICE DEBUG] recognition.start() preflight', {
      secureContext: !!window.isSecureContext,
      hasSpeechRecognition: speechRecognitionAvailable,
      hasWebkitSpeechRecognition: !!window.webkitSpeechRecognition,
      hasMediaDevices: !!navigator.mediaDevices,
      permissionApi: permissionStatus,
      assistantState,
      isListening,
      continuousListening: continuousListeningRef.current,
      recognitionActive: recognitionActiveRef.current,
      processing: processingRef.current,
      isSpeaking: isSpeakingRef.current,
    });

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionApi) {
      console.error('[VOICE DEBUG] browser unsupported SpeechRecognition');
      setAssistantState('error');
      setSpeechNotice(selectedLanguage === 'ur'
        ? 'معذرت، یہ براؤزر وائس ان پٹ کے لیے معاون نہیں ہے۔ براہ کرم Chrome، Edge، یا کسی معاون براؤزر کا استعمال کریں، یا ٹائپ کریں۔'
        : 'Voice input isn\'t supported in this browser. Please use Chrome, Edge, or another supported browser, or type your message instead.');
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition || typeof recognition.start !== 'function') {
      console.error('[VOICE DEBUG] recognition missing or start() unavailable', { hasRecognition: !!recognition });
      setAssistantState('error');
      return;
    }

    if (recognitionActiveRef.current || processingRef.current || stopRequestedRef.current || isSpeakingRef.current) {
      logVoiceDebug('[VOICE DEBUG] recognition.start() blocked by state', {
        recognitionActive: recognitionActiveRef.current,
        processing: processingRef.current,
        stopRequested: stopRequestedRef.current,
        isSpeaking: isSpeakingRef.current,
      });
      return;
    }

    stopRequestedRef.current = false;
    setSpeechNotice('');
    setInputValue('');
    currentTranscriptRef.current = '';
    lastSubmittedTranscriptRef.current = '';
    setInterimTranscript('');
    recognitionSessionRef.current += 1;

    try {
      recognition.lang = getRecognitionLanguage(selectedLanguage === 'auto' ? 'en' : selectedLanguage);
      logVoiceDebug('[VOICE DEBUG] recognition.start()', { lang: recognition.lang, session: recognitionSessionRef.current, hasRecognition: !!recognition });
      try { console.log('[VOICE DEBUG] RESTARTING RECOGNITION', { session: recognitionSessionRef.current }); } catch (e) {}
      recognition.start();
      setAssistantState('listening');
      if (!silentRestart) {
        setMessages((prev) => (prev.length === 0 ? [{ role: 'assistant', content: getWelcomeMessage(selectedLanguage) }] : prev));
      }
    } catch (error) {
      console.error('[VOICE DEBUG] recognition.start() threw', error);
      setAssistantState('error');
      setSpeechNotice(selectedLanguage === 'ur'
        ? 'آواز کی شناخت شروع نہیں ہو سکی۔ براہ کرم دوبارہ کوشش کریں۔'
        : 'Voice recognition could not start. Please try again.');
    }
  };

  const handleStopListening = () => {
    stopRequestedRef.current = true;
    processingRef.current = false;
    recognitionActiveRef.current = false;
    clearSilenceTimer();
    clearRestartTimer();
    // Do not clear transcript on manual stop; keep text in input for review
    stopRecognition({ keepState: true });
    setAssistantState('idle');
  };

  const submitTranscript = async (transcript) => {
    const trimmedText = String(transcript || '').trim();
    logVoiceDebug('[VOICE DEBUG] submitting transcript', { trimmedText, processing: processingRef.current, currentAssistantState: assistantState });
    if (!trimmedText || processingRef.current) {
      currentTranscriptRef.current = '';
      setInterimTranscript('');
      return;
    }

    if (trimmedText === lastSubmittedTranscriptRef.current) {
      currentTranscriptRef.current = '';
      setInterimTranscript('');
      return;
    }

    if (assistantState === 'processing') {
      return;
    }

    lastSubmittedTranscriptRef.current = trimmedText;
    processingRef.current = true;
    clearSilenceTimer();
    clearRestartTimer();
    stopRecognition({ keepState: true });
    setInputValue('');
    setInterimTranscript('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmedText }]);
    lastActionWasSendRef.current = true;
    setAssistantState('processing');
    setIsLoading(true);
    setSpeechNotice('');

    try {
      await ensureConversationPersisted();
      if (userRef.current && authLoadingRef.current) {
        let waited = 0;
        while (authLoadingRef.current && waited < 1500) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => setTimeout(resolve, 100));
          waited += 100;
        }
      }

      let phone = userRef.current?.phone ?? null;
      let address = userRef.current?.address ?? null;
      if (userRef.current && (!phone || !address)) {
        try {
          if (profileFallback && profileFallback._id === userRef.current._id) {
            phone = phone || profileFallback.phone || null;
            address = address || profileFallback.address || null;
          } else {
            if (!fetchingProfileRef.current) {
              fetchingProfileRef.current = profileService.getProfile()
                .then((res) => { setProfileFallback(res); return res; })
                .catch(() => null)
                .finally(() => { fetchingProfileRef.current = null; });
            }

            const profile = await fetchingProfileRef.current;
            if (profile) {
              phone = phone || profile.phone || null;
              address = address || profile.address || null;
              setProfileFallback(profile);
            }
          }
        } catch (error) {
          phone = phone || null;
          address = address || null;
        }
      }

      const detectedLanguage = selectedLanguage === 'auto' ? detectMessageLanguage(trimmedText) : selectedLanguage;
      logVoiceDebug('[VOICE DEBUG] sendMessageToAI', {
        message: trimmedText,
        language: detectedLanguage,
        auth: !!userRef.current,
        userId: userRef.current?._id || null,
        phone: phone || null,
        address: address || null,
      });
      const result = await sendMessageToAI(trimmedText, detectedLanguage, {
        authenticated: !!userRef.current,
        userId: userRef.current?._id || null,
        userName: userRef.current?.name || null,
        phone,
        address,
        city: null,
        sessionId: activeConversationRef.current?.sessionId,
      });

      const assistantReply = result?.reply || result?.message || result?.answer || 'Sorry, I could not process your request right now.';
      logVoiceDebug('[VOICE DEBUG] AI response received', { assistantReply, resultType: typeof result });
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantReply, language: detectedLanguage }]);

      if (voiceEnabled) {
        logVoiceDebug('[VOICE DEBUG] TTS started', { assistantReply, language: detectedLanguage });
        speechService.stop();
        setIsSpeaking(true);
        try { isSpeakingRef.current = true; } catch (e) {}
        setSpeakingMessageId(`assistant-${assistantReply}`);
        setAssistantState('speaking');
        // Ensure recognition is stopped before playing TTS to avoid feedback
        try { stopRecognition({ keepState: true }); } catch (e) {}

        try {
          const speechResult = await speechService.speak(assistantReply, detectedLanguage);
          if (!speechResult.ok) {
            setSpeechNotice(detectedLanguage === 'ur'
              ? 'آواز چلانے کی مدد دستیاب نہیں ہے۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
              : 'Voice playback is not available right now. You can still read the response.');
          }
        } catch (error) {
          console.error('[VOICE DEBUG] TTS error', error);
          setSpeechNotice(detectedLanguage === 'ur'
            ? 'آواز چلانے میں خرابی ہوئی۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
            : 'Voice playback failed. You can still read the response.');
        } finally {
          logVoiceDebug('[VOICE DEBUG] TTS ended', { assistantReply });
          setIsSpeaking(false);
          // ensure ref is updated synchronously so restart logic sees the change
          try { isSpeakingRef.current = false; } catch (e) {}
          setSpeakingMessageId(null);
          try {
            console.log('[VOICE DEBUG] TTS finally: checking restart conditions', {
              stopRequested: stopRequestedRef.current,
              processing: processingRef.current,
              isSpeaking: isSpeakingRef.current,
              recognitionActive: recognitionActiveRef.current,
            });
          } catch (e) {}
        }
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: getFriendlyErrorMessage(selectedLanguage === 'auto' ? 'en' : selectedLanguage) }]);
      setAssistantState('error');
    } finally {
      processingRef.current = false;
      setIsLoading(false);

      // Diagnostic: about to decide whether to schedule restart
      try {
        // eslint-disable-next-line no-console
        console.log('[VOICE DEBUG] ABOUT TO SCHEDULE RESTART', {
          continuousListening: continuousListeningRef.current,
          stopRequested: stopRequestedRef.current,
          processing: processingRef.current,
          isSpeaking: isSpeakingRef.current,
          recognitionActive: recognitionActiveRef.current,
          assistantState,
        });
      } catch (e) {}

      setAssistantState('idle');
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    // Ensure recognition is stopped before sending to avoid capturing audio during TTS
    try { stopRecognition({ keepState: true }); } catch (e) {}

    const messageLanguage = selectedLanguage === 'auto' ? detectMessageLanguage(trimmedMessage) : selectedLanguage;
    const userMessage = { role: 'user', content: trimmedMessage };
    lastActionWasSendRef.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setInterimTranscript('');
    setInputValue('');
    setAssistantState('processing');
    setIsLoading(true);
    setSpeechNotice('');
    clearSilenceTimer();
    clearRestartTimer();
    processingRef.current = true;

    try {
      await ensureConversationPersisted();
      if (userRef.current && authLoadingRef.current) {
        let waited = 0;
        while (authLoadingRef.current && waited < 1500) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => setTimeout(resolve, 100));
          waited += 100;
        }
      }

      let phone = userRef.current?.phone ?? null;
      let address = userRef.current?.address ?? null;

      if (userRef.current && (!phone || !address)) {
        try {
          if (profileFallback && profileFallback._id === userRef.current._id) {
            phone = phone || profileFallback.phone || null;
            address = address || profileFallback.address || null;
          } else {
            if (!fetchingProfileRef.current) {
              fetchingProfileRef.current = profileService.getProfile()
                .then((res) => { setProfileFallback(res); return res; })
                .catch(() => null)
                .finally(() => { fetchingProfileRef.current = null; });
            }

            const profile = await fetchingProfileRef.current;
            if (profile) {
              phone = phone || profile.phone || null;
              address = address || profile.address || null;
              setProfileFallback(profile);
            }
          }
        } catch (error) {
          phone = phone || null;
          address = address || null;
        }
      }

      const result = await sendMessageToAI(trimmedMessage, messageLanguage, {
        authenticated: !!userRef.current,
        userId: userRef.current?._id || null,
        userName: userRef.current?.name || null,
        phone,
        address,
        sessionId: activeConversationRef.current?.sessionId,
      });

      const assistantReply = result?.reply || result?.message || result?.answer || 'Sorry, I could not process your request right now.';
      const assistantMessage = { role: 'assistant', content: assistantReply, language: messageLanguage };
      setMessages((prev) => [...prev, assistantMessage]);

      if (voiceEnabled) {
        speechService.stop();
        setIsSpeaking(true);
        try { isSpeakingRef.current = true; } catch (e) {}
        setSpeakingMessageId(`assistant-${assistantReply}`);
        setAssistantState('speaking');
        // Ensure recognition is stopped before playing TTS to avoid feedback
        try { stopRecognition({ keepState: true }); } catch (e) {}
        try {
          const speechResult = await speechService.speak(assistantReply, messageLanguage);
          if (!speechResult.ok) {
            setSpeechNotice(messageLanguage === 'ur'
              ? 'آواز چلانے کی مدد دستیاب نہیں ہے۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
              : 'Voice playback is not available right now. You can still read the response.');
          }
        } catch (error) {
          setSpeechNotice(messageLanguage === 'ur'
            ? 'آواز چلانے میں خرابی ہوئی۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
            : 'Voice playback failed. You can still read the response.');
        } finally {
          setIsSpeaking(false);
          try { isSpeakingRef.current = false; } catch (e) {}
          setSpeakingMessageId(null);
          try {
            console.log('[VOICE DEBUG] TTS finally (sendMessage): checking restart conditions', {
              continuousListening: continuousListeningRef.current,
              stopRequested: stopRequestedRef.current,
              processing: processingRef.current,
              isSpeaking: isSpeakingRef.current,
              recognitionActive: recognitionActiveRef.current,
            });
          } catch (e) {}

          try { console.log('[VOICE DEBUG] TTS finally (sendMessage): (auto-restart disabled)'); } catch (e) {}
        }
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: getFriendlyErrorMessage(messageLanguage) }]);
      setAssistantState('error');
    } finally {
      processingRef.current = false;
      setIsLoading(false);
      lastSubmittedTranscriptRef.current = '';

      setAssistantState('idle');
    }
  };

  useEffect(() => {
    setMessages((prevMessages) => {
      if (prevMessages.length === 0) {
        return [{ role: 'assistant', content: getWelcomeMessage(selectedLanguage) }];
      }

      const isOnlyWelcomeMessage =
        prevMessages.length === 1 &&
        prevMessages[0].role === 'assistant' &&
        [getWelcomeMessage('en'), getWelcomeMessage('ur'), getWelcomeMessage('auto')].includes(prevMessages[0].content);

      if (isOnlyWelcomeMessage) {
        return [{ role: 'assistant', content: getWelcomeMessage(selectedLanguage) }];
      }

      return prevMessages;
    });
  }, [selectedLanguage]);

  useEffect(() => {
    // Component mounted
    try {
      // eslint-disable-next-line no-console
      console.log('[VOICE DEBUG] VA MOUNT', { componentInstanceId: componentInstanceIdRef.current });
    } catch (e) {}

    return () => {
      // Component cleanup/unmount
      try {
        // eslint-disable-next-line no-console
        console.log('[VOICE DEBUG] VA UNMOUNT (cleanup)', { componentInstanceId: componentInstanceIdRef.current });
      } catch (e) {}

      mountedRef.current = false;
      try {
        // eslint-disable-next-line no-console
        console.log('[VOICE DEBUG] VA mountedRef set false', { componentInstanceId: componentInstanceIdRef.current });
      } catch (e) {}

      clearSilenceTimer();
      clearRestartTimer();
      stopRecognition({ keepState: true });
      speechService.stop();
    };
  }, []);

  // Persist guest chats locally and authenticated chats in MongoDB.
  useEffect(() => {
    const conversation = activeConversationRef.current;
    if (!conversation || !activeConvId) return;
    if (!messages.some((message) => message.role === 'user')) return;

    if (conversation.id) {
      persistGuestConversation(conversation);
      persistMessages(messages, conversation.id);
      const firstUserMessage = messages.find((message) => message.role === 'user');
      if (firstUserMessage) updateGuestConvTitle(conversation.id, firstUserMessage.content);
      refreshConversationList(false);
      return;
    }

    conversationService.update(conversation._id, { messages }).then((updated) => {
      if (updated) activeConversationRef.current = updated;
      refreshConversationList(true);
    }).catch(() => {});
  }, [messages, activeConvId]);

  // Keep guest history available so a login transition does not erase the active chat.
  const prevUserIdRef = useRef(user?._id || null);
  useEffect(() => {
    const prevId = prevUserIdRef.current;
    const currId = user?._id || null;
    prevUserIdRef.current = currId;
  }, [user]);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { authLoadingRef.current = authLoading; }, [authLoading]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  useEffect(() => {
    // Play a friendly welcome once per assistant initialization or when authenticated user changes
    try {
      const sessionKey = 'va_welcome_played';
      const seenFor = typeof window !== 'undefined' ? window.sessionStorage.getItem(sessionKey) : null;
      const currentId = (userRef.current?._id) || 'anon';
      if (seenFor === currentId) return;

      const name = userRef.current?.name || null;
      const welcomeText = name
        ? `Assalamu Alaikum ${name}! Welcome back. What would you like to order today?`
        : `Assalamu Alaikum! Welcome to Hot & Spicy. What would you like to order today?`;

      // Add the welcome message into the chat only if not already present in this session
      setMessages((prev) => {
        // If the exact welcome already exists, don't add
        if (prev.some((m) => m.role === 'assistant' && m.content === welcomeText)) return prev;

        // If there's a single generic AI welcome message, replace it with the personalized/session welcome
        const genericEn = getWelcomeMessage('en');
        const genericUr = getWelcomeMessage('ur');
        if (prev.length === 1 && prev[0].role === 'assistant' && (prev[0].content === genericEn || prev[0].content === genericUr)) {
          return [{ role: 'assistant', content: welcomeText }];
        }

        // Otherwise append as the session welcome
        return [...prev, { role: 'assistant', content: welcomeText }];
      });

      // Attempt to speak using existing TTS; do not break if autoplay is blocked
      if (voiceEnabled) {
        try { stopRecognition({ keepState: true }); } catch (e) {}
        (async () => {
          try {
            const lang = selectedLanguage === 'auto' ? 'en' : selectedLanguage;
            await speechService.speak(welcomeText, lang);
          } catch (e) {
            // ignore autoplay errors
          }
        })();
      }

      welcomePlayedRef.current = true;
      lastWelcomeUserIdRef.current = currentId;
      try { if (typeof window !== 'undefined') window.sessionStorage.setItem(sessionKey, currentId); } catch (e) {}
    } catch (e) {}
  }, [user]);

  const adjustTextareaHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    try {
      ta.style.height = 'auto';
      const newHeight = Math.min(ta.scrollHeight, TEXTAREA_MAX_HEIGHT);
      ta.style.height = `${newHeight}px`;
      ta.style.overflowY = ta.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  useEffect(() => {
    const container = containerRef.current;
    const bottom = bottomRef.current;
    if (!container || !bottom) return;

    const isNearBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) < 150;

    if (lastActionWasSendRef.current) {
      try {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      } catch (e) {
        container.scrollTop = container.scrollHeight;
      }
      lastActionWasSendRef.current = false;
      lastWasTranscriptRef.current = false;
      return;
    }

    if (lastWasTranscriptRef.current) {
      if (isNearBottom) {
        try {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } catch (e) {
          container.scrollTop = container.scrollHeight;
        }
      }
      lastWasTranscriptRef.current = false;
      return;
    }

    if (isNearBottom) {
      try {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      } catch (e) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, isLoading, assistantState, inputValue, speakingMessageId, speechNotice, interimTranscript]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Ensure this effect marks the component as active so handlers created
    // in this effect see mountedRef.current === true even if a prior
    // StrictMode cleanup set it to false.
    mountedRef.current = true;
    try {
      // eslint-disable-next-line no-console
      console.log('[VOICE DEBUG] VA effect active', { componentInstanceId: componentInstanceIdRef.current, mounted: mountedRef.current });
    } catch (e) {}

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionApi) {
      console.warn('[VOICE DEBUG] SpeechRecognition constructor unavailable in this browser');
      return undefined;
    }

    logVoiceDebug('[VOICE DEBUG] SpeechRecognition object creation', {
      hasSpeechRecognition: !!window.SpeechRecognition,
      hasWebkitSpeechRecognition: !!window.webkitSpeechRecognition,
      isSecureContext: !!window.isSecureContext,
      language: getRecognitionLanguage(selectedLanguage === 'auto' ? 'en' : selectedLanguage),
      mediaDevices: !!navigator.mediaDevices,
    });

    // Diagnostic: record which component instance created this recognition
    try {
      // eslint-disable-next-line no-console
      console.log('[VOICE DEBUG] VA recognition created', { componentInstanceId: componentInstanceIdRef.current, session: recognitionSessionRef.current });
    } catch (e) {}

    const recognition = new SpeechRecognitionApi();
    recognition.continuous = false;
    recognition.onstart = () => {
      logVoiceDebug('[VOICE DEBUG] recognition.onstart', { session: recognitionSessionRef.current, state: assistantState });
      if (!mountedRef.current) return;
      recognitionActiveRef.current = true;
      setAssistantState('listening');
      setInputValue('');
      setInterimTranscript('');
      currentTranscriptRef.current = '';
      clearSilenceTimer();
    };

    recognition.onresult = (event) => {
      logVoiceDebug('[VOICE DEBUG] recognition.onend (manual mode)', {
        stopRequested: stopRequestedRef.current,
        processing: processingRef.current,
        isSpeaking: isSpeakingRef.current,
      });
      if (!mountedRef.current) return;
      recognitionActiveRef.current = false;
      clearSilenceTimer();
      // Reflect appropriate UI state but do NOT restart recognition automatically.
      if (processingRef.current) setAssistantState('processing');
      else if (isSpeakingRef.current) setAssistantState('speaking');
      else setAssistantState('idle');

      // TEMP DIAGNOSTIC: reveal which condition triggers the early return
      console.log('[VOICE DEBUG] PRE-FINAL GUARD', {
        componentInstanceId: componentInstanceIdRef.current,
        session: recognitionSessionRef.current,
        mounted: mountedRef.current,
        processing: processingRef.current,
        willReturn: !mountedRef.current || processingRef.current
      });

      if (!mountedRef.current || processingRef.current) return;

      const lastIndex = event.results.length - 1;
      const lastResult = event.results[lastIndex];

      // TEMP DIAGNOSTIC: about to evaluate final-result branch
      const lastIsFinal = lastResult?.isFinal;
      const lastTranscript = lastResult?.[0]?.transcript;
      // eslint-disable-next-line no-console
      console.log('[VOICE DEBUG] ABOUT TO ENTER FINAL IF', {
        lastIsFinal,
        lastTranscript,
        condition: Boolean(lastResult && lastResult.isFinal),
      });

      if (lastResult && lastResult.isFinal) {
        const transcript = (lastResult[0]?.transcript || '').trim();
        if (transcript) {
          currentTranscriptRef.current = transcript;
          setInterimTranscript('');
          setInputValue(transcript);
          lastWasTranscriptRef.current = true;
          // keep assistant in listening state until onend fires, then onend will set Ready
          setAssistantState('listening');
        }
        return;
      }

      let interimText = '';
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = (result[0]?.transcript || '').trim();
        if (!transcript) continue;
        if (!result.isFinal) {
          interimText += `${transcript} `;
        }
      }

      const interimValue = interimText.trim();
      if (interimValue) {
        currentTranscriptRef.current = interimValue;
        setInterimTranscript(interimValue);
        setInputValue(interimValue);
        lastWasTranscriptRef.current = true;
        setAssistantState('listening');
        return;
      }
    };

    recognition.onerror = (event) => {
      console.error('[VOICE DEBUG] recognition.onerror', {
        error: event?.error,
        message: event?.message,
        state: assistantState,
        isSecureContext: !!window.isSecureContext,
      });
      if (!mountedRef.current) return;

      recognitionActiveRef.current = false;
      clearSilenceTimer();
      setInterimTranscript('');
      currentTranscriptRef.current = '';
      setAssistantState('error');
      setSpeechNotice(event.error === 'not-allowed'
        ? (selectedLanguage === 'ur'
          ? 'مائیکروفون کی اجازت نہیں ملی۔'
          : 'Microphone permission was denied.')
        : (selectedLanguage === 'ur'
          ? 'معذرت، یہ براؤزر Urdu آواز کی شناخت درست طریقے سے نہیں کر سکتا۔'
          : 'Voice input isn\'t supported in this browser. Please use Chrome, Edge, or another supported browser, or type your message instead.'));
    };

    recognition.onend = () => {
      logVoiceDebug('[VOICE DEBUG] recognition.onend (manual mode)', {
        stopRequested: stopRequestedRef.current,
        processing: processingRef.current,
        isSpeaking: isSpeakingRef.current,
      });
      if (!mountedRef.current) return;
      recognitionActiveRef.current = false;
      clearSilenceTimer();
      if (processingRef.current) setAssistantState('processing');
      else if (isSpeakingRef.current) setAssistantState('speaking');
      else setAssistantState('idle');
      return;
    };

      // Diagnostic: handlers attached for this recognition instance
      try {
        // eslint-disable-next-line no-console
        console.log('[VOICE DEBUG] VA recognition handlers attached', { componentInstanceId: componentInstanceIdRef.current, session: recognitionSessionRef.current });
      } catch (e) {}

      recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      clearRestartTimer();
      try {
        // Detach handlers on the old recognition instance to prevent stale callbacks
        // from firing after cleanup (React StrictMode can mount/unmount twice).
        try {
          recognition.onresult = null;
          recognition.onstart = null;
          recognition.onend = null;
          recognition.onerror = null;
        } catch (e) {
          // ignore if properties are read-only in some browsers
        }

        recognition.stop();
      } catch (error) {
        // Ignore stop errors during cleanup.
      }

      // Only clear the ref if it still points to this instance
      try {
        if (recognitionRef.current === recognition) recognitionRef.current = null;
      } catch (e) {
        // ignore
      }
    };
  }, [selectedLanguage]);

  const handleStartListening = () => {
    logVoiceDebug('[VOICE DEBUG] mic clicked', {
      assistantState,
      isListening,
      continuousListening: continuousListeningRef.current,
      isSecureContext: !!window.isSecureContext,
      hasSpeechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      hasMediaDevices: !!navigator.mediaDevices,
      userAgent: navigator.userAgent,
    });

    if (assistantState === 'processing') {
      logVoiceDebug('[VOICE DEBUG] mic click blocked: processing in progress');
      return;
    }

    if (isListening) {
      logVoiceDebug('[VOICE DEBUG] mic click toggling stop');
      handleStopListening();
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' }).then((permissionStatus) => {
        logVoiceDebug('[VOICE DEBUG] microphone permission state', {
          state: permissionStatus.state,
          name: permissionStatus.name,
        });
      }).catch((error) => {
        console.warn('[VOICE DEBUG] microphone permission query failed', error);
      });
    }

    stopRequestedRef.current = false;
    startListeningSession();
  };

  const handleKeyDown = (event) => {
    // Only send on Ctrl+Enter or Cmd+Enter. Plain Enter inserts a newline.
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleVoice = () => {
    const nextValue = !voiceEnabled;
    setVoiceEnabled(nextValue);
    setStoredVoicePreference(nextValue);

    if (!nextValue) {
      speechService.stop();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setSpeechNotice('');
    }
  };

  const handleReplayMessage = async (message, messageKey) => {
    if (message.role !== 'assistant' || !message.content) {
      return;
    }

    if (speakingMessageId === messageKey) {
      speechService.stop();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setAssistantState('idle');
      return;
    }

    speechService.stop();
    setSpeechNotice('');
    setSpeakingMessageId(messageKey);
    setIsSpeaking(true);
    setAssistantState('speaking');
    // Ensure recognition is stopped before playing TTS to avoid feedback
    try { stopRecognition({ keepState: true }); } catch (e) {}
    try {
      const speechResult = await speechService.speak(message.content, message.language || (selectedLanguage === 'auto' ? 'en' : selectedLanguage));

      if (!speechResult.ok) {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        setAssistantState('idle');
        setSpeechNotice(selectedLanguage === 'ur'
          ? 'آواز چلانے میں خرابی ہوئی۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
          : 'Voice playback failed. You can still read the response.');
      }
    } catch (error) {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setAssistantState('idle');
      setSpeechNotice(selectedLanguage === 'ur'
        ? 'آواز چلانے میں خرابی ہوئی۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
        : 'Voice playback failed. You can still read the response.');
    }
  };

  const handleStopSpeech = () => {
    speechService.stop();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setSpeechNotice('');
    setAssistantState('idle');
  };

  const micButtonLabel = (() => {
    if (assistantState === 'listening') return selectedLanguage === 'ur' ? '🔴 سن رہا ہوں' : '🔴 Listening...';
    if (assistantState === 'processing') return selectedLanguage === 'ur' ? '⏳ سوچ رہا ہوں' : '⏳ Thinking...';
    if (assistantState === 'speaking') return selectedLanguage === 'ur' ? '🔊 بول رہا ہوں' : '🔊 Speaking...';
    return selectedLanguage === 'ur' ? '🎙️ گفتگو شروع کریں' : '🎙️ Start conversation';
  })();

  return (
    <section id="voice-assistant" className={styles.assistantSection}>
      <div className={styles.assistantLayout}>
        <ChatSidebar
          conversations={conversations}
          activeConvId={activeConvId}
          loading={authLoading}
          error={false}
          onNewChat={handleNewChat}
          onSelectConv={selectConversation}
          onDeleteConv={handleDeleteConversation}
        />
        <div className={styles.assistantCard}>
        <div className={styles.header}>
          <motion.div
            className={styles.orb}
            data-status={assistantState}
            aria-hidden
            animate={(() => {
              if (assistantState === 'processing') return { scale: [1, 1.03, 1], boxShadow: '0 0 40px rgba(255,209,102,0.5)' };
              if (assistantState === 'error') return { scale: 1, boxShadow: '0 0 32px rgba(255,107,107,0.45)' };
              if (assistantState === 'listening') return { scale: [1, 1.05, 1], boxShadow: '0 0 52px rgba(126,243,166,0.55)' };
              return { scale: 1, boxShadow: '0 0 32px rgba(255,209,102,0.55)' };
            })()}
            transition={{ duration: 0.9, repeat: assistantState === 'processing' ? Infinity : 0, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <div className={styles.headerContent}>
            <h2>AI Restaurant Assistant</h2>
            <p>{selectedLanguage === 'ur' ? 'اپنے مینو، قیمتوں اور آرڈرز کے بارے میں پوچھیں۔' : 'Ask me about our menu, prices and orders.'}</p>
          </div>
        </div>

        <div className={styles.languageSwitcher} role="tablist" aria-label="Language selector">
          <button
            type="button"
            className={`${styles.langButton} ${selectedLanguage === 'auto' ? styles.langButtonActive : ''}`}
            onClick={() => setSelectedLanguage('auto')}
            aria-label="Switch to Auto"
            aria-pressed={selectedLanguage === 'auto'}
          >
            Auto
          </button>
          <button
            type="button"
            className={`${styles.langButton} ${selectedLanguage === 'en' ? styles.langButtonActive : ''}`}
            onClick={() => setSelectedLanguage('en')}
            aria-label="Switch to English"
            aria-pressed={selectedLanguage === 'en'}
          >
            English
          </button>
          <button
            type="button"
            className={`${styles.langButton} ${selectedLanguage === 'ur' ? styles.langButtonActive : ''}`}
            onClick={() => setSelectedLanguage('ur')}
            aria-label="اردو میں سوئچ کریں"
            aria-pressed={selectedLanguage === 'ur'}
          >
            اردو
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.status}>
            {selectedLanguage === 'ur' ? 'ستتہ:' : 'Status:'}{' '}
            <span className={styles.statusValue} data-status={assistantState}>{statusLabel}</span>
          </div>
          <div className={styles.toolbarActions}>
            {isSpeaking && (
              <button type="button" className={styles.toolbarButton} onClick={handleStopSpeech} aria-label={selectedLanguage === 'ur' ? 'آواز بند کریں' : 'Stop voice playback'}>
                {selectedLanguage === 'ur' ? '⏹ روکو' : '⏹ Stop'}
              </button>
            )}
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={handleToggleVoice}
              aria-label={voiceEnabled ? (selectedLanguage === 'ur' ? 'آواز غیر فعال کریں' : 'Disable voice responses') : (selectedLanguage === 'ur' ? 'آواز فعال کریں' : 'Enable voice responses')}
            >
              {voiceEnabled ? (selectedLanguage === 'ur' ? '🔊 آواز آن' : '🔊 Voice ON') : (selectedLanguage === 'ur' ? '🔇 آواز آف' : '🔇 Voice OFF')}
            </button>
          </div>
        </div>

        {speechNotice && <div className={styles.notice}>{speechNotice}</div>}

        <div ref={containerRef} className={styles.conversationWindow} role="log" aria-live="polite">
          {messages.map((message, index) => {
            const isAssistantMessage = message.role === 'assistant';
            const messageKey = `${message.role}-${index}`;
            const isCurrentMessageSpeaking = speakingMessageId === messageKey;

            return (
              <div key={messageKey} className={message.role === 'user' ? styles.userMessage : styles.message}>
                <div className={styles.messageHeader}>
                  <strong>{message.role === 'user' ? (selectedLanguage === 'ur' ? 'آپ' : 'You') : 'AI'}:</strong>
                  {isAssistantMessage && (
                    <button
                      type="button"
                      className={styles.speakerButton}
                      onClick={() => handleReplayMessage({ ...message, role: 'assistant' }, messageKey)}
                      aria-label={selectedLanguage === 'ur' ? 'آئی جواب آواز میں سنائیں' : 'Read AI response aloud'}
                      title={selectedLanguage === 'ur' ? 'آئی جواب آواز میں سنائیں' : 'Read AI response aloud'}
                    >
                      {isCurrentMessageSpeaking && isSpeaking ? '⏹' : '🔊'}
                    </button>
                  )}
                </div>
                <div>{message.content}</div>
              </div>
            );
          })}

          {interimTranscript && (
            <div className={styles.interimMessage}>
              <div className={styles.messageHeader}>
                <strong>{selectedLanguage === 'ur' ? 'آپ' : 'You'}:</strong>
              </div>
              <div className={styles.interimText}>{interimTranscript}</div>
            </div>
          )}

          {isLoading && <div className={styles.message}>AI: {getThinkingLabel(selectedLanguage === 'auto' ? 'en' : selectedLanguage)}</div>}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputRow}>
          <label className={styles.visuallyHidden} htmlFor="ai-message-input">
            {selectedLanguage === 'ur' ? 'ریسٹورنٹ اسسٹنٹ کے لیے پیغام' : 'Message for restaurant assistant'}
          </label>
          <textarea
            id="ai-message-input"
            ref={textareaRef}
            className={styles.input}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedLanguage === 'ur' ? 'مینو کے بارے میں پوچھیں...' : 'Ask about the menu...'}
            aria-label={selectedLanguage === 'ur' ? 'ریسٹورنٹ اسسٹنٹ کے لیے پیغام' : 'Message for restaurant assistant'}
            disabled={false}
            rows={1}
            style={{ resize: 'vertical', maxHeight: `${TEXTAREA_MAX_HEIGHT}px` }}
          />
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={`${styles.microphoneButton} ${isListening ? styles.microphoneButtonListening : ''}`}
              onClick={handleStartListening}
              disabled={assistantState === 'processing' || assistantState === 'speaking'}
              aria-label={selectedLanguage === 'ur' ? 'آواز کے ذریعے پیغام داخل کریں' : 'Use voice input'}
            >
              {micButtonLabel}
            </button>
            {isListening && (
              <button
                type="button"
                className={styles.stopButton}
                onClick={handleStopListening}
                aria-label={selectedLanguage === 'ur' ? 'آواز بند کریں' : 'Stop listening'}
              >
                {selectedLanguage === 'ur' ? '⏹ رکیں' : '⏹ Stop'}
              </button>
            )}
            <button
              type="button"
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={isLoading}
              aria-label={selectedLanguage === 'ur' ? 'پیغام بھیجیں' : 'Send message to restaurant assistant'}
            >
              {isLoading ? getThinkingLabel(selectedLanguage === 'auto' ? 'en' : selectedLanguage) : (selectedLanguage === 'ur' ? 'بھیجیں' : 'Send')}
            </button>
          </div>
        </div>

        <div className={styles.waveform} aria-hidden data-status={assistantState}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              style={{ display: 'inline-block' }}
              animate={(() => {
                if (assistantState === 'processing') {
                  const seq = [8, 18, 10, 20, 8];
                  return { height: [seq[i % seq.length], seq[(i + 2) % seq.length], seq[(i + 4) % seq.length]] };
                }
                if (assistantState === 'error') {
                  return { height: [6, 10, 6] };
                }
                return { height: [6, 10, 6] };
              })()}
              transition={{ duration: 0.9, repeat: Infinity, repeatType: 'loop', delay: i * 0.06, ease: 'easeInOut' }}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

export default VoiceAssistant;
