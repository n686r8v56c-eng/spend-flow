import React,{useState} from 'react';
import {Plus,Trash2,TrendingDown,ChevronDown} from 'lucide-react';
const dateToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const money=n=>Math.round(n||0).toLocaleString('ko-KR')+'원';
const monthDiff=(from,to)=>{if(!from||!to||from>to)return 0;const a=new Date(from+'T12:00:00'),b=new Date(to+'T12:00:00');let months=(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth();if(b.getDate()<a.getDate())months--;return Math.max(0,months)};
export function SavingsPanel({fixed=[],changes=[],onSave,onDelete}){
 const [form,setForm]=useState(null),[expanded,setExpanded]=useState({});
 const now=dateToday();
 const sorted=[...changes].sort((a,b)=>a.effectiveDate.localeCompare(b.effectiveDate)||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
 const counted=sorted.map((item,i)=>{
   const next=sorted.slice(i+1).find(n=>n.fixedId===item.fixedId&&n.effectiveDate>=item.effectiveDate);
   const end=next?.effectiveDate||now;
   const months=monthDiff(item.effectiveDate,end);
   const delta=Number(item.previousAmount)-Number(item.newAmount);
   return {...item,months,delta,realized:delta*months,ongoing:!next};
 });
 const monthly=counted.filter(x=>x.ongoing&&x.effectiveDate<=now).reduce((s,x)=>s+x.delta,0);
 const realized=counted.reduce((s,x)=>s+x.realized,0);
 const groups=[...new Set(counted.map(x=>x.fixedId))].map(id=>({id,records:counted.filter(x=>x.fixedId===id).reverse()}));
 const start=f=>setForm({id:undefined,fixedId:f?.id||'',name:f?.name||'',category:f?.category||'기타',previousAmount:f?.amount??'',newAmount:'',effectiveDate:now});
 const selected=fixed.find(f=>f.id===form?.fixedId);
 const save=e=>{e.preventDefault();const old=Number(form.previousAmount),next=Number(form.newAmount);if(!form.name.trim()||!form.effectiveDate||!Number.isFinite(old)||!Number.isFinite(next)||old<0||next<0)return;
   onSave({...form,previousAmount:old,newAmount:next,name:form.name.trim(),category:form.category||'기타'},selected);
   setForm(null);
 };
 return <section className="fixed-savings">
   <div className="duo"><div className="card stat"><small>현재 월 절감액</small><strong>{money(monthly)}</strong></div><div className="card stat"><small>현재 연간 절감 예상</small><strong>{money(monthly*12)}</strong></div></div>
   <div className="card stat" style={{marginTop:10}}><small>적용 이후 누적 절감액</small><strong>{money(realized)}</strong><p className="muted small">변경일 이후 완료된 개월 수 기준의 추정 절감액이야. 실제 청구액과 다를 수 있어.</p></div>
   <button type="button" className="primary full" style={{margin:'12px 0'}} onClick={()=>start()}><Plus size={16}/> 절감 기록 추가</button>
   {fixed.length>0&&<div className="card"><b>등록된 고정비에서 절약하기</b><div className="actions" style={{flexWrap:'wrap',marginTop:10}}>{fixed.map(f=><button type="button" className="secondary" key={f.id} onClick={()=>start(f)}>{f.name} · {money(f.amount)}</button>)}</div></div>}
   {groups.map(group=>{const rows=group.records, latest=rows[0],total=rows.reduce((s,x)=>s+x.realized,0);return <div className="card" key={group.id} style={{marginTop:10}}>
     <button type="button" className="spread" style={{width:'100%',background:'none',border:0,textAlign:'left',color:'inherit'}} onClick={()=>setExpanded(s=>({...s,[group.id]:!s[group.id]}))}>
       <div><b>{latest.name}</b><p className="muted small">{latest.category} · 변경 {rows.length}회</p></div>
       <div style={{textAlign:'right'}}><strong>{money(total)}</strong><p className="muted small">누적 절감 <ChevronDown size={13} style={{display:'inline'}}/></p></div>
     </button>
     {expanded[group.id]&&rows.map(row=><div key={row.id} style={{padding:'12px 0',borderTop:'1px solid #ece6f4'}}>
       <div className="spread"><span>{row.effectiveDate} 적용</span><b>{row.delta>=0?'−':'+'}{money(Math.abs(row.delta))}/월</b></div>
       <p className="muted small">{money(row.previousAmount)} → {money(row.newAmount)} · 완료 {row.months}개월 · {money(row.realized)} {row.realized>=0?'절감':'추가 지출'}</p>
       <button type="button" className="ghost" onClick={()=>{if(window.confirm('이 절감 기록을 삭제할까? 기존 고정비 금액은 유지돼.'))onDelete(row.id)}}><Trash2 size={14}/> 기록 삭제</button>
     </div>)}
   </div>})}
   {!groups.length&&<div className="card empty">통신비, 보험료, 구독료 등 고정비를 변경했다면 전후 금액과 적용일을 기록해봐.</div>}
   {form&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setForm(null)}><form className="sheet" onSubmit={save}><div className="modal-head"><h2>고정비 절감 기록</h2><button type="button" className="iconbtn" onClick={()=>setForm(null)}>닫기</button></div><div className="sheetbody">
     <label className="field">기존 고정비 연결<select value={form.fixedId} onChange={e=>{const f=fixed.find(x=>x.id===e.target.value);setForm(s=>({...s,fixedId:f?.id||'',name:f?.name||'',category:f?.category||'기타',previousAmount:f?.amount??''}))}}><option value="">별도 기록 (연결 안 함)</option>{fixed.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select></label>
     <label className="field">항목 이름<input required value={form.name} onChange={e=>setForm(s=>({...s,name:e.target.value}))} placeholder="예: 휴대폰 통신비"/></label>
     <label className="field">구분<input value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}/></label>
     <label className="field">변경 전 월 금액<input type="number" min="0" required value={form.previousAmount} onChange={e=>setForm(s=>({...s,previousAmount:e.target.value}))}/></label>
     <label className="field">변경 후 월 금액<input type="number" min="0" required value={form.newAmount} onChange={e=>setForm(s=>({...s,newAmount:e.target.value}))}/></label>
     <label className="field">적용일<input type="date" required value={form.effectiveDate} onChange={e=>setForm(s=>({...s,effectiveDate:e.target.value}))}/></label>
     <div className="card"><small>월 절감액</small><h2>{money(Number(form.previousAmount||0)-Number(form.newAmount||0))}</h2><small>연간 예상 {money((Number(form.previousAmount||0)-Number(form.newAmount||0))*12)}</small></div>
     <button type="submit" className="primary full">절감 기록 저장</button>
     <p className="muted small">고정비를 연결하면 현재 고정비 금액도 변경 후 금액으로 바뀌어. 기록을 저장해도 과거 지출 내역은 수정하지 않아.</p>
   </div></form></div>}
 </section>;
}
