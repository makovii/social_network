import {
    ArgumentMetadata,
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    PipeTransform,
  } from '@nestjs/common';
  import { plainToClass } from 'class-transformer';
  import { validate } from 'class-validator';
  
  @Injectable()
  export class ValidationPipe implements PipeTransform {
    async transform(value: Record<string, string>, metadata: ArgumentMetadata): Promise<Record<string, string>> {
      
      if (!metadata.metatype) {
        throw {};
      }
  
      const obj = plainToClass(metadata.metatype, value);
      const errors = await validate(obj);
  
      if (errors.length) {
        const messages = errors.map((err) => {
          if (!err.constraints) {
            throw new BadRequestException;
          }
  
          return `${err.property} - ${Object.values(err.constraints).join(', ')}`;
        });
  
        throw new HttpException(messages, HttpStatus.BAD_REQUEST);
      }
      return value;
    }
  }
  