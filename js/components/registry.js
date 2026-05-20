// js/components/registry.js
import { db } from '../database.js';

let allGifts = [];
let currentFilter = 'all'; // 'all', 'available', 'reserved'
let activeGiftId = null;

/**
 * Inicializa a Lista de Presentes no site de convidados.
 */
export function initRegistry() {
  const grid = document.getElementById("gift-grid");
  if (!grid) return;

  // Registrar Listeners para os botões de filtro
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderGifts();
    });
  });

  // Registrar submissão do formulário de reserva de presente
  const claimForm = document.getElementById("claim-gift-form");
  if (claimForm) {
    claimForm.addEventListener("submit", handleClaimSubmit);
  }

  // Inscrever para atualizações em tempo real do banco de dados
  db.listenGifts((gifts) => {
    allGifts = gifts;
    renderGifts();
  });
}

function renderGifts() {
  const grid = document.getElementById("gift-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // Filtrar presentes
  const filteredGifts = allGifts.filter(gift => {
    if (currentFilter === 'available') return gift.status === 'available';
    if (currentFilter === 'reserved') return gift.status === 'reserved';
    return true;
  });

  if (filteredGifts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Nenhum presente encontrado nesta categoria.</p>
        <p style="font-size: 0.9rem;">Vocês podem adicionar mais itens no Painel Admin!</p>
      </div>
    `;
    return;
  }

  // Renderizar cada card de presente
  filteredGifts.forEach(gift => {
    const card = document.createElement("div");
    card.className = `gift-card ${gift.status === 'reserved' ? 'reserved' : ''}`;
    
    const formattedPrice = Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    card.innerHTML = `
      <div class="gift-image-wrapper">
        <img class="gift-image" src="${gift.imageUrl || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400'}" alt="${gift.title}" loading="lazy">
        <span class="gift-category-badge">${gift.category || 'Geral'}</span>
        <span class="gift-status-badge">${gift.status === 'reserved' ? 'Reservado' : 'Disponível'}</span>
      </div>
      <div class="gift-info">
        <h3 class="gift-title">${gift.title}</h3>
        ${gift.status === 'reserved' ? '' : `<p class="gift-price">${formattedPrice}</p>`}
        <p class="gift-description">${gift.description || ''}</p>
        ${gift.buyUrl ? `
          <div style="margin-bottom: 0.8rem;">
            <a href="${gift.buyUrl}" target="_blank" class="btn btn-secondary" style="width: 100%; font-size: 0.85rem; padding: 0.5rem 1rem; border-color: var(--primary-accent); color: var(--primary-accent); display: flex; align-items: center; justify-content: center; gap: 0.3rem;">
              <span>🔗</span> Ver na Loja
            </a>
          </div>
        ` : ''}
        <div class="gift-footer">
          ${gift.status === 'reserved' 
            ? `<button class="btn btn-secondary" disabled style="opacity: 0.7; cursor: not-allowed; width: 100%;">
                 🎁 Reservado por ${gift.claimedBy.split(' ')[0]}
               </button>`
            : `<button class="btn btn-primary gift-claim-btn" data-id="${gift.id}" style="width: 100%;">
                 Presentear Henrique & Nathália
               </button>`
          }
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Vincular eventos de clique nos botões de presentear
  const claimButtons = grid.querySelectorAll(".gift-claim-btn");
  claimButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeGiftId = btn.dataset.id;
      openClaimModal();
    });
  });
}

// Controle do Modal de Confirmação de Presente
function openClaimModal() {
  const modalBackdrop = document.getElementById("claim-modal-backdrop");
  const selectedGift = allGifts.find(g => g.id === activeGiftId);
  
  if (!modalBackdrop || !selectedGift) return;

  // Atualiza detalhes no modal
  document.getElementById("modal-gift-name").textContent = selectedGift.title;
  document.getElementById("modal-guest-name").value = "";
  document.getElementById("modal-guest-phone").value = "";

  modalBackdrop.classList.add("active");
  document.body.style.overflow = "hidden"; // Desativa scroll da página
}

export function closeClaimModal() {
  const modalBackdrop = document.getElementById("claim-modal-backdrop");
  if (modalBackdrop) {
    modalBackdrop.classList.remove("active");
    document.body.style.overflow = ""; // Ativa scroll da página
    activeGiftId = null;
  }
}

// Submissão do Formulário do Convidado
async function handleClaimSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("modal-guest-name").value.trim();
  const phone = document.getElementById("modal-guest-phone").value.trim();

  if (!name || !phone) {
    alert("Por favor, preencha o seu Nome e Telefone de contato.");
    return;
  }

  // Validação simples de telefone (pelo menos 10 dígitos)
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    alert("Por favor, insira um número de telefone válido (com DDD).");
    return;
  }

  const submitBtn = e.target.querySelector("button[type='submit']");
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = "Confirmando...";

  try {
    await db.claimGift(activeGiftId, name, phone);
    
    // Sucesso!
    alert(`Obrigado, ${name}! Seu presente foi confirmado com sucesso. Ficamos muito felizes! ♥`);
    closeClaimModal();
  } catch (err) {
    console.error(err);
    alert(err.message || "Ocorreu um erro ao reservar o presente. Tente novamente.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}
