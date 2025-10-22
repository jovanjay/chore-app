import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { ClaimPointsDto } from './dto/claim-points.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  // Kid gets their available points
  @Get('available')
  getAvailablePoints(@Request() req) {
    return this.pointsService.getAvailablePoints(req.user.sub);
  }

  // Kid gets their complete points history
  @Get('history')
  getPointsHistory(@Request() req) {
    return this.pointsService.getPointsHistory(req.user.sub);
  }

  // Parent views a kid's points
  @Get('kid/:kidId')
  getKidPoints(@Param('kidId') kidId: string, @Request() req) {
    return this.pointsService.getKidPoints(kidId, req.user.sub);
  }

  // Kid claims specific points
  @Post('claim')
  claimPoints(@Body() claimPointsDto: ClaimPointsDto, @Request() req) {
    return this.pointsService.claimPoints(claimPointsDto, req.user.sub);
  }

  // Kid claims all available points
  @Post('claim-all')
  claimAllPoints(@Request() req) {
    return this.pointsService.claimAllPoints(req.user.sub);
  }
}

