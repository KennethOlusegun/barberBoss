#!/bin/bash
# clean-rebuild.sh - Limpeza nuclear do projeto Ionic/Angular/Capacitor
# Autor: GitHub Copilot
# Data: 19/12/2025
# Este script remove caches, builds e dependências para garantir um ambiente limpo.

set -e

# Mensagem de progresso
echo "[1/8] Removendo node_modules, www, dist, .angular, .vite..."
rm -rf node_modules www dist .angular .vite || true

# Mensagem de progresso
echo "[2/8] Removendo pastas de build do Android..."
rm -rf android/app/build android/build android/.gradle || true

# Mensagem de progresso
echo "[3/8] Removendo cache global do Gradle..."
rm -rf ~/.gradle/caches || true

# Mensagem de progresso
echo "[4/8] Removendo package-lock.json e yarn.lock..."
rm -f package-lock.json yarn.lock || true

# Mensagem de progresso
echo "[5/8] Limpando cache do npm..."
npm cache clean --force

# Mensagem de progresso
echo "[6/8] Limpando dados do app no dispositivo Android..."
adb shell pm clear com.barberboss.app || true

# Mensagem de progresso
echo "[7/8] Reinstalando dependências..."
npm install

# Mensagem de progresso
echo "[8/8] Limpeza nuclear concluída!"

echo "Ambiente limpo e dependências reinstaladas. Pronto para rebuild."
