// js/components/countdown.js

let countdownInterval = null;

/**
 * Inicializa a contagem regressiva para a data do casamento.
 * @param {string} targetDateStr - Data alvo no formato ISO (ex: 2026-12-13T17:00:00)
 */
export function initCountdown(targetDateStr) {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  const targetDate = new Date(targetDateStr).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    const daysEl = document.getElementById("countdown-days");
    const hoursEl = document.getElementById("countdown-hours");
    const minsEl = document.getElementById("countdown-mins");
    const secsEl = document.getElementById("countdown-secs");
    const messageEl = document.getElementById("countdown-message");

    // Se os elementos não existirem na página atual, interrompe
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    if (difference <= 0) {
      clearInterval(countdownInterval);
      if (messageEl) messageEl.textContent = "💍 Chegou o Grande Dia! 💍";
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Formata com zero à esquerda se necessário
    daysEl.textContent = days < 10 ? `0${days}` : days;
    hoursEl.textContent = hours < 10 ? `0${hours}` : hours;
    minsEl.textContent = minutes < 10 ? `0${minutes}` : minutes;
    secsEl.textContent = seconds < 10 ? `0${seconds}` : seconds;
  }

  // Executa imediatamente e depois a cada segundo
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}
