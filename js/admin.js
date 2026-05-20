// js/admin.js
import { ADMIN_PASSWORD } from './config.js';
import { db } from './database.js';

// Função auxiliar para converter arquivos de imagem para Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

let weddingConfig = null;
let storyTimeline = [];
let giftRegistry = [];
let activeAdminSection = 'general'; // 'general', 'theme', 'tabs', 'story', 'gifts', 'database'

export function initAdmin() {
  const adminContainer = document.getElementById("admin-container");
  if (!adminContainer) return;

  // Verifica estado de login
  if (sessionStorage.getItem("adminLoggedIn") === "true") {
    renderDashboard();
  } else {
    renderLoginForm();
  }

  // Inscrever para escutar mudanças no banco de dados para manter sincronia
  db.listenConfig((config) => {
    weddingConfig = config;
    if (sessionStorage.getItem("adminLoggedIn") === "true") {
      updateActiveDashboardSection();
    }
  });

  db.listenStory((story) => {
    storyTimeline = story;
    if (sessionStorage.getItem("adminLoggedIn") === "true" && activeAdminSection === 'story') {
      renderStoryManager();
    }
  });

  db.listenGifts((gifts) => {
    giftRegistry = gifts;
    if (sessionStorage.getItem("adminLoggedIn") === "true" && activeAdminSection === 'gifts') {
      renderGiftsManager();
    }
  });
}

// --- RENDERIZADORES DE TELA PRINCIPAL ---

function renderLoginForm() {
  const container = document.getElementById("admin-container");
  container.innerHTML = `
    <div class="admin-login-container">
      <div class="admin-login-icon">💍</div>
      <h2 class="admin-login-title">Área Administrativa</h2>
      <p class="admin-login-subtitle">Acesso exclusivo dos noivos Henrique & Nathália</p>
      
      <form id="admin-login-form">
        <div class="form-group" style="text-align: left;">
          <label class="form-label" for="login-password">Senha de Acesso</label>
          <input class="form-input" type="password" id="login-password" placeholder="Digite a senha..." required autocomplete="current-password">
        </div>
        <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: 1rem;">Entrar no Painel</button>
      </form>
    </div>
  `;

  document.getElementById("admin-login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.getElementById("login-password").value;
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminLoggedIn", "true");
      renderDashboard();
    } else {
      alert("Senha incorreta. Tente novamente! (Dica: verifique a senha padrão no arquivo config.js)");
    }
  });
}

function renderDashboard() {
  const container = document.getElementById("admin-container");
  container.innerHTML = `
    <div class="admin-dashboard">
      <aside class="admin-sidebar">
        <div class="admin-noiva-perfil">
          <div class="admin-noiva-avatar">👑</div>
          <div class="admin-noiva-name">Perfil da Noiva</div>
          <div class="admin-noiva-role">Henrique & Nathália</div>
        </div>
        <nav class="admin-sidebar-menu">
          <button class="admin-sidebar-btn active" data-section="general">📝 Save the Date</button>
          <button class="admin-sidebar-btn" data-section="theme">🎨 Cores & Design</button>
          <button class="admin-sidebar-btn" data-section="tabs">🗂️ Páginas & Abas</button>
          <button class="admin-sidebar-btn" data-section="story">📖 Nossa História</button>
          <button class="admin-sidebar-btn" data-section="gifts">🎁 Presentes Reservados</button>
          <button class="admin-sidebar-btn" data-section="database">⚙️ Configurar Nuvem</button>
          <button class="admin-sidebar-btn admin-logout-btn" id="admin-logout-trigger">🚪 Sair do Painel</button>
        </nav>
      </aside>
      
      <main class="admin-content" id="admin-content-panel">
        <!-- O conteúdo será injetado dinamicamente -->
      </main>
    </div>
  `;

  // Botoes da sidebar
  const sidebarButtons = document.querySelectorAll(".admin-sidebar-btn:not(#admin-logout-trigger)");
  sidebarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      sidebarButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeAdminSection = btn.dataset.section;
      updateActiveDashboardSection();
    });
  });

  // Logout trigger
  document.getElementById("admin-logout-trigger").addEventListener("click", () => {
    sessionStorage.removeItem("adminLoggedIn");
    renderLoginForm();
  });

  updateActiveDashboardSection();
}

function updateActiveDashboardSection() {
  if (!weddingConfig) return;

  const panel = document.getElementById("admin-content-panel");
  if (!panel) return;

  panel.innerHTML = "";

  if (activeAdminSection === 'general') {
    renderGeneralManager();
  } else if (activeAdminSection === 'theme') {
    renderThemeManager();
  } else if (activeAdminSection === 'tabs') {
    renderTabsManager();
  } else if (activeAdminSection === 'story') {
    renderStoryManager();
  } else if (activeAdminSection === 'gifts') {
    renderGiftsManager();
  } else if (activeAdminSection === 'database') {
    renderDatabaseConfigPanel();
  }
}

// --- 1. GERENCIADOR DE SAVE THE DATE (AJUSTES GERAIS) ---

function renderGeneralManager() {
  const panel = document.getElementById("admin-content-panel");
  
  const g = weddingConfig.general;
  const slideUrls = weddingConfig.slideshow || [];

  panel.innerHTML = `
    <div class="admin-section active">
      <div class="admin-section-header">
        <div>
          <h3>Ajustes Gerais e Save the Date</h3>
          <p>Configure as informações principais do casamento que aparecem na tela inicial.</p>
        </div>
      </div>
      
      <form id="admin-general-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div class="form-group">
            <label class="form-label" for="edit-husband">Nome do Noivo</label>
            <input class="form-input" type="text" id="edit-husband" value="${g.husbandName || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-wife">Nome da Noiva</label>
            <input class="form-input" type="text" id="edit-wife" value="${g.wifeName || ''}" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div class="form-group">
            <label class="form-label" for="edit-date">Data & Horário do Casamento</label>
            <input class="form-input" type="datetime-local" id="edit-date" value="${g.weddingDate ? g.weddingDate.substring(0, 16) : ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-city">Cidade / Estado</label>
            <input class="form-input" type="text" id="edit-city" value="${g.locationCity || 'Rio Grande/RS'}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-subtitle">Texto do Save the Date</label>
          <input class="form-input" type="text" id="edit-subtitle" value="${g.saveTheDateSubtitle || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-location">Descrição Completa do Local</label>
          <textarea class="form-input" id="edit-location" rows="3" required style="resize: vertical;">${g.locationText || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-dress">Guia de Vestimenta (Dress Code)</label>
          <input class="form-input" type="text" id="edit-dress" value="${g.dressCodeText || ''}">
        </div>

        <div class="admin-section-header" style="margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 0.8rem;">
          <h4>Galeria do Banner Inicial (Slideshow)</h4>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Cole URLs de fotos do casal (do Unsplash, Imgur, ou redes sociais) para rotacionar no topo da página principal.</p>

        <div class="admin-photo-list" id="slideshow-photo-list">
          <!-- Gerado dinamicamente -->
        </div>

        <button class="btn btn-secondary" type="button" id="add-photo-url-btn" style="margin-bottom: 2rem;">+ Adicionar Nova Foto</button>
        <br>
        <button class="btn btn-primary" type="submit" style="padding: 1rem 3rem;">Salvar Todas as Configurações</button>
      </form>
    </div>
  `;

  // Renderizar as fotos da galeria
  const photoListEl = document.getElementById("slideshow-photo-list");
  
  function renderPhotoInputs() {
    photoListEl.innerHTML = "";
    slideUrls.forEach((url, index) => {
      const item = document.createElement("div");
      item.className = "admin-photo-item";
      item.innerHTML = `
        <div class="admin-photo-preview" style="background-image: url('${url}');"></div>
        <input class="form-input photo-url-input" type="url" value="${url}" placeholder="Cole a URL da foto..." style="flex: 1;">
        <button class="btn btn-secondary delete-photo-btn" type="button" data-index="${index}" style="padding: 0.6rem 1rem; border-color: rgba(255,0,0,0.15); color: #d90429;">Excluir</button>
      `;
      photoListEl.appendChild(item);
    });

    // Eventos de exclusão de fotos
    photoListEl.querySelectorAll(".delete-photo-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        slideUrls.splice(index, 1);
        renderPhotoInputs();
      });
    });

    // Recarregar preview ao perder foco no input
    photoListEl.querySelectorAll(".photo-url-input").forEach((input, index) => {
      input.addEventListener("change", (e) => {
        slideUrls[index] = e.target.value.trim();
        renderPhotoInputs();
      });
    });
  }

  renderPhotoInputs();

  // Adicionar nova URL
  document.getElementById("add-photo-url-btn").addEventListener("click", () => {
    slideUrls.push("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200");
    renderPhotoInputs();
  });

  // Salvar formulário
  document.getElementById("admin-general-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Coleta as fotos atualizadas dos inputs
    const inputs = document.querySelectorAll(".photo-url-input");
    const updatedPhotos = Array.from(inputs).map(inp => inp.value.trim()).filter(val => val !== "");

    const newConfig = {
      ...weddingConfig,
      general: {
        ...weddingConfig.general,
        husbandName: document.getElementById("edit-husband").value.trim(),
        wifeName: document.getElementById("edit-wife").value.trim(),
        weddingDate: document.getElementById("edit-date").value,
        locationCity: document.getElementById("edit-city").value.trim(),
        locationText: document.getElementById("edit-location").value.trim(),
        dressCodeText: document.getElementById("edit-dress").value.trim()
      },
      slideshow: updatedPhotos
    };

    const submitBtn = e.target.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Salvando...";

    try {
      await db.saveConfig(newConfig);
      alert("Informações salvas e publicadas com sucesso! ♥");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar dados.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Salvar Todas as Configurações";
    }
  });
}

// --- 2. GERENCIADOR DE CORES (DESIGN DO TEMA) ---

function renderThemeManager() {
  const panel = document.getElementById("admin-content-panel");
  const currentThemeColor = weddingConfig.theme?.primaryColor || "#c38e70";

  // Lista de cores sugeridas pré-definidas
  const presets = [
    { name: "Ouro Rosé", color: "#c38e70" },
    { name: "Verde Sálvia", color: "#8a9a86" },
    { name: "Marsala Clássico", color: "#722f37" },
    { name: "Azul Serenity", color: "#789ebb" },
    { name: "Terracota Quente", color: "#d9745b" },
    { name: "Lilás Amoroso", color: "#b392ac" }
  ];

  panel.innerHTML = `
    <div class="admin-section active">
      <div class="admin-section-header">
        <div>
          <h3>Cores e Design do Site</h3>
          <p>Escolha a paleta de cores principal do casamento. Isso alterará dinamicamente os detalhes do site.</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Paletas Sugeridas</label>
        <div class="color-picker-grid" id="theme-presets-grid">
          <!-- Gerado dinamicamente -->
        </div>
      </div>

      <div class="form-group" style="margin-top: 2rem;">
        <label class="form-label">Escolher Cor Customizada</label>
        <div class="custom-color-picker-wrapper">
          <div class="custom-color-input-container">
            <input class="custom-color-input" type="color" id="custom-color-element" value="${currentThemeColor}">
            <span style="font-weight: 500;" id="custom-color-hex-label">${currentThemeColor.toUpperCase()}</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
            Use o seletor circular ao lado para escolher qualquer cor. O site ajustará todos os detalhes visuais automaticamente!
          </p>
        </div>
      </div>

      <button class="btn btn-primary" id="save-theme-btn" style="margin-top: 2.5rem; padding: 1rem 3rem;">Salvar Tema do Casamento</button>
    </div>
  `;

  // Render presets
  const presetGrid = document.getElementById("theme-presets-grid");
  presets.forEach(p => {
    const isAct = p.color.toLowerCase() === currentThemeColor.toLowerCase();
    const el = document.createElement("div");
    el.className = `color-palette-preset ${isAct ? 'active' : ''}`;
    el.dataset.color = p.color;
    el.innerHTML = `
      <div class="preset-swatches">
        <div class="preset-swatch" style="background-color: ${p.color};"></div>
        <div class="preset-swatch" style="background-color: #fafafa;"></div>
      </div>
      <div class="preset-name">${p.name}</div>
    `;
    presetGrid.appendChild(el);

    el.addEventListener("click", () => {
      document.querySelectorAll(".color-palette-preset").forEach(b => b.classList.remove("active"));
      el.classList.add("active");
      
      // Atualiza o color picker principal
      const colInput = document.getElementById("custom-color-element");
      colInput.value = p.color;
      document.getElementById("custom-color-hex-label").textContent = p.color.toUpperCase();
      
      // Preview em tempo real na tela!
      document.documentElement.style.setProperty('--primary-accent', p.color);
    });
  });

  const customColorInput = document.getElementById("custom-color-element");
  customColorInput.addEventListener("input", (e) => {
    // Remove borda ativa dos presets já que está escolhendo customizado
    document.querySelectorAll(".color-palette-preset").forEach(b => b.classList.remove("active"));
    const selectedColor = e.target.value;
    document.getElementById("custom-color-hex-label").textContent = selectedColor.toUpperCase();
    
    // Preview em tempo real na tela!
    document.documentElement.style.setProperty('--primary-accent', selectedColor);
  });

  // Salvar Tema
  document.getElementById("save-theme-btn").addEventListener("click", async () => {
    const selectedColor = document.getElementById("custom-color-element").value;

    const newConfig = {
      ...weddingConfig,
      theme: {
        ...weddingConfig.theme,
        primaryColor: selectedColor
      }
    };

    const saveBtn = document.getElementById("save-theme-btn");
    saveBtn.disabled = true;
    saveBtn.innerHTML = "Salvando...";

    try {
      await db.saveConfig(newConfig);
      alert("Visual atualizado! Todos os convidados verão o site na nova cor. ♥");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar tema.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = "Salvar Tema do Casamento";
    }
  });
}

// --- 3. GERENCIADOR DE PÁGINAS E ABAS DO MENU ---

function renderTabsManager() {
  const panel = document.getElementById("admin-content-panel");
  // Clonar para permitir edição em memória e salvar apenas no submit
  const tempNav = JSON.parse(JSON.stringify(weddingConfig.navigation || []));

  function renderList() {
    panel.innerHTML = `
      <div class="admin-section active">
        <div class="admin-section-header">
          <div>
            <h3>Gerenciar Páginas e Abas</h3>
            <p>Personalize as abas do menu do seu site de casamento. Você pode alterar nomes, ativar/desativar exibições, editar conteúdos ou criar novas abas!</p>
          </div>
        </div>

        <div id="tabs-cards-container" style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem;">
          <!-- Cards de abas injetados aqui -->
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="add-custom-tab-btn" type="button" style="border-style: dashed; border-width: 2px;">
            ➕ Criar Nova Página Customizada
          </button>
          <button class="btn btn-primary" id="save-tabs-btn" type="button" style="padding: 1rem 3rem;">
            Salvar Todas as Páginas
          </button>
        </div>
      </div>
    `;

    const cardsContainer = document.getElementById("tabs-cards-container");
    tempNav.forEach((tab, index) => {
      const card = document.createElement("div");
      card.className = "toggle-control";
      card.style.flexDirection = "column";
      card.style.alignItems = "stretch";
      card.style.padding = "2rem";
      card.style.background = "#fdfcf9";
      card.style.border = "1px solid rgba(0, 0, 0, 0.05)";
      card.style.borderRadius = "var(--border-radius-md)";
      card.style.boxShadow = "0 4px 15px rgba(0,0,0,0.01)";

      // Cabeçalho do Card
      const headerDiv = document.createElement("div");
      headerDiv.style.display = "flex";
      headerDiv.style.justifyContent = "space-between";
      headerDiv.style.alignItems = "center";
      headerDiv.style.marginBottom = "1.5rem";
      headerDiv.style.borderBottom = "1px solid rgba(0, 0, 0, 0.05)";
      headerDiv.style.paddingBottom = "1rem";

      const titleAndBadge = document.createElement("div");
      const titleSpan = document.createElement("span");
      titleSpan.style.fontFamily = "var(--font-title)";
      titleSpan.style.fontSize = "1.2rem";
      titleSpan.style.fontWeight = "600";
      titleSpan.style.color = "var(--primary-accent)";
      titleSpan.textContent = tab.title;

      const badge = document.createElement("span");
      badge.style.fontSize = "0.75rem";
      badge.style.padding = "0.2rem 0.6rem";
      badge.style.borderRadius = "12px";
      badge.style.marginLeft = "0.8rem";
      badge.style.fontWeight = "600";

      if (tab.system) {
        badge.textContent = "Sistema";
        badge.style.background = "#e9ecef";
        badge.style.color = "#495057";
      } else {
        badge.textContent = "Personalizada";
        badge.style.background = "var(--primary-rose)";
        badge.style.color = "var(--primary-accent)";
      }

      titleAndBadge.appendChild(titleSpan);
      titleAndBadge.appendChild(badge);

      // Switch de ativação
      const switchLabel = document.createElement("label");
      switchLabel.className = "switch";
      switchLabel.innerHTML = `
        <input type="checkbox" class="tab-active-checkbox" data-index="${index}" ${tab.active ? 'checked' : ''}>
        <span class="slider"></span>
      `;

      headerDiv.appendChild(titleAndBadge);
      headerDiv.appendChild(switchLabel);
      card.appendChild(headerDiv);

      // Campos do formulário
      const fieldsDiv = document.createElement("div");
      fieldsDiv.style.display = "flex";
      fieldsDiv.style.flexDirection = "column";
      fieldsDiv.style.gap = "1rem";

      // Input de Título
      const titleGroup = document.createElement("div");
      titleGroup.className = "form-group";
      titleGroup.style.margin = "0";
      titleGroup.innerHTML = `
        <label class="form-label" style="font-weight: 600;">Título da Aba (Menu)</label>
        <input type="text" class="form-input tab-title-input" data-index="${index}" value="${tab.title}" placeholder="Ex: Informações dos Padrinhos" required>
      `;
      fieldsDiv.appendChild(titleGroup);

      // Textarea para conteúdo rico se suportado (não-nulo)
      if (tab.content !== undefined) {
        const contentGroup = document.createElement("div");
        contentGroup.className = "form-group";
        contentGroup.style.margin = "0";
        contentGroup.innerHTML = `
          <label class="form-label" style="font-weight: 600;">Conteúdo da Página (Suporta HTML simples)</label>
          <textarea class="form-input tab-content-textarea" data-index="${index}" rows="5" style="resize: vertical; font-family: monospace;" placeholder="Escreva aqui as informações da página...">${tab.content}</textarea>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem;">Dica: Use tags HTML como &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt; ou &lt;br&gt; para deixar o layout maravilhoso!</p>
        `;
        fieldsDiv.appendChild(contentGroup);
      }

      // Botão de Excluir (apenas se não for do sistema)
      if (!tab.system) {
        const actionsDiv = document.createElement("div");
        actionsDiv.style.display = "flex";
        actionsDiv.style.justifyContent = "flex-end";
        actionsDiv.style.marginTop = "0.5rem";
        actionsDiv.innerHTML = `
          <button class="btn btn-secondary delete-custom-tab-btn" data-index="${index}" type="button" style="padding: 0.5rem 1rem; border-color: rgba(255,0,0,0.15); color: #d90429; font-size: 0.85rem;">
            🗑️ Excluir Página
          </button>
        `;
        fieldsDiv.appendChild(actionsDiv);
      }

      card.appendChild(fieldsDiv);
      cardsContainer.appendChild(card);
    });

    // Registrar eventos para alterações de títulos em tempo real
    cardsContainer.querySelectorAll(".tab-title-input").forEach(input => {
      input.addEventListener("input", (e) => {
        const index = parseInt(e.target.dataset.index);
        tempNav[index].title = e.target.value;
      });
    });

    // Registrar eventos para alterações de checkboxes de active
    cardsContainer.querySelectorAll(".tab-active-checkbox").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const index = parseInt(e.target.dataset.index);
        tempNav[index].active = e.target.checked;
      });
    });

    // Registrar eventos para alterações de textareas de conteúdo
    cardsContainer.querySelectorAll(".tab-content-textarea").forEach(txt => {
      txt.addEventListener("input", (e) => {
        const index = parseInt(e.target.dataset.index);
        tempNav[index].content = e.target.value;
      });
    });

    // Evento de Excluir Página Customizada
    cardsContainer.querySelectorAll(".delete-custom-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(btn.dataset.index);
        const confirmDelete = confirm(`Tem certeza que deseja excluir permanentemente a página "${tempNav[index].title}"?`);
        if (!confirmDelete) return;

        tempNav.splice(index, 1);
        renderList();
      });
    });

    // Botão de Criar Nova Página
    document.getElementById("add-custom-tab-btn").addEventListener("click", () => {
      const newCustomTab = {
        id: "custom-" + Date.now(),
        title: "Nova Página",
        active: true,
        system: false,
        content: "<h3>Título da Nova Página</h3><p>Escreva o conteúdo da sua nova página aqui...</p>"
      };
      tempNav.push(newCustomTab);
      renderList();
    });

    // Botão de Salvar Tudo
    document.getElementById("save-tabs-btn").addEventListener("click", async () => {
      // Validação rápida de títulos vazios
      const hasEmptyTitle = tempNav.some(t => !t.title.trim());
      if (hasEmptyTitle) {
        alert("Erro: Todos os títulos de páginas precisam estar preenchidos.");
        return;
      }

      const newConfig = {
        ...weddingConfig,
        navigation: tempNav
      };

      const saveBtn = document.getElementById("save-tabs-btn");
      saveBtn.disabled = true;
      saveBtn.innerHTML = "Salvando...";

      try {
        await db.saveConfig(newConfig);
        alert("Abas e páginas salvas com sucesso! A estrutura do menu superior foi publicada para todos os convidados. 🗂️");
      } catch (err) {
        console.error(err);
        alert("Erro ao salvar abas.");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "Salvar Todas as Páginas";
      }
    });
  }

  renderList();
}

// --- 4. GERENCIADOR DA LINHA DO TEMPO (HISTÓRIA DO CASAL) ---

function renderStoryManager() {
  const panel = document.getElementById("admin-content-panel");
  panel.innerHTML = `
    <div class="admin-section active">
      <div class="admin-section-header">
        <div>
          <h3>História do Casal</h3>
          <p>Gerencie a linha do tempo adicionando marcos e anos importantes na vida de vocês.</p>
        </div>
      </div>

      <div id="story-milestones-list" style="margin-bottom: 3rem;">
        <!-- Lista de marcos atuais -->
      </div>

      <div class="admin-section-header" style="margin-bottom: 1.5rem; padding-bottom: 0.8rem;">
        <h4>+ Adicionar Novo Marco na História</h4>
      </div>

      <form id="add-milestone-form">
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label" for="new-mile-year">Ano</label>
            <input class="form-input" type="text" id="new-mile-year" placeholder="Ex: 2024" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-mile-title">Título do Marco</label>
            <input class="form-input" type="text" id="new-mile-title" placeholder="Ex: O Dia do Pedido" required>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div class="form-group">
            <label class="form-label" for="new-mile-file">Fazer Upload de Foto (Local)</label>
            <input class="form-input" type="file" id="new-mile-file" accept="image/*">
          </div>
          <div class="form-group">
            <label class="form-label" for="new-mile-url">Ou Cole Link da Foto (URL)</label>
            <input class="form-input" type="url" id="new-mile-url" placeholder="Ex: https://site.com/foto.jpg">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="new-mile-desc">Descrição do Acontecimento</label>
          <textarea class="form-input" id="new-mile-desc" rows="3" placeholder="Escreva como foi especial esse momento..." required style="resize: vertical;"></textarea>
        </div>
        <button class="btn btn-primary" type="submit">Adicionar à História</button>
      </form>
    </div>
  `;

  const milestonesList = document.getElementById("story-milestones-list");
  
  function renderMilestones() {
    milestonesList.innerHTML = "";
    if (storyTimeline.length === 0) {
      milestonesList.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Ainda não há marcos cadastrados. Adicione o primeiro no formulário abaixo!</p>`;
      return;
    }

    // Ordena por ano
    const sortedStory = [...storyTimeline].sort((a,b) => parseInt(a.year) - parseInt(b.year));

    sortedStory.forEach((mile) => {
      const item = document.createElement("div");
      item.className = "admin-photo-item";
      item.style.justifyContent = "space-between";
      
      const hasPhoto = mile.imageUrl ? true : false;
      const previewHtml = hasPhoto 
        ? `<div class="admin-photo-preview" style="background-image: url('${mile.imageUrl}'); margin-right: 1rem;"></div>` 
        : `<div class="admin-photo-preview" style="background-color: #eee; display: flex; align-items: center; justify-content: center; margin-right: 1rem; font-size: 1.2rem;">📖</div>`;

      item.innerHTML = `
        <div style="display: flex; align-items: center; flex: 1; margin-right: 2rem;">
          ${previewHtml}
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-family: var(--font-title); font-size: 1.1rem; color: var(--primary-accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${mile.year} - ${mile.title}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">
              ${mile.description}
            </div>
          </div>
        </div>
        <button class="btn btn-secondary delete-mile-btn" data-id="${mile.id}" style="padding: 0.5rem 1rem; border-color: rgba(255,0,0,0.15); color: #d90429; flex-shrink: 0;">Excluir</button>
      `;
      milestonesList.appendChild(item);
    });

    // Registrar deletes
    milestonesList.querySelectorAll(".delete-mile-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const confirmDelete = confirm("Tem certeza que deseja excluir esse marco da história?");
        if (!confirmDelete) return;

        const idToDelete = btn.dataset.id;
        const updatedStory = storyTimeline.filter(s => s.id !== idToDelete);
        
        try {
          await db.saveStory(updatedStory);
          storyTimeline = updatedStory;
          renderMilestones();
        } catch (err) {
          alert("Erro ao excluir marco.");
        }
      });
    });
  }

  renderMilestones();

  // Submit Add Milestone
  document.getElementById("add-milestone-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const year = document.getElementById("new-mile-year").value.trim();
    const title = document.getElementById("new-mile-title").value.trim();
    const description = document.getElementById("new-mile-desc").value.trim();
    const urlInput = document.getElementById("new-mile-url").value.trim();
    const fileInput = document.getElementById("new-mile-file").files[0];

    let imageUrl = urlInput || "";

    const btn = e.target.querySelector("button[type='submit']");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Processando Imagem...";

    try {
      if (fileInput) {
        imageUrl = await fileToBase64(fileInput);
      }

      const newMilestone = {
        id: "mile-" + Date.now(),
        year,
        title,
        description,
        imageUrl
      };

      const updatedStory = [...storyTimeline, newMilestone];

      await db.saveStory(updatedStory);
      storyTimeline = updatedStory;
      renderMilestones();
      
      // Limpa form
      document.getElementById("new-mile-year").value = "";
      document.getElementById("new-mile-title").value = "";
      document.getElementById("new-mile-desc").value = "";
      document.getElementById("new-mile-url").value = "";
      document.getElementById("new-mile-file").value = "";
      alert("Marco adicionado com sucesso! ♥");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar marco.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

// --- 5. GERENCIADOR DOS PRESENTES E RESERVAS ---

function renderGiftsManager() {
  const panel = document.getElementById("admin-content-panel");
  panel.innerHTML = `
    <div class="admin-section active">
      <div class="admin-section-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3>Controle de Presentes e Reservas</h3>
          <p>Veja em tempo real quem confirmou cada presente ou gerencie o catálogo de itens.</p>
        </div>
        <button class="btn btn-secondary" id="export-gifts-csv-btn" style="background-color: var(--sage-green); color: white; border: none; font-size: 0.9rem; font-weight: 500; border-radius: var(--border-radius-md); padding: 0.6rem 1.2rem; cursor: pointer; transition: all var(--transition-fast);">
          📥 Baixar Planilha de Reservas (CSV)
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Presente</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Convidado Residente</th>
              <th>Telefone</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody id="admin-gifts-table-body">
            <!-- Injetado dinamicamente -->
          </tbody>
        </table>
      </div>

      <div class="admin-section-header" style="margin-top: 4rem; margin-bottom: 1.5rem; padding-bottom: 0.8rem;">
        <h4>+ Cadastrar Novo Item de Presente</h4>
      </div>

      <form id="add-gift-item-form">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
          <div class="form-group">
            <label class="form-label" for="new-gift-title">Nome do Presente</label>
            <input class="form-input" type="text" id="new-gift-title" placeholder="Ex: Microondas Retrô 20L" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-gift-price">Preço Sugerido (R$)</label>
            <input class="form-input" type="number" id="new-gift-price" placeholder="Ex: 350" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div class="form-group">
            <label class="form-label" for="new-gift-cat">Categoria</label>
            <select class="form-input" id="new-gift-cat">
              <option value="Cozinha">Cozinha</option>
              <option value="Eletrodomésticos">Eletrodomésticos</option>
              <option value="Cama & Banho">Cama & Banho</option>
              <option value="Sala & Varanda">Sala & Varanda</option>
              <option value="Lua de Mel (Cotas)">Lua de Mel (Cotas)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-gift-buy-url">Link para Comprar na Loja (URL Opcional)</label>
            <input class="form-input" type="url" id="new-gift-buy-url" placeholder="Ex: https://magazinevoce.com.br/produto">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div class="form-group">
            <label class="form-label" for="new-gift-file">Fazer Upload de Foto do Presente (Local)</label>
            <input class="form-input" type="file" id="new-gift-file" accept="image/*">
          </div>
          <div class="form-group">
            <label class="form-label" for="new-gift-image">Ou Cole Link da Foto (URL)</label>
            <input class="form-input" type="url" id="new-gift-image" placeholder="Ex: https://link-da-imagem.com/foto.jpg">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="new-gift-desc">Descrição / Mensagem Adicional (Opcional)</label>
          <input class="form-input" type="text" id="new-gift-desc" placeholder="Ex: 'Na cor preta' ou 'Para nos ajudar em nosso enxoval'">
        </div>

        <button class="btn btn-primary" type="submit">Cadastrar Presente</button>
      </form>
    </div>
  `;

  const tbody = document.getElementById("admin-gifts-table-body");

  function renderTableItems() {
    tbody.innerHTML = "";
    if (giftRegistry.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Nenhum presente cadastrado no catálogo.</td></tr>`;
      return;
    }

    giftRegistry.forEach(gift => {
      const tr = document.createElement("tr");
      const priceFmt = Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      const isReserved = gift.status === 'reserved';
      const statusClass = isReserved ? 'reserved' : 'available';
      const statusText = isReserved ? 'Reservado' : 'Disponível';

      const previewHtml = gift.imageUrl
        ? `<div class="admin-photo-preview" style="background-image: url('${gift.imageUrl}'); margin-right: 0.8rem; width: 45px; height: 45px; border-radius: var(--border-radius-sm); background-size: cover; background-position: center; flex-shrink: 0;"></div>`
        : `<div class="admin-photo-preview" style="background-color: #eee; display: flex; align-items: center; justify-content: center; margin-right: 0.8rem; width: 45px; height: 45px; border-radius: var(--border-radius-sm); font-size: 1.2rem; flex-shrink: 0;">🎁</div>`;

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center;">
            ${previewHtml}
            <div style="font-weight: 500; color: var(--dark-charcoal);">${gift.title}</div>
          </div>
        </td>
        <td>${priceFmt}</td>
        <td><span class="admin-badge-status ${statusClass}">${statusText}</span></td>
        <td>${isReserved ? gift.claimedBy : '-'}</td>
        <td>${isReserved ? gift.claimedPhone : '-'}</td>
        <td style="text-align: right; white-space: nowrap;">
          ${isReserved 
            ? `<button class="btn btn-secondary release-gift-btn" data-id="${gift.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-color: rgba(212, 163, 115, 0.4);">Liberar Reserva</button>`
            : ''
          }
          <button class="btn btn-secondary delete-gift-btn" data-id="${gift.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; margin-left: 0.5rem; border-color: rgba(255,0,0,0.15); color: #d90429;">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Eventos de Liberar Reserva
    tbody.querySelectorAll(".release-gift-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const confirmRelease = confirm("Tem certeza que deseja cancelar esta reserva? O presente voltará a ficar Disponível para outros convidados.");
        if (!confirmRelease) return;

        try {
          await db.releaseGift(btn.dataset.id);
          // O listener global re-renderizará a tabela automaticamente
        } catch (err) {
          alert("Erro ao liberar reserva.");
        }
      });
    });

    // Eventos de Deletar Presente do Catálogo
    tbody.querySelectorAll(".delete-gift-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const confirmDel = confirm("Tem certeza que deseja excluir permanentemente este presente do catálogo?");
        if (!confirmDel) return;

        const idToDel = btn.dataset.id;
        const updatedGifts = giftRegistry.filter(g => g.id !== idToDel);

        try {
          await db.saveGifts(updatedGifts);
        } catch (err) {
          alert("Erro ao excluir presente.");
        }
      });
    });
  }

  renderTableItems();

  // Exportar para Planilha Excel (CSV)
  const exportBtn = document.getElementById("export-gifts-csv-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (giftRegistry.length === 0) {
        alert("Nenhum presente cadastrado para exportar.");
        return;
      }

      // Cabeçalho da planilha em português
      const headers = ["Presente", "Preco Sugerido", "Categoria", "Status", "Reservado Por", "Telefone Convidado", "Link de Compra"];
      
      const rows = giftRegistry.map(gift => [
        gift.title,
        Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        gift.category || "Geral",
        gift.status === 'reserved' ? "Reservado" : "Disponivel",
        gift.status === 'reserved' ? gift.claimedBy : "",
        gift.status === 'reserved' ? gift.claimedPhone : "",
        gift.buyUrl || ""
      ]);

      // Converte para formato CSV com delimitador ; e aspas duplas
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
        .join("\r\n");

      // Adiciona o BOM UTF-8 (\uFEFF) para garantir que caracteres especiais (acentos, ç, etc.) abram perfeitamente no Excel
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `controle_presentes_casamento_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Cadastrar Novo Presente
  document.getElementById("add-gift-item-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("new-gift-title").value.trim();
    const price = parseFloat(document.getElementById("new-gift-price").value);
    const category = document.getElementById("new-gift-cat").value;
    const buyUrl = document.getElementById("new-gift-buy-url").value.trim();
    const urlInput = document.getElementById("new-gift-image").value.trim();
    const fileInput = document.getElementById("new-gift-file").files[0];
    const description = document.getElementById("new-gift-desc").value.trim();

    let imageUrl = urlInput || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400";

    const btn = e.target.querySelector("button[type='submit']");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Processando Imagem...";

    try {
      if (fileInput) {
        imageUrl = await fileToBase64(fileInput);
      }

      const newGift = {
        id: "gift-" + Date.now(),
        title,
        price,
        category,
        imageUrl,
        buyUrl,
        description,
        status: "available",
        claimedBy: "",
        claimedPhone: ""
      };

      const updatedGifts = [...giftRegistry, newGift];

      await db.saveGifts(updatedGifts);
      
      // Limpa Form
      document.getElementById("new-gift-title").value = "";
      document.getElementById("new-gift-price").value = "";
      document.getElementById("new-gift-buy-url").value = "";
      document.getElementById("new-gift-image").value = "";
      document.getElementById("new-gift-file").value = "";
      document.getElementById("new-gift-desc").value = "";
      alert("Presente cadastrado com sucesso e adicionado à lista! ♥");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar presente.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

// --- 6. PAINEL DE CONFIGURAÇÃO DE DATABASE (FIREBASE) ---

function renderDatabaseConfigPanel() {
  const panel = document.getElementById("admin-content-panel");
  const isCloud = db.isFirebaseReady;

  panel.innerHTML = `
    <div class="admin-section active">
      <div class="admin-section-header">
        <div>
          <h3>Sincronização na Nuvem (Firebase)</h3>
          <p>Conecte o seu site a um banco de dados online seguro em tempo real gratuitamente.</p>
        </div>
      </div>

      ${isCloud 
        ? `
          <div class="db-status-banner firebase">
            <span class="db-status-icon">🟢</span>
            <div>
              <strong>Modo Sincronizado Online Ativo!</strong><br>
              Seus presentes, cores, abas e histórias estão salvos na nuvem do Firebase e atualizam em tempo real entre todos os celulares de convidados do casamento.
            </div>
          </div>
        `
        : `
          <div class="db-status-banner local">
            <span class="db-status-icon">🟡</span>
            <div>
              <strong>Modo Local (LocalStorage) Ativo</strong><br>
              O site está salvando as alterações apenas no navegador deste computador. Para os convidados verem as mudanças e reservarem presentes de outros dispositivos, configure o Firebase.
            </div>
          </div>
        `
      }

      <div style="background-color: #fcfbf8; border: 1px solid rgba(0,0,0,0.05); padding: 2rem; border-radius: var(--border-radius-lg); line-height: 1.6;">
        <h4 style="font-family: var(--font-title); font-size: 1.15rem; color: var(--primary-accent); margin-bottom: 1rem;">O que é e como funciona a Sincronização Online?</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
          Como o site está hospedado no GitHub Pages (que é grátis), ele não possui um servidor próprio. Para que as informações de quem deu qual presente sejam sincronizadas instantaneamente, nós integramos a plataforma de banco de dados do <strong>Firebase (do Google)</strong>.
        </p>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Para ativar, você só precisa de 3 minutos para criar o seu projeto Firebase grátis, copiar as credenciais de API fornecidas por eles, e colá-las no arquivo de configuração do seu site no computador:
        </p>
        
        <div style="background-color: #fafafa; border-radius: var(--border-radius-sm); padding: 1.2rem; border: 1px solid rgba(0,0,0,0.03); margin-bottom: 1.5rem; font-family: monospace; font-size: 0.85rem; color: var(--dark-charcoal);">
          Arquivo: <strong style="color: var(--primary-accent);">js/config.js</strong><br>
          Insira suas chaves no bloco 'FIREBASE_CONFIG' e configure 'USE_FIREBASE = true;'.
        </div>

        <h5 style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">Passo a Passo Rápido:</h5>
        <ol style="font-size: 0.85rem; color: var(--text-muted); padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <li>Abra o tutorial explicativo detalhado <a href="file:///C:/Users/Henrique/Documents/antigravity/wise-pythagoras/COMO_HOSPEDAR.md" target="_blank" style="color: var(--primary-accent); font-weight: 500;">COMO_HOSPEDAR.md</a> na pasta raiz do projeto.</li>
          <li>Siga a <strong>Parte 2</strong> do tutorial para obter as chaves gratuitas do Firestore.</li>
          <li>Cole no arquivo <code>js/config.js</code> no seu computador e suba o arquivo atualizado no seu repositório do GitHub.</li>
        </ol>
      </div>
    </div>
  `;
}
export { activeAdminSection };
export default initAdmin;
