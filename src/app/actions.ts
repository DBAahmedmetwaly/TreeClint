
'use server';

import { z } from 'zod';
import sql from 'mssql';
import { GET_BRANCHES_QUERY, UPDATE_CUSTOMER_QUERY } from '@/lib/queries';
import { getDbPool } from '@/lib/db';

const clientFormSchema = z.object({
  serverIp: z.string().min(1, { message: 'عنوان IP الخاص بالخادم مطلوب.' }),
  username: z.string().min(1, { message: 'اسم المستخدم مطلوب.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'اسم قاعدة البيانات مطلوب.' }),
  branch: z.string({
    required_error: 'يجب عليك اختيار فرع.',
  }).min(1, { message: 'يجب عليك اختيار فرع.' }),
  cardNumber: z.string().min(1, { message: 'رقم الكارت مطلوب.' }),
  customerName: z.string().min(1, { message: 'اسم العميل مطلوب.' }),
  phoneNumber: z.string().min(1, { message: 'رقم الهاتف مطلوب.' }),
  gender: z.enum(['1', '2'], { required_error: 'الجنس مطلوب.' }),
});


export async function submitClientData(data: z.infer<typeof clientFormSchema>) {
    const parsedData = clientFormSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, message: 'البيانات المقدمة غير صالحة.' };
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
        },
        connectionTimeout: 15000,
        requestTimeout: 15000,
    };

    try {
        const pool = await getDbPool(config);
        const request = pool.request();
        
        request.input('cardNumber', sql.Int, parseInt(cardNumber, 10));
        request.input('branchName', sql.NVarChar, branch);
        request.input('customerName', sql.NVarChar, customerName);
        request.input('gender', sql.VarChar, gender);
        request.input('phoneNumber', sql.VarChar, phoneNumber);

        const result = await request.query(UPDATE_CUSTOMER_QUERY);
        
        const message = result.recordset[0]?.message || 'لم يتم إرجاع رسالة من قاعدة البيانات.';
        if (message.includes('بنجاح')) {
            return { success: true, message: message };
        } else {
            return { success: false, message: message };
        }

    } catch (err: any) {
        console.error(err);
        let errorMessage = 'حدث خطأ أثناء عملية قاعدة البيانات.';
        if (err.code === 'ETIMEOUT') {
            errorMessage = 'انتهت مهلة حفظ البيانات. قد تكون الشبكة ضعيفة. حاول مرة أخرى.';
        } else if (err.message) {
            errorMessage = err.message;
        }
        return { success: false, message: errorMessage };
    }
}


const connectionSchema = z.object({
  serverIp: z.string().min(1, { message: 'عنوان IP الخاص بالخادم مطلوب.' }),
  username: z.string().min(1, { message: 'اسم المستخدم مطلوب.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'اسم قاعدة البيانات مطلوب.' }),
});


export async function checkConnection(data: z.infer<typeof connectionSchema>) {
    const parsedData = connectionSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, message: 'بيانات الاتصال المدخلة غير كاملة أو غير صالحة.' };
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
        },
        connectionTimeout: 15000,
        requestTimeout: 15000,
    };

    try {
        const pool = await getDbPool(config);
        await pool.query('SELECT 1'); // A lightweight query to confirm connection
        return { success: true, message: 'الاتصال بقاعدة البيانات ناجح!' };

    } catch (err: any) {
        console.error(err);
        
        let errorMessage = 'فشل الاتصال. يرجى التحقق من تفاصيل الاتصال والشبكة.';
        if (err.code === 'ELOGIN') {
            errorMessage = 'فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور.';
        } else if (err.code === 'ENOCONNECTION') {
            errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من IP السيرفر.';
        } else if (err.code === 'ETIMEOUT') {
            errorMessage = 'انتهت مهلة الاتصال بالخادم. قد تكون الشبكة ضعيفة.';
        }
        
        return { success: false, message: errorMessage };
    }
}


export async function getBranches(data: z.infer<typeof connectionSchema>) {
    const parsedData = connectionSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, message: 'بيانات الاتصال غير صالحة.', branches: [] };
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
        },
        connectionTimeout: 15000,
        requestTimeout: 15000,
    };

    try {
        const pool = await getDbPool(config);
        
        const result = await pool.query(GET_BRANCHES_QUERY); 

        const branches = result.recordset.map((row: any) => ({
            value: row.branch,
            label: row.a_name
        }));
        
        if (branches.length === 0) {
            return { success: true, message: 'تم الاتصال بنجاح، ولكن لم يتم العثور على فروع.', branches: [] };
        }

        return { success: true, message: 'تم جلب الفروع بنجاح!', branches };

    } catch (err: any) {
        console.error(err);
        
        let errorMessage = 'فشل الاتصال أو جلب البيانات. يرجى التحقق من تفاصيل الاتصال والاستعلام.';
        if (err.code === 'ELOGIN') {
            errorMessage = 'فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور.';
        } else if (err.code === 'ENOCONNECTION') {
            errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من IP السيرفر.';
        } else if (err.code === 'ETIMEOUT') {
            errorMessage = 'انتهت مهلة الاتصال بالخادم. قد تكون الشبكة ضعيفة. حاول مرة أخرى.';
        } else if (err.message && err.message.includes('Invalid object name')) {
             if (err.message.includes('sys_branch')) {
                errorMessage = `تعذر العثور على جدول 'sys_branch'. يرجى التحقق من قاعدة بياناتك.`;
            } else {
                errorMessage = `تعذر العثور على جدول في استعلامك. يرجى التحقق من استعلام SQL في src/lib/queries.ts.`;
            }
        }
        
        return { success: false, message: errorMessage, branches: [] };
    }
}
