import {
    ArgumentMetadata,
    BadRequestException,
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
  
      if (errors.length > 0) {
        const msgs = errors.map((e) => {
          if (!e.constraints) {
            throw new BadRequestException;
          }
  
          return `${e.property}: ${Object.values(e.constraints).join(', ')}`;
        });
  
        throw new BadRequestException(msgs);
      }
      return value;
    }
  }
  