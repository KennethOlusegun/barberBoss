# Models e Interfaces - Guia de Uso

## 📋 Visão Geral

Este documento descreve os Models e Interfaces implementados para o aplicativo mobile do BarberBoss.

## 🏗️ Estrutura

```
src/app/core/
├── enums/
│   ├── role.enum.ts
│   ├── appointment-status.enum.ts
│   ├── block-type.enum.ts
│   └── index.ts
├── interfaces/
│   ├── user.interface.ts
│   ├── service.interface.ts
│   ├── appointment.interface.ts
│   ├── settings.interface.ts
│   ├── time-block.interface.ts
│   └── index.ts
├── models/
│   ├── user.model.ts
│   ├── service.model.ts
│   ├── appointment.model.ts
│   ├── settings.model.ts
│   ├── time-block.model.ts
│   └── index.ts
└── types/
    ├── common.types.ts
    └── index.ts
```

## 📦 Importação

Você pode importar tudo de forma centralizada:

```typescript
import {
  User,
  Service,
  Appointment,
  Settings,
  TimeBlock,
  IUser,
  IService,
  IAppointment,
  ISettings,
  ITimeBlock,
  Role,
  AppointmentStatus,
  BlockType,
} from "@app/core";
```

## 🎯 Enums

### Role

Define os papéis de usuário no sistema:

```typescript
enum Role {
  ADMIN = "ADMIN",
  BARBER = "BARBER",
  CLIENT = "CLIENT",
}
```

### AppointmentStatus

Define os status de agendamento:

```typescript
enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
}
```

### BlockType

Define os tipos de bloqueio de horário:

```typescript
enum BlockType {
  LUNCH = "LUNCH",
  BREAK = "BREAK",
  DAY_OFF = "DAY_OFF",
  VACATION = "VACATION",
  CUSTOM = "CUSTOM",
}
```

## 👤 User (Usuário)

### Interface

```typescript
interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### Model

```typescript
const user = new User(userData);

// Métodos úteis
user.isAdmin(); // Verifica se é admin
user.isBarber(); // Verifica se é barbeiro
user.isClient(); // Verifica se é cliente
user.getFullName(); // Retorna nome completo
user.getInitials(); // Retorna iniciais (ex: "JD")
```

### DTOs

```typescript
// Login
interface IUserLogin {
  email: string;
  password: string;
}

// Resposta do login
interface IUserLoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken?: string;
}

// Criar usuário
interface IUserCreate {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}

// Atualizar usuário
interface IUserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}
```

## 💈 Service (Serviço)

### Interface

```typescript
interface IService {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### Model

```typescript
const service = new Service(serviceData);

// Métodos úteis
service.getFormattedPrice(); // Ex: "R$ 50,00"
service.getFormattedDuration(); // Ex: "45 min" ou "1h 30min"
service.calculateEndTime(startDate); // Calcula horário de término
service.isAvailable(); // Verifica se está ativo
```

## 📅 Appointment (Agendamento)

### Interface

```typescript
interface IAppointment {
  id: string;
  startsAt: Date | string;
  endsAt: Date | string;
  status: AppointmentStatus;
  userId?: string;
  user?: IUser;
  clientName?: string;
  serviceId: string;
  service?: IService;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### Model

```typescript
const appointment = new Appointment(appointmentData);

// Métodos úteis
appointment.getClientName(); // Nome do cliente
appointment.getFormattedDate(); // Ex: "15/12/2025"
appointment.getFormattedTimeRange(); // Ex: "14:00 - 15:00"
appointment.getDurationMinutes(); // Duração em minutos
appointment.isPast(); // Se já passou
appointment.isToday(); // Se é hoje
appointment.canBeCanceled(); // Se pode cancelar
appointment.canBeEdited(); // Se pode editar
appointment.getStatusLabel(); // Label do status em PT
appointment.getStatusColor(); // Cor Ionic para o status
```

### DTOs e Tipos

```typescript
// Criar agendamento
interface IAppointmentCreate {
  startsAt: Date | string;
  endsAt: Date | string;
  userId?: string;
  clientName?: string;
  serviceId: string;
  status?: AppointmentStatus;
}

// Horários disponíveis
interface IAvailableSlot {
  startsAt: Date | string;
  endsAt: Date | string;
  available: boolean;
}

// Estatísticas
interface IAppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  canceled: number;
  noShow: number;
}
```

## ⚙️ Settings (Configurações)

### Interface

```typescript
interface ISettings {
  id: string;
  businessName: string;
  openTime: string; // "08:00"
  closeTime: string; // "18:00"
  workingDays: number[]; // [1,2,3,4,5,6]
  slotIntervalMin: number; // 15
  maxAdvanceDays: number; // 30
  minAdvanceHours: number; // 2
  enableReminders: boolean;
  reminderHoursBefore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### Model

```typescript
const settings = new Settings(settingsData);

// Métodos úteis
settings.getBusinessHours(); // Ex: "08:00 - 18:00"
settings.getWorkingDaysLabels(); // ["Segunda", "Terça", ...]
settings.getWorkingDaysString(); // "Segunda a Sábado"
settings.isWorkingDay(3); // Verifica dia da semana
settings.getOpeningTime(date); // Date de abertura
settings.getClosingTime(date); // Date de fechamento
settings.isWithinBusinessHours(date); // Se horário está aberto
settings.getMaxBookingDate(); // Data máxima para agendar
settings.getMinBookingDateTime(); // Data/hora mínima
settings.isDateBookable(date); // Se data pode ser agendada
```

## 🚫 TimeBlock (Bloqueio de Horário)

### Interface

```typescript
interface ITimeBlock {
  id: string;
  type: BlockType;
  reason?: string;
  startsAt: Date | string;
  endsAt: Date | string;
  isRecurring: boolean;
  recurringDays: number[];
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### Model

```typescript
const timeBlock = new TimeBlock(blockData);

// Métodos úteis
timeBlock.getTypeLabel(); // Ex: "Almoço"
timeBlock.getDisplayTitle(); // Ex: "Almoço: Pausa"
timeBlock.getFormattedDateRange(); // Ex: "15/12/2025"
timeBlock.getFormattedTimeRange(); // Ex: "12:00 - 13:00"
timeBlock.getRecurringDaysString(); // Ex: "Segunda, Terça"
timeBlock.isActiveOnDate(date); // Se ativo na data
timeBlock.overlapsWithTimeRange(start, end); // Se sobrepõe horário
timeBlock.isPast(); // Se já passou
timeBlock.isCurrentlyActive(); // Se está ativo agora
timeBlock.getDurationMinutes(); // Duração em minutos
timeBlock.getTypeColor(); // Cor Ionic para o tipo
```

## 🛠️ Tipos Comuns

### Paginação

```typescript
interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Uso
const response: IPaginatedResponse<Appointment> = await api.getAppointments();
```

### Resposta da API

```typescript
interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### Parâmetros de Query

```typescript
interface IQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

## 💡 Exemplos de Uso

### Exemplo 1: Listar Agendamentos

```typescript
import { Appointment, IAppointmentQuery } from "@app/core";

// Query
const query: IAppointmentQuery = {
  status: AppointmentStatus.CONFIRMED,
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  page: 1,
  limit: 10,
};

// Buscar
const response = await this.appointmentService.getAppointments(query);

// Converter para models
const appointments = response.data.map((data) => new Appointment(data));

// Usar métodos
appointments.forEach((appointment) => {
  console.log(appointment.getFormattedDate());
  console.log(appointment.getClientName());
  console.log(appointment.getStatusLabel());
});
```

### Exemplo 2: Criar Serviço

```typescript
import { Service, IServiceCreate } from "@app/core";

const newService: IServiceCreate = {
  name: "Corte Degradê",
  description: "Corte moderno com degradê",
  price: 45.0,
  durationMin: 45,
  active: true,
};

const response = await this.serviceService.create(newService);
const service = new Service(response.data);

console.log(service.getFormattedPrice()); // "R$ 45,00"
console.log(service.getFormattedDuration()); // "45 min"
```

### Exemplo 3: Verificar Horários Disponíveis

```typescript
import { Settings, TimeBlock } from "@app/core";

const settings = new Settings(settingsData);
const blocks = blocksData.map((b) => new TimeBlock(b));

// Verificar se data está disponível
const date = new Date();
const isWorkingDay = settings.isWorkingDay(date.getDay());
const isBookable = settings.isDateBookable(date);

// Verificar bloqueios
const hasBlock = blocks.some(
  (block) => block.isActiveOnDate(date) && block.isWithinBusinessHours(date),
);

const isAvailable = isWorkingDay && isBookable && !hasBlock;
```

## 📱 Uso em Components

```typescript
import { Component, OnInit } from "@angular/core";
import { Appointment, AppointmentStatus, IAppointmentQuery } from "@app/core";

@Component({
  selector: "app-appointments",
  templateUrl: "./appointments.page.html",
})
export class AppointmentsPage implements OnInit {
  appointments: Appointment[] = [];

  async ngOnInit() {
    await this.loadAppointments();
  }

  async loadAppointments() {
    const query: IAppointmentQuery = {
      status: AppointmentStatus.CONFIRMED,
      startDate: new Date(),
    };

    const response = await this.appointmentService.getAppointments(query);
    this.appointments = response.data.map((data) => new Appointment(data));
  }

  getStatusColor(appointment: Appointment): string {
    return appointment.getStatusColor();
  }
}
```

## 🎨 Template Example

```html
<ion-list>
  <ion-item *ngFor="let appointment of appointments">
    <ion-label>
      <h2>{{ appointment.getClientName() }}</h2>
      <p>{{ appointment.getFormattedDate() }}</p>
      <p>{{ appointment.getFormattedTimeRange() }}</p>
    </ion-label>
    <ion-badge [color]="appointment.getStatusColor()" slot="end">
      {{ appointment.getStatusLabel() }}
    </ion-badge>
  </ion-item>
</ion-list>
```

## ✅ Boas Práticas

1. **Sempre use os Models** para trabalhar com dados da API
2. **Use as Interfaces** para tipagem de parâmetros e retornos
3. **Aproveite os métodos utilitários** dos models para formatação
4. **Use os Enums** em vez de strings mágicas
5. **Valide datas** usando os métodos dos models
6. **Implemente validações** antes de operações críticas

## 🔗 Relacionamentos

Os models suportam relacionamentos aninhados:

```typescript
const appointment = new Appointment({
  id: "123",
  startsAt: new Date(),
  endsAt: new Date(),
  status: AppointmentStatus.CONFIRMED,
  service: {
    id: "456",
    name: "Corte",
    price: 45,
    durationMin: 45,
  },
  user: {
    id: "789",
    name: "João Silva",
    email: "joao@email.com",
    role: Role.CLIENT,
  },
});

// Acessar relacionamentos
appointment.service?.getFormattedPrice();
appointment.user?.getInitials();
```

---

**Criado em:** 10/12/2025  
**Versão:** 1.0.0
