import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, writeBatch, serverTimestamp, getDocs, limit
} from 'firebase/firestore';
import {
  Ruler, TreePine, Palette, Send, ShoppingCart, Plus, Trash2, Settings,
  ChevronRight, ChevronLeft, Image as ImageIcon, Sparkles, BoxSelect,
  Armchair, Sun, CloudRain, Hammer, Monitor, Tv, Bed, Utensils, Archive,
  RectangleVertical, Box, LogOut, Save, Coins, MapPin,
  User, Paperclip, X, Check, Table, DoorOpen, ArrowLeft, Truck, Store, Map as MapIcon, Users,
  Square, Star, MessageCircle, Instagram, Download,
  BarChart3, Smartphone, Grid, RefreshCw, Phone, Mail, Info, Edit, Bot, LayoutDashboard, ListOrdered
} from 'lucide-react';

const apiKey = "";

const userFirebaseConfig = {
  apiKey: "AIzaSyCObM7lu1VN6kvPx9Ifgd4eo4N3bgm-Oak",
  authDomain: "ebemuebles1.firebaseapp.com",
  projectId: "ebemuebles1",
  storageBucket: "ebemuebles1.firebasestorage.app",
  messagingSenderId: "570132018153",
  appId: "1:570132018153:web:ef8577e7109df18aadd178",
  measurementId: "G-4GCBZ6YWM3"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : userFirebaseConfig;
const APP_ID_FIRESTORE = typeof __app_id !== 'undefined' ? __app_id : 'ebe-muebles-prod-v12-final';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getDirectDriveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url;
  if (!url.includes('drive.google.com')) return url;
  let idMatch = url.match(/\/file\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/) || url.match(/\/d\/(.*?)\//);
  if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  return url;
};

// PALETA ESTRICTA: Marrones oscuros, Verdes oscuros.
const THEME = {
  bg: "bg-[#F4F1EB]",
  card: "bg-white border border-[#E0D8CC] shadow-sm",
  cardHover: "hover:border-[#36251B] hover:shadow-md transition-all duration-300 ease-out",
  accent: "text-[#1C2E20]",
  accentBg: "bg-[#1C2E20]",
  accentBorder: "border-[#1C2E20]",
  primary: "bg-[#36251B]",
  primaryText: "text-[#36251B]",
  primaryHover: "hover:bg-[#1F140E]",
  textMain: "text-[#1A1816]",
  textMuted: "text-[#6B635A]",
  input: "bg-white border border-[#E0D8CC] focus:border-[#36251B] outline-none transition-all font-sans text-[#1A1816] placeholder-[#9C948A] rounded-xl"
};

const DEFAULT_LOGO_SRC = "https://cdn-icons-png.flaticon.com/512/3030/3030336.png";
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/_u/ebe.muebles/";
const ADMIN_EMAILS = ['emabelaver@gmail.com', 'acevedo.gestoriadelautomotor@gmail.com'];

const DATOS_CONTACTO = {
  telefono_whatsapp: "5493547531519",
  nombre_negocio: "eBe Muebles",
  maps_link: "https://maps.app.goo.gl/yXy8vciXoR11Z4L8A",
};

const DEFAULT_COSTOS = {
  madera_basica: 8500, madera_intermedia: 9700, madera_premium: 11000,
  madera_p_ext_basica: 13500, madera_p_ext_intermedia: 14500, madera_p_ext_premium: 16000,
  madera_p_int_basica: 10500, madera_p_int_intermedia: 12000, madera_p_int_premium: 14000,
  puerta_placa_m2: 85000, puerta_inyectada_m2: 350000,
  marco_pino_puerta_placa: 40000, marco_chapa_inyectada: 45000,
  cano_marco_principal_12m: 87000, cano_marco_secundario_12m: 25000,
  marco_herrero_mano_obra: 50000, marco_insumos_varios: 35000,
  cano_estructural_ml: 4500, chapa_lisa_m2: 35000, relleno_poliuretano: 40000,
  insumos_herreria: 25000, cerradura_seguridad: 35000, cerradura_puerta_placa: 15000,
  mdf_placa_precio: 120000, mdf_corte: 1000, mdf_canto: 600,
  costo_cajon_completo: 45000, costo_puerta_mueble: 30000,
  patas_madera: 220000, patas_metal: 270000,
  term_cetol: 30000, term_laca: 60000, term_pintura_chapa_std: 60000, term_pintura_chapa_oxi: 90000,
  margen_mdf: 1.8, margen_macizo: 1.0, factor_exterior: 1.3, dia_carpintero: 60000,
};

const CATEGORIAS_COSTOS = {
  "Maderas (Terminaciones)": ['madera_basica', 'madera_intermedia', 'madera_premium', 'term_cetol', 'term_laca'],
  "Puertas Exterior": ['madera_p_ext_basica', 'madera_p_ext_intermedia', 'madera_p_ext_premium'],
  "Puertas Interior": ['madera_p_int_basica', 'madera_p_int_intermedia', 'madera_p_int_premium'],
  "Puerta Inyectada": ['puerta_inyectada_m2', 'cano_marco_principal_12m', 'cano_marco_secundario_12m', 'marco_herrero_mano_obra'],
  "Herrería General": ['cano_estructural_ml', 'chapa_lisa_m2', 'relleno_poliuretano', 'term_pintura_chapa_std', 'term_pintura_chapa_oxi'],
  "Melamina y Placas": ['mdf_placa_precio', 'mdf_corte', 'mdf_canto', 'puerta_placa_m2'],
  "Componentes (Patas/Cajones)": ['costo_cajon_completo', 'costo_puerta_mueble', 'patas_madera', 'patas_metal']
};

const DEFAULT_MADERAS = [
  { id: 'eucalipto', nombre: 'Eucalipto', tier: 'basica', src: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop" },
  { id: 'kiri', nombre: 'Kiri', tier: 'intermedia', src: "https://i.postimg.cc/zvnLjGQ1/Kiri-textura.png" },
  { id: 'paraiso', nombre: 'Paraíso', tier: 'intermedia', src: "https://i.postimg.cc/J0wDZkpm/Paraiso-textura.png" },
  { id: 'zoita', nombre: 'Zoita', tier: 'intermedia', src: "https://i.postimg.cc/8chFHzYP/Zoita-textura.png" },
  { id: 'cedro', nombre: 'Cedro', tier: 'intermedia', src: "https://i.postimg.cc/MZRjx9pD/Cedro-textura.png" },
  { id: 'guayubira', nombre: 'Guayubira', tier: 'intermedia', src: "https://i.postimg.cc/1XpgH3d1/Guayubira-textura.png" },
  { id: 'laurel', nombre: 'Laurel', tier: 'intermedia', src: "https://i.postimg.cc/tJh154cy/Laurel-textura.png" },
  { id: 'petiribi', nombre: 'Petiribí', tier: 'premium', src: "https://i.postimg.cc/SQ8zqgxf/Petiribi-textura.png" },
  { id: 'incienso', nombre: 'Incienso', tier: 'premium', src: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&q=80&w=600" },
];

const DEFAULT_MELAMINAS_DB = [{ id: 'm_blanco', nombre: 'Blanco', css: '#FFFFFF', category: 'lisos' }];

const TAPA_GENERICA = { id: 'tapa_custom', nombre: 'Tapa de Mesa', tipo: 'maciza', espesor: 1.5, forma: 'tapa', imagen: '🪵', permite_herrajes: false };
const MESA_GENERICA = { id: 'mesa_custom', nombre: 'Mesa a Medida', tipo: 'maciza', espesor: 2, forma: 'mesa', imagen: '🪑', permite_herrajes: false };
const ESCALON_GENERICO = { id: 'escalon_custom', nombre: 'Escalón a Medida', tipo: 'maciza', espesor: 1.5, forma: 'escalon', imagen: '🪜', permite_herrajes: false };
const PUERTA_GENERICA = { id: 'puerta_custom', nombre: 'Puerta a Medida', tipo: 'maciza', espesor: 2, forma: 'puerta', imagen: '🚪', permite_herrajes: false };

const CATEGORIAS_PRINCIPALES = [
  { id: 'cat_tapas', label: 'Tapas', icon: 'RectangleVertical', destino: 'directo', item: TAPA_GENERICA },
  { id: 'cat_mesa', label: 'Mesas', icon: 'Table', destino: 'directo', item: MESA_GENERICA },
  { id: 'cat_escalones', label: 'Escalones', icon: 'ListOrdered', destino: 'directo', item: ESCALON_GENERICO },
  { id: 'cat_puerta', label: 'Puertas', icon: 'DoorOpen', destino: 'directo', item: PUERTA_GENERICA },
  { id: 'cat_muebles', label: 'Mobiliario', icon: 'Armchair', destino: 'lista' }
];

const LISTA_MUEBLES_GRAL = [
  { id: 'ropero', nombre: 'Ropero / Vestidor', prof_def: 60, icon: 'RectangleVertical', forma: 'caja_alta', permite_herrajes: true, imagen: '🚪' },
  { id: 'mesa_luz', nombre: 'Mesa de Luz', prof_def: 40, icon: 'Box', forma: 'caja_baja', permite_herrajes: true, imagen: '🗄️' },
  { id: 'escritorio', nombre: 'Escritorio', prof_def: 55, icon: 'Monitor', forma: 'escritorio', permite_herrajes: true, imagen: '💻' },
  { id: 'bajo_mesada', nombre: 'Bajo Mesada', prof_def: 58, icon: 'Utensils', forma: 'caja_baja', permite_herrajes: true, imagen: '🍳' },
  { id: 'alacena', nombre: 'Alacena', prof_def: 32, icon: 'Archive', forma: 'caja_alta', permite_herrajes: false, imagen: '🗃️' },
  { id: 'cama', nombre: 'Cama', prof_def: 200, icon: 'Bed', esCama: true, forma: 'cama', permite_herrajes: false, imagen: '🛏️' },
  { id: 'rack_tv', nombre: 'Rack TV / Vajillero', prof_def: 40, icon: 'Tv', forma: 'caja_baja', permite_herrajes: true, imagen: '📺' },
];

const CAMAS_MEDIDAS = [{ label: '1 Plaza', w: 90, l: 190 }, { label: '2 Plazas', w: 140, l: 190 }, { label: 'Queen', w: 160, l: 200 }, { label: 'King', w: 200, l: 200 }];

const OPCIONES_PATAS = {
  sin_patas: [{ id: 'ninguna', nombre: 'Sin Patas', icon: Box }],
  madera: [{ id: 'recta', nombre: 'Rectas', icon: Square }, { id: 'u_shape', nombre: 'En U', icon: Box }, { id: 'l_shape', nombre: 'En L', icon: ChevronRight }],
  metal: [{ id: 'industrial_u', nombre: 'Ind. U', icon: Square }, { id: 'industrial_x', nombre: 'Ind. X', icon: X }, { id: 'industrial_recto', nombre: 'Rectos', icon: RectangleVertical }]
};

const ACABADOS = [{ id: 'natural', nombre: 'NATURAL', price: 0 }, { id: 'cetol', nombre: 'IMPREGNANTE', price: 30000 }, { id: 'laca', nombre: 'LACA', price: 60000 }];
const COLORES_CHAPA = [{ id: 'negro', nombre: 'Negro', css: '#1a1a1a' }, { id: 'blanco', nombre: 'Blanco', css: '#f5f5f5' }, { id: 'oxidado', nombre: 'Oxidado', css: 'linear-gradient(45deg, #8B4513, #5D4037)' }];
const ACABADOS_CHAPA = [{ id: 'mate', nombre: 'Mate' }, { id: 'satinado', nombre: 'Satinado' }, { id: 'brillante', nombre: 'Brill.' }];

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #F4F1EB; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #E0D8CC; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #36251B; }
    
    /* Maderas grandes en movil y GIGANTES en PC */
    .swatch-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    @media (min-width: 768px) {
       .swatch-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
    }
  `}</style>
);

const BackgroundAmbience = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#36251B]/5 blur-3xl" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#1C2E20]/5 blur-3xl" />
  </div>
);

const Header = React.memo(({ onBack, title, onLogoClick, showCart, cartCount, onCartClick, logoUrl }) => (
  <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/90 border-b border-[#E0D8CC] py-4 px-5 flex justify-between items-center transition-all shadow-sm">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className={`p-2 rounded-full hover:bg-slate-100 text-[#36251B] transition-colors active:scale-95`}>
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className={`text-lg font-bold tracking-tight text-[#36251B] truncate uppercase`}>{title}</h1>
    </div>
    <div className="flex items-center gap-5">
      {showCart && (
        <button onClick={onCartClick} className={`relative p-2 text-[#36251B] hover:text-[#1C2E20] transition-colors`}>
          <ShoppingCart size={24} />
          {cartCount > 0 && <span className={`absolute 0 right-0 w-4 h-4 bg-[#1C2E20] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm`}>{cartCount}</span>}
        </button>
      )}
      <div onClick={onLogoClick} className="cursor-pointer">
        <img src={getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC} alt="Logo" className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity object-contain drop-shadow-sm" />
      </div>
    </div>
  </header>
));

const IconRenderer = ({ name, size = 24, className }) => {
  const icons = { Table, DoorOpen, Armchair, RectangleVertical, Box, Monitor, Utensils, Archive, Bed, Tv, ListOrdered };
  const IconComponent = icons[name] || Box;
  return <IconComponent size={size} className={className} />;
};

const getMaterialVisual = (config, maderas, melaminas) => {
  if (config?.tipoConstruccion === 'chapa_inyectada') {
    const color = COLORES_CHAPA.find(c => c.id === config?.chapa_color);
    return { type: 'css', value: color ? color.css : '#000' };
  }
  if (config?.tipoConstruccion === 'puerta_placa' || config?.tipoConstruccion === 'puerta_enchapada') {
    return { type: 'img', value: maderas[0]?.src || '' };
  }
  if (config?.material && config.material.startsWith('m_')) {
    const melamina = melaminas.find(m => m.id === config.material);
    return { type: 'css', value: melamina ? melamina.css : '#fff' };
  }
  const madera = maderas.find(m => m.id === config?.material);
  return { type: 'img', value: madera ? madera.src : '' };
};

const InputMedida = React.memo(({ label, val, onChange }) => (
  <div className="flex flex-col w-full">
    <label className={`text-[10px] font-bold text-[#6B635A] uppercase tracking-wider mb-1.5 block`}>{label}</label>
    <input
      type="number" value={val} onChange={e => onChange(e.target.value)} onFocus={e => e.target.select()}
      className={`w-full bg-[#F4F1EB] border border-[#E0D8CC] p-3 rounded-xl text-center font-bold text-[#1A1816] focus:border-[#36251B] outline-none transition-colors`}
    />
  </div>
));

const App = () => {
  const [paso, setPaso] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  const [costos, setCostos] = useState(DEFAULT_COSTOS);
  const [galeria, setGaleria] = useState([]);
  const [maderas, setMaderas] = useState(DEFAULT_MADERAS);
  const [melaminas, setMelaminas] = useState(DEFAULT_MELAMINAS_DB);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_SRC);
  const [instagramUrl, setInstagramUrl] = useState(DEFAULT_INSTAGRAM_URL);
  const [aboutUsImageUrl, setAboutUsImageUrl] = useState('');
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

  const [ordersList, setOrdersList] = useState([]);
  const [carrito, setCarrito] = useState([]);

  const [vendedores, setVendedores] = useState([{ id: 'v1', nombre: 'Emanuel', avatarUrl: '' }, { id: 'v2', nombre: 'Aldana', avatarUrl: '' }, { id: 'v3', nombre: 'Teffi', avatarUrl: '' }]);
  const [vendedorActual, setVendedorActual] = useState(null);
  const [adminSelectedVendor, setAdminSelectedVendor] = useState(null);

  const [newVendor, setNewVendor] = useState({ nombre: '', avatarUrl: '' });
  const [editVendorId, setEditVendorId] = useState(null);
  const [editVendorData, setEditVendorData] = useState({});

  const [newImage, setNewImage] = useState({ url: '', alt: '' });
  const [adminLogoInput, setAdminLogoInput] = useState('');
  const [adminInstagramInput, setAdminInstagramInput] = useState('');
  const [adminAboutUsImageInput, setAdminAboutUsImageInput] = useState('');
  const [newMaterial, setNewMaterial] = useState({ nombre: '', tier: 'basica', src: '' });
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [editMaterialData, setEditMaterialData] = useState({});

  const [catSeleccionada, setCatSeleccionada] = useState(null);
  const [muebleSeleccionado, setMuebleSeleccionado] = useState(null);

  const [config, setConfig] = useState({
    ancho: 160, largo: 80, profundidad: 40, cantidad: 1,
    materialesSeleccionados: ['eucalipto'], acabado: 'natural', tipoPatas: 'sin_patas', modeloPatas: 'ninguna',
    marco: false, cantCajones: 0, cantPuertas: 0, uso: 'interior', tipoConstruccion: 'maciza',
    chapa_color: 'negro', chapa_acabado: 'satinado', espesorPulgadas: 1.5,
    envio: '', instalacion: ''
  });

  const [cliente, setCliente] = useState({ nombre: '', canal: 'whatsapp', telefono: '' });
  const [checkoutPaso, setCheckoutPaso] = useState('form');
  const [showEnvio, setShowEnvio] = useState(false);
  const [showInstalacion, setShowInstalacion] = useState(false);

  const [preciosMultiples, setPreciosMultiples] = useState([]);
  const [espesorVisual, setEspesorVisual] = useState('');
  const [materialesPosibles, setMaterialesPosibles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const isMDF = config.tipoConstruccion === 'placa';

  const getHeaderTitle = useCallback(() => {
    if (paso === 5) return "Galería";
    if (paso === 4) return "Tu Pedido";
    if (paso === 3 && muebleSeleccionado) return muebleSeleccionado.nombre;
    if (paso === 2 && catSeleccionada) return catSeleccionada.label;
    if (paso === 1) return "Categorías";
    return "EBE MUEBLES";
  }, [paso, muebleSeleccionado, catSeleccionada]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch (e) { console.warn("Modo offline"); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'general'));
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.logoUrl) { setLogoUrl(d.logoUrl); setAdminLogoInput(d.logoUrl); }
          if (d.instagramUrl) { setInstagramUrl(d.instagramUrl); setAdminInstagramInput(d.instagramUrl); }
          if (d.aboutUsImageUrl) { setAboutUsImageUrl(d.aboutUsImageUrl); setAdminAboutUsImageInput(d.aboutUsImageUrl); }
        }
      } catch (e) { }
    };
    loadSettings();

    const unsubGaleria = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'gallery'), orderBy('createdAt', 'desc')),
      (snap) => { if (!snap.empty) setGaleria(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
      (error) => { console.warn("Galeria fallback"); }
    );

    const unsubMaderas = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials'), orderBy('nombre')),
      (snap) => { if (!snap.empty) setMaderas(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
      (error) => { console.warn("Maderas fallback"); setMaderas(DEFAULT_MADERAS); }
    );

    const unsubCostos = onSnapshot(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'costos'),
      (snap) => { if (snap.exists()) setCostos(snap.data()); },
      (error) => { console.warn("Costos fallback"); }
    );

    let unsubOrders = () => { };
    if (isAdmin) {
      unsubOrders = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'orders'), orderBy('createdAt', 'desc')),
        (snap) => { setOrdersList(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
        (error) => { console.warn("Orders fallback"); }
      );
    }

    const unsubVendedores = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'vendedores'), orderBy('nombre')),
      (snap) => {
        if (!snap.empty) setVendedores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => { console.warn("Vendedores fallback"); }
    );

    return () => { unsubGaleria(); unsubMaderas(); unsubCostos(); unsubOrders(); unsubVendedores(); };
  }, [user, isAdmin]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => setPdfLibLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleAdminLogin = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (ADMIN_EMAILS.includes(result.user.email)) {
        setIsAdmin(true);
      } else {
        alert("No tienes permisos de administrador con este correo.");
        await signOut(auth);
        await signInAnonymously(auth);
      }
    } catch (e) {
      console.error("Error Auth:", e);
      // Bypass para el entorno de vista previa
      if (e.code === 'auth/unauthorized-domain' || e.message.includes('unauthorized-domain')) {
        alert("⚠️ Entorno de prueba detectado: Firebase bloquea este dominio temporal. Te damos acceso directo al panel para que puedas probarlo.");
        setIsAdmin(true);
      } else {
        alert("Error al iniciar sesión: " + e.message);
      }
    }
  }, []);

  const handleSaveSettings = useCallback(async () => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'general'), {
        logoUrl: getDirectDriveUrl(adminLogoInput) || DEFAULT_LOGO_SRC,
        instagramUrl: adminInstagramInput || DEFAULT_INSTAGRAM_URL,
        aboutUsImageUrl: getDirectDriveUrl(adminAboutUsImageInput)
      }, { merge: true });
      alert("Configuración guardada.");
    } catch (e) { alert("Error al guardar."); }
  }, [isAdmin, adminLogoInput, adminInstagramInput, adminAboutUsImageInput]);

  const addVendor = async () => {
    if (!isAdmin || !newVendor.nombre) return;
    try {
      await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'vendedores'), {
        nombre: newVendor.nombre,
        avatarUrl: getDirectDriveUrl(newVendor.avatarUrl),
        createdAt: Date.now()
      });
      setNewVendor({ nombre: '', avatarUrl: '' });
    } catch (e) { console.error("Error agregando vendedor", e); }
  };

  const startEditVendor = (v) => { setEditVendorId(v.id); setEditVendorData({ ...v }); };
  const saveVendor = async () => {
    if (!isAdmin || !editVendorId) return;
    try { await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'vendedores', editVendorId), editVendorData, { merge: true }); setEditVendorId(null); } catch (e) { }
  };
  const deleteVendor = async (id) => {
    if (isAdmin && confirm("¿Eliminar asesor?")) {
      await deleteDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'vendedores', id));
      if (adminSelectedVendor?.id === id) setAdminSelectedVendor(null);
    }
  };

  const handleCostoChange = (key, val) => {
    const num = parseInt(val.replace(/\./g, '')) || 0;
    setCostos(prev => ({ ...prev, [key]: num }));
  };

  const saveCostos = useCallback(async () => {
    if (!isAdmin) return;
    await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'costos'), costos);
    alert("Costos actualizados.");
  }, [isAdmin, costos]);

  const startEditMaterial = (m) => { setEditMaterialId(m.id); setEditMaterialData({ ...m }); };
  const saveMaterial = async () => {
    if (!isAdmin || !editMaterialId) return;
    try { await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials', editMaterialId), editMaterialData, { merge: true }); setEditMaterialId(null); } catch (e) { }
  };
  const addMaterial = async () => {
    if (!isAdmin || !newMaterial.nombre) return;
    try { await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials'), { ...newMaterial, id: `mat_${Date.now()}`, createdAt: Date.now() }); setNewMaterial({ nombre: '', tier: 'basica', src: '' }); } catch (e) { }
  };

  const uploadDefaultMaterials = async () => {
    if (!isAdmin) return;
    if (!confirm("Esto sincronizará el catálogo base de maderas a la nube. Si ya tenés otras, se agregarán sin borrarse. ¿Continuar?")) return;
    try {
      const batch = writeBatch(db);
      DEFAULT_MADERAS.forEach((m) => {
        const ref = doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials', m.id);
        batch.set(ref, { ...m, createdAt: serverTimestamp() }, { merge: true });
      });
      await batch.commit();
      alert("¡Catálogo sincronizado exitosamente!");
    } catch (e) {
      console.error(e);
      alert("Hubo un error al sincronizar.");
    }
  };

  const deleteMaterial = async (id) => { if (isAdmin) await deleteDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials', id)); };

  const updateOrderStatus = async (id, currentStatus) => {
    if (isAdmin) {
      const newStatus = currentStatus === 'pendiente' ? 'aprobado' : 'pendiente';
      await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'orders', id), { estado: newStatus }, { merge: true });
    }
  };

  useEffect(() => {
    if (paso === 3 && muebleSeleccionado) {
      const isMaciza = muebleSeleccionado.id?.includes('mesa') || muebleSeleccionado.id?.includes('puerta') || muebleSeleccionado.id?.includes('tapa') || muebleSeleccionado.id?.includes('escalon');
      setConfig(prev => ({
        ...prev, tipoConstruccion: isMaciza ? 'maciza' : 'placa', uso: 'interior',
        materialesSeleccionados: isMaciza ? ['eucalipto'] : [], cantCajones: 0, cantPuertas: 0, tipoPatas: 'sin_patas', modeloPatas: 'ninguna', marco: false,
        profundidad: muebleSeleccionado.prof_def || 40, espesorPulgadas: muebleSeleccionado.espesor || 1.5, cantidad: 1
      }));
    }
  }, [paso, muebleSeleccionado]);

  useEffect(() => {
    if (paso === 3) {
      if (muebleSeleccionado?.id === 'mesa_custom' && config.uso === 'exterior') {
        if (config.tipoConstruccion === 'placa') setConfig(p => ({ ...p, tipoConstruccion: 'maciza' }));
        if (config.tipoPatas === 'madera') setConfig(p => ({ ...p, tipoPatas: 'metal' }));
        if (config.marco) setConfig(p => ({ ...p, marco: false }));
      }

      let mats = [];
      let esp = "1\"";

      const MATERIAL_PUERTA_CHAPA = { id: 'puerta_chapa_iny', nombre: 'Chapa Inyectada', type: 'chapa_inyectada', textura: { type: 'css', css: '#333' } };
      const MATERIAL_PUERTA_PLACA = { id: 'puerta_placa_std', nombre: 'Puerta Placa', type: 'puerta_placa', textura: { type: 'img', src: maderas[0]?.src } };

      const MATERIALES = [
        ...maderas.map(m => ({ id: m.id, nombre: m.nombre, type: 'maciza', tier: m.tier, textura: { type: 'img', src: m.src } })),
        MATERIAL_PUERTA_PLACA, MATERIAL_PUERTA_CHAPA
      ];

      if (config.tipoConstruccion === 'maciza') {
        mats = MATERIALES.filter(m => m.type === 'maciza');
        esp = `${config.espesorPulgadas}"`;
      } else if (config.tipoConstruccion === 'placa') {
        mats = []; esp = "18mm";
      } else if (config.tipoConstruccion === 'puerta_placa') {
        mats = [MATERIAL_PUERTA_PLACA]; esp = "Std";
      } else if (config.tipoConstruccion === 'puerta_enchapada') {
        mats = [MATERIAL_PUERTA_PLACA]; esp = "Enchapado";
      } else if (config.tipoConstruccion === 'chapa_inyectada') {
        mats = [MATERIAL_PUERTA_CHAPA]; esp = "3\"";
      }
      setMaterialesPosibles(mats);
      setEspesorVisual(esp);
    }
  }, [config.tipoConstruccion, config.uso, config.espesorPulgadas, paso, maderas, muebleSeleccionado]);

  useEffect(() => {
    if (catSeleccionada?.id === 'cat_muebles') { setPreciosMultiples([]); return; }

    if (paso === 3 && config.materialesSeleccionados) {
      const anchoSafe = Number(config.ancho) || 0;
      const largoSafe = Number(config.largo) || 0;
      const area = (anchoSafe * largoSafe) / 10000;

      const calculados = config.materialesSeleccionados.map(matId => {
        let structurePrice = 0;
        const mat = maderas.find(m => m.id === matId);

        if (config.tipoConstruccion === 'placa') {
          structurePrice = 0;
        } else if (config.tipoConstruccion === 'chapa_inyectada') {
          structurePrice = area * costos.puerta_inyectada_m2;
          if (config.marco) {
            const perimetro = ((anchoSafe + largoSafe) * 2) / 100;
            const costo_material_ml = (costos.cano_marco_principal_12m + costos.cano_marco_secundario_12m) / 12;
            structurePrice += (perimetro * costo_material_ml) + costos.marco_herrero_mano_obra + costos.marco_insumos_varios;
          }
        } else if (config.tipoConstruccion === 'puerta_placa' || config.tipoConstruccion === 'puerta_enchapada') {
          structurePrice = (area * costos.puerta_placa_m2) + (config.marco ? costos.marco_pino_puerta_placa : 0);
          if (config.tipoConstruccion === 'puerta_enchapada') structurePrice *= 1.3;
        } else {
          let base = 5000;
          if (muebleSeleccionado?.id?.includes('puerta')) {
            const tier = mat?.tier || 'basica';
            if (config.uso === 'exterior') {
              if (tier === 'basica') base = costos.madera_p_ext_basica;
              else if (tier === 'premium') base = costos.madera_p_ext_premium;
              else base = costos.madera_p_ext_intermedia;
            } else {
              if (tier === 'basica') base = costos.madera_p_int_basica;
              else if (tier === 'premium') base = costos.madera_p_int_premium;
              else base = costos.madera_p_int_intermedia;
            }
          } else {
            base = mat ? costos[`madera_${mat.tier}`] : costos.madera_basica;
            if (config.uso === 'exterior') base *= costos.factor_exterior;
          }
          let pies = (anchoSafe / 2.5) * (config.espesorPulgadas || 2) * (largoSafe / 100) * 0.3;
          structurePrice = pies * base;
          if (config.tipoPatas === 'metal') structurePrice += costos.patas_metal;
          if (config.tipoPatas === 'madera') structurePrice += costos.patas_madera;
          if (config.marco) structurePrice += (base * 30);
          structurePrice += ((Number(config.cantCajones) || 0) * costos.costo_cajon_completo);
          structurePrice += ((Number(config.cantPuertas) || 0) * costos.costo_puerta_mueble);
        }

        let finalPrice = structurePrice * (Number(config.cantidad) || 1);

        if (config.tipoConstruccion === 'maciza' || config.tipoConstruccion === 'puerta_placa' || config.tipoConstruccion === 'puerta_enchapada') {
          if (config.acabado === 'cetol') finalPrice += costos.term_cetol;
          if (config.acabado === 'laca') finalPrice += costos.term_laca;
        }
        if (config.tipoConstruccion === 'chapa_inyectada') {
          if (config.chapa_color === 'oxidado') finalPrice += costos.term_pintura_chapa_oxi;
          else finalPrice += costos.term_pintura_chapa_std;
        }
        return { matId, precioTotal: Math.round((isNaN(finalPrice) ? 0 : finalPrice) / 1000) * 1000 };
      });
      setPreciosMultiples(calculados);
    }
  }, [config, muebleSeleccionado, paso, costos, maderas, catSeleccionada]);

  const agregarAlCarrito = () => {
    const nuevosItems = preciosMultiples.map(p => {
      const mat = maderas.find(m => m.id === p.matId);
      return {
        id: Date.now() + Math.random(),
        mueble: muebleSeleccionado,
        config: { ...config, material: p.matId, materialNombre: mat?.nombre || 'Madera', espesorVisual: config.tipoConstruccion === 'maciza' ? `${config.espesorPulgadas}"` : espesorVisual },
        precio: p.precioTotal
      };
    });
    setCarrito(prev => [...prev, ...nuevosItems]);
    setPaso(1);
    setCatSeleccionada(null);
  };

  const guardarPresupuestoInterno = async () => {
    if (!cliente.nombre || !vendedorActual) return alert("Falta el nombre del cliente o asesor.");
    const total = carrito.reduce((a, b) => a + (b.precio || 0), 0) + (Number(config.envio) || 0) + (Number(config.instalacion) || 0);

    let nextOrderNumber = 1;
    try {
      const q = query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'orders'), orderBy('orderNumber', 'desc'), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) nextOrderNumber = (snap.docs[0].data().orderNumber || 0) + 1;
    } catch (e) { }

    try {
      await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'orders'), {
        orderNumber: nextOrderNumber,
        cliente,
        vendedor: vendedorActual,
        items: carrito,
        extras: { envio: Number(config.envio) || 0, instalacion: Number(config.instalacion) || 0 },
        total,
        estado: 'pendiente',
        createdAt: Date.now()
      });
      alert(`Presupuesto #${nextOrderNumber.toString().padStart(4, '0')} Guardado Exitosamente.`);
      setCarrito([]);
      setCliente({ nombre: '', canal: 'whatsapp', telefono: '' });
      setConfig(p => ({ ...p, envio: '', instalacion: '' }));
      setCheckoutPaso('form');
      setShowEnvio(false);
      setShowInstalacion(false);
      setPaso(1);
    } catch (e) { alert("Error al guardar."); }
  };

  const downloadPDF = useCallback(() => {
    if (!pdfLibLoaded) return alert("Cargando generador de PDF, intenta en unos segundos...");

    const element = document.createElement('div');
    const total = carrito.reduce((a, b) => a + (b.precio || 0), 0) + (Number(config.envio) || 0) + (Number(config.instalacion) || 0);
    const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const idPresupuesto = Math.floor(1000 + Math.random() * 9000);

    const itemsHtml = carrito.map(item => {
      const visual = getMaterialVisual(item.config, maderas, melaminas);
      let visualHtml = '';
      if (visual.type === 'img' && visual.value) {
        visualHtml = `<img src="${getDirectDriveUrl(visual.value)}" style="width:50px;height:50px;border-radius:4px;object-fit:cover;border:1px solid #ddd;display:block;margin-right:15px;">`;
      } else if (visual.type === 'css') {
        visualHtml = `<span style="display:block;width:50px;height:50px;border-radius:4px;background:${visual.value};margin-right:15px;border:1px solid #ddd;"></span>`;
      } else {
        visualHtml = `<div style="width:50px;height:50px;border-radius:4px;background:#eee;margin-right:15px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:24px">${item.mueble?.imagen || '📦'}</div>`
      }

      let acabadoLabel = item.config?.acabado || 'Natural';
      const lineItems = [
        { label: 'MATERIAL', value: item.config?.materialNombre || 'Std' },
        { label: 'MEDIDAS', value: `${item.config?.ancho || 0}x${item.config?.largo || 0}${item.config?.profundidad ? `x${item.config.profundidad}` : ''}cm` },
        { label: 'USO', value: (item.config?.uso || 'interior').toUpperCase() },
        { label: 'TERMINACIÓN', value: acabadoLabel.toUpperCase() }
      ];

      const detailsHtml = lineItems.map((d, i) => `
        <span style="display:inline-block; font-size: 10px; color: #444; margin-right: 8px; ${i > 0 ? 'padding-left: 8px; border-left: 1px solid #ccc;' : ''}">
           <strong style="color: #36251B; font-weight: 800;">${d.label}:</strong> ${d.value}
        </span>
      `).join('');

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 15px 10px; vertical-align: top;">
             <div style="display:flex; align-items: center;">
                ${visualHtml}
                <div>
                    <strong style="font-size: 14px; display:block; margin-bottom: 6px; text-transform: uppercase; color: #333; font-weight: 900; letter-spacing: 0.5px;">${item.mueble?.nombre || 'Mueble a Medida'}</strong>
                    <div style="line-height: 1.6;">
                       ${detailsHtml}
                    </div>
                </div>
             </div>
          </td>
          <td style="padding: 15px 10px; text-align:right; vertical-align: middle; font-weight: bold; font-size: 14px; color: #333;">
            $${new Intl.NumberFormat('es-AR').format(item.precio || 0)}
          </td>
        </tr>`;
    }).join('');

    element.innerHTML = `
      <div style="width: 210mm; height: 297mm; max-height: 297mm; overflow: hidden; box-sizing: border-box; font-family: 'Montserrat', sans-serif; color: #333; background: white; display: flex; flex-direction: column; position: relative; padding: 30px 40px 0 40px; page-break-inside: avoid;">
        <div style="display:flex; justify-content:space-between; align-items: flex-end; border-bottom: 4px solid #36251B; padding-bottom: 15px; margin-bottom: 20px;">
           <div style="display: flex; flex-direction: column;">
               <img src="${getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC}" style="height:50px; object-fit: contain; margin-bottom: 5px; align-self: flex-start;" />
               <div style="font-size: 10px; color: #555; line-height: 1.2; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  EBE MUEBLES<br/>
                  ALTA GRACIA, CÓRDOBA
               </div>
           </div>
           <div style="text-align:right;">
             <h1 style="margin:0; font-size:42px; color:#36251B; text-transform:uppercase; font-weight: 900; letter-spacing: -1px; line-height: 1;">PRESUPUESTO</h1>
             <div style="margin-top: 5px; color:#1C2E20; font-size: 18px; font-weight: 700;"># ${idPresupuesto}</div>
           </div>
        </div>
        <div style="margin-bottom: 20px; background: #FAFAFA; padding: 20px 25px; border-left: 6px solid #36251B; display: flex; justify-content: space-between; align-items: center; border-radius: 4px;">
           <div style="max-width: 60%;">
              <span style="font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 5px;">CLIENTE</span>
              <h2 style="margin: 0; font-size: 20px; color: #222; font-weight: 800; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cliente.nombre || 'CONSUMIDOR FINAL'}</h2>
           </div>
           <div style="text-align: right; font-size: 11px; color: #555;">
              <div style="margin-bottom: 4px;"><strong style="color: #333; font-weight: 800;">FECHA:</strong> ${fecha}</div>
              <div style="margin-bottom: 4px;"><strong style="color: #333; font-weight: 800;">TEL:</strong> ${cliente.telefono || '-'}</div>
              <div><strong style="color: #333; font-weight: 800;">ASESOR:</strong> ${vendedorActual || '-'}</div>
           </div>
        </div>
        <table style="width:100%; border-collapse: collapse; margin-bottom:20px;">
           <thead>
              <tr style="background:#36251B; color:white;">
                  <th style="padding:12px 15px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing: 1px; font-weight: 800;">DETALLE DEL PEDIDO</th>
                  <th style="padding:12px 15px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing: 1px; font-weight: 800;">VALOR</th>
              </tr>
           </thead>
           <tbody>${itemsHtml}</tbody>
        </table>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
           <div style="width: 320px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #666; padding-bottom: 8px; border-bottom: 1px solid #eee;">
                 <span style="font-weight: 600;">ENVÍO</span>
                 <span>${config.envio ? `$${config.envio}` : 'A Cotizar'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; color: #666; padding-bottom: 8px; border-bottom: 1px solid #eee;">
                 <span style="font-weight: 600;">INSTALACIÓN</span>
                 <span>${config.instalacion ? `$${config.instalacion}` : 'A Cotizar'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                 <span style="font-weight: 900; font-size: 22px; color: #333; text-transform: uppercase;">TOTAL</span>
                 <span style="font-weight: 900; font-size: 26px; color: #333;">$${new Intl.NumberFormat('es-AR').format(total)}</span>
              </div>
              <div style="text-align: right; font-size: 9px; color: #999; font-weight: 500; font-style: italic;">
                 * Los precios son estimativos y sujetos a verificación final vía WhatsApp.
              </div>
           </div>
        </div>
        <div style="margin-top: auto; background: #F5F5F5; padding: 25px 40px; margin-left: -40px; margin-right: -40px; border-top: 2px solid #36251B;">
           <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 20px;">
               <div>
                  <strong style="color: #333; display: block; margin-bottom: 8px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; font-weight: 900;">Condiciones Comerciales</strong>
                  <p style="font-size: 9px; color: #555; line-height: 1.6; margin: 0; text-align: justify;">
                    Forma de Pago: 70% de anticipo para congelar precio e iniciar el trabajo, y el 30% restante contra entrega. Los precios son fijos y en Pesos Argentinos una vez abonada la seña. Validez del presupuesto: 10 días hábiles.
                  </p>
               </div>
               <div>
                  <strong style="color: #333; display: block; margin-bottom: 8px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; font-weight: 900;">Entregas y Materiales</strong>
                  <p style="font-size: 9px; color: #555; line-height: 1.6; margin: 0; text-align: justify;">
                     El tiempo de demora se estipula una vez entregada la seña. Todos nuestros productos son elaborados con madera maciza seleccionada por su calidad y durabilidad. Al ser un material noble y vivo, es natural que presente variaciones de tono o movimientos sutiles ante cambios climáticos; estas no son fallas, sino la huella de autenticidad de la madera real. En eBe Muebles rechazamos el uso de enchapados: trabajamos exclusivamente con madera entera y procesos artesanales, garantizando una pieza única, resistente y con estética atemporal.
                  </p>
               </div>
           </div>
           <div style="text-align:center; padding-top: 15px; border-top: 1px solid #ddd; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="color:#1C2E20; font-size:9px; letter-spacing:3px; text-transform: uppercase; font-weight: 900;">Gracias por elegir diseño argentino</div>
           </div>
        </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `Presupuesto_eBe_${cliente.nombre || 'Cliente'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 5, useCORS: true, logging: false, letterRendering: true, scrollX: 0, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save();
  }, [carrito, cliente, config.envio, config.instalacion, vendedorActual, pdfLibLoaded, maderas, melaminas, logoUrl]);

  const enviarWhatsapp = useCallback(async () => {
    const total = carrito.reduce((a, b) => a + (b.precio || 0), 0) + (Number(config.envio) || 0) + (Number(config.instalacion) || 0);
    let nextOrderNumber = 1980;
    try {
      const q = query(
        collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'orders'),
        orderBy('orderNumber', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const lastData = querySnapshot.docs[0].data();
        if (typeof lastData.orderNumber === 'number') {
          nextOrderNumber = lastData.orderNumber + 1;
        }
      }
    } catch (e) { console.error("Error obteniendo número", e); }

    try {
      await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'orders'), {
        orderNumber: nextOrderNumber,
        cliente,
        vendedor: vendedorActual,
        items: carrito,
        extras: { envio: Number(config.envio) || 0, instalacion: Number(config.instalacion) || 0 },
        total,
        estado: 'pendiente',
        createdAt: Date.now()
      });
    } catch (e) { }

    let text = `👋 Hola *eBe Muebles*, soy ${cliente.nombre}.\n📍 Asesor: ${vendedorActual}\n📋 *PEDIDO WEB #${nextOrderNumber}*\n\n`;
    carrito.forEach(i => text += `🔹 *${i.mueble?.nombre || 'Mueble'}* \n`);
    text += `\n💰 *Total Estimado: $${new Intl.NumberFormat('es-AR').format(total)}*`;
    text += `\n\n(He descargado el PDF del presupuesto)`;

    window.open(`https://wa.me/${DATOS_CONTACTO.telefono_whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
    downloadPDF();
  }, [carrito, cliente, config.envio, config.instalacion, vendedorActual, downloadPDF]);

  if (!vendedorActual && !isAdmin) {
    return (
      <div className={`min-h-screen ${THEME.bg} flex items-center justify-center p-6 font-sans`}>
        <div className="max-w-md w-full text-center">
          <img src={getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC} alt="Logo" onClick={handleAdminLogin} className="h-16 mx-auto mb-8 opacity-80 cursor-pointer hover:opacity-100 transition-opacity" />
          <h2 className="text-xl font-bold text-[#36251B] mb-6 tracking-tight">Seleccioná tu perfil</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vendedores.map(v => (
              <button key={v.id} onClick={() => setVendedorActual(v.nombre)} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-[#E0D8CC] hover:border-[#36251B] hover:shadow-md transition-all group">
                <div className="w-16 h-16 rounded-full bg-[#F4F1EB] border border-[#E0D8CC] flex items-center justify-center text-[#36251B] font-bold text-2xl group-hover:bg-[#36251B] group-hover:border-[#36251B] group-hover:text-white transition-colors overflow-hidden shadow-sm">
                  {v.avatarUrl ? <img src={v.avatarUrl} className="w-full h-full object-cover" /> : v.nombre.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-[#36251B]">{v.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col`}>
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#36251B] font-black text-xl tracking-tighter"><Settings size={22} className="animate-spin-slow" /> ADMIN</div>
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'dashboard', icon: Users, label: 'Asesores' },
              { id: 'orders', icon: ListOrdered, label: 'Pedidos' },
              { id: 'prices', icon: Coins, label: 'Costos' },
              { id: 'materials', icon: TreePine, label: 'Maderas' },
            ].map(i => (
              <button key={i.id} onClick={() => setAdminTab(i.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${adminTab === i.id ? 'bg-white text-[#36251B] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <i.icon size={16} /> {i.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { setIsAdmin(false); setVendedorActual(null); }} className="text-slate-400 hover:text-red-500 font-bold text-sm flex items-center gap-2"><LogOut size={18} /> Salir</button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden bg-white border-b border-slate-200 p-2 flex overflow-x-auto gap-2 no-scrollbar">
        {[{ id: 'dashboard', label: 'Asesores' }, { id: 'orders', label: 'Pedidos' }, { id: 'prices', label: 'Costos' }, { id: 'materials', label: 'Maderas' }].map(i => (
          <button key={i.id} onClick={() => setAdminTab(i.id)} className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${adminTab === i.id ? 'bg-[#36251B] text-white' : 'bg-slate-100 text-slate-600'}`}>{i.label}</button>
        ))}
      </div>

      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {adminTab === 'dashboard' && (
          <div className="space-y-6">
            {!adminSelectedVendor ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">Equipo de Asesores</h2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                  <h3 className="font-bold text-sm text-[#36251B] uppercase mb-4">Agregar Nuevo Asesor</h3>
                  <div className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre</label>
                      <input value={newVendor.nombre} onChange={e => setNewVendor({ ...newVendor, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#36251B] outline-none" placeholder="Ej: Marcos" />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">URL Foto (Opcional)</label>
                      <input value={newVendor.avatarUrl} onChange={e => setNewVendor({ ...newVendor, avatarUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#36251B] outline-none" placeholder="https://..." />
                    </div>
                    <button onClick={addVendor} className="bg-[#36251B] text-white font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#1F140E] transition-colors whitespace-nowrap">Agregar</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {vendedores.map(v => {
                    const vOrdersAll = ordersList.filter(o => o.vendedor === v.nombre);
                    const vOrdersApproved = vOrdersAll.filter(o => o.estado === 'aprobado');

                    return (
                      <div key={v.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#36251B] hover:shadow-md transition-all group relative overflow-hidden">
                        {editVendorId === v.id ? (
                          <div className="p-4 space-y-3 bg-slate-50 h-full flex flex-col justify-center">
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase">Nombre</label><input value={editVendorData.nombre} onChange={e => setEditVendorData({ ...editVendorData, nombre: e.target.value })} className="w-full border p-1.5 rounded text-xs font-bold" /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase">URL Foto</label><input value={editVendorData.avatarUrl} onChange={e => setEditVendorData({ ...editVendorData, avatarUrl: e.target.value })} className="w-full border p-1.5 rounded text-xs" /></div>
                            <div className="flex gap-2 pt-2"><button onClick={saveVendor} className="flex-1 bg-emerald-600 text-white text-xs font-bold py-1.5 rounded">Guardar</button><button onClick={() => setEditVendorId(null)} className="flex-1 bg-slate-300 text-slate-700 text-xs font-bold py-1.5 rounded">Cancelar</button></div>
                          </div>
                        ) : (
                          <div className="p-6 cursor-pointer" onClick={() => setAdminSelectedVendor(v)}>
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); startEditVendor(v); }} className="p-2 bg-slate-50 text-slate-400 hover:text-[#36251B] rounded-full"><Edit size={14} /></button>
                              <button onClick={(e) => { e.stopPropagation(); deleteVendor(v.id); }} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full"><Trash2 size={14} /></button>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-14 h-14 rounded-full bg-[#F4F1EB] border border-slate-200 flex items-center justify-center text-[#36251B] font-bold text-xl overflow-hidden shadow-sm">
                                {v.avatarUrl ? <img src={v.avatarUrl} className="w-full h-full object-cover" /> : v.nombre.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-slate-800">{v.nombre}</h3>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cotizaciones Realizadas</div>
                                <div className="text-xl font-bold text-slate-700">{vOrdersAll.length}</div>
                              </div>
                              <div>
                                <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Ventas Aprobadas</div>
                                <div className="text-xl font-bold text-emerald-600">{vOrdersApproved.length}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="animate-fade-in">
                <button onClick={() => setAdminSelectedVendor(null)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#36251B] mb-6 transition-colors"><ArrowLeft size={16} /> Volver al Equipo</button>

                {(() => {
                  const v = adminSelectedVendor;
                  const allOrders = ordersList.filter(o => o.vendedor === v.nombre);
                  const approvedOrders = allOrders.filter(o => o.estado === 'aprobado');

                  const byChannelAll = allOrders.reduce((acc, curr) => { acc[curr.cliente?.canal] = (acc[curr.cliente?.canal] || 0) + 1; return acc; }, {});
                  const byChannelApproved = approvedOrders.reduce((acc, curr) => { acc[curr.cliente?.canal] = (acc[curr.cliente?.canal] || 0) + 1; return acc; }, {});

                  const conversionRate = allOrders.length > 0 ? Math.round((approvedOrders.length / allOrders.length) * 100) : 0;
                  const totalApprovedAmount = approvedOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);

                  return (
                    <>
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-20 h-20 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center text-[#36251B] font-bold text-3xl overflow-hidden shadow-sm">
                          {v.avatarUrl ? <img src={v.avatarUrl} className="w-full h-full object-cover" /> : v.nombre.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold tracking-tight text-[#36251B]">{v.nombre}</h2>
                          <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mt-1">{approvedOrders.length} Presupuestos Aprobados</div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 max-w-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Recaudado (Monto Aprobado)</div>
                        <div className="text-4xl font-bold text-emerald-600">${new Intl.NumberFormat('es-AR').format(totalApprovedAmount)}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tasa de Cierre</div>
                          <div className="text-4xl font-bold text-emerald-600">{conversionRate}%</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Origen de Consultas (Totales)</div>
                          <div className="space-y-2">
                            {Object.keys(byChannelAll).length > 0 ? Object.entries(byChannelAll).map(([ch, qty]) => (
                              <div key={ch} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                <span className="font-semibold text-slate-600 capitalize">{ch}</span>
                                <span className="font-bold text-slate-700">{qty}</span>
                              </div>
                            )) : <div className="text-xs text-slate-400 italic">Sin datos</div>}
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4">Origen de Ventas (Aprobadas)</div>
                          <div className="space-y-2">
                            {Object.keys(byChannelApproved).length > 0 ? Object.entries(byChannelApproved).map(([ch, qty]) => (
                              <div key={ch} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                <span className="font-semibold text-emerald-700 capitalize">{ch}</span>
                                <span className="font-bold text-emerald-700">{qty}</span>
                              </div>
                            )) : <div className="text-xs text-slate-400 italic">Sin ventas cerradas</div>}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-[#36251B] mb-4">Historial de Operaciones Generadas</h3>
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4"># Pedido</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Detalle</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {allOrders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <button onClick={() => updateOrderStatus(order.id, order.estado)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${order.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}>
                                      {order.estado === 'aprobado' ? 'Aprobado' : 'Pendiente'}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-[#36251B]">#{order.orderNumber?.toString().padStart(4, '0') || '0000'}</td>
                                  <td className="px-6 py-4 text-slate-600 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{order.cliente?.nombre || 'Sin Nombre'}</div>
                                    <div className="text-xs text-slate-500 capitalize">{order.cliente?.canal || 'whatsapp'}</div>
                                  </td>
                                  <td className="px-6 py-4 text-xs text-slate-600">
                                    {order.items?.map((i, idx) => (
                                      <div key={idx} className="mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">• {i.mueble?.nombre || 'Item'}</div>
                                    ))}
                                  </td>
                                </tr>
                              ))}
                              {allOrders.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-slate-500">Sin operaciones registradas.</td></tr>}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {adminTab === 'prices' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">Actualización de Costos</h2>
              <button onClick={saveCostos} className="bg-[#36251B] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1F140E] shadow-sm"><Save size={16} /> Guardar Todo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(CATEGORIAS_COSTOS).map(([cat, keys]) => (
                <div key={cat} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-sm text-[#1C2E20] uppercase tracking-wide mb-5 border-b border-slate-100 pb-2">{cat}</h3>
                  <div className="space-y-4">
                    {keys.map(k => (
                      <div key={k} className="flex justify-between items-center gap-4">
                        <label className="text-xs font-semibold text-slate-600 uppercase flex-1">{k.replace(/_/g, ' ')}</label>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg focus-within:border-[#36251B] transition-colors overflow-hidden w-32">
                          <span className="text-slate-400 font-bold px-3 text-sm">$</span>
                          <input value={new Intl.NumberFormat('es-AR').format(costos[k] || 0)} onChange={e => handleCostoChange(k, e.target.value)} className="w-full bg-transparent p-2 text-sm font-bold text-slate-800 outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'materials' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">Catálogo de Maderas</h2>
              <button onClick={uploadDefaultMaterials} className="bg-[#1C2E20] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#152418] shadow-sm"><Save size={16} /> Sincronizar Maderas Base</button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
              <h3 className="font-bold text-sm text-[#1C2E20] uppercase mb-4">Agregar Nueva Madera</h3>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full"><label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre</label><input value={newMaterial.nombre} onChange={e => setNewMaterial({ ...newMaterial, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none" placeholder="Ej: Roble" /></div>
                <div className="w-full md:w-48"><label className="text-xs font-semibold text-slate-500 mb-1 block">Categoría Costo</label>
                  <select value={newMaterial.tier} onChange={e => setNewMaterial({ ...newMaterial, tier: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none">
                    <option value="basica">Básica</option><option value="intermedia">Intermedia</option><option value="premium">Premium</option>
                  </select>
                </div>
                <div className="flex-1 w-full"><label className="text-xs font-semibold text-slate-500 mb-1 block">URL Foto</label><input value={newMaterial.src} onChange={e => setNewMaterial({ ...newMaterial, src: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none" placeholder="https://..." /></div>
                <button onClick={addMaterial} className="bg-[#36251B] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1F140E]">Agregar</button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {maderas.map(m => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                  {editMaterialId === m.id ? (
                    <div className="p-4 space-y-3 bg-slate-50">
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Nombre</label><input value={editMaterialData.nombre} onChange={e => setEditMaterialData({ ...editMaterialData, nombre: e.target.value })} className="w-full border p-1.5 rounded text-xs font-bold" /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Categoría</label>
                        <select value={editMaterialData.tier} onChange={e => setEditMaterialData({ ...editMaterialData, tier: e.target.value })} className="w-full border p-1.5 rounded text-xs font-bold">
                          <option value="basica">Básica</option><option value="intermedia">Intermedia</option><option value="premium">Premium</option>
                        </select>
                      </div>
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">URL Foto</label><input value={editMaterialData.src} onChange={e => setEditMaterialData({ ...editMaterialData, src: e.target.value })} className="w-full border p-1.5 rounded text-xs" /></div>
                      <div className="flex gap-2 pt-2"><button onClick={saveMaterial} className="flex-1 bg-emerald-600 text-white text-xs font-bold py-1.5 rounded">Guardar</button><button onClick={() => setEditMaterialId(null)} className="flex-1 bg-slate-300 text-slate-700 text-xs font-bold py-1.5 rounded">Cancelar</button></div>
                    </div>
                  ) : (
                    <>
                      <div className="h-32 w-full overflow-hidden relative">
                        <img src={getDirectDriveUrl(m.src)} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditMaterial(m)} className="bg-white/90 p-1.5 rounded-full text-slate-700 hover:text-[#36251B] shadow-sm"><Edit size={14} /></button>
                          <button onClick={() => deleteMaterial(m.id)} className="bg-white/90 p-1.5 rounded-full text-slate-700 hover:text-red-500 shadow-sm"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide">{m.nombre}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.tier}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'orders' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Control de Pedidos</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4"># / Fecha</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Asesor</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersList.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <button onClick={() => updateOrderStatus(order.id, order.estado)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${order.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}>
                            {order.estado === 'aprobado' ? 'Aprobado' : 'Pendiente'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#36251B]">#{order.orderNumber?.toString().padStart(4, '0') || '0000'}</div>
                          <div className="text-[10px] font-semibold text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{order.cliente?.nombre || 'Sin Nombre'}</div>
                          <div className="text-xs text-slate-500 capitalize flex items-center gap-1"><Phone size={10} /> {order.cliente?.telefono || '-'} • {order.cliente?.canal || 'WhatsApp'}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{order.vendedor || '-'}</td>
                        <td className="px-6 py-4 text-right font-bold text-[#1C2E20]">${new Intl.NumberFormat('es-AR').format(order.total || 0)}</td>
                      </tr>
                    ))}
                    {ordersList.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-slate-500 font-medium">No hay pedidos registrados aún.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <GlobalStyles />
      <BackgroundAmbience />

      {paso > 0 && paso !== 4 && carrito.length > 0 && (
        <button onClick={() => setPaso(4)} className={`fixed bottom-8 right-6 ${THEME.primary} text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all z-50 flex items-center justify-center`}>
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-[#1C2E20] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#F4F1EB]">{carrito.length}</span>
        </button>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6 animate-fade-in" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={32} /></button>
          <img src={getDirectDriveUrl(selectedImage.src)} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          <h3 className="text-white font-bold tracking-[0.3em] uppercase mt-8 text-2xl font-sans">{selectedImage.nombre || selectedImage.alt}</h3>
        </div>
      )}

      <div className={`min-h-screen font-sans ${THEME.textMain} pb-10`}>

        {paso > 0 && (
          <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-[#E0D8CC] py-4 px-6 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setPaso(paso === 4 ? 1 : paso - 1)} className={`p-2 rounded-full hover:bg-slate-100 text-[#36251B] transition-colors`}><ArrowLeft size={20} /></button>
              <h1 className="text-lg font-bold tracking-tight text-[#36251B] uppercase">{getHeaderTitle()}</h1>
            </div>
            <div className="flex items-center gap-5">
              <div onClick={handleAdminLogin} className="cursor-pointer"><img src={getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC} alt="Logo" className="h-8 w-auto opacity-90 hover:opacity-100 object-contain drop-shadow-sm" /></div>
            </div>
          </header>
        )}

        {paso === 0 && (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
            <div className="mb-12 text-center relative z-10 flex flex-col items-center">
              <img
                src={getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC}
                alt="eBe Muebles Logo"
                onClick={handleAdminLogin}
                className="w-40 md:w-48 h-auto mb-6 drop-shadow-sm opacity-90 cursor-pointer"
              />
              <button onClick={() => setVendedorActual(null)} className="flex items-center gap-2 bg-white/60 hover:bg-white border border-[#E0D8CC] px-4 py-2 rounded-full shadow-sm transition-all group mt-2">
                <div className="w-6 h-6 rounded-full bg-[#36251B] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-inner">
                  {vendedores.find(v => v.nombre === vendedorActual)?.avatarUrl ? <img src={vendedores.find(v => v.nombre === vendedorActual)?.avatarUrl} className="w-full h-full object-cover" /> : vendedorActual?.charAt(0) || 'U'}
                </div>
                <span className="text-[10px] font-semibold text-[#36251B] tracking-wide group-hover:text-[#1C2E20]">Asesor: {vendedorActual}</span>
                <RefreshCw size={14} className="text-[#6B635A] group-hover:rotate-180 transition-transform duration-500 ml-1" />
              </button>
            </div>

            <div className="w-full max-w-xs space-y-4 z-10">
              <button onClick={() => setPaso(1)} className={`w-full py-5 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase transition-all shadow-md ${THEME.primary} text-white hover:bg-[#1F140E]`}>Cotizar</button>
            </div>
          </div>
        )}

        {paso === 1 && (
          <div className="flex flex-col justify-center max-w-3xl mx-auto p-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIAS_PRINCIPALES.map(cat => (
                <button key={cat.id} onClick={() => { setCatSeleccionada(cat); if (cat.destino === 'directo') { setMuebleSeleccionado(cat.item); setPaso(3); } else { setPaso(2); } }}
                  className="bg-white border border-[#E0D8CC] aspect-square rounded-2xl p-4 flex flex-col items-center justify-center gap-4 hover:border-[#36251B] hover:shadow-md transition-all group">
                  <div className={`p-4 rounded-full bg-[#F4F1EB] text-[#1C2E20] group-hover:scale-110 transition-transform`}><IconRenderer name={cat.icon} size={28} /></div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#36251B]">{cat.label}</h2>
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="max-w-2xl mx-auto p-6 space-y-3 animate-fade-in">
            {LISTA_MUEBLES_GRAL.map(item => (
              <button key={item.id} onClick={() => { setMuebleSeleccionado(item); setPaso(3); }} className="w-full bg-white border border-[#E0D8CC] p-5 rounded-2xl flex items-center justify-between hover:border-[#36251B] hover:shadow-sm transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EB] text-[#1C2E20] flex items-center justify-center"><IconRenderer name={item.icon} size={20} /></div>
                  <h3 className="font-bold uppercase tracking-widest text-xs text-[#36251B]">{item.nombre}</h3>
                </div>
                <ChevronRight size={18} className="text-[#6B635A] group-hover:text-[#1C2E20]" />
              </button>
            ))}
          </div>
        )}

        {paso === 3 && (
          <div className="max-w-4xl mx-auto p-6 animate-fade-in space-y-6 pb-32">

            <div className="bg-white border border-[#E0D8CC] rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                <div className="flex-1 min-w-[80px]"><InputMedida label="Ancho (cm)" val={config.ancho} onChange={v => setConfig({ ...config, ancho: v })} /></div>
                <div className="flex-1 min-w-[80px]"><InputMedida label="Largo (cm)" val={config.largo} onChange={v => setConfig({ ...config, largo: v })} /></div>

                {(!muebleSeleccionado?.id?.includes('mesa') && !muebleSeleccionado?.id?.includes('puerta') && !muebleSeleccionado?.id?.includes('tapa') && !muebleSeleccionado?.id?.includes('escalon')) && (
                  <div className="flex-1 min-w-[80px]"><InputMedida label="Prof. (cm)" val={config.profundidad} onChange={v => setConfig({ ...config, profundidad: v })} /></div>
                )}

                {(config.tipoConstruccion === 'maciza') ? (
                  <div className="flex-1 min-w-[100px]"><label className="text-[10px] font-bold text-[#6B635A] uppercase tracking-wider mb-1.5 block">Espesor</label>
                    <select value={config.espesorPulgadas} onChange={e => setConfig({ ...config, espesorPulgadas: Number(e.target.value) })} className="w-full bg-[#F4F1EB] border border-[#E0D8CC] p-3 rounded-xl text-center font-bold text-[#36251B] focus:border-[#36251B] outline-none appearance-none">
                      <option value={1}>1"</option><option value={1.5}>1 ½"</option><option value={2}>2"</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex-1 min-w-[100px] opacity-60"><label className="text-[10px] font-bold text-[#6B635A] uppercase tracking-wider mb-1.5 block">Espesor</label><div className="w-full bg-[#F4F1EB] border border-[#E0D8CC] p-3 rounded-xl text-center font-bold text-[#36251B]">{espesorVisual}</div></div>
                )}

                <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-bold text-[#6B635A] uppercase tracking-wider mb-1.5 block">Cantidad</label>
                  <div className="flex items-center bg-[#F4F1EB] border border-[#E0D8CC] rounded-xl overflow-hidden focus-within:border-[#36251B]">
                    <button onClick={() => setConfig(p => ({ ...p, cantidad: Math.max(1, p.cantidad - 1) }))} className="px-4 py-3 text-[#36251B] hover:bg-slate-200 font-bold">-</button>
                    <input type="number" value={config.cantidad} onChange={e => setConfig({ ...config, cantidad: Math.max(1, Number(e.target.value)) })} className="w-full bg-transparent text-center font-bold text-[#1A1816] outline-none" />
                    <button onClick={() => setConfig(p => ({ ...p, cantidad: p.cantidad + 1 }))} className="px-4 py-3 text-[#36251B] hover:bg-slate-200 font-bold">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E0D8CC] rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap gap-4">
                {(catSeleccionada?.id === 'cat_mesa' || catSeleccionada?.id === 'cat_puerta' || catSeleccionada?.id === 'cat_tapas' || catSeleccionada?.id === 'cat_escalones') && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-[#6B635A] uppercase tracking-wider mb-2 block">Ubicación</label>
                    <div className="flex gap-2">
                      <button onClick={() => setConfig({ ...config, uso: 'interior' })} className={`flex-1 py-2.5 text-[10px] font-semibold uppercase rounded-xl transition-all border ${config.uso === 'interior' ? 'bg-[#36251B] text-white border-[#36251B] shadow-sm' : 'bg-[#F4F1EB] border-[#E0D8CC] text-[#6B635A] hover:border-[#36251B]'}`}>Interior</button>
                      <button onClick={() => setConfig({ ...config, uso: 'exterior' })} className={`flex-1 py-2.5 text-[10px] font-semibold uppercase rounded-xl transition-all border ${config.uso === 'exterior' ? 'bg-[#36251B] text-white border-[#36251B] shadow-sm' : 'bg-[#F4F1EB] border-[#E0D8CC] text-[#6B635A] hover:border-[#36251B]'}`}>Exterior</button>
                    </div>
                  </div>
                )}

                {config.tipoConstruccion === 'maciza' && (
                  <div className="flex-1 min-w-[280px]">
                    <label className="text-[10px] font-bold text-[#6B635A] uppercase tracking-wider mb-2 block">Terminación</label>
                    <div className="flex gap-2">
                      {ACABADOS.map(a => (
                        <button key={a.id} onClick={() => setConfig({ ...config, acabado: a.id })} className={`flex-1 py-2.5 px-1 text-[9px] md:text-[10px] font-semibold uppercase rounded-xl transition-all border ${config.acabado === a.id ? 'bg-[#1C2E20] text-white border-[#1C2E20] shadow-sm' : 'bg-[#F4F1EB] border-[#E0D8CC] text-[#6B635A] hover:border-[#36251B]'}`}>{a.nombre}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {muebleSeleccionado?.id === 'mesa_custom' && !isMDF && (
                <div className="w-full mt-5 border-t border-[#E0D8CC] pt-5">
                  <label className="text-[10px] font-bold text-[#6B635A] uppercase tracking-wider mb-2 block">Patas / Base</label>
                  <div className="flex gap-2 mb-4">
                    {['sin_patas', 'madera', 'metal'].filter(k => !(config.uso === 'exterior' && k === 'madera')).map(k => (
                      <button key={k} onClick={() => setConfig({ ...config, tipoPatas: k })} className={`flex-1 py-2.5 text-[10px] font-semibold uppercase rounded-xl transition-all border ${config.tipoPatas === k ? 'bg-[#36251B] text-white border-[#36251B]' : 'bg-[#F4F1EB] border-[#E0D8CC] text-[#6B635A] hover:border-[#36251B]'}`}>{k.replace('_', ' ')}</button>
                    ))}
                  </div>
                  {config.tipoPatas !== 'sin_patas' && (
                    <div className="grid grid-cols-3 gap-3">
                      {OPCIONES_PATAS[config.tipoPatas]?.map(p => {
                        const Icon = p.icon;
                        return (
                          <button key={p.id} onClick={() => setConfig({ ...config, modeloPatas: p.id })} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${config.modeloPatas === p.id ? 'bg-[#F4F1EB] text-[#1C2E20] border-[#1C2E20]' : 'bg-white border-[#E0D8CC] text-[#6B635A] hover:border-[#36251B]'}`}>
                            {Icon && <Icon size={20} />} <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">{p.nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {(muebleSeleccionado?.id?.includes('puerta') || config.tipoConstruccion === 'chapa_inyectada') && !((muebleSeleccionado?.id === 'mesa_custom' && config.uso === 'exterior')) && (
                <div className="mt-5 border-t border-[#E0D8CC] pt-5">
                  <button onClick={() => setConfig({ ...config, marco: !config.marco })} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${config.marco ? 'bg-[#36251B] text-white border-[#36251B]' : 'border-[#E0D8CC] bg-white text-[#6B635A]'}`}>
                    <span className="text-xs font-bold uppercase">Incluir Marco y Contramarco {config.tipoConstruccion === 'chapa_inyectada' ? '(Metálico)' : ''}</span>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center ${config.marco ? `bg-white/20 border-transparent text-white` : 'border-[#9C948A]'}`}>{config.marco && <Check size={14} />}</div>
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className={`flex items-center justify-between mb-4`}><div className="flex items-center gap-2 text-[#36251B]"><TreePine size={18} /> <h3 className="text-sm font-bold uppercase tracking-widest">Catálogo de Maderas</h3></div></div>

              <div className="swatch-grid">
                {materialesPosibles.map(m => {
                  const isSelected = config.materialesSeleccionados.includes(m.id);
                  const toggleSelection = () => {
                    setConfig(prev => {
                      const arr = prev.materialesSeleccionados.includes(m.id)
                        ? prev.materialesSeleccionados.filter(id => id !== m.id)
                        : [...prev.materialesSeleccionados, m.id];
                      return { ...prev, materialesSeleccionados: arr };
                    });
                  };

                  return (
                    <div key={m.id} className="relative flex flex-col gap-1.5 group cursor-pointer" onDoubleClick={(e) => { e.stopPropagation(); setSelectedImage({ src: m.textura.src, nombre: m.nombre }); }}>
                      <button onClick={toggleSelection} className={`relative aspect-square w-full rounded-xl overflow-hidden border-[3px] transition-all ${isSelected ? 'border-[#1C2E20] shadow-md scale-95' : 'border-transparent hover:border-[#36251B]'}`}>
                        {m.textura.type === 'img' ? <img src={m.textura.src} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: m.textura.css }}></div>}
                        {isSelected && <div className="absolute top-1 right-1 w-5 h-5 bg-[#1C2E20] rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
                      </button>
                      <span className="text-[10px] font-bold text-[#1A1816] uppercase tracking-wider text-center w-full truncate px-1">{m.nombre}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {preciosMultiples.length > 0 && (
              <div className="space-y-4 md:space-y-6 mt-10 md:mt-16">
                {preciosMultiples.map(p => {
                  const mInfo = maderas.find(m => m.id === p.matId);
                  if (!mInfo) return null;
                  return (
                    <div key={p.matId} className="bg-white border border-[#E0D8CC] rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-8 shadow-sm animate-fade-in hover:shadow-md transition-all">
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden shrink-0 shadow-inner border border-[#F4F1EB]">
                        <img src={mInfo.src} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm md:text-2xl font-black text-[#36251B] uppercase tracking-wide">{mInfo.nombre}</div>
                        <div className="text-[10px] md:text-sm text-[#6B635A] uppercase font-semibold mt-1 md:mt-2 tracking-widest flex flex-wrap gap-2 items-center">
                          <span className="bg-[#F4F1EB] px-2 py-1 rounded-md text-[#36251B]">CANT: {config.cantidad}</span> <span className="text-[#E0D8CC] hidden md:inline">|</span>
                          <span className="bg-[#F4F1EB] px-2 py-1 rounded-md text-[#36251B]">{config.acabado}</span> <span className="text-[#E0D8CC] hidden md:inline">|</span>
                          <span className="bg-[#F4F1EB] px-2 py-1 rounded-md text-[#36251B]">{config.tipoConstruccion === 'maciza' ? `${config.espesorPulgadas}"` : (espesorVisual || 'STD')} ESP.</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl md:text-3xl font-black text-[#1C2E20]">${new Intl.NumberFormat('es-AR').format(p.precioTotal)}</div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-end mt-6">
                  <button onClick={agregarAlCarrito} className={`w-full md:w-auto px-12 py-4 rounded-xl font-black text-sm md:text-lg tracking-widest uppercase transition-all shadow-lg bg-[#36251B] text-white hover:bg-[#1F140E] hover:scale-[1.02]`}>AGREGAR</button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* CARRITO Y CHECKOUT */}
        {paso === 4 && (
          <div className="max-w-3xl mx-auto p-6 animate-fade-in pb-20">
            {checkoutPaso === 'form' ? (
              <div className="bg-white border border-[#E0D8CC] rounded-3xl p-8 md:p-12 shadow-sm max-w-2xl mx-auto mt-10 md:mt-20">
                <h3 className="text-lg md:text-2xl font-black text-[#36251B] uppercase tracking-widest mb-8 text-center">Datos del Cliente</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs md:text-sm font-bold text-[#6B635A] uppercase mb-2 block text-center">Nombre y Apellido *</label>
                    <input value={cliente.nombre} onChange={e => setCliente({ ...cliente, nombre: e.target.value })} className="w-full bg-[#F4F1EB] border border-[#E0D8CC] p-4 md:p-5 rounded-xl text-center text-base md:text-lg font-semibold outline-none focus:border-[#36251B]" placeholder="Ej: Juan Perez" />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-bold text-[#6B635A] uppercase mb-2 block text-center">Teléfono (Opcional)</label>
                    <input value={cliente.telefono} onChange={e => setCliente({ ...cliente, telefono: e.target.value })} className="w-full bg-[#F4F1EB] border border-[#E0D8CC] p-4 md:p-5 rounded-xl text-center text-base md:text-lg font-semibold outline-none focus:border-[#36251B]" placeholder="+54 9..." />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-bold text-[#6B635A] uppercase mb-2 block text-center">Medio de Contacto *</label>
                    <select value={cliente.canal} onChange={e => setCliente({ ...cliente, canal: e.target.value })} className="w-full bg-[#F4F1EB] border border-[#E0D8CC] p-4 md:p-5 rounded-xl text-center text-base md:text-lg font-semibold outline-none focus:border-[#36251B]">
                      <option value="whatsapp">WhatsApp</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="web">Página Web</option>
                      <option value="taller">Visita en Taller</option>
                      <option value="recomendacion">Recomendación</option>
                    </select>
                  </div>
                  <button onClick={() => { if (cliente.nombre) setCheckoutPaso('presupuesto'); else alert('Por favor completa el nombre del cliente.'); }} className="w-full bg-[#36251B] text-white py-5 md:py-6 rounded-xl font-black text-sm md:text-lg uppercase tracking-widest mt-8 hover:bg-[#1F140E] transition-all hover:scale-[1.02] shadow-xl">Continuar al Presupuesto</button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center bg-[#F4F1EB] border border-[#E0D8CC] p-4 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#6B635A]">
                  <span>Asesor: <span className="text-[#36251B] text-xs">{vendedorActual}</span></span>
                  <span className="hidden md:inline text-[#E0D8CC]">|</span>
                  <span>Cliente: <span className="text-[#36251B] text-xs">{cliente.nombre}</span></span>
                </div>

                <div className="space-y-4 mb-8">
                  {carrito.map(item => {
                    const visual = getMaterialVisual(item.config, maderas, melaminas);
                    return (
                      <div key={item.id} className="bg-white border border-[#E0D8CC] rounded-2xl p-4 md:p-6 shadow-sm relative group hover:shadow-md transition-all">
                        <button onClick={() => setCarrito(carrito.filter(c => c.id !== item.id))} className="absolute top-4 right-4 text-[#9C948A] hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                        <div className="flex gap-4 md:gap-6 items-center">
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 shadow-inner border border-[#F4F1EB]">
                            {visual.type === 'img' ? <img src={getDirectDriveUrl(visual.value)} className="w-full h-full object-cover" /> : visual.type === 'css' ? <div className="w-full h-full" style={{ background: visual.value }}></div> : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-2xl">{item.mueble?.imagen || '📦'}</div>}
                          </div>
                          <div className="flex-1 pr-8 md:pr-12">
                            <h3 className="text-sm md:text-xl font-bold text-[#36251B] uppercase tracking-widest">{item.mueble?.nombre || 'Mueble'} <span className="text-[#A0958A] font-medium text-xs md:text-lg">/ {item.config?.materialNombre || 'Std'}</span></h3>
                            <div className="text-[10px] md:text-xs text-[#6B635A] font-semibold uppercase tracking-widest mt-2 md:mt-3 flex flex-wrap gap-x-2 gap-y-2 md:gap-x-3 items-center">
                              <span className="bg-[#F4F1EB] px-2 py-1 rounded-md text-[#36251B]">CANT: {item.config?.cantidad || 1}</span> <span className="text-[#E0D8CC] hidden md:inline">|</span>
                              <span className="bg-[#F4F1EB] px-2 py-1 rounded-md text-[#36251B]">MED: {item.config?.ancho || 0}x{item.config?.largo || 0}cm</span> <span className="text-[#E0D8CC] hidden md:inline">|</span>
                              <span className="bg-[#F4F1EB] px-2 py-1 rounded-md text-[#36251B]">ESP: {item.config?.espesorVisual || 'STD'}</span> <span className="text-[#E0D8CC] hidden md:inline">|</span>
                              <span className="bg-[#F4F1EB] px-2 py-1 rounded-md text-[#36251B]">{item.config?.acabado || 'NATURAL'}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xl md:text-3xl font-black text-[#1C2E20]">${new Intl.NumberFormat('es-AR').format(item.precio || 0)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {carrito.length === 0 && <div className="text-center py-20 text-[#6B635A] font-semibold text-sm uppercase tracking-widest">El presupuesto está vacío.</div>}
                </div>

                <div className="flex gap-4 mb-6">
                  <button onClick={() => setShowEnvio(!showEnvio)} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${showEnvio ? 'bg-[#36251B] text-white border-[#36251B]' : 'bg-white border-[#E0D8CC] text-[#6B635A]'}`}>+ Envío</button>
                  <button onClick={() => setShowInstalacion(!showInstalacion)} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${showInstalacion ? 'bg-[#36251B] text-white border-[#36251B]' : 'bg-white border-[#E0D8CC] text-[#6B635A]'}`}>+ Instalación</button>
                </div>

                {(showEnvio || showInstalacion) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in bg-[#F4F1EB] p-4 rounded-xl mb-4 border border-[#E0D8CC]">
                    {showEnvio && <div><label className="text-[10px] font-bold text-[#6B635A] uppercase mb-1.5 block">Monto Envío</label><div className="flex items-center bg-white border border-[#E0D8CC] rounded-xl overflow-hidden"><span className="pl-3 text-[#36251B] font-bold">$</span><input type="number" value={config.envio} onChange={e => setConfig({ ...config, envio: e.target.value })} className="w-full bg-transparent p-3 font-semibold text-[#1A1816] outline-none" placeholder="0" /></div></div>}
                    {showInstalacion && <div><label className="text-[10px] font-bold text-[#6B635A] uppercase mb-1.5 block">Monto Instalación</label><div className="flex items-center bg-white border border-[#E0D8CC] rounded-xl overflow-hidden"><span className="pl-3 text-[#36251B] font-bold">$</span><input type="number" value={config.instalacion} onChange={e => setConfig({ ...config, instalacion: e.target.value })} className="w-full bg-transparent p-3 font-semibold text-[#1A1816] outline-none" placeholder="0" /></div></div>}
                  </div>
                )}

                <div className="bg-white border-y border-[#E0D8CC] py-6 flex justify-between items-center mt-6">
                  <div className="text-xs md:text-sm uppercase font-bold tracking-widest text-[#6B635A]">Total General</div>
                  <div className="text-3xl md:text-5xl font-black tracking-tight text-[#36251B]">${new Intl.NumberFormat('es-AR').format(carrito.reduce((a, b) => a + (b.precio || 0), 0) + (showEnvio ? Number(config?.envio) || 0 : 0) + (showInstalacion ? Number(config?.instalacion) || 0 : 0))}</div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-8">
                  <button onClick={() => downloadPDF()} className="bg-white border border-[#E0D8CC] text-[#36251B] py-4 rounded-xl font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 hover:bg-[#F4F1EB] transition-colors"><Download size={18} /> PDF</button>
                  <button onClick={enviarWhatsapp} className="bg-[#25D366] text-white py-4 rounded-xl font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 shadow-md hover:bg-[#1DA851] transition-colors"><MessageCircle size={18} /> Enviar</button>
                  <button onClick={guardarPresupuestoInterno} className="bg-[#1C2E20] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-1 shadow-md hover:bg-[#152418] transition-colors"><Save size={18} /> Guardar</button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default App;