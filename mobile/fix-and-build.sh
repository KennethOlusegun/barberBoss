#!/bin/bash
set -e

EMOJI_FIX="🛠️"
EMOJI_NPM="📦"
EMOJI_CLEAN="🧹"
EMOJI_BUILD="🏗️"
EMOJI_SUCCESS="✅"
EMOJI_ERROR="❌"

function check_error() {
  if [ $? -ne 0 ]; then
    echo -e "$EMOJI_ERROR Erro na etapa: $1"
    exit 1
  fi
}

echo -e "$EMOJI_FIX Iniciando correção rápida do ambiente..."
echo ""

# 1. Remover @capacitor/http
echo -e "$EMOJI_NPM Removendo @capacitor/http (se existir)..."
npm uninstall @capacitor/http 2>/dev/null || true

# 2. Limpar node_modules
echo -e "$EMOJI_CLEAN Limpando node_modules e package-lock.json..."
rm -rf node_modules package-lock.json
check_error "Limpeza node_modules"

# 3. Limpar cache npm
echo -e "$EMOJI_CLEAN Limpando cache do npm..."
npm cache clean --force
check_error "Limpeza cache npm"

# 4. Reinstalar dependências
echo ""
echo -e "$EMOJI_NPM Instalando dependências..."
npm install
check_error "npm install"

# 5. BUILD IONIC (CRÍTICO - antes do cap sync)
echo ""
echo -e "$EMOJI_BUILD Gerando build do Ionic..."
ionic build --prod
check_error "ionic build"

# 6. Sincronizar Capacitor
echo ""
echo -e "$EMOJI_NPM Sincronizando Capacitor..."
npx cap sync
check_error "npx cap sync"

# 7. Criar diretório XML se não existir
echo ""
echo -e "$EMOJI_FIX Verificando estrutura de pastas Android..."
mkdir -p android/app/src/main/res/xml

# 8. Verificar se network_security_config.xml existe
if [ ! -f "android/app/src/main/res/xml/network_security_config.xml" ]; then
    echo -e "$EMOJI_FIX Criando network_security_config.xml..."
    
    cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">ngrok-free.app</domain>
        <domain includeSubdomains="true">ngrok.io</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
EOF
    echo -e "$EMOJI_SUCCESS network_security_config.xml criado!"
fi

# 9. Build do APK
echo ""
echo -e "$EMOJI_BUILD Gerando APK..."
cd android

echo -e "$EMOJI_CLEAN Limpando build gradle..."
./gradlew clean
check_error "gradle clean"

echo ""
echo -e "$EMOJI_BUILD Compilando APK debug..."
./gradlew assembleDebug
check_error "gradle assembleDebug"

echo ""
echo -e "$EMOJI_SUCCESS APK gerado com sucesso!"
echo -e "📍 Localização: android/app/build/outputs/apk/debug/app-debug.apk"

# 10. Instalar automaticamente se dispositivo conectado
echo ""
if adb devices | grep -w "device"; then
    echo -e "📲 Dispositivo detectado! Instalando..."
    adb install -r app/build/outputs/apk/debug/app-debug.apk
    
    if [ $? -eq 0 ]; then
        echo -e "$EMOJI_SUCCESS App instalado no dispositivo!"
    else
        echo -e "⚠️ Erro ao instalar. Instale manualmente o APK."
    fi
else
    echo -e "⚠️ Nenhum dispositivo Android conectado via ADB"
    echo -e "📱 Instale manualmente o APK do caminho acima"
fi

cd ..

echo ""
echo -e "$EMOJI_SUCCESS Correção e build finalizados com sucesso!"
echo ""
echo -e "🎉 Teste o app no seu celular!"