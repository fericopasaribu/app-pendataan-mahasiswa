import { DB } from "@/constants/DB";
import * as SQLite from "expo-sqlite";

type Version = {
  version: number;
};

export const db = SQLite.openDatabaseSync(DB.DB_NAME);

export function useDatabaseMigration() {
  // buat tabel mahasiswa
  db.execSync(`
      CREATE TABLE IF NOT EXISTS tb_mahasiswa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        npm TEXT(8),
        nama TEXT(100),
        jurusan TEXT(20)
      )
    `);

  // Buat tabel version
  db.execSync(`
      CREATE TABLE IF NOT EXISTS tb_version (
        version TEXT PRIMARY KEY NOT NULL
      )
    `);

  // Ambil versi sekarang
  const res = db.getFirstSync(
    `SELECT version FROM tb_version LIMIT 1`
  ) as Version;

  if (res) {
    db.execSync(`DELETE FROM tb_version`);
  }

  db.execSync(`INSERT INTO tb_version VALUES ('${DB.DB_VERSION}')`);

  // console.log("Versi DB saat ini:", DB.DB_VERSION);

  // ====================
  // === MIGRASI DB ===
  // ====================  

  if (DB.DB_VERSION >= 3) {
    if (!checkColumn("telepon")) {
      // console.log("Migrasi ke versi 3");
      db.execSync(`ALTER TABLE tb_mahasiswa ADD COLUMN telepon TEXT(25)`);
    }
    // version = 3;
  }

  if (DB.DB_VERSION >= 2) {
    if (!checkColumn("foto")) {
      // console.log("Migrasi ke versi 2");
      db.execSync(`ALTER TABLE tb_mahasiswa ADD COLUMN foto TEXT(25)`);
    }
    // version = 2;
  }


  // Update versi database
  
  // console.log("Migrasi selesai ke versi", DB.DB_VERSION);
}

const checkColumn = (column: any) => {
  const res = db.getAllSync(`PRAGMA table_info(tb_mahasiswa)`);
  const columnExists = res.some((col: any) => col.name === column);

  return columnExists
}