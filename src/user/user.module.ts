import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Neo4jService } from "../neo4j.service";

@Module({
    controllers: [UserController],
    providers: [UserService, Neo4jService,],
    imports: [

    ],
    exports: [UserService],
  })
  export class UserModule {}
  