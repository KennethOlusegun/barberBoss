
# Dockerfile para ambiente de desenvolvimento NestJS

FROM node:18-bullseye

WORKDIR /app

# Copia apenas os arquivos de dependências para otimizar cache
COPY package.json package-lock.json* ./

RUN npm install

# Copia o restante do código
COPY . .

# Garante que node_modules do host não sobrescreva o do container
VOLUME ["/app/node_modules"]

# Expõe a porta padrão do NestJS
EXPOSE 3000

# Comando para rodar em modo dev com hot reload
CMD ["npm", "run", "start:dev"]
