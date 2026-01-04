#!/bin/bash
# Script para validar ambiente de build Android/React Native
# Uso: ./scripts/validate-build-setup.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_ok() { echo -e "${GREEN}✓ $1${NC}"; }
print_fail() { echo -e "${RED}✗ $1${NC}"; }
print_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

STATUS=0

# Node.js
if command -v node &>/dev/null; then
  NODE_VER=$(node -v)
  print_ok "Node.js instalado ($NODE_VER)"
else
  print_fail "Node.js não instalado"
  STATUS=1
fi

# Java
if command -v java &>/dev/null; then
  JAVA_VER=$(java -version 2>&1 | head -n 1)
  if [[ "$JAVA_VER" =~ "11" || "$JAVA_VER" =~ "17" ]]; then
    print_ok "Java instalado ($JAVA_VER)"
  else
    print_warn "Java recomendado: 11 ou 17 ($JAVA_VER)"
  fi
else
  print_fail "Java não instalado"
  STATUS=1
fi

# Android SDK
if [ -d "$ANDROID_HOME" ] || [ -d "$ANDROID_SDK_ROOT" ]; then
  print_ok "Android SDK configurado"
else
  print_fail "Android SDK não configurado (verifique ANDROID_HOME/ANDROID_SDK_ROOT)"
  STATUS=1
fi

# Gradle memória
GRADLE_PROPS="$(dirname "$0")/../android/gradle.properties"
if grep -q 'org.gradle.jvmargs=-Xmx4096m' "$GRADLE_PROPS"; then
  print_ok "Gradle configurado com memória suficiente"
else
  print_warn "org.gradle.jvmargs não está otimizado em gradle.properties"
  STATUS=1
fi

# Keystore
KEYSTORE="$(dirname "$0")/../android/app/barberboss-release-key.keystore"
if [ -f "$KEYSTORE" ]; then
  print_ok "Keystore existe"
else
  print_warn "Keystore não encontrado"
  STATUS=1
fi

# gradle.properties senhas
if grep -q 'MYAPP_UPLOAD_' "$GRADLE_PROPS"; then
  print_ok "Senhas de assinatura presentes em gradle.properties"
else
  print_warn "Senhas de assinatura não encontradas em gradle.properties"
fi

# Espaço em disco
DISK_AVAIL=$(df -m . | tail -1 | awk '{print $4}')
if [ "$DISK_AVAIL" -gt 5000 ]; then
  print_ok "Espaço em disco suficiente (${DISK_AVAIL}MB)"
else
  print_fail "Espaço em disco insuficiente (${DISK_AVAIL}MB)"
  STATUS=1
fi

# RAM
MEM_TOTAL=$(free -m | awk '/^Mem:/ { print $2 }')
if [ "$MEM_TOTAL" -gt 4000 ]; then
  print_ok "RAM disponível suficiente (${MEM_TOTAL}MB)"
else
  print_fail "RAM insuficiente (${MEM_TOTAL}MB)"
  STATUS=1
fi

# Daemons travados
if pgrep -f 'GradleDaemon|java.*gradle' > /dev/null; then
  print_warn "Daemons Gradle/Java em execução. Considere rodar ./gradlew --stop."
else
  print_ok "Nenhum daemon Gradle travado"
fi

# dexOptions
if grep -q 'dexOptions' "$(dirname "$0")/../android/app/build.gradle"; then
  print_ok "dexOptions configurado em build.gradle"
else
  print_warn "dexOptions não encontrado em build.gradle"
  STATUS=1
fi

# Plugin withCleartextTraffic
if [ -f "$(dirname "$0")/../plugins/withCleartextTraffic.js" ]; then
  print_ok "Plugin withCleartextTraffic configurado"
else
  print_warn "Plugin withCleartextTraffic não encontrado"
fi

# network_security_config.xml
if [ -f "$(dirname "$0")/../android/app/src/main/res/xml/network_security_config.xml" ]; then
  print_ok "network_security_config.xml existe"
else
  print_warn "network_security_config.xml não encontrado"
fi

if [ $STATUS -eq 0 ]; then
  echo -e "\n${GREEN}Ambiente pronto para build!${NC}"
else
  echo -e "\n${RED}Problemas encontrados. Veja avisos acima.${NC}"
fi
