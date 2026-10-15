/**
 * EduBot P13 - Main Application Orchestrator
 * Connects StorageManager, NLPEngine, QuizEngine, and FileLoader
 * Handles UI interactions, chat streaming, quiz runner, and folder uploads.
 */

class EduBotApp {
  constructor() {
    this.currentTab = 'tab-chat';
    this.activeModules = [];
    this.allModules = [];
    this.currentQuiz = null;
    this.currentQuizIndex = 0;
    this.quizAnswers = {};
    this.quizTimerInterval = null;
    this.quizTimeRemaining = 0;
    this.chatHistory = [];
    this.settings = {};
  }

  // Initialize Application
  async init() {
    console.log('Initializing EduBot P13 Application...');
    
    // Load settings & theme
    this.settings = window.storageManager.getSettings();
    this.applyTheme(this.settings.theme || 'dark');
    this.updateEngineStatus();

    // Initialize Database
    await window.storageManager.init();
    await this.refreshModules();

    // Bind UI Event Listeners
    this.bindEvents();

    // Render Initial UI Views
    this.renderSidebarSubjects();
    this.renderQuizConfigModules();
    this.renderModulesGrid();

    console.log('EduBot P13 Ready!');
  }

  // Refresh modules from storage
  async refreshModules() {
    this.allModules = await window.storageManager.getAllModules();
    this.activeModules = this.allModules.filter(m => m.isActive !== false);

    // Update UI counters
    const badge = document.getElementById('activeModuleCountBadge');
    if (badge) {
      if (this.activeModules.length === 0) {
        badge.textContent = '0 Modul Aktif';
        badge.style.background = 'rgba(244, 63, 94, 0.12)';
        badge.style.color = '#fb7185';
        badge.style.borderColor = 'rgba(244, 63, 94, 0.3)';
      } else {
        badge.textContent = `${this.activeModules.length} Modul Aktif`;
        badge.style.background = 'rgba(16, 185, 129, 0.12)';
        badge.style.color = '#34d399';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      }
    }
    const summary = document.getElementById('moduleFilterSummary');
    if (summary) {
      summary.textContent = this.allModules.length === 0 ? 'Tidak ada modul tersedia' : `${this.allModules.length} Modul Terpasang (${this.activeModules.length} Aktif)`;
    }
  }

  // Bind All UI Events
  bindEvents() {
    // 1. Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = btn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Brand logo click returns to chat
    document.getElementById('brandBtn')?.addEventListener('click', () => {
      this.switchTab('tab-chat');
    });

    // Theme toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
      this.settings.theme = next;
      window.storageManager.saveSettings(this.settings);
    });

    // Settings Modal
    const settingsModal = document.getElementById('settingsModal');
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
      this.populateSettingsForm();
      settingsModal.classList.add('active');
    });
    document.getElementById('closeSettingsModalBtn')?.addEventListener('click', () => {
      settingsModal.classList.remove('active');
    });
    document.getElementById('settingAiEngine')?.addEventListener('change', (e) => {
      this.handleAiEngineChange(e.target.value);
    });
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
      this.saveSettingsForm();
      settingsModal.classList.remove('active');
      this.showToast('Pengaturan berhasil disimpan!', 'success');
    });
    document.getElementById('settingClearAllDataBtn')?.addEventListener('click', async () => {
      if (confirm('Apakah Anda yakin ingin menghapus seluruh data kustom dan riwayat chat?')) {
        await window.storageManager.resetToDefaultModules();
        localStorage.removeItem('edubot_chat_history');
        window.location.reload();
      }
    });

    // 2. Chat Interactions
    const chatInput = document.getElementById('chatInputTextarea');
    const sendBtn = document.getElementById('sendMessageBtn');

    sendBtn?.addEventListener('click', () => this.handleSendMessage());

    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Auto-expand textarea
    chatInput?.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + 'px';
    });

    // Clear chat
    document.getElementById('clearChatBtn')?.addEventListener('click', () => {
      if (confirm('Bersihkan riwayat percakapan chat?')) {
        this.clearChatStream();
      }
    });

    // Manage modules shortcut from chat sidebar
    document.getElementById('manageModulesShortcut')?.addEventListener('click', () => {
      this.switchTab('tab-modules');
    });

    // Voice recognition (Speech to text)
    document.getElementById('voiceInputBtn')?.addEventListener('click', () => {
      this.handleVoiceInput();
    });

    // Quick quiz from chat
    document.getElementById('sidebarQuickQuizBtn')?.addEventListener('click', () => {
      this.switchTab('tab-quiz');
    });
    document.getElementById('shortcutQuizGenBtn')?.addEventListener('click', () => {
      this.switchTab('tab-quiz');
    });

    // Prompt cards in chat sidebar & welcome cards
    document.querySelectorAll('.prompt-card, .welcome-card').forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt');
        if (prompt && chatInput) {
          chatInput.value = prompt;
          chatInput.focus();
          this.handleSendMessage();
        }
      });
    });

    // Welcome CTA cards for uploading
    document.getElementById('welcomeUploadFolderCard')?.addEventListener('click', () => {
      document.getElementById('folderUploadInput')?.click();
    });
    document.getElementById('welcomeUploadFileCard')?.addEventListener('click', () => {
      document.getElementById('fileUploadInput')?.click();
    });

    // 3. Quiz Configuration Panel Form & Selectors
    this.bindQuizPanelEvents();

    // 4. Module & Folder Management
    this.bindModuleManagementEvents();

    // 5. Reader Modal
    document.getElementById('closeReaderModalBtn')?.addEventListener('click', () => {
      document.getElementById('readerModal')?.classList.remove('active');
    });
  }

  // Tab Navigation Switching
  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });

    if (tabId === 'tab-quiz') {
      this.renderQuizConfigModules();
    } else if (tabId === 'tab-modules') {
      this.renderModulesGrid();
    }
  }

  // Theme Handling
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // ============================================================
  // CHAT SYSTEM & CONTEXT FILTERING
  // ============================================================

  // Send message
  async handleSendMessage() {
    const input = document.getElementById('chatInputTextarea');
    const query = input?.value.trim();
    if (!query) return;

    // Reset input
    input.value = '';
    input.style.height = 'auto';

    // Hide welcome hero if first message
    const welcomeHero = document.getElementById('chatWelcomeHero');
    if (welcomeHero) welcomeHero.style.display = 'none';

    // Append User Message to UI
    this.appendMessage({
      role: 'user',
      text: query,
      timestamp: Date.now()
    });

    // Show temporary typing indicator
    const typingId = this.showTypingIndicator();

    // Perform Context Analysis & Synthesis
    try {
      const analysis = await window.nlpEngine.analyzeQuery(query, this.activeModules);
      const response = await window.nlpEngine.generateResponse(query, analysis, this.settings);

      // Remove typing indicator
      this.removeTypingIndicator(typingId);

      // Append Assistant Message to UI
      this.appendMessage({
        role: 'assistant',
        text: response.text,
        isModuleRelated: response.isModuleRelated,
        badgeType: response.badgeType,
        badgeText: response.badgeText,
        citation: response.citation,
        timestamp: Date.now()
      });

    } catch (err) {
      console.error('Chat processing error:', err);
      this.removeTypingIndicator(typingId);
      this.appendMessage({
        role: 'assistant',
        text: `Maaf, terjadi kendala teknis saat memproses pertanyaan Anda: ${err.message}`,
        isModuleRelated: false,
        badgeType: 'contextual-out',
        badgeText: '⚠️ Galat',
        citation: null,
        timestamp: Date.now()
      });
    }
  }

  // Append message row
  appendMessage(msg) {
    const stream = document.getElementById('chatMessagesStream');
    if (!stream) return;

    const row = document.createElement('div');
    row.className = `message-row ${msg.role}`;

    const isAssistant = msg.role === 'assistant';
    const avatar = isAssistant ? '🤖' : '👤';
    const roleName = isAssistant ? 'EduBot P13' : 'Anda';
    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let filterBadgeHtml = '';
    if (isAssistant && msg.badgeText) {
      filterBadgeHtml = `
        <div class="filter-badge ${msg.badgeType}">
          <span>${msg.isModuleRelated ? '🎯' : '💡'}</span>
          <span>${msg.badgeText}</span>
        </div>
      `;
    }

    let citationHtml = '';
    if (isAssistant && msg.citation) {
      citationHtml = `
        <div class="citation-box">
          <div class="citation-header">
            <span>📖 Rujukan:</span>
            <span>${msg.citation.moduleTitle} (${msg.citation.sectionTitle})</span>
          </div>
          ${msg.citation.snippet ? `<div class="citation-snippet">"${msg.citation.snippet}"</div>` : ''}
        </div>
      `;
    }

    // Markdown simple parser
    const renderedHtml = this.parseSimpleMarkdown(msg.text);

    let actionBtnsHtml = '';
    if (isAssistant) {
      actionBtnsHtml = `
        <div class="message-actions">
          <button class="msg-act-btn copy-msg-btn" title="Salin Jawaban">
            📋 Salin
          </button>
          <button class="msg-act-btn tts-msg-btn" title="Dengarkan Suara">
            🔊 Dengarkan
          </button>
          ${msg.isModuleRelated ? `
            <button class="msg-act-btn quiz-from-msg-btn" title="Buat kuis latihan dari materi ini">
              📝 Buat Kuis Terkait
            </button>
          ` : ''}
        </div>
      `;
    }

    row.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-bubble-wrapper">
        <div class="message-meta">
          <span style="font-weight: 700; color: var(--text-primary);">${roleName}</span>
          <span>•</span>
          <span>${timeStr}</span>
        </div>
        <div class="message-bubble">
          ${filterBadgeHtml}
          <div class="message-text-content">${renderedHtml}</div>
          ${citationHtml}
        </div>
        ${actionBtnsHtml}
      </div>
    `;

    // Attach button events
    if (isAssistant) {
      row.querySelector('.copy-msg-btn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(msg.text);
        this.showToast('Jawaban disalin ke clipboard!', 'info');
      });

      row.querySelector('.tts-msg-btn')?.addEventListener('click', () => {
        this.speakText(msg.text);
      });

      row.querySelector('.quiz-from-msg-btn')?.addEventListener('click', () => {
        this.switchTab('tab-quiz');
      });
    }

    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
  }

  // Show typing indicator
  showTypingIndicator() {
    const stream = document.getElementById('chatMessagesStream');
    const id = 'typing_' + Date.now();
    const row = document.createElement('div');
    row.className = 'message-row assistant';
    row.id = id;
    row.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-bubble-wrapper">
        <div class="message-bubble" style="padding: 0.8rem 1.2rem;">
          <span style="color: var(--text-muted); font-size: 0.88rem;">EduBot sedang menganalisis materi modul... 💭</span>
        </div>
      </div>
    `;
    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  clearChatStream() {
    const stream = document.getElementById('chatMessagesStream');
    if (!stream) return;
    stream.innerHTML = `
      <div class="chat-welcome" id="chatWelcomeHero">
        <div class="welcome-avatar">🤖</div>
        <h1 class="welcome-title">Selamat Datang di EduBot P13</h1>
        <p class="welcome-desc">
          Asisten Belajar Mandiri berbasis AI yang berjalan <strong>100% lokal & offline</strong> di browser Anda. Terhubung dengan modul pembelajaran lengkap serta modul tambahan yang Anda unggah.
        </p>
      </div>
    `;
    this.showToast('Riwayat chat berhasil dibersihkan.', 'info');
  }

  // Simple Markdown Parser for responses
  parseSimpleMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent-primary); padding-left: 0.75rem; margin: 0.5rem 0; color: var(--text-secondary);">$1</blockquote>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code blocks & Inline Code
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bullet Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
  }

  // Voice Speech Synthesis (Text to Speech)
  speakText(text) {
    if (!('speechSynthesis' in window)) {
      this.showToast('Browser Anda tidak mendukung Text-to-Speech.', 'warning');
      return;
    }
    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const clean = text.replace(/[*#`_>-]/g, '').replace(/\n+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
    this.showToast('Membacakan jawaban...', 'info');
  }

  // Speech Recognition (Speech to Text)
  handleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.showToast('Fitur input suara belum didukung di browser ini. Gunakan Google Chrome atau Edge.', 'warning');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;

    const micBtn = document.getElementById('voiceInputBtn');
    micBtn?.classList.add('recording');
    this.showToast('Mendengarkan suara Anda...', 'info');

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('chatInputTextarea');
      if (input) {
        input.value = transcript;
        input.focus();
      }
      micBtn?.classList.remove('recording');
    };

    recognition.onerror = (e) => {
      console.warn('Speech error:', e);
      micBtn?.classList.remove('recording');
      this.showToast('Gagal mendeteksi suara.', 'warning');
    };

    recognition.onend = () => {
      micBtn?.classList.remove('recording');
    };

    recognition.start();
  }

  // Render Sidebar Subject Chips
  renderSidebarSubjects() {
    const container = document.getElementById('sidebarSubjectChips');
    if (!container) return;
    container.innerHTML = '';

    if (!this.activeModules || this.activeModules.length === 0) {
      container.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; padding: 0.6rem 0.2rem; line-height: 1.5;">
          tidak ada modul tersedia
        </div>
      `;
      const promptList = document.getElementById('sidebarPromptList');
      if (promptList) {
        promptList.innerHTML = `
          <div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; padding: 0.4rem 0.2rem; line-height: 1.4;">
            tidak ada modul tersedia. Unggah modul untuk menampilkan ide pertanyaan.
          </div>
        `;
      }
      return;
    }

    // Populate active module subject chips
    for (const mod of this.activeModules) {
      const chip = document.createElement('div');
      chip.className = 'subject-chip';
      chip.innerHTML = `<span>${mod.icon || '📚'}</span> <span>${mod.subject || mod.title}</span>`;
      chip.addEventListener('click', () => {
        const input = document.getElementById('chatInputTextarea');
        if (input) {
          input.value = `Jelaskan ringkasan materi ${mod.subject || mod.title}!`;
          input.focus();
        }
      });
      container.appendChild(chip);
    }

    // Populate prompts dynamically based on uploaded modules
    const promptList = document.getElementById('sidebarPromptList');
    if (promptList) {
      promptList.innerHTML = '';
      for (const mod of this.activeModules) {
        const item = document.createElement('div');
        item.className = 'prompt-card';
        item.setAttribute('data-prompt', `Jelaskan konsep inti dari materi ${mod.subject || mod.title}!`);
        item.innerHTML = `
          <span class="prompt-arrow">➜</span>
          <span>Pelajari materi ${mod.subject || mod.title}</span>
        `;
        item.addEventListener('click', () => {
          const input = document.getElementById('chatInputTextarea');
          if (input) {
            input.value = `Jelaskan konsep inti dari materi ${mod.subject || mod.title}!`;
            input.focus();
            this.handleSendMessage();
          }
        });
        promptList.appendChild(item);
      }
    }
  }

  // ============================================================
  // QUIZ GENERATION & INTERACTIVE RUNNER SYSTEM
  // ============================================================

  // Render Selectable Module Pills in Pre-Quiz Config Panel
  renderQuizConfigModules() {
    const container = document.getElementById('quizModulesSelectGrid');
    if (!container) return;
    container.innerHTML = '';

    if (!this.activeModules || this.activeModules.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.35); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; color: var(--text-secondary);">
          <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">📂</div>
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.3rem;">tidak ada modul tersedia</div>
          <div style="font-size: 0.84rem; margin-bottom: 1rem; color: var(--text-muted);">
            Silakan masukkan folder atau file materi Anda terlebih dahulu untuk membuat kuis.
          </div>
          <button type="button" class="btn-upload" id="quizGoToUploadBtn" style="margin: 0 auto;">
            📁 Buka Menu Upload Modul
          </button>
        </div>
      `;
      document.getElementById('quizGoToUploadBtn')?.addEventListener('click', () => {
        this.switchTab('tab-modules');
      });
      return;
    }

    for (const mod of this.activeModules) {
      const chip = document.createElement('div');
      chip.className = 'quiz-mod-chip selected';
      chip.setAttribute('data-mod-id', mod.id);
      chip.innerHTML = `
        <span style="font-size: 1.1rem;">${mod.icon || '📚'}</span>
        <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${mod.subject || mod.title}</span>
        <span class="chip-check">✓</span>
      `;
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
      container.appendChild(chip);
    }
  }

  // Bind Quiz Panel Selectors & Buttons
  bindQuizPanelEvents() {
    // Select all / deselect all modules for quiz
    document.getElementById('selectAllQuizModsBtn')?.addEventListener('click', () => {
      document.querySelectorAll('#quizModulesSelectGrid .quiz-mod-chip').forEach(c => c.classList.add('selected'));
    });
    document.getElementById('deselectAllQuizModsBtn')?.addEventListener('click', () => {
      document.querySelectorAll('#quizModulesSelectGrid .quiz-mod-chip').forEach(c => c.classList.remove('selected'));
    });

    // Pill Selector Click Helper
    const bindPillGroup = (groupId, activeClass = 'active') => {
      const group = document.getElementById(groupId);
      group?.querySelectorAll('.pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('.pill-option').forEach(b => b.classList.remove(activeClass));
          btn.classList.add(activeClass);
        });
      });
    };

    bindPillGroup('quizTypeSelector');
    bindPillGroup('quizCountSelector');
    bindPillGroup('quizDiffSelector');
    bindPillGroup('quizTimerSelector');

    // Quick random quiz button
    document.getElementById('randomQuickQuizBtn')?.addEventListener('click', () => {
      if (!this.activeModules || this.activeModules.length === 0) {
        this.showToast('Belum ada modul materi tersedia. Silakan unggah folder materi terlebih dahulu!', 'warning');
        return;
      }
      this.startQuizWithOptions({
        selectedModuleIds: [],
        count: 5,
        type: 'mix',
        difficulty: 'medium',
        timeLimitMinutes: 0
      });
    });

    // Form submit -> Start Quiz
    document.getElementById('quizConfigForm')?.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather selected modules
      const selectedMods = Array.from(document.querySelectorAll('#quizModulesSelectGrid .quiz-mod-chip.selected'))
        .map(c => c.getAttribute('data-mod-id'));

      if (selectedMods.length === 0) {
        this.showToast('Silakan pilih minimal 1 modul untuk materi kuis!', 'warning');
        return;
      }

      // Gather options
      const typeBtn = document.querySelector('#quizTypeSelector .pill-option.active');
      const countBtn = document.querySelector('#quizCountSelector .pill-option.active');
      const diffBtn = document.querySelector('#quizDiffSelector .pill-option.active');
      const timerBtn = document.querySelector('#quizTimerSelector .pill-option.active');

      const options = {
        selectedModuleIds: selectedMods,
        type: typeBtn ? typeBtn.getAttribute('data-type') : 'mix',
        count: countBtn ? parseInt(countBtn.getAttribute('data-count')) : 5,
        difficulty: diffBtn ? diffBtn.getAttribute('data-diff') : 'medium',
        timeLimitMinutes: timerBtn ? parseInt(timerBtn.getAttribute('data-timer')) : 0
      };

      this.startQuizWithOptions(options);
    });

    // Runner Buttons
    document.getElementById('runnerPrevBtn')?.addEventListener('click', () => this.navigateQuestion(-1));
    document.getElementById('runnerNextBtn')?.addEventListener('click', () => this.navigateQuestion(1));
    document.getElementById('runnerSkipBtn')?.addEventListener('click', () => this.navigateQuestion(1));
    document.getElementById('runnerSubmitBtn')?.addEventListener('click', () => this.submitQuiz());

    document.getElementById('abandonQuizBtn')?.addEventListener('click', () => {
      if (confirm('Yakin ingin membatalkan kuis dan kembali ke panel pengaturan?')) {
        this.resetQuizToPanel();
      }
    });

    // Results Screen Buttons
    document.getElementById('retakeQuizBtn')?.addEventListener('click', () => {
      if (this.currentQuiz) {
        this.currentQuiz.userAnswers = {};
        this.quizAnswers = {};
        this.startQuizSession(this.currentQuiz);
      }
    });
    document.getElementById('newQuizFromResultsBtn')?.addEventListener('click', () => {
      this.resetQuizToPanel();
    });
    document.getElementById('printQuizReportBtn')?.addEventListener('click', () => {
      window.print();
    });
  }

  // Start Quiz with configuration options
  startQuizWithOptions(options) {
    const quiz = window.quizEngine.createQuiz(this.activeModules, options);
    if (!quiz.questions || quiz.questions.length === 0) {
      this.showToast('Gagal merangkai soal. Pastikan modul yang dipilih memiliki teks materi.', 'warning');
      return;
    }

    this.startQuizSession(quiz);
  }

  // Start Interactive Quiz Session
  startQuizSession(quiz) {
    this.currentQuiz = quiz;
    this.currentQuizIndex = 0;
    this.quizAnswers = {};

    // Hide config and result panels, show runner
    document.getElementById('quizConfigPanel').style.display = 'none';
    document.getElementById('quizResultContainer').classList.remove('active');
    const runner = document.getElementById('quizRunnerContainer');
    runner.classList.add('active');

    // Start Timer if configured
    if (quiz.timeLimitMinutes > 0) {
      this.initQuizTimer(quiz.timeLimitMinutes * 60);
    } else {
      document.getElementById('runnerTimerDisplay').style.display = 'none';
    }

    // Render navigation jump pills
    this.renderRunnerNavPills();

    // Render first question
    this.renderCurrentQuestion();
  }

  // Timer Countdown
  initQuizTimer(totalSeconds) {
    clearInterval(this.quizTimerInterval);
    this.quizTimeRemaining = totalSeconds;
    const timerDisplay = document.getElementById('runnerTimerDisplay');
    const countdown = document.getElementById('timerCountdown');
    timerDisplay.style.display = 'flex';

    const updateDisplay = () => {
      const mins = Math.floor(this.quizTimeRemaining / 60);
      const secs = this.quizTimeRemaining % 60;
      countdown.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    updateDisplay();

    this.quizTimerInterval = setInterval(() => {
      this.quizTimeRemaining--;
      updateDisplay();

      if (this.quizTimeRemaining <= 0) {
        clearInterval(this.quizTimerInterval);
        this.showToast('Waktu kuis telah habis! Mengumpulkan jawaban...', 'warning');
        this.submitQuiz();
      }
    }, 1000);
  }

  // Render navigation jump pills (1, 2, 3...)
  renderRunnerNavPills() {
    const container = document.getElementById('runnerNavPills');
    if (!container || !this.currentQuiz) return;
    container.innerHTML = '';

    this.currentQuiz.questions.forEach((q, idx) => {
      const pill = document.createElement('button');
      pill.className = `q-nav-pill ${idx === this.currentQuizIndex ? 'active' : ''}`;
      if (this.quizAnswers[q.id] !== undefined) {
        pill.classList.add('answered');
      }
      pill.textContent = idx + 1;
      pill.addEventListener('click', () => {
        this.currentQuizIndex = idx;
        this.renderCurrentQuestion();
      });
      container.appendChild(pill);
    });
  }

  // Render Current Question in Runner
  renderCurrentQuestion() {
    if (!this.currentQuiz) return;
    const q = this.currentQuiz.questions[this.currentQuizIndex];
    const total = this.currentQuiz.questions.length;

    // Update Counter & Progress Bar
    document.getElementById('runnerQuestionCounter').textContent = `Soal ${this.currentQuizIndex + 1} dari ${total}`;
    const progressPercent = Math.round(((this.currentQuizIndex + 1) / total) * 100);
    document.getElementById('runnerProgressBar').style.width = `${progressPercent}%`;

    // Badges
    document.getElementById('runnerSubjectBadge').textContent = q.subject || 'Modul';
    const typeLabel = q.type === 'mc' ? 'Pilihan Ganda' : (q.type === 'tf' ? 'Benar / Salah' : 'Essay');
    document.getElementById('runnerTypeBadge').textContent = typeLabel;

    // Stem
    document.getElementById('runnerQuestionStem').textContent = q.stem;

    // Render Answer Zone
    const answerZone = document.getElementById('runnerAnswerZone');
    answerZone.innerHTML = '';

    if (q.type === 'mc') {
      const mcContainer = document.createElement('div');
      mcContainer.className = 'mc-options';
      const letters = ['A', 'B', 'C', 'D'];

      q.options.forEach((opt, optIdx) => {
        const isSelected = this.quizAnswers[q.id] === opt;
        const optCard = document.createElement('div');
        optCard.className = `mc-option ${isSelected ? 'selected' : ''}`;
        optCard.innerHTML = `
          <div class="mc-letter">${letters[optIdx] || optIdx + 1}</div>
          <div style="flex: 1;">${opt}</div>
        `;
        optCard.addEventListener('click', () => {
          this.quizAnswers[q.id] = opt;
          mcContainer.querySelectorAll('.mc-option').forEach(c => c.classList.remove('selected'));
          optCard.classList.add('selected');
          this.renderRunnerNavPills();
        });
        mcContainer.appendChild(optCard);
      });
      answerZone.appendChild(mcContainer);

    } else if (q.type === 'tf') {
      const tfContainer = document.createElement('div');
      tfContainer.className = 'tf-options';
      const curVal = this.quizAnswers[q.id];

      const trueBtn = document.createElement('button');
      trueBtn.type = 'button';
      trueBtn.className = `tf-btn ${curVal === true ? 'selected-true' : ''}`;
      trueBtn.innerHTML = `<span>👍</span> <span>BENAR</span>`;
      trueBtn.addEventListener('click', () => {
        this.quizAnswers[q.id] = true;
        tfContainer.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected-true', 'selected-false'));
        trueBtn.classList.add('selected-true');
        this.renderRunnerNavPills();
      });

      const falseBtn = document.createElement('button');
      falseBtn.type = 'button';
      falseBtn.className = `tf-btn ${curVal === false ? 'selected-false' : ''}`;
      falseBtn.innerHTML = `<span>👎</span> <span>SALAH</span>`;
      falseBtn.addEventListener('click', () => {
        this.quizAnswers[q.id] = false;
        tfContainer.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected-true', 'selected-false'));
        falseBtn.classList.add('selected-false');
        this.renderRunnerNavPills();
      });

      tfContainer.appendChild(trueBtn);
      tfContainer.appendChild(falseBtn);
      answerZone.appendChild(tfContainer);

    } else if (q.type === 'essay') {
      const essayWrap = document.createElement('div');
      essayWrap.className = 'essay-input-wrap';
      const curText = this.quizAnswers[q.id] || '';

      const textarea = document.createElement('textarea');
      textarea.className = 'essay-textarea';
      textarea.placeholder = 'Ketik analisis dan penjelasan jawaban Anda di sini...';
      textarea.value = curText;

      const meta = document.createElement('div');
      meta.className = 'essay-meta';
      meta.innerHTML = `
        <span>💡 Tuliskan kata-kata kunci dan argumen inti secara jelas.</span>
        <span id="essayWordCounter">${curText.split(/\s+/).filter(Boolean).length} kata</span>
      `;

      textarea.addEventListener('input', () => {
        this.quizAnswers[q.id] = textarea.value;
        const words = textarea.value.split(/\s+/).filter(Boolean).length;
        document.getElementById('essayWordCounter').textContent = `${words} kata`;
        this.renderRunnerNavPills();
      });

      essayWrap.appendChild(textarea);
      essayWrap.appendChild(meta);
      answerZone.appendChild(essayWrap);
    }

    // Update Footer Buttons Visibility
    document.getElementById('runnerPrevBtn').disabled = this.currentQuizIndex === 0;
    const isLast = this.currentQuizIndex === total - 1;
    document.getElementById('runnerNextBtn').style.display = isLast ? 'none' : 'flex';
    document.getElementById('runnerSubmitBtn').style.display = isLast ? 'flex' : 'none';

    this.renderRunnerNavPills();
  }

  // Navigate between questions
  navigateQuestion(delta) {
    if (!this.currentQuiz) return;
    const nextIdx = this.currentQuizIndex + delta;
    if (nextIdx >= 0 && nextIdx < this.currentQuiz.questions.length) {
      this.currentQuizIndex = nextIdx;
      this.renderCurrentQuestion();
    }
  }

  // Submit and Auto-Grade Quiz
  async submitQuiz() {
    clearInterval(this.quizTimerInterval);

    // Evaluate answers
    const evaluation = window.quizEngine.evaluateQuiz(this.currentQuiz, this.quizAnswers);
    this.currentQuiz.result = evaluation;

    // Save to IndexedDB
    await window.storageManager.saveQuizResult({
      id: this.currentQuiz.id,
      title: this.currentQuiz.title,
      timestamp: Date.now(),
      finalPercent: evaluation.finalPercent,
      grade: evaluation.grade,
      statusText: evaluation.statusText,
      totalQuestions: evaluation.totalQuestions
    });

    // Render Result View
    this.renderQuizResults(evaluation);
  }

  // Render Quiz Results & Review
  renderQuizResults(evalData) {
    document.getElementById('quizRunnerContainer').classList.remove('active');
    const resultContainer = document.getElementById('quizResultContainer');
    resultContainer.classList.add('active');

    // Update Hero Stats
    document.getElementById('resultScoreNum').textContent = evalData.finalPercent;
    document.getElementById('resultGradeTitle').textContent = `Predikat: ${evalData.statusText} (${evalData.grade})`;
    
    let correctCount = 0;
    evalData.evaluations.forEach(e => { if (e.isCorrect) correctCount++; });

    document.getElementById('resultStatCorrect').textContent = correctCount;
    document.getElementById('resultStatTotal').textContent = evalData.totalQuestions;
    document.getElementById('resultStatPercent').textContent = `${evalData.finalPercent}%`;

    // Render Review Questions
    const reviewList = document.getElementById('quizReviewList');
    reviewList.innerHTML = '';

    evalData.evaluations.forEach((item, idx) => {
      const q = item.question;
      const card = document.createElement('div');
      card.className = `review-item ${item.isCorrect ? 'is-correct' : 'is-incorrect'}`;

      let rubricFeedback = '';
      if (q.type === 'essay' && item.feedback) {
        rubricFeedback = `
          <div style="background: rgba(99, 102, 241, 0.12); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); margin-top: 0.5rem; font-size: 0.82rem; color: #c7d2fe;">
            <strong>🎯 Evaluasi Analisis AI (Nilai: ${item.score}/100):</strong> ${item.feedback}
          </div>
        `;
      }

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-muted);">Soal ${idx + 1} • ${q.subject}</span>
          <span class="brand-badge" style="background: ${item.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; color: ${item.isCorrect ? '#10b981' : '#f43f5e'};">
            ${item.isCorrect ? '✓ Benar' : '✕ Belum Tepat'}
          </span>
        </div>
        <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${q.stem}</div>
        <div style="font-size: 0.88rem;">
          <div><span style="color: var(--text-muted);">Jawaban Anda:</span> <strong>${item.userAnswer}</strong></div>
          <div><span style="color: var(--text-muted);">Kunci Jawaban:</span> <strong style="color: #34d399;">${item.correctAnswer}</strong></div>
        </div>
        ${rubricFeedback}
        <div class="review-explanation">
          <strong>💡 Pembahasan & Referensi Modul:</strong><br>
          ${item.explanation || 'Tidak ada pembahasan tambahan.'}
        </div>
      `;

      reviewList.appendChild(card);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetQuizToPanel() {
    clearInterval(this.quizTimerInterval);
    document.getElementById('quizRunnerContainer').classList.remove('active');
    document.getElementById('quizResultContainer').classList.remove('active');
    document.getElementById('quizConfigPanel').style.display = 'block';
  }

  // ============================================================
  // MODULES & FOLDER MANAGEMENT
  // ============================================================

  // Bind Module Management Triggers
  bindModuleManagementEvents() {
    const folderInput = document.getElementById('folderUploadInput');
    const fileInput = document.getElementById('fileUploadInput');

    // Upload Folder Button
    document.getElementById('uploadFolderBtn')?.addEventListener('click', () => {
      folderInput?.click();
    });

    // Upload Files Button
    document.getElementById('uploadFilesBtn')?.addEventListener('click', () => {
      fileInput?.click();
    });

    // Reset to Default Bahan P13
    document.getElementById('resetModulesBtn')?.addEventListener('click', async () => {
      if (confirm('Kembalikan koleksi modul ke 10 Modul Bahan Latihan P13 semula?')) {
        await window.storageManager.resetToDefaultModules();
        await this.refreshModules();
        this.renderModulesGrid();
        this.renderSidebarSubjects();
        this.renderQuizConfigModules();
        this.showToast('Koleksi modul berhasil direset ke Bahan Latihan P13.', 'success');
      }
    });

    // Folder upload handler
    folderInput?.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      this.showToast('Memproses materi dari folder yang diunggah...', 'info');

      try {
        const newModule = await window.fileLoader.processFolderUpload(files, (p) => {
          this.showToast(`Membaca file ${p.current} dari ${p.total}: ${p.fileName}`, 'info');
        });

        await window.storageManager.saveModule(newModule);
        await this.refreshModules();
        this.renderModulesGrid();
        this.renderSidebarSubjects();
        this.renderQuizConfigModules();

        this.showToast(`Berhasil menambahkan folder "${newModule.subject}" (${newModule.files.length} file)!`, 'success');
      } catch (err) {
        console.error('Folder upload error:', err);
        alert(`Gagal memproses folder: ${err.message}`);
      }

      folderInput.value = '';
    });

    // File upload handler
    fileInput?.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      this.showToast('Membaca file yang diunggah...', 'info');

      try {
        const newModules = await window.fileLoader.processFilesUpload(files);
        for (const m of newModules) {
          await window.storageManager.saveModule(m);
        }

        await this.refreshModules();
        this.renderModulesGrid();
        this.renderSidebarSubjects();
        this.renderQuizConfigModules();

        this.showToast(`Berhasil menambahkan ${newModules.length} file materi baru!`, 'success');
      } catch (err) {
        console.error('File upload error:', err);
        alert(`Gagal mengunggah file: ${err.message}`);
      }

      fileInput.value = '';
    });

    // Search filter
    document.getElementById('searchModulesInput')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      this.filterModulesGrid(query);
    });
  }

  // Render All Module Cards in Tab 3
  renderModulesGrid() {
    const grid = document.getElementById('modulesCardGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!this.allModules || this.allModules.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--bg-card); border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: 3.5rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.1rem; box-shadow: var(--shadow-sm);">
          <div style="width: 76px; height: 76px; border-radius: 20px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; align-items: center; justify-content: center; font-size: 2.4rem;">
            📂
          </div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.01em;">
            tidak ada modul tersedia
          </h3>
          <p style="max-width: 520px; font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6;">
            Belum ada materi pelajaran yang dimasukkan. Silakan unggah folder modul Anda sendiri dari komputer Anda.
          </p>
          <div style="display: flex; gap: 0.85rem; margin-top: 0.4rem; flex-wrap: wrap; justify-content: center;">
            <button class="btn-upload" id="emptyStateUploadFolderBtn">
              📁 Upload Folder Baru
            </button>
            <button class="btn-secondary" id="emptyStateUploadFileBtn">
              📄 Upload File Materi
            </button>
          </div>
        </div>
      `;

      document.getElementById('emptyStateUploadFolderBtn')?.addEventListener('click', () => {
        document.getElementById('folderUploadInput')?.click();
      });
      document.getElementById('emptyStateUploadFileBtn')?.addEventListener('click', () => {
        document.getElementById('fileUploadInput')?.click();
      });
      return;
    }

    for (const mod of this.allModules) {
      const card = document.createElement('div');
      card.className = 'module-card';
      card.setAttribute('data-mod-id', mod.id);

      const wordCount = (mod.wordCount || 0).toLocaleString();
      const fileCount = (mod.files && mod.files.length) || 1;
      const isDefault = mod.isDefault;

      card.innerHTML = `
        <div class="module-card-top">
          <div class="module-icon-wrap">${mod.icon || '📚'}</div>
          <div class="module-meta-tags">
            <span class="mod-tag" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">
              ${mod.source || 'Modul P13'}
            </span>
            <label class="switch" title="Aktifkan/Nonaktifkan modul dalam chat & kuis">
              <input type="checkbox" class="mod-toggle" ${mod.isActive !== false ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div>
          <h3 class="module-title">${mod.title}</h3>
          <p class="module-desc">${mod.summary || 'Ringkasan materi modul akademik.'}</p>
        </div>

        <div class="module-stats">
          <span>📄 ${fileCount} File</span>
          <span>📝 ${wordCount} Kata</span>
          <span>${mod.isActive !== false ? '🟢 Aktif' : '⚪ Nonaktif'}</span>
        </div>

        <div class="module-actions">
          <button class="btn-ghost-sm read-mod-btn">
            📖 Baca Isi
          </button>
          <button class="btn-ghost-sm quiz-mod-btn">
            📝 Buat Kuis
          </button>
          ${!isDefault ? `
            <button class="btn-ghost-sm del-mod-btn" style="color: #f43f5e;">
              🗑️
            </button>
          ` : ''}
        </div>
      `;

      // Event: Toggle Active
      card.querySelector('.mod-toggle')?.addEventListener('change', async (e) => {
        await window.storageManager.toggleModule(mod.id, e.target.checked);
        await this.refreshModules();
        this.renderSidebarSubjects();
        this.renderQuizConfigModules();
      });

      // Event: Read Module Modal
      card.querySelector('.read-mod-btn')?.addEventListener('click', () => {
        this.openReaderModal(mod);
      });

      // Event: Make Quiz specifically for this module
      card.querySelector('.quiz-mod-btn')?.addEventListener('click', () => {
        this.switchTab('tab-quiz');
        // Select only this module
        document.querySelectorAll('#quizModulesSelectGrid .quiz-mod-chip').forEach(c => {
          c.classList.toggle('selected', c.getAttribute('data-mod-id') === mod.id);
        });
      });

      // Event: Delete custom module
      card.querySelector('.del-mod-btn')?.addEventListener('click', async () => {
        if (confirm(`Hapus modul "${mod.title}"?`)) {
          await window.storageManager.deleteModule(mod.id);
          await this.refreshModules();
          this.renderModulesGrid();
          this.renderSidebarSubjects();
          this.renderQuizConfigModules();
          this.showToast('Modul berhasil dihapus.', 'info');
        }
      });

      grid.appendChild(card);
    }
  }

  // Filter modules grid by search query
  filterModulesGrid(query) {
    document.querySelectorAll('#modulesCardGrid .module-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? 'flex' : 'none';
    });
  }

  // Open Full Module Reader Modal
  openReaderModal(module) {
    const modal = document.getElementById('readerModal');
    const title = document.getElementById('readerModalTitle');
    const icon = document.getElementById('readerModalIcon');
    const body = document.getElementById('readerModalBody');

    title.textContent = module.title;
    icon.textContent = module.icon || '📖';

    let contentHtml = `
      <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
        <h2 style="font-size: 1.3rem; font-weight: 800;">${module.title}</h2>
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.25rem;">
          Sumber: ${module.source} • Total ${module.wordCount ? module.wordCount.toLocaleString() : 0} kata
        </div>
      </div>
    `;

    if (module.sections && module.sections.length > 0) {
      module.sections.forEach((sec, idx) => {
        contentHtml += `
          <div style="margin-bottom: 1.75rem;">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #818cf8; margin-bottom: 0.5rem;">
              ${sec.title}
            </h3>
            <div style="white-space: pre-wrap; font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary);">
              ${sec.content}
            </div>
          </div>
        `;
      });
    } else {
      contentHtml += `
        <div style="white-space: pre-wrap; font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary);">
          ${module.fullText || 'Tidak ada teks materi yang dapat ditampilkan.'}
        </div>
      `;
    }

    body.innerHTML = contentHtml;

    // Hook buttons
    document.getElementById('readerAskBotBtn').onclick = () => {
      modal.classList.remove('active');
      this.switchTab('tab-chat');
      const input = document.getElementById('chatInputTextarea');
      if (input) {
        input.value = `Jelaskan secara mendalam tentang ${module.subject || module.title}!`;
        input.focus();
      }
    };

    document.getElementById('readerMakeQuizBtn').onclick = () => {
      modal.classList.remove('active');
      this.switchTab('tab-quiz');
      document.querySelectorAll('#quizModulesSelectGrid .quiz-mod-chip').forEach(c => {
        c.classList.toggle('selected', c.getAttribute('data-mod-id') === module.id);
      });
    };

    modal.classList.add('active');
  }

  // ============================================================
  // SETTINGS & TOAST HELPERS
  // ============================================================

  populateSettingsForm() {
    const engineSel = document.getElementById('settingAiEngine');
    const geminiInput = document.getElementById('settingGeminiKey');
    const ollamaUrl = document.getElementById('settingOllamaUrl');
    const ollamaModel = document.getElementById('settingOllamaModel');
    const speechCheck = document.getElementById('settingSpeechSynthesis');

    if (engineSel) engineSel.value = this.settings.aiEngine || 'local';
    if (geminiInput) geminiInput.value = this.settings.geminiApiKey || '';
    if (ollamaUrl) ollamaUrl.value = this.settings.ollamaUrl || 'http://localhost:11434';
    if (ollamaModel) ollamaModel.value = this.settings.ollamaModel || 'llama3';
    if (speechCheck) speechCheck.checked = this.settings.speechSynthesis !== false;

    this.handleAiEngineChange(this.settings.aiEngine || 'local');
  }

  handleAiEngineChange(val) {
    const geminiGroup = document.getElementById('geminiKeyGroup');
    const ollamaGroup = document.getElementById('ollamaConfigGroup');
    if (geminiGroup) geminiGroup.style.display = val === 'gemini' ? 'block' : 'none';
    if (ollamaGroup) ollamaGroup.style.display = val === 'ollama' ? 'block' : 'none';
  }

  saveSettingsForm() {
    this.settings.aiEngine = document.getElementById('settingAiEngine').value;
    this.settings.geminiApiKey = document.getElementById('settingGeminiKey').value.trim();
    this.settings.ollamaUrl = document.getElementById('settingOllamaUrl').value.trim();
    this.settings.ollamaModel = document.getElementById('settingOllamaModel').value.trim();
    this.settings.speechSynthesis = document.getElementById('settingSpeechSynthesis').checked;

    window.storageManager.saveSettings(this.settings);
    this.updateEngineStatus();
  }

  updateEngineStatus() {
    const text = document.getElementById('engineStatusText');
    if (!text) return;
    if (this.settings.aiEngine === 'gemini') {
      text.textContent = 'Gemini AI Aktif';
    } else if (this.settings.aiEngine === 'ollama') {
      text.textContent = 'Ollama Lokal';
    } else {
      text.textContent = 'Offline Cerdas';
    }
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    const msg = document.getElementById('toastMessage');
    const icon = document.getElementById('toastIcon');
    if (!toast || !msg) return;

    msg.textContent = message;
    if (type === 'success') icon.textContent = '✅';
    else if (type === 'warning') icon.textContent = '⚠️';
    else icon.textContent = 'ℹ️';

    toast.style.display = 'flex';
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 3500);
  }
}

// Instantiate and launch EduBot App
window.addEventListener('DOMContentLoaded', () => {
  window.eduBotApp = new EduBotApp();
  window.eduBotApp.init();
});
