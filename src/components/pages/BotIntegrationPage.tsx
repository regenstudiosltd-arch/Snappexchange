'use client';

import { useState } from 'react';
import {
  MessageCircle,
  Check,
  Copy,
  Smartphone,
  Users,
  Bell,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function BotIntegrationPage() {
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);

  const botNumber = '0500581423';
  const telegramBotUsername = '@SnappXBot';

  const copyToClipboard = (text: string, type: 'whatsapp' | 'telegram') => {
    navigator.clipboard.writeText(text);
    if (type === 'whatsapp') {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    } else {
      setCopiedTelegram(true);
      setTimeout(() => setCopiedTelegram(false), 2000);
    }
  };

  const botCapabilities = [
    {
      icon: Bell,
      title: 'Automatic Reminders',
      description: 'Get notified before contribution deadlines',
    },
    {
      icon: TrendingUp,
      title: 'Payment Status Updates',
      description: 'Real-time updates on group transactions',
    },
    {
      icon: Users,
      title: 'Payout Notifications',
      description: "Announcements when it's your turn to receive",
    },
    {
      icon: Clock,
      title: 'Activity Tracking',
      description: 'Monitor all group activities in one place',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">
                SnappX Bot Integration
              </CardTitle>
              <CardDescription className="text-white/90">
                Connect our bot to your WhatsApp or Telegram groups
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/90">
            Stay updated with automated reminders, payment notifications, and
            group activity tracking directly in your messaging apps.
          </p>
        </CardContent>
      </Card>

      {/* WhatsApp Setup */}
      <Card className="border border-gray-200 rounded-2xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[16px] md:text-[20px]">
                <Smartphone className="h-5 w-5 text-green-600" />
                WhatsApp Setup
              </CardTitle>
              <CardDescription>
                Add SnappX Bot to your WhatsApp groups
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Bot Number:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono">{botNumber}</span>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(botNumber, 'whatsapp')}
                  className="border border-gray-200"
                >
                  {copiedWhatsApp ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4>Setup Instructions:</h4>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs">
                  1
                </span>
                <div>
                  <p className="font-medium mb-1">Save the bot number</p>
                  <p className="text-gray-600">
                    Add <strong>{botNumber}</strong> to your contacts as
                    &quot;SnappX Bot&quot;
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs">
                  2
                </span>
                <div>
                  <p className="font-medium mb-1">Add to your WhatsApp group</p>
                  <p className="text-gray-600">
                    Open your savings group and add the SnappX Bot number
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs">
                  3
                </span>
                <div>
                  <p className="font-medium mb-1">Activate the bot</p>
                  <p className="text-gray-600">
                    Send{' '}
                    <code className="px-2 py-1 bg-gray-100 rounded">!join</code>{' '}
                    in the group chat to activate
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs">
                  4
                </span>
                <div>
                  <p className="font-medium mb-1">Link your group</p>
                  <p className="text-gray-600">
                    The bot will send a link code - enter it below to connect
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="pt-4 border-t border-t-gray-200">
            <div className="space-y-2">
              <label className="text-sm">Enter Group Link Code:</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., SNPX-1234-5678"
                  className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
                />
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Link Group
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Setup */}
      <Card className="border border-gray-200 rounded-2xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[16px] md:text-[20px]">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Telegram Setup
              </CardTitle>
              <CardDescription className="text-gray-500">
                Add SnappX Bot to your Telegram groups
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Bot Username:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono">{telegramBotUsername}</span>
                <Button
                  size="sm"
                  onClick={() =>
                    copyToClipboard(telegramBotUsername, 'telegram')
                  }
                  className="border border-gray-200"
                >
                  {copiedTelegram ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4>Setup Instructions:</h4>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  1
                </span>
                <div>
                  <p className="font-medium mb-1">Search for the bot</p>
                  <p className="text-gray-600">
                    Open Telegram and search for{' '}
                    <strong>{telegramBotUsername}</strong>
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  2
                </span>
                <div>
                  <p className="font-medium mb-1">Add to your group</p>
                  <p className="text-gray-600">
                    Add the bot to your savings group chat
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  3
                </span>
                <div>
                  <p className="font-medium mb-1">Grant admin permissions</p>
                  <p className="text-gray-600">
                    Make the bot an admin for full functionality
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  4
                </span>
                <div>
                  <p className="font-medium mb-1">Activate the bot</p>
                  <p className="text-gray-600">
                    Send{' '}
                    <code className="px-2 py-1 bg-gray-100 rounded">
                      /start
                    </code>{' '}
                    to begin
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="pt-4 border-t border-t-gray-200">
            <div className="space-y-2">
              <label className="text-sm">Enter Group Link Code:</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., SNPX-1234-5678"
                  className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
                />
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Link Group
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot Capabilities */}
      <Card className="border border-gray-200 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-[16px] md:text-[20px]">
            Bot Capabilities
          </CardTitle>
          <CardDescription className="text-gray-500">
            What SnappX Bot can do for your group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {botCapabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="text-sm mb-1">{capability.title}</h4>
                    <p className="text-sm text-gray-600">
                      {capability.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connected Groups */}
      <Card className="border border-gray-200 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-[16px] md:text-[20px]">
            Connected Groups
          </CardTitle>
          <CardDescription className="text-gray-500">
            Groups currently linked to SnappX Bot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Family Savings Circle</p>
                  <p className="text-sm text-gray-600">WhatsApp • 8 members</p>
                </div>
              </div>
              <Button
                size="sm"
                className="border border-gray-200 bg-gray-100 text-gray-600 hover:text-white"
              >
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Business Partners</p>
                  <p className="text-sm text-gray-600">Telegram • 12 members</p>
                </div>
              </div>
              <Button
                size="sm"
                className="border border-gray-200 bg-gray-100 text-gray-600 hover:text-white"
              >
                Manage
              </Button>
            </div>

            <div className="text-center py-8 text-gray-600 text-sm">
              Connect more groups to get automated updates
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
