import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Baby, Droplets, Moon, Sun, Clock, CheckCircle2, ChevronDown, Mic, Play, Sparkles, ArrowRight, Loader2, MessageCircle, X, Send, Bot, Volume2 } from 'lucide-react';
import { subscribeEmail } from './lib/supabase';

// =====================================================
// 커스텀 훅: Intersection Observer (스크롤 애니메이션)
// =====================================================
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// =====================================================
// 성능 최적화: PaperFlower 메모이제이션
// =====================================================
const PaperFlower = memo(function PaperFlower({
  color,
  size,
  className,
  delay = 0
}: {
  color: string;
  size: number;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`absolute flex items-center justify-center pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        perspective: '1000px',
        contain: 'layout style paint',
      }}
    >
      {/* Outer petals */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`outer-${i}`}
          className="absolute origin-bottom animate-paper-bloom"
          style={{
            width: `${size * 0.25}px`,
            height: `${size * 0.45}px`,
            bottom: '50%',
            backgroundColor: color,
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(0,0,0,0.05) 51%, rgba(0,0,0,0) 100%)',
            borderRadius: '50% 50% 20% 20%',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.6)',
            '--petal-angle': `${i * 45}deg`,
            animationDelay: `${delay + i * 0.05}s`,
            opacity: 0,
            transformOrigin: 'bottom center',
            willChange: 'transform, opacity',
          } as React.CSSProperties}
        />
      ))}
      {/* Inner petals */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`inner-${i}`}
          className="absolute origin-bottom animate-paper-bloom"
          style={{
            width: `${size * 0.2}px`,
            height: `${size * 0.35}px`,
            bottom: '50%',
            backgroundColor: color,
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(0,0,0,0.08) 51%, rgba(0,0,0,0) 100%)',
            borderRadius: '50% 50% 20% 20%',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.8)',
            '--petal-angle': `${i * 60 + 22.5}deg`,
            animationDelay: `${delay + 0.3 + i * 0.05}s`,
            opacity: 0,
            transformOrigin: 'bottom center',
            willChange: 'transform, opacity',
          } as React.CSSProperties}
        />
      ))}
      {/* Core */}
      <div
        className="absolute rounded-full animate-paper-core"
        style={{
          width: `${size * 0.15}px`,
          height: `${size * 0.15}px`,
          backgroundColor: '#FFF9C4',
          backgroundImage: 'radial-gradient(circle at 30% 30%, #FFF, transparent)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), 0 2px 10px rgba(0,0,0,0.1)',
          animationDelay: `${delay + 0.6}s`,
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      />
    </div>
  );
});

// =====================================================
// 성능 최적화: 꽃 컨테이너 분리
// =====================================================
const FeedingFlowers = memo(function FeedingFlowers({ bloomKey }: { bloomKey: number }) {
  return (
    <div key={`feeding-${bloomKey}`}>
      <PaperFlower color="#FFB6B6" size={450} className="top-[-10%] left-[-5%] rotate-12" delay={0.1} />
      <PaperFlower color="#FFCACA" size={600} className="bottom-[-15%] right-[-5%] -rotate-12" delay={0.4} />
      <PaperFlower color="#FFA0A0" size={350} className="top-[35%] left-[75%] rotate-45" delay={0.7} />
      <PaperFlower color="#FFD6D6" size={250} className="top-[20%] left-[65%] -rotate-25" delay={1.0} />
      <PaperFlower color="#FF8E8E" size={300} className="bottom-[15%] left-[10%] rotate-30" delay={0.5} />
    </div>
  );
});

const DiaperFlowers = memo(function DiaperFlowers({ bloomKey }: { bloomKey: number }) {
  return (
    <div key={`diaper-${bloomKey}`}>
      <PaperFlower color="#A8F0EA" size={500} className="top-[-15%] right-[-5%] -rotate-12" delay={0.1} />
      <PaperFlower color="#C4F5F1" size={650} className="bottom-[-10%] left-[-10%] rotate-12" delay={0.4} />
      <PaperFlower color="#8CEAE2" size={400} className="top-[25%] left-[-5%] -rotate-30" delay={0.7} />
      <PaperFlower color="#D6F8F5" size={300} className="bottom-[25%] right-[5%] rotate-25" delay={0.5} />
      <PaperFlower color="#4ECDC4" size={250} className="top-[15%] left-[45%] rotate-45" delay={0.9} />
    </div>
  );
});

// =====================================================
// 성능 최적화: ChatWidget 분리 (상태 격리)
// =====================================================
const ChatWidget = memo(function ChatWidget({ isVisible }: { isVisible: boolean }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: '안녕하세요! 육아에 대해 궁금한 점이 있으시면 물어보세요.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: '좋은 질문이에요! 아기의 수유 간격은 보통 2-3시간이 적당해요. 아기가 배고픔 신호를 보일 때 먹이는 것이 가장 좋답니다.'
      }]);
    }, 1000);
  }, [chatInput]);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => {
      if (!prev) {
        setTimeout(() => {
          setIsRecording(false);
          setChatMessages(prevMsgs => [...prevMsgs,
            { role: 'user', text: '🎤 "수유 15분 했어요"' },
            { role: 'ai', text: '네, 수유 15분 기록했어요! 오늘 총 수유 시간은 45분이에요.' }
          ]);
        }, 2000);
      }
      return !prev;
    });
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {/* Chat Window */}
      {chatOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#C26D53] to-[#D48B71] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold">V.O.M AI 도우미</h3>
              <p className="text-white/70 text-xs">육아 질문에 답해드려요</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#C26D53] text-white rounded-tr-sm'
                    : 'bg-white text-gray-700 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="질문을 입력하세요..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C26D53]/30"
              />
              <button
                onClick={toggleRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#4A8B86] hover:bg-[#3A706C]'
                }`}
              >
                <Mic size={20} className="text-white" />
              </button>
              <button
                onClick={handleSendMessage}
                className="w-12 h-12 bg-[#C26D53] rounded-full flex items-center justify-center hover:bg-[#A85B43] transition-colors"
              >
                <Send size={20} className="text-white" />
              </button>
            </div>
            {isRecording && (
              <p className="text-center text-red-500 text-xs mt-2 animate-pulse">녹음 중... 탭해서 중지</p>
            )}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 ${
          chatOpen ? 'bg-gray-600' : 'bg-gradient-to-r from-[#C26D53] to-[#D48B71]'
        }`}
      >
        {chatOpen ? <X size={28} className="text-white" /> : <MessageCircle size={28} className="text-white" />}
      </button>
    </div>
  );
});

// =====================================================
// 인터랙티브 섹션 1: 직관적인 기록 (핸드폰 목업 + 카드 태깅)
// =====================================================
const Section1Interactive = memo(function Section1Interactive() {
  const { ref, isInView } = useInView(0.3);
  const [screenOn, setScreenOn] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTagDemo = () => {
    if (isTagging) return;
    setIsTagging(true);

    setTimeout(() => {
      setScreenOn(true);
    }, 600);

    setTimeout(() => {
      setIsTagging(false);
    }, 1500);
  };

  const handleScreenOff = () => {
    setScreenOn(false);
  };

  return (
    <section ref={ref} className="py-24 md:py-32 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20 relative overflow-hidden">
      <PaperFlower color="#FFB6B6" size={120} className="top-10 right-10 opacity-40" delay={0.2} />
      <PaperFlower color="#FFCACA" size={80} className="bottom-20 left-5 opacity-30" delay={0.5} />

      {/* 텍스트 영역 */}
      <div className={`flex-1 space-y-6 text-center md:text-left relative z-10 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0E6] text-[#C26D53] font-bold text-sm">
          <Sparkles size={16} /> 직관적인 기록
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          복잡한 앱 실행 없이,<br/><span className="text-crayon text-[#C26D53] text-5xl md:text-6xl font-normal block mt-2">태그 한 번으로 충분해요</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
          바쁜 육아 중에도 스마트폰에 카드를 갖다 대기만 하세요. 수유, 기저귀, 수면 등 필요한 기록 화면이 즉시 나타납니다.
        </p>
        <p className="text-sm text-[#C26D53] font-medium">
          → 카드를 클릭해서 체험해보세요!
        </p>
      </div>

      {/* 핸드폰 + 카드 영역 */}
      <div
        className={`flex-1 w-full max-w-md md:max-w-lg relative transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {/* 핸드폰 프레임 */}
          <div
            className="relative w-[180px] h-[360px] md:w-[220px] md:h-[440px] rounded-[30px] md:rounded-[40px] border-[2px] overflow-hidden flex flex-col shrink-0"
            style={{
              background: screenOn ? 'white' : '#111',
              borderColor: screenOn ? '#E0D8D0' : '#333',
              boxShadow: screenOn
                ? '0 20px 50px rgba(194,109,83,0.25)'
                : '0 20px 50px rgba(0,0,0,0.4)',
              transform: screenOn ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-5 md:h-6 flex justify-center z-40">
              <div
                className="w-20 md:w-24 h-4 md:h-5 rounded-b-xl md:rounded-b-2xl border-b border-x flex items-center justify-center gap-1"
                style={{
                  background: screenOn ? '#E0D8D0' : '#050505',
                  borderColor: screenOn ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                  transition: 'all 0.6s ease-out',
                }}
              >
                <div className="w-1 h-1 rounded-full bg-black/50"></div>
                <div className="w-6 h-1 rounded-full bg-black/50"></div>
              </div>
            </div>

            {/* OFF 화면 */}
            <div
              className="absolute inset-0 bg-black flex flex-col items-center justify-center"
              style={{
                opacity: screenOn ? 0 : 1,
                transition: 'opacity 0.6s ease-out',
              }}
            >
              <div className="text-white/20 text-3xl md:text-4xl font-light tracking-widest font-mono">{currentTime || '03:15'}</div>
              <div className="mt-4 w-8 h-0.5 bg-white/10 rounded-full"></div>
            </div>

            {/* ON 화면 - 수유 기록 UI */}
            <div
              className="absolute inset-0 bg-[#FFFDFB] flex flex-col font-warm"
              style={{
                opacity: screenOn ? 1 : 0,
                transition: 'opacity 0.6s ease-out',
              }}
            >
              {/* Status Bar */}
              <div className="h-8 w-full flex items-center justify-between px-4 pt-1 text-[8px] md:text-[10px] font-medium text-gray-800 z-40">
                <span>{currentTime}</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-2 rounded-sm border border-gray-800 relative">
                    <div className="absolute inset-0.5 bg-gray-800 rounded-[1px]"></div>
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="pt-1 pb-3 px-4 bg-gradient-to-b from-[#FFF0E6] to-[#FFFDFB]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#D48B71] font-medium text-[10px] flex items-center gap-1"><Moon size={10}/> 새벽 수유</span>
                  <div className="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center text-[#C26D53] font-bold shadow-sm text-[8px]">지안</div>
                </div>
                <h2 className="text-crayon text-[#C26D53] text-lg md:text-xl leading-tight">우리아이<br/>맘마 먹을 시간</h2>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 flex flex-col gap-2 overflow-hidden pb-2">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-[#F5E6E1]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#C26D53]">
                      <Droplets size={12} />
                    </div>
                    <div>
                      <h3 className="text-gray-800 font-bold text-[10px]">모유 수유</h3>
                      <p className="text-gray-400 text-[8px]">마지막: 3시간 전</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-[#FFF0E6] text-[#C26D53] font-bold text-[10px]">
                      왼쪽 15분
                    </button>
                    <button className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-400 font-bold text-[10px]">
                      오른쪽 --
                    </button>
                  </div>
                </div>

                {/* AI 버튼 */}
                <div className="bg-gradient-to-r from-[#C26D53] to-[#D48B71] rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Mic size={14} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-[10px]">음성으로 기록</h3>
                      <p className="text-white/70 text-[8px]">탭해서 말하세요</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Button */}
              <div className="p-3 bg-white border-t border-gray-100">
                <button
                  onClick={handleScreenOff}
                  className="w-full py-2 bg-[#C26D53] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={12} /> 저장하기
                </button>
              </div>

              {/* Home Indicator */}
              <div className="h-4 flex justify-center items-center">
                <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* 폴라로이드 카드 */}
          <div
            onClick={handleTagDemo}
            className={`w-24 h-32 md:w-28 md:h-36 bg-white rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-gray-200 flex flex-col p-2 cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isTagging
                ? '-translate-x-[60px] md:-translate-x-[80px] rotate-[-5deg] scale-105'
                : 'hover:scale-105 hover:-translate-y-1 hover:rotate-[-5deg] rotate-[8deg]'}
            `}
            style={{
              zIndex: isTagging ? 50 : 10,
            }}
          >
            <div className="w-full aspect-square bg-gray-100 mb-1.5 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80"
                alt="Feeding"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-crayon text-gray-800 text-lg md:text-xl tracking-widest">수유</span>
            </div>
          </div>
        </div>

        {/* 안내 텍스트 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {screenOn ? '저장하기를 눌러 화면을 끄세요' : '카드를 클릭하면 화면이 켜져요'}
        </p>
      </div>
    </section>
  );
});

// =====================================================
// 인터랙티브 섹션 2: 음성 인식
// =====================================================
const Section2Interactive = memo(function Section2Interactive() {
  const { ref, isInView } = useInView(0.3);
  const [isRecording, setIsRecording] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleMicClick = () => {
    if (isRecording) return;
    setIsRecording(true);
    setShowResponse(false);
    setTimeout(() => {
      setIsRecording(false);
      setShowResponse(true);
    }, 2000);
  };

  return (
    <section ref={ref} className="py-24 md:py-32 px-6 max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20 relative overflow-hidden">
      <PaperFlower color="#A8F0EA" size={100} className="top-16 left-10 opacity-40" delay={0.3} />
      <PaperFlower color="#C4F5F1" size={70} className="bottom-10 right-20 opacity-30" delay={0.6} />

      <div className={`flex-1 space-y-6 text-center md:text-left relative z-10 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F4F1] text-[#4A8B86] font-bold text-sm">
          <Mic size={16} /> 음성 인식 & 실시간 동기화
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          "15분 먹였어"<br/>"네, 수유 15분 기록할게요"<br/><span className="text-crayon text-[#4A8B86] text-5xl md:text-6xl font-normal block mt-2">말하면 바로 기록되는 마법</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
          손이 바쁠 땐 그냥 말하세요. 기록은 클라우드에 자동 저장되고, 가족 모두가 실시간으로 아기 상태를 함께 확인할 수 있어요.
        </p>
      </div>

      <div
        className={`flex-1 w-full max-w-md md:max-w-none aspect-square bg-gradient-to-br from-[#E6F4F1] to-[#D1EBE6] rounded-[3rem] p-8 relative shadow-inner transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
          <div className="w-64 bg-white rounded-full shadow-xl flex items-center px-6 gap-4 relative z-10 h-20">
            <button
              onClick={handleMicClick}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-[#4A8B86] hover:bg-[#3A706C] hover:scale-105'}`}
            >
              <Mic size={28} />
            </button>
            <div className="flex-1">
              {isRecording ? (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 bg-[#4A8B86] rounded-full animate-pulse" style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">듣고 있어요...</span>
                </div>
              ) : showResponse ? (
                <p className="text-sm text-[#4A8B86] font-medium">"수유 15분 기록했어요!"</p>
              ) : (
                <p className="text-sm text-gray-400">탭해서 말하세요</p>
              )}
            </div>
          </div>
          {showResponse && (
            <div className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 size={20} />
                <span className="font-medium">기록 완료!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

// =====================================================
// 인터랙티브 섹션 3: 숏폼 강의
// =====================================================
const Section3Interactive = memo(function Section3Interactive() {
  const { ref, isInView } = useInView(0.3);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const videos = [
    { title: '올바른 수유 자세', duration: '3분' },
    { title: '트림시키는 방법', duration: '2분' },
    { title: '기저귀 가는 법', duration: '2분' },
  ];

  const handleVideoClick = (index: number) => {
    setPlayingVideo(index);
    setTimeout(() => setPlayingVideo(null), 3000);
  };

  return (
    <section ref={ref} className="py-24 md:py-32 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20 relative overflow-hidden">
      <PaperFlower color="#D8B4FE" size={110} className="top-12 right-16 opacity-40" delay={0.4} />
      <PaperFlower color="#E9D5FF" size={75} className="bottom-16 left-10 opacity-30" delay={0.7} />

      <div className={`flex-1 space-y-6 text-center md:text-left relative z-10 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3E8FF] text-[#8B5CF6] font-bold text-sm">
          <Play size={16} /> 숏폼 육아 강의
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          "트림은 어떻게 시키지?"<br/><span className="text-crayon text-[#8B5CF6] text-5xl md:text-6xl font-normal block mt-2">영상으로 바로 배워요</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
          육아가 처음이어도 괜찮아요. 수유법, 기저귀 교체, 목욕법까지 짧은 영상으로 쉽게 배울 수 있어요.
        </p>
      </div>

      <div
        className={`flex-1 w-full max-w-md md:max-w-none aspect-square bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] rounded-[3rem] p-6 relative shadow-inner transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-3">
            {videos.map((video, i) => (
              <div
                key={i}
                onClick={() => handleVideoClick(i)}
                className={`w-28 h-40 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 ${playingVideo === i ? 'scale-110 ring-4 ring-[#8B5CF6]' : ''}`}
                style={{ transform: `rotate(${(i - 1) * 8}deg)`, transitionDelay: `${i * 100}ms` }}
              >
                <div className={`h-24 flex items-center justify-center transition-colors duration-300 ${playingVideo === i ? 'bg-[#8B5CF6]' : 'bg-gradient-to-b from-[#E9D5FF] to-[#F3E8FF]'}`}>
                  {playingVideo === i ? (
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${16 + j * 8}px`, animationDelay: `${j * 0.15}s` }} />
                      ))}
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                      <Play size={18} className="text-[#8B5CF6] ml-0.5" fill="#8B5CF6" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-gray-800 font-medium leading-tight">{video.title}</p>
                  <p className="text-[10px] text-gray-400">{video.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

// =====================================================
// 인터랙티브 섹션 4: AI 챗봇
// =====================================================
const Section4Interactive = memo(function Section4Interactive() {
  const { ref, isInView } = useInView(0.3);
  const [messages, setMessages] = useState([
    { role: 'ai', text: '안녕하세요! 무엇을 도와드릴까요?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickQuestions = ['밤에 자주 깨요', '수유량이 적어요', '이유식 시작 시기'];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '4개월 아기는 수면 퇴행기일 수 있어요. 규칙적인 수면 루틴과 편안한 환경을 만들어주세요.'
      }]);
    }, 1000);
  };

  return (
    <section ref={ref} className="py-24 md:py-32 px-6 max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20 relative overflow-hidden">
      <PaperFlower color="#93C5FD" size={100} className="top-16 left-10 opacity-40" delay={0.3} />
      <PaperFlower color="#BFDBFE" size={70} className="bottom-10 right-20 opacity-30" delay={0.6} />

      <div className={`flex-1 space-y-6 text-center md:text-left relative z-10 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] text-[#3B82F6] font-bold text-sm">
          <Bot size={16} /> AI 육아 도우미
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          "밤에 자주 깨요"<br/><span className="text-crayon text-[#3B82F6] text-5xl md:text-6xl font-normal block mt-2">AI가 맞춤 답변을 드려요</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
          육아 고민이 생길 때마다 검색할 필요 없어요. AI 챗봇이 24시간 상담해드리고, 음성으로 편하게 기록할 수 있어요.
        </p>
      </div>

      <div
        className={`flex-1 w-full max-w-md md:max-w-none aspect-square bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-[3rem] p-6 relative shadow-inner transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="absolute inset-4 md:inset-8 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[#3B82F6] p-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">V.O.M AI</p>
              <p className="text-white/70 text-[10px]">온라인</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] p-2 rounded-xl text-xs ${msg.role === 'user' ? 'bg-[#3B82F6] text-white' : 'bg-white text-gray-700 shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          <div className="p-2 border-t border-gray-100 flex gap-1 overflow-x-auto">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-2 py-1 bg-gray-100 rounded-full text-[10px] text-gray-600 whitespace-nowrap hover:bg-[#3B82F6] hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
              placeholder="질문하세요..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-xs focus:outline-none"
            />
            <button
              onClick={() => handleSend(inputValue)}
              className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center hover:bg-[#2563EB] transition-colors"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

// =====================================================
// 메인 App 컴포넌트
// =====================================================
export default function App() {
  const [screenMode, setScreenMode] = useState<'off' | 'feeding' | 'diaper'>('off');
  const [taggingCard, setTaggingCard] = useState<'feeding' | 'diaper' | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [bloomKeyFeeding, setBloomKeyFeeding] = useState(0);
  const [bloomKeyDiaper, setBloomKeyDiaper] = useState(0);
  const [activeTab, setActiveTab] = useState<'timeline' | 'lecture' | 'growth'>('timeline');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTag = useCallback((type: 'feeding' | 'diaper') => {
    if (taggingCard) return;

    setTaggingCard(type);

    if (type === 'feeding') setBloomKeyFeeding(prev => prev + 1);
    if (type === 'diaper') setBloomKeyDiaper(prev => prev + 1);

    setTimeout(() => {
      setScreenMode(type);
    }, 800);

    setTimeout(() => {
      setTaggingCard(null);
    }, 2000);
  }, [taggingCard]);

  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setError('');

    const result = await subscribeEmail(email);

    setIsLoading(false);

    if (result.success) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    } else {
      setError(result.error || '오류가 발생했습니다.');
      setTimeout(() => setError(''), 3000);
    }
  }, [email, isLoading]);

  const scrollToLanding = useCallback(() => {
    landingRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const isLightMode = screenMode !== 'off';

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* 성능 최적화: 배경색 전환을 오버레이로 처리 */}
      <div
        className="absolute inset-0 bg-[#FFFDF5] pointer-events-none"
        style={{
          opacity: isLightMode ? 1 : 0,
          transition: 'opacity 1.5s ease-out',
          willChange: 'opacity',
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* GNB */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between"
        style={{
          opacity: isLightMode ? 1 : 0,
          transform: isLightMode ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'opacity 1s ease-out, transform 1s ease-out',
        }}
      >
        <div className="text-xl font-bold text-gray-800">V.O.M</div>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200">
          문의하기
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-6 md:py-0">

        {/* 성능 최적화: 조건부 렌더링으로 꽃 마운트/언마운트 */}
        {screenMode === 'feeding' && (
          <div className="absolute inset-0 pointer-events-none animate-fade-in">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(255, 142, 142, 0.08) 0%, transparent 70%)' }} />
            <FeedingFlowers bloomKey={bloomKeyFeeding} />
          </div>
        )}

        {screenMode === 'diaper' && (
          <div className="absolute inset-0 pointer-events-none animate-fade-in">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(126, 232, 225, 0.08) 0%, transparent 70%)' }} />
            <DiaperFlowers bloomKey={bloomKeyDiaper} />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-4 py-10 gap-8 md:gap-16">

          {/* Left side - Phone & Cards */}
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12">

            {/* Smartphone Frame */}
            <div
              className="relative w-[280px] h-[560px] md:w-[320px] md:h-[640px] rounded-[45px] md:rounded-[50px] border-[2px] overflow-hidden flex flex-col shrink-0"
              style={{
                background: isLightMode ? 'white' : '#111',
                borderColor: isLightMode ? '#E0D8D0' : '#333',
                boxShadow: isLightMode
                  ? '0 30px 60px rgba(0,0,0,0.15)'
                  : '0 30px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05)',
                transform: isLightMode ? 'scale(1)' : 'scale(0.95)',
                transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                willChange: 'transform, box-shadow',
              }}
            >

              {/* Phone Edge Highlight */}
              <div
                className="absolute inset-0 rounded-[45px] md:rounded-[50px] border-[1px] pointer-events-none z-50"
                style={{ borderColor: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' }}
              />

              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 md:h-7 flex justify-center z-40">
                <div
                  className="w-28 md:w-32 h-5 md:h-6 rounded-b-2xl md:rounded-b-3xl border-b border-x flex items-center justify-center gap-2"
                  style={{
                    background: isLightMode ? '#E0D8D0' : '#050505',
                    borderColor: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    transition: 'all 1s ease-out',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-black/50"></div>
                  <div className="w-8 h-1.5 rounded-full bg-black/50"></div>
                </div>
              </div>

              {/* Screen Content */}
              <div className="flex-1 relative overflow-hidden flex flex-col font-warm">

                {/* OFF Screen */}
                <div
                  className="absolute inset-0 bg-black flex flex-col items-center justify-center"
                  style={{
                    opacity: screenMode === 'off' ? 1 : 0,
                    pointerEvents: screenMode === 'off' ? 'auto' : 'none',
                    transition: 'opacity 1s ease-out',
                  }}
                >
                  <div className="text-white/20 text-5xl md:text-6xl font-light tracking-widest font-mono">{currentTime || '03:15'}</div>
                  <div className="mt-6 md:mt-8 w-10 md:w-12 h-1 bg-white/10 rounded-full"></div>
                </div>

                {/* FEEDING Screen */}
                <div
                  className="absolute inset-0 bg-[#FFFDFB] flex flex-col"
                  style={{
                    opacity: screenMode === 'feeding' ? 1 : 0,
                    pointerEvents: screenMode === 'feeding' ? 'auto' : 'none',
                    transition: 'opacity 1s ease-out',
                  }}
                >
                  {/* Status Bar */}
                  <div className="h-10 w-full flex items-center justify-between px-5 pt-1 text-[10px] md:text-xs font-medium text-gray-800 z-40 bg-transparent">
                    <span>{currentTime}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-3 rounded-sm border border-gray-800 relative">
                        <div className="absolute inset-0.5 bg-gray-800 rounded-[1px]"></div>
                        <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-0.5 h-1 bg-gray-800 rounded-r-sm"></div>
                      </div>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="pt-2 md:pt-4 pb-4 md:pb-6 px-5 md:px-6 bg-gradient-to-b from-[#FFF0E6] to-[#FFFDFB] shrink-0">
                    <div className="flex justify-between items-center mb-2 md:mb-4">
                      <span className="text-[#D48B71] font-medium text-xs md:text-sm flex items-center gap-1"><Moon size={14}/> 새벽 수유</span>
                      <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#C26D53] font-bold shadow-sm text-xs">지안</div>
                    </div>
                    <h2 className="text-crayon text-[#C26D53] text-2xl md:text-3xl leading-tight">우리아이<br/>맘마 먹을 시간이에요</h2>
                    <p className="text-[10px] md:text-xs text-[#D48B71] mt-2">생후 142일 • 4개월 20일</p>
                  </div>

                  {/* Content - Timeline Tab */}
                  <div className={`flex-1 px-5 md:px-6 flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 ${activeTab === 'timeline' ? 'block' : 'hidden'}`}>
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-[0_8px_30px_rgba(194,109,83,0.08)] border border-[#F5E6E1] shrink-0">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#C26D53]">
                          <Droplets size={18} />
                        </div>
                        <div>
                          <h3 className="text-gray-800 font-bold text-sm md:text-base">모유 수유 기록</h3>
                          <p className="text-gray-400 text-[10px] md:text-xs">마지막 수유: 3시간 전</p>
                        </div>
                      </div>
                      <div className="flex gap-2 md:gap-3">
                        <button className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FFF0E6] text-[#C26D53] font-bold border border-[#F5E6E1] hover:bg-[#FFE4D6] transition-colors flex flex-col items-center gap-1">
                          <span className="text-xs md:text-sm">왼쪽</span>
                          <span className="text-xl md:text-2xl font-mono font-light">15<span className="text-xs md:text-sm">분</span></span>
                        </button>
                        <button className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 text-gray-400 font-bold border border-gray-100 hover:bg-gray-100 transition-colors flex flex-col items-center gap-1">
                          <span className="text-xs md:text-sm">오른쪽</span>
                          <span className="text-xl md:text-2xl font-mono font-light">--</span>
                        </button>
                      </div>
                    </div>

                    {/* AI 음성 기록 버튼 */}
                    <div className="bg-gradient-to-r from-[#C26D53] to-[#D48B71] rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-[0_8px_30px_rgba(194,109,83,0.2)] shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                          <Mic size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-sm md:text-base">음성으로 기록하기</h3>
                          <p className="text-white/70 text-[10px] md:text-xs">탭해서 말하세요</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Bot size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content - Lecture Tab */}
                  <div className={`flex-1 px-5 md:px-6 flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 ${activeTab === 'lecture' ? 'block' : 'hidden'}`}>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {[
                        { title: '올바른 수유 자세', duration: '3분', color: '#FFE4D6' },
                        { title: '트림시키는 방법', duration: '2분', color: '#FFF0E6' },
                        { title: '기저귀 가는 법', duration: '2분', color: '#FFE4D6' },
                        { title: '아기 목욕시키기', duration: '4분', color: '#FFF0E6' },
                      ].map((video, i) => (
                        <div key={i} className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] cursor-pointer">
                          <div className="aspect-[9/12] relative" style={{ backgroundColor: video.color }}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                <Play size={20} className="text-[#C26D53] ml-1" fill="#C26D53" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-white text-[10px]">{video.duration}</div>
                          </div>
                          <div className="p-2 md:p-3">
                            <p className="text-gray-800 font-medium text-xs md:text-sm leading-tight">{video.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content - Growth Tab */}
                  <div className={`flex-1 px-5 md:px-6 flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 ${activeTab === 'growth' ? 'block' : 'hidden'}`}>
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-[0_8px_30px_rgba(194,109,83,0.08)] border border-[#F5E6E1]">
                      <h3 className="text-gray-800 font-bold text-sm md:text-base mb-4">성장 기록</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs md:text-sm">키</span>
                          <span className="text-[#C26D53] font-bold">62.5cm</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs md:text-sm">몸무게</span>
                          <span className="text-[#C26D53] font-bold">6.8kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs md:text-sm">머리둘레</span>
                          <span className="text-[#C26D53] font-bold">41cm</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
                      <h3 className="text-gray-800 font-bold text-sm md:text-base mb-3">이번 달 마일스톤</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span className="text-gray-600">목 가누기 완료</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span className="text-gray-600">옹알이 시작</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          <span className="text-gray-400">뒤집기</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="mt-auto shrink-0 bg-white border-t border-gray-100 rounded-b-[45px] md:rounded-b-[50px] overflow-hidden">
                    <div className="p-4 md:p-5">
                      <button onClick={() => setScreenMode('off')} className="w-full py-3 md:py-4 bg-[#C26D53] text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-[0_10px_20px_rgba(194,109,83,0.3)] hover:bg-[#A85B43] transition-all flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} /> 기록 저장하기
                      </button>
                    </div>
                    <div className="h-16 bg-gray-50 flex items-center justify-around px-4 pb-2">
                      <div onClick={() => setActiveTab('timeline')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 hover:scale-110 ${activeTab === 'timeline' ? 'text-[#C26D53] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Clock className="w-5 h-5" />
                        <span className={`text-[10px] ${activeTab === 'timeline' ? 'font-semibold' : 'font-medium'}`}>타임라인</span>
                      </div>
                      <div onClick={() => setActiveTab('lecture')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 hover:scale-110 ${activeTab === 'lecture' ? 'text-[#C26D53] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Play className="w-5 h-5" />
                        <span className={`text-[10px] ${activeTab === 'lecture' ? 'font-semibold' : 'font-medium'}`}>강의</span>
                      </div>
                      <div onClick={() => setActiveTab('growth')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 hover:scale-110 ${activeTab === 'growth' ? 'text-[#C26D53] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Sparkles className="w-5 h-5" />
                        <span className={`text-[10px] ${activeTab === 'growth' ? 'font-semibold' : 'font-medium'}`}>성장</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 inset-x-0 flex justify-center z-50">
                      <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* DIAPER Screen */}
                <div
                  className="absolute inset-0 bg-[#FAFDFF] flex flex-col"
                  style={{
                    opacity: screenMode === 'diaper' ? 1 : 0,
                    pointerEvents: screenMode === 'diaper' ? 'auto' : 'none',
                    transition: 'opacity 1s ease-out',
                  }}
                >
                  {/* Status Bar */}
                  <div className="h-10 w-full flex items-center justify-between px-5 pt-1 text-[10px] md:text-xs font-medium text-gray-800 z-40 bg-transparent">
                    <span>{currentTime}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-3 rounded-sm border border-gray-800 relative">
                        <div className="absolute inset-0.5 bg-gray-800 rounded-[1px]"></div>
                        <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-0.5 h-1 bg-gray-800 rounded-r-sm"></div>
                      </div>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="pt-2 md:pt-4 pb-4 md:pb-6 px-5 md:px-6 bg-gradient-to-b from-[#E6F4F1] to-[#FAFDFF] shrink-0">
                    <div className="flex justify-between items-center mb-2 md:mb-4">
                      <span className="text-[#5B9E99] font-medium text-xs md:text-sm flex items-center gap-1"><Sun size={14}/> 아침 기저귀</span>
                      <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#4A8B86] font-bold shadow-sm text-xs">지안</div>
                    </div>
                    <h2 className="text-crayon text-[#4A8B86] text-2xl md:text-3xl leading-tight">뽀송뽀송하게<br/>갈아줄게요</h2>
                    <p className="text-[10px] md:text-xs text-[#5B9E99] mt-2">생후 142일 • 4개월 20일</p>
                  </div>

                  {/* Content - Timeline Tab */}
                  <div className={`flex-1 px-5 md:px-6 flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 ${activeTab === 'timeline' ? 'block' : 'hidden'}`}>
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-[0_8px_30px_rgba(74,139,134,0.08)] border border-[#E6F4F1] shrink-0">
                      <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E6F4F1] flex items-center justify-center text-[#4A8B86]">
                          <Baby size={18} />
                        </div>
                        <div>
                          <h3 className="text-gray-800 font-bold text-sm md:text-base">기저귀 상태</h3>
                          <p className="text-gray-400 text-[10px] md:text-xs">마지막 교체: 2시간 전</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <button className="py-4 md:py-6 rounded-xl md:rounded-2xl bg-[#E6F4F1] text-[#4A8B86] font-bold border border-[#D1EBE6] hover:bg-[#D1EBE6] transition-colors flex flex-col items-center gap-1 md:gap-2">
                          <span className="text-2xl md:text-3xl">💧</span>
                          <span className="text-xs md:text-sm">소변</span>
                        </button>
                        <button className="py-4 md:py-6 rounded-xl md:rounded-2xl bg-gray-50 text-gray-400 font-bold border border-gray-100 hover:bg-gray-100 transition-colors flex flex-col items-center gap-1 md:gap-2">
                          <span className="text-2xl md:text-3xl opacity-50">💩</span>
                          <span className="text-xs md:text-sm">대변</span>
                        </button>
                      </div>
                    </div>

                    {/* AI 음성 기록 버튼 */}
                    <div className="bg-gradient-to-r from-[#4A8B86] to-[#5B9E99] rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-[0_8px_30px_rgba(74,139,134,0.2)] shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                          <Mic size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-sm md:text-base">음성으로 기록하기</h3>
                          <p className="text-white/70 text-[10px] md:text-xs">탭해서 말하세요</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Bot size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content - Lecture Tab */}
                  <div className={`flex-1 px-5 md:px-6 flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 ${activeTab === 'lecture' ? 'block' : 'hidden'}`}>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {[
                        { title: '올바른 수유 자세', duration: '3분', color: '#D1EBE6' },
                        { title: '트림시키는 방법', duration: '2분', color: '#E6F4F1' },
                        { title: '기저귀 가는 법', duration: '2분', color: '#D1EBE6' },
                        { title: '아기 목욕시키기', duration: '4분', color: '#E6F4F1' },
                      ].map((video, i) => (
                        <div key={i} className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] cursor-pointer">
                          <div className="aspect-[9/12] relative" style={{ backgroundColor: video.color }}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                <Play size={20} className="text-[#4A8B86] ml-1" fill="#4A8B86" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-white text-[10px]">{video.duration}</div>
                          </div>
                          <div className="p-2 md:p-3">
                            <p className="text-gray-800 font-medium text-xs md:text-sm leading-tight">{video.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content - Growth Tab */}
                  <div className={`flex-1 px-5 md:px-6 flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 ${activeTab === 'growth' ? 'block' : 'hidden'}`}>
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-[0_8px_30px_rgba(74,139,134,0.08)] border border-[#E6F4F1]">
                      <h3 className="text-gray-800 font-bold text-sm md:text-base mb-4">성장 기록</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs md:text-sm">키</span>
                          <span className="text-[#4A8B86] font-bold">62.5cm</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs md:text-sm">몸무게</span>
                          <span className="text-[#4A8B86] font-bold">6.8kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs md:text-sm">머리둘레</span>
                          <span className="text-[#4A8B86] font-bold">41cm</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
                      <h3 className="text-gray-800 font-bold text-sm md:text-base mb-3">이번 달 마일스톤</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span className="text-gray-600">목 가누기 완료</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span className="text-gray-600">옹알이 시작</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          <span className="text-gray-400">뒤집기</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="mt-auto shrink-0 bg-white border-t border-gray-100 rounded-b-[45px] md:rounded-b-[50px] overflow-hidden">
                    <div className="p-4 md:p-5">
                      <button onClick={() => setScreenMode('off')} className="w-full py-3 md:py-4 bg-[#4A8B86] text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-[0_10px_20px_rgba(74,139,134,0.3)] hover:bg-[#3A706C] transition-all flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} /> 기록 저장하기
                      </button>
                    </div>
                    <div className="h-16 bg-gray-50 flex items-center justify-around px-4 pb-2">
                      <div onClick={() => setActiveTab('timeline')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 hover:scale-110 ${activeTab === 'timeline' ? 'text-[#4A8B86] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Clock className="w-5 h-5" />
                        <span className={`text-[10px] ${activeTab === 'timeline' ? 'font-semibold' : 'font-medium'}`}>타임라인</span>
                      </div>
                      <div onClick={() => setActiveTab('lecture')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 hover:scale-110 ${activeTab === 'lecture' ? 'text-[#4A8B86] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Play className="w-5 h-5" />
                        <span className={`text-[10px] ${activeTab === 'lecture' ? 'font-semibold' : 'font-medium'}`}>강의</span>
                      </div>
                      <div onClick={() => setActiveTab('growth')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 hover:scale-110 ${activeTab === 'growth' ? 'text-[#4A8B86] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Sparkles className="w-5 h-5" />
                        <span className={`text-[10px] ${activeTab === 'growth' ? 'font-semibold' : 'font-medium'}`}>성장</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 inset-x-0 flex justify-center z-50">
                      <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Screen Glare */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30"></div>
              </div>
            </div>

            {/* Polaroid NFC Cards */}
            <div className="flex flex-row md:flex-col gap-6 md:gap-8 z-50">
              {/* Feeding Card */}
              <div
                onClick={() => handleTag('feeding')}
                className={`pointer-events-auto w-28 h-36 md:w-36 md:h-44 bg-white rounded-sm shadow-[0_15px_35px_rgba(0,0,0,0.2)] border border-gray-200 flex flex-col p-2 md:p-3 relative cursor-pointer transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${taggingCard === 'feeding'
                    ? '-translate-x-[100px] md:-translate-x-[180px] -translate-y-[150px] md:-translate-y-[50px] rotate-[-5deg] scale-110 shadow-2xl z-50'
                    : 'hover:scale-105 hover:-translate-y-2 hover:rotate-[-8deg] rotate-[-12deg] z-40'}
                `}
              >
                <div className="absolute inset-0 bg-black pointer-events-none z-10" style={{ opacity: isLightMode ? 0 : 0.3, transition: 'opacity 1s' }}></div>
                <div className="w-full aspect-square bg-gray-100 mb-2 overflow-hidden relative z-0">
                  <img src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80" alt="Feeding" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 flex items-center justify-center relative z-0">
                  <span className="text-crayon text-gray-800 text-xl md:text-2xl tracking-widest">수유</span>
                </div>
              </div>

              {/* Diaper Card */}
              <div
                onClick={() => handleTag('diaper')}
                className={`pointer-events-auto w-28 h-36 md:w-36 md:h-44 bg-white rounded-sm shadow-[0_15px_35px_rgba(0,0,0,0.2)] border border-gray-200 flex flex-col p-2 md:p-3 relative cursor-pointer transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${taggingCard === 'diaper'
                    ? '-translate-x-[200px] md:-translate-x-[180px] -translate-y-[150px] md:-translate-y-[220px] rotate-[5deg] scale-110 shadow-2xl z-50'
                    : 'hover:scale-105 hover:-translate-y-2 hover:rotate-[12deg] rotate-[8deg] z-40'}
                `}
              >
                <div className="absolute inset-0 bg-black pointer-events-none z-10" style={{ opacity: isLightMode ? 0 : 0.3, transition: 'opacity 1s' }}></div>
                <div className="w-full aspect-square bg-gray-100 mb-2 overflow-hidden relative z-0">
                  <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80" alt="Diaper" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 flex items-center justify-center relative z-0">
                  <span className="text-crayon text-gray-800 text-xl md:text-2xl tracking-widest">기저귀</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Hero Text */}
          <div className="hidden md:flex flex-col items-start text-left w-[500px] h-[350px] relative">
            {/* Before tagging */}
            <div style={{ opacity: isLightMode ? 0 : 1, pointerEvents: isLightMode ? 'none' : 'auto', transition: 'opacity 1s', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white/70">복잡한 앱, 어려운 설명서.</h1>
              <p className="mt-4 text-crayon text-5xl lg:text-6xl leading-tight text-white/50">700만 명의 부모가<br/>소외되어 있어요.</p>
              <p className="mt-10 text-lg text-white/30">카드를 태그해보세요 →</p>
            </div>
            {/* After tagging */}
            <div style={{ opacity: isLightMode ? 1 : 0, pointerEvents: isLightMode ? 'auto' : 'none', transition: 'opacity 1s', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">복잡한 과정 없이,</h1>
              <p className="mt-4 text-crayon text-5xl lg:text-6xl leading-tight text-[#C26D53]">태그 한 번, 목소리 한 마디로 충분해요</p>
              <p className="mt-10 text-lg text-gray-500">V.O.M과 함께라면 누구나 쉽게 육아를 기록할 수 있어요.</p>
            </div>
          </div>

          {/* Mobile Hero Text */}
          <div className="md:hidden mt-8 text-center h-[200px] relative w-full">
            <div style={{ opacity: isLightMode ? 0 : 1, pointerEvents: isLightMode ? 'none' : 'auto', transition: 'opacity 1s', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1 className="text-2xl font-bold text-white/70">복잡한 앱, 어려운 설명서.</h1>
              <p className="mt-3 text-crayon text-3xl text-white/50">700만 명의 부모가<br/>소외되어 있어요.</p>
              <p className="mt-6 text-sm text-white/30">카드를 태그해보세요</p>
            </div>
            <div style={{ opacity: isLightMode ? 1 : 0, pointerEvents: isLightMode ? 'auto' : 'none', transition: 'opacity 1s', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1 className="text-2xl font-bold text-gray-900">복잡한 과정 없이,</h1>
              <p className="mt-3 text-crayon text-3xl text-[#C26D53]">태그 한 번, 목소리 한 마디로 충분해요</p>
              <p className="mt-6 text-sm text-gray-500">V.O.M과 함께라면 누구나 쉽게 육아를 기록할 수 있어요.</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          onClick={scrollToLanding}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer z-50"
          style={{ opacity: isLightMode ? 1 : 0, transform: isLightMode ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(32px)', transition: 'all 1s ease-out', pointerEvents: isLightMode ? 'auto' : 'none' }}
        >
          <span className="text-[#C26D53] text-xs md:text-sm mb-2 font-bold tracking-widest uppercase">더 알아보기</span>
          <ChevronDown className="text-[#C26D53] animate-bounce w-6 h-6" />
        </div>
      </main>

      {/* Landing Page Sections */}
      <div
        ref={landingRef}
        className="w-full"
        style={{ opacity: isLightMode ? 1 : 0, pointerEvents: isLightMode ? 'auto' : 'none', height: isLightMode ? 'auto' : 0, overflow: isLightMode ? 'visible' : 'hidden', transition: 'opacity 1s ease-out' }}
      >

        {/* Interactive Sections */}
        <Section1Interactive />
        <Section2Interactive />
        <Section3Interactive />
        <Section4Interactive />

        {/* CTA Section */}
        <section className="py-32 px-6 bg-white relative overflow-hidden rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
          <PaperFlower color="#FFB6B6" size={150} className="top-20 left-10 opacity-30" delay={0.2} />
          <PaperFlower color="#FFCACA" size={100} className="bottom-20 right-16 opacity-25" delay={0.5} />

          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(194,109,83,0.1)_0%,transparent_100%)]"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              모든 엄마가<br/>
              <span className="text-crayon text-[#C26D53] mt-4 block text-5xl md:text-7xl">스스로 해낼 수 있도록</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              읽지 못해도, 처음이어도 괜찮아요. V.O.M이 옆에서 함께할게요.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 w-full max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full sm:flex-1 px-6 py-4 rounded-full border-2 border-gray-200 focus:border-[#C26D53] focus:outline-none text-gray-800 text-lg transition-colors"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-4 bg-[#C26D53] text-white rounded-full font-bold text-lg shadow-[0_10px_20px_rgba(194,109,83,0.3)] hover:bg-[#A85B43] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : submitted ? '감사합니다!' : '함께하기'}
                {!submitted && !isLoading && <ArrowRight size={20} />}
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        </section>
      </div>

      {/* Chat Widget - 상태 격리됨 */}
      <ChatWidget isVisible={isLightMode} />
    </div>
  );
}
