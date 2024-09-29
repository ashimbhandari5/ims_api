import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(private prismaService:PrismaService,
        private jwtService:JwtService,)
    {}

    //login ko lagi
async login(loginDto:LoginDto){

    const user=await this.prismaService.user.findFirst({
        where:{
            OR:[
                {email:loginDto.username,

                },
                {
                    mobile:loginDto.username,
                },
            ],
        },
        include:{
            role:true,organization:true,
        }
    });
    if(!user){
        throw new NotFoundException("Unable to fnd the user");

    }
    if(!await compare(loginDto.password,user.password)){
        throw new UnauthorizedException("invalid credentials!");

    }
    const token=await this.jwtService.signAsync(user);
    return{
        token,
    }


}//register ko lagi

async register(registerDto: RegisterDto){
    const userService=new UsersService(this.prismaService);
    const user= await userService.create(registerDto);
    const token=await this.jwtService.signAsync(user);
    return {
        token,
    }
}
}
