
'use server';

import { z } from 'zod';
import sql from 'mssql';
import { GET_BRANCHES_QUERY, UPDATE_CUSTOMER_QUERY } from '@/lib/queries';

const clientFormSchema = z.object({
  serverIp: z.string().min(1, { message: 'Server IP is required.' }),
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'Database name is required.' }),
  branch: z.string({
    required_error: 'You need to select a branch.',
  }).min(1, { message: 'You need to select a branch.' }),
  cardNumber: z.string().min(1, { message: 'Card number is required.' }),
  customerName: z.string().min(1, { message: 'Customer name is required.' }),
  phoneNumber: z.string().min(1, { message: 'Phone number is required.' }),
  gender: z.enum(['1', '2'], { required_error: 'Gender is required.' }),
});


export async function submitClientData(data: z.infer<typeof clientFormSchema>) {
    const parsedData = clientFormSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, message: 'Invalid data provided.' };
    }
    
    const {
        serverIp,
        username,
        password,
        database,
        branch,
        cardNumber,
        customerName,
        phoneNumber,
        gender
    } = parsedData.data;

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
        const request = new sql.Request();
        
        request.input('cardNumber', sql.Int, parseInt(cardNumber, 10));
        request.input('branchName', sql.NVarChar, branch);
        request.input('customerName', sql.NVarChar, customerName);
        request.input('gender', sql.VarChar, gender);
        request.input('phoneNumber', sql.VarChar, phoneNumber);

        const result = await request.query(UPDATE_CUSTOMER_QUERY);

        await sql.close();
        
        const message = result.recordset[0]?.message || 'No message returned from database.';
        if (message.includes('success')) {
            return { success: true, message: `Customer ${customerName} (Card: ${cardNumber}) updated successfully.` };
        } else {
            return { success: false, message: `Failed to update customer: ${message}` };
        }

    } catch (err: any) {
        console.error(err);
        if (sql.connected) {
            await sql.close();
        }
        let errorMessage = 'An error occurred during the database operation.';
        if (err.message) {
            errorMessage = err.message;
        }
        return { success: false, message: errorMessage };
    }
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
        
        const result = await sql.query(GET_BRANCHES_QUERY); 

        await sql.close();

        const branches = result.recordset.map((row: any) => ({
            value: row.branch,
            label: row.a_name
        }));
        
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
             if (err.message.includes('sys_branch')) {
                errorMessage = `Could not find the 'sys_branch' table. Please check your database.`;
            } else {
                errorMessage = `Could not find a table in your query. Please check your SQL query in src/lib/queries.ts.`;
            }
        }
        
        return { success: false, message: errorMessage, branches: [] };
    }
}
