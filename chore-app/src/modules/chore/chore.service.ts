import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { Chore, ChoreStatus } from '../../database/entities/chore.entity';
import { Kids } from '../../database/entities/kids.entity';
import { User } from '../../database/entities/user.entity';
import { CreateChoreDto } from './dto/create-chore.dto';
import { UpdateChoreDto } from './dto/update-chore.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignKidsDto } from './dto/assign-kids.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ChoreService {
  constructor(
    @Inject('CHORE_REPOSITORY')
    private choreRepository: Repository<Chore>,
    @Inject('KIDS_REPOSITORY')
    private kidsRepository: Repository<Kids>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private s3Service: S3Service,
    @Inject('POINTS_SERVICE')
    private pointsService?: any, // Optional - injected when PointsModule is available
  ) {}

  // Parent creates a chore (can optionally assign kids immediately)
  async create(createChoreDto: CreateChoreDto, userId: string): Promise<Chore> {
    // Verify user is a parent
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can create chores');
    }

    // If kidIds provided, verify they all belong to this parent
    let assignedKids: Kids[] = [];
    if (createChoreDto.kidIds && createChoreDto.kidIds.length > 0) {
      assignedKids = await this.kidsRepository.find({
        where: {
          id: In(createChoreDto.kidIds),
          parentId: userId,
        },
      });

      if (assignedKids.length !== createChoreDto.kidIds.length) {
        throw new NotFoundException('One or more kids not found or do not belong to you');
      }
    }

    // Create chore
    const chore = this.choreRepository.create({
      title: createChoreDto.title,
      description: createChoreDto.description,
      points: createChoreDto.points || 0,
      parentId: userId,
      status: ChoreStatus.CREATED,
      assignedKids: assignedKids,
    });

    return this.choreRepository.save(chore);
  }

  // Get all chores (parent sees all their chores, kid sees only their chores)
  async findAll(userId: string): Promise<Chore[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.userType === 'parent') {
      // Parent sees all chores they created
      return this.choreRepository.find({
        where: { parentId: userId },
        relations: ['assignedKids', 'assignedKids.user'],
        order: { createdAt: 'DESC' },
      });
    } else if (user.userType === 'child') {
      // Kid sees only chores assigned to them
      const kid = await this.kidsRepository.findOne({ where: { userId } });
      
      if (!kid) {
        throw new NotFoundException('Kid profile not found');
      }

      // Find chores where this kid is in assignedKids
      const chores = await this.choreRepository
        .createQueryBuilder('chore')
        .leftJoinAndSelect('chore.assignedKids', 'kid')
        .leftJoinAndSelect('chore.parent', 'parent')
        .where('kid.id = :kidId', { kidId: kid.id })
        .orderBy('chore.createdAt', 'DESC')
        .getMany();

      return chores;
    }

    throw new ForbiddenException('Invalid user type');
  }

  // Get a specific chore
  async findOne(id: string, userId: string): Promise<Chore> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let chore: Chore | null = null;

    if (user.userType === 'parent') {
      chore = await this.choreRepository.findOne({
        where: { id, parentId: userId },
        relations: ['assignedKids', 'assignedKids.user'],
      });
    } else if (user.userType === 'child') {
      const kid = await this.kidsRepository.findOne({ where: { userId } });
      
      if (!kid) {
        throw new NotFoundException('Kid profile not found');
      }

      // Find chore where this kid is assigned
      chore = await this.choreRepository
        .createQueryBuilder('chore')
        .leftJoinAndSelect('chore.assignedKids', 'kid')
        .leftJoinAndSelect('chore.parent', 'parent')
        .where('chore.id = :choreId', { choreId: id })
        .andWhere('kid.id = :kidId', { kidId: kid.id })
        .getOne();
    }

    if (!chore) {
      throw new NotFoundException('Chore not found');
    }

    return chore;
  }

  // Parent updates chore details
  async update(id: string, updateChoreDto: UpdateChoreDto, userId: string): Promise<Chore> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can update chores');
    }

    const chore = await this.choreRepository.findOne({
      where: { id, parentId: userId },
    });

    if (!chore) {
      throw new NotFoundException('Chore not found');
    }

    Object.assign(chore, updateChoreDto);
    return this.choreRepository.save(chore);
  }

  // Assign kids to a chore
  async assignKids(id: string, assignKidsDto: AssignKidsDto, userId: string): Promise<Chore> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can assign kids to chores');
    }

    const chore = await this.choreRepository.findOne({
      where: { id, parentId: userId },
      relations: ['assignedKids'],
    });

    if (!chore) {
      throw new NotFoundException('Chore not found');
    }

    // Verify all kids belong to this parent
    const kids = await this.kidsRepository.find({
      where: {
        id: In(assignKidsDto.kidIds),
        parentId: userId,
      },
    });

    if (kids.length !== assignKidsDto.kidIds.length) {
      throw new NotFoundException('One or more kids not found or do not belong to you');
    }

    // Add new kids to existing assignments (avoid duplicates)
    const existingKidIds = chore.assignedKids.map(k => k.id);
    const newKids = kids.filter(k => !existingKidIds.includes(k.id));
    
    chore.assignedKids = [...chore.assignedKids, ...newKids];
    
    return this.choreRepository.save(chore);
  }

  // Unassign a kid from a chore
  async unassignKid(id: string, kidId: string, userId: string): Promise<Chore> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can unassign kids from chores');
    }

    const chore = await this.choreRepository.findOne({
      where: { id, parentId: userId },
      relations: ['assignedKids'],
    });

    if (!chore) {
      throw new NotFoundException('Chore not found');
    }

    // Remove kid from assignedKids
    chore.assignedKids = chore.assignedKids.filter(k => k.id !== kidId);
    
    return this.choreRepository.save(chore);
  }

  // Change chore status (workflow)
  async changeStatus(id: string, changeStatusDto: ChangeStatusDto, userId: string): Promise<Chore> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let chore: Chore | null = null;

    if (user.userType === 'parent') {
      chore = await this.choreRepository.findOne({
        where: { id, parentId: userId },
        relations: ['assignedKids'],
      });
    } else if (user.userType === 'child') {
      const kid = await this.kidsRepository.findOne({ where: { userId } });
      if (!kid) {
        throw new NotFoundException('Kid profile not found');
      }

      // Verify kid is assigned to this chore
      chore = await this.choreRepository
        .createQueryBuilder('chore')
        .leftJoinAndSelect('chore.assignedKids', 'kid')
        .where('chore.id = :choreId', { choreId: id })
        .andWhere('kid.id = :kidId', { kidId: kid.id })
        .getOne();
    }

    if (!chore) {
      throw new NotFoundException('Chore not found or not assigned to you');
    }

    // Validate status transition
    this.validateStatusTransition(chore.status, changeStatusDto.status, user.userType);

    // Update status
    chore.status = changeStatusDto.status;

    // Set dateStarted when kid starts the chore
    if (changeStatusDto.status === ChoreStatus.STARTED && !chore.dateStarted) {
      chore.dateStarted = new Date();
    }

    // Update photo if provided (when kid finishes)
    if (changeStatusDto.photo) {
      chore.photo = changeStatusDto.photo;
    }

    const savedChore = await this.choreRepository.save(chore);

    // Award points to all assigned kids when parent approves
    if (changeStatusDto.status === ChoreStatus.APPROVED && chore.points > 0 && this.pointsService) {
      // Fetch chore with assignedKids if not already loaded
      const choreWithKids = await this.choreRepository.findOne({
        where: { id: chore.id },
        relations: ['assignedKids'],
      });

      if (choreWithKids && choreWithKids.assignedKids) {
        // Award points to each assigned kid
        for (const kid of choreWithKids.assignedKids) {
          await this.pointsService.awardPoints(
            kid.id,
            chore.points,
            chore.id,
            `Completed: ${chore.title}`,
          );
        }
      }
    }

    return savedChore;
  }

  // Upload photo (kid uploads proof)
  async uploadPhoto(id: string, file: Express.Multer.File, userId: string): Promise<Chore> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'child') {
      throw new ForbiddenException('Only kids can upload photos');
    }

    const kid = await this.kidsRepository.findOne({ where: { userId } });
    if (!kid) {
      throw new NotFoundException('Kid profile not found');
    }

    // Verify kid is assigned to this chore
    const chore = await this.choreRepository
      .createQueryBuilder('chore')
      .leftJoinAndSelect('chore.assignedKids', 'kid')
      .where('chore.id = :choreId', { choreId: id })
      .andWhere('kid.id = :kidId', { kidId: kid.id })
      .getOne();

    if (!chore) {
      throw new NotFoundException('Chore not found or not assigned to you');
    }

    // Delete old photo from S3 if exists
    if (chore.photo && this.s3Service.isConfigured()) {
      try {
        await this.s3Service.deleteFile(chore.photo);
      } catch (error) {
        // Log error but don't fail the upload
        console.error('Failed to delete old photo from S3:', error);
      }
    }

    // Upload new photo to S3
    const photoUrl = await this.s3Service.uploadFile(file, 'chore-photos');
    chore.photo = photoUrl;
    
    return this.choreRepository.save(chore);
  }

  // Delete chore (parent only)
  async remove(id: string, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can delete chores');
    }

    const chore = await this.choreRepository.findOne({
      where: { id, parentId: userId },
    });

    if (!chore) {
      throw new NotFoundException('Chore not found');
    }

    await this.choreRepository.remove(chore);
  }

  // Validate status transition based on user type and current status
  private validateStatusTransition(
    currentStatus: ChoreStatus,
    newStatus: ChoreStatus,
    userType: string,
  ): void {
    // Parent can only approve, redo, or reject
    if (userType === 'parent') {
      const allowedParentStatuses = [ChoreStatus.APPROVED, ChoreStatus.REDO, ChoreStatus.REJECTED];
      
      if (!allowedParentStatuses.includes(newStatus)) {
        throw new BadRequestException('Parents can only approve, redo, or reject chores');
      }

      // Parent can only change status when chore is finished
      if (currentStatus !== ChoreStatus.FINISHED) {
        throw new BadRequestException('Can only approve/reject chores that are finished');
      }
    }

    // Kid can only start or finish
    if (userType === 'child') {
      const allowedKidStatuses = [ChoreStatus.STARTED, ChoreStatus.FINISHED];
      
      if (!allowedKidStatuses.includes(newStatus)) {
        throw new BadRequestException('Kids can only start or finish chores');
      }

      // Kid can start only if created or redo
      if (newStatus === ChoreStatus.STARTED) {
        if (currentStatus !== ChoreStatus.CREATED && currentStatus !== ChoreStatus.REDO) {
          throw new BadRequestException('Can only start chores that are created or need redo');
        }
      }

      // Kid can finish only if started
      if (newStatus === ChoreStatus.FINISHED) {
        if (currentStatus !== ChoreStatus.STARTED) {
          throw new BadRequestException('Can only finish chores that are started');
        }
      }
    }
  }
}
