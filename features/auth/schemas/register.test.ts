import { registerSchema } from './register';

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      name: 'Matias',
      password: '123456',
      password_confirmation: '123456',
    });

    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      name: 'Matias',
      password: '123456',
      password_confirmation: '654321',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password_confirmation).toContain(
        'Las contraseñas no coinciden',
      );
    }
  });
});
