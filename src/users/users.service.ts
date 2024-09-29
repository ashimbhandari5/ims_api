import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { hash } from 'bcrypt';
import { RolesService } from 'src/roles/roles.service';
import { OrganizationsService } from 'src/organizations/organizations.service';

@Injectable()
export class UsersService {
  constructor(private prismaservice: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const roleService = new RolesService(this.prismaservice);
    const organizationService = new OrganizationsService(this.prismaservice);

    await roleService.findOne(createUserDto.role_id);
    await organizationService.findOne(createUserDto.organization_id);

    createUserDto.name = capitalizeFirstLetterOfEachWordInAPhrase(
      createUserDto.name,
    );

    if (await this.checkIfEmailExist(createUserDto.email)) {
      throw new BadRequestException('Email already taken');
    }
    if (await this.checkIfMobileExist(createUserDto.mobile)) {
      throw new BadRequestException('Mobile already taken');
    }
    createUserDto.password = await hash(createUserDto.password, 10);
    return this.prismaservice.user.create({ data: createUserDto });
  }

  findAll() {
    return this.prismaservice.user.findMany();
  }

  async findOne(id: number) {
    return this.getUserById(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.getUserById(id);
    updateUserDto.name = capitalizeFirstLetterOfEachWordInAPhrase(
      updateUserDto.name,
    );

    if (!(await this.checkIfUserExist(updateUserDto.name, id))) {
      throw new BadRequestException('This user already exists');
    }
    if (await this.checkIfEmailExist(updateUserDto.email)){
      throw new BadRequestException(`User ${updateUserDto.email} has been already taken`);
    }
    if (await this.checkIfMobileExist(updateUserDto.mobile)){
      throw new BadRequestException(`User ${updateUserDto.mobile} ha been already taken`);
    }
    return this.prismaservice.user.update({ where: { id }, data: updateUserDto,});
  }

  async remove(id: number) {
    return this.prismaservice.user.delete({ where: { id } });
  }

  //private function
  private async checkIfUserExist(name: string, id?: number): Promise<boolean> {
    const user = await this.prismaservice.user.findUnique({
      where: { id },
    });
    if (id) {
      return user ? user.id === id : true;
    }
    return !!user;
  }

  private async checkIfEmailExist(
    email: string,
    id?: number,
  ): Promise<boolean> {
    const user = await this.prismaservice.user.findUnique({
      where: { email },
    });
    if (id) {
      return user ? user.id === id : true;
    }
    return !!user;
  }

  private async checkIfMobileExist(
    mobile: string,
    id?: number,
  ): Promise<boolean> {
    const user = await this.prismaservice.user.findUnique({
      where: { mobile },
    });
    if (id) {
      return user ? user.id === id : true;
    }
    return !!user;
  }

  private async getUserById(id: number) {
    const user = await this.prismaservice.user.findFirst({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} does not exist`);
    }
    return user;
  }
}
