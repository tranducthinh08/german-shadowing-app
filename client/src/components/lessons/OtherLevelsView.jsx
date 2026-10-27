import React from 'react';
import { Award, GraduationCap, ArrowRight } from 'lucide-react';

export default function OtherLevelsView({
  activeLevel,
  onSelectLesson,
  setActiveLevel,
  a2PreviewLessons = [],
  englishLessons = []
}) {
  if (activeLevel === 'A2') {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-secondary/15 via-surface-container-high to-surface-container border border-secondary/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-on-secondary">
              TRÌNH ĐỘ A2
            </span>
            <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface">
              Nicos Weg A2 – Giao tiếp nâng cao & Công sở
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Trình độ A2 giúp bạn làm chủ các thì quá khứ (Perfekt, Präteritum), mệnh đề phụ (weil, dass, wenn), so sánh tính từ và hội thoại thường nhật tại Đức. Dưới đây là các bài học mẫu bạn có thể trải nghiệm ngay:
          </p>
        </div>

        {/* A2 Sample Lessons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {a2PreviewLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson && onSelectLesson({ videoId: lesson.videoId, language: 'de' })}
              className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-secondary/40 transition-all cursor-pointer group shadow-xs hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/20">
                  🇩🇪 A2 Chuẩn
                </span>
                <span className="text-xs text-outline font-medium">{lesson.sentencesCount} câu</span>
              </div>
              <h3 className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                {lesson.title}
              </h3>
              <p className="text-xs text-outline leading-relaxed mb-3">
                {lesson.description}
              </p>
              <div className="flex items-center justify-between text-xs font-semibold text-secondary pt-2 border-t border-outline-variant/20">
                <span>{lesson.author}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Luyện tập ngay
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeLevel === 'B1') {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-surface-container-high to-surface-container border border-primary/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary">
              TRÌNH ĐỘ B1
            </span>
            <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface">
              Nicos Weg B1 & Deutsch im Job
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Trình độ B1 chuẩn bị cho bạn chứng chỉ Goethe-Zertifikat B1 hoặc telc Deutsch B1 để xin việc, học nghề (Ausbildung) và định cư tại Đức.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
          <Award className="w-10 h-10 text-primary mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-on-surface">Cấp độ B1 đang trong kế hoạch phát hành</h3>
          <p className="text-xs text-outline max-w-md mx-auto">
            Hãy hoàn thành thật tốt 76 tập cấp độ A1 để xây dựng nền tảng từ vựng và ngữ pháp vững chắc trước khi tiến lên B1 nhé!
          </p>
          <button
            type="button"
            onClick={() => setActiveLevel && setActiveLevel('A1')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-xs hover:scale-105 transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Chuyển về học Trình độ A1</span>
          </button>
        </div>
      </div>
    );
  }

  if (activeLevel === 'EN') {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-surface-container-high to-surface-container border border-primary/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary">
              ENGLISH DAILY
            </span>
            <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface">
              Luyện nói đuổi & Nghe chép Tiếng Anh thực tế
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Các bài học đàm thoại tiếng Anh bản xứ với ngữ điệu chuẩn Anh - Mỹ, phù hợp luyện shadowing và dictation hàng ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {englishLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson && onSelectLesson({ videoId: lesson.videoId, language: 'en' })}
              className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-xs hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20">
                  🇬🇧 English Daily
                </span>
                <span className="text-xs text-outline font-medium">{lesson.sentencesCount} câu</span>
              </div>
              <h3 className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                {lesson.title}
              </h3>
              <p className="text-xs text-outline leading-relaxed mb-3">
                {lesson.description}
              </p>
              <div className="flex items-center justify-between text-xs font-semibold text-primary pt-2 border-t border-outline-variant/20">
                <span>{lesson.author}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Luyện tập ngay
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
