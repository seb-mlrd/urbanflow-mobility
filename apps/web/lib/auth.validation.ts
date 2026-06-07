import { EMAIL_REGEX, PASSWORD_MIN_LENGTH } from '@urbanflow/shared';

export type RegisterFormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  cgu?: string;
};

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export function validateRegisterForm(
  form: RegisterFormValues,
  cguAccepted: boolean,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!form.firstName.trim()) errors.firstName = 'Le prénom est requis.';
  if (!form.lastName.trim()) errors.lastName = 'Le nom est requis.';

  if (!form.email.trim()) {
    errors.email = "L'email est requis.";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "L'adresse email n'est pas valide.";
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est requis.';
  } else if (form.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
  }

  if (!cguAccepted) errors.cgu = 'Vous devez accepter les CGU pour continuer.';

  return errors;
}
