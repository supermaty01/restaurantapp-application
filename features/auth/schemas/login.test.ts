import { loginSchema } from './login';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
      device_name: 'Pixel 8',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email and short password', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: '123',
      device_name: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain('Email inválido');
      expect(result.error.flatten().fieldErrors.password).toContain(
        'La contraseña debe tener al menos 6 caracteres',
      );
      expect(result.error.flatten().fieldErrors.device_name).toContain(
        'El nombre del dispositivo es requerido',
      );
    }
  });
});
