
     "use client";

     import { useState } from 'react';
     import { useRouter } from 'next/navigation';
     import { supabase } from '@/lib/supabase';
     import Link from 'next/link';

     const LoginPage: React.FC = () => {
       const [email, setEmail] = useState<string>('');
       const [password, setPassword] = useState<string>('');
       const [error, setError] = useState<string | null>(null);
       const [loading, setLoading] = useState<boolean>(false);
       const router = useRouter();

       const handleLogin = async (e: React.FormEvent) => {
         e.preventDefault();
         setError(null);
         setLoading(true);

         try {
           const { data, error } = await supabase.auth.signInWithPassword({
             email,
             password,
           });

           if (error) throw error;

           // Redirect to homepage after successful login
           router.push('/');
         } catch (err: any) {
           setError('خطا در ورود: ' + err.message);
         } finally {
           setLoading(false);
         }
       };

       const handleGoogleLogin = async () => {
         setLoading(true);
         try {
           const { error } = await supabase.auth.signInWithOAuth({
             provider: 'google',
             options: {
               redirectTo: `${window.location.origin}/`,
             },
           });

           if (error) throw error;
         } catch (err: any) {
           setError('خطا در ورود با گوگل: ' + err.message);
         } finally {
           setLoading(false);
         }
       };

       return (
         <div dir="rtl" className="container mx-auto p-4 max-w-md">
           <h1 className="text-2xl font-bold mb-4">ورود به فروشگاه آرایشی</h1>
           <form onSubmit={handleLogin} className="space-y-4">
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
             <button
               type="submit"
               disabled={loading}
               className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
             >
               {loading ? 'در حال ورود...' : 'ورود'}
             </button>
           </form>
           <div className="mt-4 text-center">
             <button
               onClick={handleGoogleLogin}
               disabled={loading}
               className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="h-5 w-5" />
               ورود با گوگل
             </button>
           </div>
           <p className="mt-4 text-center text-sm">
             حساب کاربری ندارید؟{' '}
             <Link href="/signup" className="text-blue-500 underline hover:text-blue-700">
               ثبت‌نام
             </Link>
           </p>
         </div>
       );
     };

     export default LoginPage;