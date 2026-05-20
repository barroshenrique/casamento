// js/config.js

/**
 * CONFIGURAÇÃO CENTRAL DO SITE DE CASAMENTO - HENRIQUE & NATHÁLIA
 * 
 * Se você deseja usar o Firebase para sincronização online em tempo real:
 * 1. Cole as credenciais do seu projeto do Firebase abaixo.
 * 2. Altere o valor de 'USE_FIREBASE' para 'true'.
 * 
 * Se mantiver 'USE_FIREBASE' como 'false', o site rodará no modo Local
 * utilizando o 'localStorage' do navegador (ótimo para testes!).
 */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCCEXq_Fo-S6a5mInV662oeDAyCkSa1pLs",
  authDomain: "casamento-henrique-nathalia.firebaseapp.com",
  projectId: "casamento-henrique-nathalia",
  storageBucket: "casamento-henrique-nathalia.firebasestorage.app",
  messagingSenderId: "946751024592",
  appId: "1:946751024592:web:608d73d703c037ee40ddd5"
};

export const USE_FIREBASE = true;

// Senha padrão de acesso para o painel administrativo (Perfil da Noiva)
export const ADMIN_PASSWORD = "henriqueenathalia";
