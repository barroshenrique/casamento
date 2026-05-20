// js/app.js
import { db } from './database.js';
import { initSlideshow } from './components/slideshow.js';
import { initCountdown } from './components/countdown.js';
import { initRegistry, closeClaimModal } from './components/registry.js';
import { initAdmin } from './admin.js';

let currentConfig = null;

document.addEventListener("DOMContentLoaded", () => {
  // Inicialização Geral
  initializeAppLogic();
});

async function initializeAppLogic() {
  // 1. Escuta alterações na configuração global (sincronização em tempo real)
  db.listenConfig((config) => {
    currentConfig = config;
    applyThemeAndDetails();
    renderDynamicNavigation();
    
    // Inicializa ou re-inicializa os componentes com base nas novas configurações
    if (config.general) {
      initCountdown(config.general.weddingDate);
      initSlideshow(config.slideshow);
    }
  });

  // 2. Inicializa os componentes dinâmicos
  initRegistry();
  initAdmin();

  // 3. Inicializa Linha do Tempo da História
  db.listenStory((story) => {
    renderStoryTimeline(story);
  });

  // 4. Configura roteador de abas (#hash)
  window.addEventListener("hashchange", handleRouting);
  
  // 5. Configura menu mobile
  setupMobileMenu();

  // 6. Configura comportamento de scroll do header
  setupHeaderScroll();

  // 7. Vincula fechamento do modal de presentes
  const closeBtn = document.getElementById("modal-close-trigger");
  const modalBackdrop = document.getElementById("claim-modal-backdrop");
  if (closeBtn) closeBtn.addEventListener("click", closeClaimModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeClaimModal();
    });
  }
}

// --- APLICADOR DE ESTILO E DESIGN ---

function applyThemeAndDetails() {
  if (!currentConfig) return;

  const t = currentConfig.theme;
  const g = currentConfig.general;

  // 1. Aplica cor dinâmica de destaque no CSS (:root)
  if (t && t.primaryColor) {
    document.documentElement.style.setProperty('--primary-accent', t.primaryColor);
    
    // Calcula variações de cores harmônicas baseadas no hex para botões secundários ou gradientes
    const hex = t.primaryColor;
    const r = parseInt(hex.slice(1, 3), 16);
    const gVal = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    document.documentElement.style.setProperty('--primary-rose', `rgba(${r}, ${gVal}, ${b}, 0.2)`);
    document.documentElement.style.setProperty('--primary-rose-dark', `rgba(${r}, ${gVal}, ${b}, 0.8)`);
  }

  // 2. Aplica textos dinâmicos do Save the Date
  if (g) {
    // Títulos da navbar e rodapé
    const namesText = `${g.husbandName} & ${g.wifeName}`;
    document.querySelectorAll(".couple-names-label").forEach(el => {
      el.textContent = namesText;
    });

    // Subtítulo e data do Save the Date
    const stdTitle = document.getElementById("std-title");
    const stdSub = document.getElementById("std-subtitle");
    const stdDetails = document.getElementById("std-details-text");

    if (stdTitle) stdTitle.textContent = namesText;
    if (stdSub) stdSub.textContent = g.saveTheDateSubtitle || "Salvem a Data";
    
    // Formata a data para escrita em português
    if (g.weddingDate) {
      const wDate = new Date(g.weddingDate);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = wDate.toLocaleDateString('pt-BR', options);
      
      if (stdDetails) {
        stdDetails.textContent = `${formattedDate} • ${g.locationCity}`;
      }
      
      // Rodapé
      const footerDate = document.getElementById("footer-date-label");
      if (footerDate) footerDate.textContent = formattedDate;
    }

    // Texto de Informações do Local
    const infoLocationText = document.getElementById("info-location-description");
    if (infoLocationText) infoLocationText.textContent = g.locationText;

    // Texto de Dress Code
    const dressCodeText = document.getElementById("info-dress-description");
    if (dressCodeText) dressCodeText.textContent = g.dressCodeText || "Traje sugerido: Esporte Fino.";
  }
}

// --- RENDERIZADORES DE NAVEGAÇÃO E ABAS ---

function renderDynamicNavigation() {
  if (!currentConfig) return;

  const navMenu = document.getElementById("nav-menu-list");
  if (!navMenu) return;

  // Guarda hash atual
  const currentHash = window.location.hash || "#inicio";

  // Limpa o menu
  navMenu.innerHTML = "";

  // Filtra as abas ativas
  const activeTabs = (currentConfig.navigation || []).filter(item => item.active);

  activeTabs.forEach(tab => {
    const li = document.createElement("li");
    const isAct = currentHash === `#${tab.id}`;
    
    li.innerHTML = `
      <a href="#${tab.id}" class="nav-link ${isAct ? 'active' : ''}" data-tab="${tab.id}">
        ${tab.title}
      </a>
    `;
    navMenu.appendChild(li);
  });

  // Garante a aba Admin no menu (sempre disponível para os noivos)
  const adminLi = document.createElement("li");
  const isAdmAct = currentHash === "#admin";
  adminLi.innerHTML = `
    <a href="#admin" class="nav-link ${isAdmAct ? 'active' : ''}" data-tab="admin" style="border: 1px dashed var(--primary-accent); padding: 0.4rem 0.8rem;">
      🔐 Perfil da Noiva
    </a>
  `;
  navMenu.appendChild(adminLi);

  // Vincula cliques no menu para fechar o menu mobile
  navMenu.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("nav-menu-list").classList.remove("open");
      document.getElementById("mobile-menu-btn-icon").innerHTML = "&#9776;"; // Menu icon
    });
  });

  // Atualiza as seções visíveis na tela
  renderDynamicTabContents();
  handleRouting();
}

function renderDynamicTabContents() {
  if (!currentConfig) return;

  const mainEl = document.querySelector("main");
  if (!mainEl) return;

  // 1. Remove seções dinâmicas de renders anteriores para evitar duplicados
  document.querySelectorAll(".dynamic-custom-section").forEach(sec => sec.remove());

  // 2. Loop por todos os itens de navegação
  (currentConfig.navigation || []).forEach(tab => {
    // Apenas abas que contêm conteúdo cadastrável
    if (tab.content !== undefined) {
      if (tab.active) {
        // Verifica se a seção já existe no HTML estático (como section-cha-panela ou section-padrinhos)
        let section = document.getElementById(`section-${tab.id}`);
        
        // Se for uma nova aba criada dinamicamente, cria o container dela
        if (!section) {
          section = document.createElement("section");
          section.id = `section-${tab.id}`;
          section.className = "tab-content section-padding dynamic-custom-section";
          
          // Insere a nova seção antes do painel do admin
          const adminSection = document.getElementById("section-admin");
          if (adminSection) {
            mainEl.insertBefore(section, adminSection);
          } else {
            mainEl.appendChild(section);
          }
        }
        
        // Define o emoji do ícone dinamicamente para ficar charmoso
        let icon = "✨";
        if (tab.id.includes("cha")) icon = "🍳";
        else if (tab.id.includes("padrinho")) icon = "🤵👰";
        else if (tab.id.includes("hospedagem") || tab.id.includes("hotel")) icon = "🏨";
        else if (tab.id.includes("dica")) icon = "💡";

        // Renderiza o conteúdo rico
        section.innerHTML = `
          <div class="section-container">
            <div class="info-card animate-fadeIn" style="max-width: 800px; margin: 0 auto; text-align: left;">
              <div class="info-icon" style="text-align: center;">${icon}</div>
              <div class="rich-content-rendered">${tab.content || ''}</div>
            </div>
          </div>
        `;
      } else {
        // Se a aba estática do HTML foi desativada, limpa seu conteúdo
        const section = document.getElementById(`section-${tab.id}`);
        if (section && !section.classList.contains("dynamic-custom-section")) {
          section.innerHTML = "";
        }
      }
    }
  });
}

// --- RENDERIZADOR DA TIMELINE ---

function renderStoryTimeline(story) {
  const timelineEl = document.getElementById("story-timeline-container");
  if (!timelineEl) return;

  timelineEl.innerHTML = "";

  if (!story || story.length === 0) {
    timelineEl.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 3rem;">A nossa história está sendo escrita! Acesse o painel para cadastrar os momentos mais marcantes. ♥</p>`;
    return;
  }

  // Ordena cronologicamente por ano
  const sortedStory = [...story].sort((a, b) => parseInt(a.year) - parseInt(b.year));

  sortedStory.forEach((mile, index) => {
    const isLeft = index % 2 === 0;
    const item = document.createElement("div");
    item.className = `timeline-item ${isLeft ? 'timeline-item-left' : 'timeline-item-right'} animate-fadeIn`;
    
    const hasPhoto = mile.imageUrl ? true : false;
    
    item.innerHTML = `
      <div class="timeline-card ${hasPhoto ? 'has-photo' : ''}">
        ${hasPhoto ? `<div class="timeline-card-image" style="background-image: url('${mile.imageUrl}');"></div>` : ''}
        <div class="${hasPhoto ? 'timeline-card-content' : ''}">
          <div class="timeline-year">${mile.year}</div>
          <h3>${mile.title}</h3>
          <p>${mile.description}</p>
        </div>
      </div>
    `;
    
    timelineEl.appendChild(item);
  });
}

// --- SISTEMA DE ROTEAMENTO CLIENT-SIDE ---

function handleRouting() {
  const hash = window.location.hash || "#inicio";
  const sections = document.querySelectorAll(".tab-content");
  const navLinks = document.querySelectorAll(".nav-link");

  // Oculta todas as seções
  sections.forEach(sec => sec.classList.remove("active"));

  // Ativa a seção do hash correspondente
  const targetSectionId = `section-${hash.replace("#", "")}`;
  const targetSection = document.getElementById(targetSectionId);
  
  if (targetSection) {
    targetSection.classList.add("active");
  } else {
    // Fallback caso o hash seja inválido
    const fallback = document.getElementById("section-inicio");
    if (fallback) fallback.classList.add("active");
  }

  // Atualiza classe ativa no menu
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === hash) {
      link.classList.add("active");
    }
  });

  // Se for a home, o header é transparente no topo. Se for outra página, fica colorido.
  const header = document.querySelector("header");
  if (header) {
    if (hash === "#inicio") {
      header.classList.remove("scrolled");
      setupHeaderScroll(); // Reactiva scroll handler
    } else {
      header.classList.add("scrolled");
      // Desativa comportamento do scroll temporariamente para manter cor sólida
      window.removeEventListener("scroll", checkHeaderScroll);
    }
  }

  // Scroll automático para o topo ao trocar de aba
  window.scrollTo(0, 0);
}

// --- AJUSTES COMPORTAMENTAIS ---

function setupMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("nav-menu-list");
  const icon = document.getElementById("mobile-menu-btn-icon");

  if (btn && menu && icon) {
    btn.addEventListener("click", () => {
      menu.classList.toggle("open");
      if (menu.classList.contains("open")) {
        icon.innerHTML = "&times;"; // Close icon
      } else {
        icon.innerHTML = "&#9776;"; // Menu icon
      }
    });
  }
}

function checkHeaderScroll() {
  const header = document.querySelector("header");
  if (!header) return;

  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    // Só remove scrolled se estiver na página inicial
    const hash = window.location.hash || "#inicio";
    if (hash === "#inicio") {
      header.classList.remove("scrolled");
    }
  }
}

function setupHeaderScroll() {
  window.addEventListener("scroll", checkHeaderScroll);
  checkHeaderScroll(); // Executa imediato
}
export { currentConfig };
export default initializeAppLogic;
