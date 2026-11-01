import React, {useId, useState} from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';

const groups = [['social','소셜'],['branding','브랜딩'],['monetization','수익화'],['challenge','경쟁']];
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
// Read malformed legacy fields defensively without rewriting unrelated payload data.
export function socialEntries(value, group) {
  const entries = record(value)[group];
  const seen = new Set();
  return Array.isArray(entries) ? entries.filter(entry => {
    if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  }) : [];
}
export function changeSocial(value, group, entry, remove = false) {
  const entries = socialEntries(value, group);
  return {...record(value), [group]: remove ? entries.filter(item => item.id !== entry.id)
    : entries.some(item => item.id === entry.id) ? entries.map(item => item.id === entry.id ? {...item, ...entry} : item) : [...entries, entry]};
}
export function KpiSection({title, defaultOpen = false, children}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return <section className="growth-section">
    <h3><button type="button" className="growth-heading" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
      <span>{title}</span>{open ? <ChevronUp size={18} aria-hidden="true"/> : <ChevronDown size={18} aria-hidden="true"/>}
    </button></h3>
    <div id={id} hidden={!open} className="growth-section-body">{children}</div>
  </section>;
}
function SocialGroup({group, title, value, onChange}) {
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const entries = socialEntries(value, group);
  const edit = entry => {setError(''); setDraft(entry ? {...entry, name: typeof entry.name === 'string' ? entry.name : '', unit: typeof entry.unit === 'string' ? entry.unit : '', target: entry.target ?? '', current: entry.current ?? ''} : {id: crypto.randomUUID(), name:'', target:'', unit:'', current:''});};
  const save = event => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.unit.trim() || draft.target === '' || draft.current === '' || !Number.isFinite(Number(draft.target)) || !Number.isFinite(Number(draft.current)) || Number(draft.target) < 0 || Number(draft.current) < 0) {
      setError('이름과 단위, 0 이상의 유효한 목표·현재 값을 입력해줘.'); return;
    }
    const entry = {...draft, name:draft.name.trim(), unit:draft.unit.trim(), target:Number(draft.target), current:Number(draft.current)};
    onChange(previous => changeSocial(previous, group, entry)); setDraft(null); setError('');
  };
  return <KpiSection title={title}>
    <div className="growth-list">{entries.map(entry => <div className="card growth-entry" key={entry.id}>
      <b>{typeof entry.name === 'string' ? entry.name : '이름 없음'}</b>
      <span>현재 {Number.isFinite(Number(entry.current)) ? Number(entry.current).toLocaleString('ko-KR') : '—'} / 목표 {Number.isFinite(Number(entry.target)) ? Number(entry.target).toLocaleString('ko-KR') : '—'} {typeof entry.unit === 'string' ? entry.unit : ''}</span>
      <div className="growth-actions"><button type="button" className="secondary" onClick={() => edit(entry)} aria-label={`${entry.name || title} 수정`}>수정</button><button type="button" className="secondary" onClick={() => {
        if (window.confirm('이 KPI를 삭제할까?')) {onChange(previous => changeSocial(previous, group, entry, true)); if (draft?.id === entry.id) setDraft(null);}
      }} aria-label={`${entry.name || title} 삭제`}>삭제</button></div>
    </div>)}</div>
    {draft ? <form className="growth-editor" onSubmit={save} noValidate>
      <label>이름<input autoFocus value={draft.name} onChange={e => setDraft({...draft,name:e.target.value})}/></label>
      <div className="growth-fields"><label>목표 값<input type="number" inputMode="decimal" min="0" step="any" value={draft.target} onChange={e => setDraft({...draft,target:e.target.value})}/></label><label>현재 값<input type="number" inputMode="decimal" min="0" step="any" value={draft.current} onChange={e => setDraft({...draft,current:e.target.value})}/></label></div>
      <label>단위<input value={draft.unit} onChange={e => setDraft({...draft,unit:e.target.value})}/></label>
      {error && <p role="alert">{error}</p>}
      <div className="growth-actions"><button type="button" className="secondary" onClick={() => {setDraft(null);setError('');}}>취소</button><button type="submit" className="primary">저장</button></div>
    </form> : <button type="button" className="secondary growth-add" onClick={() => edit(null)}>{title} KPI 추가</button>}
  </KpiSection>;
}
export function KpiTabs({children, social, onSocialChange}) {
  const [tab, setTab] = useState('personal');
  const id = useId();
  return <div className="growth-kpis">
    <div className="growth-tabs" role="tablist" aria-label="KPI 종류">{[['personal','개인'],['social','사회']].map(([key,label]) => <button key={key} type="button" role="tab" id={`${id}-${key}-tab`} aria-selected={tab === key} aria-controls={`${id}-${key}`} tabIndex={tab === key ? 0 : -1} onClick={() => setTab(key)} onKeyDown={event => {
      if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {event.preventDefault();const next = event.key === 'Home' ? 'personal' : event.key === 'End' ? 'social' : tab === 'personal' ? 'social' : 'personal';setTab(next);document.getElementById(`${id}-${next}-tab`)?.focus();}
    }}>{label}</button>)}</div>
    <div role="tabpanel" id={`${id}-personal`} aria-labelledby={`${id}-personal-tab`} hidden={tab !== 'personal'}>{children}</div>
    <div role="tabpanel" id={`${id}-social`} aria-labelledby={`${id}-social-tab`} hidden={tab !== 'social'}>{groups.map(([group,title]) => <SocialGroup key={group} group={group} title={title} value={social} onChange={onSocialChange}/>)}</div>
  </div>;
}
