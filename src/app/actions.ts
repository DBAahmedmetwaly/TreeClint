'use server';

import { z } from 'zod';

const formSchema = z.object({
  cardNumber: z.string().refine((val) => /^\d{16}$/.test(val), {
    message: 'Card number must be 16 digits.',
  }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().refine((val) => /^\+?[1-9]\d{1,14}$/.test(val), {
    message: 'Invalid phone number format.',
  }),
  customerType: z.enum(['individual', 'business']),
});

export async function updateClientData(data: z.infer<typeof formSchema>) {
  const parsedData = formSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, message: 'Invalid data provided.' };
  }

  // Simulate network delay and database operation
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Simulating update for client data:', parsedData.data);

  // In a real application, you would connect to your SQL server and
  // execute an UPDATE or INSERT statement here.
  // Example:
  // try {
  //   // const connection = await connectToSqlServer();
  //   // await connection.query`UPDATE Clients SET Name = ${parsedData.data.name}, Phone = ${parsedData.data.phone}, Type = ${parsedData.data.customerType} WHERE CardNumber = ${parsedData.data.cardNumber}`;
  //   return { success: true, message: `Client ${parsedData.data.name} updated.` };
  // } catch (error) {
  //   console.error('Database error:', error);
  //   return { success: false, message: 'Failed to update data in the database.' };
  // }

  return { success: true, message: `Client ${parsedData.data.name} has been registered.` };
}
