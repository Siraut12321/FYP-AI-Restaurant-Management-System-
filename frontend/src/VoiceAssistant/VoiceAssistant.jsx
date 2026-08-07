import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { sendMessageToAI } from '../services/aiService';
import { getStoredVoicePreference, setStoredVoicePreference, speechService } from '../services/speechService';
import styles from '../styles/VoiceAssistant.module.css';

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

function VoiceAssistant() {
  const [status, setStatus] = useState('ready');
  const [inputValue, setInputValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [messages, setMessages] = useState(() => [{ role: 'assistant', content: getWelcomeMessage('en') }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => getStoredVoicePreference());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [speechNotice, setSpeechNotice] = useState('');
  const recognitionRef = useRef(null);

  const statusLabel = {
    ready: selectedLanguage === 'ur' ? 'تیار' : 'Ready',
    listening: selectedLanguage === 'ur' ? 'سن رہا ہوں' : 'Listening',
    thinking: selectedLanguage === 'ur' ? 'سوچ رہا ہوں' : 'Thinking',
    error: selectedLanguage === 'ur' ? 'غلطی' : 'Connection Error',
  }[status] || (selectedLanguage === 'ur' ? 'تیار' : 'Ready');

  useEffect(() => {
    setMessages((prevMessages) => {
      if (prevMessages.length === 0) {
        return [{ role: 'assistant', content: getWelcomeMessage(selectedLanguage) }];
      }

      const isOnlyWelcomeMessage =
        prevMessages.length === 1 &&
        prevMessages[0].role === 'assistant' &&
        [getWelcomeMessage('en'), getWelcomeMessage('ur')].includes(prevMessages[0].content);

      if (isOnlyWelcomeMessage) {
        return [{ role: 'assistant', content: getWelcomeMessage(selectedLanguage) }];
      }

      return prevMessages;
    });
  }, [selectedLanguage]);

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      return undefined;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage === 'ur' ? 'ur-PK' : 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      if (transcript) {
        setInputValue(transcript);
      }

      setStatus('ready');
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      const errorMessage = event.error === 'not-allowed'
        ? (selectedLanguage === 'ur'
          ? 'مائیکروفون کی اجازت نہیں ملی۔'
          : 'Microphone permission was denied.')
        : (selectedLanguage === 'ur'
          ? 'معذرت، یہ براؤزر Urdu آواز کی شناخت درست طریقے سے نہیں کر سکتا۔'
          : 'Sorry, this browser cannot support voice recognition reliably for your selected language.');

      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
      setStatus('error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus('ready');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [selectedLanguage]);

  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    const userMessage = { role: 'user', content: trimmedMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setStatus('thinking');
    setIsLoading(true);
    setSpeechNotice('');

    try {
      const result = await sendMessageToAI(trimmedMessage, selectedLanguage);
      const assistantReply = result?.reply || result?.message || result?.answer || 'Sorry, I could not process your request right now.';
      const assistantMessage = { role: 'assistant', content: assistantReply, language: selectedLanguage };

      setMessages((prev) => [...prev, assistantMessage]);
      setStatus('ready');

      if (voiceEnabled) {
        speechService.stop();
        setIsSpeaking(true);
        setSpeakingMessageId(`assistant-${assistantReply}`);
        setStatus('speaking');

        try {
          const speechResult = await speechService.speak(assistantReply, selectedLanguage);

          if (!speechResult.ok) {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
            setStatus('ready');
            setSpeechNotice(selectedLanguage === 'ur'
              ? 'آواز چلانے کی مدد دستیاب نہیں ہے۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
              : 'Voice playback is not available right now. You can still read the response.');
          }
        } catch (error) {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          setStatus('ready');
          setSpeechNotice(selectedLanguage === 'ur'
            ? 'آواز چلانے میں خرابی ہوئی۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
            : 'Voice playback failed. You can still read the response.');
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: getFriendlyErrorMessage(selectedLanguage),
        },
      ]);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartListening = () => {
    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (typeof window === 'undefined' || !SpeechRecognitionApi) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: selectedLanguage === 'ur'
            ? 'معذرت، یہ براؤزر وائس ان پٹ کے لیے معاون نہیں ہے۔'
            : 'Sorry, this browser does not support voice input.',
        },
      ]);
      setStatus('error');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('ready');
      return;
    }

    recognitionRef.current?.start();
    setStatus('listening');
    setIsListening(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
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
      setStatus('ready');
      return;
    }

    speechService.stop();
    setSpeechNotice('');
    setSpeakingMessageId(messageKey);
    setIsSpeaking(true);
    setStatus('speaking');

    try {
      const speechResult = await speechService.speak(message.content, message.language || selectedLanguage);

      if (!speechResult.ok) {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        setStatus('ready');
        setSpeechNotice(selectedLanguage === 'ur'
          ? 'آواز چلانے میں خرابی ہوئی۔ آپ ابھی بھی جواب پڑھ سکتے ہیں۔'
          : 'Voice playback failed. You can still read the response.');
      }
    } catch (error) {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setStatus('ready');
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
  };

  return (
    <section className={styles.assistantSection}>
      <div className={styles.assistantCard}>
        <div className={styles.header}>
          <motion.div
            className={styles.orb}
            data-status={isLoading ? 'thinking' : status}
            aria-hidden
            animate={(() => {
              if (isLoading) return { scale: [1, 1.03, 1], boxShadow: '0 0 40px rgba(255,209,102,0.5)' };
              if (status === 'error') return { scale: 1, boxShadow: '0 0 32px rgba(255,107,107,0.45)' };
              return { scale: 1, boxShadow: '0 0 32px rgba(255,209,102,0.55)' };
            })()}
            transition={{ duration: 0.9, repeat: isLoading ? Infinity : 0, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <div className={styles.headerContent}>
            <h2>AI Restaurant Assistant</h2>
            <p>{selectedLanguage === 'ur' ? 'اپنے مینو، قیمتوں اور آرڈرز کے بارے میں پوچھیں۔' : 'Ask me about our menu, prices and orders.'}</p>
          </div>
        </div>

        <div className={styles.languageSwitcher} role="tablist" aria-label="Language selector">
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
            <span className={styles.statusValue} data-status={isLoading ? 'thinking' : status}>{statusLabel}</span>
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

        <div className={styles.conversationWindow} role="log" aria-live="polite">
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
          {isLoading && <div className={styles.message}>AI: {getThinkingLabel(selectedLanguage)}</div>}
        </div>

        <div className={styles.inputRow}>
          <label className={styles.visuallyHidden} htmlFor="ai-message-input">
            {selectedLanguage === 'ur' ? 'ریسٹورنٹ اسسٹنٹ کے لیے پیغام' : 'Message for restaurant assistant'}
          </label>
          <input
            id="ai-message-input"
            className={styles.input}
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedLanguage === 'ur' ? 'مینو کے بارے میں پوچھیں...' : 'Ask about the menu...'}
            aria-label={selectedLanguage === 'ur' ? 'ریسٹورنٹ اسسٹنٹ کے لیے پیغام' : 'Message for restaurant assistant'}
            disabled={isLoading}
          />
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.microphoneButton}
              onClick={handleStartListening}
              disabled={isLoading}
              aria-label={selectedLanguage === 'ur' ? 'آواز کے ذریعے پیغام داخل کریں' : 'Use voice input'}
            >
              {isListening ? (selectedLanguage === 'ur' ? 'رکیں' : 'Stop') : '🎤'}
            </button>
            <button
              type="button"
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={isLoading}
              aria-label={selectedLanguage === 'ur' ? 'پیغام بھیجیں' : 'Send message to restaurant assistant'}
            >
              {isLoading ? getThinkingLabel(selectedLanguage) : (selectedLanguage === 'ur' ? 'بھیجیں' : 'Send')}
            </button>
          </div>
        </div>

        <div className={styles.waveform} aria-hidden data-status={isLoading ? 'thinking' : status}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              style={{ display: 'inline-block' }}
              animate={(() => {
                if (isLoading) {
                  const seq = [8, 18, 10, 20, 8];
                  return { height: [seq[i % seq.length], seq[(i + 2) % seq.length], seq[(i + 4) % seq.length]] };
                }
                if (status === 'error') {
                  return { height: [6, 10, 6] };
                }
                return { height: [6, 10, 6] };
              })()}
              transition={{ duration: 0.9, repeat: Infinity, repeatType: 'loop', delay: i * 0.06, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default VoiceAssistant;
