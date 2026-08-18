import React, { useState } from 'react';
import { Copy, Check, X, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url = window.location.href,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleTwitterShare = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `[글결 칼럼] ${title}`
    )}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-stone-900">
            <Share2 className="w-4 h-4 text-stone-700" />
            <h3 className="font-bold text-base font-serif-kr">칼럼 공유하기</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600 mb-4 line-clamp-2">{title}</p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 p-1.5 bg-stone-50 border border-stone-200 rounded-lg">
            <input
              type="text"
              readOnly
              value={url}
              className="bg-transparent text-xs text-stone-600 flex-1 px-2 focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사됨' : '복사'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleTwitterShare}
              className="py-2.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5"
            >
              <span className="font-bold text-stone-900">X</span> (Twitter)
            </button>
            <button
              onClick={handleFacebookShare}
              className="py-2.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-[#1877F2] flex items-center justify-center gap-1.5"
            >
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
