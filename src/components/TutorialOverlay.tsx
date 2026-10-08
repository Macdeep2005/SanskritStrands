import type { Language } from '../types/gameTypes';

type Props = {
  open: boolean;
  language: Language;
  onClose: () => void;
};

export default function TutorialOverlay({ open, language, onClose }: Props) {
  if (!open) return null;
  const sa = language === 'sa';
  return (
    <div className="modal-backdrop tutorial-backdrop" role="dialog" aria-modal="true">
      <div className="tutorial-card">
        <div className="tutorial-badge">01</div>
        <small>{sa ? 'शीघ्रमार्गदर्शनम्' : 'QUICK TUTORIAL'}</small>
        <h2>{sa ? 'एवं क्रीडतु' : 'How to play'}</h2>

        <div className="tutorial-steps">
          <div>
            <b>1</b>
            <p>{sa ? 'प्रथमाक्षरे स्पृशित्वा धारयतु।' : 'Press and hold the first letter.'}</p>
          </div>
          <div>
            <b>2</b>
            <p>{sa ? 'स्पर्शमानकोष्ठेषु कर्षतु। तिर्यक् गमनमपि शक्यम्।' : 'Drag through touching cells. Diagonal moves are allowed.'}</p>
          </div>
          <div>
            <b>3</b>
            <p>{sa ? 'अन्ते मुञ्चतु। सही शब्दः स्वयमेव लभ्यते।' : 'Release at the end. A correct word is discovered automatically.'}</p>
          </div>
        </div>

        <div className="tutorial-demo" aria-hidden="true">
          <span>अ</span><i/><span>ध्य</span><i className="diag"/><span>य</span>
        </div>

        <p className="tutorial-note">
          {sa
            ? 'प्रथमस्तरः सरलः। द्वितीयस्तरे द्विदिशापन्थाः, तृतीयस्तरे अधिकवक्रपन्थाः।'
            : 'Level 1 teaches the mechanic. Level 2 uses two-direction paths. Level 3 adds more bends and diagonals.'}
        </p>

        <button className="tutorial-start" onClick={onClose}>
          {sa ? 'अवगतम्' : 'Got it'}
        </button>
      </div>
    </div>
  );
}
