import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Kids } from '../../database/entities/kids.entity';
import { User } from '../../database/entities/user.entity';
import { CreateKidDto } from './dto/create-kid.dto';
import { UpdateKidDto } from './dto/update-kid.dto';
import { KidResponseDto } from './dto/kid-response.dto';

@Injectable()
export class KidsService {
  constructor(
    @Inject('KIDS_REPOSITORY')
    private kidsRepository: Repository<Kids>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  private generatePassword(parentEmail: string, kidName: string, kidNumber: number): string {
    // Use easy-to-read characters (avoiding 0/O, 1/l/I, etc.)
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I, O
    const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // No i, l, o
    const numbers = '23456789'; // No 0, 1
    const symbols = '@#$%';
    
    // Create seed from parent info for consistent but secure generation
    const seed = `${parentEmail}${kidName}${kidNumber}${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Simple pseudo-random generator using seed
    const seededRandom = (max: number, offset: number = 0): number => {
      const x = Math.sin(hash + offset) * 10000;
      return Math.floor((x - Math.floor(x)) * max);
    };
    
    // Generate 8-character password: 2 uppercase, 3 lowercase, 2 numbers, 1 symbol
    let password = '';
    password += uppercase[seededRandom(uppercase.length, 1)];
    password += uppercase[seededRandom(uppercase.length, 2)];
    password += lowercase[seededRandom(lowercase.length, 3)];
    password += lowercase[seededRandom(lowercase.length, 4)];
    password += lowercase[seededRandom(lowercase.length, 5)];
    password += numbers[seededRandom(numbers.length, 6)];
    password += numbers[seededRandom(numbers.length, 7)];
    password += symbols[seededRandom(symbols.length, 8)];
    
    // Shuffle the password
    return password.split('').sort(() => Math.sin(hash++) - 0.5).join('');
  }

  private async generateKidEmail(parentEmail: string, parentId: string): Promise<string> {
    // Get the count of existing kids for this parent
    const existingKidsCount = await this.kidsRepository.count({
      where: { parentId },
    });
    
    // Split email into local part and domain
    const [localPart, domain] = parentEmail.split('@');
    
    // Generate email with incremental number
    const kidNumber = existingKidsCount + 1;
    return `${localPart}+${kidNumber}@${domain}`;
  }

  async create(createKidDto: CreateKidDto, userId: string): Promise<KidResponseDto> {
    // Check if user is a parent
    const parent = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!parent) {
      throw new NotFoundException('User not found');
    }

    if (parent.userType !== 'parent') {
      throw new ForbiddenException('Only users with userType "parent" can create kids');
    }

    // Get kid number for password generation
    const existingKidsCount = await this.kidsRepository.count({
      where: { parentId: userId },
    });
    const kidNumber = existingKidsCount + 1;
    
    // Generate email and password
    const generatedEmail = await this.generateKidEmail(parent.email, userId);
    const generatedPassword = this.generatePassword(parent.email, createKidDto.name, kidNumber);

    // Check if generated email already exists (shouldn't happen, but just in case)
    const existingUser = await this.userRepository.findOne({ 
      where: { email: generatedEmail } 
    });

    if (existingUser) {
      throw new ConflictException('Generated email already exists. Please try again.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user account for the kid
    const kidUser = this.userRepository.create({
      email: generatedEmail,
      password: hashedPassword,
      userType: 'child',
      firstName: createKidDto.name.split(' ')[0] || createKidDto.name,
      lastName: createKidDto.name.split(' ').slice(1).join(' ') || '',
      active: true,
    });

    const savedKidUser = await this.userRepository.save(kidUser);

    // Create kid record
    const kid = this.kidsRepository.create({
      name: createKidDto.name,
      dateOfBirth: createKidDto.dateOfBirth,
      age: createKidDto.age,
      gender: createKidDto.gender,
      notes: createKidDto.notes,
      parentId: userId,
      userId: savedKidUser.id,
    });

    const savedKid = await this.kidsRepository.save(kid);

    // Return kid with generated credentials
    return {
      ...savedKid,
      email: generatedEmail,
      password: generatedPassword, // Plain text password for parent to see
    };
  }

  async findAll(userId: string): Promise<Kids[]> {
    // Check if user is a parent
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.userType !== 'parent') {
      throw new ForbiddenException('Only users with userType "parent" can view kids');
    }

    return this.kidsRepository.find({
      where: { parentId: userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Kids> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.userType !== 'parent') {
      throw new ForbiddenException('Only users with userType "parent" can view kids');
    }

    const kid = await this.kidsRepository.findOne({
      where: { id, parentId: userId },
      relations: ['user'],
    });

    if (!kid) {
      throw new NotFoundException('Kid not found');
    }

    return kid;
  }

  async update(id: string, updateKidDto: UpdateKidDto, userId: string): Promise<Kids> {
    const kid = await this.findOne(id, userId);

    Object.assign(kid, updateKidDto);
    return this.kidsRepository.save(kid);
  }

  async remove(id: string, userId: string): Promise<void> {
    const kid = await this.findOne(id, userId);
    
    // Remove the kid's user account (CASCADE will handle the kid record)
    if (kid.userId) {
      const kidUser = await this.userRepository.findOne({ where: { id: kid.userId } });
      if (kidUser) {
        await this.userRepository.remove(kidUser);
      }
    }
    
    await this.kidsRepository.remove(kid);
  }

  async findByParent(parentId: string): Promise<Kids[]> {
    return this.kidsRepository.find({
      where: { parentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyProfile(userId: string): Promise<Kids> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.userType !== 'child') {
      throw new ForbiddenException('Only users with userType "child" can access this endpoint');
    }

    const kid = await this.kidsRepository.findOne({
      where: { userId },
      relations: ['user', 'parent'],
    });

    if (!kid) {
      throw new NotFoundException('Kid profile not found');
    }

    return kid;
  }
}

