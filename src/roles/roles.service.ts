import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor (private PrismaService: PrismaService){
     }

  async create(createRoleDto: CreateRoleDto) {
    createRoleDto.name=capitalizeFirstLetterOfEachWordInAPhrase(createRoleDto.name);
    const role = await this.PrismaService.role.findFirst({
where:{
  name:createRoleDto.name,
},
    });
    if(role){
      throw new BadRequestException(`Role ${createRoleDto.name} lisakeko xa`);
    }
    return this.PrismaService.role.create({ data: createRoleDto});
  }

  findAll() {
    return this.PrismaService.role.findMany();
  }

  async findOne(id: number) {
   return this.getRoleById(id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.getRoleById(id);
    updateRoleDto.name=capitalizeFirstLetterOfEachWordInAPhrase(updateRoleDto.name);
    const role = await this.PrismaService.role.findFirst({
where:{
  name:updateRoleDto.name,
},
    });
    if(role && role.id !==id){
      throw new BadRequestException(`Role ${updateRoleDto.name} lisakeko xa`);
    }
    return this.PrismaService.role.update({
      where:{ id },
      data:updateRoleDto,
    });
  }

  async remove(id: number) {
   await this .getRoleById(id);
      return this.PrismaService.role.delete({where:{id}});
      }
private async getRoleById(id:number){
  const role =await this.PrismaService.role.findFirst({where:{id}});

  if (!role) {
throw new NotFoundException(`Role with id ${id} does not exist`);
  }
return role;
}
}

