import { IsString } from 'class-validator';

export class CreateInvoiceInput {
  @IsString()
  result_id: string;
}
