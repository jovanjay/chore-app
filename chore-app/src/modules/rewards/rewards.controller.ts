import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  // Parent creates a reward
  @Post()
  createReward(@Body() createRewardDto: CreateRewardDto, @Request() req) {
    return this.rewardsService.createReward(createRewardDto, req.user.sub);
  }

  // Get all rewards (both parent and kids can view)
  @Get()
  getAllRewards(@Request() req) {
    return this.rewardsService.getAllRewards(req.user.sub);
  }

  // Get only active rewards
  @Get('active')
  getActiveRewards(@Request() req) {
    return this.rewardsService.getActiveRewards(req.user.sub);
  }

  // Get single reward
  @Get(':id')
  getReward(@Param('id') id: string, @Request() req) {
    return this.rewardsService.getReward(id, req.user.sub);
  }

  // Parent updates a reward
  @Put(':id')
  updateReward(
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
    @Request() req,
  ) {
    return this.rewardsService.updateReward(id, updateRewardDto, req.user.sub);
  }

  // Parent deletes a reward
  @Delete(':id')
  deleteReward(@Param('id') id: string, @Request() req) {
    return this.rewardsService.deleteReward(id, req.user.sub);
  }

  // Kid redeems a reward
  @Post('redeem')
  redeemReward(@Body() redeemRewardDto: RedeemRewardDto, @Request() req) {
    return this.rewardsService.redeemReward(redeemRewardDto, req.user.sub);
  }

  // Kid views their redemption history
  @Get('history/my')
  getRedemptionHistory(@Request() req) {
    return this.rewardsService.getRedemptionHistory(req.user.sub);
  }

  // Parent views a kid's redemption history
  @Get('history/kid/:kidId')
  getKidRedemptionHistory(@Param('kidId') kidId: string, @Request() req) {
    return this.rewardsService.getKidRedemptionHistory(kidId, req.user.sub);
  }
}

