import { PrismaClient, AppointmentStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // Buscar usuário Kenneth Dornelles
  const kenneth = await prisma.user.findUnique({
    where: { id: '296aee89-6a59-4b73-a4c1-60ec0bfc5fca' },
  });
  if (!kenneth) {
    console.log('❌ Usuário Kenneth Dornelles não encontrado.');
    return;
  }

  // Buscar serviços existentes
  const services = await prisma.service.findMany({ take: 2 });
  if (services.length === 0) {
    console.log('❌ Nenhum serviço encontrado para criar agendamentos.');
    return;
  }

  // Criar agendamentos para Kenneth
  const now = new Date();
  const appointments = [
    {
      startsAt: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        10,
        0,
        0,
      ),
      endsAt: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        10,
        30,
        0,
      ),
      status: AppointmentStatus.CONFIRMED,
      userId: kenneth.id,
      serviceId: services[0].id,
    },
    {
      startsAt: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        15,
        0,
        0,
      ),
      endsAt: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        15,
        45,
        0,
      ),
      status: AppointmentStatus.CONFIRMED,
      userId: kenneth.id,
      serviceId: services[1].id,
    },
  ];

  for (const data of appointments) {
    await prisma.appointment.create({ data });
  }
  console.log('✅ Agendamentos criados para Kenneth Dornelles.');

  // Criar configurações padrão se não existir
  const existingSettings = await prisma.settings.findFirst();

  if (!existingSettings) {
    const settings = await prisma.settings.create({
      data: {
        businessName: 'Barber Boss',
        openTime: '08:00',
        closeTime: '18:00',
        workingDays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
        slotIntervalMin: 15,
        maxAdvanceDays: 30,
        minAdvanceHours: 2,
        enableReminders: false,
        reminderHoursBefore: 24,
      },
    });
    console.log('✅ Configurações padrão criadas:', settings);
  } else {
    console.log('ℹ️  Configurações já existem, pulando...');
  }

  console.log('🌱 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
