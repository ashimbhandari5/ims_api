import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';



@Injectable()
export class ItemsService {
constructor(private prismaService:PrismaService){}

  async create(createItemDto: CreateItemDto) {
    createItemDto.name=capitalizeFirstLetterOfEachWordInAPhrase(createItemDto.name);

    return this.prismaService.$transaction(async(tx)=>{

const item= await tx.item.upsert({
  where:{
    name:createItemDto.name,},
  update: {},
  create:{
          name:createItemDto.name,
          quantity:createItemDto.quantity,
          price:createItemDto.price,

          ...(createItemDto.description && {
            description:createItemDto.description,
          }),
          ...(createItemDto.discount &&{
            discount:createItemDto.discount,
          }),
          ...(createItemDto.discount_type &&{
            discount_type:createItemDto.discount_type,
          }),
          ...(createItemDto.tax &&{
            tax:createItemDto.tax,
          }),
          },
  });
      const itemOrganization= await this.prismaService.itemOrganization.findFirst({
        where:{
          item_id :item.id,
          organization_id: createItemDto.organization_id,
        },
      });
      if(itemOrganization){
        throw new ConflictException('this item has been already taken');
      }
      await tx.itemOrganization.create({
        data:{
          item_id:item.id,
          organization_id:createItemDto.organization_id,
        }
      });
      return item;
    });
  }
  
  async findAll( organization_id : number ) {
    return this.prismaService.itemOrganization.findMany({
      where:{organization_id},
      include:{
        item:true,
      },
    });
  }

  findOne(organization_id:number, id:number) {
    return this.getItemById(id,organization_id);
  }

   async update(id: number,organization_id:number, updateItemDto: UpdateItemDto) {
    await this.getItemById(id,organization_id)
    updateItemDto.name= capitalizeFirstLetterOfEachWordInAPhrase(updateItemDto.name)
    

    return this.prismaService.item.update({where:{id},data:updateItemDto});
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }


  private async getItemById(id: number, organization_id:number) {
    const item = await this.prismaService.itemOrganization.findFirst({ where: {
      item_id:id ,
      organization_id : organization_id,
    },
  include:{
    item:true,
  },
 });

    if (!item) {
      throw new NotFoundException(`Role with id ${id} does not exist`);
    }

    return item;
  }
}
