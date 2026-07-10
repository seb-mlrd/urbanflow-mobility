import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { User } from '../src/users/user.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let userRepo: Repository<User>;
  const createdEmails: string[] = [];

  function uniqueEmail(tag: string) {
    const email = `e2e-${tag}-${Date.now()}-${Math.round(Math.random() * 1e6)}@test.local`;
    createdEmails.push(email);
    return email;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await userRepo.delete({ email: In(createdEmails) });
    }
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('inscrit un nouvel utilisateur et renvoie le user sans le password', async () => {
      const email = uniqueEmail('register');

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'motdepasse123', firstName: 'Jean', lastName: 'Dupont' })
        .expect(201);

      expect(res.body).toMatchObject({ email, firstName: 'Jean', lastName: 'Dupont' });
      expect(res.body).not.toHaveProperty('password');
      expect(res.body.id).toBeDefined();
    });

    it('refuse un second enregistrement avec le même email (409)', async () => {
      const email = uniqueEmail('duplicate');
      const payload = { email, password: 'motdepasse123', firstName: 'Marie', lastName: 'Curie' };

      await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);

      await request(app.getHttpServer()).post('/auth/register').send(payload).expect(409);
    });

    it('refuse un payload invalide : email mal formé et mot de passe trop court (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'pas-un-email', password: 'court', firstName: 'A', lastName: 'B' })
        .expect(400);
    });

    it('refuse un payload avec des champs non attendus (400, forbidNonWhitelisted)', async () => {
      const email = uniqueEmail('whitelist');

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'motdepasse123', firstName: 'Jean', lastName: 'Dupont', isAdmin: true })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const email = uniqueEmail('login');
    const password = 'motdepasse123';

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password, firstName: 'Ada', lastName: 'Lovelace' })
        .expect(201);
    });

    it('connecte avec les bons identifiants, renvoie un accessToken et pose le cookie refresh_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.accessToken.length).toBeGreaterThan(0);
      expect(res.body.user).toMatchObject({ email, firstName: 'Ada', lastName: 'Lovelace' });
      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('refreshToken');

      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true);
      expect(cookies.some((c: string) => /HttpOnly/i.test(c))).toBe(true);
    });

    it('refuse un mauvais mot de passe (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'mauvais-mot-de-passe' })
        .expect(401);
    });

    it('refuse un email inconnu (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'inconnu-e2e@test.local', password: 'peu-importe' })
        .expect(401);
    });
  });
});
