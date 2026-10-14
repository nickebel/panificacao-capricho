import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Coffee,
  Globe2,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Wheat,
  X,
} from 'lucide-react';
import { TestimonialsColumn, type StoryCard } from '@/components/ui/testimonials-columns-1';
import { siteConfig } from '@/lib/site-config';

type Language = 'pt' | 'en';

const copy = {
  pt: {
    nav: ['Início', 'Nossos sabores', 'Nossa essência', 'Unidades'],
    topLine: 'O cheirinho de casa começa aqui',
    heroKicker: 'DESDE CEDO, COM CARINHO',
    heroTitle: 'O sabor de casa, feito com Capricho.',
    heroBody: 'Pães quentinhos, café da manhã e sabores do nosso Nordeste — preparados para transformar uma pausa em um bom momento.',
    heroPrimary: 'Encontre sua unidade',
    heroSecondary: 'Conheça nossos sabores',
    imageNote: 'Fresquinho e feito com carinho',
    scroll: 'Continue explorando',
    featureEyebrow: 'DA NOSSA COZINHA PARA A SUA MESA',
    featureTitle: 'Pequenos momentos. Grandes sabores.',
    featureBody: 'Tem gosto de manhã tranquila, de conversa boa e de receita que dá vontade de repetir.',
    featuresTitle: 'Um pouco do que sai da nossa cozinha',
    featuresSub: 'Clássicos preparados para deixar o seu dia mais gostoso.',
    items: [
      { title: 'Tapioca quentinha', description: 'Feita na hora, com recheio generoso e aquele queijo derretendo.' },
      { title: 'Cuscuz Sertão Tropical', description: 'Sabor nordestino que abraça: cuscuz, carne de sol e queijo.' },
      { title: 'Café da manhã', description: 'Um convite para desacelerar e começar o dia com carinho.' },
      { title: 'Pão quentinho', description: 'Dourado por fora, macio por dentro e saindo do forno.' },
    ],
    storyTag: 'RAÍZES NORDESTINAS',
    storyTitle: 'Sabor que representa a casa.',
    storyBody: 'Do cuscuz que lembra a nossa terra à tapioca feita na hora: aqui, o simples ganha um toque especial.',
    storyLink: 'Peça pelo WhatsApp',
    momentsTitle: 'Nossa cozinha tem histórias',
    momentsBody: 'Todo dia começa com cuidado, ingredientes escolhidos e vontade de servir bem.',
    stories: [
      { text: 'Aquele primeiro café do dia merece um momento só seu.', name: 'Café da manhã', role: 'Um começo acolhedor' },
      { text: 'Receitas com o gostinho e o calor da nossa terra.', name: 'Raízes nordestinas', role: 'Tradição à mesa' },
      { text: 'Pão recém-saído do forno, feito para compartilhar.', name: 'Pão quentinho', role: 'Fresquinho todos os dias' },
      { text: 'Sabores simples, preparados com o cuidado de sempre.', name: 'Feito com Capricho', role: 'Carinho em cada detalhe' },
    ],
    locationsEyebrow: 'PERTINHO DE VOCÊ',
    locationsTitle: 'Duas unidades. O mesmo Capricho.',
    locationsBody: 'Escolha a unidade mais prática para você e fale diretamente com a nossa equipe.',
    unitLabel: 'FALE COM A UNIDADE',
    whatsapp: 'Chamar no WhatsApp',
    map: 'Ver rota',
    footerText: 'Feito com carinho em São Miguel dos Campos, Alagoas.',
    footerLinks: 'Navegação',
    footerSocial: 'Acompanhe a gente',
    instagram: 'Instagram',
    made: 'O sabor de casa, todos os dias.',
  },
  en: {
    nav: ['Home', 'Our flavors', 'Our roots', 'Locations'],
    topLine: 'The comforting smell of home starts here',
    heroKicker: 'FRESH EVERY MORNING, MADE WITH CARE',
    heroTitle: 'The taste of home, made with care.',
    heroBody: 'Freshly baked bread, breakfast, and beloved flavors from Northeast Brazil — made to turn a simple pause into a good moment.',
    heroPrimary: 'Find your location',
    heroSecondary: 'Explore our flavors',
    imageNote: 'Freshly made with care',
    scroll: 'Keep exploring',
    featureEyebrow: 'FROM OUR KITCHEN TO YOUR TABLE',
    featureTitle: 'Little moments. Wonderful flavors.',
    featureBody: 'The taste of a slow morning, a good conversation, and a recipe you will want to enjoy again.',
    featuresTitle: 'A taste of what comes out of our kitchen',
    featuresSub: 'Comforting favorites made to brighten your day.',
    items: [
      { title: 'Warm tapioca', description: 'Made to order, generously filled with delicious melted cheese.' },
      { title: 'Sertão Tropical couscous', description: 'A Northeastern Brazilian favorite with couscous, sun-dried beef, and cheese.' },
      { title: 'Breakfast', description: 'An invitation to slow down and start the day with a little care.' },
      { title: 'Freshly baked bread', description: 'Golden on the outside, soft inside, straight from the oven.' },
    ],
    storyTag: 'NORTHEASTERN ROOTS',
    storyTitle: 'A taste that feels like home.',
    storyBody: 'From couscous that reminds us of our roots to tapioca made to order, we give everyday favorites a special touch.',
    storyLink: 'Order on WhatsApp',
    momentsTitle: 'Our kitchen has stories',
    momentsBody: 'Every day begins with care, thoughtfully chosen ingredients, and a desire to serve you well.',
    stories: [
      { text: 'Your first coffee of the day deserves a moment of its own.', name: 'Breakfast', role: 'A warm beginning' },
      { text: 'Recipes carrying the flavor and warmth of our region.', name: 'Northeastern roots', role: 'Tradition at the table' },
      { text: 'Freshly baked bread, made to be shared.', name: 'Warm bread', role: 'Fresh every day' },
      { text: 'Simple flavors, prepared with the care you know.', name: 'Made with care', role: 'Thought in every detail' },
    ],
    locationsEyebrow: 'CLOSE TO YOU',
    locationsTitle: 'Two locations. The same Capricho.',
    locationsBody: 'Choose the most convenient location and get in touch directly with our team.',
    unitLabel: 'CONTACT THIS LOCATION',
    whatsapp: 'Chat on WhatsApp',
    map: 'Get directions',
    footerText: 'Made with care in São Miguel dos Campos, Alagoas, Brazil.',
    footerLinks: 'Explore',
    footerSocial: 'Follow us',
    instagram: 'Instagram',
    made: 'The taste of home, every day.',
  },
};

const images = {
  hero: './assets/tapioca-prato.webp',
  tapioca: './assets/tapioca-prato.webp',
  foodSprite: './assets/food-sprite.webp',
};

const App = () => {
  const [lang, setLang] = useState<Language>('pt');
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[lang];

  const stories: StoryCard[] = t.stories.map((story, index) => ({
    ...story,
    image: images.foodSprite,
    imagePosition: ['66.6667% center', '33.3333% center', '100% center', '0% center'][index],
    imageSize: '400% auto',
  }));

  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="site-shell">
      <div className="announcement">{t.topLine}<span className="announcement-dot">✳</span> São Miguel dos Campos, AL</div>

      <header className="site-header">
        <a className="brand" href="#inicio" onClick={() => setMenuOpen(false)} aria-label="Panificação Capricho home">
          <span className="brand-mark"><Wheat size={25} strokeWidth={1.6} /></span>
          <span className="brand-copy"><strong>CAPRICHO</strong><small>PANIFICAÇÃO</small></span>
        </a>

        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label={lang === 'pt' ? 'Navegação principal' : 'Main navigation'}>
          {t.nav.map((label, i) => (
            <button key={label} onClick={() => goTo(['inicio', 'sabores', 'essencia', 'unidades'][i])}>{label}</button>
          ))}
          <a className="nav-instagram" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>
        </nav>

        <div className="header-actions">
          <button className="language-switch" onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} aria-label="Change language">
            <Globe2 size={16} /> {lang === 'pt' ? 'EN' : 'PT'}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section" id="inicio">
          <div className="hero-copy">
            <div className="eyebrow"><span />{t.heroKicker}</div>
            <h1>{lang === 'pt' ? <>O sabor de casa,<br /><em>feito com Capricho.</em></> : <>The taste of home,<br /><em>made with care.</em></>}</h1>
            <p>{t.heroBody}</p>
            <div className="hero-buttons">
              <button className="button button-dark" onClick={() => goTo('unidades')}>{t.heroPrimary}<ArrowRight size={17} /></button>
              <button className="button button-quiet" onClick={() => goTo('sabores')}>{t.heroSecondary}<ArrowDownRight size={17} /></button>
            </div>
            <div className="hero-note"><span className="note-icon"><Coffee size={18} /></span><span>{t.imageNote}</span><span className="note-line" /></div>
          </div>
          <div className="hero-visual">
            <div className="hero-image" role="img" aria-label={lang === 'pt' ? 'Pães artesanais fresquinhos' : 'Freshly baked bread'} style={{ backgroundImage: 'url(' + images.hero + ')' }} />
            <div className="hero-image-wash" />
            <div className="round-stamp"><span>FEITO COM</span><strong>♡</strong><span>CAPRICHO</span></div>
            <div className="hero-caption"><span>01 / 04</span><span>{lang === 'pt' ? 'Afeto em cada receita' : 'Care in every recipe'}</span></div>
          </div>
          <div className="hero-side-label">PANIFICAÇÃO · CAFÉ · AFETO</div>
        </section>

        <section className="intro-strip">
          <span className="intro-symbol">✳</span>
          <p>{t.featureEyebrow}</p>
          <span className="intro-rule" />
          <span className="intro-small">{lang === 'pt' ? 'Desde cedo, todos os dias' : 'Early every day'}</span>
        </section>

        <section className="flavors-section section-wrap" id="sabores">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{lang === 'pt' ? 'FEITO PARA SABOREAR' : 'MADE TO BE SAVORED'}</span>
              <h2>{t.featuresTitle}</h2>
              <p>{t.featuresSub}</p>
            </div>
            <span className="heading-number">01 <i>—</i> 04</span>
          </div>

          <div className="product-grid">
            {t.items.map((item, i) => (
              <article className={'product-card product-card-' + (i + 1)} key={item.title}>
                <div
                  className="product-photo"
                  role="img"
                  aria-label={item.title}
                  style={{
                    backgroundImage: 'url(' + (i === 0 ? images.tapioca : images.foodSprite) + ')',
                    backgroundSize: i === 0 ? 'cover' : '400% auto',
                    backgroundPosition: i === 0 ? 'center' : ['33.3333% center', '66.6667% center', '100% center'][i - 1],
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <span className="product-count">0{i + 1}</span>
                </div>
                <div className="product-copy">
                  {i === 0 && <h3>{item.title}</h3>}
                  <p>{i === 0 ? item.description : lang === 'pt' ? [
                    'Uma combinação de sabores que celebra as raízes nordestinas.',
                    'Comece o dia com um café e algo fresquinho à mesa.',
                    'Pães fresquinhos para levar para casa e compartilhar.',
                  ][i - 1] : [
                    'A flavorful combination celebrating Northeastern Brazilian roots.',
                    'Start the day with coffee and something freshly made.',
                    'Fresh bread to take home and share.',
                  ][i - 1]}</p>
                  <button onClick={() => goTo('unidades')} className="text-link">{lang === 'pt' ? 'Encontre na Capricho' : 'Find it at Capricho'} <ArrowRight size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="story-section" id="essencia">
          <div
            className="story-photo story-photo-sprite"
            role="img"
            aria-label={lang === 'pt' ? 'Cuscuz Sertão Tropical preparado na Capricho' : 'Sertão Tropical couscous prepared at Capricho'}
          >
            <span className="photo-label">{t.storyTag}</span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">{t.storyTag}</span>
            <h2>{t.storyTitle}</h2>
            <p>{t.storyBody}</p>
            <button className="button button-outline" onClick={() => goTo('unidades')}>{t.storyLink}<ArrowRight size={17} /></button>
            <div className="story-signature"><Wheat size={25} /><span>{lang === 'pt' ? 'Sabor, afeto e tradição.' : 'Flavor, care, and tradition.'}</span></div>
          </div>
        </section>

        <section className="moments-section section-wrap">
          <div className="section-heading moments-heading">
            <div>
              <span className="eyebrow">{lang === 'pt' ? 'O NOSSO JEITO DE FAZER' : 'OUR WAY OF DOING THINGS'}</span>
              <h2>{t.momentsTitle}</h2>
              <p>{t.momentsBody}</p>
            </div>
            <Coffee className="moments-icon" strokeWidth={1} />
          </div>
          <div className="story-columns">
            <TestimonialsColumn testimonials={stories.slice(0, 2)} duration={22} />
            <TestimonialsColumn testimonials={stories.slice(2, 4)} duration={27} className="story-column-second" />
            <TestimonialsColumn testimonials={stories.slice(0, 2)} duration={24} className="story-column-third" />
          </div>
        </section>

        <section className="locations-section" id="unidades">
          <div className="locations-intro">
            <span className="eyebrow">{t.locationsEyebrow}</span>
            <h2>{t.locationsTitle}</h2>
            <p>{t.locationsBody}</p>
            <a className="social-pill" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={17} /> {lang === 'pt' ? 'Veja nosso dia a dia' : 'See our daily moments'} <ArrowRight size={15} /></a>
          </div>
          <div className="location-cards">
            {siteConfig.units.map((unit, index) => (
              <article className="location-card" key={unit.id}>
                <div className="location-topline"><span>{lang === 'pt' ? 'UNIDADE' : 'LOCATION'} 0{index + 1}</span><MapPin size={18} /></div>
                <h3>{lang === 'pt' ? unit.name : unit.nameEn}</h3>
                <p className="location-address">{lang === 'pt' ? unit.address : unit.addressEn}</p>
                <span className="location-divider" />
                <span className="location-label">{t.unitLabel}</span>
                <strong className="phone-number">{unit.whatsappDisplay}</strong>
                <a className="button button-dark location-whatsapp" href={'https://wa.me/' + unit.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} />{t.whatsapp}<ArrowRight size={16} /></a>
                <a className="map-link" href={unit.mapUrl} target="_blank" rel="noreferrer">{t.map}<ArrowRight size={15} /></a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="brand footer-brand" href="#inicio">
            <span className="brand-mark"><Wheat size={25} strokeWidth={1.6} /></span>
            <span className="brand-copy"><strong>CAPRICHO</strong><small>PANIFICAÇÃO</small></span>
          </a>
          <p>{t.footerText}</p>
          <a className="footer-instagram" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={17} /> {t.instagram} <ArrowRight size={15} /></a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Panificação Capricho</span>
          <span>{t.made}</span>
          <button onClick={() => goTo('inicio')}>{lang === 'pt' ? 'Voltar ao topo ↑' : 'Back to top ↑'}</button>
        </div>
      </footer>
    </div>
  );
};

export default App;