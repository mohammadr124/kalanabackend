import { hash, compare } from "bcrypt";

export const hashPassword = async (password: string) => {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
) => {
  const isOkPassword = await compare(password, hashedPassword);
  return isOkPassword;
};
