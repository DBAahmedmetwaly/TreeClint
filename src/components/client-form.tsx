
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
  serverIp: z.string().min(1, { message: 'عنوان IP الخاص بالخادم مطلوب.' }),
  username: z.string().min(1, { message: 'اسم المستخدم مطلوب.' }),
  password: z.string().optional(),
  database: z.string().min(1, { message: 'اسم قاعدة البيانات مطلوب.' }),
  branch: z.string({
    required_error: 'يجب عليك اختيار فرع.',
  }).min(1, { message: "الرجاء اختيار فرع." }),
  cardNumber: z.string().regex(/^\d+$/, { message: "رقم الكارت يجب أن يحتوي على أرقام فقط." }).min(1, { message: "رقم الكارت مطلوب." }),
  customerName: z.string().min(1, { message: "اسم العميل مطلوب." }),
  phoneNumber: z.string().min(1, { message: "رقم الهاتف مطلوب." }),
  gender: z.enum(['1', '2'], { required_error: 'الرجاء اختيار الجنس.' }),
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
            title: 'تفاصيل ناقصة',
            description: 'الرجاء تعبئة حقول السيرفر واسم المستخدم وقاعدة البيانات وكلمة المرور.',
        });
        return;
    }

    setIsFetchingBranches(true);
    const connectionData = form.getValues();
    
    const result = await getBranches(connectionData);
    
    setIsFetchingBranches(false);

    if (result.success) {
        toast({
            title: 'نجاح',
            description: result.message,
        });
        setBranches(result.branches);
        setBranchesFetched(true);
        form.resetField('branch');
        setActiveAccordion("item-2");
    } else {
        toast({
            variant: 'destructive',
            title: 'خطأ',
            description: result.message || 'حدث خطأ غير متوقع.',
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
        title: 'نجاح!',
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
        title: 'خطأ',
        description: result.message || 'حدث خطأ غير متوقع.',
      });
    }
  }

  return (
    <Card className="shadow-2xl w-full border-2">
      <CardHeader>
        <div className="flex items-center justify-center gap-3">
            <Network className="h-8 w-8 text-primary"/>
            <CardTitle className="font-headline text-3xl text-center">مدير عملاء تري للملابس</CardTitle>
        </div>
        <CardDescription className="text-center pt-2">أدخل تفاصيل الاتصال، ثم قم بتسجيل أو تحديث بيانات العميل.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="single" collapsible className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">1. إعدادات الاتصال</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="serverIp"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>IP السيرفر</FormLabel>
                                    <div className="relative">
                                    <Server className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder="مثال: 192.168.1.1" {...field} className="pr-10" />
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
                                    <FormLabel>اسم المستخدم</FormLabel>
                                    <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder="مثال: mobile" {...field} className="pr-10" />
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
                                    <FormLabel>كلمة المرور</FormLabel>
                                    <div className="relative">
                                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input type="password" {...field} className="pr-10" />
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
                                    <FormLabel>اسم قاعدة البيانات</FormLabel>
                                    <div className="relative">
                                    <Database className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder="مثال: retail_t" {...field} className="pr-10" />
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
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    جاري جلب الفروع...
                                </>
                                ) : (
                                'جلب الفروع'
                                )}
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" disabled={!branchesFetched}>
                    <AccordionTrigger className="text-xl font-semibold">2. تسجيل العميل</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="branch"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>اسم الفرع</FormLabel>
                                    <div className="relative">
                                        <GitBranch className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={!branchesFetched}>
                                        <FormControl>
                                            <SelectTrigger className="pr-10">
                                            <SelectValue placeholder="اختر فرعًا بعد جلبه" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {branches.length > 0 ? (
                                                branches.map(branch => <SelectItem key={branch.value} value={branch.value}>{branch.label}</SelectItem>)
                                            ) : (
                                                <SelectItem value="placeholder" disabled>
                                                    {branchesFetched ? "لم يتم العثور على فروع" : "قم بجلب الفروع أولاً"}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                        </Select>
                                    </div>
                                    <FormDescription>
                                        يتم ملء قائمة الفروع من قاعدة بياناتك.
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
                                    <FormLabel>رقم الكارت</FormLabel>
                                    <div className="relative">
                                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder="مثال: 12345" {...field} className="pr-10" />
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
                                    <FormLabel>اسم العميل</FormLabel>
                                    <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder="مثال: جون دو" {...field} className="pr-10" />
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
                                    <FormLabel>رقم الهاتف</FormLabel>
                                    <div className="relative">
                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder="مثال: 555-1234" {...field} className="pr-10" />
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
                                    <FormLabel>الجنس</FormLabel>
                                    <div className="relative">
                                        <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                                        <Select onValueChange={field.onChange} value={field.value || ''} >
                                        <FormControl>
                                            <SelectTrigger className="pr-10">
                                            <SelectValue placeholder="اختر الجنس" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">ذكر</SelectItem>
                                            <SelectItem value="2">أنثى</SelectItem>
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
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري حفظ بيانات العميل...
                </>
              ) : (
                'حفظ بيانات العميل'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
