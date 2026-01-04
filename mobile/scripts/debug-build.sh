#!/bin/bash
# Script para diagnosticar problemas de build Android/React Native
# Uso: ./scripts/debug-build.sh [--verbose]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} ${GREEN}$1${NC}"
}
print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}
print_error() {
  echo -e "${RED}❌ $1${NC}"
}
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

VERBOSE=false
if [[ "$1" == "--verbose" ]]; then VERBOSE=true; fi

print_step "Verificando versão do Java..."
JAVA_VER=$(java -version 2>&1 | head -n 1)
echo "$JAVA_VER"
if [[ "$JAVA_VER" =~ "11" || "$JAVA_VER" =~ "17" ]]; then
  print_success "Java 11 ou 17 OK"
else
  print_warning "Java recomendado: 11 ou 17."
fi

print_step "Verificando memória RAM disponível..."
MEM_TOTAL=$(free -m | awk '/^Mem:/ { print $2 }')
echo "RAM total: ${MEM_TOTAL}MB"
if [ "$MEM_TOTAL" -lt 4096 ]; then
  print_warning "RAM < 4GB pode causar falhas no build."
else
  print_success "RAM suficiente."
fi

print_step "Listando processos Gradle/Java..."
ps aux | grep -E 'GradleDaemon|java.*gradle' | grep -v grep || print_step "Nenhum processo Gradle/Java em execução."

print_step "Exibindo gradle.properties (android e global)..."
cat "$(dirname "$0")/../android/gradle.properties" || print_warning "android/gradle.properties não encontrado."
cat "$HOME/.gradle/gradle.properties" || print_warning "~/.gradle/gradle.properties não encontrado."

print_step "Verificando tamanho do bundle JS..."
BUNDLE_SIZE=$(du -sh $(dirname "$0")/../.expo/.webpack-cache | awk '{print $1}')
echo "Tamanho do bundle (webpack-cache): $BUNDLE_SIZE"

print_step "Testando build do bundle separadamente (npx expo export)..."
npx expo export --output-dir /tmp/expo-export-debug || print_warning "Falha ao exportar bundle."

print_step "Status dos daemons Gradle:"
./../android/gradlew --status || print_warning "Não foi possível obter status dos daemons."

print_step "Verificando espaço em disco..."
DISK_AVAIL=$(df -h . | tail -1 | awk '{print $4}')
echo "Espaço disponível: $DISK_AVAIL"

print_step "Diagnóstico finalizado. Veja os avisos acima para possíveis correções."
