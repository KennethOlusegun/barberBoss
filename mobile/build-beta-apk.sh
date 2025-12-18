#!/bin/bash
# Script para build otimizado do APK Beta Barber Boss
# Uso: bash build-beta-apk.sh

set -e

# Limpa build e cache
ionic clean || true
rm -rf android/app/build || true

# Build otimizado Angular/Ionic
ionic build --prod

# Sincroniza com Capacitor
ionic cap sync android

# Gera APK debug (beta)
pushd android
gradlew clean assembleDebug
popd

APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo "\n✅ APK Beta gerado com sucesso: $APK_PATH"
else
  echo "\n❌ Falha ao gerar APK Beta."
  exit 1
fi
