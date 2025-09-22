 "use client";
 import { useState } from 'react';
     import { supabase } from '../../lib/supabase';
     import Link from 'next/link';

     const SignupPage: React.FC = () => {
       const [email, setEmail] = useState<string>('');
       const [password, setPassword] = useState<string>('');
       const [error, setError] = useState<string | null>(null);
       const [message, setMessage] = useState<string | null>(null);
       const [loading, setLoading] = useState<boolean>(false);

       const handleSignup = async (e: React.FormEvent) => {
         e.preventDefault();
         setError(null);
         setMessage(null);
         setLoading(true);

         try {
           const { data, error } = await supabase.auth.signUp({
             email,
             password,
             options: {
               data: { role: 'customer' }, // Set default role for users table
               emailRedirectTo: `${window.location.origin}/`, // Redirect to homepage
             },
           });

           if (error) throw error;

           setMessage('لطفاً ایمیل خود را بررسی کنید تا حسابتان تأیید شود.');
         } catch (err: any) {
           setError('خطا در ثبت‌نام: ' + err.message);
         } finally {
           setLoading(false);
         }
       };

       return (
         <div dir="rtl" className="container mx-auto p-4 max-w-md">
           <h1 className="text-2xl font-bold mb-4">ثبت‌نام در فروشگاه آرایشی</h1>
           <form onSubmit={handleSignup} className="space-y-4">
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
             <div>
               <label htmlFor="password" className="block text-sm font-medium">
                 رمز عبور
               </label>
               <input
                 id="password"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                 required
                 placeholder="رمز عبور خود را وارد کنید"
               />
             </div>
             {error && <p className="text-red-500 text-sm">{error}</p>}
             {message && <p className="text-green-500 text-sm">{message}</p>}
             <button
               type="submit"
               disabled={loading}
               className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
             >
               {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
             </button>
           </form>
           <p className="mt-4 text-center text-sm">
             حساب کاربری دارید؟{' '}
             <Link href="/login" className="text-blue-500 underline hover:text-blue-700">
               ورود
             </Link>
           </p>
         </div>
       );
     };

     export default SignupPage;