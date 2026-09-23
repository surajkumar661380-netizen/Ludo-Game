/**
 * Rules and Guide Modal
 */

import React from 'react';
import { X, Shield, Swords, Dices, Award } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-900">How to Play Ludo</h2>
            <span className="text-xs text-stone-500">Official Rules</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            aria-label="Close rules modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-stone-700 leading-relaxed">
          {/* Rule 1: Entering */}
          <div className="flex gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 h-fit shrink-0">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-0.5">Rolling a 6 to Enter</h3>
              <p className="text-xs text-stone-600">
                All tokens start locked in your colored home yard. You must roll a <strong>6</strong> to release a token onto your starting square. Rolling a 6 also grants an <strong>extra bonus roll</strong>!
              </p>
            </div>
          </div>

          {/* Rule 2: Movement */}
          <div className="flex gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 h-fit shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-0.5">Clockwise Movement</h3>
              <p className="text-xs text-stone-600">
                Tokens navigate clockwise around the 52-tile circuit, turn into their colored home column, and head toward the central Home triangle. Exact rolls are required to reach Home.
              </p>
            </div>
          </div>

          {/* Rule 3: Captures */}
          <div className="flex gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 h-fit shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-0.5">Capturing Opponents</h3>
              <p className="text-xs text-stone-600">
                Landing on a cell occupied by an opponent’s token captures it, sending it all the way back to their yard! Making a capture awards you an <strong>immediate bonus roll</strong>.
              </p>
            </div>
          </div>

          {/* Rule 4: Safe Squares */}
          <div className="flex gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 h-fit shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-0.5">8 Safe Squares</h3>
              <p className="text-xs text-stone-600">
                The 4 starting squares and the 4 star squares are safe havens marked with golden stars. Tokens on safe squares can <strong>never</strong> be captured, and tokens inside your home path are 100% immune.
              </p>
            </div>
          </div>

          {/* Rule 5: Bonus turns & 3-Six Rule */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <p><strong>Bonus Rolls:</strong> Awarded for rolling a 6, capturing an opponent token, or bringing a token to Home.</p>
            <p><strong>Three-Sixes Rule:</strong> Rolling three consecutive 6s forfeits that turn to maintain fair play.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow transition-colors"
          >
            Got It, Let&apos;s Play
          </button>
        </div>
      </div>
    </div>
  );
};
