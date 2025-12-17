# Design System "Modern Classic" - Login Page Showcase

## 📱 Visualização da Login Page

A página de login do **BarberBoss** foi redesenhada seguindo rigorosamente o Design System "Modern Classic" com uma estética Dark Mode Premium misturando azul royal moderno com vermelho clássico de barbearia.

---

## 🎨 Componentes Implementados

### 1. **Header com Logo Premium**

```scss
// Gradiente azul com efeito glow
background: linear-gradient(135deg, #3b82f6 0%, rgba(59, 130, 246, 0.8) 100%);
box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);

// Animação ao carregar
animation: slide-up 600ms ease-out;
```

**Características:**

- ✅ Logo dentro de card com classe `.barber-card`
- ✅ Título com `.barber-header--decorated` (ícone tesoura ✂)
- ✅ Efeito hover com elevação (-5px)
- ✅ Gradient subtle no background

---

### 2. **Inputs com Estilo Moderno**

```scss
// Base
background-color: #1e293b; // $barber-slate-grey
border-radius: 8px;
border: 2px solid transparent;

// Focus State (Blue)
border-color: #3b82f6;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

// Invalid State (Red)
border-color: #ef4444;
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

**Aplicados aos campos:**

- 📧 Email com ícone de envelope
- 🔐 Senha com toggle de visibilidade
- Ícones mudam de cor ao focar (grey → blue)
- Placeholder com opacity 50%

---

### 3. **Botão "Entrar" com Glow Effect**

```scss
// Classes aplicadas
.login-btn + .glow-fab

// Propriedades
--background: #3B82F6 (Royal Blue)
box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);

// Hover
box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
transform: translateY(-2px);
```

**Estados:**

- ✅ Normal: glow subtle
- ✅ Hover: glow aumentado + elevação
- ✅ Active: glow reduzido + sem elevação
- ✅ Disabled: opacidade 70%

---

### 4. **Alerta de Erro com Status Line**

```scss
// Classes aplicadas
.error-box + .status-line + .status-line--danger

// Visual
Background: rgba(239, 68, 68, 0.1)
Border: 1px solid rgba(239, 68, 68, 0.3)
Linha vermelha 3px no lado esquerdo
```

**Exibe quando:**

- Credenciais inválidas
- Erro de conexão
- Com animação `slide-up`

---

### 5. **Tipografia**

```scss
// Títulos (Oswald)
font-family: "Oswald", sans-serif;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 1px;
color: #ffffff;

// Corpo (Inter)
font-family: "Inter", sans-serif;
font-weight: 400;
color: #94a3b8;
```

**Escala:**

- H1: 3rem (mobile: 1.5rem) ← Título "BARBERBOSS"
- Labels: 1.125rem
- Body: 1rem
- Small: 0.875rem ← Links e mensagens

---

### 6. **Link "Esqueceu a Senha?"**

```scss
.forgot-password-btn {
  --color: #3b82f6;
  font-weight: 600;

  &:hover {
    --color: #4f8cff;
    text-decoration: underline;
  }
}
```

---

### 7. **Divider "ou"**

```scss
// Duas linhas cinzas + texto centralizado
border-top: rgba(148, 163, 184, 0.2) - 1px
color: #94A3B8
```

---

### 8. **Botão "Criar uma conta"**

```scss
.register-btn {
  --border-color: #3b82f6;
  --color: #3b82f6;
  border: 2px solid;
  background: outline;
}

// Hover
--background: rgba(59, 130, 246, 0.1);
box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
```

---

### 9. **Footer com Links**

```scss
// Texto pequeno cinzento
font-size: 0.875rem;
color: #94a3b8;

// Links azuis com underline no hover
color: #3b82f6;
text-decoration: none;

&:hover {
  color: #4f8cff;
  text-decoration: underline;
}
```

---

## 🎬 Animações

### Slide Up Staggered

```scss
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Aplicadas com delay
.header-section: 600ms ease-out (delay: 0ms)
.login-form: 700ms ease-out (delay: 100ms)
.footer-section: 800ms ease-out (delay: 200ms)
```

---

## 🎨 Paleta de Cores

| Nome          | Código    | Uso                          |
| ------------- | --------- | ---------------------------- |
| Midnight Navy | `#0B1120` | Background principal         |
| Slate Grey    | `#1E293B` | Cards, inputs, containers    |
| Royal Blue    | `#3B82F6` | Primary, buttons, accents    |
| Vintage Red   | `#EF4444` | Danger, errors, alerts       |
| Branco Puro   | `#FFFFFF` | Headings, textos importantes |
| Cinza Aço     | `#94A3B8` | Body text, placeholders      |

---

## 📐 Espaçamento & Grid

```scss
// Padding
Header: 2rem (mobile: 1rem)
Cards: 1.5rem
Inputs: 1rem padding lateral

// Gaps
Form: 1.5rem entre campos (mobile: 1rem)

// Border Radius
Inputs: 8px
Cards: 12px
FAB: padrão
```

---

## 📱 Responsividade

### Breakpoints Implementados

- **Desktop**: Full width
- **Tablet (768px)**: Padding reduzido
- **Mobile (480px)**:
  - Fonte reduzida
  - Logo: 80px × 80px (vs 100px)
  - Gaps: 1rem (vs 1.5rem)
  - Padding: 1rem (vs 2rem)

---

## ✅ Checklist de Implementação

- ✅ Paleta de cores aplicada corretamente
- ✅ Tipografia Oswald (headings) e Inter (body)
- ✅ Classes do Design System utilisadas:
  - `.barber-header` com variante `--decorated`
  - `.barber-card` com variante `--center` e `--no-padding`
  - `.price-tag` (pronto para uso em preços)
  - `.status-line` com variante `--danger`
  - `.glow-fab` aplicado ao botão login
- ✅ Inputs com estados (normal, focus, invalid)
- ✅ Animações slide-up com delays
- ✅ Box shadows com glow effect
- ✅ Transições smooth em todos os elementos interativos
- ✅ Responsividade para mobile/tablet/desktop

---

## 🚀 Como Utilizar em Outras Pages

1. **Importe as variáveis:**

```scss
@import "../../theme/variables.scss";
```

2. **Use as classes utilitárias:**

```html
<div class="barber-card barber-card--primary">
  <h2 class="barber-header">Título</h2>
  <p class="price-tag">R$ 99,90</p>
</div>
```

3. **Reutilize as variáveis SCSS:**

```scss
background-color: $barber-slate-grey;
box-shadow: $shadow-glow-primary;
border-radius: $border-radius-lg;
```

---

## 📝 Notas Técnicas

- **Framework**: Ionic + Angular
- **Linguagem**: SCSS puro (sem CSS)
- **Modo**: Dark System (preferência do SO)
- **Gradientes**: Aplicados no logo container
- **Icons**: Ionicons (padrão Ionic)
- **Fontes**: Google Fonts (Oswald + Inter)

---

## 🎯 Próximos Passos

1. Aplicar design system em páginas restantes:
   - Dashboard
   - Agendamentos
   - Clientes
   - Configurações

2. Criar componentes reutilizáveis:
   - `barber-card` component
   - `barber-input` component
   - `barber-button` component

3. Adicionar temas:
   - Light mode variant
   - High contrast mode

---

**Design System v1.0 - BarberBoss**
_Modern Classic: Dark Mode Premium com Estética Clássica de Barbearia_
