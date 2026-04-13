// src/components/pages/BotIntegrationPage.tsx

'use client';

import { BotHeroBanner } from '../bot-integration/Botherobanner';
import { PlatformSetupCard } from '../bot-integration/Platformsetupcard';
import { BotCapabilities } from '../bot-integration/BotCapabilities';
import { ConnectedGroupsPanel } from '../bot-integration/Connectedgroupspanel';
import { useBotIntegration } from '@/src/hooks/useBotIntegration';

export function BotIntegrationPage() {
  const {
    linkCode,
    connectionStatus,
    linkError,
    copied,
    connectedGroups,
    groupsLoading,
    adminGroups,
    adminGroupsLoading,
    unlinkTarget,
    generatedCode,
    codeGenerating,
    selectedGroup,
    copyToClipboard,
    handleGenerateCode,
    handleLinkGroup,
    updateLinkCode,
    setUnlinkTarget,
    selectGroup,
    handleUnlink,
    refetchGroups,
  } = useBotIntegration();

  return (
    <div className="bot-page">
      <BotHeroBanner />

      <div className="bot-page__platforms">
        <PlatformSetupCard
          platform="whatsapp"
          platformLabel="WhatsApp"
          adminGroups={adminGroups}
          adminGroupsLoading={adminGroupsLoading}
          selectedGroup={selectedGroup.whatsapp}
          onSelectGroup={(g) => selectGroup('whatsapp', g)}
          generatedCode={generatedCode.whatsapp}
          codeGenerating={codeGenerating.whatsapp}
          onGenerateCode={() => handleGenerateCode('whatsapp')}
          onCopyCode={() =>
            generatedCode.whatsapp &&
            copyToClipboard(generatedCode.whatsapp.link_code, 'whatsapp-code')
          }
          codeCopied={!!copied['whatsapp-code']}
          linkCode={linkCode.whatsapp}
          connectionStatus={connectionStatus.whatsapp}
          onLinkCodeChange={(v) => updateLinkCode('whatsapp', v)}
          onLinkGroup={() => handleLinkGroup('whatsapp')}
          linkError={
            connectionStatus.whatsapp === 'error' ? linkError.whatsapp : null
          }
        />

        <PlatformSetupCard
          platform="telegram"
          platformLabel="Telegram"
          adminGroups={adminGroups}
          adminGroupsLoading={adminGroupsLoading}
          selectedGroup={selectedGroup.telegram}
          onSelectGroup={(g) => selectGroup('telegram', g)}
          generatedCode={generatedCode.telegram}
          codeGenerating={codeGenerating.telegram}
          onGenerateCode={() => handleGenerateCode('telegram')}
          onCopyCode={() =>
            generatedCode.telegram &&
            copyToClipboard(generatedCode.telegram.link_code, 'telegram-code')
          }
          codeCopied={!!copied['telegram-code']}
          linkCode={linkCode.telegram}
          connectionStatus={connectionStatus.telegram}
          onLinkCodeChange={(v) => updateLinkCode('telegram', v)}
          onLinkGroup={() => handleLinkGroup('telegram')}
          linkError={
            connectionStatus.telegram === 'error' ? linkError.telegram : null
          }
        />
      </div>

      <BotCapabilities />

      <ConnectedGroupsPanel
        groups={connectedGroups}
        isLoading={groupsLoading}
        onUnlink={handleUnlink}
        onRefresh={refetchGroups}
        unlinkTarget={unlinkTarget}
        onSetUnlinkTarget={setUnlinkTarget}
      />
    </div>
  );
}

// // src/components/pages/BotIntegrationPage.tsx

// 'use client';

// import { Smartphone, MessageCircle } from 'lucide-react';
// import { BotHeroBanner } from '../bot-integration/Botherobanner';
// import { PlatformSetupCard } from '../bot-integration/Platformsetupcard';
// import { BotCapabilities } from '../bot-integration/BotCapabilities';
// import { ConnectedGroupsPanel } from '../bot-integration/Connectedgroupspanel';
// import { useBotIntegration } from '@/src/hooks/useBotIntegration';

// const BOT_NUMBER = '0500581423';
// const TELEGRAM_USERNAME = '@SnappXBot';

// const WHATSAPP_STEPS = (botNumber: string) => [
//   {
//     num: 1,
//     title: 'Save the bot number',
//     body: (
//       <p>
//         Add <strong>{botNumber}</strong> to your contacts as <em>SnappX Bot</em>
//         .
//       </p>
//     ),
//   },
//   {
//     num: 2,
//     title: 'Add the bot to your WhatsApp group',
//     body: <p>Open your savings group, tap Participants → Add participant.</p>,
//   },
//   {
//     num: 3,
//     title: 'Activate with a command',
//     body: (
//       <p>
//         Send <code className="bot-code">!join</code> in the group chat. The bot
//         will reply with a unique link code.
//       </p>
//     ),
//   },
//   {
//     num: 4,
//     title: 'Paste the link code below',
//     body: <p>Enter the code sent by the bot to connect your SnappX group.</p>,
//   },
// ];

// const TELEGRAM_STEPS = (username: string) => [
//   {
//     num: 1,
//     title: 'Search for the bot',
//     body: (
//       <p>
//         Open Telegram and search for <strong>{username}</strong>, then tap
//         Start.
//       </p>
//     ),
//   },
//   {
//     num: 2,
//     title: 'Add the bot to your group',
//     body: <p>Go to your savings group → Add Members → search SnappXBot.</p>,
//   },
//   {
//     num: 3,
//     title: 'Grant admin permissions',
//     body: <p>Make the bot an admin so it can post announcements.</p>,
//   },
//   {
//     num: 4,
//     title: 'Activate & get your code',
//     body: (
//       <p>
//         Send <code className="bot-code">/start</code> — the bot will reply with
//         your link code.
//       </p>
//     ),
//   },
// ];

// export function BotIntegrationPage() {
//   const {
//     linkCode,
//     connectionStatus,
//     copied,
//     connectedGroups,
//     groupsLoading,
//     unlinkTarget,
//     linkError,
//     copyToClipboard,
//     handleLinkGroup,
//     handleUnlink,
//     updateLinkCode,
//     setUnlinkTarget,
//     refetchGroups,
//   } = useBotIntegration();

//   return (
//     <div className="bot-page">
//       {/* ── Hero ── */}
//       <BotHeroBanner />

//       {/* ── Platform setup cards (side by side on desktop) ── */}
//       <div className="bot-page__platforms">
//         <PlatformSetupCard
//           platform="whatsapp"
//           platformLabel="WhatsApp"
//           contactValue={BOT_NUMBER}
//           contactLabel="Bot Number"
//           steps={WHATSAPP_STEPS(BOT_NUMBER)}
//           accentColor="green"
//           icon={<Smartphone size={20} className="bot-icon bot-icon--wa" />}
//           linkCode={linkCode.whatsapp}
//           connectionStatus={connectionStatus.whatsapp}
//           copied={!!copied['whatsapp']}
//           onCopy={() => copyToClipboard(BOT_NUMBER, 'whatsapp')}
//           onLinkCodeChange={(v) => updateLinkCode('whatsapp', v)}
//           onLinkGroup={() => handleLinkGroup('whatsapp')}
//           // linkError={connectionStatus.whatsapp === 'error' ? linkError : null}
//           linkError={
//             connectionStatus.whatsapp === 'error' ? linkError.whatsapp : null
//           }
//         />

//         <PlatformSetupCard
//           platform="telegram"
//           platformLabel="Telegram"
//           contactValue={TELEGRAM_USERNAME}
//           contactLabel="Bot Username"
//           steps={TELEGRAM_STEPS(TELEGRAM_USERNAME)}
//           accentColor="sky"
//           icon={<MessageCircle size={20} className="bot-icon bot-icon--tg" />}
//           linkCode={linkCode.telegram}
//           connectionStatus={connectionStatus.telegram}
//           copied={!!copied['telegram']}
//           onCopy={() => copyToClipboard(TELEGRAM_USERNAME, 'telegram')}
//           onLinkCodeChange={(v) => updateLinkCode('telegram', v)}
//           onLinkGroup={() => handleLinkGroup('telegram')}
//           // linkError={connectionStatus.telegram === 'error' ? linkError : null}
//           linkError={
//             connectionStatus.telegram === 'error' ? linkError.telegram : null
//           }
//         />
//       </div>

//       {/* ── Capabilities ── */}
//       <BotCapabilities />

//       {/* ── Connected groups ── */}
//       <ConnectedGroupsPanel
//         groups={connectedGroups}
//         isLoading={groupsLoading}
//         onUnlink={handleUnlink}
//         onRefresh={refetchGroups}
//         unlinkTarget={unlinkTarget}
//         onSetUnlinkTarget={setUnlinkTarget}
//       />
//     </div>
//   );
// }

// // src/components/pages/BotIntegrationPage.tsx

// 'use client';

// import { useState } from 'react';
// import {
//   MessageCircle,
//   Check,
//   Copy,
//   Smartphone,
//   Users,
//   Bell,
//   TrendingUp,
//   Clock,
// } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { cn } from '../ui/utils';

// export function BotIntegrationPage() {
//   const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
//   const [copiedTelegram, setCopiedTelegram] = useState(false);

//   const botNumber = '0500581423';
//   const telegramBotUsername = '@SnappXBot';

//   const copyToClipboard = (text: string, type: 'whatsapp' | 'telegram') => {
//     navigator.clipboard.writeText(text);
//     if (type === 'whatsapp') {
//       setCopiedWhatsApp(true);
//       setTimeout(() => setCopiedWhatsApp(false), 2000);
//     } else {
//       setCopiedTelegram(true);
//       setTimeout(() => setCopiedTelegram(false), 2000);
//     }
//   };

//   const botCapabilities = [
//     {
//       icon: Bell,
//       title: 'Automatic Reminders',
//       description: 'Get notified before contribution deadlines',
//     },
//     {
//       icon: TrendingUp,
//       title: 'Payment Status Updates',
//       description: 'Real-time updates on group transactions',
//     },
//     {
//       icon: Users,
//       title: 'Payout Notifications',
//       description: "Announcements when it's your turn to receive",
//     },
//     {
//       icon: Clock,
//       title: 'Activity Tracking',
//       description: 'Monitor all group activities in one place',
//     },
//   ];

//   return (
//     <div className="space-y-6 mb-20 md:mb-0">
//       {/* Hero Section */}
//       <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-primary-foreground border-none">
//         <CardHeader>
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-12 h-12 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center">
//               <MessageCircle className="h-6 w-6 dark:text-white " />
//             </div>
//             <div>
//               <CardTitle className="text-2xl text-white">
//                 SnappX Bot Integration
//               </CardTitle>
//               <CardDescription className="text-white/90">
//                 Connect our bot to your WhatsApp or Telegram groups
//               </CardDescription>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <p className="text-white/90">
//             Stay updated with automated reminders, payment notifications, and
//             group activity tracking directly in your messaging apps.
//           </p>
//         </CardContent>
//       </Card>

//       {/* WhatsApp Setup */}
//       <Card className="bg-card border-border rounded-2xl">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2 text-[16px] md:text-[20px]">
//                 <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
//                 WhatsApp Setup
//               </CardTitle>
//               <CardDescription>
//                 Add SnappX Bot to your WhatsApp groups
//               </CardDescription>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="bg-muted/50 rounded-lg p-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-muted-foreground">Bot Number:</span>
//               <div className="flex items-center gap-2">
//                 <span className="text-lg font-mono">{botNumber}</span>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => copyToClipboard(botNumber, 'whatsapp')}
//                 >
//                   {copiedWhatsApp ? (
//                     <Check className="h-4 w-4" />
//                   ) : (
//                     <Copy className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-3">
//             <h4 className="font-medium">Setup Instructions:</h4>
//             <ol className="space-y-3 text-sm">
//               <li className="flex gap-3">
//                 <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
//                   1
//                 </span>
//                 <div>
//                   <p className="font-medium mb-1">Save the bot number</p>
//                   <p className="text-muted-foreground">
//                     Add <strong>{botNumber}</strong> to your contacts as
//                     &quot;SnappX Bot&quot;
//                   </p>
//                 </div>
//               </li>
//               <li className="flex gap-3">
//                 <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
//                   2
//                 </span>
//                 <div>
//                   <p className="font-medium mb-1">Add to your WhatsApp group</p>
//                   <p className="text-muted-foreground">
//                     Open your savings group and add the SnappX Bot number
//                   </p>
//                 </div>
//               </li>
//               <li className="flex gap-3">
//                 <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
//                   3
//                 </span>
//                 <div>
//                   <p className="font-medium mb-1">Activate the bot</p>
//                   <p className="text-muted-foreground">
//                     Send{' '}
//                     <code className="px-2 py-1 bg-muted/60 rounded">!join</code>{' '}
//                     in the group chat to activate
//                   </p>
//                 </div>
//               </li>
//               <li className="flex gap-3">
//                 <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
//                   4
//                 </span>
//                 <div>
//                   <p className="font-medium mb-1">Link your group</p>
//                   <p className="text-muted-foreground">
//                     The bot will send a link code - enter it below to connect
//                   </p>
//                 </div>
//               </li>
//               {/* ... repeat pattern for steps 2–4 ... */}
//               {/* (keeping same structure, just replace text-gray-600 → text-muted-foreground, bg-gray-100 → bg-muted/60, etc.) */}
//             </ol>
//           </div>

//           <div className="pt-4 border-t border-border">
//             <div className="space-y-2">
//               <label className="text-sm text-foreground">
//                 Enter Group Link Code:
//               </label>
//               <div className="flex gap-2">
//                 <Input
//                   placeholder="e.g., SNPX-1234-5678"
//                   className="bg-background"
//                 />
//                 <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
//                   Link Group
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Telegram Setup */}
//       <Card className="bg-card border-border rounded-2xl">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2 text-[16px] md:text-[20px]">
//                 <MessageCircle className="h-5 w-5 text-blue-500" />
//                 Telegram Setup
//               </CardTitle>
//               <CardDescription className="text-gray-500">
//                 Add SnappX Bot to your Telegram groups
//               </CardDescription>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="bg-muted/50 rounded-lg p-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-muted-foreground">
//                 Bot Username:
//               </span>
//               <div className="flex items-center gap-2">
//                 <span className="text-lg font-mono">{telegramBotUsername}</span>
//                 <Button
//                   size="sm"
//                   onClick={() =>
//                     copyToClipboard(telegramBotUsername, 'telegram')
//                   }
//                 >
//                   {copiedTelegram ? (
//                     <Check className="h-4 w-4" />
//                   ) : (
//                     <Copy className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-3">
//             <h4>Setup Instructions:</h4>
//             <ol className="space-y-3 text-sm">
//               <li className="flex gap-3">
//                 <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
//                   1
//                 </span>
//                 <div>
//                   <p className="font-medium mb-1">Search for the bot</p>
//                   <p className="text-gray-600">
//                     Open Telegram and search for{' '}
//                     <strong>{telegramBotUsername}</strong>
//                   </p>
//                 </div>
//               </li>
//               <li className="flex gap-3">
//                 <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
//                   2
//                 </span>
//                 <div>
//                   <p className="font-medium mb-1">Add to your group</p>
//                   <p className="text-gray-600">
//                     Add the bot to your savings group chat
//                   </p>
//                 </div>
//               </li>
//               <li className="flex gap-3">
//                 <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
//                   3
//                 </span>
//                 <div>
//                   <p className="font-medium mb-1">Grant admin permissions</p>
//                   <p className="text-gray-600">
//                     Make the bot an admin for full functionality
//                   </p>
//                 </div>
//               </li>
//               <li className="flex gap-3">
//                 <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
//                   4
//                 </span>
//                 <div>
//                   <p className="font-medium mb-1">Activate the bot</p>
//                   <p className="text-gray-600">
//                     Send{' '}
//                     <code className="px-2 py-1 bg-muted/60 rounded">
//                       /start
//                     </code>{' '}
//                     to begin
//                   </p>
//                 </div>
//               </li>
//             </ol>
//           </div>

//           <div className="pt-4 border-t border-border">
//             <div className="space-y-2">
//               <label className="text-sm">Enter Group Link Code:</label>
//               <div className="flex gap-2">
//                 <Input
//                   placeholder="e.g., SNPX-1234-5678"
//                   className="bg-background"
//                 />
//                 <Button className="bg-blue-500 hover:bg-blue-600 text-white">
//                   Link Group
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Bot Capabilities */}
//       <Card className="bg-card border-border rounded-2xl">
//         <CardHeader>
//           <CardTitle className="text-[16px] md:text-[20px]">
//             Bot Capabilities
//           </CardTitle>
//           <CardDescription>
//             What SnappX Bot can do for your group
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {botCapabilities.map((capability, index) => {
//               const Icon = capability.icon;
//               return (
//                 <div
//                   key={index}
//                   className={cn(
//                     'flex items-start gap-3 p-4 rounded-lg border border-border',
//                     'hover:border-primary/50 transition-colors bg-card',
//                   )}
//                 >
//                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
//                     <Icon className="h-5 w-5 text-primary" />
//                   </div>
//                   <div>
//                     <h4 className="text-sm mb-1 font-medium">
//                       {capability.title}
//                     </h4>
//                     <p className="text-sm text-muted-foreground">
//                       {capability.description}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Connected Groups */}
//       <Card className="bg-card border-border rounded-2xl">
//         <CardHeader>
//           <CardTitle className="text-[16px] md:text-[20px]">
//             Connected Groups
//           </CardTitle>
//           <CardDescription>
//             Groups currently linked to SnappX Bot
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/40">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
//                   <Smartphone className="h-5 w-5 text-green-600 dark:text-white" />
//                 </div>
//                 <div>
//                   <p className="font-medium">Family Savings Circle</p>
//                   <p className="text-sm text-muted-foreground">
//                     WhatsApp • 8 members
//                   </p>
//                 </div>
//               </div>
//               <Button size="sm" variant="outline">
//                 Manage
//               </Button>
//             </div>

//             <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/40">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-cyan-900 flex items-center justify-center">
//                   <MessageCircle className="h-5 w-5 text-blue-600 dark:text-white" />
//                 </div>
//                 <div>
//                   <p className="font-medium">Business Partners</p>
//                   <p className="text-sm text-muted-foreground">
//                     Telegram • 12 members
//                   </p>
//                 </div>
//               </div>
//               <Button size="sm" variant="outline">
//                 Manage
//               </Button>
//             </div>

//             <div className="text-center py-8 text-muted-foreground text-sm">
//               Connect more groups to get automated updates
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
