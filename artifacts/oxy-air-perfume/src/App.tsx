import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Instagram, Menu, Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import oxyLogo from '@assets/3142d298-af27-41d9-87f9-e790964b6747_1788717723123.jpeg';
import productImage0 from '@assets/0_5b9f1036-0883-446b-9940-6c7979cc2d9a_1788718963632.jpeg';
import productImage1 from '@assets/1_251619fc-1610-44aa-9e14-b843ca7105be_1788718963636.jpeg';
import productImage2 from '@assets/2_5d1413b5-30f5-4b92-ae3a-14942c61ae07_1788718963636.jpeg';
import productImage3 from '@assets/3_6f0d66c9-e203-4cee-bfe9-55f0bf4217e7_1788718963636.jpeg';
import productImage4 from '@assets/4_7fb0f374-a450-405a-b6b9-43547fb3cf93_1788718963636.jpeg';
import productImage5 from '@assets/5_84e09b8a-ab85-4b31-ad41-8d99a039482a_1788718963636.jpeg';
import productImage6 from '@assets/6_1d7eb4bc-8f87-4b5e-b86c-d0bea790f890_1788718963636.jpeg';
import productImage7 from '@assets/7_174e207c-118d-41c0-ad37-eebb1ab8ae3c_1788718963636.jpeg';
import productImage8 from '@assets/8_5f243dfe-b51e-456f-9786-6aa530de4b9c_1788718963636.jpeg';
import productImage9 from '@assets/9_7220562e-4303-4691-8d49-c70b70fd9174_1788718963637.jpeg';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

type Product = {
  id: string;
  number: string;
  name: string;
  latin: string;
  notes: string;
  price: number | null;
  color: string;
  image: string;
};

type PricedProduct = Product & { price: number };
type CartItem = PricedProduct & { quantity: number };

// Product prices are intentionally centralized here for easy future editing.
// Product names and prices are intentionally blank until the catalog details are provided.
const PRODUCTS: Product[] = [
  { id: 'product-01', number: '01', name: '', latin: '', notes: '', price: null, color: 'sage', image: productImage0 },
  { id: 'product-02', number: '02', name: '', latin: '', notes: '', price: null, color: 'amber', image: productImage1 },
  { id: 'product-03', number: '03', name: '', latin: '', notes: '', price: null, color: 'plum', image: productImage2 },
  { id: 'product-04', number: '04', name: '', latin: '', notes: '', price: null, color: 'sage', image: productImage3 },
  { id: 'product-05', number: '05', name: '', latin: '', notes: '', price: null, color: 'amber', image: productImage4 },
  { id: 'product-06', number: '06', name: '', latin: '', notes: '', price: null, color: 'plum', image: productImage5 },
  { id: 'product-07', number: '07', name: '', latin: '', notes: '', price: null, color: 'sage', image: productImage6 },
  { id: 'product-08', number: '08', name: '', latin: '', notes: '', price: null, color: 'amber', image: productImage7 },
  { id: 'product-09', number: '09', name: '', latin: '', notes: '', price: null, color: 'plum', image: productImage8 },
  { id: 'product-10', number: '10', name: '', latin: '', notes: '', price: null, color: 'sage', image: productImage9 },
];

// WhatsApp number for orders — update here if the customer service line changes.
const WHATSAPP_NUMBER = '9647756344191';

const formatIQD = (value: number) => `${new Intl.NumberFormat('ar-IQ').format(value)} د.ع`;

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal();
  return <div ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`}>{children}</div>;
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sent, setSent] = useState(false);
  const [checkout, setCheckout] = useState({ name: '', phone: '', address: '', city: '', notes: '' });

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0), [cart]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  const addToCart = (product: Product) => {
    if (product.price === null) return;
    const pricedProduct = product as PricedProduct;
    setCart((current) => {
      const existing = current.find((item) => item.id === pricedProduct.id);
      if (existing) return current.map((item) => item.id === pricedProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...pricedProduct, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  };

  const handleOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length || !checkout.name || !checkout.phone || !checkout.address || !checkout.city) return;
    const orderLines = cart.map((item) => `• ${item.name} (${item.latin}) × ${item.quantity} — ${formatIQD(item.price * item.quantity)}`).join('\n');
    const message = [
      'مرحباً OXY، أود تأكيد طلبي:',
      '',
      orderLines,
      '',
      `المجموع: ${formatIQD(cartTotal)}`,
      `الاسم: ${checkout.name}`,
      `الهاتف: ${checkout.phone}`,
      `المحافظة / المدينة: ${checkout.city}`,
      `العنوان بالتفصيل: ${checkout.address}`,
      'طريقة الدفع: كاش عند الاستلام',
      checkout.notes ? `ملاحظات: ${checkout.notes}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    setSent(true);
    setCart([]);
  };

  return (
    <div className="oxy-app">
      <div className="topbar">التوصيل داخل بغداد مجاني للطلبات فوق <strong>١٠٠,٠٠٠ د.ع</strong></div>
      <header className="nav">
        <button className="icon-button menu-button" aria-label="فتح القائمة" data-testid="button-menu" onClick={() => setMobileMenu((value) => !value)}>
          <Menu size={17} strokeWidth={1.3} />
        </button>
        <nav className={`nav-links ${mobileMenu ? 'mobile-open' : ''}`} aria-label="التنقل الرئيسي">
          <a href="#collection" data-testid="link-collection" onClick={() => goTo('collection')}>المجموعة</a>
          <a href="#story" data-testid="link-story" onClick={() => goTo('story')}>طريقة الطلب</a>
          <a href="#notes" data-testid="link-notes" onClick={() => goTo('notes')}>تفاصيل المنتج</a>
          <a href="#contact" data-testid="link-contact" onClick={() => goTo('contact')}>التواصل</a>
        </nav>
        <button className="icon-button cart-button" aria-label="فتح السلة" data-testid="button-open-cart" onClick={() => setCartOpen(true)}>
          <ShoppingBag size={17} strokeWidth={1.3} />
          {cartCount > 0 && <span className="cart-count" data-testid="text-cart-count">{cartCount}</span>}
        </button>
        <button className="nav-brand" aria-label="العودة إلى البداية" data-testid="button-home" onClick={() => goTo('home')}>
          <img src={oxyLogo} alt="شعار OXY" className="nav-logo" />
        </button>
      </header>

      <main>
        <section className="hero container" id="home">
          <Reveal className="hero-copy">
            <div className="hero-english">OXY AIR PERFUME</div>
            <h1>عطور OXY<br /><span>للاستخدام اليومي</span></h1>
            <p className="hero-description">اختر المنتج من القائمة، راجع الصورة والرقم والسعر، ثم أضفه إلى السلة وأرسل بيانات الطلب عبر WhatsApp.</p>
            <div className="hero-cta">
              <button className="button-primary" data-testid="button-explore-collection" onClick={() => goTo('collection')}>عرض المنتجات</button>
              <button className="button-ghost" data-testid="button-read-story" onClick={() => goTo('story')}>طريقة الطلب <ArrowLeft size={14} strokeWidth={1.4} /></button>
            </div>
          </Reveal>
          <Reveal className="hero-mark reveal-delay-2">
            <div className="halo" />
            <img src={oxyLogo} alt="علامة OXY الذهبية" className="hero-logo-image" />
            <div className="hero-side-note">عطور · 50 مل · الدفع عند الاستلام</div>
          </Reveal>
          <div className="scroll-note"><i /> انتقل إلى المنتجات</div>
        </section>

        <section className="intro-section">
          <div className="container intro-grid">
            <Reveal className="intro-copy">
              <strong>معلومات سريعة</strong>
              منتجات OXY عطور للاستخدام اليومي والمناسبات. كل بطاقة توضح صورة المنتج ورقمه وسعره. المنتج الذي لا يحتوي على سعر يبقى غير متاح للطلب حتى يتم تحديث بياناته.
            </Reveal>
            <Reveal className="intro-statement reveal-delay-1">
              اختر المنتج،<br />ثم أرسل الطلب.
            </Reveal>
          </div>
        </section>

        <section className="collection" id="collection">
          <div className="container">
            <Reveal className="section-top">
              <div>
                <SectionEyebrow>PRODUCTS · OXY</SectionEyebrow>
                <h2 className="section-heading">منتجات OXY<br /><span className="gold">المتاحة حالياً</span></h2>
              </div>
              <p className="section-intro">اختر المنتج المناسب لك. اضغط زر الإضافة بعد إدخال الاسم والسعر حتى يصبح المنتج جاهزاً للطلب.</p>
              <span className="collection-index">01 — 10</span>
            </Reveal>
            <div className="products-grid">
              {PRODUCTS.map((product, index) => (
                <Reveal key={product.id} className={index === 1 ? 'reveal-delay-1' : index === 2 ? 'reveal-delay-2' : ''}>
                  <article className="product-card" data-testid={`card-product-${product.id}`}>
                    <div className={`product-art ${product.color}`} data-testid={`img-product-${product.id}`}>
                      <img className="product-photo" src={product.image} alt={product.name ? `صورة ${product.name}` : `صورة المنتج رقم ${product.number}`} />
                    </div>
                    <div className="product-info">
                      <span className="product-number">{product.number}</span>
                      <h3 className="product-name">{product.name || '\u00a0'} {product.latin && <span className="product-latin">{product.latin}</span>}</h3>
                      <p className="product-notes">{product.notes || '\u00a0'}</p>
                      <div className="product-bottom">
                        <span className={`price ${product.price === null ? 'price-pending' : ''}`} data-testid={`text-price-${product.id}`}>{product.price === null ? 'السعر يحدد لاحقاً' : formatIQD(product.price)} {product.price !== null && <small>50 مل</small>}</span>
                        <button className="add-button" aria-label={product.price === null ? 'السعر غير محدد بعد' : `أضف ${product.name} إلى السلة`} data-testid={`button-add-${product.id}`} onClick={() => addToCart(product)} disabled={product.price === null}>
                          <Plus size={16} strokeWidth={1.3} />
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="notes-section" id="notes">
          <div className="container notes-layout">
            <Reveal className="notes-wheel">
              <div className="wheel-center">OXY<small>معلومات المنتج</small></div>
              <div className="note-item note-top"><b>50 مل</b>حجم العبوة</div>
              <div className="note-item note-right"><b>عطر</b>نوع المنتج</div>
              <div className="note-item note-bottom"><b>واتساب</b>طريقة الطلب</div>
              <div className="note-item note-left"><b>كاش</b>طريقة الدفع</div>
            </Reveal>
            <Reveal className="notes-copy">
              <SectionEyebrow>PRODUCT DETAILS</SectionEyebrow>
              <h2 className="section-heading">معلومات<br /><span className="gold">عملية للطلب.</span></h2>
              <h3>قبل الإضافة إلى السلة</h3>
              <p>تأكد من ظهور اسم المنتج وسعره. المنتجات التي لا تحتوي على سعر ستبقى غير قابلة للإضافة حتى يتم تحديث البيانات.</p>
              <div className="notes-list">
                {['حجم العبوة: 50 مل', 'الدفع: عند الاستلام', 'الطلب: عبر WhatsApp', 'التوصيل: داخل العراق'].map((note) => <span className="note-pill" key={note}>{note}</span>)}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="story" id="story">
          <div className="container story-grid">
            <Reveal className="story-mark">
              {/* Brand image detail: the supplied mark remains until a dedicated atelier still-life is commissioned. */}
              <img src={oxyLogo} alt="شعار بيت العطر OXY" />
            </Reveal>
            <Reveal className="story-copy reveal-delay-1">
              <SectionEyebrow>ORDER INFORMATION</SectionEyebrow>
              <h2 className="section-heading">طريقة<br /><span className="gold">الطلب.</span></h2>
              <p>اختر المنتج، اضغط زر الإضافة، عدّل الكمية من السلة، ثم املأ الاسم ورقم الهاتف والمحافظة والعنوان. بعد الإرسال ستفتح رسالة WhatsApp جاهزة بالمعلومات المطلوبة.</p>
              <div className="story-details">
                <div><strong>١</strong><span>اختر المنتج</span></div>
                <div><strong>٢</strong><span>أضف إلى السلة</span></div>
                <div><strong>٣</strong><span>أرسل الطلب</span></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="testimonials">
          <div className="container">
            <Reveal className="testimonials-top">
              <div>
                <SectionEyebrow>PRODUCT USE</SectionEyebrow>
                <h2 className="section-heading">الاستخدام<br /><span className="gold">والتوصيل.</span></h2>
              </div>
              <p className="section-intro">معلومات مختصرة تساعدك على إكمال الطلب قبل التواصل مع فريق OXY.</p>
            </Reveal>
            <div className="quote-grid">
              <Reveal><figure className="quote"><blockquote className="quote-text">أدخل بياناتك الصحيحة حتى يتم التواصل معك لتأكيد الطلب.</blockquote><small>بيانات العميل</small></figure></Reveal>
              <Reveal className="reveal-delay-1"><figure className="quote featured"><blockquote className="quote-text">الدفع عند الاستلام، ولا تحتاج إلى إدخال بيانات بطاقة.</blockquote><small>طريقة الدفع</small></figure></Reveal>
              <Reveal className="reveal-delay-2"><figure className="quote"><blockquote className="quote-text">يتم تحديد وقت التوصيل حسب المحافظة والعنوان المسجل في الطلب.</blockquote><small>التوصيل</small></figure></Reveal>
            </div>
          </div>
        </section>

      </main>

      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src={oxyLogo} alt="OXY Air Perfume" className="footer-logo" />
              <p className="footer-copy">صفحة عرض وطلب لعطور OXY. اختر المنتج، راجع السعر، وأرسل الطلب عبر WhatsApp.</p>
            </div>
            <div><h4>روابط عملية</h4><ul><li><a href="#collection" data-testid="link-footer-collection">المنتجات</a></li><li><a href="#story" data-testid="link-footer-story">طريقة الطلب</a></li><li><a href="#notes" data-testid="link-footer-notes">تفاصيل المنتج</a></li></ul></div>
            <div><h4>للطلب</h4><div className="footer-contact"><strong>واتساب</strong><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" data-testid="link-whatsapp">+964 775 634 4191</a><strong style={{ marginTop: 12 }}>بغداد · العراق</strong><span>الدفع عند الاستلام</span></div></div>
            <div><h4>التواصل</h4><ul><li><a href="https://instagram.com" target="_blank" rel="noreferrer" data-testid="link-instagram"><Instagram size={14} strokeWidth={1.3} /> @oxy.air.perfume</a></li><li><a href="mailto:hello@oxyairperfume.com" data-testid="link-email">البريد الإلكتروني</a></li></ul></div>
          </div>
          <div className="footer-bottom"><span>© OXY AIR PERFUME · جميع الحقوق محفوظة.</span><span>معلومات الطلب والتوصيل داخل الموقع</span></div>
        </div>
      </footer>

      <div className={`drawer-backdrop ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} aria-hidden="true" />
      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} aria-label="سلة المشتريات" aria-hidden={!cartOpen}>
        <div className="drawer-head"><h2>{sent ? 'تم إرسال الطلب' : 'سلة المنتجات'}</h2><button className="close-button" aria-label="إغلاق السلة" data-testid="button-close-cart" onClick={() => setCartOpen(false)}><X size={20} strokeWidth={1.2} /></button></div>
        {sent ? (
          <div className="thank-you">
            <div className="check"><Check size={24} strokeWidth={1.3} /></div>
            <h2>تم إرسال الطلب.</h2>
            <p>تم فتح WhatsApp برسالة الطلب. سيتواصل معك الفريق لتأكيد التوفر والتوصيل.</p>
            <button className="button-primary" data-testid="button-continue-shopping" onClick={() => { setSent(false); setCartOpen(false); }}>العودة إلى المنتجات</button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.length === 0 ? <div className="cart-empty" data-testid="text-empty-cart">لا توجد منتجات في السلة.<br /><small>أضف منتجاً بعد ظهور السعر.</small></div> : cart.map((item) => (
                <div className="cart-item" key={item.id} data-testid={`row-cart-item-${item.id}`}>
                   <div className="cart-thumb"><img src={item.image} alt="" /></div>
                  <div><h3>{item.name} <span className="product-latin">{item.latin}</span></h3><p>{formatIQD(item.price)} للزجاجة</p><div className="qty-controls"><button aria-label={`إنقاص كمية ${item.name}`} data-testid={`button-decrease-${item.id}`} onClick={() => changeQuantity(item.id, -1)}><Minus size={12} /></button><span data-testid={`text-quantity-${item.id}`}>{item.quantity}</span><button aria-label={`زيادة كمية ${item.name}`} data-testid={`button-increase-${item.id}`} onClick={() => changeQuantity(item.id, 1)}><Plus size={12} /></button></div></div>
                  <div className="cart-item-price">{formatIQD(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="drawer-summary">
              <div className="summary-row"><span>المجموع الكلي</span><strong data-testid="text-cart-total">{formatIQD(cartTotal)}</strong></div>
              {cart.length > 0 && <form className="checkout-form" onSubmit={handleOrder}>
                <label>الاسم الكامل<input value={checkout.name} onChange={(event) => setCheckout({ ...checkout, name: event.target.value })} placeholder="مثال: نور الهدى" data-testid="input-checkout-name" required /></label>
                <label>رقم الهاتف<input type="tel" value={checkout.phone} onChange={(event) => setCheckout({ ...checkout, phone: event.target.value })} placeholder="07xx xxx xxxx" data-testid="input-checkout-phone" required /></label>
                <label>المحافظة / المدينة<select value={checkout.city} onChange={(event) => setCheckout({ ...checkout, city: event.target.value })} data-testid="select-checkout-city" required><option value="">اختر المحافظة</option><option>بغداد</option><option>البصرة</option><option>أربيل</option><option>النجف</option><option>كربلاء</option><option>الموصل</option><option>أخرى</option></select></label>
                <label>العنوان بالتفصيل<textarea value={checkout.address} onChange={(event) => setCheckout({ ...checkout, address: event.target.value })} placeholder="المنطقة، الشارع، أقرب نقطة دالة" data-testid="input-checkout-address" required /></label>
                <label>ملاحظات إضافية <span style={{ color: '#70685e' }}>(اختياري)</span><textarea value={checkout.notes} onChange={(event) => setCheckout({ ...checkout, notes: event.target.value })} placeholder="وقت التوصيل المفضل..." data-testid="input-checkout-notes" /></label>
                <button type="submit" className="button-primary" data-testid="button-submit-order"><ShoppingBag size={14} /> اطلب عبر واتساب</button>
              </form>}
              <p className="drawer-footnote"><Sparkles size={11} /> الدفع عند الاستلام · التوصيل حسب المحافظة</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={Home} />
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;