/**
 * Entity → DTO conversion for auth (ADR-0007).
 *
 * The single serialization boundary: password hashes, organization ids, and
 * soft-delete columns never leave through here.
 */

export interface SessionUserDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  roleId: string;
}

interface SessionUserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
}

export class AuthMapper {
  static toSessionUser(user: SessionUserEntity): SessionUserDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      roleId: user.roleId,
    };
  }
}
