'use client';

import { useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Image from 'next/image';
import { authService } from '@/src/services/auth.service';
import { UserProfile } from '@/src/lib/schemas';

export default function ProfilePage() {
  const { data, isLoading, isError, error, refetch } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 flex items-start justify-center">
        <Card className="w-full max-w-2xl bg-card border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Header skeleton */}
          <CardHeader className="text-center pb-8 pt-10">
            <div className="relative mx-auto w-32 h-32 rounded-full bg-muted animate-pulse" />
            <div className="mx-auto mt-6 h-8 w-48 rounded-lg bg-muted animate-pulse" />
          </CardHeader>

          {/* Fields skeleton */}
          <CardContent className="px-6 md:px-10 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-muted/30 rounded-2xl border border-border"
                >
                  {/* Icon placeholder */}
                  <div className="mt-1 h-5 w-5 rounded-md bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    {/* Label */}
                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                    {/* Value — slightly varied widths for a natural look */}
                    <div
                      className="h-4 rounded bg-muted animate-pulse"
                      style={{ width: `${55 + (i % 3) * 15}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-2xl bg-card border-border">
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <p className="mt-4 text-destructive font-medium">
              {error instanceof Error
                ? error.message
                : 'Failed to load profile'}
            </p>
            <Button
              onClick={() => refetch()}
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profilePic = data.profile_picture;

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex items-start justify-center">
      <Card className="w-full max-w-2xl bg-card border-border rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-md">
            {profilePic ? (
              <Image
                src={profilePic}
                alt={data.full_name}
                fill
                className="object-cover"
                sizes="128px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl mt-6 font-semibold text-foreground">
            {data.full_name}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 md:px-10 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileField icon={Mail} label="Email" value={data.email} />
            <ProfileField
              icon={Calendar}
              label="Date of Birth"
              value={data.date_of_birth}
            />
            <ProfileField
              icon={User}
              label="User Type"
              value={
                data.user_type
                  ? data.user_type.charAt(0).toUpperCase() +
                    data.user_type.slice(1)
                  : 'Not set'
              }
            />
            <ProfileField
              icon={Phone}
              label="Mobile Money Number"
              value={data.momo_number}
            />
            <ProfileField
              icon={MapPin}
              label="GhanaPost GPS"
              value={data.ghana_post_address}
            />
            <ProfileField
              icon={Wallet}
              label="MoMo Provider"
              value={data.momo_provider?.toUpperCase() || 'Not set'}
            />
            <ProfileField
              icon={User}
              label="MoMo Account Name"
              value={data.momo_name}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 p-5 bg-muted/30 hover:bg-muted/50 rounded-2xl transition-colors border border-border group">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-base font-medium text-foreground mt-1 group-hover:text-primary transition-colors">
          {value || 'Not set'}
        </p>
      </div>
    </div>
  );
}

// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import {
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   MapPin,
//   Wallet,
//   Loader2,
//   AlertCircle,
// } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import Image from 'next/image';
// import { authService } from '@/src/services/auth.service';
// import { UserProfile } from '@/src/lib/schemas';

// export default function ProfilePage() {
//   const { data, isLoading, isError, error, refetch } = useQuery<UserProfile>({
//     queryKey: ['userProfile'],
//     queryFn: authService.getProfile,
//     staleTime: 10 * 60 * 1000,
//     gcTime: 30 * 60 * 1000,
//     retry: 2,
//   });

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background px-4">
//         <Card className="w-full max-w-2xl bg-card border-border">
//           <CardContent className="py-20 flex flex-col items-center">
//             <Loader2 className="h-10 w-10 animate-spin text-primary" />
//             <p className="mt-4 text-muted-foreground">
//               Loading your profile...
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (isError || !data) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background px-4">
//         <Card className="w-full max-w-2xl bg-card border-border">
//           <CardContent className="py-12 text-center">
//             <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
//             <p className="mt-4 text-destructive font-medium">
//               {error instanceof Error
//                 ? error.message
//                 : 'Failed to load profile'}
//             </p>
//             <Button
//               onClick={() => refetch()}
//               className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
//             >
//               Try Again
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const profilePic = data.profile_picture;

//   return (
//     <div className="min-h-screen bg-background px-4 py-8 flex items-start justify-center">
//       <Card className="w-full max-w-2xl bg-card border-border rounded-2xl shadow-xl overflow-hidden">
//         <CardHeader className="text-center pb-8 pt-10">
//           <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-md">
//             {profilePic ? (
//               <Image
//                 src={profilePic}
//                 alt={data.full_name}
//                 fill
//                 className="object-cover"
//                 sizes="128px"
//                 priority
//               />
//             ) : (
//               <div className="w-full h-full bg-muted flex items-center justify-center">
//                 <User className="h-16 w-16 text-muted-foreground" />
//               </div>
//             )}
//           </div>
//           <CardTitle className="text-3xl mt-6 font-semibold text-foreground">
//             {data.full_name}
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="px-6 md:px-10 pb-10">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <ProfileField icon={Mail} label="Email" value={data.email} />
//             <ProfileField
//               icon={Calendar}
//               label="Date of Birth"
//               value={data.date_of_birth}
//             />
//             <ProfileField
//               icon={User}
//               label="User Type"
//               value={
//                 data.user_type
//                   ? data.user_type.charAt(0).toUpperCase() +
//                     data.user_type.slice(1)
//                   : 'Not set'
//               }
//             />
//             <ProfileField
//               icon={Phone}
//               label="Mobile Money Number"
//               value={data.momo_number}
//             />
//             <ProfileField
//               icon={MapPin}
//               label="GhanaPost GPS"
//               value={data.ghana_post_address}
//             />
//             <ProfileField
//               icon={Wallet}
//               label="MoMo Provider"
//               value={data.momo_provider?.toUpperCase() || 'Not set'}
//             />
//             <ProfileField
//               icon={User}
//               label="MoMo Account Name"
//               value={data.momo_name}
//             />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function ProfileField({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: React.ComponentType<{ className?: string }>;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-start gap-4 p-5 bg-muted/30 hover:bg-muted/50 rounded-2xl transition-colors border border-border group">
//       <div className="mt-1">
//         <Icon className="h-5 w-5 text-primary" />
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//           {label}
//         </p>
//         <p className="text-base font-medium text-foreground mt-1 group-hover:text-primary transition-colors">
//           {value || 'Not set'}
//         </p>
//       </div>
//     </div>
//   );
// }
