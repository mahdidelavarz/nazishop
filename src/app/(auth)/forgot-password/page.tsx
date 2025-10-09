
     "use client";

     import { useState } from 'react';
     import { useRouter } from 'next/navigation';
     import { supabase } from '@/lib/supabase';
     import Link from 'next/link';

     const ForgotPasswordPage: React.FC = () => {
       const [email, setEmail] = useState<string>('');
       const [error, setError] = useState<string | null>(null);
       const [message, setMessage] = useState<string | null>(null);
       const [loading, setLoading] = useState<boolean>(false);
       const router = useRouter();

       const handleForgotPassword = async (e: React.FormEvent) => {
         e.preventDefault();
         setError(null);
         setMessage(null);
         setLoading(true);

         try {
           const { error } = await supabase.auth.resetPasswordForEmail(email, {
             redirectTo: `${window.location.origin}/reset-password`,
           });

           if (error) throw error;

           setMessage('لطفاً ایمیل خود را بررسی کنید تا لینک بازنشانی رمز عبور را دریافت کنید.');
         } catch (err: any) {
           setError('خطا در ارسال ایمیل بازنشانی: ' + err.message);
         } finally {
           setLoading(false);
         }
       };

       return (
         <div dir="rtl" className="container mx-auto p-4 max-w-md">
           <h1 className="text-2xl font-bold mb-4">بازنشانی رمز عبور</h1>
           <form onSubmit={handleForgotPassword} className="space-y-4">
             <div>
               <label htmlFor="email" className="block text-sm font-medium">
                 ایمیل
               </label>
               <input
                 id="email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                 required
                 placeholder="ایمیل خود را وارد کنید"
               />
             </div>
             {error && <p className="text-red-500 text-sm">{error}</p>}
             {message && <p className="text-green-500 text-sm">{message}</p>}
             <button
               type="submit"
               disabled={loading}
               className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
             >
               {loading ? 'در حال ارسال...' : 'ارسال لینک بازنشانی'}
             </button>
           </form>
           <p className="mt-4 text-center text-sm">
             به خاطر آوردید؟{' '}
             <Link href="/login" className="text-blue-500 underline hover:text-blue-700">
               ورود
             </Link>
           </p>
           <p className="mt-2 text-center text-sm">
             حساب کاربری ندارید؟{' '}
             <Link href="/signup" className="text-blue-500 underline hover:text-blue-700">
               ثبت‌نام
             </Link>
           </p>
         </div>
       );
     };

     export default ForgotPasswordPage;
