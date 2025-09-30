
     "use client";

     import { useEffect, useState } from 'react';
     import { useRouter, useSearchParams } from 'next/navigation';
     import { supabase } from '@/lib/supabase';

     export default function Home() {
       const router = useRouter();
       const searchParams = useSearchParams();
       const [isLoading, setIsLoading] = useState(true); // Prevent premature redirects

       useEffect(() => {
         const handleAuth = async () => {
           try {
             // Check user session
             const { data: { user }, error: userError } = await supabase.auth.getUser();
             if (userError || !user) {
               router.push('/login');
               return;
             }

             // Handle OAuth or email confirmation redirects
             const access_token = searchParams.get('access_token');
             const refresh_token = searchParams.get('refresh_token');
             const type = searchParams.get('type');

             if (access_token && refresh_token && type === 'signup') {
               await supabase.auth.setSession({ access_token, refresh_token });
             }

             // Check if profile is completed
             const { data, error } = await supabase
               .from('users')
               .select('profile_completed')
               .eq('id', user.id)
               .single();

             if (error) {
               console.error('Error checking profile:', error.message);
               router.push('/login');
               return;
             }

             if (!data?.profile_completed) {
               router.push('/profile');
             }
           } catch (err) {
             console.error('Auth error:', err);
             router.push('/login');
           } finally {
             setIsLoading(false);
           }
         };

         handleAuth();
       }, [router, searchParams]);

       if (isLoading) {
         return (
           <div dir="rtl" className="container mx-auto p-4">
             <p>در حال بارگذاری...</p>
           </div>
         );
       }

       return (
         <div dir="rtl" className="container mx-auto p-4">
           <h1 className="text-2xl font-bold">خوش آمدید به فروشگاه آرایشی</h1>
           <p>اینجا می‌توانید محصولات آرایشی مورد نظر خود را پیدا کنید.</p>
         </div>
       );
     }