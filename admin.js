(function () {
'use strict';
const cfg=window.CAPRICHO_SUPABASE_CONFIG||{},$=id=>document.getElementById(id);
const setup=$('setup-warning'),login=$('login-panel'),app=$('admin-app'),loginForm=$('login-form'),loginNotice=$('login-notice'),form=$('product-form'),formNotice=$('form-notice'),listNotice=$('list-notice'),list=$('product-list'),count=$('product-count'),fileInput=$('product-image'),passwordPanel=$('password-update-panel'),passwordForm=$('update-password-form'),passwordNotice=$('password-update-notice'),translationNotice=$('translation-notice'),translateButton=$('translate-fields');
let db=null,user=null,products=[],editingImage='',translating=false;
const maxSize=5*1024*1024,types=['image/jpeg','image/png','image/webp','image/avif'];
function note(el,msg,type){el.textContent=msg;el.className='notice'+(type?' '+type:'');el.hidden=!msg}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeUrl(v){try{const u=new URL(String(v||''));return u.protocol==='https:'?u.href:''}catch(_){return ''}}
function money(v){return v==null||v===''?'Sem preço cadastrado':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v))}
function showLogin(){setup.hidden=true;login.hidden=false;app.hidden=true;passwordPanel.hidden=true}
function showApp(){setup.hidden=true;login.hidden=true;app.hidden=false;passwordPanel.hidden=true}
async function isAdmin(u){const r=await db.from('catalog_admins').select('user_id').eq('user_id',u.id).maybeSingle();if(r.error)throw r.error;return Boolean(r.data)}
async function loadProducts(){
list.classList.add('loading');count.textContent='Carregando produtos…';
const r=await db.from('products').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});list.classList.remove('loading');
if(r.error){note(listNotice,'Não foi possível carregar os produtos: '+r.error.message,'error');list.innerHTML='<div class="empty">Falha ao carregar a lista.</div>';return}
products=r.data||[];count.textContent=products.length+(products.length===1?' produto cadastrado':' produtos cadastrados');renderList()
}
function renderList(){
list.replaceChildren();if(!products.length){list.innerHTML='<div class="empty">Nenhum produto cadastrado. Use o formulário acima para começar.</div>';return}
products.forEach(p=>{const row=document.createElement('article');row.className='product-row';const image=safeUrl(p.image_url);const media=image?'<img src="'+esc(image)+'" alt="" loading="lazy">':'<div class="product-placeholder">✦</div>';
const tags='<span class="tag'+(p.is_active?'':' off')+'">'+(p.is_active?'Publicado':'Rascunho')+'</span><span class="tag'+(p.is_available?'':' off')+'">'+(p.is_available?'Disponível':'Indisponível')+'</span>';
row.innerHTML=media+'<div><h3>'+esc(p.name_pt)+'</h3><p>'+esc(p.category_pt)+' · '+esc(money(p.price))+'</p><div class="tags">'+tags+'</div></div><div class="row-actions"><button class="secondary" type="button" data-edit="'+esc(p.id)+'">Editar</button><button class="danger" type="button" data-delete="'+esc(p.id)+'">Excluir</button></div>';list.appendChild(row)})
}
function resetForm(){
form.reset();$('product-id').value='';$('sort-order').value='0';$('is-active').checked=true;$('is-available').checked=true;$('form-title').textContent='Cadastrar produto';$('save-product').textContent='Salvar produto';fileInput.value='';$('product-image-url').value='';editingImage='';note(formNotice,'','')
}
function editProduct(id){
const p=products.find(x=>x.id===id);if(!p)return;
$('product-id').value=p.id;$('name-pt').value=p.name_pt||'';$('name-en').value=p.name_en||'';$('description-pt').value=p.description_pt||'';$('description-en').value=p.description_en||'';$('category-pt').value=p.category_pt||'';$('category-en').value=p.category_en||'';$('price').value=p.price==null?'':p.price;$('sort-order').value=p.sort_order||0;$('product-image-url').value=p.image_url||'';$('is-active').checked=!!p.is_active;$('is-available').checked=!!p.is_available;fileInput.value='';editingImage=p.image_url||'';$('form-title').textContent='Editar produto';$('save-product').textContent='Salvar alterações';note(formNotice,'Editando “'+p.name_pt+'”.','');form.scrollIntoView({behavior:'smooth',block:'start'})
}
const translationPairs=[
 {source:'name-pt',target:'name-en',label:'nome do produto'},
 {source:'description-pt',target:'description-en',label:'descrição'},
 {source:'category-pt',target:'category-en',label:'categoria'}
];
function byteLength(value){return new TextEncoder().encode(value).length}
function splitTranslationText(value,maxBytes){
 const words=value.match(/\S+\s*/g)||[];
 const chunks=[];let current='';
 for(const word of words){
  if(byteLength(word)>maxBytes){
   if(current.trim())chunks.push(current.trim());
   current='';
   let piece='';
   for(const char of Array.from(word)){
    if(piece&&byteLength(piece+char)>maxBytes){chunks.push(piece.trim());piece=''}
    piece+=char;
   }
   if(piece.trim())current=piece;
   continue;
  }
  if(current&&byteLength(current+word)>maxBytes){chunks.push(current.trim());current=word}
  else current+=word;
 }
 if(current.trim())chunks.push(current.trim());
 return chunks
}
function decodeTranslation(value){
 const area=document.createElement('textarea');area.innerHTML=String(value||'');return area.value.trim()
}
async function translateText(source){
 const pieces=splitTranslationText(source,440);
 const output=[];
 for(const piece of pieces){
  const params=new URLSearchParams({q:piece,langpair:'pt|en'});
  const response=await fetch('https://api.mymemory.translated.net/get?'+params.toString(),{headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('O serviço de tradução respondeu com HTTP '+response.status+'.');
  const data=await response.json();
  if(Number(data.responseStatus)!==200||!data.responseData||!data.responseData.translatedText)throw new Error(data.responseDetails||'O serviço não retornou uma tradução.');
  output.push(decodeTranslation(data.responseData.translatedText))
 }
 return output.join(' ').replace(/\s+([,.;!?])/g,'$1').trim()
}
async function translateProductFields(force){
 if(translating)return {translated:0,failed:true};
 const chosen=translationPairs.filter(pair=>{
  const source=$(pair.source).value.trim(),target=$(pair.target).value.trim();
  return Boolean(source)&&(force||!target)
 });
 if(!chosen.length){
  note(translationNotice,'Não há campos em inglês vazios para traduzir.','success');
  return {translated:0,failed:false}
 }
 if(force&&chosen.some(pair=>$(pair.target).value.trim())&&!window.confirm('Traduzir novamente e substituir os textos em inglês desses campos?'))return {translated:0,cancelled:true};
 translating=true;
 const save=$('save-product'),oldLabel=translateButton.textContent;
 translateButton.disabled=true;save.disabled=true;translateButton.textContent='Traduzindo…';
 let translated=0;
 try{
  for(let i=0;i<chosen.length;i++){
   const pair=chosen[i];
   note(translationNotice,'Traduzindo '+pair.label+' ('+(i+1)+' de '+chosen.length+')…','');
   const value=await translateText($(pair.source).value.trim());
   if(value){$(pair.target).value=value;translated++}
  }
  note(translationNotice,translated?'Tradução preenchida. Revise o inglês — especialmente nomes de alimentos e expressões regionais — antes de salvar.':'Nenhum texto precisou ser traduzido.','success');
  return {translated,failed:false}
 }catch(error){
  note(translationNotice,'A tradução automática não concluiu todos os campos: '+(error.message||'serviço indisponível')+'. Você pode tentar novamente ou preencher o inglês manualmente.','error');
  return {translated,failed:true}
 }finally{
  translating=false;translateButton.disabled=false;save.disabled=false;translateButton.textContent=oldLabel
 }
}
async function upload(file){
if(!types.includes(file.type))throw new Error('Use uma imagem JPG, PNG, WEBP ou AVIF.');if(file.size>maxSize)throw new Error('A foto deve ter no máximo 5 MB.');
const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'}[file.type],base=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').replace(/\.[^.]+$/,'').slice(-70)||'foto';
const path=user.id+'/'+crypto.randomUUID()+'-'+base+'.'+ext;const r=await db.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(r.error)throw r.error;return db.storage.from('product-images').getPublicUrl(r.data.path).data.publicUrl
}
async function save(event){
event.preventDefault();if(translating)return;note(formNotice,'','');
const npt=$('name-pt').value.trim(),nen=$('name-en').value.trim(),cpt=$('category-pt').value.trim(),cen=$('category-en').value.trim();
if(!npt||!cpt){note(formNotice,'Preencha o nome e a categoria em português.','error');return}
const missingEnglish=translationPairs.some(pair=>$(pair.source).value.trim()&&!$(pair.target).value.trim());
if(missingEnglish){
 const result=await translateProductFields(false);
 if(result.translated){
  note(formNotice,'A versão em inglês foi preenchida automaticamente. Revise os textos e clique em salvar novamente.','success');
  return
 }
 if(!nen||!cen){note(formNotice,'Preencha ou traduza o nome e a categoria em inglês antes de salvar.','error');return}
 if(result.failed){note(formNotice,'Não foi possível traduzir automaticamente todos os campos. Revise o inglês e tente salvar novamente.','error');return}
}
const currentNameEn=$('name-en').value.trim(),currentCategoryEn=$('category-en').value.trim();
if(!currentNameEn||!currentCategoryEn){note(formNotice,'Preencha ou traduza o nome e a categoria em inglês antes de salvar.','error');return}
const priceText=$('price').value.trim(),price=priceText===''?null:Number(priceText);if(price!==null&&(!Number.isFinite(price)||price<0||price>999999)){note(formNotice,'Informe um preço válido.','error');return}
const file=fileInput.files&&fileInput.files[0],typed=$('product-image-url').value.trim();if(typed&&!safeUrl(typed)&&!file){note(formNotice,'O link da foto precisa começar com https://.','error');return}
const btn=$('save-product');btn.disabled=true;form.classList.add('loading');btn.textContent=file?'Enviando foto e salvando…':'Salvando…';
try{
let image=editingImage||safeUrl(typed);if(file)image=await upload(file);else if(typed)image=safeUrl(typed);if(!image)throw new Error('Envie uma foto ou informe um link HTTPS.');
const payload={name_pt:npt,name_en:currentNameEn,description_pt:$('description-pt').value.trim(),description_en:$('description-en').value.trim(),category_pt:cpt,category_en:currentCategoryEn,image_url:image,price:price,sort_order:Math.max(0,Math.trunc(Number($('sort-order').value)||0)),is_active:$('is-active').checked,is_available:$('is-available').checked};
const id=$('product-id').value,r=id?await db.from('products').update(payload).eq('id',id).select().single():await db.from('products').insert(payload).select().single();if(r.error)throw r.error;
note(formNotice,id?'Produto atualizado com sucesso.':'Produto cadastrado com sucesso.','success');resetForm();await loadProducts();note(listNotice,'Catálogo atualizado.','success')
}catch(e){note(formNotice,'Não foi possível salvar: '+(e.message||'verifique conexão e permissões.'),'error')}
finally{btn.disabled=false;btn.textContent=$('product-id').value?'Salvar alterações':'Salvar produto';form.classList.remove('loading')}
}
async function deleteProduct(id){
const p=products.find(x=>x.id===id);if(!p||!window.confirm('Excluir “'+p.name_pt+'”? Esta ação não pode ser desfeita.'))return;
const r=await db.from('products').delete().eq('id',id);if(r.error){note(listNotice,'Não foi possível excluir: '+r.error.message,'error');return}if($('product-id').value===id)resetForm();note(listNotice,'Produto excluído.','success');await loadProducts()
}
async function loginSubmit(event){
event.preventDefault();note(loginNotice,'','');const btn=$('login-submit');btn.disabled=true;btn.textContent='Entrando…';
try{
const r=await db.auth.signInWithPassword({email:$('login-email').value.trim(),password:$('login-password').value});if(r.error)throw r.error;user=r.data.user;
if(!await isAdmin(user)){await db.auth.signOut();user=null;throw new Error('Usuário sem autorização. Peça ao responsável para incluí-lo em catalog_admins.')}
showApp();await loadProducts()
}catch(e){note(loginNotice,e.message||'Não foi possível entrar.','error')}finally{btn.disabled=false;btn.textContent='Entrar'}
}
async function restore(){
const recovering=window.location.hash.indexOf('type=recovery')>=0||new URLSearchParams(window.location.search).has('code');
if(recovering){setup.hidden=true;login.hidden=true;app.hidden=true;passwordPanel.hidden=false;return}
const r=await db.auth.getSession();if(r.error)throw r.error;const s=r.data.session;if(!s){showLogin();return}user=s.user;
if(!await isAdmin(user)){await db.auth.signOut();user=null;showLogin();note(loginNotice,'Este usuário não tem autorização administrativa.','error');return}
showApp();await loadProducts()
}
if(!cfg.url||!cfg.anonKey||!window.supabase||!window.supabase.createClient){setup.hidden=false;login.hidden=true;app.hidden=true;return}
setup.hidden=true;db=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
passwordForm.addEventListener('submit',async function(event){
event.preventDefault();note(passwordNotice,'','');const newPass=$('new-password').value;
if(newPass.length<8){note(passwordNotice,'A senha precisa ter pelo menos 8 caracteres.','error');return}
const submit=$('update-password-submit');submit.disabled=true;
try{const result=await db.auth.updateUser({password:newPass});if(result.error)throw result.error;await db.auth.signOut();$('new-password').value='';passwordPanel.hidden=true;showLogin();note(loginNotice,'Senha atualizada. Entre com a nova senha.','success');window.history.replaceState({},document.title,window.location.pathname)}catch(error){note(passwordNotice,'Não foi possível alterar a senha: '+(error.message||'tente novamente.'),'error')}finally{submit.disabled=false}
});
db.auth.onAuthStateChange(function(event){
if(event==='PASSWORD_RECOVERY'){setup.hidden=true;login.hidden=true;app.hidden=true;passwordPanel.hidden=false}
});
translateButton.addEventListener('click',function(){translateProductFields(true)});
loginForm.addEventListener('submit',loginSubmit);form.addEventListener('submit',save);$('cancel-edit').addEventListener('click',resetForm);$('new-product').addEventListener('click',()=>{resetForm();form.scrollIntoView({behavior:'smooth',block:'start'})});$('refresh-products').addEventListener('click',loadProducts);
$('logout-button').addEventListener('click',async()=>{await db.auth.signOut();user=null;showLogin();note(loginNotice,'Você saiu da área administrativa.','success')});
$('reset-password').addEventListener('click',async()=>{const email=$('login-email').value.trim();if(!email){note(loginNotice,'Digite seu e-mail acima para receber o link.','error');$('login-email').focus();return}const r=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});if(r.error)note(loginNotice,'Não foi possível enviar: '+r.error.message,'error');else note(loginNotice,'Se o e-mail estiver cadastrado, o Supabase enviará as instruções.','success')});
list.addEventListener('click',event=>{const t=event.target instanceof Element?event.target:null;if(!t)return;const e=t.closest('[data-edit]'),d=t.closest('[data-delete]');if(e)editProduct(e.getAttribute('data-edit'));if(d)deleteProduct(d.getAttribute('data-delete'))});
restore().catch(e=>{showLogin();note(loginNotice,'Não foi possível verificar o acesso: '+(e.message||'erro de conexão.'),'error')});
})();