import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let service: AppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByDate: jest.fn(),
            findByUser: jest.fn(),
            findByStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    service = module.get<AppointmentService>(AppointmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an appointment', async () => {
      const createDto = {
        startsAt: '2024-12-10T10:00:00Z',
        endsAt: '2024-12-10T11:00:00Z',
        userId: 'user-id',
        serviceId: 'service-id',
      };

      const mockAppointment = {
        id: 'appointment-id',
        ...createDto,
      };

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockAppointment as unknown);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockAppointment);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all appointments', async () => {
      const mockAppointments = [{ id: 'appointment-1' }];

      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue(mockAppointments as unknown);

      const result = await controller.findAll();

      expect(result).toEqual(mockAppointments);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return appointments by date', async () => {
      const date = '2024-12-10';
      const mockAppointments = [{ id: 'appointment-1' }];

      jest
        .spyOn(service, 'findByDate')
        .mockResolvedValue(mockAppointments as unknown);

      const result = await controller.findAll(date);

      expect(result).toEqual(mockAppointments);
      expect(service.findByDate).toHaveBeenCalledWith(new Date(date));
    });

    it('should return appointments by user', async () => {
      const userId = 'user-id';
      const mockAppointments = [{ id: 'appointment-1' }];

      jest
        .spyOn(service, 'findByUser')
        .mockResolvedValue(mockAppointments as unknown);

      const result = await controller.findAll(undefined, userId);

      expect(result).toEqual(mockAppointments);
      expect(service.findByUser).toHaveBeenCalledWith(userId);
    });

    it('should return appointments by status', async () => {
      const status = 'CONFIRMED';
      const mockAppointments = [{ id: 'appointment-1' }];

      jest
        .spyOn(service, 'findByStatus')
        .mockResolvedValue(mockAppointments as unknown);

      const result = await controller.findAll(undefined, undefined, status);

      expect(result).toEqual(mockAppointments);
      expect(service.findByStatus).toHaveBeenCalledWith(status);
    });
  });

  describe('findOne', () => {
    it('should return an appointment by id', async () => {
      const id = 'appointment-id';
      const mockAppointment = { id };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockAppointment as unknown);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockAppointment);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update an appointment', async () => {
      const id = 'appointment-id';
      const updateDto = { status: 'COMPLETED' as string };
      const mockAppointment = { id, ...updateDto };

      jest
        .spyOn(service, 'update')
        .mockResolvedValue(mockAppointment as unknown);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual(mockAppointment);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete an appointment', async () => {
      const id = 'appointment-id';
      const mockAppointment = { id };

      jest
        .spyOn(service, 'remove')
        .mockResolvedValue(mockAppointment as unknown);

      const result = await controller.remove(id);

      expect(result).toEqual(mockAppointment);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
