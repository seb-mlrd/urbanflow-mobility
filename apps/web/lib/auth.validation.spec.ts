import { describe, expect, it } from 'vitest';
import { validateRegisterForm, type RegisterFormValues } from './auth.validation';

const validForm: RegisterFormValues = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean@example.com',
  password: 'motdepasse',
};

describe('validateRegisterForm()', () => {
  it('retourne {} si le formulaire est valide et les CGU acceptées', () => {
    expect(validateRegisterForm(validForm, true)).toEqual({});
  });

  describe('firstName', () => {
    it('retourne une erreur si firstName est vide', () => {
      const errors = validateRegisterForm({ ...validForm, firstName: '' }, true);
      expect(errors.firstName).toBe('Le prénom est requis.');
    });

    it('retourne une erreur si firstName est uniquement des espaces', () => {
      const errors = validateRegisterForm({ ...validForm, firstName: '   ' }, true);
      expect(errors.firstName).toBe('Le prénom est requis.');
    });
  });

  describe('lastName', () => {
    it('retourne une erreur si lastName est vide', () => {
      const errors = validateRegisterForm({ ...validForm, lastName: '' }, true);
      expect(errors.lastName).toBe('Le nom est requis.');
    });
  });

  describe('email', () => {
    it("retourne une erreur si l'email est vide", () => {
      const errors = validateRegisterForm({ ...validForm, email: '' }, true);
      expect(errors.email).toBe("L'email est requis.");
    });

    it("retourne une erreur si l'email est mal formé", () => {
      const invalids = ['test@', 'test', '@example.com', 'test @example.com'];
      for (const email of invalids) {
        const errors = validateRegisterForm({ ...validForm, email }, true);
        expect(errors.email).toBe("L'adresse email n'est pas valide.");
      }
    });

    it("n'est pas en erreur pour un email valide", () => {
      const errors = validateRegisterForm({ ...validForm, email: 'user@domain.fr' }, true);
      expect(errors.email).toBeUndefined();
    });
  });

  describe('password', () => {
    it('retourne une erreur si le mot de passe est vide', () => {
      const errors = validateRegisterForm({ ...validForm, password: '' }, true);
      expect(errors.password).toBe('Le mot de passe est requis.');
    });

    it('retourne une erreur si le mot de passe a moins de 8 caractères', () => {
      const errors = validateRegisterForm({ ...validForm, password: '1234567' }, true);
      expect(errors.password).toBe('Le mot de passe doit contenir au moins 8 caractères.');
    });

    it("n'est pas en erreur pour un mot de passe d'exactement 8 caractères", () => {
      const errors = validateRegisterForm({ ...validForm, password: '12345678' }, true);
      expect(errors.password).toBeUndefined();
    });
  });

  describe('cgu', () => {
    it('retourne une erreur si les CGU ne sont pas acceptées', () => {
      const errors = validateRegisterForm(validForm, false);
      expect(errors.cgu).toBe('Vous devez accepter les CGU pour continuer.');
    });
  });

  it('retourne toutes les erreurs simultanément si tout est invalide', () => {
    const errors = validateRegisterForm(
      { firstName: '', lastName: '', email: '', password: '' },
      false,
    );
    expect(Object.keys(errors)).toHaveLength(5);
    expect(errors).toHaveProperty('firstName');
    expect(errors).toHaveProperty('lastName');
    expect(errors).toHaveProperty('email');
    expect(errors).toHaveProperty('password');
    expect(errors).toHaveProperty('cgu');
  });
});
