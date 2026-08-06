-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "baseCurrency" CHAR(3) NOT NULL DEFAULT 'NGN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);
