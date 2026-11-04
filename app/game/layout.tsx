import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Grand Prix Session',
  description:
    'Experience real-time 3D browser Formula racing in Open Race. Compete on world championship circuits against 19 AI opponents with live telemetry and arcade physics.',
  alternates: {
    canonical: '/game',
  },
  openGraph: {
    title: 'Live Grand Prix Session | Open Race',
    description:
      'High-speed 3D browser racing session with full grid AI, real-time physics, and live telemetry.',
  },
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
