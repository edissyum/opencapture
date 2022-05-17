-- Add the feature to select specific language for a supplier
ALTER TABLE "accounts_supplier" ADD COLUMN "lang" VARCHAR(10) DEFAULT 'fra';