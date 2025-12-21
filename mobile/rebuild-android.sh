#!/bin/bash
# rebuild-android.sh - Build, sync e execução do app Android Ionic/Capacitor
# Atualizado: 21/12/2025
# Este script executa o build, verifica a estrutura e sincroniza com o Capacitor

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[1/6] Limpando build anterior${NC}"
rm -rf www || true

echo -e "${YELLOW}[2/6] Build do projeto (production)${NC}"
npm run build -- --configuration production

echo -e "${YELLOW}[3/6] Verificando estrutura do build${NC}"

# Verifica se index.html existe
if [ ! -f "www/index.html" ]; then
    echo -e "${YELLOW}⚠️  www/index.html não encontrado diretamente${NC}"
    
    # Verifica se está em www/browser (problema Angular 17+)
    if [ -f "www/browser/index.html" ]; then
        echo -e "${YELLOW}→ Detectado output em www/browser/ - Movendo arquivos...${NC}"
        
        # Move TODOS os arquivos e pastas
        shopt -s dotglob
        mv www/browser/* www/ 2>/dev/null || true
        shopt -u dotglob
        
        # Remove diretório browser
        rm -rf www/browser
        
        echo -e "${GREEN}✅ Arquivos movidos para www/${NC}"
    else
        echo -e "${RED}❌ ERRO: Estrutura de build inesperada${NC}"
        echo -e "${RED}Conteúdo de www/:${NC}"
        ls -la www/ 2>/dev/null || echo "Pasta www/ não existe"
        exit 1
    fi
fi

# Verifica novamente após mover
if [ ! -f "www/index.html" ]; then
    echo -e "${RED}❌ ERRO: index.html ainda não encontrado após mover arquivos${NC}"
    exit 1
fi

# Verifica arquivos JavaScript
JS_COUNT=$(find www -name "*.js" -type f | wc -l)
if [ $JS_COUNT -eq 0 ]; then
    echo -e "${RED}❌ ERRO: Nenhum arquivo JavaScript encontrado em www/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build OK:${NC}"
echo "   - index.html: ✓"
echo "   - Arquivos JS: $JS_COUNT"
echo "   - Estrutura:"
ls -lh www/ | head -10

echo -e "${YELLOW}[4/6] Sincronizando Capacitor${NC}"
npx cap sync android

echo -e "${YELLOW}[5/6] Limpando build do Android${NC}"
cd android && ./gradlew clean && cd ..

echo -e "${YELLOW}[6/6] Executando app no Android${NC}"
npx cap run android

echo -e "${GREEN}✅ Rebuild Android finalizado com sucesso!${NC}"