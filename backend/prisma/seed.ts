import 'dotenv/config'; // ✅ Carregar .env ANTES de tudo
import { PrismaClient, Role, AppointmentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do BarberBoss...');

  // Limpar dados existentes (cuidado em produção!)
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Dados anteriores limpos');

  // ==========================================
  // 1. CRIAR USUÁRIOS
  // ==========================================
  const hashedPassword = await bcrypt.hash('Olupa98@', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Master',
      email: 'admin@barberboss.com',
      password: hashedPassword,
      phone: '83999887766',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Barbeiros
  const barbeiro1 = await prisma.user.create({
    data: {
      name: 'Carlos Silva',
      email: 'carlos@barberboss.com',
      password: hashedPassword,
      phone: '83988776655',
      role: Role.BARBER,
    },
  });

  const barbeiro2 = await prisma.user.create({
    data: {
      name: 'Ricardo Mendes',
      email: 'ricardo@barberboss.com',
      password: hashedPassword,
      phone: '83977665544',
      role: Role.BARBER,
    },
  });
  console.log('✅ Barbeiros criados:', barbeiro1.name, barbeiro2.name);

  // Clientes
  const cliente1 = await prisma.user.create({
    data: {
      name: 'João Pedro Santos',
      email: 'joao@email.com',
      password: hashedPassword,
      phone: '83966554433',
      role: Role.CLIENT,
    },
  });

  const cliente2 = await prisma.user.create({
    data: {
      name: 'Maria Oliveira',
      email: 'maria@email.com',
      password: hashedPassword,
      phone: '83955443322',
      role: Role.CLIENT,
    },
  });

  const cliente3 = await prisma.user.create({
    data: {
      name: 'Pedro Almeida',
      email: 'pedro@email.com',
      password: hashedPassword,
      phone: '83944332211',
      role: Role.CLIENT,
    },
  });
  console.log(
    '✅ Clientes criados:',
    cliente1.name,
    cliente2.name,
    cliente3.name,
  );

  // ==========================================
  // 2. CRIAR SERVIÇOS
  // ==========================================
  const servicoCorte = await prisma.service.create({
    data: {
      name: 'Corte Tradicional',
      description: 'Corte clássico com máquina e tesoura',
      price: 35.0,
      durationMin: 30, // Corrigido de durationMinutes para durationMin
    },
  });

  const servicoBarba = await prisma.service.create({
    data: {
      name: 'Barba Completa',
      description: 'Aparar e modelar barba com navalha',
      price: 25.0,
      durationMin: 20, // Corrigido
    },
  });

  const servicoCorteBarba = await prisma.service.create({
    data: {
      name: 'Corte + Barba',
      description: 'Pacote completo: corte e barba',
      price: 55.0,
      durationMin: 45, // Corrigido
    },
  });

  const servicoPezinho = await prisma.service.create({
    data: {
      name: 'Pezinho',
      description: 'Acabamento na nuca',
      price: 15.0,
      durationMin: 15, // Corrigido
    },
  });

  const servicoSobrancelha = await prisma.service.create({
    data: {
      name: 'Sobrancelha',
      description: 'Design de sobrancelha',
      price: 20.0,
      durationMin: 15, // Corrigido
    },
  });

  console.log(
    '✅ Serviços criados:',
    servicoCorte.name,
    servicoBarba.name,
    servicoCorteBarba.name,
  );

  // ==========================================
  // 3. CRIAR AGENDAMENTOS
  // ==========================================
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const depoisDeAmanha = new Date(hoje);
  depoisDeAmanha.setDate(hoje.getDate() + 2);

  // Agendamentos de hoje
  await prisma.appointment.create({
    data: {
      userId: cliente1.id,
      barberId: barbeiro1.id,
      serviceId: servicoCorte.id,
      startsAt: new Date(hoje.setHours(9, 0, 0, 0)),
      endsAt: new Date(hoje.setHours(9, 30, 0, 0)),
      status: AppointmentStatus.CONFIRMED,
      // notes removido - não existe no schema
    },
  });

  await prisma.appointment.create({
    data: {
      userId: cliente2.id,
      barberId: barbeiro1.id,
      serviceId: servicoBarba.id,
      startsAt: new Date(hoje.setHours(10, 0, 0, 0)),
      endsAt: new Date(hoje.setHours(10, 20, 0, 0)),
      status: AppointmentStatus.CONFIRMED,
    },
  });

  await prisma.appointment.create({
    data: {
      userId: cliente3.id,
      barberId: barbeiro2.id,
      serviceId: servicoCorteBarba.id,
      startsAt: new Date(hoje.setHours(14, 0, 0, 0)),
      endsAt: new Date(hoje.setHours(14, 45, 0, 0)),
      status: AppointmentStatus.CONFIRMED,
    },
  });

  // Agendamentos de amanhã
  await prisma.appointment.create({
    data: {
      userId: cliente1.id,
      barberId: barbeiro2.id,
      serviceId: servicoCorteBarba.id,
      startsAt: new Date(amanha.setHours(9, 30, 0, 0)),
      endsAt: new Date(amanha.setHours(10, 15, 0, 0)),
      status: AppointmentStatus.PENDING,
    },
  });

  await prisma.appointment.create({
    data: {
      userId: cliente2.id,
      barberId: barbeiro1.id,
      serviceId: servicoPezinho.id,
      startsAt: new Date(amanha.setHours(11, 0, 0, 0)),
      endsAt: new Date(amanha.setHours(11, 15, 0, 0)),
      status: AppointmentStatus.PENDING,
    },
  });

  // Agendamento depois de amanhã
  await prisma.appointment.create({
    data: {
      userId: cliente3.id,
      barberId: barbeiro1.id,
      serviceId: servicoSobrancelha.id,
      startsAt: new Date(depoisDeAmanha.setHours(15, 30, 0, 0)),
      endsAt: new Date(depoisDeAmanha.setHours(15, 45, 0, 0)),
      status: AppointmentStatus.PENDING,
    },
  });

  // Agendamento cancelado (exemplo)
  await prisma.appointment.create({
    data: {
      userId: cliente2.id,
      barberId: barbeiro2.id,
      serviceId: servicoCorte.id,
      startsAt: new Date(hoje.setHours(16, 0, 0, 0)),
      endsAt: new Date(hoje.setHours(16, 30, 0, 0)),
      status: AppointmentStatus.CANCELED, // Corrigido de CANCELLED para CANCELED
    },
  });

  console.log('✅ Agendamentos criados');

  // ==========================================
  // 4. RESUMO
  // ==========================================
  const totalUsers = await prisma.user.count();
  const totalServices = await prisma.service.count();
  const totalAppointments = await prisma.appointment.count();

  console.log('\n📊 Resumo do Seed:');
  console.log(`   - Usuários: ${totalUsers}`);
  console.log(`   - Serviços: ${totalServices}`);
  console.log(`   - Agendamentos: ${totalAppointments}`);
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n🔑 Credenciais de acesso:');
  console.log('   Admin: admin@barberboss.com / Olupa98@');
  console.log('   Barbeiro 1: carlos@barberboss.com / Olupa98@');
  console.log('   Barbeiro 2: ricardo@barberboss.com / Olupa98@');
  console.log('   Cliente: joao@email.com / Olupa98@');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
