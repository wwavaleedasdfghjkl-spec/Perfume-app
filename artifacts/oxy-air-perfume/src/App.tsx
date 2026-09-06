import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Instagram, Menu, Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import oxyLogo from '@assets/3142d298-af27-41d9-87f9-e790964b6747_1788717723123.jpeg';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

type Product = {
  id: string;
  number: string;
  name: string;
  latin: string;
  notes: string;
  price: number;
  color: string;
};

type CartItem = Product & { quantity: number };

// Product prices are intentionally centralized here for easy future editing.
const PRODUCTS: Product[] = [
  { id: 'sahar', number: '01', name: 'سَحَر', latin: 'SAHAR', notes: 'زعفران · عنبر · خشب الصندل', price: 85000, color: 'sage' },
  { id: 'athir', number: '02', name: 'أثير', latin: 'ATHIR', notes: 'ورد طائفي · لبان · مسك أبيض', price: 78000, color: 'amber' },
  { id: 'layl', number: '03', name: 'لَيْل', latin: 'LAYL', notes: 'عود كمبودي · فانيلا · جلد ناعم', price: 92000, color: 'plum' },
];

// WhatsApp number for orders — update here if the customer service line changes.
const WHATSAPP_NUMBER = '9647740960015';

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
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [checkout, setCheckout] = useState({ name: '', phone: '', address: '', city: '', notes: '' });

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, quantity: 1 }];
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
      checkout.notes ? `ملاحظات: ${checkout.notes}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    setSent(true);
    setCart([]);
  };

  const handleNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSent(true);
    setNewsletterEmail('');
  };

  return (
    <div className="oxy-app">
      <div className="topbar">توصيل مجاني داخل بغداد للطلبات فوق <strong>١٠٠,٠٠٠ د.ع</strong></div>
      <header className="nav">
        <button className="icon-button menu-button" aria-label="فتح القائمة" data-testid="button-menu" onClick={() => setMobileMenu((value) => !value)}>
          <Menu size={17} strokeWidth={1.3} />
        </button>
        <nav className={`nav-links ${mobileMenu ? 'mobile-open' : ''}`} aria-label="التنقل الرئيسي">
          <a href="#collection" data-testid="link-collection" onClick={() => goTo('collection')}>المجموعة</a>
          <a href="#story" data-testid="link-story" onClick={() => goTo('story')}>حكاية OXY</a>
          <a href="#notes" data-testid="link-notes" onClick={() => goTo('notes')}>عائلة العطر</a>
          <a href="#contact" data-testid="link-contact" onClick={() => goTo('contact')}>تواصل معنا</a>
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
            <div className="hero-english">IRAQI FRAGRANCE ATELIER</div>
            <h1>أثرٌ لا<br /><span>يُنسى</span></h1>
            <p className="hero-description">عطور وُلدت من صمت الليل، من دفء الخشب، ومن أثر الطبيعة حين تلامس الروح. اكتشف عطرك كما لو أنك تكتشف مكاناً تعرفه للمرة الأولى.</p>
            <div className="hero-cta">
              <button className="button-primary" data-testid="button-explore-collection" onClick={() => goTo('collection')}>اكتشف المجموعة</button>
              <button className="button-ghost" data-testid="button-read-story" onClick={() => goTo('story')}>حكاية العطر <ArrowLeft size={14} strokeWidth={1.4} /></button>
            </div>
          </Reveal>
          <Reveal className="hero-mark reveal-delay-2">
            <div className="halo" />
            <img src={oxyLogo} alt="علامة OXY الذهبية" className="hero-logo-image" />
            <div className="hero-side-note">صُنع في العراق · MADE WITH PATIENCE</div>
          </Reveal>
          <div className="scroll-note"><i /> مرّر لتدخل الأثر</div>
        </section>

        <section className="intro-section">
          <div className="container intro-grid">
            <Reveal className="intro-copy">
              <strong>ليس عطراً. بل حضور.</strong>
              في OXY، نؤمن أن العطر لا يسبقك ولا يختبئ خلفك. إنه المسافة الهادئة بينك وبين العالم. نصنع تركيبات قليلة، عميقة، تترك مجالاً للخيال.
            </Reveal>
            <Reveal className="intro-statement reveal-delay-1">
              حين يهدأ كل شيء،<br />يبقى <em>الأثر.</em>
            </Reveal>
          </div>
        </section>

        <section className="collection" id="collection">
          <div className="container">
            <Reveal className="section-top">
              <div>
                <SectionEyebrow>THE COLLECTION · 2024</SectionEyebrow>
                <h2 className="section-heading">ثلاثة أوجه<br /><span className="gold">للحضور</span></h2>
              </div>
              <p className="section-intro">روائح تُلبس مثل ذكرى. كل زجاجة تركيبة محدودة، مصمّمة لتصبح جزءاً من حكايتك لا كل الحكاية.</p>
              <span className="collection-index">01 — 03</span>
            </Reveal>
            <div className="products-grid">
              {PRODUCTS.map((product, index) => (
                <Reveal key={product.id} className={index === 1 ? 'reveal-delay-1' : index === 2 ? 'reveal-delay-2' : ''}>
                  <article className="product-card" data-testid={`card-product-${product.id}`}>
                    {/* Product image placeholder: swap this CSS bottle composition for real product photography later. */}
                    <div className={`product-art ${product.color}`} data-testid={`img-product-placeholder-${product.id}`}>
                      <div className="bottle" aria-label={`تصوير تجريدي لزجاجة ${product.name}`} />
                    </div>
                    <div className="product-info">
                      <span className="product-number">{product.number}</span>
                      <h3 className="product-name">{product.name} <span className="product-latin">{product.latin}</span></h3>
                      <p className="product-notes">{product.notes}</p>
                      <div className="product-bottom">
                        <span className="price" data-testid={`text-price-${product.id}`}>{formatIQD(product.price)} <small>50 مل</small></span>
                        <button className="add-button" aria-label={`أضف ${product.name} إلى السلة`} data-testid={`button-add-${product.id}`} onClick={() => addToCart(product)}>
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
              <div className="wheel-center">OXY<small>عائلة الروائح</small></div>
              <div className="note-item note-top"><b>ورد</b>قلب ناعم</div>
              <div className="note-item note-right"><b>عود</b>عمق دافئ</div>
              <div className="note-item note-bottom"><b>عنبر</b>وهج خافت</div>
              <div className="note-item note-left"><b>مسك</b>قرب حميم</div>
            </Reveal>
            <Reveal className="notes-copy">
              <SectionEyebrow>THE OLFACTIVE MAP</SectionEyebrow>
              <h2 className="section-heading">الطبيعة،<br /><span className="gold">بصوت خافت.</span></h2>
              <h3>من الأرض إلى الجلد</h3>
              <p>نختار نفحاتنا كما يختار الخطاط نقطة الحبر: ببطء، وبنية واضحة. زعفران من ذاكرة الشرق، أخشاب داكنة، وورد يفتح نافذته في آخر الليل.</p>
              <div className="notes-list">
                {['زعفران', 'لبان', 'خشب الصندل', 'ورد طائفي', 'عود', 'مسك أبيض'].map((note) => <span className="note-pill" key={note}>{note}</span>)}
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
              <SectionEyebrow>OUR HOUSE · BAGHDAD</SectionEyebrow>
              <h2 className="section-heading">صُنع هنا.<br /><span className="gold">ليُحكى هناك.</span></h2>
              <p>بدأت OXY من رغبة بسيطة: أن تكون للعطر العراقي لغة معاصرة، لا تتنازل عن جذوره ولا تشرح نفسها كثيراً. من بغداد، نخلط ونختبر ونترك للزمن مهمته — حتى تصبح الرائحة بيتاً صغيراً على جلدك.</p>
              <div className="story-details">
                <div><strong>٢٠٢١</strong><span>سنة التأسيس</span></div>
                <div><strong>٠٣</strong><span>تركيبات أساسية</span></div>
                <div><strong>١٠٠٪</strong><span>شغف محلي</span></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="testimonials">
          <div className="container">
            <Reveal className="testimonials-top">
              <div>
                <SectionEyebrow>NOTES FROM YOU</SectionEyebrow>
                <h2 className="section-heading">حين يصبح<br /><span className="gold">العطر ذاكرة.</span></h2>
              </div>
              <p className="section-intro">أجمل ما في OXY هو ما يضيفه الناس إليها. هذه بعض الكلمات التي عادت إلينا.</p>
            </Reveal>
            <div className="quote-grid">
              <Reveal><figure className="quote"><div className="quote-stars">✦ ✦ ✦ ✦ ✦</div><blockquote className="quote-text">«سَحَر هادئ بطريقة غريبة. وضعته في الصباح، وبقي معي كأنه سر صغير حتى المساء.»</blockquote><small>— زهراء، بغداد</small></figure></Reveal>
              <Reveal className="reveal-delay-1"><figure className="quote featured"><div className="quote-stars">✦ ✦ ✦ ✦ ✦</div><blockquote className="quote-text">«رائحة تشبه بيت جدتي، لكن ببدلة سوداء.»</blockquote><small>— عمر، أربيل</small></figure></Reveal>
              <Reveal className="reveal-delay-2"><figure className="quote"><div className="quote-stars">✦ ✦ ✦ ✦ ✦</div><blockquote className="quote-text">«أخيراً عطر عربي لا يملأ الغرفة. يترك أثراً، وهذا أجمل.»</blockquote><small>— ليان، البصرة</small></figure></Reveal>
            </div>
          </div>
        </section>

        <section className="newsletter">
          <div className="container">
            <Reveal className="newsletter-inner">
              <div className="newsletter-copy">
                <SectionEyebrow>THE OXY LETTER</SectionEyebrow>
                <h2>رسائل برائحة بعيدة.</h2>
                <p>إصداراتنا الصغيرة، حكايات النفحات، وما لا ننشره في أي مكان آخر.</p>
              </div>
              {newsletterSent ? (
                <div className="newsletter-success" data-testid="status-newsletter-success">وصلت رسالتك. سنبقى قريبين.</div>
              ) : (
                <form className="newsletter-form" onSubmit={handleNewsletter}>
                  <input type="email" aria-label="البريد الإلكتروني" placeholder="بريدك الإلكتروني" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} data-testid="input-newsletter-email" required />
                  <button type="submit" data-testid="button-newsletter-submit">انضم <ArrowLeft size={14} /></button>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src={oxyLogo} alt="OXY Air Perfume" className="footer-logo" />
              <p className="footer-copy">بيت عطور عراقي معاصر. نصنع أثراً هادئاً، ونترك لك مساحة لتكتب الباقي.</p>
            </div>
            <div><h4>استكشف</h4><ul><li><a href="#collection" data-testid="link-footer-collection">المجموعة</a></li><li><a href="#story" data-testid="link-footer-story">حكاية OXY</a></li><li><a href="#notes" data-testid="link-footer-notes">عائلة العطر</a></li></ul></div>
            <div><h4>اتصل بنا</h4><div className="footer-contact"><strong>واتساب</strong><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" data-testid="link-whatsapp">+964 774 096 0015</a><strong style={{ marginTop: 12 }}>بغداد · العراق</strong><span>يومياً، ١٠ ص — ٨ م</span></div></div>
            <div><h4>تابع الأثر</h4><ul><li><a href="https://instagram.com" target="_blank" rel="noreferrer" data-testid="link-instagram"><Instagram size={14} strokeWidth={1.3} /> @oxy.air.perfume</a></li><li><a href="mailto:hello@oxyairperfume.com" data-testid="link-email">hello@oxyairperfume.com</a></li></ul></div>
          </div>
          <div className="footer-bottom"><span>© ٢٠٢٤ OXY AIR PERFUME. جميع الحقوق محفوظة.</span><span>صُمّم بحب في بغداد · MADE IN IRAQ</span></div>
        </div>
      </footer>

      <div className={`drawer-backdrop ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} aria-hidden="true" />
      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} aria-label="سلة المشتريات" aria-hidden={!cartOpen}>
        <div className="drawer-head"><h2>{sent ? 'تمّ الطلب' : 'سلة العطر'}</h2><button className="close-button" aria-label="إغلاق السلة" data-testid="button-close-cart" onClick={() => setCartOpen(false)}><X size={20} strokeWidth={1.2} /></button></div>
        {sent ? (
          <div className="thank-you">
            <div className="check"><Check size={24} strokeWidth={1.3} /></div>
            <h2>شكراً لثقتك.</h2>
            <p>فتحنا لك محادثة على واتساب. سيعاود فريق OXY التواصل معك لتأكيد التفاصيل.</p>
            <button className="button-primary" data-testid="button-continue-shopping" onClick={() => { setSent(false); setCartOpen(false); }}>العودة إلى المجموعة</button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.length === 0 ? <div className="cart-empty" data-testid="text-empty-cart">سلتك هادئة الآن.<br /><small>أضف عطراً ليبدأ الأثر.</small></div> : cart.map((item) => (
                <div className="cart-item" key={item.id} data-testid={`row-cart-item-${item.id}`}>
                  <div className="cart-thumb" />
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
              <p className="drawer-footnote"><Sparkles size={11} /> الدفع عند الاستلام · التوصيل خلال ٢–٤ أيام</p>
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