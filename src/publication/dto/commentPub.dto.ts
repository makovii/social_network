import { IsNotEmpty, IsUUID } from "class-validator";

export class CommentPub {
    @IsUUID()
    @IsNotEmpty()
    uuid: string;
  
    text: string;
}
