import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      nombre?: string;
      apellido?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    nombre?: string;
    apellido?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    nombre?: string;
    apellido?: string;
  }
}
