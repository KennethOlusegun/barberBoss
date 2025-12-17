#!/bin/bash

echo "🚀 Iniciando build do APK - Barber Boss"

# 1. Limpar cache e builds antigos
echo ""
echo "🧹 Limpando pastas..."
rm -rf www
rm -rf android/app/build

# 2. Verificar se @capacitor/http está instalado e remover
if npm list @capacitor/http >/dev/null 2>&1; then
    echo ""
    echo "⚠️ @capacitor/http detectado. Removendo..."
    npm uninstall @capacitor/http
fi

# 3. Build do projeto
echo ""
echo "🛠️ Build produção..."
ionic build --prod

if [ $? -ne 0 ]; then
    echo "❌ Erro no build do Ionic!"
    exit 1
fi

# 4. Copiar assets e sincronizar
echo ""
echo "📋 Copiando arquivos para Android..."
npx cap copy android

echo ""
echo "🔄 Sincronizando plugins..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Erro na sincronização!"
    exit 1
fi

# 5. Criar diretório XML se não existir
echo ""
echo "📁 Verificando estrutura de pastas..."
mkdir -p android/app/src/main/res/xml

# 6. Verificar se network_security_config.xml existe
if [ ! -f "android/app/src/main/res/xml/network_security_config.xml" ]; then
    echo "⚠️ Aviso: network_security_config.xml não encontrado!"
    echo "Criando arquivo..."
    
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
    echo "✅ Arquivo network_security_config.xml criado!"
fi

# 7. Build do APK via Gradle
echo ""
echo "⚙️ Limpando build gradle..."
cd android

./gradlew clean

if [ $? -ne 0 ]; then
    echo "❌ Erro no gradle clean!"
    cd ..
    exit 1
fi

echo ""
echo "🏗️ Gerando APK de debug..."
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERRO ao gerar APK!"
    echo ""
    echo "💡 Possíveis soluções:"
    echo "1. Execute: ./fix-and-build.sh"
    echo "2. Verifique o Android SDK no Android Studio"
    echo "3. Tente: cd android && ./gradlew clean --refresh-dependencies"
    cd ..
    exit 1
fi

echo ""
echo "✅ APK gerado com sucesso!"
echo "📍 Localização: android/app/build/outputs/apk/debug/app-debug.apk"

# 8. Instalar automaticamente se dispositivo conectado
echo ""
if adb devices | grep -w "device"; then
    echo "📲 Dispositivo detectado! Instalando..."
    adb install -r app/build/outputs/apk/debug/app-debug.apk
    
    if [ $? -eq 0 ]; then
        echo "✅ App instalado com sucesso no dispositivo!"
        echo ""
        echo "🎉 Build completo! Teste o app no seu celular."
    else
        echo "⚠️ Erro ao instalar. Instale manualmente o APK."
    fi
else
    echo "⚠️ Nenhum dispositivo Android conectado via ADB"
    echo ""
    echo "📱 Para instalar:"
    echo "   1. Conecte o dispositivo via USB e ative depuração USB"
    echo "   2. Ou copie o APK para o celular e instale manualmente"
    echo ""
    echo "📍 Caminho do APK:"
    echo "   $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

echo ""
echo "✅ Processo finalizado!"