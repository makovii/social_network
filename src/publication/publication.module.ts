import { Module } from "@nestjs/common";
import { Neo4jService } from "../neo4j.service";
import { PublicationService } from "./publication.service";
import { PublicationController } from "./publication.controller";

@Module({
    controllers: [PublicationController],
    providers: [PublicationService, Neo4jService,],
    imports: [

    ],
    exports: [PublicationService],
  })
  export class PublicationModule {}
  