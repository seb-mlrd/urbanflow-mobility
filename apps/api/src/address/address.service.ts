import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity.js';
import { CreateAddressDto } from './dto/create-address.dto.js';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  findAllByProfileId(profileId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { profileId },
      order: { createdAt: 'ASC' },
    });
  }

  create(profileId: string, dto: CreateAddressDto): Promise<Address> {
    return this.addressRepo.save(
      this.addressRepo.create({ ...dto, profileId }),
    );
  }

  async delete(id: string, profileId: string): Promise<void> {
    const address = await this.addressRepo.findOne({ where: { id, profileId } });
    if (!address) throw new NotFoundException();
    await this.addressRepo.remove(address);
  }
}
