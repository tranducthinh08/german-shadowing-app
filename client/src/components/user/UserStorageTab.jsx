import React, { useState, useEffect, useRef } from 'react';
import { HardDrive, Download, Upload, Trash2, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import {
  getStorageHealth,
  cleanupStorage,
  exportUserBackup,
  importUserBackup
} from '../../utils/storageMonitor';

export default function UserStorageTab({ currentUser, onDataRestored }) {
  const [health, setHealth] = useState(null);
  const [notice, setNotice] = useState(null);
  const fileInputRef = useRef(null);

  const refreshHealth = () => {
    const data = getStorageHealth(currentUser);
    setHealth(data);
  };

  useEffect(() => {
    refreshHealth();
  }, [currentUser]);

  const handleExport = () => {
    try {
      const jsonStr = exportUserBackup(currentUser);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `polyglot_backup_${currentUser?.username || 'user'}_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice({ type: 'success', message: 'Tải tệp sao lưu JSON thành công!' });
    } catch (e) {
      setNotice({ type: 'error', message: 'Không thể xuất tệp sao lưu: ' + e.message });
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const result = importUserBackup(currentUser, content);
        refreshHealth();
        setNotice({
          type: 'success',
          message: `Khôi phục thành công ${result.vocabCount} từ vựng và ${result.historyCount} bài học!`
        });
        if (onDataRestored) onDataRestored();
      } catch (err) {
        setNotice({ type: 'error', message: 'Lỗi khôi phục tệp: ' + err.message });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleCleanup = () => {
    const res = cleanupStorage(currentUser);
    refreshHealth();
    setNotice({
      type: 'success',
      message: res.cleanedKeys > 0
        ? `Đã dọn dẹp ${res.cleanedKeys} khóa thừa, giải phóng ${res.freedFormatted}!`
        : 'Bộ nhớ đang ở trạng thái tối ưu, không có khóa rác cần dọn dẹp!'
    });
  };

  if (!health) return null;

  return (
    <div className="space-y-4 text-on-surface">
      {/* Notice Message Banner */}
      {notice && (
        <div className={`p-3 rounded-2xl flex items-center justify-between text-xs font-semibold ${
          notice.type === 'success'
            ? 'bg-secondary/15 text-secondary border border-secondary/30'
            : 'bg-error/15 text-error border border-error/30'
        }`}>
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Storage Capacity Gauge */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-secondary" />
            <span>Dung lượng LocalStorage đã dùng</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            health.status === 'optimal'
              ? 'bg-secondary/15 text-secondary'
              : health.status === 'moderate'
              ? 'bg-tertiary/15 text-tertiary'
              : 'bg-error/15 text-error'
          }`}>
            {health.status === 'optimal' ? '🟢 Tối ưu' : health.status === 'moderate' ? '🟡 Trung bình' : '🔴 Cần dọn dẹp'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${Math.max(2, health.quotaPercent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-outline font-medium">
          <span>{health.totalFormatted} đã dùng ({health.quotaPercent}%)</span>
          <span>Hạn mức: 5.0 MB</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] text-outline block">Sổ từ vựng</span>
          <span className="font-bold text-on-surface">{health.breakdown.vocab.formatted}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] text-outline block">Lịch sử bài học</span>
          <span className="font-bold text-on-surface">{health.breakdown.history.formatted}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] text-outline block">Tiến độ câu đã hoàn thành</span>
          <span className="font-bold text-on-surface">{health.breakdown.completed.formatted}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] text-outline block">Thành tích & Gamification</span>
          <span className="font-bold text-on-surface">{health.breakdown.gamification.formatted}</span>
        </div>
      </div>

      {/* Action Buttons: Export, Import, Cleanup */}
      <div className="space-y-2 pt-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            title="Tải toàn bộ dữ liệu học tập về máy tính (JSON)"
          >
            <Download className="w-3.5 h-3.5 text-secondary" />
            <span>Sao lưu (Tải JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            title="Khôi phục dữ liệu từ tệp sao lưu JSON"
          >
            <Upload className="w-3.5 h-3.5 text-tertiary" />
            <span>Khôi phục (Nhập JSON)</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleCleanup}
          className="w-full py-2.5 px-3 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-error/40 text-xs font-semibold text-outline hover:text-error flex items-center justify-center gap-2 cursor-pointer transition-colors"
          title="Dọn dẹp các khóa cũ và bộ nhớ đệm thừa"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Dọn dẹp rác & Tối ưu bộ nhớ</span>
        </button>
      </div>
    </div>
  );
}
