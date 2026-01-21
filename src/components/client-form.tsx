
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
import { Server, User, KeyRound, Database, GitBranch, Loader2, CreditCard, Phone, Users, Network } from 'lucide-react';
import { submitClientData, getBranches } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


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
  const [branches, setBranches] = useState<{ value: string; label: string; }[]>([]);
  const [branchesFetched, setBranchesFetched] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>('item-1');


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
        setActiveAccordion("item-2");
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
      const currentValues = form.getValues();
      form.reset({
        serverIp: currentValues.serverIp,
        username: currentValues.username,
        password: currentValues.password,
        database: currentValues.database,
        branch: currentValues.branch,
        cardNumber: '',
        customerName: '',
        phoneNumber: '',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message || 'An unexpected error occurred.',
      });
    }
  }

  return (
    <Card className="shadow-2xl w-full border-2">
      <CardHeader>
        <div className="flex items-center justify-center gap-3">
            <Network className="h-8 w-8 text-primary"/>
            <CardTitle className="font-headline text-3xl text-center">Client Data Manager</CardTitle>
        </div>
        <CardDescription className="text-center pt-2">Enter connection details, then register or update a client.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="single" collapsible className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">1. Connection Settings</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-4">
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
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" disabled={!branchesFetched}>
                    <AccordionTrigger className="text-xl font-semibold">2. Client Registration</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-4">
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
                                                branches.map(branch => <SelectItem key={branch.value} value={branch.value}>{branch.label}</SelectItem>)
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
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <Button 
              type="submit" 
              className="w-full text-lg py-6"
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
