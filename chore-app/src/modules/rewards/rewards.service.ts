import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Reward } from '../../database/entities/reward.entity';
import { Points, PointStatus } from '../../database/entities/points.entity';
import { Kids } from '../../database/entities/kids.entity';
import { User } from '../../database/entities/user.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RedeemRewardDto } from './dto/redeem-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    @Inject('REWARDS_REPOSITORY')
    private rewardsRepository: Repository<Reward>,
    @Inject('POINTS_REPOSITORY')
    private pointsRepository: Repository<Points>,
    @Inject('KIDS_REPOSITORY')
    private kidsRepository: Repository<Kids>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  // Parent creates a reward
  async createReward(
    createRewardDto: CreateRewardDto,
    userId: string,
  ): Promise<Reward> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can create rewards');
    }

    const reward = this.rewardsRepository.create({
      ...createRewardDto,
      parentId: userId,
    });

    return this.rewardsRepository.save(reward);
  }

  // Get all rewards (for both parents and kids)
  async getAllRewards(userId: string): Promise<Reward[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let parentId: string;

    if (user.userType === 'parent') {
      parentId = userId;
    } else if (user.userType === 'child') {
      // Get kid's parent
      const kid = await this.kidsRepository.findOne({ where: { userId } });
      if (!kid) {
        throw new NotFoundException('Kid profile not found');
      }
      parentId = kid.parentId;
    } else {
      throw new ForbiddenException('Invalid user type');
    }

    return this.rewardsRepository.find({
      where: { parentId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get active rewards only
  async getActiveRewards(userId: string): Promise<Reward[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let parentId: string;

    if (user.userType === 'parent') {
      parentId = userId;
    } else if (user.userType === 'child') {
      // Get kid's parent
      const kid = await this.kidsRepository.findOne({ where: { userId } });
      if (!kid) {
        throw new NotFoundException('Kid profile not found');
      }
      parentId = kid.parentId;
    } else {
      throw new ForbiddenException('Invalid user type');
    }

    return this.rewardsRepository.find({
      where: { parentId, isActive: true },
      order: { pointsCost: 'ASC' },
    });
  }

  // Get single reward
  async getReward(rewardId: string, userId: string): Promise<Reward> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reward = await this.rewardsRepository.findOne({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    // Verify access
    let parentId: string;
    if (user.userType === 'parent') {
      parentId = userId;
    } else if (user.userType === 'child') {
      const kid = await this.kidsRepository.findOne({ where: { userId } });
      if (!kid) {
        throw new NotFoundException('Kid profile not found');
      }
      parentId = kid.parentId;
    } else {
      throw new ForbiddenException('Invalid user type');
    }

    if (reward.parentId !== parentId) {
      throw new ForbiddenException('You do not have access to this reward');
    }

    return reward;
  }

  // Parent updates a reward
  async updateReward(
    rewardId: string,
    updateRewardDto: UpdateRewardDto,
    userId: string,
  ): Promise<Reward> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can update rewards');
    }

    const reward = await this.rewardsRepository.findOne({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (reward.parentId !== userId) {
      throw new ForbiddenException('You can only update your own rewards');
    }

    Object.assign(reward, updateRewardDto);

    return this.rewardsRepository.save(reward);
  }

  // Parent deletes a reward
  async deleteReward(rewardId: string, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can delete rewards');
    }

    const reward = await this.rewardsRepository.findOne({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (reward.parentId !== userId) {
      throw new ForbiddenException('You can only delete your own rewards');
    }

    await this.rewardsRepository.remove(reward);
  }

  // Kid redeems a reward
  async redeemReward(
    redeemRewardDto: RedeemRewardDto,
    userId: string,
  ): Promise<{
    reward: Reward;
    pointsUsed: number;
    remainingPoints: number;
    claimedPoints: Points[];
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.userType !== 'child') {
      throw new ForbiddenException('Only kids can redeem rewards');
    }

    const kid = await this.kidsRepository.findOne({ where: { userId } });
    if (!kid) {
      throw new NotFoundException('Kid profile not found');
    }

    // Get the reward
    const reward = await this.rewardsRepository.findOne({
      where: { id: redeemRewardDto.rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (!reward.isActive) {
      throw new BadRequestException('This reward is no longer available');
    }

    // Verify reward belongs to kid's parent
    if (reward.parentId !== kid.parentId) {
      throw new ForbiddenException('This reward does not belong to your family');
    }

    // Get kid's available (claimable) points
    const availablePoints = await this.pointsRepository.find({
      where: {
        kidId: kid.id,
        status: PointStatus.CLAIMABLE,
      },
      order: { earnedAt: 'ASC' }, // Use oldest points first (FIFO)
    });

    const totalAvailable = availablePoints.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    // Check if kid has enough points
    if (totalAvailable < reward.pointsCost) {
      throw new BadRequestException(
        `Insufficient points. You have ${totalAvailable} points but need ${reward.pointsCost} points.`,
      );
    }

    // Deduct points using FIFO (oldest points first)
    let pointsNeeded = reward.pointsCost;
    const claimedPoints: Points[] = [];

    for (const point of availablePoints) {
      if (pointsNeeded <= 0) break;

      // Mark point as claimed and associate with reward
      point.status = PointStatus.CLAIMED;
      point.claimedAt = new Date();
      point.rewardId = reward.id;

      pointsNeeded -= point.amount;
      claimedPoints.push(point);
    }

    // Save all claimed points
    await this.pointsRepository.save(claimedPoints);

    // Calculate remaining points after redemption
    const remainingPointsEntities = await this.pointsRepository.find({
      where: {
        kidId: kid.id,
        status: PointStatus.CLAIMABLE,
      },
    });

    const remainingPoints = remainingPointsEntities.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    return {
      reward,
      pointsUsed: reward.pointsCost,
      remainingPoints,
      claimedPoints,
    };
  }

  // Get redemption history for a kid
  async getRedemptionHistory(userId: string): Promise<{
    redemptions: Array<{
      reward: Reward;
      points: Points[];
      totalPointsUsed: number;
      redeemedAt: Date;
    }>;
    totalRedemptions: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.userType !== 'child') {
      throw new ForbiddenException('Only kids can view their redemption history');
    }

    const kid = await this.kidsRepository.findOne({ where: { userId } });
    if (!kid) {
      throw new NotFoundException('Kid profile not found');
    }

    // Get all claimed points that have a reward associated
    const claimedPoints = await this.pointsRepository.find({
      where: {
        kidId: kid.id,
        status: PointStatus.CLAIMED,
      },
      relations: ['reward'],
      order: { claimedAt: 'DESC' },
    });

    // Filter points that were used for rewards
    const rewardPoints = claimedPoints.filter((p) => p.rewardId !== null);

    // Group by reward
    const redemptionMap = new Map<
      string,
      {
        reward: Reward;
        points: Points[];
        totalPointsUsed: number;
        redeemedAt: Date;
      }
    >();

    for (const point of rewardPoints) {
      if (!redemptionMap.has(point.rewardId)) {
        redemptionMap.set(point.rewardId, {
          reward: point.reward,
          points: [],
          totalPointsUsed: 0,
          redeemedAt: point.claimedAt,
        });
      }

      const redemption = redemptionMap.get(point.rewardId);
      if (redemption) {
        redemption.points.push(point);
        redemption.totalPointsUsed += point.amount;

        // Use the earliest claimedAt date for the redemption
        if (point.claimedAt < redemption.redeemedAt) {
          redemption.redeemedAt = point.claimedAt;
        }
      }
    }

    const redemptions = Array.from(redemptionMap.values());

    return {
      redemptions,
      totalRedemptions: redemptions.length,
    };
  }

  // Parent views a kid's redemption history
  async getKidRedemptionHistory(
    kidId: string,
    userId: string,
  ): Promise<{
    redemptions: Array<{
      reward: Reward;
      points: Points[];
      totalPointsUsed: number;
      redeemedAt: Date;
    }>;
    totalRedemptions: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.userType !== 'parent') {
      throw new ForbiddenException('Only parents can view kid redemption history');
    }

    // Verify kid belongs to parent
    const kid = await this.kidsRepository.findOne({
      where: { id: kidId, parentId: userId },
    });

    if (!kid) {
      throw new NotFoundException('Kid not found or does not belong to you');
    }

    // Get all claimed points that have a reward associated
    const claimedPoints = await this.pointsRepository.find({
      where: {
        kidId,
        status: PointStatus.CLAIMED,
      },
      relations: ['reward'],
      order: { claimedAt: 'DESC' },
    });

    // Filter points that were used for rewards
    const rewardPoints = claimedPoints.filter((p) => p.rewardId !== null);

    // Group by reward
    const redemptionMap = new Map<
      string,
      {
        reward: Reward;
        points: Points[];
        totalPointsUsed: number;
        redeemedAt: Date;
      }
    >();

    for (const point of rewardPoints) {
      if (!redemptionMap.has(point.rewardId)) {
        redemptionMap.set(point.rewardId, {
          reward: point.reward,
          points: [],
          totalPointsUsed: 0,
          redeemedAt: point.claimedAt,
        });
      }

      const redemption = redemptionMap.get(point.rewardId);
      if (redemption) {
        redemption.points.push(point);
        redemption.totalPointsUsed += point.amount;

        // Use the earliest claimedAt date for the redemption
        if (point.claimedAt < redemption.redeemedAt) {
          redemption.redeemedAt = point.claimedAt;
        }
      }
    }

    const redemptions = Array.from(redemptionMap.values());

    return {
      redemptions,
      totalRedemptions: redemptions.length,
    };
  }
}

