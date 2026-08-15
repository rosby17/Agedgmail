import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Upload, Send, FileText } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AttachmentPreview = ({ type, url, filename }) => {
  if (type === 'image') {
    return (
      <div className="relative group max-w-full my-1 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
        <img
          src={url}
          alt={filename || "Image attachment"}
          className="max-w-full max-h-48 object-contain cursor-zoom-in hover:scale-[1.01] transition-transform duration-200"
          onClick={() => window.open(url, '_blank')}
        />
      </div>
    );
  }
  if (type === 'video') {
    return (
      <div className="my-1 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 bg-black">
        <video src={url} controls className="max-w-full max-h-48 object-contain w-full" />
      </div>
    );
  }
  if (type === 'audio') {
    return (
      <div className="my-1 py-1 rounded-xl bg-gray-50 dark:bg-slate-800/40 p-2 border border-gray-100 dark:border-slate-800">
        <audio src={url} controls className="w-full max-w-xs scale-95 origin-left" />
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 my-1 px-3 py-2 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-gray-800 dark:text-gray-200"
    >
      <FileText size={14} className="text-gray-400" />
      <span className="truncate max-w-[150px]">{filename || 'Télécharger le fichier'}</span>
    </a>
  );
};

const SupportChatWidget = ({ session, profile }) => {
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);

  const userId = session?.user?.id;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || uploading || !userId) return;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${randomId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      let type = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      let tk = ticket;
      if (!tk) {
        const { data: created, error } = await supabase.from('support_tickets').insert({
          user_id: userId, user_email: session.user.email, subject: 'Support', status: 'open',
          last_sender: 'user', admin_unread: true, user_unread: false, last_message_at: new Date().toISOString(),
        }).select().single();
        if (error) throw new Error(error.message);
        tk = created; setTicket(created);
      }

      const { error: msgErr } = await supabase.from('support_messages').insert({
        ticket_id: tk.id, user_id: userId, sender: 'user', body: file.name,
        attachment_url: publicUrl, attachment_type: type
      });
      if (msgErr) throw new Error(msgErr.message);

      await supabase.from('support_tickets').update({
        last_message_at: new Date().toISOString(), last_sender: 'user', admin_unread: true, status: 'open',
      }).eq('id', tk.id);

      supabase.functions.invoke('support-notify', {
        body: {
          body: `[Fichier joint] ${file.name}`,
          user_email: session.user.email,
          display_name: profile?.display_name
        }
      }).catch(console.error);

      await loadTicket();
    } catch(err) {
      await window.showAlert("Erreur", 'Erreur d\'upload : ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Charge le ticket existant + ses messages, et l'état "non lu".
  const loadTicket = async () => {
    if (!userId) return;
    const { data: tk } = await supabase.from('support_tickets')
      .select('*').eq('user_id', userId).order('last_message_at', { ascending: false }).limit(1).maybeSingle();
    if (tk) {
      setTicket(tk);
      setHasUnread(!!tk.user_unread);
      const { data: msgs } = await supabase.from('support_messages')
        .select('*').eq('ticket_id', tk.id).order('created_at', { ascending: true });
      setMessages(msgs || []);
    }
  };

  useEffect(() => { if (userId) loadTicket(); }, [userId]);

  // Abonnement temps réel aux nouveaux messages de ce client.
  useEffect(() => {
    if (!userId || !supabase) return;
    const channel = supabase.channel(`support-user-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${userId}` },
        (payload) => {
          setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
          if (payload.new.sender === 'admin' && !open) setHasUnread(true);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, open]);

  // Auto-scroll en bas à chaque nouveau message / ouverture.
  useEffect(() => { if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, open]);

  // À l'ouverture : marque comme lu côté client.
  const openPanel = async () => {
    setOpen(true);
    setHasUnread(false);
    if (ticket?.user_unread) {
      await supabase.from('support_tickets').update({ user_unread: false }).eq('id', ticket.id);
    }
  };

  useEffect(() => {
    const handleOpen = () => openPanel();
    window.addEventListener('open-support-chat', handleOpen);
    return () => window.removeEventListener('open-support-chat', handleOpen);
  }, [ticket]);

  const send = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    let tk = ticket;
    if (!tk) {
      const { data: created, error } = await supabase.from('support_tickets').insert({
        user_id: userId, user_email: session.user.email, subject: 'Support', status: 'open',
        last_sender: 'user', admin_unread: true, user_unread: false, last_message_at: new Date().toISOString(),
      }).select().single();
      if (error) { setSending(false); await window.showAlert("Erreur", 'Erreur : ' + error.message); return; }
      tk = created; setTicket(created);
    }
    const { error: msgErr } = await supabase.from('support_messages').insert({
      ticket_id: tk.id, user_id: userId, sender: 'user', body,
    });
    if (msgErr) { setSending(false); await window.showAlert("Erreur", 'Erreur : ' + msgErr.message); return; }
    await supabase.from('support_tickets').update({
      last_message_at: new Date().toISOString(), last_sender: 'user', admin_unread: true, status: 'open',
    }).eq('id', tk.id);

    supabase.functions.invoke('support-notify', {
      body: {
        body,
        user_email: session.user.email,
        display_name: profile?.display_name
      }
    }).catch(console.error);

    setInput('');
    setSending(false);
  };

  if (!session) return null;

  return (
    <>
      <button
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="fixed bottom-6 right-6 z-[250] w-14 h-14 rounded-full bg-primary text-white dark:text-gray-900 shadow-2xl shadow-primary/30 flex items-center justify-center hover:bg-primaryDark transition-all"
        aria-label="Support"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
        {!open && hasUnread && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[250] w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gray-900 text-white p-5 shrink-0">
            <h3 className="font-bold flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain rounded-md bg-white p-0.5" />
              Support AgedGmailYT
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">On te répond au plus vite. Explique ton souci ici.</p>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-8">Aucun message pour l'instant. Écris-nous ci-dessous !</p>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                {m.sender !== 'user' && (
                  <img src="/logo.png" alt="Support" className="w-7 h-7 rounded-full object-contain bg-white shrink-0 mt-auto border border-gray-200" />
                )}
                <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                    {m.sender === 'user' ? (profile?.display_name || session?.user?.email?.split('@')[0] || 'Vous') : 'Support'}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-primary text-white dark:text-gray-900 rounded-br-sm shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm'}`}>
                    {m.attachment_url && (
                      <AttachmentPreview type={m.attachment_type} url={m.attachment_url} filename={m.body} />
                    )}
                    {(!m.attachment_url || m.body !== 'Message Vocal') && <div>{m.body}</div>}
                    <div className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-white/60 dark:text-gray-900/60' : 'text-gray-400'}`}>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                {m.sender === 'user' && (
                  <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || session?.user?.email || 'U')}&background=000&color=fff`} alt="Vous" className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto border border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.zip,.doc,.docx,.xls,.xlsx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploading}
              className="w-10 h-10 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-40"
              title="Ajouter un fichier"
            >
              <Upload size={16} className={uploading ? 'animate-bounce' : ''} />
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              disabled={sending}
              placeholder="Écris ton message…"
              className="flex-grow px-4 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />

            <button onClick={send} disabled={sending || !input.trim()} className="w-10 h-10 shrink-0 rounded-full bg-primary text-white dark:text-gray-900 flex items-center justify-center hover:bg-primaryDark transition-all disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
