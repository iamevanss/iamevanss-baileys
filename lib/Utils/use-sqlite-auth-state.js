import { mkdir, readdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { initAuthCreds } from './auth-utils.js';

export const useSqliteAuthState = async (pathOrFolder, options = {}) => {
  const {
    fileName = 'auth.db',
    migrateFromFolder,
    logger
  } = options;

  const dbPath = /\.(db|sqlite|sqlite3)$/i.test(pathOrFolder) ? pathOrFolder : join(pathOrFolder, fileName);

  const bufReplacer = (_, value) => {
    if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === 'Buffer') {
      return { type: 'Buffer', data: Buffer.from(value?.data || value).toString('base64') };
    }
    return value;
  };

  const bufReviver = (_, value) => {
    if (value && typeof value === 'object' && value.type === 'Buffer' && typeof value.data === 'string') {
      return Buffer.from(value.data, 'base64');
    }
    return value;
  };

  const encode = value => {
    if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
      return Buffer.concat([Buffer.from([1]), Buffer.from(value)]);
    }
    return Buffer.concat([Buffer.from([0]), Buffer.from(JSON.stringify(value, bufReplacer), 'utf8')]);
  };

  const decode = blob => {
    if (!blob || blob.length === 0) return null;
    if (blob[0] === 1) return Buffer.from(blob.subarray(1));
    return JSON.parse(Buffer.from(blob.subarray(1)).toString('utf8'), bufReviver);
  };

  const fixName = value => value?.replace(/\//g, '__')?.replace(/:/g, '-');
  const keyOf = (category, id) => fixName(`${category}-${id}`);

  let DatabaseSync;
  try {
    ({ DatabaseSync } = await import('node:sqlite'));
  } catch {
    throw new Error("useSqliteAuthState needs the built-in 'node:sqlite' module (Node 22.5+). Upgrade Node, or use useMultiFileAuthState instead.");
  }

  const { proto } = await import('../../WAProto/index.js');

  await mkdir(dirname(dbPath), { recursive: true }).catch(() => {});
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = TRUNCATE');
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec('CREATE TABLE IF NOT EXISTS auth_state (k TEXT PRIMARY KEY, v BLOB NOT NULL) WITHOUT ROWID');

  const qGet = db.prepare('SELECT v FROM auth_state WHERE k = ?');
  const qUpsert = db.prepare('INSERT INTO auth_state(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v');
  const qDelete = db.prepare('DELETE FROM auth_state WHERE k = ?');

  const runTx = fn => {
    db.exec('BEGIN');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };

  const readRaw = key => {
    const row = qGet.get(key);
    if (!row) return null;
    try {
      return decode(row.v);
    } catch (error) {
      logger?.warn?.({ key, err: error?.message }, 'sqlite-auth: failed to decode row, treating as missing');
      return null;
    }
  };

  const runMigration = async folder => {
    let files;
    try {
      files = await readdir(folder);
    } catch {
      return 0;
    }

    const rows = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const value = JSON.parse(await readFile(join(folder, file), 'utf8'), bufReviver);
        if (value !== null && value !== undefined) rows.push([file.slice(0, -5), encode(value)]);
      } catch {
        // Ignore malformed legacy files and continue migrating the remaining state.
      }
    }

    runTx(() => {
      for (const [key, value] of rows) qUpsert.run(key, value);
    });
    return rows.length;
  };

  const hasCreds = () => !!qGet.get('creds');
  if (migrateFromFolder && !hasCreds()) {
    const count = await runMigration(migrateFromFolder);
    if (count > 0) logger?.info?.({ count, from: migrateFromFolder }, 'sqlite-auth: migrated legacy auth state');
  }

  let creds = readRaw('creds');
  if (!creds) {
    creds = initAuthCreds();
    qUpsert.run('creds', encode(creds));
  }

  const keys = {
    get: async (type, ids) => {
      const data = {};
      for (const id of ids) {
        let value = readRaw(keyOf(type, id));
        if (type === 'app-state-sync-key' && value) value = proto.Message.AppStateSyncKeyData.fromObject(value);
        if (value !== null && value !== undefined) data[id] = value;
      }
      return data;
    },
    set: async data => {
      const operations = [];
      for (const category in data) {
        for (const id in data[category]) operations.push([keyOf(category, id), data[category][id]]);
      }
      runTx(() => {
        for (const [key, value] of operations) {
          if (value === null || value === undefined) qDelete.run(key);
          else qUpsert.run(key, encode(value));
        }
      });
    },
    clear: async () => {
      db.prepare("DELETE FROM auth_state WHERE k <> 'creds'").run();
    }
  };

  return {
    state: { creds, keys },
    saveCreds: async () => qUpsert.run('creds', encode(creds)),
    db,
    close: () => db.close()
  };
};
