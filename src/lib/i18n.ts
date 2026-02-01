export type Language = 'en' | 'de';

export interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    'app.title': 'Everlast Voice',
    'app.subtitle': 'Voice Intelligence',
    
    'nav.record': 'Record',
    'nav.library': 'Library',
    'nav.summary': 'Summary',
    'nav.editor': 'Presentation',
    
    'record.title': 'Create Recording',
    'record.subtitle': 'Transform your voice into professional presentations',
    'record.audioInput': 'Audio Input',
    'record.recordAudio': 'Record Audio',
    'record.uploadFile': 'Upload File',
    'record.startRecording': 'Start Recording',
    'record.stopRecording': 'Stop',
    'record.recording': 'Recording...',
    'record.selectAudioFile': 'Select Audio File',
    'record.hotkey': 'Hotkey',
    'record.audioFileReady': 'Audio File Ready',
    'record.supportedFormats': 'Supported: WAV, MP3, M4A, OGG',
    
    'status.ready': 'Ready',
    'status.recording': 'Recording',
    'status.processing': 'Processing',
    'status.transcribing': 'Transcribing',
    'status.generating': 'Generating',
    'status.completed': 'Completed',
    'status.error': 'Error',
    
    'transcript.title': 'Transcription',
    'transcript.placeholder': 'Record or upload an audio file to begin transcription',
    'transcript.startTranscription': 'Start Transcription',
    'transcript.transcribing': 'Transcribing...',
    'transcript.retranscribe': 'Re-transcribe',
    'transcript.copyToClipboard': 'Copy to Clipboard',
    'transcript.copied': 'Copied',
    'transcript.transcribingWithWhisper': 'Transcribing audio with Whisper...',
    'transcript.saveToLibrary': 'Save to Library',
    
    'library.title': 'Recording Library',
    'library.subtitle': 'Manage your saved recordings and presentations',
    'library.noRecordings': 'No recordings yet',
    'library.createFirst': 'Go to the Record tab to create your first recording',
    'library.deleteRecording': 'Delete Recording',
    'library.deleteConfirmation': 'Are you sure you want to delete this recording? This action cannot be undone.',
    'library.backToList': 'Back to List',
    'library.edit': 'Edit',
    'library.slides': 'slides',
    'library.noTranscript': 'No transcript available',
    'library.transcribeAudio': 'Transcribe Audio',
    'library.retranscribing': 'Re-transcribing...',
    'library.saveChanges': 'Save Changes',
    'library.slidesReady': 'This recording has {count} slides ready',
    'library.useForPresentation': 'Use for Presentation',
    
    'summary.title': 'Summary Export',
    'summary.subtitle': 'Export your presentation as PDF or Markdown',
    'summary.noContent': 'No content available',
    'summary.goToRecord': 'Go to the Record tab and generate slides first',
    'summary.exportOptions': 'Export Options',
    'summary.exportingMarkdown': 'Export as Markdown (.md)',
    'summary.exportingPdf': 'Export as PDF (Print)',
    'summary.exporting': 'Exporting...',
    'summary.exportInfo': 'Markdown files can be opened in any text editor. PDF export uses your browser\'s print dialog.',
    'summary.preview': 'Preview',
    'summary.statistics': 'Summary Statistics',
    'summary.totalSlides': 'Total Slides',
    'summary.wordCount': 'Word Count',
    
    'editor.title': 'Presentation Editor',
    'editor.slideCount': '{count} slide in your presentation',
    'editor.slideCountPlural': '{count} slides in your presentation',
    'editor.noSlides': 'No slides generated yet',
    'editor.generateFirst': 'Go to the Record tab and generate slides first',
    
    'settings.title': 'Settings',
    'settings.recordingHotkey': 'Recording Hotkey',
    'settings.hotkeyExample': 'Example: CommandOrControl+Shift+R (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)',
    'settings.ollamaUrl': 'Ollama URL',
    'settings.whisperUrl': 'Whisper URL',
    'settings.whisperModel': 'Whisper Model',
    'settings.modelMedium': 'Medium (Faster, 1.5GB)',
    'settings.modelLarge': 'Large-v3 (More Accurate, 10GB)',
    'settings.requiresRestart': 'Requires restarting service',
    'settings.language': 'Language / Sprache',
    'settings.interfaceLanguage': 'Interface language',
    'settings.llmQuantization': 'LLM Quantization',
    'settings.llmQuantizationDesc': 'Faster inference, slightly lower accuracy',
    'settings.recursionLayer': 'Recursion Layer',
    'settings.recursionLayerDesc': 'Enable verification (2x-3x slower)',
    'settings.autoExportPptx': 'Auto-Export PPTX',
    'settings.autoExportPptxDesc': 'Automatically save after generation',
    'settings.saveSettings': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.saved': 'Saved',
    'settings.cancel': 'Cancel',
    'settings.info1': 'Settings are saved locally and persist across sessions',
    'settings.info2': 'Some changes may require restarting services or the application',
    
    'common.error': 'Error',
    'common.clearError': 'Clear Error',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.save': 'Save',
  },
  de: {
    'app.title': 'Everlast Voice',
    'app.subtitle': 'Voice Intelligence',
    
    'nav.record': 'Aufnehmen',
    'nav.library': 'Bibliothek',
    'nav.summary': 'Zusammenfassung',
    'nav.editor': 'Präsentation',
    
    'record.title': 'Aufnahme erstellen',
    'record.subtitle': 'Verwandeln Sie Ihre Stimme in professionelle Präsentationen',
    'record.audioInput': 'Audio-Eingang',
    'record.recordAudio': 'Audio aufnehmen',
    'record.uploadFile': 'Datei hochladen',
    'record.startRecording': 'Aufnahme starten',
    'record.stopRecording': 'Stopp',
    'record.recording': 'Aufnahme läuft...',
    'record.selectAudioFile': 'Audiodatei auswählen',
    'record.hotkey': 'Tastenkürzel',
    'record.audioFileReady': 'Audiodatei bereit',
    'record.supportedFormats': 'Unterstützt: WAV, MP3, M4A, OGG',
    
    'status.ready': 'Bereit',
    'status.recording': 'Aufnahme',
    'status.processing': 'Verarbeitung',
    'status.transcribing': 'Transkription',
    'status.generating': 'Generierung',
    'status.completed': 'Abgeschlossen',
    'status.error': 'Fehler',
    
    'transcript.title': 'Transkription',
    'transcript.placeholder': 'Nehmen Sie Audio auf oder laden Sie eine Audiodatei hoch, um mit der Transkription zu beginnen',
    'transcript.startTranscription': 'Transkription starten',
    'transcript.transcribing': 'Transkribiere...',
    'transcript.retranscribe': 'Neu transkribieren',
    'transcript.copyToClipboard': 'In Zwischenablage kopieren',
    'transcript.copied': 'Kopiert',
    'transcript.transcribingWithWhisper': 'Audio wird mit Whisper transkribiert...',
    'transcript.saveToLibrary': 'In Bibliothek speichern',
    
    'library.title': 'Aufnahmebibliothek',
    'library.subtitle': 'Verwalten Sie Ihre gespeicherten Aufnahmen und Präsentationen',
    'library.noRecordings': 'Noch keine Aufnahmen',
    'library.createFirst': 'Gehen Sie zum Aufnahme-Tab, um Ihre erste Aufnahme zu erstellen',
    'library.deleteRecording': 'Aufnahme löschen',
    'library.deleteConfirmation': 'Möchten Sie diese Aufnahme wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    'library.backToList': 'Zurück zur Liste',
    'library.edit': 'Bearbeiten',
    'library.slides': 'Folien',
    'library.noTranscript': 'Keine Transkription verfügbar',
    'library.transcribeAudio': 'Audio transkribieren',
    'library.retranscribing': 'Neu transkribieren...',
    'library.saveChanges': 'Änderungen speichern',
    'library.slidesReady': 'Diese Aufnahme hat {count} fertige Folien',
    'library.useForPresentation': 'Für Präsentation verwenden',
    
    'summary.title': 'Zusammenfassung exportieren',
    'summary.subtitle': 'Exportieren Sie Ihre Präsentation als PDF oder Markdown',
    'summary.noContent': 'Kein Inhalt verfügbar',
    'summary.goToRecord': 'Gehen Sie zum Aufnahme-Tab und generieren Sie zuerst Folien',
    'summary.exportOptions': 'Export-Optionen',
    'summary.exportingMarkdown': 'Als Markdown exportieren (.md)',
    'summary.exportingPdf': 'Als PDF exportieren (Drucken)',
    'summary.exporting': 'Exportiere...',
    'summary.exportInfo': 'Markdown-Dateien können in jedem Texteditor geöffnet werden. Der PDF-Export verwendet den Druckdialog Ihres Browsers.',
    'summary.preview': 'Vorschau',
    'summary.statistics': 'Zusammenfassungsstatistiken',
    'summary.totalSlides': 'Gesamtfolien',
    'summary.wordCount': 'Wortanzahl',
    
    'editor.title': 'Präsentationseditor',
    'editor.slideCount': '{count} Folie in Ihrer Präsentation',
    'editor.slideCountPlural': '{count} Folien in Ihrer Präsentation',
    'editor.noSlides': 'Noch keine Folien generiert',
    'editor.generateFirst': 'Gehen Sie zum Aufnahme-Tab und generieren Sie zuerst Folien',
    
    'settings.title': 'Einstellungen',
    'settings.recordingHotkey': 'Aufnahme-Tastenkürzel',
    'settings.hotkeyExample': 'Beispiel: CommandOrControl+Shift+R (Strg+Shift+R unter Windows/Linux, Cmd+Shift+R auf Mac)',
    'settings.ollamaUrl': 'Ollama-URL',
    'settings.whisperUrl': 'Whisper-URL',
    'settings.whisperModel': 'Whisper-Modell',
    'settings.modelMedium': 'Medium (Schneller, 1,5 GB)',
    'settings.modelLarge': 'Large-v3 (Genauer, 10 GB)',
    'settings.requiresRestart': 'Erfordert Neustart des Dienstes',
    'settings.language': 'Sprache / Language',
    'settings.interfaceLanguage': 'Oberflächensprache',
    'settings.llmQuantization': 'LLM-Quantisierung',
    'settings.llmQuantizationDesc': 'Schnellere Inferenz, etwas geringere Genauigkeit',
    'settings.recursionLayer': 'Rekursionsebene',
    'settings.recursionLayerDesc': 'Verifizierung aktivieren (2x-3x langsamer)',
    'settings.autoExportPptx': 'Auto-Export PPTX',
    'settings.autoExportPptxDesc': 'Automatisch nach Generierung speichern',
    'settings.saveSettings': 'Einstellungen speichern',
    'settings.saving': 'Speichern...',
    'settings.saved': 'Gespeichert',
    'settings.cancel': 'Abbrechen',
    'settings.info1': 'Einstellungen werden lokal gespeichert und bleiben über Sitzungen hinweg erhalten',
    'settings.info2': 'Einige Änderungen erfordern möglicherweise einen Neustart der Dienste oder der Anwendung',
    
    'common.error': 'Fehler',
    'common.clearError': 'Fehler löschen',
    'common.confirm': 'Bestätigen',
    'common.delete': 'Löschen',
    'common.save': 'Speichern',
  },
};

let currentLanguage: Language = 'en';

export function setLanguage(language: Language): void {
  currentLanguage = language;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, replacements?: Record<string, string | number>): string {
  let translation = translations[currentLanguage][key] || translations.en[key] || key;
  
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(`{${placeholder}}`, String(value));
    });
  }
  
  return translation;
}

export function useTranslation() {
  return {
    t,
    language: currentLanguage,
    setLanguage,
  };
}
