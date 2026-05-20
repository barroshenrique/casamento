// js/database.js
import { FIREBASE_CONFIG, USE_FIREBASE } from './config.js';

// Definição dos Dados Iniciais Padrão (Save the Date)
const DEFAULT_CONFIG = {
  general: {
    husbandName: "Henrique",
    wifeName: "Nathália",
    weddingDate: "2026-12-13T17:00:00",
    locationCity: "Rio Grande/RS",
    locationText: "A cerimônia e recepção serão realizadas em Rio Grande, RS. Mais informações sobre o local exato serão divulgadas em breve!",
    saveTheDateTitle: "Salvem a Data",
    saveTheDateSubtitle: "Henrique & Nathália vão casar! Preparem-se para celebrar conosco este grande dia.",
    dressCodeText: "O traje sugerido para a nossa celebração é Esporte Fino. Recomendamos roupas leves e calçados confortáveis.",
    dressColors: ["#e8c5c8", "#d4a373", "#b88a8f", "#a3b19b", "#f0e6ef"]
  },
  theme: {
    primaryColor: "#722f37", // Marsala clássico de destaque
    primaryRose: "#f5ebe0",  // Begezinho
    sageGreen: "#8a9a86"     // Verde das flores
  },
  slideshow: [
    "assets/couple_sunset.png",
    "assets/wedding_rings.png",
    "assets/wedding_reception.png"
  ],
  navigation: [
    { id: "inicio", title: "Início", active: true, system: true },
    { id: "historia", title: "Nossa História", active: true, system: true },
    { id: "presentes", title: "Lista de Presentes", active: true, system: true },
    { id: "local", title: "Local & Traje", active: true, system: true },
    { id: "cha-panela", title: "Chá de Panela", active: false, system: true, content: "<h3>Chá de Panela</h3><p>Nosso chá de panela acontecerá em breve! As informações de data, local e itens para presente serão disponibilizadas aqui.</p>" },
    { id: "padrinhos", title: "Área dos Padrinhos", active: false, system: true, content: "<h3>Aos Nossos Padrinhos</h3><p>Vocês são muito especiais para nós! Esta área conterá informações exclusivas sobre trajes, horários e surpresas.</p>" }
  ],
  customTabs: []
};

const DEFAULT_STORY = [
  { id: "1", year: "2023", title: "O Primeiro Olhar", description: "Foi em uma tarde de primavera que nossos caminhos se cruzaram pela primeira vez. A partir dali, sabíamos que algo especial estava começando." },
  { id: "2", year: "2025", title: "O Sim Mais Importante", description: "Sob a luz do pôr do sol e com o coração batendo forte, Henrique fez a pergunta mais romântica, e Nathália disse SIM para uma vida inteira de aventuras juntos." }
];

const DEFAULT_GIFTS = [
  { id: "gift-1", title: "Jogo de Panelas Cerâmica Premium", category: "Cozinha", price: 450, description: "Conjunto de panelas antiaderentes com revestimento cerâmico para preparar deliciosas receitas.", imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=400", status: "available", claimedBy: "", claimedPhone: "" },
  { id: "gift-2", title: "Liquidificador Retrô 1200W", category: "Eletrodomésticos", price: 280, description: "Potência e elegância vintage na cor cobre para o nosso café da manhã.", imageUrl: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=400", status: "available", claimedBy: "", claimedPhone: "" },
  { id: "gift-3", title: "Faqueiro Inox 48 Peças", category: "Cozinha", price: 180, description: "Conjunto completo de talheres de aço inoxidável para recebermos os amigos em nossos jantares.", imageUrl: "https://images.unsplash.com/photo-1543510473-ac2c35329a28?auto=format&fit=crop&q=80&w=400", status: "available", claimedBy: "", claimedPhone: "" },
  { id: "gift-4", title: "Jogo de Cama Algodão Egípcio Queen", category: "Cama & Banho", price: 350, description: "Maciez e conforto de 400 fios para nossas noites de descanso.", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400", status: "available", claimedBy: "", claimedPhone: "" },
  { id: "gift-5", title: "Cafeteira Espresso Gourmet", category: "Eletrodomésticos", price: 590, description: "Para Henrique preparar deliciosos cafés expressos e Nathália degustar todas as manhãs.", imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400", status: "available", claimedBy: "", claimedPhone: "" },
  { id: "gift-6", title: "Aparelho de Jantar Porcelana 20 Peças", category: "Cozinha", price: 320, description: "Pratos elegantes de porcelana com detalhes dourados para ocasiões especiais.", imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400", status: "available", claimedBy: "", claimedPhone: "" }
];

class WeddingDatabase {
  constructor() {
    this.isFirebaseReady = false;
    this.db = null;
    this.configListeners = [];
    this.giftsListeners = [];
    this.storyListeners = [];

    this.init();
  }

  async init() {
    // Verifica se as chaves reais foram fornecidas e o Firebase está ativo
    const hasKeys = FIREBASE_CONFIG && 
                    FIREBASE_CONFIG.apiKey && 
                    !FIREBASE_CONFIG.apiKey.includes("SUA_API_KEY_AQUI");

    if (USE_FIREBASE && hasKeys) {
      try {
        // Inicialização modular do Firebase via CDN dinâmico
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        
        const app = initializeApp(FIREBASE_CONFIG);
        this.db = getFirestore(app);
        this.isFirebaseReady = true;
        console.log("💍 Firebase carregado com sucesso! Sincronização online ativa.");
        
        // Garante a existência do documento de configuração padrão na nuvem
        await this.ensureInitialCloudData();
      } catch (err) {
        console.error("⚠️ Falha ao inicializar o Firebase. Revertendo para LocalStorage.", err);
        this.isFirebaseReady = false;
      }
    } else {
      console.log("🏠 Modo Local ativo (LocalStorage). Nenhuma chave do Firebase configurada.");
      this.isFirebaseReady = false;
      this.ensureInitialLocalData();
    }
  }

  // --- MÉTODOS AUXILIARES DE INICIALIZAÇÃO DE DADOS ---

  ensureInitialLocalData() {
    if (!localStorage.getItem("weddingConfig")) {
      localStorage.setItem("weddingConfig", JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem("weddingStory")) {
      localStorage.setItem("weddingStory", JSON.stringify(DEFAULT_STORY));
    }
    if (!localStorage.getItem("weddingGifts")) {
      localStorage.setItem("weddingGifts", JSON.stringify(DEFAULT_GIFTS));
    }
  }

  async ensureInitialCloudData() {
    if (!this.isFirebaseReady) return;
    const { doc, getDoc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
    // Verificar Configuração Geral
    const configRef = doc(this.db, "wedding", "config");
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      await setDoc(configRef, DEFAULT_CONFIG);
    }

    // Verificar História
    const storyRef = doc(this.db, "wedding", "story");
    const storySnap = await getDoc(storyRef);
    if (!storySnap.exists()) {
      await setDoc(storyRef, { items: DEFAULT_STORY });
    }

    // Verificar Presentes
    const giftsRef = doc(this.db, "wedding", "gifts");
    const giftsSnap = await getDoc(giftsRef);
    if (!giftsSnap.exists()) {
      await setDoc(giftsRef, { items: DEFAULT_GIFTS });
    }
  }

  // --- MONITORAMENTO EM TEMPO REAL (LISTENERS) ---

  async listenConfig(callback) {
    if (this.isFirebaseReady) {
      const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const unsubscribe = onSnapshot(doc(this.db, "wedding", "config"), (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data());
        }
      });
      this.configListeners.push(unsubscribe);
      return unsubscribe;
    } else {
      // Sincronização Local imediata
      const config = JSON.parse(localStorage.getItem("weddingConfig"));
      callback(config);
      
      // Listener simulado para mudanças na mesma aba/janela
      const localHandler = (e) => {
        if (e.key === "weddingConfig") {
          callback(JSON.parse(e.newValue));
        }
      };
      window.addEventListener('storage', localHandler);
      return () => window.removeEventListener('storage', localHandler);
    }
  }

  async listenGifts(callback) {
    if (this.isFirebaseReady) {
      const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const unsubscribe = onSnapshot(doc(this.db, "wedding", "gifts"), (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data().items || []);
        }
      });
      this.giftsListeners.push(unsubscribe);
      return unsubscribe;
    } else {
      const gifts = JSON.parse(localStorage.getItem("weddingGifts")) || [];
      callback(gifts);
      
      const localHandler = (e) => {
        if (e.key === "weddingGifts") {
          callback(JSON.parse(e.newValue) || []);
        }
      };
      window.addEventListener('storage', localHandler);
      return () => window.removeEventListener('storage', localHandler);
    }
  }

  async listenStory(callback) {
    if (this.isFirebaseReady) {
      const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const unsubscribe = onSnapshot(doc(this.db, "wedding", "story"), (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data().items || []);
        }
      });
      this.storyListeners.push(unsubscribe);
      return unsubscribe;
    } else {
      const story = JSON.parse(localStorage.getItem("weddingStory")) || [];
      callback(story);

      const localHandler = (e) => {
        if (e.key === "weddingStory") {
          callback(JSON.parse(e.newValue) || []);
        }
      };
      window.addEventListener('storage', localHandler);
      return () => window.removeEventListener('storage', localHandler);
    }
  }

  // --- PERSISTÊNCIA DE DADOS (SALVAMENTO) ---

  async saveConfig(newConfig) {
    if (this.isFirebaseReady) {
      const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      await setDoc(doc(this.db, "wedding", "config"), newConfig, { merge: true });
    } else {
      localStorage.setItem("weddingConfig", JSON.stringify(newConfig));
      // Dispara evento local manualmente para a própria janela atualizar
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'weddingConfig',
        newValue: JSON.stringify(newConfig)
      }));
    }
  }

  async saveStory(newStoryItems) {
    if (this.isFirebaseReady) {
      const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      await setDoc(doc(this.db, "wedding", "story"), { items: newStoryItems });
    } else {
      localStorage.setItem("weddingStory", JSON.stringify(newStoryItems));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'weddingStory',
        newValue: JSON.stringify(newStoryItems)
      }));
    }
  }

  async saveGifts(newGiftsItems) {
    if (this.isFirebaseReady) {
      const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      await setDoc(doc(this.db, "wedding", "gifts"), { items: newGiftsItems });
    } else {
      localStorage.setItem("weddingGifts", JSON.stringify(newGiftsItems));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'weddingGifts',
        newValue: JSON.stringify(newGiftsItems)
      }));
    }
  }

  // --- LÓGICA DO CONVIDADO (RESERVAR PRESENTES) ---

  async claimGift(giftId, guestName, guestPhone) {
    let gifts = [];
    if (this.isFirebaseReady) {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const snap = await getDoc(doc(this.db, "wedding", "gifts"));
      if (snap.exists()) {
        gifts = snap.data().items || [];
      }
    } else {
      gifts = JSON.parse(localStorage.getItem("weddingGifts")) || [];
    }

    const giftIndex = gifts.findIndex(g => g.id === giftId);
    if (giftIndex === -1) throw new Error("Presente não encontrado.");
    if (gifts[giftIndex].status === "reserved") throw new Error("Este presente já foi reservado por outra pessoa.");

    // Atualiza o presente
    gifts[giftIndex].status = "reserved";
    gifts[giftIndex].claimedBy = guestName;
    gifts[giftIndex].claimedPhone = guestPhone;

    await this.saveGifts(gifts);
    return gifts[giftIndex];
  }

  // --- LÓGICA DO ADM (LIBERAR/EXCLUIR PRESENTES) ---

  async releaseGift(giftId) {
    let gifts = [];
    if (this.isFirebaseReady) {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const snap = await getDoc(doc(this.db, "wedding", "gifts"));
      if (snap.exists()) {
        gifts = snap.data().items || [];
      }
    } else {
      gifts = JSON.parse(localStorage.getItem("weddingGifts")) || [];
    }

    const giftIndex = gifts.findIndex(g => g.id === giftId);
    if (giftIndex === -1) return;

    gifts[giftIndex].status = "available";
    gifts[giftIndex].claimedBy = "";
    gifts[giftIndex].claimedPhone = "";

    await this.saveGifts(gifts);
  }
}

// Exporta instância única da base de dados
export const db = new WeddingDatabase();
export { DEFAULT_CONFIG };
