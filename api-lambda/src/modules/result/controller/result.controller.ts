import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { Public } from '@modules/auth/decorators/public.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';

import { Role } from '../../auth/enums/role.enum';
import { CreateResultInput } from '../model/create.input';
import { ResultService } from '../service/result.service';

@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  // Public route
  @Post()
  @Public()
  create(@Body() createResultInput: CreateResultInput) {
    return this.resultService.create(createResultInput);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('limit') limit: number, @Query('lastKey') lastKey: string) {
    return this.resultService.findAll(limit, lastKey);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param(':id') resultId: string) {
    return this.resultService.findOne(resultId);
  }
}
