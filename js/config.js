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
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_AUTH_DOMAIN_AQUI",
  projectId: "SEU_PROJECT_ID_AQUI",
  storageBucket: "SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "SEU_SENDER_ID_AQUI",
  appId: "SEU_APP_ID_AQUI"
};

export const USE_FIREBASE = false;

// Senha padrão de acesso para o painel administrativo (Perfil da Noiva)
export const ADMIN_PASSWORD = "henriqueenathalia";
