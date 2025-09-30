
     "use client";

     import { useEffect, useState } from 'react';
     import { useRouter } from 'next/navigation';
     import { supabase } from '@/lib/supabase';

     interface ProfileForm {
       full_name: string;
       phone_number: string;
       address: string;
       postal_code: string;
       birthday: string;
     }

     const ProfilePage: React.FC = () => {
       const [formData, setFormData] = useState<ProfileForm>({
         full_name: '',
         phone_number: '',
         address: '',
         postal_code: '',
         birthday: '',
       });
       const [error, setError] = useState<string | null>(null);
       const [loading, setLoading] = useState<boolean>(false);
       const router = useRouter();

       // Check if profile is completed on mount
       useEffect(() => {
         const checkProfile = async () => {
           const { data: { user } } = await supabase.auth.getUser();
           if (!user) {
             router.push('/login');
             return;
           }

           const { data, error } = await supabase
             .from('users')
             .select('profile_completed')
             .eq('id', user.id)
             .single();

           if (error) {
             setError('خطا در بررسی پروفایل: ' + error.message);
             return;
           }

           if (data?.profile_completed) {
             router.push('/'); // Redirect to homepage if profile is completed
           }
         };

         checkProfile();
       }, [router]);

       const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         setError(null);
         setLoading(true);

         // Validate inputs
         if (!formData.full_name || !formData.phone_number || !formData.address || !formData.postal_code || !formData.birthday) {
           setError('لطفاً تمام فیلدها را پر کنید.');
           setLoading(false);
           return;
         }

         // Validate Iranian phone number (e.g., +989123456789)
         if (!/^\+989[0-9]{9}$/.test(formData.phone_number)) {
           setError('شماره تلفن باید با +98 شروع شده و 12 رقم باشد.');
           setLoading(false);
           return;
         }

         // Validate Iranian postal code (10 digits)
         if (!/^[0-9]{10}$/.test(formData.postal_code)) {
           setError('کد پستی باید 10 رقم باشد.');
           setLoading(false);
           return;
         }

         try {
           const { data: { user } } = await supabase.auth.getUser();
           if (!user) throw new Error('کاربر یافت نشد.');

           const { error } = await supabase
             .from('users')
             .update({
               full_name: formData.full_name,
               phone_number: formData.phone_number,
               address: formData.address,
               postal_code: formData.postal_code,
               birthday: formData.birthday,
               profile_completed: true,
             })
             .eq('id', user.id);

           if (error) throw error;

           router.push('/');
         } catch (err: any) {
           setError('خطا در ذخیره پروفایل: ' + err.message);
         } finally {
           setLoading(false);
         }
       };

       const handleSkip = async () => {
         setLoading(true);
         try {
           const { data: { user } } = await supabase.auth.getUser();
           if (!user) throw new Error('کاربر یافت نشد.');

           const { error } = await supabase
             .from('users')
             .update({ profile_completed: true })
             .eq('id', user.id);

           if (error) throw error;

           router.push('/');
         } catch (err: any) {
           setError('خطا در رد کردن: ' + err.message);
         } finally {
           setLoading(false);
         }
       };

       return (
         <div dir="rtl" className="container mx-auto p-4 max-w-md">
           <h1 className="text-2xl font-bold mb-4">تکمیل پروفایل</h1>
           <p className="mb-4 text-sm">لطفاً اطلاعات زیر را برای تکمیل پروفایل خود وارد کنید یا برای تکمیل بعداً، رد کنید.</p>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label htmlFor="full_name" className="block text-sm font-medium">نام کامل</label>
               <input
                 id="full_name"
                 type="text"
                 value={formData.full_name}
                 onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                 className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                 required
                 placeholder="نام کامل خود را وارد کنید"
               />
             </div>
             <div>
               <label htmlFor="phone_number" className="block text-sm font-medium">شماره تلفن</label>
               <input
                 id="phone_number"
                 type="tel"
                 value={formData.phone_number}
                 onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                 className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                 required
                 placeholder="+989123456789"
               />
             </div>
             <div>
               <label htmlFor="address" className="block text-sm font-medium">آدرس</label>
               <textarea
                 id="address"
                 value={formData.address}
                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                 className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                 required
                 placeholder="آدرس کامل خود را وارد کنید"
               />
             </div>
             <div>
               <label htmlFor="postal_code" className="block text-sm font-medium">کد پستی</label>
               <input
                 id="postal_code"
                 type="text"
                 value={formData.postal_code}
                 onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                 className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                 required
                 placeholder="1234567890"
               />
             </div>
             <div>
               <label htmlFor="birthday" className="block text-sm font-medium">تاریخ تولد</label>
               <input
                 id="birthday"
                 type="date"
                 value={formData.birthday}
                 onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                 className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                 required
               />
             </div>
             {error && <p className="text-red-500 text-sm">{error}</p>}
             <div className="flex gap-4">
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
               >
                 {loading ? 'در حال ذخیره...' : 'ذخیره پروفایل'}
               </button>
               <button
                 type="button"
                 onClick={handleSkip}
                 disabled={loading}
                 className="w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
               >
                 {loading ? 'در حال رد کردن...' : 'رد کردن'}
               </button>
             </div>
           </form>
         </div>
       );
     };

     export default ProfilePage;