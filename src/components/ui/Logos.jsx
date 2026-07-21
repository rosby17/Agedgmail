import React from 'react';

export const YouTubeLogo = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const GmailLogo = ({ className = "" }) => (
  <img src="/gmail-logo.png" alt="Gmail" className={`w-full h-full object-contain scale-[1.5] ${className}`} />
);

export const FacebookIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const brandBox = "w-full h-full object-contain p-3";

export const DiscordLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#5865F2" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
  </svg>
);

export const InstagramLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs>
    <rect width="24" height="24" rx="6" fill="url(#ig)"/>
    <path fill="none" stroke="#fff" strokeWidth="1.6" d="M8 3.5h8A4.5 4.5 0 0120.5 8v8a4.5 4.5 0 01-4.5 4.5H8A4.5 4.5 0 013.5 16V8A4.5 4.5 0 018 3.5z"/>
    <circle cx="12" cy="12" r="3.6" fill="none" stroke="#fff" strokeWidth="1.6"/>
    <circle cx="16.6" cy="7.4" r="1.1" fill="#fff"/>
  </svg>
);

export const TwitterLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#000" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const TikTokLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="#25F4EE" d="M9.4 8.9v-1a4.6 4.6 0 00-1-.1A4.7 4.7 0 004.3 15a4.7 4.7 0 01-.9-2.8 4.7 4.7 0 016-4.5z"/>
    <path fill="#000" d="M16.6 3h-2.9v11.6a2 2 0 11-1.4-1.9V9.7a4.9 4.9 0 00-.6 0A4.9 4.9 0 1016.2 15V8.9a6.3 6.3 0 003.7 1.2V7.2a3.5 3.5 0 01-3.3-3.5z"/>
    <path fill="#FE2C55" d="M17.6 6.2A3.5 3.5 0 0116.6 3h-.9a3.5 3.5 0 002.9 3.5zM12.9 11.9a2 2 0 00-1.4 3.7 2 2 0 01-.6-3.6 2 2 0 012 0z"/>
  </svg>
);

export const AppleLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#000" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

export const TelegramLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#229ED9"/>
    <path fill="#fff" d="M5.5 11.8l11-4.24c.51-.19.96.12.79.9l-1.87 8.82c-.13.61-.5.76-1.01.47l-2.8-2.06-1.35 1.3c-.15.15-.28.28-.56.28l.2-2.85 5.19-4.69c.23-.2-.05-.31-.35-.11l-6.41 4.04-2.76-.86c-.6-.19-.61-.6.13-.89z"/>
  </svg>
);

export const SmsLogo = ({ className = brandBox }) => (
  <img src="/sms-logo.png" alt="SMS" className={className.includes('object-') ? className : `${className} object-contain`} />
);

export const RedditLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FF4500"/>
    <path fill="#fff" d="M19 12a1.6 1.6 0 00-2.71-1.14 8.3 8.3 0 00-4.13-1.31l.7-3.3 2.3.49a1.14 1.14 0 102.13-.58L17 5.8a.36.36 0 00-.4-.2l-2.58.55a.36.36 0 00-.28.28l-.79 3.73a8.3 8.3 0 00-4.16 1.32A1.6 1.6 0 105 12.9a3.16 3.16 0 000 .55 3.5 3.5 0 00-.05.6c0 2.37 2.76 4.29 6.16 4.29s6.16-1.92 6.16-4.29a3.5 3.5 0 00-.05-.6A1.6 1.6 0 0019 12zm-9.83 1.31a1.02 1.02 0 111.02-1.02 1.02 1.02 0 01-1.02 1.02zm5.9 2.4a3.7 3.7 0 01-2.53.84 3.7 3.7 0 01-2.53-.84.32.32 0 01.44-.46 3.06 3.06 0 002.09.68 3.06 3.06 0 002.09-.68.32.32 0 11.44.46zm-.24-2.4a1.02 1.02 0 111.02-1.02 1.02 1.02 0 01-1.02 1.02z"/>
  </svg>
);

export const MailGenericLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="4.5" width="21" height="15" rx="3" fill="#64748B"/>
    <path d="M3 6.5l9 6.5 9-6.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const OutlookLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="10.5" y="2" width="11.5" height="20" rx="1.2" fill="#0364B8"/>
    <path fill="#0A2767" d="M10.5 12l11.5 5V4z" opacity=".35"/>
    <rect x="13" y="5" width="7" height="4" fill="#28A8EA"/>
    <rect x="13" y="10" width="7" height="4" fill="#0078D4"/>
    <rect x="13" y="15" width="7" height="4" fill="#0364B8"/>
    <rect x="1" y="6" width="13" height="12" rx="1.5" fill="#0F6CBD"/>
    <ellipse cx="7.5" cy="12" rx="4" ry="4.6" fill="#fff"/>
    <ellipse cx="7.5" cy="12" rx="2.5" ry="3" fill="#0F6CBD"/>
  </svg>
);

export const SnapchatLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#FFFC00"/>
    <path fill="#000" d="M12 4.3c1.9 0 3.4 1.6 3.4 3.9 0 .5 0 1.2-.1 1.8.5.2 1 .1 1.4-.1.3-.1.6 0 .7.3.1.3 0 .6-.3.8-.5.3-1.2.6-2 .7 0 .3.1.5.2.7.4.9 1.4 1.7 2.6 2 .3.1.4.4.3.6-.2.5-1 .8-2.1.9-.1.2-.1.5-.2.7-.1.2-.3.3-.6.3-.4 0-.9-.1-1.4-.1-.6 0-1 .2-1.5.5-.5.3-1 .6-1.7.6s-1.2-.3-1.7-.6c-.5-.3-.9-.5-1.5-.5-.5 0-1 .1-1.4.1-.3 0-.5-.1-.6-.3-.1-.2-.1-.5-.2-.7-1.1-.1-1.9-.4-2.1-.9-.1-.3 0-.5.3-.6 1.2-.4 2.2-1.1 2.6-2 .1-.2.1-.4.2-.7-.8-.1-1.5-.4-2-.7-.3-.2-.4-.5-.3-.8.1-.3.4-.4.7-.3.4.2.9.3 1.4.1-.1-.6-.1-1.3-.1-1.8 0-2.3 1.5-3.9 3.4-3.9z"/>
  </svg>
);

export const AmazonLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#131921"/>
    <path fill="#FF9900" d="M6.2 15.3c2.9 1.9 6.9 2.1 10.3.4.2-.1.4.1.2.3-1 1.1-3.3 2.3-6 2.3-2.8 0-5.3-1-7.2-2.7-.2-.1 0-.4.2-.3zm11-.5c-.1-.3-.9-.2-1.3-.1-.1 0-.1-.1 0-.2.6-.4 1.6-.3 1.7-.1.1.1 0 1.1-.6 1.6-.1.1-.2 0-.2-.1.1-.3.3-.9.4-1.1z"/>
    <path fill="#fff" d="M9.5 9.6c0-.5.1-.9.4-1.2.3-.3.7-.5 1.3-.5.5 0 1 .1 1.3.4.3.3.4.6.4 1.1v2.3c0 .2 0 .3.1.4l.1.2c0 .1-.1.1-.1.2l-.5.4h-.2l-.4-.5c-.1.1-.3.3-.5.4-.2.1-.4.1-.7.1-.5 0-.8-.1-1.1-.4-.3-.3-.4-.6-.4-1.1 0-.5.2-.9.5-1.2.4-.3.9-.4 1.6-.4h.5v-.3c0-.3-.1-.5-.2-.6-.1-.1-.3-.2-.6-.2-.2 0-.4 0-.6.1-.1.1-.2.2-.3.4 0 .1-.1.1-.2.1l-.7-.1c-.1 0-.1-.1-.1-.2zm2.2 1.6h-.3c-.4 0-.7.1-.9.2-.2.1-.3.3-.3.6 0 .2.1.4.2.5.1.1.3.2.5.2.3 0 .5-.1.6-.2.2-.2.2-.4.2-.7v-.6z"/>
  </svg>
);

export const GithubLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#181717"/>
    <path fill="#fff" d="M12 5.5c-3.6 0-6.5 2.9-6.5 6.5 0 2.9 1.9 5.3 4.5 6.2.3.1.4-.1.4-.3v-1.1c-1.8.4-2.2-.9-2.2-.9-.3-.8-.7-1-.7-1-.6-.4.1-.4.1-.4.7.1 1.1.7 1.1.7.6 1.1 1.6.8 2 .6.1-.5.2-.8.4-1-1.4-.2-2.9-.7-2.9-3.2 0-.7.3-1.3.7-1.7-.1-.2-.3-.8.1-1.7 0 0 .6-.2 1.9.7.6-.2 1.2-.2 1.8-.2s1.2.1 1.8.2c1.3-.9 1.9-.7 1.9-.7.4.9.2 1.5.1 1.7.4.5.7 1.1.7 1.7 0 2.5-1.5 3-2.9 3.2.3.2.5.7.5 1.4v2.1c0 .2.1.4.5.3 2.6-.9 4.5-3.3 4.5-6.2 0-3.6-2.9-6.5-6.5-6.5z"/>
  </svg>
);
