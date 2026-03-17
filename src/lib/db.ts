import { createClient, type Client, type InValue } from "@libsql/client";

let _client: Client | null = null;

export function getDb(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

type Args = Record<string, InValue> | InValue[];

export async function queryOne<T>(sql: string, args?: Args): Promise<T | null> {
  const result = await getDb().execute({ sql, args: (args ?? []) as InValue[] });
  return result.rows.length > 0 ? (result.rows[0] as unknown as T) : null;
}

export async function queryAll<T>(sql: string, args?: Args): Promise<T[]> {
  const result = await getDb().execute({ sql, args: (args ?? []) as InValue[] });
  return result.rows as unknown as T[];
}

export interface JobRow {
  id: number;
  slug: string;
  url: string;
  title: string;
  company: string | null;
  field: string | null;
  location: string | null;
  experience: string | null;
  qualification: string | null;
  job_type: string | null;
  industry: string | null;
  description: string | null;
  posted_date: string | null;
  deadline: string | null;
  scraped_at: string;
}
