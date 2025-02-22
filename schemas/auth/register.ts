import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .nonempty({ message: 'El email es requerido' })
      .email({ message: 'Email inválido' }),
    name: z.string().nonempty({ message: 'El nombre es requerido' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    password_confirmation: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;