
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
import { Server, User, KeyRound, Database, GitBranch, Loader2 } from 'lucide-react';
import { saveConnectionDetails, getBranches } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const formSchema = z.object({
  serverIp: z.string().min(1, { message: 'Server IP is required.' }),
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'Database name is required.' }),
  branch: z.string({
    required_error: 'You need to select a branch.',
  }).min(1, { message: "Please select a branch." }),
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
      serverIp: '',
      username: '',
      password: '',
      database: '',
      branch: '',
    },
  });

  const handleFetchBranches = async () => {
    const isValid = await form.trigger(['serverIp', 'username', 'database']);
    if (!isValid) {
        toast({
            variant: 'destructive',
            title: 'Missing Details',
            description: 'Please fill in server, username, and database fields.',
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
    const result = await saveConnectionDetails(values);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">SQL Server Configuration</CardTitle>
        <CardDescription className="text-center">Enter connection details to fetch branches from your database.</CardDescription>
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
                    <FormLabel>Password (optional)</FormLabel>
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
            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isSubmitting || !branchesFetched}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Connection'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
