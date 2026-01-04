#!/bin/bash
# Script para corrigir configurações de memória do Gradle e matar processos travados
# Uso: ./scripts/fix-gradle-memory.sh [--dry-run]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  print_warning "Modo dry-run: nenhuma alteração será feita."
fi

# 1. Verifica android/gradle.properties
GRADLE_PROPS="$(dirname "$0")/../android/gradle.properties"
GRADLE_GLOBAL="$HOME/.gradle/gradle.properties"

update_gradle_props() {
  local file="$1"
  if [ ! -f "$file" ]; then
    print_warning "$file não existe. Criando..."
    $DRY_RUN || mkdir -p "$(dirname \"$file\")"
    $DRY_RUN || touch "$file"
  fi
  # Atualiza/adiciona configs
  for line in \
    'org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8' \
    'org.gradle.daemon=true' \
    'org.gradle.configureondemand=true' \
    'org.gradle.caching=true' \
    'org.gradle.parallel=true'; do
    if grep -q "^${line%%=*}" "$file"; then
      $DRY_RUN || sed -i.bak "/^${line%%=*}/c\\$line" "$file"
      print_step "Atualizado: $line em $file"
    else
      $DRY_RUN || echo "$line" >> "$file"
      print_step "Adicionado: $line em $file"
    fi
  done
}

print_step "Verificando android/gradle.properties..."
update_gradle_props "$GRADLE_PROPS"

print_step "Verificando ~/.gradle/gradle.properties..."
update_gradle_props "$GRADLE_GLOBAL"

# 2. Matar processos Java/Gradle travados
print_step "Matando processos Java/Gradle travados..."
if $DRY_RUN; then
  print_warning "(dry-run) Não matando processos."
else
  pkill -f 'GradleDaemon' || true
  pkill -f 'java.*gradle' || true
  print_success "Processos Gradle/Java finalizados."
fi

# 3. Limpar cache do Gradle (opcional)
read -p "Deseja limpar o cache do Gradle (~/.gradle/caches)? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  if $DRY_RUN; then
    print_warning "(dry-run) Não limpando cache."
  else
    rm -rf "$HOME/.gradle/caches"
    print_success "Cache do Gradle limpo."
  fi
else
  print_step "Cache do Gradle mantido."
fi

# 4. Verificar memória disponível
print_step "Verificando memória RAM disponível..."
MEM_TOTAL=$(free -m | awk '/^Mem:/ { print $2 }')
print_step "Memória total detectada: ${MEM_TOTAL}MB"
if [ "$MEM_TOTAL" -lt 4096 ]; then
  print_warning "RAM menor que 4GB detectada. Considere aumentar a memória física ou usar EAS Build."
else
  print_success "RAM suficiente para build local."
fi

print_success "Script concluído."
