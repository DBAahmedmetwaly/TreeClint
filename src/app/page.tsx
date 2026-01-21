import { ClientForm } from '@/components/client-form';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        <ClientForm />
      </div>
    </main>
  );
}
