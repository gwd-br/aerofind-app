export type User = {
  id: number | string;
  name: string;
  email: string;
  cpf: string;
  password?: string;
  avatar?: string | null;
  departamento?: string | null;
  b_ativo?: boolean | number | null;
};

export type CreateUserDTO = Pick<User, "name" | "email" | "password">;
export type UpdateUserDTO = Partial<CreateUserDTO>;
