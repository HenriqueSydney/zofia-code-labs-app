/**
 * Conclui a migration 20260610120000 após falha parcial (enum ProposalSource criado,
 * coluna proposals ainda em ProposalSource_old).
 */
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const client = await pool.connect();

try {
  await client.query("BEGIN");

  const proposalCol = await client.query(`
    SELECT udt_name
    FROM information_schema.columns
    WHERE table_schema = 'crm'
      AND table_name = 'proposals'
      AND column_name = 'source_type'
  `);

  if (proposalCol.rows[0]?.udt_name === "ProposalSource_old") {
    await client.query(`
      ALTER TABLE "crm"."proposals" ALTER COLUMN "source_type" DROP DEFAULT;
      ALTER TABLE "crm"."proposals"
        ALTER COLUMN "source_type" TYPE "crm"."ProposalSource"
        USING ("source_type"::text::"crm"."ProposalSource");
      ALTER TABLE "crm"."proposals"
        ALTER COLUMN "source_type" SET DEFAULT 'MANUAL_UPLOAD';
      DROP TYPE "crm"."ProposalSource_old";
    `);
    console.log("proposals.source_type migrado para ProposalSource");
  }

  const contractCol = await client.query(`
    SELECT udt_name
    FROM information_schema.columns
    WHERE table_schema = 'crm'
      AND table_name = 'contracts'
      AND column_name = 'source_type'
  `);

  if (contractCol.rows[0]?.udt_name === "ContractSource") {
    const contractEnum = await client.query(`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'crm' AND t.typname = 'ContractSource'
    `);

    if (contractEnum.rows.some((row) => row.enumlabel === "SYSTEM_TEMPLATE")) {
      await client.query(`
        UPDATE "crm"."contracts"
        SET "source_type" = 'MANUAL_UPLOAD'
        WHERE "source_type"::text = 'SYSTEM_TEMPLATE';

        ALTER TYPE "crm"."ContractSource" RENAME TO "ContractSource_old";
        CREATE TYPE "crm"."ContractSource" AS ENUM ('MANUAL_UPLOAD');
        ALTER TABLE "crm"."contracts" ALTER COLUMN "source_type" DROP DEFAULT;
        ALTER TABLE "crm"."contracts"
          ALTER COLUMN "source_type" TYPE "crm"."ContractSource"
          USING ("source_type"::text::"crm"."ContractSource");
        ALTER TABLE "crm"."contracts"
          ALTER COLUMN "source_type" SET DEFAULT 'MANUAL_UPLOAD';
        DROP TYPE "crm"."ContractSource_old";
      `);
      console.log("contracts.source_type migrado para ContractSource");
    }
  }

  await client.query("COMMIT");
  console.log("Repair concluído.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
