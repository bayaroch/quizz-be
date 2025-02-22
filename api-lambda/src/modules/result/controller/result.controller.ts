import { Response } from 'express';

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';

import { Public } from '@modules/auth/decorators/public.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';

import { Role } from '../../auth/enums/role.enum';
import { CreateInvoiceInput } from '../model/create-invoice.input';
import { CreateResultInput } from '../model/create.input';
import { QpayService } from '../service/qpay.service';
import { ResultService } from '../service/result.service';

@Controller('result')
export class ResultController {
  constructor(
    private readonly resultService: ResultService,
    private readonly qpayService: QpayService,
  ) {}

  // Public route
  @Public()
  @Post()
  create(@Body() createResultInput: CreateResultInput) {
    console.log('asdf');
    return this.resultService.create(createResultInput);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('limit') limit: number, @Query('lastKey') lastKey: string) {
    return this.resultService.findAll(limit, lastKey);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') resultId: string) {
    return this.resultService.findOne(resultId);
  }

  @Post('create-invoice')
  @Public()
  createInvoice(@Body() createInvoiceInput: CreateInvoiceInput) {
    return this.resultService.createInvoice(createInvoiceInput);
  }

  // QPay webhook callback
  @Public()
  @Get('qpay/payments')
  async qpayPaymentCallback(
    @Query('result_id') resultId: string,
    @Res() res: Response,
  ) {
    await this.qpayService.checkPaymentStatus(resultId);
    await this.resultService.updateTransactionStatus(resultId);
    res.status(HttpStatus.OK).send('EVENT_RECEIVED');
  }

  @Public()
  @Get('qpay/check-payment')
  async checkPayment(@Query('result_id') resultId: string) {
    return this.qpayService.checkPaymentStatus(resultId);
  }
}
