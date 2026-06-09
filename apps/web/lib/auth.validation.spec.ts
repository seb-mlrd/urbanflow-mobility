import { describe, expect, it } from 'vitest';
import {
  validateLoginForm,
  validateRegisterForm,
  type LoginFormValues,
  type RegisterFormValues,
} from './auth.validation';

const validForm: RegisterFormValues = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean@example.com',
  password: 'motdepasse',
  confirmPassword: 'motdepasse',
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

  describe('confirmPassword', () => {
    it('retourne une erreur si confirmPassword est vide', () => {
      const errors = validateRegisterForm({ ...validForm, confirmPassword: '' }, true);
      expect(errors.confirmPassword).toBe('Veuillez confirmer votre mot de passe.');
    });

    it('retourne une erreur si confirmPassword ne correspond pas au mot de passe', () => {
      const errors = validateRegisterForm({ ...validForm, confirmPassword: 'autrechose' }, true);
      expect(errors.confirmPassword).toBe('Les mots de passe ne correspondent pas.');
    });

    it("n'est pas en erreur si confirmPassword correspond au mot de passe", () => {
      const errors = validateRegisterForm(validForm, true);
      expect(errors.confirmPassword).toBeUndefined();
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
      { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
      false,
    );
    // confirmPassword est ignoré quand password est invalide
    expect(Object.keys(errors)).toHaveLength(5);
    expect(errors).toHaveProperty('firstName');
    expect(errors).toHaveProperty('lastName');
    expect(errors).toHaveProperty('email');
    expect(errors).toHaveProperty('password');
    expect(errors).toHaveProperty('cgu');
    expect(errors).not.toHaveProperty('confirmPassword');
  });
});

const validLoginForm: LoginFormValues = {
  email: 'jean@example.com',
  password: 'motdepasse',
};

describe('validateLoginForm()', () => {
  it('retourne {} si le formulaire est valide', () => {
    expect(validateLoginForm(validLoginForm)).toEqual({});
  });

  describe('email', () => {
    it("retourne une erreur si l'email est vide", () => {
      const errors = validateLoginForm({ ...validLoginForm, email: '' });
      expect(errors.email).toBe("L'email est requis.");
    });

    it("retourne une erreur si l'email est mal formé", () => {
      const invalids = ['test@', 'test', '@example.com', 'test @example.com'];
      for (const email of invalids) {
        const errors = validateLoginForm({ ...validLoginForm, email });
        expect(errors.email).toBe("L'adresse email n'est pas valide.");
      }
    });

    it("n'est pas en erreur pour un email valide", () => {
      const errors = validateLoginForm({ ...validLoginForm, email: 'user@domain.fr' });
      expect(errors.email).toBeUndefined();
    });
  });

  describe('password', () => {
    it('retourne une erreur si le mot de passe est vide', () => {
      const errors = validateLoginForm({ ...validLoginForm, password: '' });
      expect(errors.password).toBe('Le mot de passe est requis.');
    });

    it("n'est pas en erreur pour tout mot de passe non vide, quelle que soit sa longueur", () => {
      const errors = validateLoginForm({ ...validLoginForm, password: 'a' });
      expect(errors.password).toBeUndefined();
    });
  });

  it('retourne les deux erreurs simultanément si tout est invalide', () => {
    const errors = validateLoginForm({ email: '', password: '' });
    expect(Object.keys(errors)).toHaveLength(2);
    expect(errors).toHaveProperty('email');
    expect(errors).toHaveProperty('password');
  });
});
