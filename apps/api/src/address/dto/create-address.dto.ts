import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Maison', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: '12 rue de la Paix, 59000 Lille' })
  @IsString()
  label!: string;

  @ApiProperty({ example: 50.6292 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 3.0573 })
  @IsNumber()
  lng!: number;
}
