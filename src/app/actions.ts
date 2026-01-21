
'use server';

import { z } from 'zod';
import sql from 'mssql';
import { GET_BRANCHES_QUERY } from '@/lib/queries';

const formSchema = z.object({
  serverIp: z.string().min(1, { message: 'Server IP is required.' }),
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'Database name is required.' }),
  branch: z.string({
    required_error: 'You need to select a branch.',
  }).min(1, { message: 'You need to select a branch.' }),
});


export async function saveConnectionDetails(data: z.infer<typeof formSchema>) {
  const parsedData = formSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, message: 'Invalid data provided.' };
  }

  // Simulate network delay and database operation
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Simulating saving connection details:', parsedData.data);

  return { success: true, message: `Connection for branch ${parsedData.data.branch} on server ${parsedData.data.serverIp} saved.` };
}

const connectionSchema = z.object({
  serverIp: z.string().min(1, { message: 'Server IP is required.' }),
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'Database name is required.' }),
});


export async function getBranches(data: z.infer<typeof connectionSchema>) {
    const parsedData = connectionSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, message: 'Invalid connection data.', branches: [] };
    }

    const { serverIp, username, password, database } = parsedData.data;

    const config = {
        user: username,
        password: password,
        server: serverIp,
        database: database,
        options: {
            encrypt: process.env.NODE_ENV === 'production',
            trustServerCertificate: process.env.NODE_ENV !== 'production'
        }
    };

    try {
        await sql.connect(config);
        
        // This query is now managed in src/lib/queries.ts
        const result = await sql.query(GET_BRANCHES_QUERY); 

        await sql.close();

        const branches = result.recordset.map((row: any) => row.name);
        
        if (branches.length === 0) {
            return { success: true, message: 'Connection successful, but no branches found.', branches: [] };
        }

        return { success: true, message: 'Branches fetched successfully!', branches };

    } catch (err: any) {
        console.error(err);
        if (sql.connected) {
            await sql.close();
        }
        
        let errorMessage = 'Failed to connect or fetch data. Please check your connection details and query.';
        if (err.code === 'ELOGIN') {
            errorMessage = 'Login failed. Please check your username and password.';
        } else if (err.code === 'ENOCONNECTION') {
            errorMessage = 'Cannot connect to the server. Please check the Server IP.';
        } else if (err.message && err.message.includes('Invalid object name')) {
            errorMessage = `Could not find the table in your query. Please check your SQL query in src/lib/queries.ts.`;
        }
        
        return { success: false, message: errorMessage, branches: [] };
    }
}
