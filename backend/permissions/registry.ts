/**
 * The permission registry (ADR-0001 / Security spec).
 *
 * Permissions are data, not code: each module declares the actions it supports
 * here, and the set is seeded into the database so tenants can compose custom
 * roles from them. Keys are stable strings — never renumbered or reused.
 */

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "update",
  "delete",
  "approve",
  "export",
  "import",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

interface ModulePermissions {
  module: string;
  label: string;
  actions: readonly PermissionAction[];
}

/** Modules in roadmap Phase 1–3 order. */
export const PERMISSION_MODULES: readonly ModulePermissions[] = [
  { module: "user", label: "Users", actions: ["view", "create", "update", "delete"] },
  { module: "role", label: "Roles", actions: ["view", "create", "update", "delete"] },
  { module: "setting", label: "Settings", actions: ["view", "update"] },
  { module: "customer", label: "Customers", actions: [...PERMISSION_ACTIONS] },
  { module: "supplier", label: "Suppliers", actions: [...PERMISSION_ACTIONS] },
  { module: "product", label: "Products", actions: [...PERMISSION_ACTIONS] },
  { module: "category", label: "Categories", actions: ["view", "create", "update", "delete"] },
  { module: "brand", label: "Brands", actions: ["view", "create", "update", "delete"] },
  { module: "unit", label: "Units", actions: ["view", "create", "update", "delete"] },
  { module: "warehouse", label: "Warehouses", actions: ["view", "create", "update", "delete"] },
  { module: "inventory", label: "Inventory", actions: ["view", "create", "update", "approve", "export"] },
  { module: "quotation", label: "Quotations", actions: [...PERMISSION_ACTIONS] },
  { module: "order", label: "Orders", actions: [...PERMISSION_ACTIONS] },
  { module: "invoice", label: "Invoices", actions: [...PERMISSION_ACTIONS] },
  { module: "payment", label: "Payments", actions: ["view", "create", "update", "delete", "export"] },
  { module: "expense", label: "Expenses", actions: [...PERMISSION_ACTIONS] },
  { module: "report", label: "Reports", actions: ["view", "export"] },
  { module: "audit", label: "Audit log", actions: ["view", "export"] },
] as const;

export interface PermissionDefinition {
  key: string;
  module: string;
  action: PermissionAction;
  description: string;
}

/** Flattens the registry into one definition per module × action. */
export function allPermissions(): PermissionDefinition[] {
  return PERMISSION_MODULES.flatMap((entry) =>
    entry.actions.map((action) => ({
      key: `${entry.module}.${action}`,
      module: entry.module,
      action,
      description: `${action[0]?.toUpperCase()}${action.slice(1)} ${entry.label.toLowerCase()}`,
    })),
  );
}

/** Default role templates seeded per organization (Security spec role list). */
export const DEFAULT_ROLES: readonly {
  name: string;
  description: string;
  /** "*" grants every permission; otherwise module or explicit key prefixes. */
  grants: readonly string[];
}[] = [
  {
    name: "Administrator",
    description: "Full access to every module and setting.",
    grants: ["*"],
  },
  {
    name: "Manager",
    description: "Operational oversight across sales, inventory, and reporting.",
    grants: [
      "customer.*", "supplier.*", "product.*", "category.*", "brand.*", "unit.*",
      "warehouse.*", "inventory.*", "quotation.*", "order.*", "invoice.*",
      "payment.*", "expense.*", "report.*", "user.view", "role.view", "setting.view",
    ],
  },
  {
    name: "Sales",
    description: "Quotations, orders, and customer records.",
    grants: [
      "customer.view", "customer.create", "customer.update",
      "product.view", "quotation.*", "order.view", "order.create", "order.update",
      "invoice.view", "report.view",
    ],
  },
  {
    name: "Inventory",
    description: "Stock levels, movements, and product data.",
    grants: [
      "product.*", "category.*", "brand.*", "unit.*", "warehouse.*",
      "inventory.*", "supplier.view", "order.view", "report.view",
    ],
  },
  {
    name: "Accountant",
    description: "Invoices, payments, expenses, and financial reports.",
    grants: [
      "invoice.*", "payment.*", "expense.*", "report.*",
      "customer.view", "supplier.view", "order.view", "audit.view",
    ],
  },
  {
    name: "Cashier",
    description: "Recording payments and issuing invoices.",
    grants: [
      "invoice.view", "invoice.create", "payment.view", "payment.create",
      "customer.view", "product.view",
    ],
  },
  {
    name: "Viewer",
    description: "Read-only access across the suite.",
    grants: [
      "customer.view", "supplier.view", "product.view", "category.view",
      "brand.view", "unit.view", "warehouse.view", "inventory.view",
      "quotation.view", "order.view", "invoice.view", "payment.view",
      "expense.view", "report.view",
    ],
  },
] as const;

/** Expands a role's grant patterns into concrete permission keys. */
export function resolveGrants(grants: readonly string[]): string[] {
  const permissions = allPermissions();

  if (grants.includes("*")) {
    return permissions.map((permission) => permission.key);
  }

  const keys = new Set<string>();

  for (const grant of grants) {
    if (grant.endsWith(".*")) {
      const moduleName = grant.slice(0, -2);
      for (const permission of permissions) {
        if (permission.module === moduleName) {
          keys.add(permission.key);
        }
      }
    } else {
      keys.add(grant);
    }
  }

  return [...keys];
}
