(function () {
'use strict';
const cfg=window.CAPRICHO_SUPABASE_CONFIG||{},$=id=>document.getElementById(id);
const setup=$('setup-warning'),login=$('login-panel'),app=$('admin-app'),loginForm=$('login-form'),loginNotice=$('login-notice'),form=$('product-form'),formNotice=$('form-notice'),listNotice=$('list-notice'),list=$('product-list'),count=$('product-count'),fileInput=$('product-image'),passwordPanel=$('password-update-panel'),passwordForm=$('update-password-form'),passwordNotice=$('password-update-notice');
let db=null,user=null,products=[],editingImage='';
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
async function upload(file){
if(!types.includes(file.type))throw new Error('Use uma imagem JPG, PNG, WEBP ou AVIF.');if(file.size>maxSize)throw new Error('A foto deve ter no máximo 5 MB.');
const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'}[file.type],base=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').replace(/\.[^.]+$/,'').slice(-70)||'foto';
const path=user.id+'/'+crypto.randomUUID()+'-'+base+'.'+ext;const r=await db.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(r.error)throw r.error;return db.storage.from('product-images').getPublicUrl(r.data.path).data.publicUrl
}
async function save(event){
event.preventDefault();note(formNotice,'','');
const npt=$('name-pt').value.trim(),nen=$('name-en').value.trim(),cpt=$('category-pt').value.trim(),cen=$('category-en').value.trim();
if(!npt||!nen||!cpt||!cen){note(formNotice,'Preencha os nomes e as categorias em português e inglês.','error');return}
const priceText=$('price').value.trim(),price=priceText===''?null:Number(priceText);if(price!==null&&(!Number.isFinite(price)||price<0||price>999999)){note(formNotice,'Informe um preço válido.','error');return}
const file=fileInput.files&&fileInput.files[0],typed=$('product-image-url').value.trim();if(typed&&!safeUrl(typed)&&!file){note(formNotice,'O link da foto precisa começar com https://.','error');return}
const btn=$('save-product');btn.disabled=true;form.classList.add('loading');btn.textContent=file?'Enviando foto e salvando…':'Salvando…';
try{
let image=editingImage||safeUrl(typed);if(file)image=await upload(file);else if(typed)image=safeUrl(typed);if(!image)throw new Error('Envie uma foto ou informe um link HTTPS.');
const payload={name_pt:npt,name_en:nen,description_pt:$('description-pt').value.trim(),description_en:$('description-en').value.trim(),category_pt:cpt,category_en:cen,image_url:image,price:price,sort_order:Math.max(0,Math.trunc(Number($('sort-order').value)||0)),is_active:$('is-active').checked,is_available:$('is-available').checked};
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
loginForm.addEventListener('submit',loginSubmit);form.addEventListener('submit',save);$('cancel-edit').addEventListener('click',resetForm);$('new-product').addEventListener('click',()=>{resetForm();form.scrollIntoView({behavior:'smooth',block:'start'})});$('refresh-products').addEventListener('click',loadProducts);
$('logout-button').addEventListener('click',async()=>{await db.auth.signOut();user=null;showLogin();note(loginNotice,'Você saiu da área administrativa.','success')});
$('reset-password').addEventListener('click',async()=>{const email=$('login-email').value.trim();if(!email){note(loginNotice,'Digite seu e-mail acima para receber o link.','error');$('login-email').focus();return}const r=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});if(r.error)note(loginNotice,'Não foi possível enviar: '+r.error.message,'error');else note(loginNotice,'Se o e-mail estiver cadastrado, o Supabase enviará as instruções.','success')});
list.addEventListener('click',event=>{const t=event.target instanceof Element?event.target:null;if(!t)return;const e=t.closest('[data-edit]'),d=t.closest('[data-delete]');if(e)editProduct(e.getAttribute('data-edit'));if(d)deleteProduct(d.getAttribute('data-delete'))});
restore().catch(e=>{showLogin();note(loginNotice,'Não foi possível verificar o acesso: '+(e.message||'erro de conexão.'),'error')});
})();