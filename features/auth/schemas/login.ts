import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: 'El email es requerido' })
    .email({ message: 'Email inválido' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  device_name: z.string().nonempty({ message: 'El nombre del dispositivo es requerido' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;