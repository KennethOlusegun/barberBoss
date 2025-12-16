# Configuration Examples

Este diretório contém exemplos de componentes demonstrando como usar vários serviços e recursos no aplicativo mobile Barber Boss.

## ⚠️ Nota Importante

Os componentes de exemplo são **componentes standalone** e prontos para uso. Eles incluem todas as importações necessárias para Ionic e Angular.

## Exemplos Disponíveis

### ConfigDemoComponent (✅ Pronto para Usar)

**Status:** Componente standalone com todas as dependências incluídas

Demonstra o uso do `ConfigService` para acessar configuração da aplicação.

**Localização:** `mobile/src/app/examples/config-demo.component.ts`

**Recursos:**

- Exibir todos os valores de configuração
- Testar construção de URL de endpoint
- Testar geração de chave de storage
- Testar acesso a caminho de configuração
- Testar funcionalidade de logging

**Uso:**

Como este é um componente standalone, você pode usá-lo diretamente em suas rotas:

```typescript
// Na configuração de roteamento
{
  path: 'config-demo',
  loadComponent: () => import('./examples/config-demo.component').then(m => m.ConfigDemoComponent)
}
```

Ou importá-lo diretamente:

```typescript
import { ConfigDemoComponent } from './examples/config-demo.component';

// Nas rotas
{
  path: 'config-demo',
  component: ConfigDemoComponent
}
```

Em seguida, navegue para `/config-demo` para ver a demo.

**Nota:** Este componente é apenas para fins de desenvolvimento e testes. Remova-o em builds de produção ou proteja-o com guards apropriados.

## Adicionando Novos Exemplos

Ao criar novos componentes de exemplo:

1. Crie um novo arquivo neste diretório
2. Use nomenclatura clara: `[feature]-demo.component.ts`
3. Adicione comentários abrangentes explicando o uso
4. Inclua exemplos de UI e código
5. Adicione entrada neste README

## Boas Práticas

- Mantenha exemplos simples e focados em uma funcionalidade
- Inclua demonstrações de tratamento de erros
- Mostre casos de sucesso e falha
- Documente quaisquer dependências
- Faça exemplos facilmente removíveis para produção

## Removendo Exemplos da Produção

Para excluir exemplos de builds de produção:

1. Crie um módulo separado para exemplos
2. Importe o módulo de exemplos apenas em desenvolvimento
3. Use flags de ambiente para carregar exemplos condicionalmente
4. Ou simplesmente delete este diretório antes do deploy de produção

Exemplo:

```typescript
// app.module.ts
import { environment } from "../environments/environment";

const imports = [
  // ... outras importações
];

if (!environment.production) {
  imports.push(ExamplesModule);
}

@NgModule({
  imports,
  // ... outra configuração
})
export class AppModule {}
```
