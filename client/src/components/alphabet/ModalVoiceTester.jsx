import React from 'react';

export default function ModalVoiceTester({
  voiceFeedback,
  setVoiceFeedback
}) {
  if (!voiceFeedback) return null;

  return (
    <div className={`p-3.5 rounded-xl text-xs font-semibold mb-3 ${
      voiceFeedback.status === 'correct'
        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
        : voiceFeedback.status === 'listening'
          ? 'bg-primary/20 text-on-primary-container border border-primary/30'
          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
    }`}>
      <div>{voiceFeedback.message}</div>
      {voiceFeedback.status !== 'correct' && voiceFeedback.status !== 'listening' && (
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] text-outline font-normal">Trình duyệt khó nhận diện giọng nói?</span>
          <button
            type="button"
            onClick={() => setVoiceFeedback({
              status: 'correct',
              message: `Tuyệt vời! Bạn đã tự luyện đọc to chuẩn từ "${voiceFeedback.targetWord || ''}". Hãy duy trì luyện tập! 🎉`
            })}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold hover:bg-emerald-500/30 cursor-pointer"
          >
            ✓ Tôi đã tự đọc to chuẩn từ này
          </button>
        </div>
      )}
    </div>
  );
}
