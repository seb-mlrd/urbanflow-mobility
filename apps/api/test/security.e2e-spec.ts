import helmet from 'helmet';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const ALLOWED_ORIGIN = process.env.FRONTEND_URL ?? 'http://localhost:3000';

describe('Security (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Réplique la config de sécurité de src/main.ts (non appliquée par défaut
    // sur une app construite manuellement en test), pour tester le vrai
    // comportement de prod : CORS, helmet, ValidationPipe globale.
    app.enableCors({ origin: ALLOWED_ORIGIN, credentials: true });
    app.use(helmet());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('une requête sur une route protégée sans JWT renvoie 401', async () => {
    await request(app.getHttpServer()).get('/profile').expect(401);
  });

  it('une requête sur une route protégée avec un JWT invalide renvoie 401', async () => {
    await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', 'Bearer token-invalide')
      .expect(401);
  });

  it('les en-têtes de sécurité helmet() sont présents dans la réponse', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it("une requête depuis une origine CORS non autorisée n'est pas reflétée dans Access-Control-Allow-Origin", async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .set('Origin', 'http://evil-site.example')
      .expect(200);

    // Le serveur répond quand même (CORS ne bloque pas côté serveur), mais
    // l'en-tête Access-Control-Allow-Origin ne doit jamais refléter une
    // origine non autorisée : c'est ce qui empêche le navigateur du client
    // de lire la réponse depuis ce site.
    expect(res.headers['access-control-allow-origin']).not.toBe(
      'http://evil-site.example',
    );
  });

  it("une requête depuis l'origine autorisée reçoit bien Access-Control-Allow-Origin", async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .set('Origin', ALLOWED_ORIGIN)
      .expect(200);

    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('un payload malformé sur un DTO est rejeté avec 400 (validation class-validator)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'pas-un-email',
        password: 123,
        firstName: '',
        lastName: '',
      })
      .expect(400);
  });

  it('un payload avec des champs non déclarés est rejeté avec 400 (whitelist/forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .get('/transport/journey')
      .query({
        fromLat: 50.6,
        fromLng: 3.0,
        toLat: 50.6,
        toLng: 3.0,
        champInconnu: 'x',
      })
      .expect(400);
  });
});
