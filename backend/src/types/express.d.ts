import { User, Session, EventRole } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash">;

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      session?: Session;
      eventRole?: EventRole;
    }
  }
}
