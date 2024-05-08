import { Controller, Get } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Controller()
export class Neo4jController {
    constructor(private readonly neo4jService: Neo4jService) {}

    @Get()
    async getSomethingFromNeo4j() {
        const session = this.neo4jService.getDriver().session();
        try {
            const result = await session.run('MATCH (n) RETURN n LIMIT 25');
            return result.records.map(record => record.get('n').properties);
        } finally {
            session.close();
        }
    }
}
