import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import { allPermissions, DEFAULT_ROLES, resolveGrants } from "../backend/permissions/registry";
import { hashPassword } from "../lib/auth/password";

/**
 * Seeds the permission registry, the default role templates, the first
 * organization, and its administrator account.
 *
 * Idempotent: safe to run repeatedly. Existing records are updated in place
 * rather than duplicated, and an existing administrator password is never
 * overwritten.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env["DIRECT_DATABASE_URL"] ?? process.env["DATABASE_URL"],
  }),
});

const ORGANIZATION_NAME = "Psalm Creations";
const ADMIN_EMAIL = process.env["SEED_ADMIN_EMAIL"] ?? "admin@psalmcreations.com";
const ADMIN_PASSWORD = process.env["SEED_ADMIN_PASSWORD"] ?? "ChangeMe!2026";

async function seedPermissions(): Promise<void> {
  const definitions = allPermissions();

  for (const definition of definitions) {
    await prisma.permission.upsert({
      where: { key: definition.key },
      create: definition,
      update: { module: definition.module, action: definition.action, description: definition.description },
    });
  }

  console.info(`Permissions seeded: ${definitions.length}`);
}

async function seedOrganization(): Promise<string> {
  const existing = await prisma.organization.findFirst({
    where: { name: ORGANIZATION_NAME },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.organization.create({
    data: { name: ORGANIZATION_NAME, baseCurrency: "NGN" },
    select: { id: true },
  });

  console.info(`Organization created: ${ORGANIZATION_NAME}`);

  return created.id;
}

async function seedRoles(organizationId: string): Promise<Map<string, string>> {
  const permissions = await prisma.permission.findMany({ select: { id: true, key: true } });
  const permissionIdByKey = new Map(permissions.map((p) => [p.key, p.id]));
  const roleIdByName = new Map<string, string>();

  for (const template of DEFAULT_ROLES) {
    const existing = await prisma.role.findFirst({
      where: { organizationId, name: template.name, deletedAt: null },
      select: { id: true },
    });

    const role =
      existing ??
      (await prisma.role.create({
        data: {
          organizationId,
          name: template.name,
          description: template.description,
          isSystem: true,
        },
        select: { id: true },
      }));

    roleIdByName.set(template.name, role.id);

    // Re-sync grants so a registry change reaches existing installations.
    const keys = resolveGrants(template.grants);

    for (const key of keys) {
      const permissionId = permissionIdByKey.get(key);

      if (!permissionId) {
        console.warn(`Unknown permission key in role "${template.name}": ${key}`);
        continue;
      }

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        create: { roleId: role.id, permissionId },
        update: {},
      });
    }
  }

  console.info(`Roles seeded: ${roleIdByName.size}`);

  return roleIdByName;
}

async function seedAdministrator(
  organizationId: string,
  roleIdByName: Map<string, string>,
): Promise<void> {
  const roleId = roleIdByName.get("Administrator");

  if (!roleId) {
    throw new Error("Administrator role missing after role seed.");
  }

  const existing = await prisma.user.findFirst({
    where: { organizationId, email: ADMIN_EMAIL, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    console.info(`Administrator already exists: ${ADMIN_EMAIL}`);
    return;
  }

  await prisma.user.create({
    data: {
      organizationId,
      roleId,
      firstName: "System",
      lastName: "Administrator",
      email: ADMIN_EMAIL,
      password: await hashPassword(ADMIN_PASSWORD),
    },
    select: { id: true },
  });

  console.info(`Administrator created: ${ADMIN_EMAIL}`);
}

async function main(): Promise<void> {
  await seedPermissions();
  const organizationId = await seedOrganization();
  const roleIdByName = await seedRoles(organizationId);
  await seedAdministrator(organizationId, roleIdByName);
  console.info("Seed complete.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
