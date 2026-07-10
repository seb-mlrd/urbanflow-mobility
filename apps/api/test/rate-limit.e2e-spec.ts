import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Instance Nest dédiée à ce fichier, pour repartir avec un compteur de
// rate limiting vierge (ThrottlerModule stocke ses compteurs en mémoire,
// par instance d'app) et ne pas être pollué par les requêtes des autres
// suites e2e.
describe('Rate limiting (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('renvoie 429 au-delà de 60 requêtes par minute', async () => {
    const server = app.getHttpServer();

    // ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]) : les 60
    // premières requêtes doivent passer, la 61e doit être bloquée.
    const responses: number[] = [];
    for (let i = 0; i < 61; i++) {
      const res = await request(server).get('/');
      responses.push(res.status);
    }

    expect(responses.slice(0, 60).every((status) => status === 200)).toBe(true);
    expect(responses[60]).toBe(429);
  }, 20_000);
});
