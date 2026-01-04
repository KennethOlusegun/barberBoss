#!/bin/bash
set -e

# ============================================================================
# Script de Build APK para Expo (sem EAS)
# ============================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Caminhos
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
APP_DIR="$ANDROID_DIR/app"
KEYSTORE="$APP_DIR/barberboss-release-key.keystore"
GRADLE_PROPS="$ANDROID_DIR/gradle.properties"
GRADLE_PROPS_EXAMPLE="$ANDROID_DIR/gradle.properties.example"
XML_DIR="$APP_DIR/src/main/res/xml"
NETWORK_CONFIG="$XML_DIR/network_security_config.xml"

# Funções auxiliares
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

# ============================================================================
# STEP 1: Verificar dependências
# ============================================================================
print_step "[1/7] Verificando dependências..."

if ! command -v npx &> /dev/null; then
  print_error "npx não encontrado. Instale Node.js primeiro."
  exit 1
fi

if ! command -v keytool &> /dev/null; then
  print_error "keytool não encontrado. Instale Java JDK primeiro."
  exit 1
fi

print_success "Dependências OK"

# ============================================================================
# STEP 2: Verificar se plugin foi configurado
# ============================================================================
print_step "[2/7] Verificando configuração do app.json..."

if [ ! -f "$ROOT_DIR/plugins/withCleartextTraffic.js" ]; then
  print_warning "Plugin withCleartextTraffic.js não encontrado!"
  echo "Crie o arquivo: plugins/withCleartextTraffic.js"
  echo "Use o prompt do GitHub Copilot para gerar."
  exit 1
fi

if ! grep -q "withCleartextTraffic" "$ROOT_DIR/app.json"; then
  print_warning "Plugin não registrado no app.json!"
  echo "Adicione em app.json > expo > plugins:"
  echo '  "plugins": ["./plugins/withCleartextTraffic.js"]'
  exit 1
fi

print_success "Configuração do app.json OK"

# ============================================================================
# STEP 3: Prebuild (gera pasta android/)
# ============================================================================
print_step "[3/7] Executando expo prebuild..."

cd "$ROOT_DIR"

if [ -d "$ANDROID_DIR" ]; then
  print_warning "Pasta android/ já existe."
  read -p "Deseja recriar? (s/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    # Fazer backup do keystore e gradle.properties antes de deletar
    BACKUP_DIR="/tmp/barberboss-backup-$(date +%s)"
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "$KEYSTORE" ]; then
      cp "$KEYSTORE" "$BACKUP_DIR/"
      print_success "Backup do keystore criado em $BACKUP_DIR"
    fi
    
    if [ -f "$GRADLE_PROPS" ]; then
      cp "$GRADLE_PROPS" "$BACKUP_DIR/"
      print_success "Backup do gradle.properties criado em $BACKUP_DIR"
    fi
    
    rm -rf "$ANDROID_DIR"
    npx expo prebuild --platform android --clean
    
    # Restaurar arquivos
    mkdir -p "$APP_DIR"
    if [ -f "$BACKUP_DIR/barberboss-release-key.keystore" ]; then
      cp "$BACKUP_DIR/barberboss-release-key.keystore" "$KEYSTORE"
      print_success "Keystore restaurado"
    fi
    
    if [ -f "$BACKUP_DIR/gradle.properties" ]; then
      cp "$BACKUP_DIR/gradle.properties" "$GRADLE_PROPS"
      print_success "gradle.properties restaurado"
    fi
  fi
else
  npx expo prebuild --platform android
fi

print_success "Prebuild concluído"

# ============================================================================
# STEP 4: Criar network_security_config.xml
# ============================================================================
print_step "[4/7] Criando network_security_config.xml..."

mkdir -p "$XML_DIR"

if [ ! -f "$NETWORK_CONFIG" ]; then
  cat > "$NETWORK_CONFIG" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">barberboss-hvkz.onrender.com</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
EOF
  print_success "network_security_config.xml criado"
else
  print_success "network_security_config.xml já existe"
fi

# ============================================================================
# STEP 5: Verificar Keystore
# ============================================================================
print_step "[5/7] Verificando keystore..."

if [ -f "$KEYSTORE" ]; then
  print_success "Keystore encontrado: $KEYSTORE"
  
  # Verificar se o keystore é válido
  if keytool -list -keystore "$KEYSTORE" -alias barberboss-key -storepass test 2>/dev/null; then
    print_success "Keystore válido"
  else
    print_warning "Não foi possível verificar o keystore (senha pode estar incorreta, mas isso é OK)"
  fi
else
  echo ""
  print_warning "KEYSTORE NÃO ENCONTRADO - Vamos criar um novo"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Você precisará fornecer as seguintes informações:"
  echo "   1. Nome e sobrenome"
  echo "   2. Nome da organização"
  echo "   3. Cidade, Estado, País"
  echo "   4. SENHA DO KEYSTORE (escolha uma senha forte!)"
  echo ""
  echo "⚠️  ANOTE A SENHA - você não poderá recuperá-la!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  read -p "Pressione ENTER para continuar ou Ctrl+C para cancelar..."
  
  keytool -genkeypair -v -storetype PKCS12 \
    -keystore "$KEYSTORE" \
    -alias barberboss-key \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000
  
  print_success "Keystore criado: $KEYSTORE"
  
  echo ""
  print_warning "⚠️  IMPORTANTE: Faça backup deste arquivo AGORA!"
  echo "Localizações sugeridas:"
  echo "  1. Google Drive / Dropbox"
  echo "  2. Pendrive externo"
  echo "  3. Gerenciador de senhas (1Password, LastPass)"
  echo ""
  read -p "Pressione ENTER após fazer o backup..."
fi

# ============================================================================
# STEP 6: Configurar gradle.properties
# ============================================================================
print_step "[6/7] Configurando gradle.properties..."

# Criar exemplo se não existir
if [ ! -f "$GRADLE_PROPS_EXAMPLE" ]; then
  cat > "$GRADLE_PROPS_EXAMPLE" << 'EOF'
# ========================================
# CONFIGURAÇÃO DE ASSINATURA DO APK
# ========================================
# IMPORTANTE: Copie este arquivo para gradle.properties
# e preencha com suas senhas reais

# Caminho do keystore
MYAPP_UPLOAD_STORE_FILE=barberboss-release-key.keystore

# Alias da chave (definido ao criar keystore)
MYAPP_UPLOAD_KEY_ALIAS=barberboss-key

# Senhas (NUNCA COMMITE ESTE ARQUIVO!)
MYAPP_UPLOAD_STORE_PASSWORD=SUA_SENHA_AQUI
MYAPP_UPLOAD_KEY_PASSWORD=SUA_SENHA_AQUI

# Outras configurações do Gradle
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
EOF
  print_success "gradle.properties.example criado"
fi

# Verificar se gradle.properties existe e tem senhas
if [ ! -f "$GRADLE_PROPS" ]; then
  print_error "gradle.properties não encontrado!"
  echo ""
  echo "Execute manualmente:"
  echo "  cp android/gradle.properties.example android/gradle.properties"
  echo "  nano android/gradle.properties  # edite e adicione suas senhas"
  echo ""
  exit 1
fi

# Verificar se as senhas foram preenchidas
if grep -q "SUA_SENHA_AQUI" "$GRADLE_PROPS"; then
  print_error "Senhas não foram configuradas no gradle.properties!"
  echo ""
  echo "Edite o arquivo e substitua 'SUA_SENHA_AQUI' pela senha real:"
  echo "  nano android/gradle.properties"
  echo ""
  exit 1
fi

print_success "gradle.properties configurado"

# ============================================================================
# STEP 7: Build do APK
# ============================================================================
print_step "[7/7] Compilando APK (isso pode levar alguns minutos)..."

cd "$ANDROID_DIR"

# Dar permissão de execução ao gradlew
chmod +x ./gradlew

# Limpar build anterior
./gradlew clean


# Parar daemons Gradle antes do build para evitar conflitos de memória
print_step "Parando daemons Gradle antigos..."
./gradlew --stop
sleep 2

# Aviso sobre uso de memória
print_warning "Certifique-se de ter pelo menos 4GB de RAM livre para o build. O processo pode demorar e consumir muita memória."

# Compilar release APK com logs detalhados
./gradlew :app:assembleRelease --info --stacktrace

# ============================================================================
# RESULTADO FINAL
# ============================================================================
APK_PATH="$APP_DIR/build/outputs/apk/release/app-release.apk"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "$APK_PATH" ]; then
  print_success "✅ APK COMPILADO COM SUCESSO!"
  echo ""
  echo "📦 Localização: $APK_PATH"
  echo ""
  
  # Mostrar tamanho
  SIZE=$(du -h "$APK_PATH" | cut -f1)
  echo "📊 Tamanho: $SIZE"
  echo ""
  
  # Instruções de instalação
  echo "📱 Para instalar no dispositivo:"
  echo "   1. Conecte o celular via USB"
  echo "   2. Execute: adb install \"$APK_PATH\""
  echo "   OU"
  echo "   3. Envie o APK por WhatsApp/Email e instale manualmente"
  echo ""
  
  # Instruções de debug
  echo "🔍 Para ver logs de rede:"
  echo "   adb logcat | grep -i 'network\\|http\\|axios'"
  echo ""
  
else
  print_error "ERRO: APK não foi gerado!"
  echo "Verifique os logs acima para detalhes do erro."
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"