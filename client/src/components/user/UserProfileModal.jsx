import React, { useState, useEffect } from 'react';
import { User, Users, Check, Flame, Trophy, ArrowRight, X, ShieldCheck, Sparkles, Plus, Eye, Palette, HardDrive } from 'lucide-react';
import { USER_AVATARS, getUsersList, getUserSettings } from '../../utils/userStorage';
import { getGamificationData } from '../../utils/gamification';
import UserStorageTab from './UserStorageTab';

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  canClose = true
}) {
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(USER_AVATARS[0]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'select'

  useEffect(() => {
    if (isOpen) {
      const list = getUsersList();
      setUsersList(list);
      if (currentUser?.username) {
        setUsernameInput(currentUser.username);
        setSelectedAvatar(currentUser.avatar || USER_AVATARS[0]);
      } else if (list.length > 0) {
        setActiveTab('select');
      } else {
        setActiveTab('login');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (!trimmed) return;

    onSelectUser({
      username: trimmed,
      avatar: selectedAvatar
    });
  };

  const handleSelectExisting = (user) => {
    onSelectUser(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div 
        className="w-full max-w-lg rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl overflow-hidden flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-inverse-primary to-secondary-container flex items-center justify-center text-2xl shadow-lg shadow-primary-container/20">
                {currentUser?.avatar || selectedAvatar || '👤'}
              </div>
              <div>
                <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface flex items-center gap-2">
                  <span>Hồ sơ người dùng</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary border border-secondary/30 font-bold uppercase">
                    Lưu trữ riêng
                  </span>
                </h2>
                <p className="text-xs text-outline mt-0.5">
                  Đăng nhập đúng tên để khôi phục toàn bộ cài đặt bạn đã bật & tiến độ học
                </p>
              </div>
            </div>

            {canClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1.5 mt-4 p-1 bg-surface-container-lowest/80 rounded-2xl border border-outline-variant/30 shadow-inner">
            {usersList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('select')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'select'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Tài khoản ({usersList.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setUsernameInput('');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đổi tên</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('storage')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'storage'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-secondary" />
              <span>Bộ nhớ & Sao lưu</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: Select existing user */}
          {activeTab === 'select' && usersList.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Chọn tài khoản của bạn:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {usersList.map((user) => {
                  const isCurrent = currentUser?.username === user.username;
                  const gData = getGamificationData(user.username);
                  const xp = gData?.xp?.totalXp || 0;
                  const streak = gData?.streak?.currentStreak || 1;

                  return (
                    <button
                      key={user.username}
                      type="button"
                      onClick={() => handleSelectExisting(user)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                        isCurrent
                          ? 'bg-secondary-container/20 border-secondary ring-1 ring-secondary/40 shadow-sm'
                          : 'bg-surface-container/60 border-outline-variant/30 hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                        {user.avatar || '👤'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-on-surface truncate">
                            {user.username}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 bg-secondary-container/20 text-secondary rounded text-[9px] font-bold">
                              Đang học
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-outline">
                          <span className="flex items-center gap-0.5 text-tertiary font-bold">
                            <Flame className="w-3 h-3 fill-tertiary" />
                            {streak}d
                          </span>
                          <span>•</span>
                          <span className="text-primary font-semibold">
                            {xp} XP
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-outline group-hover:text-secondary transition-colors" />
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-between items-center text-xs text-outline">
                <span>Bạn muốn dùng tên khác?</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setUsernameInput('');
                  }}
                  className="text-secondary hover:underline font-bold cursor-pointer"
                >
                  + Nhập tên người dùng mới
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Enter username */}
          {activeTab === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Tên người dùng của bạn:
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Ví dụ: Nico, Minh, Lan, Alex..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest/80 border border-outline-variant/40 rounded-2xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary transition-all font-medium"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-outline">
                  💡 Nhập đúng tên của bạn để hệ thống mở đúng kho dữ liệu và cài đặt bạn đã bật.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Chọn biểu tượng đại diện (Avatar):
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {USER_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`h-11 rounded-2xl flex items-center justify-center text-xl transition-all border cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-secondary-container/20 border-secondary scale-105 shadow-md ring-1 ring-secondary/50'
                          : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-high'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={!usernameInput.trim()}
                className="w-full py-3 rounded-full bg-gradient-to-r from-inverse-primary to-secondary-container text-on-primary font-headline font-bold text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xác nhận & Bắt đầu học</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: Storage & Backup */}
          {activeTab === 'storage' && (
            <UserStorageTab
              currentUser={currentUser}
              onDataRestored={() => window.location.reload()}
            />
          )}

          {/* Isolated Features Info Banner */}
          <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>Dữ liệu & Cài đặt được lưu riêng cho từng người dùng:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-outline">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-secondary" />
                <span>Trạng thái làm mờ kịch bản</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span>Màu giống danh từ Đức</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-tertiary" />
                <span>Chuỗi ngày học (Streak)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-tertiary-fixed" />
                <span>Tiến độ câu & Sổ từ vựng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
