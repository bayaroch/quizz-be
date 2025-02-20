import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Role } from '@modules/auth/enums/role.enum';

import { CreateQuizInput } from '../model/create.input';
import { UpdateQuizInput } from '../model/update.input';
import { QuizService } from '../service/quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createQuizInput: CreateQuizInput) {
    return this.quizService.create(createQuizInput);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('limit') limit: number, @Query('lastKey') lastKey: string) {
    return this.quizService.findAll(limit, lastKey);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param(':id') quizId: string) {
    return this.quizService.findOne(quizId);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param(':id') quizId: string,
    @Body() updateQuizInput: UpdateQuizInput,
  ) {
    return this.quizService.update(quizId, updateQuizInput);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param(':id') quizId: string) {
    return this.quizService.remove(quizId);
  }
}
