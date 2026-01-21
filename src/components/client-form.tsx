
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, User, KeyRound, Database, GitBranch, Loader2, CreditCard, Phone, Users } from 'lucide-react';
import { submitClientData, getBranches } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Separator } from './ui/separator';

const formSchema = z.object({
  serverIp: z.string().min(1, { message: 'Server IP is required.' }),
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'Database name is required.' }),
  branch: z.string({
    required_error: 'You need to select a branch.',
  }).min(1, { message: "Please select a branch." }),
  cardNumber: z.string().regex(/^\d+$/, { message: "Card number must contain only digits." }).min(1, { message: "Card Number is required." }),
  customerName: z.string().min(1, { message: "Customer name is required." }),
  phoneNumber: z.string().min(1, { message: "Phone number is required." }),
  gender: z.enum(['1', '2'], { required_error: 'Please select a gender.' }),
});

export function ClientForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [branchesFetched, setBranchesFetched] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverIp: '10.174.8.6',
      username: 'mobile',
      password: 'meto@omar123',
      database: 'retail_t',
      branch: '',
      cardNumber: '',
      customerName: '',
      phoneNumber: '',
    },
  });

  const handleFetchBranches = async () => {
    const isValid = await form.trigger(['serverIp', 'username', 'database', 'password']);
    if (!isValid) {
        toast({
            variant: 'destructive',
            title: 'Missing Details',
            description: 'Please fill in server, username, database, and password fields.',
        });
        return;
    }

    setIsFetchingBranches(true);
    const connectionData = form.getValues();
    
    const result = await getBranches(connectionData);
    
    setIsFetchingBranches(false);

    if (result.success) {
        toast({
            title: 'Success',
            description: result.message,
        });
        setBranches(result.branches);
        setBranchesFetched(true);
        form.resetField('branch');
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message || 'An unexpected error occurred.',
        });
        setBranches([]);
        setBranchesFetched(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await submitClientData(values);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.resetField('cardNumber');
      form.resetField('customerName');
      form.resetField('phoneNumber');
      form.resetField('gender');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message || 'An unexpected error occurred.',
      });
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Client Data Manager</CardTitle>
        <CardDescription className="text-center">Enter client details to update their record in the database.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 p-4 border rounded-md bg-card">
              <h3 className="text-lg font-medium">Connection Details</h3>
              <FormField
                control={form.control}
                name="serverIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server IP</FormLabel>
                    <div className="relative">
                      <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="e.g., 192.168.1.1" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="e.g., sa" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input type="password" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="database"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database Name</FormLabel>
                    <div className="relative">
                       <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="e.g., MyDatabase" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button 
                type="button" 
                onClick={handleFetchBranches}
                className="w-full"
                disabled={isFetchingBranches}
              >
                {isFetchingBranches ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Branches...
                  </>
                ) : (
                  'Fetch Branches'
                )}
              </Button>
            </div>
            
            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <div className="relative">
                     <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!branchesFetched}>
                      <FormControl>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select a branch after fetching" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.length > 0 ? (
                            branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)
                        ) : (
                            <SelectItem value="placeholder" disabled>
                                {branchesFetched ? "No branches found" : "Fetch branches first"}
                            </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                   <FormDescription>
                    The branch list is populated from your database.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            
            <div className="space-y-4">
               <h3 className="text-lg font-medium">Client Details</h3>
                <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                            <Input placeholder="e.g., 12345" {...field} className="pl-10" />
                        </FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} className="pl-10" />
                        </FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                            <Input placeholder="e.g., 555-1234" {...field} className="pl-10" />
                        </FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                            <Select onValueChange={field.onChange} value={field.value || ''} >
                            <FormControl>
                                <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select a gender" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="1">Male</SelectItem>
                                <SelectItem value="2">Female</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>


            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isSubmitting || !branchesFetched}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Client Data...
                </>
              ) : (
                'Save Client Data'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
