export type TRegisterUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  department?: string;
};

export type TLoginUser = {
  email: string;
  password: string;
};
