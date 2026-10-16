import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { ImageStudioModal } from './components/ImageStudioModal';
import { SettingsModal } from './components/SettingsModal';
import { VoicePlaybackBar } from './components/VoicePlaybackBar';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'memory'>('general');
  const [imageStudioOpen, setImageStudioOpen] = useState(false);
  const { sendMessage } = useChat();

  const handleOpenSettings = (tab: 'general' | 'memory' = 'general') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-hidden bg-slate-50 dark:bg-[#0c0f17] text-slate-900 dark:text-slate-100">
      {/* Sidebar (History, New chat, options) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={handleOpenSettings}
        onOpenImageStudio={() => setImageStudioOpen(true)}
      />

      {/* Main Conversation Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={handleOpenSettings}
          onOpenImageStudio={() => setImageStudioOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <ChatArea onOpenImageStudio={() => setImageStudioOpen(true)} />

          <ChatInput onOpenImageStudio={() => setImageStudioOpen(true)} />
        </main>

        <VoicePlaybackBar />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        initialTab={settingsTab}
        onClose={() => setSettingsOpen(false)}
      />

      <ImageStudioModal
        isOpen={imageStudioOpen}
        onClose={() => setImageStudioOpen(false)}
        onSendToChat={(text, img) => {
          sendMessage(text, img ? { data: img.data, mimeType: img.mimeType } : undefined);
          setImageStudioOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <MainLayout />
      </ChatProvider>
    </ThemeProvider>
  );
}
