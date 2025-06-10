require('dotenv').config();

jest.setTimeout(10000);

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';

global.next = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
    global.next.mockClear();
});

global.console = {
    ...console, 
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
}; 

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        produit: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
}); 