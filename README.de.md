# Everlast Voice Intelligence

**KI-gestützte Sprache-zu-PowerPoint Desktop-Anwendung**

Eine Electron-basierte Desktop-Anwendung, die Sprachaufnahmen in professionelle PowerPoint-Präsentationen umwandelt. Nutzt lokale LLMs für Transkription und Inhaltsaufbereitung.

---

## 🚀 Setup

### Abhängigkeiten

#### Linux
```bash
# Node.js 18+ und Python 3.12+
sudo apt install nodejs npm python3 python3-pip python3-venv

# Projekt-Abhängigkeiten installieren
npm install

# Whisper-Service einrichten (optional, für lokale Transkription)
cd services/whisper-service
./setup.sh
cd ../..
```

#### Windows
```bash
# Node.js 18+ installieren (von nodejs.org)
# Dann:
npm install

# Portable .exe verwenden (keine Python-Installation nötig)
# Externe APIs für Whisper + LLM konfigurieren (siehe Einstellungen)
```

### Bibliotheken & Technologien

**Frontend**:
- Next.js 14.2 (React 18, App Router, statischer Export)
- Tailwind CSS (UI-Styling)
- Zustand (State Management)
- TypeScript (strenger Modus)

**Backend**:
- Electron 30 (Desktop-Framework)
- electron-store (persistente Einstellungen)
- node-record-lpcm16 (Audio-Aufnahme)

**AI/ML**:
- faster-whisper (lokale Transkription via Python)
- Ollama / Externe LLM API (llama3.1, Inhaltsverarbeitung)
- pptxgenjs (PowerPoint-Generierung)

**Python-Services** (optional):
- FastAPI (Whisper HTTP-Server)
- faster-whisper (GPU-beschleunigt mit CUDA)

---

## 🏗️ Architektur

### Frontend-Komponenten (React/Next.js)

**Hauptansichten**:
- `RecordingControls` - Audio-Aufnahme/-Upload, Hotkey-Integration
- `TranscriptView` - Transkriptionsergebnisse mit Bearbeitung
- `AudioLibraryList` - Persistente Bibliothek für Audio + Transkripte
- `PresentationPreview` - Live-Vorschau mit Template-Wechsel
- `TemplateSelector` - 3 HTML-basierte Themes (Dark Yellow, Modern Blue, Organic Warm)
- `SettingsPanel` - Globale Einstellungen (LLM, Whisper, APIs, Hotkeys, Sprache)

**UI-Infrastruktur**:
- `ServiceStatus` - Echtzeit-Statusüberwachung (Whisper/Ollama)
- `AIPipelineProgress` - 4-Stufen-Pipeline-Visualisierung
- `EditorToolbar` - Export-Funktionen (PPTX, Markdown)

**Workflow-Module**:
- `SaveToLibraryModal` - Speichern von Aufnahmen in Bibliothek
- `AudioDetailView` - Detailansicht mit Metadaten (Dauer, Name, Datum)
- `MarkdownViewModal` - Präsentationszusammenfassungen als Markdown

### Backend-Architektur (Electron)

**Services** (`electron/services/`):
- `whisper-process.ts` - Whisper-Service-Management, externe API-Unterstützung
- `audio-recorder.ts` - Systemaufnahme über node-record-lpcm16
- `settings-storage.ts` - Persistente Konfiguration via electron-store
- `hotkey-manager.ts` - Globale Tastenkombinationen (7 Voreinstellungen)

**IPC-Handler** (`electron/ipc-handlers.ts`):
- Audio-Transkription (lokal/extern)
- PPTX-Export mit Template-System
- Datei-I/O (Bibliothek als JSON)
- Service-Gesundheitsprüfungen

**Main Process** (`electron/main.ts`):
- Fenster-Management
- Nicht-blockierender Whisper-Start
- Globale Hotkey-Registrierung beim Start
- Cleanup alter Aufnahmen

### Datenfluss

```
[Aufnahme/Upload] 
    ↓ IPC
[Whisper Service] → Transkript
    ↓ IPC
[Bibliothek speichern] → JSON-Persistenz
    ↓ Benutzer wählt aus
[AI-Pipeline (4 Stufen)]
    ├─ Stufe 1: Paraphrase (Bereinigung)
    ├─ Stufe 2: Segmentierung (Themen)
    ├─ Stufe 3: Template-Auswahl (Slide-Typen)
    └─ Stufe 4: Content-Extraktion (Strukturierte Daten)
    ↓
[PPTX-Renderer] → Template anwenden
    ↓
[Export] → .pptx/.md Datei
```

**State Management**:
- Zustand Store (`recording-store.ts`) - Reaktiver globaler State
- Electron Store - Persistente Einstellungen
- JSON-Dateien - Bibliotheksdaten

**Cross-Platform**:
- Python-Startskript (`start.py`) - Windows/Linux-kompatibel
- Plattformerkennung für venv-Pfade (Scripts/ vs bin/)
- Externe API-Fallback für Windows (keine Python-Abhängigkeit)

---

## 💡 Konzepte & Entscheidungen

### AI-Pipeline-Architektur

**Problem**: Rohe Transkripte direkt in Slides zu konvertieren führt zu inkohärenten, unstrukturierten Präsentationen.

**Lösung**: 4-stufige Pipeline mit spezialisierten LLM-Prompts:

1. **Paraphrase** - Bereinigung von Füllwörtern, Grammatikkorrektur, Strukturierung
2. **Segmentierung** - Thematische Aufteilung, Identifikation von Hauptpunkten
3. **Template-Selektion** - KI wählt passende Slide-Typen (Titel, Aufzählung, Tabelle, Flussdiagramm, 2-Spalten)
4. **Content-Extraktion** - Strukturierte Datenextraktion für jeden Slide-Typ

**Vorteil**: Jede Stufe hat einen klaren Fokus → bessere Ergebnisse als Ein-Schritt-Ansätze.

### Rekursions-Layer für Geschwindigkeit

**Idee**: Optional aktivierbarer Verifikations-Layer (Stufe 5), der Ausgaben validiert und bei Bedarf neu generiert.

**Trade-off**: 
- ✅ **Aus** (Standard): Schnelle Generierung (4 LLM-Aufrufe)
- ⚙️ **An**: 2-3× langsamer, aber höhere Qualität durch Selbstkorrektur

**Implementierung**: `verify-stage.ts` führt Schema-Validierung durch und triggert Neuversuche bei Fehlern.

**Warum optional**: Die meisten Nutzer priorisieren Geschwindigkeit; Power-User können Qualität aktivieren.

### Lokale LLMs für Datenschutz

**Transkription**: 
- faster-whisper (OpenAI's Whisper, lokal ausgeführt)
- Medium (1,5 GB) vs Large-v3 (10 GB) Modelle
- GPU-beschleunigt (CUDA 12) für Echtzeitverarbeitung

**Inhaltsaufbereitung**:
- Ollama (llama3.1:latest)
- Alle Prompts laufen lokal → keine Cloud-Abhängigkeit
- Quantisierung optional (Geschwindigkeit vs Genauigkeit)

**Externe API-Unterstützung**:
- Windows-Kompatibilität (kein Python nötig)
- Produktionsumgebungen ohne GPU
- OpenAI/Anthropic-kompatible Endpunkte

### Template-System für PPTX-Generierung

**Problem**: Programmatische PowerPoint-Erstellung erfordert manuelle Positionierung, Styling und Layout-Management.

**Lösung**: HTML-basierte Templates mit Slot-System:

```typescript
// Template definiert Farben, Schriften, Layout
const modernBlue = {
  primary: '#2563EB',    // Blau
  background: '#FFFFFF',
  text: '#1E293B',
  fonts: { heading: 'Montserrat', body: 'Open Sans' }
};

// Renderer füllt Slots mit KI-extrahierten Daten
renderBulletSlide(content, modernBlue);
```

**3 Design-Themes**:
- **Dark Yellow** - Minimalistisch, hoher Kontrast (schwarz/gelb)
- **Modern Blue** - Professionell, kreisförmige Dekorelemente, nummerierte Listen
- **Organic Warm** - Beige/Orange, Eckenrahmen, Playfair Display-Schrift

**Vorteile**:
- KI muss nur Inhalte extrahieren, nicht designen
- Templates austauschbar ohne Logik-Änderungen
- HTML-Prototypen → 1:1 PPTX-Übersetzung

### KI als Entwicklungsassistent

**Template-Generierung**:
- HTML-Prototypen mit GPT-4 erstellt
- Iteratives Refinement für Farben, Abstände, Dekorationen
- TypeScript-Renderer aus HTML-Struktur generiert

**Debugging**:
- LLM-Prompt-Optimierung via Trial-and-Error mit KI-Feedback
- TypeScript-Fehleranalyse und Lösungsvorschläge
- Refactoring-Unterstützung für Code-Qualität

**Entwicklungs-Workflow**:
1. Konzept definieren (z.B. "moderne blaue Vorlage mit Kreisen")
2. KI generiert HTML + CSS-Prototyp
3. Manuelles Testen und Feedback
4. KI passt Code an → Iteration bis perfekt
5. Conversion zu pptxgenjs-Renderer

**Ergebnis**: 3× schnellere Entwicklung bei konsistenter Code-Qualität.

---

## 🎯 Verwendung

### Schnellstart

```bash
# Entwicklungsmodus (Hot Reload)
npm run dev

# Produktions-Build
npm run build
npm start

# Windows Portable .exe erstellen
npm run package -- --win
```

### Workflow

1. **Aufnahme starten** - Hotkey (Standard: Ctrl+Shift+R) oder Upload
2. **Transkription** - Automatisch nach Aufnahmeende
3. **In Bibliothek speichern** - Namen vergeben, persistent speichern
4. **Präsentation generieren** - Aufnahme wählen → Template wählen → Generieren
5. **Export** - Als .pptx oder .md exportieren

### Einstellungen

- **Hotkey**: 7 Voreinstellungen (F9-F11, Ctrl+Shift+R, etc.)
- **Whisper-Modell**: Medium (schnell) oder Large-v3 (genau)
- **LLM-Quantisierung**: Aktivieren für 2× Geschwindigkeit
- **Rekursions-Layer**: Aktivieren für höhere Qualität
- **Externe APIs**: Whisper + LLM URLs/Keys konfigurieren
- **Sprache**: Deutsch/Englisch (Live-Wechsel)

---

## 📦 Deployment

### Linux (Native)
```bash
# Alle Services lokal
npm run build && npm start
cd services/whisper-service && python3 start.py
# Ollama separat starten: ollama serve
```

### Windows (Portable)
```bash
# .exe aus release/ kopieren
# Keine Installation nötig
# Externe APIs in Einstellungen konfigurieren:
#   - Whisper: https://api.openai.com/v1/audio/transcriptions
#   - LLM: https://api.openai.com/v1/chat/completions
```

---

## 🔧 Technische Details

**Zeilen Code**: ~5.078 LOC (TypeScript/Python)  
**Komponenten**: 21 React-Komponenten  
**Services**: 4 Electron-Services + 1 Python-Service  
**Abhängigkeiten**: 23 npm-Pakete  
**Build-Größe**: 128 MB (Windows .exe)  

**Code-Qualität**:
- TypeScript strict mode ✅
- ESLint passing ✅
- Zero TODO/FIXME ✅
- Cross-platform kompatibel ✅

---

## 📄 Lizenz

MIT License - siehe LICENSE-Datei für Details.

---

## 🙏 Danksagungen

Entwickelt mit Unterstützung von KI-Tools (GPT-4, Claude) für:
- Template-Design und HTML/CSS-Generierung
- TypeScript-Refactoring und Fehleranalyse
- LLM-Prompt-Engineering und Optimierung
- Architekturentscheidungen und Best Practices

**Kernideen**: Mehrstufige AI-Pipeline, lokale LLM-Integration, HTML-Template-System - alle von Menschen konzipiert und implementiert, KI-unterstützt verfeinert.
