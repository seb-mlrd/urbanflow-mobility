import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { User } from '../src/users/user.entity';

// Coordonnées réelles à Lille (Grand-Place -> Wazemmes), utilisées pour un
// vrai aller-retour à travers OpenTripPlanner (aucun mock : le but est de
// vérifier la chaîne complète controller -> service -> OTP -> réponse HTTP).
const LILLE_TRIP = {
  fromLat: 50.6365,
  fromLng: 3.0635,
  toLat: 50.6292,
  toLng: 3.0573,
};

describe('Transport journey (e2e)', () => {
  let app: INestApplication<App>;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /transport/journey', () => {
    it('retourne des itinéraires réels pour un trajet valide à Lille', async () => {
      const res = await request(app.getHttpServer())
        .get('/transport/journey')
        .query(LILLE_TRIP)
        .expect(200);

      expect(Array.isArray(res.body.itineraries)).toBe(true);
      expect(res.body.itineraries.length).toBeGreaterThan(0);

      const itinerary = res.body.itineraries[0];
      expect(typeof itinerary.duration).toBe('number');
      expect(typeof itinerary.dominantMode).toBe('string');
      expect(Array.isArray(itinerary.legs)).toBe(true);
      expect(itinerary.legs.length).toBeGreaterThan(0);

      const leg = itinerary.legs[0];
      expect(typeof leg.mode).toBe('string');
      expect(leg.from).toMatchObject({ name: expect.any(String) });
      expect(leg.to).toMatchObject({ name: expect.any(String) });
    }, 15_000);

    it('inclut le tracé géométrique (legGeometry) sur au moins un leg', async () => {
      const res = await request(app.getHttpServer())
        .get('/transport/journey')
        .query(LILLE_TRIP)
        .expect(200);

      const legsWithGeometry = res.body.itineraries
        .flatMap((itin: any) => itin.legs)
        .filter((leg: any) => leg.legGeometry?.points);

      expect(legsWithGeometry.length).toBeGreaterThan(0);
      expect(typeof legsWithGeometry[0].legGeometry.points).toBe('string');
    }, 15_000);

    it('accepte un datetime optionnel au format ISO8601', async () => {
      await request(app.getHttpServer())
        .get('/transport/journey')
        .query({ ...LILLE_TRIP, datetime: new Date().toISOString() })
        .expect(200);
    }, 15_000);

    it('rejette une requête avec des coordonnées manquantes (400)', async () => {
      await request(app.getHttpServer())
        .get('/transport/journey')
        .query({ fromLat: LILLE_TRIP.fromLat, fromLng: LILLE_TRIP.fromLng })
        .expect(400);
    });

    it('rejette des coordonnées non numériques (400)', async () => {
      await request(app.getHttpServer())
        .get('/transport/journey')
        .query({ ...LILLE_TRIP, fromLat: 'pas-un-nombre' })
        .expect(400);
    });

    it('rejette un datetime mal formé (400)', async () => {
      await request(app.getHttpServer())
        .get('/transport/journey')
        .query({ ...LILLE_TRIP, datetime: 'pas-une-date' })
        .expect(400);
    });
  });

  describe('GET /transport/journey — utilisateur connecté vs non connecté', () => {
    const email = `e2e-journey-${Date.now()}@test.local`;
    let accessToken: string;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'motdepasse123',
          firstName: 'Test',
          lastName: 'Journey',
        })
        .expect(201);

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'motdepasse123' })
        .expect(200);

      accessToken = login.body.accessToken;
    });

    afterAll(async () => {
      await userRepo.delete({ email });
    });

    it('fonctionne avec un utilisateur connecté (JWT valide en Bearer)', async () => {
      const res = await request(app.getHttpServer())
        .get('/transport/journey')
        .query(LILLE_TRIP)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.itineraries)).toBe(true);
    }, 15_000);

    // Constat important : TransportController n'a aucun @UseGuards(JwtAuthGuard)
    // (contrairement à ProfileController). La route /transport/journey est
    // donc publique : un appel sans JWT réussit exactement comme un appel
    // authentifié. Ce test documente ce comportement réel plutôt que d'en
    // inventer un différent.
    it('fonctionne également sans JWT (la route est publique, aucun guard appliqué)', async () => {
      const res = await request(app.getHttpServer())
        .get('/transport/journey')
        .query(LILLE_TRIP)
        .expect(200);

      expect(Array.isArray(res.body.itineraries)).toBe(true);
    }, 15_000);
  });
});
