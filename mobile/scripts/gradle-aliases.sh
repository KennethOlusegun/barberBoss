#!/bin/bash
# Funções úteis para build/limpeza/debug Gradle/Android
# Adicione ao seu ~/.bashrc ou ~/.zshrc: source /caminho/para/scripts/gradle-aliases.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}$1${NC}"; }
print_ok() { echo -e "${GREEN}$1${NC}"; }
print_warn() { echo -e "${YELLOW}$1${NC}"; }
print_err() { echo -e "${RED}$1${NC}"; }

# Limpa build do Gradle
gb-clean() {
  print_info "Limpando build do Gradle..."
  ./android/gradlew clean
}

# Para todos os daemons
gb-stop() {
  print_info "Parando todos os daemons Gradle..."
  ./android/gradlew --stop
}

# Mostra status dos daemons
gb-status() {
  print_info "Status dos daemons Gradle:"
  ./android/gradlew --status
}

# Mostra uso de memória
gb-memory() {
  print_info "Uso de memória (Java/Gradle):"
  ps aux | grep -E 'GradleDaemon|java.*gradle' | grep -v grep
}

# Mata processos travados
gb-kill() {
  print_warn "Matando processos Gradle travados..."
  pkill -f 'GradleDaemon' || true
  pkill -f 'java.*gradle' || true
}

# Limpa cache do Gradle
gb-cache-clear() {
  read -p "Limpar cache do Gradle (~/.gradle/caches)? (s/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    rm -rf ~/.gradle/caches
    print_ok "Cache limpo."
  else
    print_info "Cache mantido."
  fi
}

# Build otimizado
gb-build() {
  print_info "Build otimizado com logs detalhados..."
  ./android/gradlew :app:assembleRelease --info --stacktrace
}

# Build com debug detalhado
gb-debug() {
  print_info "Build com debug detalhado..."
  ./android/gradlew :app:assembleRelease --debug --stacktrace
}

# Tenta corrigir problemas comuns
gb-fix() {
  print_info "Rodando fix-gradle-memory.sh..."
  ./scripts/fix-gradle-memory.sh
}

print_info "Funções carregadas. Use gb-<comando> para build/limpeza/debug."
