import Neode from "neode";

enum Entity {
    User = 'User',
    Publication = 'Publication',
}

enum Relation {
    LIKED = 'LIKED',
    FRIEND_TO = 'FOLLOW_TO',
    COMMENTED = 'COMMENTED',
    CREATED = 'CREATED',
}

function setupSchemas(instance: Neode) {
    instance.model(Entity.User, {
        uuid: {
            primary: true,
            type: 'uuid',
            required: true,
        },
        email: {
            type: 'string',
            email: true,
            index: true,
        },
        password: 'string',
        googleId: 'string',
        name: {
            type: 'string'
        },
    });

    instance.model(Entity.Publication, {
        uuid: {
            primary: true,
            type: 'uuid',
            required: true,
        },
        text: {
            type: 'string',
            index: true,
        },
        time: {
            type: 'datetime',
            required: true,
            default: Date.now(),
        },
    });

    instance.model(Entity.User).relationship(Relation.CREATED, Relation.CREATED, Relation.CREATED, 'out', Entity.Publication, {
        time: {
            type: 'datetime',
            required: true,
            default: Date.now(),
        },
    });

    instance.model(Entity.User).relationship(Relation.FRIEND_TO, Relation.FRIEND_TO, Relation.FRIEND_TO, 'out', Entity.User, {
        time: {
            type: 'datetime',
            required: true,
            default: Date.now(),
        },
    });

    instance.model(Entity.User).relationship(Relation.LIKED, Relation.LIKED, Relation.LIKED, 'out', Entity.Publication, {
        time: {
            type: 'datetime',
            required: true,
            default: Date.now(),
        },
    });

    instance.model(Entity.User).relationship(Relation.COMMENTED, Relation.COMMENTED, Relation.COMMENTED, 'out', Entity.Publication, {
        time: {
            type: 'datetime',
            required: true,
            default: Date.now(),
        },
        text: {
            type: 'string',
        }
    });
    
}

export { setupSchemas, Entity, Relation };

