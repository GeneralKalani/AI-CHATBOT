/**
 * EduBot P13 - Storage Manager (IndexedDB & LocalStorage)
 * Manages persistent modules, uploaded folders, chat logs, and quiz results.
 */

const DB_NAME = 'EduBotP13_Database';
const DB_VERSION = 2;
const STORE_MODULES = 'modules';
const STORE_QUIZZES = 'quizzes';
const STORE_CHATS = 'chats';

class StorageManager {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains(STORE_MODULES)) {
          db.deleteObjectStore(STORE_MODULES);
        }
        const modStore = db.createObjectStore(STORE_MODULES, { keyPath: 'id' });
        modStore.createIndex('subject', 'subject', { unique: false });

        if (!db.objectStoreNames.contains(STORE_QUIZZES)) {
          db.createObjectStore(STORE_QUIZZES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_CHATS)) {
          db.createObjectStore(STORE_CHATS, { keyPath: 'id' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        // Purge any lingering modules from older sessions
        if (localStorage.getItem('edubot_initial_clean_v2') !== 'done') {
          await this.resetToDefaultModules();
          localStorage.setItem('edubot_initial_clean_v2', 'done');
        }
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Optional manual loader for P13 sample modules if user triggers it
  async loadSampleP13Modules() {
    if (window.DEFAULT_MODULES && window.DEFAULT_MODULES.length > 0) {
      for (const mod of window.DEFAULT_MODULES) {
        await this.saveModule({
          ...mod,
          isActive: true,
          isDefault: true,
          createdAt: Date.now()
        });
      }
    }
  }

  // Get all modules
  async getAllModules() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_MODULES, 'readonly');
      const store = tx.objectStore(STORE_MODULES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Get only active modules for chatbot and quiz
  async getActiveModules() {
    const all = await this.getAllModules();
    return all.filter(m => m.isActive !== false);
  }

  // Save or update module
  async saveModule(moduleData) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_MODULES, 'readwrite');
      const store = tx.objectStore(STORE_MODULES);
      const request = store.put(moduleData);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Toggle module active status
  async toggleModule(id, isActive) {
    const mod = await this.getModuleById(id);
    if (mod) {
      mod.isActive = isActive;
      await this.saveModule(mod);
    }
  }

  // Get module by ID
  async getModuleById(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_MODULES, 'readonly');
      const store = tx.objectStore(STORE_MODULES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete module (custom uploaded only)
  async deleteModule(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_MODULES, 'readwrite');
      const store = tx.objectStore(STORE_MODULES);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all modules (Reset to empty)
  async resetToDefaultModules() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_MODULES, 'readwrite');
      const store = tx.objectStore(STORE_MODULES);
      store.clear().onsuccess = () => {
        resolve(true);
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // Save Quiz result
  async saveQuizResult(quizData) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_QUIZZES, 'readwrite');
      const store = tx.objectStore(STORE_QUIZZES);
      store.put(quizData).onsuccess = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Get Quiz history
  async getQuizHistory() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_QUIZZES, 'readonly');
      const store = tx.objectStore(STORE_QUIZZES);
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.timestamp - a.timestamp));
      request.onerror = () => reject(request.error);
    });
  }

  // Local settings helper
  getSettings() {
    const defaultSettings = {
      theme: 'dark',
      aiEngine: 'local', // 'local' | 'gemini' | 'ollama'
      geminiApiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3',
      chatFilterStrictness: 'standard', // 'lenient' | 'standard' | 'strict'
      speechSynthesis: true
    };
    try {
      const saved = localStorage.getItem('edubot_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  }

  saveSettings(settings) {
    localStorage.setItem('edubot_settings', JSON.stringify(settings));
  }
}

window.storageManager = new StorageManager();
