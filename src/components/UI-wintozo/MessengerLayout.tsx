import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import EmptyState from './EmptyState';

export default function MessengerLayout() {
  const deviceMode = useAppStore((s) => s.deviceMode);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  if (deviceMode === 'phone') {
    return <PhoneLayout activeChatId={activeChatId} setActiveChatId={setActiveChatId} />;
  }

  return <DesktopLayout activeChatId={activeChatId} setActiveChatId={setActiveChatId} />;
}

interface LayoutProps {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

function DesktopLayout({ activeChatId, setActiveChatId }: LayoutProps) {
  return (
    <div className="fixed inset-0 flex" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <Sidebar
        activeChatId={activeChatId}
        onSelectChat={(id) => setActiveChatId(id)}
      />

      {/* Chat area */}
      {activeChatId ? (
        <ChatWindow chatId={activeChatId} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function PhoneLayout({ activeChatId, setActiveChatId }: LayoutProps) {
  const showChat = activeChatId !== null;

  return (
    <div className="fixed inset-0" style={{ background: 'var(--bg)' }}>
      <AnimatePresence mode="wait">
        {!showChat ? (
          <motion.div
            key="sidebar"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="h-full flex flex-col"
          >
            {/* Mobile header */}
            <div
              className="shrink-0 px-4 py-3 flex items-center justify-center border-b"
              style={{ background: 'var(--sidebar)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 60 60" fill="none">
                    <path d="M10 20C10 20 20 10 30 10C40 10 50 20 50 30C50 40 40 50 30 50C20 50 12 44 10 36" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M10 36L6 48L18 44" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="22" cy="30" r="3" fill="white" />
                    <circle cx="30" cy="30" r="3" fill="white" />
                    <circle cx="38" cy="30" r="3" fill="white" />
                  </svg>
                </div>
                <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                  Wintozo
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <Sidebar
                activeChatId={activeChatId}
                onSelectChat={(id) => setActiveChatId(id)}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="h-full"
          >
            <ChatWindow
              chatId={activeChatId}
              onBack={() => setActiveChatId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
