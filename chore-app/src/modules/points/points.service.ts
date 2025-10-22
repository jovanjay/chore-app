import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { Points, PointStatus } from '../../database/entities/points.entity';
import { Kids } from '../../database/entities/kids.entity';
import { User } from '../../database/entities/user.entity';
import { ClaimPointsDto } from './dto/claim-points.dto';

@Injectable()
export class PointsService {
  constructor(
    @Inject('POINTS_REPOSITORY')
    private pointsRepository: Repository<Points>,
    @Inject('KIDS_REPOSITORY')
    private kidsRepository: Repository<Kids>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  // Award points to a kid (called when chore is approved)
  async awardPoints(
    kidId: string,
    amount: number,
    choreId: string,
    description: string,
  ): Promise<Points> {
    const points = this.pointsRepository.create({
      amount,
      kidId,
      choreId,
      description,
      status: PointStatus.CLAIMABLE,
    });

    return this.pointsRepository.save(points);
  }

  // Get kid's available (claimable) points
  async getAvailablePoints(userId: string): Promise<{ points: Points[], total: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'child') {
      throw new ForbiddenException('Only kids can view their points');
    }

    const kid = await this.kidsRepository.findOne({ where: { userId } });
    if (!kid) {
      throw new NotFoundException('Kid profile not found');
    }

    const points = await this.pointsRepository.find({
      where: {
        kidId: kid.id,
        status: PointStatus.CLAIMABLE,
      },
      relations: ['chore'],
      order: { earnedAt: 'DESC' },
    });

    const total = points.reduce((sum, p) => sum + p.amount, 0);

    return { points, total };
  }

  // Get kid's points history (all points - claimed and unclaimed)
  async getPointsHistory(userId: string): Promise<{
    points: Points[],
    totalEarned: number,
    totalClaimed: number,
    totalAvailable: number,
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'child') {
      throw new ForbiddenException('Only kids can view their points');
    }

    const kid = await this.kidsRepository.findOne({ where: { userId } });
    if (!kid) {
      throw new NotFoundException('Kid profile not found');
    }

    const points = await this.pointsRepository.find({
      where: { kidId: kid.id },
      relations: ['chore'],
      order: { earnedAt: 'DESC' },
    });

    const totalEarned = points.reduce((sum, p) => sum + p.amount, 0);
    const totalClaimed = points
      .filter(p => p.status === PointStatus.CLAIMED)
      .reduce((sum, p) => sum + p.amount, 0);
    const totalAvailable = points
      .filter(p => p.status === PointStatus.CLAIMABLE)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      points,
      totalEarned,
      totalClaimed,
      totalAvailable,
    };
  }

  // Parent views a kid's points
  async getKidPoints(kidId: string, userId: string): Promise<{
    points: Points[],
    totalEarned: number,
    totalClaimed: number,
    totalAvailable: number,
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can view kid points');
    }

    // Verify kid belongs to parent
    const kid = await this.kidsRepository.findOne({
      where: { id: kidId, parentId: userId },
    });

    if (!kid) {
      throw new NotFoundException('Kid not found or does not belong to you');
    }

    const points = await this.pointsRepository.find({
      where: { kidId },
      relations: ['chore'],
      order: { earnedAt: 'DESC' },
    });

    const totalEarned = points.reduce((sum, p) => sum + p.amount, 0);
    const totalClaimed = points
      .filter(p => p.status === PointStatus.CLAIMED)
      .reduce((sum, p) => sum + p.amount, 0);
    const totalAvailable = points
      .filter(p => p.status === PointStatus.CLAIMABLE)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      points,
      totalEarned,
      totalClaimed,
      totalAvailable,
    };
  }

  // Kid claims points
  async claimPoints(claimPointsDto: ClaimPointsDto, userId: string): Promise<{
    claimedPoints: Points[],
    totalClaimed: number,
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'child') {
      throw new ForbiddenException('Only kids can claim points');
    }

    const kid = await this.kidsRepository.findOne({ where: { userId } });
    if (!kid) {
      throw new NotFoundException('Kid profile not found');
    }

    // Fetch points to claim
    const points = await this.pointsRepository.find({
      where: {
        id: In(claimPointsDto.pointIds),
        kidId: kid.id,
      },
    });

    if (points.length !== claimPointsDto.pointIds.length) {
      throw new NotFoundException('One or more points not found or do not belong to you');
    }

    // Verify all points are claimable
    const unclaimable = points.filter(p => p.status !== PointStatus.CLAIMABLE);
    if (unclaimable.length > 0) {
      throw new BadRequestException('Some points have already been claimed');
    }

    // Mark points as claimed
    const claimedAt = new Date();
    points.forEach(p => {
      p.status = PointStatus.CLAIMED;
      p.claimedAt = claimedAt;
    });

    const claimedPoints = await this.pointsRepository.save(points);
    const totalClaimed = claimedPoints.reduce((sum, p) => sum + p.amount, 0);

    return { claimedPoints, totalClaimed };
  }

  // Claim all available points
  async claimAllPoints(userId: string): Promise<{
    claimedPoints: Points[],
    totalClaimed: number,
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.userType !== 'child') {
      throw new ForbiddenException('Only kids can claim points');
    }

    const kid = await this.kidsRepository.findOne({ where: { userId } });
    if (!kid) {
      throw new NotFoundException('Kid profile not found');
    }

    // Get all claimable points
    const points = await this.pointsRepository.find({
      where: {
        kidId: kid.id,
        status: PointStatus.CLAIMABLE,
      },
    });

    if (points.length === 0) {
      throw new BadRequestException('No points available to claim');
    }

    // Mark all as claimed
    const claimedAt = new Date();
    points.forEach(p => {
      p.status = PointStatus.CLAIMED;
      p.claimedAt = claimedAt;
    });

    const claimedPoints = await this.pointsRepository.save(points);
    const totalClaimed = claimedPoints.reduce((sum, p) => sum + p.amount, 0);

    return { claimedPoints, totalClaimed };
  }
}

