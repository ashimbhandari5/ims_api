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

     //create
  async create(createRoleDto: CreateRoleDto) {
    createRoleDto.name=capitalizeFirstLetterOfEachWordInAPhrase(createRoleDto.name);
    if (await this.checkIfRoleExist(createRoleDto.name)){
      throw new BadRequestException(`Role ${createRoleDto.name} has been alreday taken`);
    }
    return this.PrismaService.role.create({ data: createRoleDto});
  }

  //findall
  findAll() {
    return this.PrismaService.role.findMany();
  }

  //findone
  async findOne(id: number) {
   return this.getRoleById(id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.getRoleById(id);
    updateRoleDto.name=capitalizeFirstLetterOfEachWordInAPhrase(updateRoleDto.name);
    if (await this.checkIfRoleExist(updateRoleDto.name)){
      throw new BadRequestException(`Role ${updateRoleDto.name} has been alreday taken`);
    }
    return this.PrismaService.role.update({
      where:{ id },
      data:updateRoleDto,
    });
  }

  //Remove
  async remove(id: number) {
   await this .getRoleById(id);
      return this.PrismaService.role.delete({where:{id}});
      }

      //private method for refactoring
private async getRoleById(id:number){
  const role =await this.PrismaService.role.findFirst({where:{id}});

  if (!role) {
throw new NotFoundException(`Role with id ${id} does not exist`);
  }
return role;
}


//private method for refactoring
private async checkIfRoleExist(name:string,id?:number): Promise<boolean>{
  const role= await this.PrismaService.role.findUnique({
    where: {name,}
  });
  if(id){
    return role ? role.id===id :true;
  }
  return !!role;
}
}