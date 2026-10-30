import React, { useState } from 'react';
import { X, Download, Copy, Check, Smartphone, FileCode, Archive, ShieldCheck, ExternalLink } from 'lucide-react';
import { generateStandaloneSingleHtml, exportProjectZip } from '../services/singleFileGenerator';
import { FIRESTORE_SECURITY_RULES, FIREBASE_SETUP_STEPS_AR } from '../services/firebaseConfig';

interface PocketDevExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PocketDevExportModal: React.FC<PocketDevExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'pocket' | 'firebase'>('pocket');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const handleDownloadSingleHtml = () => {
    const htmlContent = generateStandaloneSingleHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySingleHtml = async () => {
    const htmlContent = generateStandaloneSingleHtml();
    await navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await exportProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pro-chess-pocket-developer.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyRules = async () => {
    await navigator.clipboard.writeText(FIRESTORE_SECURITY_RULES);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-zinc-100 text-base">
              تصدير وتشغيل في Pocket Developer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pocket')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'pocket'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>ملفات Pocket Developer (HTML / ZIP)</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>إعدادات وقواعد Firebase</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'pocket' ? (
            <>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-400">💡 جاهز 100% للتشغيل الذاتي:</span> تم تضمين كافة القطع
                (SVG)، مركب الأصوات، محرك الشطرنج، والألغاز، وتقنية WebRTC P2P في ملف واحد بدون أي اعتمادية على Node.js أو أوامر Terminal.
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleDownloadSingleHtml}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all shadow-lg active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف HTML مفرد (index.html)</span>
                </button>

                <button
                  onClick={handleCopySingleHtml}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold border border-zinc-700 transition-all active:scale-98"
                >
                  {copiedHtml ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedHtml ? 'تم نسخ كود HTML بنجاح!' : 'نسخ كود HTML بالكامل'}</span>
                </button>
              </div>

              {/* Direct ZIP Download */}
              <div className="space-y-2 pt-1">
                <a
                  href="/pro-chess-master.zip"
                  download="pro-chess-master.zip"
                  className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-xl transition-all active:scale-98"
                >
                  <Archive className="w-5 h-5 text-zinc-950" />
                  <span>📦 تحميل ملف ZIP للعبة الجديدة (pro-chess-master.zip)</span>
                </a>

                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold border border-zinc-700 text-xs transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isZipping ? 'جارٍ تجميع حزمة ZIP...' : 'إعادة توليد حزمة ZIP مخصصة من المتصفح'}</span>
                </button>
              </div>

              {/* Step by step guide */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2.5">
                <h4 className="font-bold text-zinc-200 text-sm">خطوات التشغيل داخل تطبيق Pocket Developer:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 leading-normal">
                  <li>قم بتحميل أو نسخ ملف <code className="text-amber-400">index.html</code>.</li>
                  <li>افتح تطبيق Pocket Developer على هاتفك أو حاسوبك.</li>
                  <li>أنشئ مشروعاً جديداً وضع بداخله هذا الملف.</li>
                  <li>اضغط على زر التشغيل (Run / Preview) للبدء فوراً!</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-200">قواعد أمان فايربيس (Firestore Security Rules):</h4>
                  <button
                    onClick={handleCopyRules}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                  >
                    {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRules ? 'تم النسخ' : 'نسخ القواعد'}</span>
                  </button>
                </div>
                <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-40">
                  {FIRESTORE_SECURITY_RULES}
                </pre>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-zinc-200">دليل تشغيل فايربيس خطوة بخطوة:</h4>
                <div className="space-y-1.5 text-zinc-400">
                  {FIREBASE_SETUP_STEPS_AR.map((step, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
