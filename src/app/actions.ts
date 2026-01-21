'use server';

import { z } from 'zod';

const formSchema = z.object({
  serverIp: z.string().min(1, { message: 'Server IP is required.' }),
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'Database name is required.' }),
  branch: z.string({
    required_error: 'You need to select a branch.',
  }),
});


export async function saveConnectionDetails(data: z.infer<typeof formSchema>) {
  const parsedData = formSchema.safeParse(data);

  if (!parsedData.success) {
    // The client-side validation should prevent this, but it's good practice
    // to have server-side validation as well.
    return { success: false, message: 'Invalid data provided.' };
  }

  // Simulate network delay and database operation
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Simulating saving connection details:', parsedData.data);

  // In a real app, you would use these details to connect to the SQL server
  // and then fetch the list of branches.
  // For security reasons, sensitive data like passwords should be handled
  // with care and not stored insecurely.

  return { success: true, message: `Connection details received for server ${parsedData.data.serverIp}.` };
}
