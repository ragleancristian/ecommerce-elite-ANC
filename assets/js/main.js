/*=============== MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
  navToggle = document.getElementById('nav-toggle'),
  navClose = document.getElementById('nav-close');

if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
if (navClose) navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'));

document.querySelectorAll('.nav__link').forEach((link) =>
  link.addEventListener('click', () => navMenu && navMenu.classList.remove('show-menu'))
);

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
  const s = document.getElementById('scroll-up');
  if (s) window.scrollY >= 350 ? s.classList.add('show-scroll') : s.classList.remove('show-scroll');
};
window.addEventListener('scroll', scrollUp);

/*=============== PRODUCT DETAILS IMAGE ===============*/
document.querySelectorAll('.details__thumbs img').forEach((img) =>
  img.addEventListener('click', () => {
    const main = document.getElementById('main-product-img');
    if (main) main.src = img.dataset.img;
  })
);

/*=============== DETAILS QUANTITY BUTTONS ===============*/
document.querySelectorAll('[data-qty]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    let v = parseInt(input.value || 1, 10);
    input.value = btn.dataset.qty === 'plus' ? v + 1 : Math.max(1, v - 1);
  })
);

/*=============== SHOPPING CART ===============*/
const CART_KEY = 'elitecart_cart';

const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
const money = (value) => `$${Number(value || 0).toFixed(2)}`;


function ensureHeaderCounterStyles() {
  if (document.getElementById('elitecart-counter-styles')) return;

  const style = document.createElement('style');
  style.id = 'elitecart-counter-styles';
  style.textContent = `
    .nav__actions a { position: relative; }
    .elitecart-counter {
      position: absolute;
      top: -0.55rem;
      right: -0.65rem;
      min-width: 1.05rem;
      height: 1.05rem;
      padding: 0 .25rem;
      border-radius: 999px;
      background: #111;
      color: #fff;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: .68rem;
      font-weight: 700;
      line-height: 1;
      z-index: 5;
    }
    .elitecart-counter.is-visible { display: inline-flex; }
  `;
  document.head.appendChild(style);
}

function setHeaderCounter(linkSelector, count, attrName) {
  ensureHeaderCounterStyles();

  document.querySelectorAll(linkSelector).forEach((link) => {
    link.setAttribute(attrName, count);

    let badge = link.querySelector('.elitecart-counter');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'elitecart-counter';
      badge.setAttribute('aria-hidden', 'true');
      link.appendChild(badge);
    }

    badge.textContent = count > 99 ? '99+' : String(count);
    badge.classList.toggle('is-visible', Number(count) > 0);
  });
}

function productFromCard(button) {
  const card = button.closest('.product__card');
  if (!card) return null;

  const title = card.querySelector('.product__title')?.textContent.trim() || 'Product';
  const priceText = card.querySelector('.product__price')?.textContent || '$0';
  const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
  const img = card.querySelector('.product__img')?.getAttribute('src') || '';

  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title,
    price,
    img,
    qty: 1,
  };
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  updateCartCount();
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  renderCartPage();
  updateCartCount();
}

function changeCartQty(id, qty) {
  const cart = getCart();
  const item = cart.find((product) => product.id === id);
  if (!item) return;

  item.qty = Math.max(1, parseInt(qty, 10) || 1);
  saveCart(cart);
  renderCartPage();
  updateCartCount();
}

function clearCart() {
  saveCart([]);
  renderCartPage();
  updateCartCount();
}

function updateCartCount() {
  const totalQty = getCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
  setHeaderCounter('a[href="cart.html"]', totalQty, 'data-cart-count');
  document.querySelectorAll('a[href="cart.html"]').forEach((link) => {
    link.title = totalQty ? `${totalQty} produse în coș` : 'Cart';
  });
}

function renderCartPage() {
  const cartSection = document.querySelector('.cart');
  const tbody = document.querySelector('.cart tbody');
  if (!cartSection || !tbody) return;

  const cart = getCart();

  if (!cart.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 2rem;">
          Coșul este gol. <a href="shop.html">Mergi la magazin</a>.
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = cart
      .map(
        (item) => `
        <tr data-id="${item.id}">
          <td>
            <img src="${item.img}" alt="${item.title}">
            <span>${item.title}</span>
          </td>
          <td>${money(item.price)}</td>
          <td>
            <input class="cart-qty" type="number" value="${item.qty}" min="1" data-id="${item.id}">
          </td>
          <td>${money(item.price * item.qty)}</td>
          <td>
            <button class="cart-remove" data-id="${item.id}" aria-label="Șterge produsul">
              <i class="ri-delete-bin-line"></i>
            </button>
          </td>
        </tr>
      `
      )
      .join('');
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const summaryValues = document.querySelectorAll('.summary strong');
  if (summaryValues[0]) summaryValues[0].textContent = money(subtotal);
  if (summaryValues[1]) summaryValues[1].textContent = subtotal ? 'Free' : '$0.00';
  if (summaryValues[2]) summaryValues[2].textContent = money(subtotal);

  document.querySelectorAll('.cart-remove').forEach((btn) =>
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id))
  );

  document.querySelectorAll('.cart-qty').forEach((input) =>
    input.addEventListener('change', () => changeCartQty(input.dataset.id, input.value))
  );
}



/*=============== SHOP FILTERS + SORTING ===============*/
function setupShopFilters() {
  const shop = document.querySelector('.shop');
  const productsContainer = shop?.querySelector('.products__container');
  if (!shop || !productsContainer) return;

  const productCards = Array.from(productsContainer.querySelectorAll('.product__card'));
  const shopTopText = shop.querySelector('.shop__top p');
  const sortSelect = shop.querySelector('.shop__top select');
  const priceRange = shop.querySelector('.filters input[type="range"]');
  const categoryInputs = Array.from(shop.querySelectorAll('.filters label input[type="checkbox"]'));

  const productCategories = {
    'velvetbloom-midi-dress': ['fashion'],
    'short-denim-jacket': ['fashion'],
    'cloudfit-joggers': ['fashion'],
    'linen-resort-shirt': ['fashion'],
    'urban-white-sneaker': ['shoes'],
    'premium-travel-bag': ['accessories'],
    'classic-leather-watch': ['accessories'],
    'cozy-knit-hoodie': ['fashion'],
    'slim-fit-chinos': ['fashion'],
    'denim-outfit': ['fashion'],
    'minimalist-sunglasses': ['accessories'],
    'everyday-tote-bag': ['accessories'],
  };

  const getPrice = (card) => {
    const priceText = card.querySelector('.product__price')?.textContent || '0';
    return parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
  };

  const getTitle = (card) => card.querySelector('.product__title')?.textContent.trim() || '';
  const getId = (card) => getTitle(card).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  productCards.forEach((card, index) => {
    const id = getId(card);
    card.dataset.originalIndex = String(index);
    card.dataset.price = String(getPrice(card));
    card.dataset.newest = card.querySelector('.product__tag')?.textContent.trim().toLowerCase() === 'new' ? '1' : '0';
    card.dataset.categories = (productCategories[id] || ['fashion']).join(',');
  });

  let priceLabel = document.querySelector('.price-filter-value');
  if (priceRange && !priceLabel) {
    priceLabel = document.createElement('p');
    priceLabel.className = 'price-filter-value';
    priceLabel.style.marginTop = '.75rem';
    priceRange.insertAdjacentElement('afterend', priceLabel);
  }

  const getSelectedCategories = () =>
    categoryInputs
      .filter((input) => input.checked)
      .map((input) => input.parentElement.textContent.trim().toLowerCase());

  const applyShopControls = () => {
    const maxPrice = priceRange ? Number(priceRange.value || priceRange.max || 999999) : 999999;
    const selectedCategories = getSelectedCategories();
    const sortValue = sortSelect?.value.toLowerCase() || '';

    const sortedCards = [...productCards].sort((a, b) => {
      if (sortValue.includes('price')) return Number(a.dataset.price) - Number(b.dataset.price);
      if (sortValue.includes('newest')) {
        const newestDiff = Number(b.dataset.newest) - Number(a.dataset.newest);
        if (newestDiff) return newestDiff;
        return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
      }
      return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
    });

    sortedCards.forEach((card) => productsContainer.appendChild(card));

    let visibleCount = 0;
    productCards.forEach((card) => {
      const price = Number(card.dataset.price || 0);
      const categories = (card.dataset.categories || '').split(',');
      const matchesPrice = price <= maxPrice;
      const matchesCategory = !selectedCategories.length || selectedCategories.some((category) => categories.includes(category));
      const show = matchesPrice && matchesCategory;

      card.style.display = show ? '' : 'none';
      if (show) visibleCount += 1;
    });

    if (priceLabel && priceRange) priceLabel.textContent = `Max price: ${money(maxPrice)}`;
    if (shopTopText) shopTopText.textContent = `Showing ${visibleCount} product${visibleCount === 1 ? '' : 's'}`;
  };

  priceRange?.addEventListener('input', applyShopControls);
  sortSelect?.addEventListener('change', applyShopControls);
  categoryInputs.forEach((input) => input.addEventListener('change', applyShopControls));

  applyShopControls();
}

/*=============== WISHLIST ===============*/
const WISHLIST_KEY = 'elitecart_wishlist';

const getWishlist = () => JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
const saveWishlist = (wishlist) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));

function updateWishlistCount() {
  const count = getWishlist().length;
  setHeaderCounter('a[href="wishlist.html"]', count, 'data-wishlist-count');
  document.querySelectorAll('a[href="wishlist.html"]').forEach((link) => {
    link.title = count ? `${count} produse în wishlist` : 'Wishlist';
  });
}

function isWishlistButton(button) {
  return !!button.querySelector('.ri-heart-line, .ri-heart-fill');
}

function getWishlistButton(card) {
  return Array.from(card.querySelectorAll('.product__actions button')).find(isWishlistButton);
}

function setWishlistButtonState(button, active) {
  if (!button) return;
  const icon = button.querySelector('i');
  if (icon) {
    icon.classList.toggle('ri-heart-line', !active);
    icon.classList.toggle('ri-heart-fill', active);
  }
  button.classList.toggle('active', active);
  button.title = active ? 'Remove from wishlist' : 'Add to wishlist';
  button.setAttribute('aria-label', active ? 'Remove from wishlist' : 'Add to wishlist');
}

function addToWishlist(product) {
  const wishlist = getWishlist();
  if (!wishlist.some((item) => item.id === product.id)) {
    wishlist.push({ ...product, qty: 1 });
    saveWishlist(wishlist);
  }
  updateWishlistCount();
}

function removeFromWishlist(id) {
  const wishlist = getWishlist().filter((item) => item.id !== id);
  saveWishlist(wishlist);
  renderWishlistPage();
  refreshWishlistButtons();
  updateWishlistCount();
}

function toggleWishlist(product) {
  const wishlist = getWishlist();
  const exists = wishlist.some((item) => item.id === product.id);

  if (exists) {
    removeFromWishlist(product.id);
    return false;
  }

  addToWishlist(product);
  refreshWishlistButtons();
  return true;
}

function refreshWishlistButtons() {
  const wishlistIds = getWishlist().map((item) => item.id);
  document.querySelectorAll('.product__card').forEach((card) => {
    const title = card.querySelector('.product__title')?.textContent.trim() || '';
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setWishlistButtonState(getWishlistButton(card), wishlistIds.includes(id));
  });
}

function renderWishlistPage() {
  const wishlistSection = document.querySelector('.banner h1')?.textContent.trim().toLowerCase() === 'wishlist';
  const container = document.querySelector('main .products__container');
  if (!wishlistSection || !container) return;

  const wishlist = getWishlist();

  if (!wishlist.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 2rem;">
        Wishlist-ul este gol. <a href="shop.html">Mergi la magazin</a> ca să adaugi produse.
      </div>
    `;
    return;
  }

  container.innerHTML = wishlist
    .map(
      (item) => `
      <article class="product__card" data-id="${item.id}">
        <a href="details.html" class="product__img-wrap">
          <img src="${item.img}" alt="${item.title}" class="product__img">
        </a>
        <div class="product__actions">
          <button class="wishlist-remove" data-id="${item.id}" title="Remove from wishlist" aria-label="Remove from wishlist"><i class="ri-heart-fill"></i></button>
          <button><i class="ri-eye-line"></i></button>
        </div>
        <h3 class="product__title">${item.title}</h3>
        <div class="product__footer">
          <span class="product__price">${money(item.price)}</span>
          <button class="product__btn">Add to Cart</button>
        </div>
      </article>
    `
    )
    .join('');

  container.querySelectorAll('.wishlist-remove').forEach((btn) => {
    btn.addEventListener('click', () => removeFromWishlist(btn.dataset.id));
  });

  container.querySelectorAll('.product__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = productFromCard(btn);
      if (!product) return;
      addToCart(product);
      const oldText = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(() => (btn.textContent = oldText || 'Add to Cart'), 1200);
    });
  });
}

function setupWishlistButtons() {
  document.querySelectorAll('.product__card').forEach((card) => {
    const btn = getWishlistButton(card);
    if (!btn || btn.classList.contains('wishlist-ready')) return;

    btn.classList.add('wishlist-ready');
    btn.addEventListener('click', () => {
      const product = productFromCard(btn);
      if (!product) return;
      const active = toggleWishlist(product);
      setWishlistButtonState(btn, active);
    });
  });

  refreshWishlistButtons();
}

/* Add products from shop/home/wishlist cards */
document.querySelectorAll('.product__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const product = productFromCard(btn);
    if (!product) return;

    addToCart(product);
    const oldText = btn.textContent;
    btn.textContent = 'Added ✓';
    setTimeout(() => (btn.textContent = oldText || 'Add to Cart'), 1200);
  });
});

/* Optional: clear cart if a button/link with data-clear-cart is added later */
document.querySelectorAll('[data-clear-cart]').forEach((btn) =>
  btn.addEventListener('click', clearCart)
);

setupShopFilters();
renderWishlistPage();
setupWishlistButtons();
updateWishlistCount();
renderCartPage();
updateCartCount();
