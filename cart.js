(function () {
  'use strict';
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const langNow = () => document.documentElement.lang === 'en' ? 'en' : 'pt';
  const labels = {
    pt: {
      added: name => name + ' adicionado ao pedido.',
      removed: name => name + ' removido do pedido.',
      cartLabel: count => 'Abrir carrinho, ' + count + (count === 1 ? ' item' : ' itens'),
      increase: name => 'Aumentar quantidade de ' + name,
      decrease: name => 'Diminuir quantidade de ' + name,
      remove: name => 'Remover ' + name + ' do pedido',
      empty: 'Seu carrinho está vazio.',
      orderTitle: 'Pedido — Panificação Capricho',
      greeting: 'Olá, Panificação Capricho! Quero fazer um pedido pelo site.',
      location: 'Unidade',
      items: 'Itens do pedido:',
      customer: 'Nome',
      notes: 'Observações',
      confirm: 'Preços e disponibilidade a confirmar com a unidade.',
      locationRequired: 'Escolha uma unidade para enviar o pedido.',
      noItems: 'Adicione pelo menos um produto antes de continuar.',
      centro: 'Unidade Centro',
      paraiso: 'Unidade Paraíso'
    },
    en: {
      added: name => name + ' added to your order.',
      removed: name => name + ' removed from your order.',
      cartLabel: count => 'Open cart, ' + count + (count === 1 ? ' item' : ' items'),
      increase: name => 'Increase quantity of ' + name,
      decrease: name => 'Decrease quantity of ' + name,
      remove: name => 'Remove ' + name + ' from your order',
      empty: 'Your cart is empty.',
      orderTitle: 'Order — Panificação Capricho',
      greeting: 'Hello, Panificação Capricho! I would like to place an order from the website.',
      location: 'Location',
      items: 'Order items:',
      customer: 'Name',
      notes: 'Notes',
      confirm: 'Prices and availability to be confirmed by the location.',
      locationRequired: 'Choose a location before sending the order.',
      noItems: 'Add at least one product before continuing.',
      centro: 'Centro location',
      paraiso: 'Paraíso location'
    }
  };
  const productNames = {
    'Tapiocas': 'Tapioca',
    'Cuscuz': 'Couscous',
    'Café da manhã': 'Breakfast',
    'Pães': 'Bread',
    'Salgados': 'Savory snacks',
    'Bolos': 'Cakes',
    'Cannoli': 'Cannoli',
    'Cupcakes': 'Cupcakes',
    'Donuts': 'Donuts',
    'Suco natural de laranja': 'Fresh orange juice'
  };
  const items = new Map();
  const launcher = $('#cart-launcher');
  const countEl = $('#cart-count');
  const totalEl = $('#cart-total-count');
  const backdrop = $('#cart-backdrop');
  const dialog = $('#cart-dialog');
  const closeButton = $('#cart-close');
  const continueButton = $('#cart-continue');
  const continueEmpty = $('#cart-continue-empty');
  const checkout = $('#cart-checkout');
  const itemList = $('#cart-items');
  const emptyPanel = $('#cart-empty');
  const unitSelect = $('#cart-unit');
  const nameInput = $('#cart-name');
  const notesInput = $('#cart-notes');
  const toast = $('#cart-toast');
  const sweetChoiceButtons = $$('[data-sweet-choice]');
  let priorFocus = null;
  let toastTimer = null;
  let lang = langNow();

  function icon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    return svg;
  }
  function itemName(key) {
    return lang === 'en' ? (productNames[key] || key) : key;
  }
  function totalQuantity() {
    let total = 0;
    items.forEach(item => total += item.quantity);
    return total;
  }
  function setCartLabel() {
    const total = totalQuantity();
    countEl.textContent = String(total);
    countEl.hidden = total === 0;
    launcher.setAttribute('aria-label', labels[lang].cartLabel(total));
    launcher.title = labels[lang].cartLabel(total);
  }
  function toastMessage(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2300);
  }
  function addItem(ptName, enName) {
    const id = ptName;
    if (items.has(id)) {
      items.get(id).quantity += 1;
    } else {
      items.set(id, { id, pt: ptName, en: enName || productNames[ptName] || ptName, quantity: 1 });
    }
    render();
    toastMessage(labels[lang].added(itemName(id)));
  }
  function createQtyButton(label, path, onClick, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'cart-qty';
    button.setAttribute('aria-label', label);
    button.appendChild(icon(path));
    button.addEventListener('click', onClick);
    return button;
  }
  function render() {
    const currentItems = Array.from(items.values());
    itemList.replaceChildren();
    emptyPanel.hidden = currentItems.length > 0;
    itemList.hidden = currentItems.length === 0;
    currentItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      const main = document.createElement('div');
      main.className = 'cart-item-main';
      const title = document.createElement('strong');
      title.textContent = itemName(item.pt);
      const sub = document.createElement('small');
      sub.textContent = lang === 'pt' ? 'Quantidade: ' + item.quantity : 'Quantity: ' + item.quantity;
      main.append(title, sub);
      const actions = document.createElement('div');
      actions.className = 'cart-item-actions';
      actions.appendChild(createQtyButton(labels[lang].decrease(itemName(item.pt)), 'M5 12h14', function () {
        item.quantity -= 1;
        if (item.quantity <= 0) items.delete(item.id);
        render();
      }));
      const quantity = document.createElement('span');
      quantity.className = 'cart-qty-number';
      quantity.textContent = String(item.quantity);
      actions.appendChild(quantity);
      actions.appendChild(createQtyButton(labels[lang].increase(itemName(item.pt)), 'M12 5v14M5 12h14', function () {
        item.quantity += 1;
        render();
      }));
      actions.appendChild(createQtyButton(labels[lang].remove(itemName(item.pt)), 'm6 6 12 12M18 6 6 18', function () {
        items.delete(item.id);
        render();
        toastMessage(labels[lang].removed(itemName(item.pt)));
      }, 'cart-remove'));
      row.append(main, actions);
      itemList.appendChild(row);
    });
    const total = totalQuantity();
    totalEl.textContent = String(total);
    checkout.disabled = total === 0;
    setCartLabel();
  }
  function showCart() {
    priorFocus = document.activeElement;
    backdrop.hidden = false;
    document.body.classList.add('cart-open');
    closeButton.focus();
  }
  function closeCart() {
    backdrop.hidden = true;
    document.body.classList.remove('cart-open');
    if (priorFocus && typeof priorFocus.focus === 'function') priorFocus.focus();
  }
  function openSweetPicker(button) {
    const card = button.closest('.product');
    const choices = $('.sweet-choices', card);
    if (!choices) return;
    const show = choices.hidden;
    $$('.sweet-choices').forEach(el => { el.hidden = true; });
    $$('[data-cart-sweets]').forEach(el => el.setAttribute('aria-expanded', 'false'));
    choices.hidden = !show;
    button.setAttribute('aria-expanded', String(show));
    if (show) choices.querySelector('button')?.focus();
  }
  function languageChanged(code) {
    lang = code === 'en' ? 'en' : 'pt';
    const placeholders = [nameInput, notesInput];
    placeholders.forEach(node => {
      const attr = node.getAttribute('data-placeholder-' + lang);
      if (attr) node.placeholder = attr;
    });
    closeButton.setAttribute('aria-label', lang === 'pt' ? 'Fechar pedido' : 'Close order');
    closeButton.title = lang === 'pt' ? 'Fechar pedido' : 'Close order';
    render();
  }

  launcher.addEventListener('click', showCart);
  closeButton.addEventListener('click', closeCart);
  continueButton.addEventListener('click', closeCart);
  continueEmpty.addEventListener('click', function () {
    closeCart();
    const products = $('#produtos');
    if (products) products.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  backdrop.addEventListener('click', function (event) {
    if (event.target === backdrop) closeCart();
  });
  document.addEventListener('keydown', function (event) {
    if (backdrop.hidden) return;
    if (event.key === 'Escape') {
      closeCart();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = $$('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]', dialog)
        .filter(el => !el.hidden && el.getAttribute('tabindex') !== '-1');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  $$('[data-cart-add]').forEach(button => {
    button.addEventListener('click', function () {
      const pt = button.getAttribute('data-cart-add');
      const en = button.getAttribute('data-cart-add-en');
      addItem(pt, en);
    });
  });
  $$('[data-cart-sweets]').forEach(button => {
    button.addEventListener('click', function () { openSweetPicker(button); });
  });
  sweetChoiceButtons.forEach(button => {
    button.addEventListener('click', function () {
      const pt = button.getAttribute('data-sweet-choice');
      const en = button.getAttribute('data-sweet-choice-en');
      const picker = button.closest('.sweet-choices');
      if (picker) picker.hidden = true;
      const trigger = button.closest('.product')?.querySelector('[data-cart-sweets]');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      addItem(pt, en);
    });
  });
  checkout.addEventListener('click', function () {
    if (!items.size) {
      toastMessage(labels[lang].noItems);
      return;
    }
    const unit = unitSelect.value;
    if (!unit) {
      unitSelect.reportValidity();
      unitSelect.focus();
      toastMessage(labels[lang].locationRequired);
      return;
    }
    const destination = unit === 'centro' ? '5582993292147' : '5582988198072';
    const unitName = labels[lang][unit === 'centro' ? 'centro' : 'paraiso'];
    const message = [
      labels[lang].greeting,
      labels[lang].location + ': ' + unitName,
      '',
      labels[lang].items,
      ...Array.from(items.values()).map(item => '• ' + itemName(item.pt) + ' — ' + item.quantity),
      nameInput.value.trim() ? labels[lang].customer + ': ' + nameInput.value.trim() : '',
      notesInput.value.trim() ? labels[lang].notes + ': ' + notesInput.value.trim() : '',
      '',
      labels[lang].confirm
    ].filter((line, index) => line !== '' || (index !== 2 && index !== 3));
    const url = 'https://wa.me/' + destination + '?text=' + encodeURIComponent(message.join('\n'));
    // Open WhatsApp from the user's direct click; no order is sent automatically.
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  document.addEventListener('change', function (event) {
    if (event.target.matches('[data-language]')) languageChanged(event.target.getAttribute('data-language'));
  });
  if (window.CaprichoCart) return;
  window.CaprichoCart = { setLanguage: languageChanged };
  render();
})();