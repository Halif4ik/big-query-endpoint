import {Transform} from "class-transformer";
import {IsNotEmpty, IsString, Length} from "class-validator";

export class CreateLogPointDto {
   @Transform(({value}) => {
      if (value.toLowerCase() === 'android' || value.toLowerCase() === 'ios' || value.toLowerCase() === 'null') {
         return value.toLowerCase();
      }
      return '';
   },)
   @IsNotEmpty({message: 'format os should be android or ios or null'})
   readonly os: string;

   @IsString({message: 'idUser should be string'})
   @Length(1, 255, {message: ' idUser min length 1 max length 255'})
   readonly idUser: string;

   @IsString({message: 'idDevice should be string'})
   @Length(2, 255, {message: ' idDevice min length 2 max length 255'})
   readonly idDevice: string;

}
