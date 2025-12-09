import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

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
