import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import { Role } from "@/generated/prisma"; // Garanta que o caminho do enum esteja correto

declare module "next-auth" {
  interface User extends DefaultUser {
    // DefaultUser já possui: id, name, email, image
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    organizationId: string;
  }
}
