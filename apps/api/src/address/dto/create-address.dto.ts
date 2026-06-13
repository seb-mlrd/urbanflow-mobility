import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsString()
  label!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}
