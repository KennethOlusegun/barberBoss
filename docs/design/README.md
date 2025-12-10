# Design - BarberBoss

## 🎨 Visão Geral

Guia de estilização e design system do BarberBoss.

## 🎯 Princípios de Design

- **Simplicidade** - Interface limpa e intuitiva
- **Acessibilidade** - Seguir padrões WCAG 2.1
- **Consistência** - Componentes e padrões uniformes
- **Responsividade** - Adaptável a diferentes dispositivos

## 🎨 Paleta de Cores

### Cores Primárias

```css
--primary: #1e3a8a;        /* Azul escuro */
--primary-light: #3b82f6;  /* Azul claro */
--primary-dark: #1e40af;   /* Azul mais escuro */
```

### Cores Secundárias

```css
--secondary: #f59e0b;      /* Laranja */
--secondary-light: #fbbf24;/* Laranja claro */
--secondary-dark: #d97706; /* Laranja escuro */
```

### Cores de Estado

```css
--success: #10b981;        /* Verde - Sucesso */
--warning: #f59e0b;        /* Amarelo - Aviso */
--danger: #ef4444;         /* Vermelho - Erro */
--info: #3b82f6;          /* Azul - Informação */
```

### Cores Neutras

```css
--white: #ffffff;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
--black: #000000;
```

## 📝 Tipografia

### Fonte Principal

**Família**: Roboto, sans-serif

### Hierarquia de Texto

```css
/* Títulos */
--h1: 32px / 2rem     /* font-size */
--h2: 28px / 1.75rem
--h3: 24px / 1.5rem
--h4: 20px / 1.25rem
--h5: 18px / 1.125rem
--h6: 16px / 1rem

/* Corpo */
--body-large: 18px / 1.125rem
--body: 16px / 1rem
--body-small: 14px / 0.875rem
--caption: 12px / 0.75rem
```

### Peso da Fonte

```css
--font-light: 300
--font-regular: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

## 📏 Espaçamento

Sistema de espaçamento baseado em 4px:

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

## 🔲 Bordas e Sombras

### Border Radius

```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-full: 9999px
```

### Sombras

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## 🧩 Componentes

### Botões

**Tamanhos:**
- Small: 32px altura
- Medium: 40px altura
- Large: 48px altura

**Variantes:**
- Primary: Ação principal
- Secondary: Ação secundária
- Outline: Ação terciária
- Ghost: Ação mínima
- Danger: Ação destrutiva

### Cards

```css
padding: var(--spacing-md);
border-radius: var(--radius-md);
box-shadow: var(--shadow-sm);
background: var(--white);
```

### Inputs

```css
height: 40px;
padding: 0 var(--spacing-md);
border: 1px solid var(--gray-300);
border-radius: var(--radius-md);
```

## 📱 Responsividade

### Breakpoints

```css
--mobile: 320px
--tablet: 768px
--desktop: 1024px
--wide: 1280px
```

### Grid

Sistema de grid de 12 colunas com gap de 16px.

## ♿ Acessibilidade

### Contraste

Todas as combinações de cores devem ter no mínimo:
- **AA** para texto normal (4.5:1)
- **AA** para texto grande (3:1)

### Foco

Todos os elementos interativos devem ter indicador de foco visível:

```css
--focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.5);
```

### Tamanho de Toque

Elementos clicáveis devem ter no mínimo 44x44px.

## 🎭 Animações

### Durações

```css
--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms
```

### Easings

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

## 📐 Ícones

**Biblioteca**: Ionicons

**Tamanhos padrão:**
- Small: 16px
- Medium: 24px
- Large: 32px

## 🎨 Temas

### Modo Claro (Padrão)

Cores base com fundo branco.

### Modo Escuro

```css
--background: var(--gray-900);
--surface: var(--gray-800);
--text: var(--gray-100);
```

## 📚 Recursos

- [Ionic Components](https://ionicframework.com/docs/components)
- [Material Design](https://material.io/design)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🔄 Versionamento

Este design system segue versionamento semântico (SemVer).

**Versão atual**: 1.0.0
