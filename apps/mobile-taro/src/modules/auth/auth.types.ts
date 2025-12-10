export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};
