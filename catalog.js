(function () {
  'use strict';
  const config = window.CAPRICHO_SUPABASE_CONFIG || {};
  const grid = document.getElementById('product-grid');
  const status = document.getElementById('catalog-status');
  let products = [];
  let lang = document.documentElement.lang === 'en' ? 'en' : 'pt';
  const text = {
    pt: { setup: 'Estamos preparando nosso catálogo. Em breve, você poderá conferir os produtos disponíveis!', loading: 'Carregando o catálogo da padaria…', empty: 'Nenhum produto publicado no momento. Volte em breve para conferir as novidades.', error: 'Não foi possível carregar o catálogo agora. Tente novamente em alguns instantes.', add: 'Adicionar', unavailable: 'Indisponível', noImage: 'Foto do produto' },
    en: { setup: 'Our catalog is being prepared. Soon, you will be able to browse the products available!', loading: 'Loading the bakery catalog…', empty: 'No products are published right now. Please come back soon for updates.', error: 'The catalog could not be loaded right now. Please try again in a moment.', add: 'Add', unavailable: 'Unavailable', noImage: 'Product photo' }
  };
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); }
  function safeImage(v) {
    try { const u = new URL(String(v || ''), window.location.href); return u.protocol === 'https:' || u.origin === window.location.origin ? u.href : ''; }
    catch (_) { return ''; }
  }
  function fmtPrice(v) {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'pt-BR', {style:'currency',currency:'BRL'}).format(n) : '';
  }
  function statusText(s, visible) { if (status) { status.textContent = s; status.hidden = !visible; } }
  function render() {
    if (!grid) return;
    grid.replaceChildren();
    if (!products.length) {
      statusText((config.url && config.anonKey) ? text[lang].empty : text[lang].setup, true);
      return;
    }
    statusText('', false);
    grid.innerHTML = products.map(function (p) {
      const pt = p.name_pt || '', en = p.name_en || pt;
      const name = lang === 'en' ? en : pt;
      const desc = lang === 'en' ? (p.description_en || p.description_pt || '') : (p.description_pt || '');
      const category = lang === 'en' ? (p.category_en || p.category_pt || 'Other') : (p.category_pt || 'Outros');
      const imageUrl = safeImage(p.image_url);
      const image = imageUrl ? '<img src="' + esc(imageUrl) + '" alt="' + esc(name) + '" loading="lazy" decoding="async">' : '<div class="catalog-no-image" role="img" aria-label="' + esc(text[lang].noImage) + '">✦</div>';
      const price = fmtPrice(p.price);
      const priceHtml = price ? '<span class="product-price">' + esc(price) + '</span>' : '';
      const available = p.is_available !== false;
      const buttonText = available ? text[lang].add : text[lang].unavailable;
      const button = '<button class="product-add" type="button" data-cart-add="' + esc(pt) + '" data-cart-add-en="' + esc(en) + '" data-cart-id="' + esc(p.id) + '" data-cart-price="' + (p.price == null ? '' : esc(p.price)) + '"' + (available ? '' : ' disabled aria-disabled="true"') + ' aria-label="' + esc(buttonText + ': ' + name) + '"><span>' + esc(buttonText) + '</span></button>';
      const off = available ? '' : '<span class="product-unavailable">' + esc(text[lang].unavailable) + '</span>';
      return '<article class="product">' + image + '<span class="product-category">' + esc(category) + '</span><div class="product-info"><h3>' + esc(name) + '</h3><p>' + esc(desc) + '</p>' + priceHtml + '</div>' + off + button + '</article>';
    }).join('');
  }
  function setLanguage(code) {
    lang = code === 'en' ? 'en' : 'pt';
    if (products.length) render();
    else statusText(config.url && config.anonKey ? text[lang].loading : text[lang].setup, true);
  }
  async function load() {
    if (!grid) return;
    if (!config.url || !config.anonKey || !window.supabase || !window.supabase.createClient) {
      statusText(text[lang].setup, true);
      return;
    }
    statusText(text[lang].loading, true);
    try {
      const client = window.supabase.createClient(config.url, config.anonKey);
      const result = await client.from('products')
        .select('id,name_pt,name_en,description_pt,description_en,category_pt,category_en,image_url,price,is_available,sort_order,created_at')
        .eq('is_active', true).order('sort_order', {ascending:true}).order('created_at', {ascending:false});
      if (result.error) throw result.error;
      products = Array.isArray(result.data) ? result.data : [];
      render();
    } catch (error) {
      console.error('Capricho catalog could not be loaded:', error);
      products = [];
      statusText(text[lang].error, true);
    }
  }
  window.CaprichoCatalog = { setLanguage: setLanguage, refresh: load };
  load();
})();