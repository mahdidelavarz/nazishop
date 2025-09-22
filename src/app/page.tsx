
     "use client";

     import { useEffect, useState } from 'react';
     import { useRouter, useSearchParams } from 'next/navigation';
     import { supabase } from '@/lib/supabase';

     const HomePage: React.FC = () => {
       const router = useRouter();
       const searchParams = useSearchParams();
       const [message, setMessage] = useState<string | null>(null);

       useEffect(() => {
         // Handle auth tokens from query parameters
         const access_token = searchParams.get('access_token');
         const refresh_token = searchParams.get('refresh_token');
         const error = searchParams.get('error');

         if (error) {
           setMessage(`خطا: ${error}`);
           return;
         }

         if (access_token && refresh_token) {
           // Set session to log the user in
           supabase.auth.setSession({
             access_token,
             refresh_token,
           }).then(({ error }) => {
             if (error) {
               setMessage('خطا در ورود: ' + error.message);
             } else {
               setMessage('خوش آمدید! حساب شما با موفقیت تأیید شد.');
               // Clear query params from URL
               router.replace('/');
             }
           });
         }
       }, [router, searchParams]);

       return (
         <div dir="rtl" className="container mx-auto p-4">
           <h1 className="text-3xl font-bold mb-4">خوش آمدید به فروشگاه آرایشی</h1>
           {message && <p className="text-green-500">{message}</p>}
           <p className="text-lg">محصولات آرایشی با بهترین کیفیت</p>
           {/* Add product listings or other content later */}
         </div>
       );
     };

     export default HomePage;