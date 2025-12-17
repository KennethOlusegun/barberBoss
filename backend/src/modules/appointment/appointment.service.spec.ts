import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: PrismaService,
          useValue: {
            appointment: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            service: {
              findUnique: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an appointment with userId', async () => {
      const createDto = {
        startsAt: '2024-12-10T10:00:00Z',
        endsAt: '2024-12-10T11:00:00Z',
        userId: 'user-id',
        serviceId: 'service-id',
      };

      const mockService = { id: 'service-id', name: 'Test Service' };
      const mockUser = { id: 'user-id', name: 'Test User' };
      const mockAppointment = {
        id: 'appointment-id',
        ...createDto,
        startsAt: new Date(createDto.startsAt),
        endsAt: new Date(createDto.endsAt),
        status: 'CONFIRMED',
        clientName: null,
      };

      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue(mockService as unknown);
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUser as unknown);
      jest.spyOn(prisma.appointment, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prisma.appointment, 'create')
        .mockResolvedValue(mockAppointment as unknown);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(prisma.appointment.create).toHaveBeenCalled();
    });

    it('should throw error if neither userId nor clientName is provided', async () => {
      const createDto = {
        startsAt: '2024-12-10T10:00:00Z',
        endsAt: '2024-12-10T11:00:00Z',
        serviceId: 'service-id',
      };

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return an array of appointments', async () => {
      const mockAppointments = [
        {
          id: 'appointment-1',
          startsAt: new Date(),
          endsAt: new Date(),
          status: 'CONFIRMED',
        },
      ];

      jest
        .spyOn(prisma.appointment, 'findMany')
        .mockResolvedValue(mockAppointments as unknown);

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return an appointment by id', async () => {
      const mockAppointment = {
        id: 'appointment-id',
        startsAt: new Date(),
        endsAt: new Date(),
        status: 'CONFIRMED',
      };

      jest
        .spyOn(prisma.appointment, 'findUnique')
        .mockResolvedValue(mockAppointment as unknown);

      const result = await service.findOne('appointment-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('appointment-id');
    });

    it('should throw NotFoundException if appointment not found', async () => {
      jest.spyOn(prisma.appointment, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an appointment', async () => {
      const mockAppointment = {
        id: 'appointment-id',
        startsAt: new Date(),
        endsAt: new Date(),
        status: 'CONFIRMED',
      };

      const updateDto = {
        status: 'COMPLETED' as string,
      };

      jest
        .spyOn(prisma.appointment, 'findUnique')
        .mockResolvedValue(mockAppointment as unknown);
      jest.spyOn(prisma.appointment, 'update').mockResolvedValue({
        ...mockAppointment,
        ...updateDto,
      } as unknown);

      const result = await service.update('appointment-id', updateDto);

      expect(result).toBeDefined();
      expect(prisma.appointment.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an appointment', async () => {
      const mockAppointment = {
        id: 'appointment-id',
        startsAt: new Date(),
        endsAt: new Date(),
        status: 'CONFIRMED',
      };

      jest
        .spyOn(prisma.appointment, 'findUnique')
        .mockResolvedValue(mockAppointment as unknown);
      jest
        .spyOn(prisma.appointment, 'delete')
        .mockResolvedValue(mockAppointment as unknown);

      const result = await service.remove('appointment-id');

      expect(result).toBeDefined();
      expect(prisma.appointment.delete).toHaveBeenCalled();
    });
  });
});
