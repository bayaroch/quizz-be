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

import { Public } from '@modules/auth/decorators/public.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';

import { Role } from '../../auth/enums/role.enum';
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
  @Public()
  @Roles(Role.ADMIN)
  findAll(@Query('limit') limit: number, @Query('lastKey') lastKey: string) {
    return this.quizService.findAll(limit, lastKey);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateQuizInput: UpdateQuizInput) {
    console.log('1111', id);
    return this.quizService.update(id, updateQuizInput);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }

  @Get('seo/list')
  @Public()
  getAllSeo(@Query('limit') limit: number, @Query('lastKey') lastKey: string) {
    return this.quizService.findAllSeo(limit, lastKey);
  }

  @Get('seo/:id')
  @Public()
  findOneSeo(@Param('id') id: string) {
    return this.quizService.findOneSeo(id);
  }
}
//test deploy
