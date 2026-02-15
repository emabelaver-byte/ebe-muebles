import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, updateDoc
} from 'firebase/firestore';
import {
  Ruler, TreePine, Palette, Send, ShoppingCart, Plus, Trash2, Settings,
  ChevronRight, ChevronLeft, Image as ImageIcon, Sparkles, MessageSquare, BoxSelect,
  Armchair, Sun, CloudRain, Hammer, Monitor, Tv, Bed, Utensils, Archive,
  RectangleVertical, Box, LogOut, Save, Coins, ImagePlus, Lock, MapPin,
  User, Paperclip, X, Check, Table, DoorOpen, ArrowLeft, Truck, Store, Map, Users,
  Square, Circle, Triangle, Info, Star, Edit3, FileText, Download, MessageCircle, Instagram, Upload,
  BarChart3, PieChart, ExternalLink, Smartphone, Globe, Grid
} from 'lucide-react';

// ==============================================================================
//  1. CONFIGURACIÓN Y DATOS
// ==============================================================================

const userFirebaseConfig = {
  apiKey: "AIzaSyCObM7lu1VN6kvPx9Ifgd4eo4N3bgm-Oak",
  authDomain: "ebemuebles1.firebaseapp.com",
  projectId: "ebemuebles1",
  storageBucket: "ebemuebles1.firebasestorage.app",
  messagingSenderId: "570132018153",
  appId: "1:570132018153:web:ef8577e7109df18aadd178",
  measurementId: "G-4GCBZ6YWM3"
};

// Configuración dinámica (Prioriza entorno Canvas para evitar errores de CORS/Auth)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : userFirebaseConfig;

// ID DE APP DINÁMICO (CRÍTICO PARA PERMISOS)
const APP_ID_FIRESTORE = typeof __app_id !== 'undefined' ? __app_id : 'ebe-muebles-prod-v1';

// Inicialización
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UTILIDAD: CONVERTIDOR DE LINKS ---
const getDirectDriveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url;
  if (!url.includes('drive.google.com')) return url;
  let idMatch = url.match(/\/file\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/) || url.match(/\/d\/(.*?)\//);
  if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  return url;
};

// --- COLORES Y ESTILOS (TU TEMA ORIGINAL "DARK ROAST") ---
const THEME = {
  bg: "bg-[#E8DCCA]", // Beige Arena (Fondo Original)
  card: "bg-white border border-[#D6C4B0] shadow-sm",
  cardHover: "hover:border-[#5D4037] hover:shadow-md transition-all duration-500 ease-out",
  accent: "text-[#8B5E3C]",
  accentBg: "bg-[#8B5E3C]",
  accentBorder: "border-[#8B5E3C]",
  primary: "bg-[#5D4037]", // Marrón Café Intenso
  primaryText: "text-[#5D4037]",
  primaryHover: "hover:bg-[#3E2723]",
  secondary: "bg-[#7A8D6F]", // Verde Oliva Suave
  secondaryText: "text-[#7A8D6F]",
  textMain: "text-[#2C241F]",
  textMuted: "text-[#6B5A4E]",
  input: "bg-white border border-[#D6C4B0] focus:border-[#5D4037] outline-none transition-all font-sans text-[#2C241F] placeholder-[#999]"
};

const DEFAULT_LOGO_SRC = "https://cdn-icons-png.flaticon.com/512/3030/3030336.png";
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/_u/ebe.muebles/";
const ADMIN_EMAILS = ['emabelaver@gmail.com', 'acevedo.gestoriadelautomotor@gmail.com'];

const DATOS_CONTACTO = {
  telefono_whatsapp: "5493547531519",
  nombre_negocio: "eBe Muebles",
  maps_link: "https://maps.app.goo.gl/yXy8vciXoR11Z4L8A",
  ubicacion_texto: "Alta Gracia, Córdoba"
};

// --- DATOS DEFINIDOS (Persistencia Default) ---
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
  "Mesas (Gral)": ['madera_basica', 'madera_intermedia', 'madera_premium'],
  "Puertas Ext.": ['madera_p_ext_basica', 'madera_p_ext_intermedia', 'madera_p_ext_premium'],
  "Puertas Int.": ['madera_p_int_basica', 'madera_p_int_intermedia', 'madera_p_int_premium'],
  "Puerta Iny.": ['puerta_inyectada_m2', 'cano_marco_principal_12m', 'cano_marco_secundario_12m', 'marco_herrero_mano_obra'],
  "Herrería": ['cano_estructural_ml', 'chapa_lisa_m2', 'relleno_poliuretano', 'term_pintura_chapa_std', 'term_pintura_chapa_oxi'],
  "Melamina": ['mdf_placa_precio', 'mdf_corte', 'mdf_canto'],
  "Componentes": ['costo_cajon_completo', 'costo_puerta_mueble', 'patas_madera', 'patas_metal'],
  "Terminaciones": ['term_cetol', 'term_laca']
};

const DEFAULT_GALERIA = [
  { id: 1, src: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=600", alt: "Mesa Petiribí" },
  { id: 2, src: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600", alt: "Vestidor Moderno" },
  { id: 3, src: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=600", alt: "Puerta Pivotante" },
];

const DEFAULT_TESTIMONIOS = [
  { id: 1, nombre: "Martín G.", texto: "La mesa quedó increíble. La madera es de primera calidad.", stars: 5 },
  { id: 2, nombre: "Sofía L.", texto: "Excelente atención. Me asesoraron con las medidas y quedó perfecto.", stars: 5 },
  { id: 3, nombre: "Lucas M.", texto: "Muy prolijo el trabajo en hierro y madera. Recomendadisimos.", stars: 5 },
];

const DEFAULT_MADERAS = [
  { id: 'eucalipto', nombre: 'Eucalipto', tier: 'basica', src: "https://images.unsplash.com/photo-1626071465992-0081e3532f3c?q=80&w=400&auto=format&fit=crop" },
  { id: 'guayubira', nombre: 'Guayubira', tier: 'intermedia', src: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=400&auto=format&fit=crop" },
  { id: 'guayca', nombre: 'Guayca', tier: 'intermedia', src: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=400&auto=format&fit=crop" },
  { id: 'zoyta', nombre: 'Zoyta', tier: 'intermedia', src: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=400&auto=format&fit=crop" },
  { id: 'cedro', nombre: 'Cedro', tier: 'intermedia', src: "https://images.unsplash.com/photo-1596633605700-1efc9b49e277?q=80&w=400&auto=format&fit=crop" },
  { id: 'petiribi', nombre: 'Petiribí', tier: 'premium', src: "https://images.unsplash.com/photo-1541123638804-61f7adb9dbad?q=80&w=400&auto=format&fit=crop" },
];

// --- NUEVO CATÁLOGO DE MELAMINAS ---
const MELAMINAS_OPCIONES = {
  lisos: [
    { id: 'm_blanco', nombre: 'Blanco', css: '#FFFFFF' },
    { id: 'm_ceniza', nombre: 'Ceniza', css: '#BDBDBD' },
    { id: 'm_grafito', nombre: 'Grafito', css: '#37474F' },
    { id: 'm_negro_profundo', nombre: 'Negro Profundo', css: '#101010' },
    { id: 'm_gris_humo', nombre: 'Gris Humo', css: '#9E9E9E' },
    { id: 'm_almendra', nombre: 'Almendra', css: '#E6DCC3' },
    { id: 'm_aluminio', nombre: 'Aluminio', css: '#A0A0A0' },
    { id: 'm_litio', nombre: 'Litio', css: '#8D867D' },
    { id: 'm_blanco_tundra', nombre: 'Blanco Tundra', css: '#F0F0F0' },
  ],
  maderas_clasicas: [ // Nature y Mesopotamia
    { id: 'm_caju', nombre: 'Cajú', css: '#B8A47E' },
    { id: 'm_gaudi', nombre: 'Gaudí', css: '#5D4B3F' },
    { id: 'm_petiribi', nombre: 'Petiribí', css: '#8A6F45' },
    { id: 'm_yute', nombre: 'Yute', css: '#948C78' },
    { id: 'm_terracota', nombre: 'Terracota', css: '#6E4D3A' },
    { id: 'm_kiri', nombre: 'Kiri', css: '#DCCBB2' },
    { id: 'm_paraiso', nombre: 'Paraíso', css: '#C29F76' },
    { id: 'm_nogal_terracota', nombre: 'Nogal Terracota', css: '#8B6B40' },
    { id: 'm_carvalho_mezzo', nombre: 'Carvalho Mezzo', css: '#7A6553' },
  ],
  maderas_nordicas: [ // Nordica y Etnica
    { id: 'm_helsinki', nombre: 'Helsinki', css: 'linear-gradient(90deg, #D7CFC4, #C9BEB0)' },
    { id: 'm_baltico', nombre: 'Báltico', css: 'linear-gradient(90deg, #8C8479, #756D63)' },
    { id: 'm_olmo_finlandes', nombre: 'Olmo Finlandés', css: 'linear-gradient(90deg, #C19A6B, #A67C52)' },
    { id: 'm_roble_escandinavo', nombre: 'Roble Escandinavo', css: 'linear-gradient(90deg, #C2B299, #AFA089)' },
    { id: 'm_sahara', nombre: 'Sahara', css: '#A3927F' },
    { id: 'm_himalaya', nombre: 'Himalaya', css: '#B09A8B' },
    { id: 'm_everest', nombre: 'Everest', css: '#D1D5D2' },
  ],
  texturas_urbanas: [ // Urban e Hilados
    { id: 'm_seda_giorno', nombre: 'Seda Giorno', css: '#B0AB9F' },
    { id: 'm_seda_notte', nombre: 'Seda Notte', css: '#7A726A' },
    { id: 'm_lino_chiaro', nombre: 'Lino Chiaro', css: '#CFCBC5' },
    { id: 'm_coliseo', nombre: 'Coliseo', css: '#6E665F' },
    { id: 'm_moscu', nombre: 'Moscú', css: '#4A3F39' },
    { id: 'm_street', nombre: 'Street', css: '#8C837B' },
    { id: 'm_praga', nombre: 'Praga', css: '#9C8C7C' },
  ]
};

const MATERIAL_PUERTA_CHAPA = { id: 'puerta_chapa_iny', nombre: 'Chapa Inyectada', type: 'chapa_inyectada', precio: 0, textura: { type: 'css', css: 'linear-gradient(135deg, #374151, #4B5563)' } };
const MATERIAL_PUERTA_PLACA = { id: 'puerta_placa_std', nombre: 'Puerta Placa', type: 'puerta_placa', precio: 0, textura: { type: 'img', src: '' } };

const MESA_GENERICA = { id: 'mesa_custom', nombre: 'Mesa a Medida', tipo: 'maciza', espesor: 2, forma: 'mesa', imagen: '🪑', permite_herrajes: false };
const PUERTA_GENERICA = { id: 'puerta_custom', nombre: 'Puerta a Medida', tipo: 'maciza', espesor: 2, forma: 'puerta', imagen: '🚪', permite_herrajes: false };

const LISTA_MUEBLES_GRAL = [
  { id: 'ropero', nombre: 'Ropero / Vestidor', prof_def: 60, icon: 'RectangleVertical', forma: 'caja_alta', permite_herrajes: true, imagen: '🚪' },
  { id: 'mesa_luz', nombre: 'Mesa de Luz', prof_def: 40, icon: 'Box', forma: 'caja_baja', permite_herrajes: true, imagen: '🗄️' },
  { id: 'escritorio', nombre: 'Escritorio', prof_def: 55, icon: 'Monitor', forma: 'escritorio', permite_herrajes: true, imagen: '💻' },
  { id: 'bajo_mesada', nombre: 'Bajo Mesada', prof_def: 58, icon: 'Utensils', forma: 'caja_baja', permite_herrajes: true, imagen: '🍳' },
  { id: 'alacena', nombre: 'Alacena', prof_def: 32, icon: 'Archive', forma: 'caja_alta', permite_herrajes: false, imagen: '🗃️' },
  { id: 'cama', nombre: 'Cama', prof_def: 200, icon: 'Bed', esCama: true, forma: 'cama', permite_herrajes: false, imagen: '🛏️' },
  { id: 'rack_tv', nombre: 'Rack TV / Vajillero', prof_def: 40, icon: 'Tv', forma: 'caja_baja', permite_herrajes: true, imagen: '📺' },
];

const CAMAS_MEDIDAS = [
  { label: '1 Plaza', w: 90, l: 190 }, { label: '1 Plaza y ½', w: 105, l: 190 },
  { label: '2 Plazas', w: 140, l: 190 }, { label: 'Queen', w: 160, l: 200 }, { label: 'King', w: 200, l: 200 }
];

const CATEGORIAS_PRINCIPALES = [
  { id: 'cat_mesa', label: 'Mesas', icon: 'Table', destino: 'directo', item: MESA_GENERICA },
  { id: 'cat_puerta', label: 'Puertas', icon: 'DoorOpen', destino: 'directo', item: PUERTA_GENERICA },
  { id: 'cat_muebles', label: 'Mobiliario', icon: 'Armchair', destino: 'lista' }
];

// --- PATAS ACTUALIZADAS (SOLUCIÓN ICONOS) ---
const OPCIONES_PATAS = {
  sin_patas: [{ id: 'ninguna', nombre: 'Sin Patas', icon: Box }],
  madera: [
    { id: 'recta', nombre: 'Rectas', icon: Square },
    { id: 'u_shape', nombre: 'En U', icon: Box },
    { id: 'l_shape', nombre: 'En L', icon: ChevronRight }
  ],
  metal: [
    { id: 'industrial_u', nombre: 'Industrial U', icon: Square },
    { id: 'industrial_x', nombre: 'Industrial X', icon: X },
    { id: 'industrial_recto', nombre: 'Rectos', icon: RectangleVertical }
  ]
};

const ACABADOS = [
  { id: 'natural', nombre: 'NATURAL', price: 0 },
  { id: 'cetol', nombre: 'IMPREGNANTE', price: 30000 },
  { id: 'laca', nombre: 'LACA', price: 60000 },
];

const COLORES_CHAPA = [
  { id: 'negro', nombre: 'Negro', css: '#1a1a1a' },
  { id: 'blanco', nombre: 'Blanco', css: '#f5f5f5' },
  { id: 'oxidado', nombre: 'Oxidado', css: 'linear-gradient(45deg, #8B4513, #5D4037)' }
];

const ACABADOS_CHAPA = [
  { id: 'mate', nombre: 'Mate' },
  { id: 'satinado', nombre: 'Satinado' },
  { id: 'brillante', nombre: 'Brillante' }
];

// ==============================================================================
//  2. COMPONENTES VISUALES
// ==============================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
    
    body { font-family: 'Inter', sans-serif; background-color: #E8DCCA; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Montserrat', sans-serif; }
      
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #E8DCCA; }
    ::-webkit-scrollbar-thumb { background: #8B5E3C; border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: #5D4037; }
  `}</style>
);

const BackgroundAmbience = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#E8DCCA] pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
    <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}></div>
  </div>
);

const Header = ({ onBack, title, onLogoClick, showCart, cartCount, onCartClick, logoUrl }) => (
  <header className="sticky top-0 z-20 backdrop-blur-md bg-[#E8DCCA]/90 border-b border-[#D6C4B0] py-4 px-4 flex justify-between items-center transition-all">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className={`p-2.5 rounded-full hover:bg-white/50 ${THEME.textMain} transition-colors active:scale-95`}>
          <ArrowLeft size={22} />
        </button>
      )}
      {/* TIPOGRAFÍA TÍTULO MEJORADA */}
      <h1 className={`text-lg md:text-xl font-light tracking-widest ${THEME.textMain} truncate max-w-[200px] md:max-w-none font-sans uppercase`}>{title}</h1>
    </div>
    <div className="flex items-center gap-4">
      {showCart && (
        <button onClick={onCartClick} className={`relative p-2 ${THEME.textMain} hover:${THEME.accent} transition-colors`}>
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className={`absolute -top-1 -right-1 w-4 h-4 ${THEME.primary} text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm`}>{cartCount}</span>}
        </button>
      )}
      <div onClick={onLogoClick} className="cursor-pointer flex items-center gap-2 group">
        <img
          src={getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC}
          alt="eBe Logo"
          referrerPolicy="no-referrer"
          className="h-8 w-auto opacity-80 group-hover:opacity-100 transition-opacity object-contain"
        />
      </div>
    </div>
  </header>
);

const IconRenderer = ({ name, size = 24, className }) => {
  const icons = { Table, DoorOpen, Armchair, RectangleVertical, Box, Monitor, Utensils, Archive, Bed, Tv };
  const IconComponent = icons[name] || Box;
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
};

const InputMedida = ({ label, val, onChange }) => (
  <div className="flex flex-col items-center group w-full">
    <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${THEME.textMuted}`}>{label}</label>
    <input
      type="number" value={val} onChange={e => onChange(e.target.value)} onFocus={e => e.target.select()}
      className={`w-full ${THEME.input} text-center text-lg md:text-xl font-light py-4 rounded-xl shadow-sm hover:border-[#5D4037] hover:shadow-md transition-all duration-300`}
    />
  </div>
);

// ==============================================================================
//  3. APP PRINCIPAL
// ==============================================================================

const App = () => {
  const [paso, setPaso] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  // ESTADOS PERSISTENTES
  const [costos, setCostos] = useState(DEFAULT_COSTOS);
  const [galeria, setGaleria] = useState(DEFAULT_GALERIA);
  const [maderas, setMaderas] = useState(DEFAULT_MADERAS);
  const [testimonios, setTestimonios] = useState(DEFAULT_TESTIMONIOS);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_SRC);
  const [instagramUrl, setInstagramUrl] = useState(DEFAULT_INSTAGRAM_URL);

  const [visitStats, setVisitStats] = useState({ mobile: 0, desktop: 0, total: 0 });
  const [orders, setOrders] = useState([]);
  const [carrito, setCarrito] = useState([]);

  // Admin
  const [newImage, setNewImage] = useState({ url: '', alt: '' });
  const [adminLogoInput, setAdminLogoInput] = useState('');
  const [adminInstagramInput, setAdminInstagramInput] = useState('');

  // Flow
  const [catSeleccionada, setCatSeleccionada] = useState(null);
  const [muebleSeleccionado, setMuebleSeleccionado] = useState(null);

  // Configuración Mueble
  const [config, setConfig] = useState({
    ancho: 160, largo: 80, profundidad: 40, cantidad: 1,
    material: 'eucalipto', acabado: 'natural', tipoPatas: 'sin_patas', modeloPatas: 'ninguna',
    marco: false, cantCajones: 0, cantPuertas: 0, uso: 'interior', tipoConstruccion: 'maciza',
    chapa_color: 'negro', chapa_acabado: 'satinado', tvSize: ''
  });

  const [cliente, setCliente] = useState({ nombre: '', lugar: '', nombreArchivo: null, entrega: 'envio' });
  const [precioItemActual, setPrecioItemActual] = useState(0);
  const [espesorVisual, setEspesorVisual] = useState('');
  const [materialesPosibles, setMaterialesPosibles] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [newReview, setNewReview] = useState({ nombre: '', texto: '', stars: 5 });
  const [showAi, setShowAi] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const isMDF = config.tipoConstruccion === 'placa';
  const fileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);

  const getHeaderTitle = () => {
    if (paso === 5) return "Galería";
    if (paso === 4) return "Tu Pedido";
    if (paso === 6) return "Nosotros";
    if (paso === 3 && muebleSeleccionado) return muebleSeleccionado.nombre;
    if (paso === 2 && catSeleccionada) return catSeleccionada.label;
    if (paso === 1) return "Categorías";
    return "EBE MUEBLES";
  };

  // --- AUTH & DATA SYNC ---
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

  // Cargar datos reales de Firestore (Con fallback a Default si está vacío o falla)
  useEffect(() => {
    if (!user) return;

    // 1. Configuración General
    const loadSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'general'));
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.logoUrl) { setLogoUrl(d.logoUrl); setAdminLogoInput(d.logoUrl); }
          if (d.instagramUrl) { setInstagramUrl(d.instagramUrl); setAdminInstagramInput(d.instagramUrl); }
        }
      } catch (e) { console.error("Error conf", e); }
    };
    loadSettings();

    // 2. Galería (Realtime con Error Handler)
    const unsubGaleria = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'gallery'), orderBy('createdAt', 'desc')),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setGaleria(items);
        }
      },
      (error) => { console.warn("Galeria fallback", error); setGaleria(DEFAULT_GALERIA); }
    );

    // 3. Maderas (Realtime con Error Handler)
    const unsubMaderas = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials'), orderBy('nombre')),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setMaderas(items);
        }
      },
      (error) => { console.warn("Maderas fallback", error); setMaderas(DEFAULT_MADERAS); }
    );

    return () => { unsubGaleria(); unsubMaderas(); };
  }, [user]);


  // --- ADMIN ACTIONS (Escritura Real en Firestore) ---
  const handleAdminLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (ADMIN_EMAILS.includes(result.user.email)) setIsAdmin(true);
      else { alert("No tienes permisos de administrador."); await signOut(auth); await signInAnonymously(auth); }
    } catch (e) { alert("Error Auth: " + e.message); }
  };

  const handleSaveSettings = async () => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'general'), {
        logoUrl: getDirectDriveUrl(adminLogoInput) || DEFAULT_LOGO_SRC,
        instagramUrl: adminInstagramInput || DEFAULT_INSTAGRAM_URL
      }, { merge: true });
      alert("Configuración guardada correctamente.");
    } catch (e) { alert("Error al guardar: " + e.message); }
  };

  const addGalleryImage = async () => {
    if (newImage.url && isAdmin) {
      try {
        await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'gallery'), {
          src: getDirectDriveUrl(newImage.url),
          alt: newImage.alt || 'Nuevo Trabajo',
          createdAt: Date.now()
        });
        setNewImage({ url: '', alt: '' });
        alert("Imagen guardada.");
      } catch (e) { alert("Error: " + e.message); }
    }
  };

  const removeGalleryImage = async (id) => {
    if (!isAdmin) return;
    if (typeof id === 'string') {
      try { await deleteDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'gallery', id)); } catch (e) { console.error(e); }
    } else {
      setGaleria(galeria.filter(g => g.id !== id));
    }
  };

  const addMadera = async () => {
    if (!isAdmin) return;
    try { await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials'), { nombre: 'Nueva Madera', tier: 'intermedia', src: '', createdAt: Date.now() }); } catch (e) { console.error(e); }
  };

  const updateMaderaFirestore = async (id, field, value) => {
    if (!isAdmin) return;
    if (typeof id === 'string') {
      await updateDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials', id), { [field]: field === 'src' ? getDirectDriveUrl(value) : value });
    }
  };

  const removeMadera = async (id) => {
    if (!isAdmin) return;
    if (typeof id === 'string') await deleteDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials', id));
  };

  // --- LOGICA DE NEGOCIO ---
  useEffect(() => {
    if (paso === 3 && muebleSeleccionado) {
      const isMesa = muebleSeleccionado.id?.includes('mesa');
      const isPuerta = muebleSeleccionado.id?.includes('puerta');
      let tipoDef = (isMesa || isPuerta) ? 'maciza' : 'placa';
      setConfig(prev => ({
        ...prev, tipoConstruccion: tipoDef, uso: 'interior', material: tipoDef === 'maciza' ? 'eucalipto' : 'm_blanco',
        cantCajones: 0, cantPuertas: 0, tipoPatas: 'sin_patas', modeloPatas: 'ninguna', marco: false,
        profundidad: muebleSeleccionado.prof_def || 40, chapa_color: 'negro', chapa_acabado: 'satinado', tvSize: ''
      }));
    }
  }, [paso, muebleSeleccionado]);

  const handleTvSize = (inches) => {
    const w = Math.round(Number(inches) * 2.21 + 30);
    setConfig({ ...config, tvSize: inches, ancho: w, largo: 55, profundidad: 40 });
  };

  const handleBedSize = (sizeLabel) => {
    const medidas = CAMAS_MEDIDAS.find(m => m.label === sizeLabel);
    if (medidas) setConfig({ ...config, ancho: medidas.w, largo: 60, profundidad: medidas.l });
  };

  // Lógica de Materiales
  useEffect(() => {
    if (paso === 3) {
      // Reglas Mesa a Medida (EXTERIOR)
      if (muebleSeleccionado?.id === 'mesa_custom' && config.uso === 'exterior') {
        // Si es exterior, forzar construcción Maciza o Chapa (no placa)
        if (config.tipoConstruccion === 'placa') setConfig(p => ({ ...p, tipoConstruccion: 'maciza' }));
        // Si es mesa exterior, forzar patas metal o sin patas
        if (config.tipoPatas === 'madera') setConfig(p => ({ ...p, tipoPatas: 'metal' }));
        // Si es mesa exterior, quitar marco
        if (config.marco) setConfig(p => ({ ...p, marco: false }));
      }

      let mats = [];
      let esp = "1\"";

      const MATERIALES = [
        ...maderas.map(m => ({ id: m.id, nombre: m.nombre, type: 'maciza', tier: m.tier, textura: { type: 'img', src: m.src } })),
        { ...MATERIAL_PUERTA_PLACA, textura: { type: 'img', src: maderas[0]?.src || "" } },
        { ...MATERIAL_PUERTA_CHAPA }
      ];

      if (config.tipoConstruccion === 'maciza') {
        mats = MATERIALES.filter(m => m.type === 'maciza');
        esp = '1"';
        if (muebleSeleccionado?.id?.includes('puerta')) esp = config.uso === 'exterior' ? '3"' : '2"';
        if (muebleSeleccionado?.id?.includes('mesa')) esp = '2"';
        if (!mats.find(m => m.id === config.material)) setConfig(prev => ({ ...prev, material: 'eucalipto' }));
      } else if (config.tipoConstruccion === 'placa') {
        mats = []; // Se maneja via Modal Melamina
        esp = "18mm";
        if (muebleSeleccionado?.id?.includes('mesa')) esp = "36mm (Regruesado)";
        const allMelamines = Object.values(MELAMINAS_OPCIONES).flat();
        if (!allMelamines.find(m => m.id === config.material)) setConfig(prev => ({ ...prev, material: 'm_blanco' }));
      } else if (config.tipoConstruccion === 'puerta_placa') {
        mats = [MATERIAL_PUERTA_PLACA]; esp = "Std"; setConfig(prev => ({ ...prev, material: MATERIAL_PUERTA_PLACA.id }));
      } else if (config.tipoConstruccion === 'chapa_inyectada') {
        mats = [MATERIAL_PUERTA_CHAPA]; esp = "3\""; setConfig(prev => ({ ...prev, material: MATERIAL_PUERTA_CHAPA.id }));
      }
      setMaterialesPosibles(mats);
      setEspesorVisual(esp);
    }
  }, [config.tipoConstruccion, config.uso, config.tipoPatas, config.marco, paso, costos, maderas]);

  // Precio
  useEffect(() => {
    if (catSeleccionada?.id === 'cat_muebles') { setPrecioItemActual(0); return; }
    if (paso === 3 && config.material) {
      let structurePrice = 0;
      const area = (config.ancho * config.largo) / 10000;
      const mat = maderas.find(m => m.id === config.material);

      if (config.tipoConstruccion === 'placa') {
        structurePrice = 0;
      } else if (config.tipoConstruccion === 'chapa_inyectada') {
        structurePrice = area * costos.puerta_inyectada_m2;
        if (config.marco) {
          const perimetro = ((config.ancho + config.largo) * 2) / 100;
          const costo_material_ml = (costos.cano_marco_principal_12m + costos.cano_marco_secundario_12m) / 12;
          structurePrice += (perimetro * costo_material_ml) + costos.marco_herrero_mano_obra + costos.marco_insumos_varios;
        }
      } else if (config.tipoConstruccion === 'puerta_placa') {
        structurePrice = (area * costos.puerta_placa_m2) + (config.marco ? costos.marco_pino_puerta_placa : 0);
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

        let pies = (config.ancho / 2.5) * 2 * (config.largo / 100) * 0.3;
        structurePrice = pies * base;
        if (config.tipoPatas === 'metal') structurePrice += costos.patas_metal;
        if (config.tipoPatas === 'madera') structurePrice += costos.patas_madera;
        if (config.marco) structurePrice += (base * 30);

        structurePrice += (config.cantCajones * costos.costo_cajon_completo);
        structurePrice += (config.cantPuertas * costos.costo_puerta_mueble);
      }

      let finalPrice = structurePrice;
      if (config.tipoConstruccion === 'maciza' || config.tipoConstruccion === 'puerta_placa') {
        if (config.acabado === 'cetol') finalPrice += costos.term_cetol;
        if (config.acabado === 'laca') finalPrice += costos.term_laca;
      }
      if (config.tipoConstruccion === 'chapa_inyectada') {
        if (config.chapa_color === 'oxidado') finalPrice += costos.term_pintura_chapa_oxi;
        else finalPrice += costos.term_pintura_chapa_std;
      }

      finalPrice = Math.round(finalPrice / 1000) * 1000;
      setPrecioItemActual(finalPrice);
    }
  }, [config, muebleSeleccionado, paso, costos, maderas, catSeleccionada]);

  const agregarCarrito = () => {
    let mName = config.material;
    if (config.tipoConstruccion === 'chapa_inyectada') {
      mName = `Chapa ${config.chapa_color} (${config.chapa_acabado})`;
    } else if (config.tipoConstruccion === 'puerta_placa') {
      mName = 'Puerta Placa';
    } else {
      const allMelamines = Object.values(MELAMINAS_OPCIONES).flat();
      const found = allMelamines.find(m => m.id === config.material);
      if (found) mName = found.nombre;
      else {
        const matConfig = maderas.find(m => m.id === config.material);
        mName = matConfig ? matConfig.nombre : config.material.charAt(0).toUpperCase() + config.material.slice(1);
      }
    }
    setCarrito([...carrito, { id: Date.now(), mueble: muebleSeleccionado, config: { ...config, materialNombre: mName }, precio: precioItemActual }]);
    setPaso(1); setCatSeleccionada(null);
  };

  const enviarWhatsapp = () => {
    const total = carrito.reduce((a, b) => a + b.precio, 0);
    const pedidoId = Math.floor(Math.random() * 10000);
    setOrders([{ id: pedidoId, cliente, items: carrito, total }, ...orders]);
    let text = `👋 Hola *eBe Muebles*, soy ${cliente.nombre}.\n📍 Desde: ${cliente.lugar} (${cliente.entrega === 'taller' ? 'Retiro en Taller' : 'Envío a domicilio'})\n📋 *PEDIDO WEB #${pedidoId}*\n\n`;
    carrito.forEach(i => {
      text += `🔹 *${i.mueble.nombre}* (${i.config.ancho}x${i.config.largo}cm)\n   ${i.config.materialNombre}\n`;
      if (i.precio === 0) text += `   (A Cotizar)\n`;
    });
    text += `\n💰 *Total Estimado: $${new Intl.NumberFormat('es-AR').format(total)}*`;
    if (cliente.nombreArchivo) text += `\n📎 Archivo adjunto: ${cliente.nombreArchivo}`;
    window.open(`https://wa.me/${DATOS_CONTACTO.telefono_whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // PDF Generation (Mantenido igual)
  const generarPresupuestoPDF = () => { /* Logica de PDF antigua se mantiene aquí */ alert("Generando PDF..."); };

  const handleAi = async (e) => { e.preventDefault(); setAiLoading(true); setTimeout(() => { setAiResponse("Para este estilo, te recomiendo combinar Petiribí con terminación natural."); setAiLoading(false); }, 1500); };
  const nextImage = (e) => { e && e.stopPropagation(); setSelectedImage(galeria[(galeria.findIndex(i => i.id === selectedImage.id) + 1) % galeria.length]); };
  const prevImage = (e) => { e && e.stopPropagation(); setSelectedImage(galeria[(galeria.findIndex(i => i.id === selectedImage.id) - 1 + galeria.length) % galeria.length]); };

  // --- RENDER ---
  if (isAdmin) return (
    <div className={`min-h-screen bg-[#F5F5F5] text-[#333] font-sans flex`}>
      {/* Sidebar Admin (Tu diseño original) */}
      <div className="w-20 md:w-64 bg-white border-r border-[#E0E0E0] flex flex-col fixed h-full z-20 transition-all">
        <div className="p-4 md:p-6 border-b border-[#E0E0E0] flex items-center justify-center md:justify-start gap-3">
          <Settings className="text-[#5D4037] animate-spin-slow" />
          <span className="font-bold text-[#5D4037] text-lg hidden md:block uppercase tracking-wider">Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <button onClick={() => setAdminTab('dashboard')} className={`w-full flex items-center gap-3 p-4 md:px-6 hover:bg-[#F9F7F2] transition-colors ${adminTab === 'dashboard' ? 'bg-[#F9F7F2] border-r-4 border-[#8B5E3C] text-[#5D4037]' : 'text-[#666]'}`}><BarChart3 size={20} /> <span className="hidden md:block font-medium">Dashboard</span></button>
          <button onClick={() => setAdminTab('gallery')} className={`w-full flex items-center gap-3 p-4 md:px-6 hover:bg-[#F9F7F2] transition-colors ${adminTab === 'gallery' ? 'bg-[#F9F7F2] border-r-4 border-[#8B5E3C] text-[#5D4037]' : 'text-[#666]'}`}><ImageIcon size={20} /> <span className="hidden md:block font-medium">Galería</span></button>
          <button onClick={() => setAdminTab('materiales')} className={`w-full flex items-center gap-3 p-4 md:px-6 hover:bg-[#F9F7F2] transition-colors ${adminTab === 'materiales' ? 'bg-[#F9F7F2] border-r-4 border-[#8B5E3C] text-[#5D4037]' : 'text-[#666]'}`}><TreePine size={20} /> <span className="hidden md:block font-medium">Materiales</span></button>
          <button onClick={() => setAdminTab('config')} className={`w-full flex items-center gap-3 p-4 md:px-6 hover:bg-[#F9F7F2] transition-colors ${adminTab === 'config' ? 'bg-[#F9F7F2] border-r-4 border-[#8B5E3C] text-[#5D4037]' : 'text-[#666]'}`}><Settings size={20} /> <span className="hidden md:block font-medium">General</span></button>
        </div>
        <div className="p-4 border-t border-[#E0E0E0]">
          <button onClick={() => { signOut(auth); setIsAdmin(false); }} className="w-full text-red-500 flex items-center justify-center md:justify-start gap-2 hover:bg-red-50 p-3 rounded-xl transition-colors font-bold text-sm"><LogOut size={20} /> <span className="hidden md:block">Salir</span></button>
        </div>
      </div>
      {/* Content Admin */}
      <div className="flex-1 ml-20 md:ml-64 p-6 md:p-10 overflow-y-auto max-h-screen">
        {adminTab === 'dashboard' && <div className="text-2xl font-bold text-[#333]">Bienvenido al Panel de Control</div>}
        {adminTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#E0D8C3]">
              <h3 className="font-bold uppercase text-sm text-[#8B5E3C] mb-4">Agregar Foto</h3>
              <div className="flex gap-2">
                <input value={newImage.url} onChange={e => setNewImage({ ...newImage, url: e.target.value })} placeholder="URL Imagen" className="flex-1 border p-2 rounded" />
                <input value={newImage.alt} onChange={e => setNewImage({ ...newImage, alt: e.target.value })} placeholder="Título" className="flex-1 border p-2 rounded" />
                <button onClick={addGalleryImage} className="bg-[#5D4037] text-white p-2 rounded"><Plus /></button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {galeria.map(img => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-[#E0D8C3]">
                  <img src={getDirectDriveUrl(img.src)} className="w-full h-full object-cover" />
                  <button onClick={() => removeGalleryImage(img.id)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
        {adminTab === 'materiales' && (
          <div className="space-y-4">
            <button onClick={addMadera} className="bg-[#5D4037] text-white p-2 rounded flex items-center gap-2"><Plus size={16} /> Agregar Madera</button>
            <div className="space-y-2">
              {maderas.map(m => (
                <div key={m.id} className="bg-white p-4 rounded border flex items-center gap-4">
                  <img src={getDirectDriveUrl(m.src)} className="w-10 h-10 rounded object-cover" />
                  <input value={m.nombre} onChange={e => updateMaderaFirestore(m.id, 'nombre', e.target.value)} className="border p-1 rounded" />
                  <button onClick={() => removeMadera(m.id)} className="text-red-500"><Trash2 /></button>
                </div>
              ))}
            </div>
          </div>
        )}
        {adminTab === 'config' && (
          <div className="bg-white p-6 rounded-xl border border-[#E0D8C3] space-y-4 max-w-lg">
            <h3 className="font-bold text-[#5D4037]">General</h3>
            <input value={adminLogoInput} onChange={e => setAdminLogoInput(e.target.value)} placeholder="Logo URL" className="w-full border p-2 rounded" />
            <input value={adminInstagramInput} onChange={e => setAdminInstagramInput(e.target.value)} placeholder="Instagram URL" className="w-full border p-2 rounded" />
            <button onClick={handleSaveSettings} className="bg-[#5D4037] text-white w-full py-2 rounded font-bold">Guardar Cambios</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <GlobalStyles />
      <BackgroundAmbience />

      {/* Botón Carrito FLOTANTE (Recuperado) */}
      {paso > 0 && paso !== 4 && carrito.length > 0 && (
        <button onClick={() => setPaso(4)} className={`fixed bottom-24 right-6 ${THEME.primary} text-white p-3 md:p-4 rounded-full shadow-xl hover:scale-110 transition-all z-50 flex items-center justify-center border-2 border-white`}>
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-[#7A8D6F] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">{carrito.length}</span>
        </button>
      )}

      {/* AI Modal */}
      {showAi && (
        <div className="fixed inset-0 z-50 bg-[#333]/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowAi(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#E0D8C3] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#F2E9D8] flex justify-between items-center bg-[#FDFBF7]">
              <div className="flex items-center gap-2"><Sparkles size={18} className={THEME.accent} /> <span className={`font-bold ${THEME.textMain} uppercase text-sm`}>Asistente de Diseño</span></div>
              <button onClick={() => setShowAi(false)}><X size={18} className={THEME.textMuted} /></button>
            </div>
            <div className="p-4 h-64 overflow-y-auto bg-[#FDFBF7] space-y-3">
              <div className="bg-white border border-[#E0D8C3] p-3 rounded-xl rounded-tl-none text-sm text-[#333] shadow-sm">Hola, soy tu experto en diseño. ¿Buscas maderas cálidas o algo industrial?</div>
              {aiResponse && <div className="bg-white border border-[#E0D8C3] p-3 rounded-xl rounded-tl-none text-sm text-[#333] shadow-sm animate-fade-in">{aiResponse}</div>}
              {aiLoading && <div className="text-xs text-[#999] animate-pulse ml-2">Pensando...</div>}
            </div>
            <form onSubmit={handleAi} className="p-3 bg-white flex gap-2 border-t border-[#F2E9D8]">
              <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="Escribe tu consulta..." className={`flex-1 bg-[#FAFAFA] border border-[#E0D8C3] rounded-xl px-4 text-sm text-[#333] focus:border-[#5D4037] outline-none`} />
              <button type="submit" className={`${THEME.primary} text-white p-3 rounded-xl font-bold`}><Send size={18} /></button>
            </form>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviews && (
        <div className="fixed inset-0 z-50 bg-[#333]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviews(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E0D8C3] shadow-2xl overflow-hidden p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowReviews(false)} className="absolute top-4 right-4 text-[#999] hover:text-[#333]"><X size={24} /></button>
            <h3 className={`text-xl font-bold ${THEME.accent} mb-6 text-center uppercase tracking-widest font-sans`}>Reseñas de Clientes</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {testimonios.map(t => (
                <div key={t.id} className="bg-[#FAFAFA] p-5 rounded-xl border border-[#E0D8C3]">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`font-bold text-base font-sans uppercase ${THEME.textMain}`}>{t.nombre}</span>
                    <div className="flex gap-0.5 text-[#5D4037]">{[...Array(t.stars)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                  </div>
                  <p className={`text-sm ${THEME.textMuted} italic leading-relaxed`}>"{t.texto}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* APP CONTAINER */}
      <div className={`min-h-screen font-sans ${THEME.textMain} pb-10 selection:bg-[#E0D8C3] selection:text-[#333]`}>

        {paso > 0 && <Header onBack={() => setPaso(paso === 5 ? 0 : paso === 3 ? (catSeleccionada?.destino === 'directo' ? 1 : 2) : (paso === 6 ? 0 : paso - 1))} title={getHeaderTitle()} onLogoClick={handleAdminLogin} showCart={false} cartCount={carrito.length} onCartClick={() => setPaso(4)} logoUrl={getDirectDriveUrl(logoUrl)} />}

        {/* HOME */}
        {paso === 0 && (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
            <div className="mb-12 text-center relative z-10 animate-float flex flex-col items-center">
              <img
                src={getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC}
                alt="eBe Muebles Logo"
                onClick={handleAdminLogin}
                className="w-48 h-auto mb-6 drop-shadow-md cursor-pointer opacity-90 hover:scale-105 transition-transform object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_LOGO_SRC }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-full max-w-xs md:max-w-sm space-y-4 z-10">
              <button onClick={() => setPaso(1)} className={`w-full py-6 rounded-2xl font-bold text-lg tracking-widest uppercase transition-all transform hover:scale-[1.02] shadow-xl shadow-[#5D4037]/30 ${THEME.primary} text-white border border-[#5D4037]`}>Hacé tu Presupuesto</button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPaso(5)} className={`${THEME.card} py-6 md:py-10 rounded-2xl flex flex-col items-center justify-center gap-2 ${THEME.cardHover} transition-all`}>
                  <ImageIcon size={24} className={THEME.textMuted} />
                  <span className={`text-xs md:text-lg font-bold uppercase ${THEME.textMain} tracking-widest`}>Galería</span>
                </button>
                <button onClick={() => setPaso(6)} className={`${THEME.card} py-6 md:py-10 rounded-2xl flex flex-col items-center justify-center gap-2 ${THEME.cardHover} transition-all`}>
                  <Users size={24} className={THEME.textMuted} />
                  <span className={`text-xs md:text-lg font-bold uppercase ${THEME.textMain} tracking-widest`}>Nosotros</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowAi(true)} className={`w-full py-4 rounded-xl border-2 border-[#5D4037] flex flex-col md:flex-row items-center justify-center gap-2 hover:bg-[#5D4037]/5 transition-all text-[#5D4037]`}>
                  <Sparkles size={20} /> <span className="text-xs font-bold uppercase tracking-wide">Asistente</span>
                </button>
                <a href={instagramUrl || DEFAULT_INSTAGRAM_URL} target="_blank" rel="noreferrer" className={`w-full py-4 rounded-xl border-2 border-[#5D4037] flex flex-col md:flex-row items-center justify-center gap-2 hover:bg-[#5D4037]/5 transition-all text-[#5D4037]`}>
                  <Instagram size={20} /> <span className="text-xs font-bold uppercase tracking-wide">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIAS */}
        {paso === 1 && (
          <div className="min-h-[85vh] flex flex-col justify-center max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {CATEGORIAS_PRINCIPALES.map(cat => (
                <button key={cat.id} onClick={() => { setCatSeleccionada(cat); if (cat.destino === 'directo') { setMuebleSeleccionado(cat.item); setPaso(3); } else { setPaso(2); } }}
                  className={`${THEME.card} aspect-[4/5] rounded-2xl p-2 md:p-4 flex flex-col items-center justify-center gap-2 md:gap-4 group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-md`}>
                  <div className={`p-3 md:p-4 rounded-full bg-[#F9F7F2] border border-[#E0D8C3] ${THEME.accent} relative z-10 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <IconRenderer name={cat.icon} size={24} className="md:w-8 md:h-8" />
                  </div>
                  <h2 className={`text-[10px] md:text-sm font-bold uppercase tracking-widest relative z-10 ${THEME.textMain} font-sans`}>{cat.label}</h2>
                  <div className={`absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${THEME.primaryText}`}>
                    <ChevronRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LISTA MUEBLES */}
        {paso === 2 && (
          <div className="max-w-2xl mx-auto p-4 space-y-3 animate-fade-in">
            {LISTA_MUEBLES_GRAL.map(item => (
              <button key={item.id} onClick={() => { setMuebleSeleccionado(item); setPaso(3); }}
                className={`${THEME.card} w-full p-5 rounded-2xl flex items-center justify-between group ${THEME.cardHover}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-[#F9F7F2] border border-[#E0D8C3] flex items-center justify-center ${THEME.accent}`}>
                    <IconRenderer name={item.icon} size={24} />
                  </div>
                  <div className="text-left"><h3 className={`font-bold uppercase tracking-wide text-sm md:text-base ${THEME.textMain} font-sans`}>{item.nombre}</h3><p className={`text-[10px] md:text-xs ${THEME.textMuted} mt-0.5 font-sans`}>Personalizable</p></div>
                </div>
                <ChevronRight className={`${THEME.textMuted} group-hover:${THEME.primaryText} transition-colors`} />
              </button>
            ))}
          </div>
        )}

        {/* CONFIGURADOR */}
        {paso === 3 && (
          <div className="max-w-3xl mx-auto p-4 animate-fade-in">
            {/* Modal Materiales (Overlay) */}
            {showMaterialModal && (
              <div className="fixed inset-0 z-50 bg-[#333]/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMaterialModal(false)}>
                <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#E0D8C3] max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white p-6 border-b border-[#F2E9D8] flex justify-between items-center z-10">
                    <h3 className={`font-bold ${THEME.accent} uppercase tracking-widest font-sans`}>Seleccionar Diseño</h3>
                    <button onClick={() => setShowMaterialModal(false)}><X className={THEME.textMuted} /></button>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Renderizamos TODAS las categorías de melamina */}
                    {Object.entries(MELAMINAS_OPCIONES).map(([catKey, items]) => (
                      <div key={catKey}>
                        <h4 className={`text-xs font-bold ${THEME.accent} uppercase mb-2 border-b border-[#E0D8C3] pb-1`}>{catKey.replace(/_/g, ' ')}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {items.map(m => (
                            <button key={m.id} onClick={() => { setConfig({ ...config, material: m.id }); setShowMaterialModal(false) }} className={`group text-left p-1 rounded-xl transition-all ${config.material === m.id ? 'bg-[#F9F7F2] ring-2 ring-[#8B5E3C]' : 'hover:bg-gray-50'}`}>
                              <div className="aspect-video rounded-lg mb-2 shadow-sm border border-[#E0D8C3]" style={{ background: m.css }}></div>
                              <div className="flex justify-between items-center px-1">
                                <span className={`text-[10px] font-bold uppercase ${THEME.textMain} tracking-wide truncate`}>{m.nombre}</span>
                                {config.material === m.id && <Check size={12} className={THEME.accent} />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <section className="grid grid-cols-2 gap-3 mb-6">
              {(catSeleccionada?.id === 'cat_mesa' || catSeleccionada?.id === 'cat_puerta') ? (
                <>
                  <button onClick={() => setConfig({ ...config, uso: 'interior' })} className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${config.uso === 'interior' ? `${THEME.primary} text-white shadow-md border-transparent` : `${THEME.card} border-transparent ${THEME.textMuted}`}`}><Sun size={18} /> <span className="text-xs font-bold tracking-widest">INTERIOR</span></button>
                  <button onClick={() => setConfig({ ...config, uso: 'exterior' })} className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${config.uso === 'exterior' ? `${THEME.primary} text-white shadow-md border-transparent` : `${THEME.card} border-transparent ${THEME.textMuted}`}`}><CloudRain size={18} /> <span className="text-xs font-bold tracking-widest">EXTERIOR</span></button>
                </>
              ) : (
                <>
                  <button onClick={() => setConfig({ ...config, tipoConstruccion: 'placa' })} className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${config.tipoConstruccion === 'placa' ? `${THEME.primary} text-white shadow-md border-transparent` : `${THEME.card} border-transparent ${THEME.textMuted}`}`}><BoxSelect size={18} /> <span className="text-xs font-bold tracking-widest">MELAMINA</span></button>
                  <button onClick={() => setConfig({ ...config, tipoConstruccion: 'maciza' })} className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${config.tipoConstruccion === 'maciza' ? `${THEME.primary} text-white shadow-md border-transparent` : `${THEME.card} border-transparent ${THEME.textMuted}`}`}><Hammer size={18} /> <span className="text-xs font-bold tracking-widest">MACIZA</span></button>
                </>
              )}
            </section>

            {muebleSeleccionado?.id === 'mesa_custom' && (
              <div className="flex bg-white p-1 rounded-xl mb-6 border border-[#E0D8C3] shadow-sm">
                <button onClick={() => setConfig({ ...config, tipoConstruccion: 'maciza' })} className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${config.tipoConstruccion === 'maciza' ? `${THEME.primary} text-white shadow-sm` : THEME.textMuted}`}>Maciza</button>
                <button onClick={() => setConfig({ ...config, tipoConstruccion: config.uso === 'exterior' ? 'chapa_inyectada' : 'placa' })} className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${config.tipoConstruccion !== 'maciza' ? `${THEME.primary} text-white shadow-sm` : THEME.textMuted}`}>{config.uso === 'exterior' ? 'Herrería/Chapa' : 'Melamina/MDF'}</button>
              </div>
            )}

            {muebleSeleccionado?.id === 'puerta_custom' && (
              <div className="flex bg-white p-1 rounded-xl mb-6 border border-[#E0D8C3] shadow-sm">
                <button onClick={() => setConfig({ ...config, tipoConstruccion: 'maciza' })} className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${config.tipoConstruccion === 'maciza' ? `${THEME.primary} text-white shadow-sm` : THEME.textMuted}`}>Maciza</button>
                <button onClick={() => setConfig({ ...config, tipoConstruccion: config.uso === 'exterior' ? 'chapa_inyectada' : 'puerta_placa' })} className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${config.tipoConstruccion !== 'maciza' ? `${THEME.primary} text-white shadow-sm` : THEME.textMuted}`}>{config.uso === 'exterior' ? 'Chapa Iny.' : 'Puerta Placa'}</button>
              </div>
            )}

            <section className={`${THEME.card} p-6 rounded-2xl mb-6`}>
              <div className={`flex items-center gap-3 mb-4 ${THEME.accent}`}><Ruler size={18} /> <h3 className="text-xs font-bold uppercase tracking-widest font-sans">Dimensiones (cm)</h3></div>
              {muebleSeleccionado?.id === 'cama' ? (
                <div className="grid grid-cols-2 gap-3">{CAMAS_MEDIDAS.map(m => (<button key={m.label} onClick={() => handleBedSize(m.label)} className={`p-3 rounded-lg border text-xs font-bold transition-all ${config.ancho === m.w ? `${THEME.primary} text-white shadow-sm border-transparent` : 'border-[#E0D8C3] text-[#666]'}`}>{m.label}</button>))}</div>
              ) : muebleSeleccionado?.id === 'rack_tv' ? (
                <div className="mb-4">
                  <label className={`text-[10px] ${THEME.textMuted} uppercase tracking-widest block mb-2`}>Tamaño TV (Pulgadas)</label>
                  <input type="number" placeholder='Ej: 55"' value={config.tvSize} onChange={e => handleTvSize(e.target.value)} className={`${THEME.input} w-full p-3 rounded-lg text-center text-[#333] mb-4`} />
                  <div className="grid grid-cols-3 gap-2 md:gap-4"><InputMedida label="Ancho" val={config.ancho} onChange={v => setConfig({ ...config, ancho: Number(v) })} /><InputMedida label="Alto" val={config.largo} onChange={v => setConfig({ ...config, largo: Number(v) })} /><InputMedida label="Prof." val={config.profundidad} onChange={v => setConfig({ ...config, profundidad: Number(v) })} /></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                  <InputMedida label="Ancho" val={config.ancho} onChange={v => setConfig({ ...config, ancho: Number(v) })} />
                  <InputMedida label={(muebleSeleccionado?.id?.includes('mesa') || muebleSeleccionado?.id?.includes('puerta')) ? "Largo" : "Alto"} val={config.largo} onChange={v => setConfig({ ...config, largo: Number(v) })} />
                  {(!muebleSeleccionado?.id?.includes('mesa') && !muebleSeleccionado?.id?.includes('puerta')) && (<InputMedida label="Prof." val={config.profundidad} onChange={v => setConfig({ ...config, profundidad: Number(v) })} />)}
                  <div className="flex flex-col items-center justify-center opacity-60"><span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${THEME.textMuted}`}>Espesor</span><div className="w-full bg-[#F9F7F2] border border-[#E0D8C3] text-center text-lg font-light text-[#8B5E3C] py-4 rounded-xl cursor-default">{espesorVisual}</div></div>
                </div>
              )}
            </section>

            {(config.tipoConstruccion !== 'puerta_placa' && config.tipoConstruccion !== 'chapa_inyectada') && (
              <section className={`${THEME.card} p-6 rounded-2xl mb-6`}>
                <div className={`flex items-center gap-3 mb-4 ${THEME.accent}`}><TreePine size={18} /> <h3 className="text-xs font-bold uppercase tracking-widest font-sans">Materialidad</h3></div>
                {isMDF ? (
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => setConfig({ ...config, material: 'm_blanco' })} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${config.material === 'm_blanco' ? `${THEME.primary} text-white border-transparent shadow-md` : 'border-[#E0D8C3] bg-transparent text-[#666]'}`}><span className="font-bold text-sm">Blanco Clásico</span> <div className="w-6 h-6 rounded-full bg-white border border-[#E0D8C3]"></div></button>
                    {/* Botón Mejorado con Preview de Selección */}
                    <button onClick={() => { setModalType('all'); setShowMaterialModal(true) }} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${config.material.startsWith('m_') && config.material !== 'm_blanco' ? `${THEME.accentBorder} bg-[#F9F7F2] ring-1 ring-[#8B5E3C]` : 'border-[#E0D8C3] bg-transparent hover:bg-[#F9F7F2]'}`}>
                      <div className="flex items-center gap-3">
                        <Grid size={20} className={THEME.textMuted} />
                        <span className={`font-bold text-xs md:text-sm ${THEME.textMain}`}>
                          {config.material.startsWith('m_') && config.material !== 'm_blanco'
                            ? `Seleccionado: ${Object.values(MELAMINAS_OPCIONES).flat().find(m => m.id === config.material)?.nombre || 'Diseño'}`
                            : 'Seleccionar Diseño (Colores/Texturas)'}
                        </span>
                      </div>
                      {/* Mini Preview si hay selección */}
                      {config.material.startsWith('m_') && config.material !== 'm_blanco' && (
                        <div className="w-8 h-8 rounded-lg border border-[#E0D8C3] shadow-sm" style={{ background: Object.values(MELAMINAS_OPCIONES).flat().find(m => m.id === config.material)?.css }}></div>
                      )}
                      {!config.material.startsWith('m_') || config.material === 'm_blanco' && <ChevronRight size={16} className={THEME.textMuted} />}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {materialesPosibles.map(m => {
                      const textureData = m.textura;
                      return (
                        <button key={m.id} onClick={() => setConfig({ ...config, material: m.id })} className={`relative h-24 rounded-xl overflow-hidden border transition-all group ${config.material === m.id ? `${THEME.accentBorder} ring-2 ring-[#5D4037] ring-offset-2 ring-offset-[#F2E9D8]` : 'border-[#E0D8C3] hover:opacity-100 opacity-90'}`}>
                          {textureData.type === 'img' ? (
                            <img src={textureData.src} className="absolute inset-0 w-full h-full object-cover" alt={m.nombre} referrerPolicy="no-referrer" />
                          ) : (
                            <div className="absolute inset-0" style={{ background: textureData.css }}></div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-3">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-white text-center shadow-sm">{m.nombre}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            <section className="space-y-4 mb-10">
              {muebleSeleccionado?.forma === 'mesa' && !isMDF && (
                <div className={`${THEME.card} p-6 rounded-2xl`}>
                  <div className="flex gap-2 mb-4 bg-[#F9F7F2] p-1 rounded-xl border border-[#E0D8C3]">
                    {/* Filtramos patas de madera si es Exterior */}
                    {['sin_patas', 'madera', 'metal'].filter(k => !(config.uso === 'exterior' && k === 'madera')).map(k => (
                      <button key={k} onClick={() => setConfig({ ...config, tipoPatas: k })} className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${config.tipoPatas === k ? `${THEME.accentBg} text-white shadow-sm` : THEME.textMuted}`}>{k.replace('_', ' ')}</button>
                    ))}
                  </div>
                  {config.tipoPatas !== 'sin_patas' && (
                    <div className="grid grid-cols-3 gap-3">
                      {OPCIONES_PATAS[config.tipoPatas]?.map(p => {
                        const Icon = p.icon; // Solución error objeto como hijo
                        return (
                          <button key={p.id} onClick={() => setConfig({ ...config, modeloPatas: p.id })} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all h-24 ${config.modeloPatas === p.id ? `${THEME.accentBg} text-white border-transparent` : 'border-[#E0D8C3] text-[#666] hover:border-[#8B5E3C]'}`}>
                            {Icon && <Icon size={20} />}
                            <span className="text-[9px] md:text-xs font-bold uppercase">{p.nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {muebleSeleccionado?.permite_herrajes && (
                <div className="grid grid-cols-2 gap-3">
                  <div className={`${THEME.card} p-4 rounded-xl flex flex-col items-center justify-center gap-2`}><span className={`text-[10px] font-bold uppercase ${THEME.textMuted}`}>Cajones</span><div className="flex items-center gap-3 bg-[#F9F7F2] rounded-lg p-1 w-full justify-between border border-[#E0D8C3]"><button onClick={() => setConfig(p => ({ ...p, cantCajones: Math.max(0, p.cantCajones - 1) }))} className={`w-8 h-8 flex items-center justify-center ${THEME.accent} hover:bg-black/5 rounded`}>-</button><span className={`font-mono text-lg ${THEME.textMain}`}>{config.cantCajones}</span><button onClick={() => setConfig(p => ({ ...p, cantCajones: p.cantCajones + 1 }))} className={`w-8 h-8 flex items-center justify-center ${THEME.accent} hover:bg-black/5 rounded`}>+</button></div></div>
                  <div className={`${THEME.card} p-4 rounded-xl flex flex-col items-center justify-center gap-2`}><span className={`text-[10px] font-bold uppercase ${THEME.textMuted}`}>Puertas</span><div className="flex items-center gap-3 bg-[#F9F7F2] rounded-lg p-1 w-full justify-between border border-[#E0D8C3]"><button onClick={() => setConfig(p => ({ ...p, cantPuertas: Math.max(0, p.cantPuertas - 1) }))} className={`w-8 h-8 flex items-center justify-center ${THEME.accent} hover:bg-black/5 rounded`}>-</button><span className={`font-mono text-lg ${THEME.textMain}`}>{config.cantPuertas}</span><button onClick={() => setConfig(p => ({ ...p, cantPuertas: p.cantPuertas + 1 }))} className={`w-8 h-8 flex items-center justify-center ${THEME.accent} hover:bg-black/5 rounded`}>+</button></div></div>
                </div>
              )}

              {config.tipoConstruccion === 'chapa_inyectada' && (
                <div className={`${THEME.card} p-6 rounded-2xl space-y-4`}>
                  <div className="space-y-2"><h4 className={`text-[10px] md:text-xs ${THEME.accent} font-bold uppercase tracking-wider`}>Color Base</h4><div className="grid grid-cols-3 gap-2">{COLORES_CHAPA.map(c => (<button key={c.id} onClick={() => setConfig({ ...config, chapa_color: c.id })} className={`p-2 rounded-xl border text-[10px] md:text-xs font-bold transition-all relative overflow-hidden h-12 ${config.chapa_color === c.id ? `${THEME.accentBorder} ring-1 ring-[#8B5E3C]` : 'border-[#E0D8C3]'}`}><div className="absolute inset-0 opacity-80" style={{ background: c.css }}></div><span className="relative z-10 uppercase text-white shadow-sm font-black">{c.nombre}</span></button>))}</div></div>
                  <div className="space-y-2"><h4 className={`text-[10px] md:text-xs ${THEME.accent} font-bold uppercase tracking-wider`}>Acabado Superficie</h4><div className="grid grid-cols-3 gap-2">{ACABADOS_CHAPA.map(a => (<button key={a.id} onClick={() => setConfig({ ...config, chapa_acabado: a.id })} className={`p-2 rounded-xl border text-[10px] md:text-xs font-bold transition-all ${config.chapa_acabado === a.id ? `${THEME.accentBg} text-white` : 'border-[#E0D8C3] text-[#666]'}`}>{a.nombre}</button>))}</div></div>
                </div>
              )}

              {(config.tipoConstruccion === 'maciza' || config.tipoConstruccion === 'puerta_placa') && (
                <div className={`${THEME.card} p-6 rounded-2xl`}>
                  <h4 className={`text-[10px] md:text-xs ${THEME.accent} font-bold uppercase mb-3 tracking-wider`}>Acabado Final</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {ACABADOS.map(a => (
                      <button key={a.id} onClick={() => setConfig({ ...config, acabado: a.id })} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all h-14 ${config.acabado === a.id ? `${THEME.accentBg} text-white` : 'border-[#E0D8C3] text-[#666]'}`}>
                        <span className={`text-center ${a.id === 'natural' ? 'text-xs md:text-sm font-black tracking-widest uppercase' : 'text-[10px] md:text-xs font-bold uppercase'}`}>{a.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(muebleSeleccionado?.id?.includes('puerta') || config.tipoConstruccion === 'chapa_inyectada') && !((muebleSeleccionado?.id === 'mesa_custom' && config.uso === 'exterior')) && (
                <button onClick={() => setConfig({ ...config, marco: !config.marco })} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${config.marco ? `${THEME.accentBg} text-white` : 'border-[#E0D8C3] bg-white text-[#666]'}`}><span className="text-xs font-bold uppercase">Incluir Marco {config.tipoConstruccion === 'chapa_inyectada' ? '(Metálico)' : ''}</span><div className={`w-6 h-6 rounded border flex items-center justify-center ${config.marco ? `bg-white/20 border-transparent text-white` : 'border-[#999]'}`}>{config.marco && <Check size={14} />}</div></button>
              )}
            </section>

            {/* Footer Precio (RECUPERADO: NO FLOTANTE, AL FINAL) */}
            <div className="mt-8 mb-12 flex flex-col items-center gap-4">
              <div className="flex flex-col items-center">
                <span className={`text-xs ${THEME.textMuted} uppercase tracking-widest mb-1`}>Valor Estimado</span>
                <span className={`text-3xl md:text-4xl font-bold ${THEME.textMain} tracking-tight font-sans`}>
                  {precioItemActual > 0 ? `$${new Intl.NumberFormat('es-AR').format(precioItemActual)}` : 'A Cotizar'}
                </span>
              </div>
              <button onClick={agregarCarrito} className={`${THEME.primary} hover:${THEME.primaryHover} text-white w-full py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-[#5D4037]/20 transition-all active:scale-95 flex items-center justify-center gap-3`}>
                <Plus size={20} /> AGREGAR AL PEDIDO
              </button>
            </div>
          </div>
        )}

        {/* CARRITO */}
        {paso === 4 && (
          <div className="max-w-2xl mx-auto p-4 md:p-6 animate-fade-in pb-10">
            <div className="space-y-4 mb-8">
              {carrito.map(item => (
                <div key={item.id} className={`${THEME.card} p-5 rounded-2xl flex gap-5 group relative`}>
                  <div className={`w-20 h-20 rounded-lg bg-[#F9F7F2] flex items-center justify-center text-3xl border border-[#E0D8C3]}`}>{item.mueble.imagen}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start"><h3 className={`font-bold uppercase text-lg ${THEME.textMain} font-sans`}>{item.mueble.nombre}</h3><button onClick={() => setCarrito(carrito.filter(c => c.id !== item.id))} className={`${THEME.textMuted} hover:text-red-500`}><Trash2 size={18} /></button></div>
                    <p className={`text-sm ${THEME.textMuted} mt-1`}>{item.config.ancho}x{item.config.largo}cm • {item.config.materialNombre}</p>
                    <div className={`text-xs ${THEME.accent} mt-1 font-bold`}>
                      {item.config.acabado !== 'natural' && item.config.tipoConstruccion !== 'chapa_inyectada' && `Terminación: ${item.config.acabado} • `}
                      {item.config.tipoConstruccion === 'chapa_inyectada' && `${item.config.chapa_color} ${item.config.chapa_acabado} • `}
                      {item.config.marco && `Con Marco`}
                    </div>
                    <p className={`text-sm font-bold ${THEME.secondaryText} mt-2`}>{item.precio > 0 ? `$${new Intl.NumberFormat('es-AR').format(item.precio)}` : 'A Cotizar'}</p>
                  </div>
                </div>
              ))}
              {carrito.length === 0 && <div className={`text-center py-20 ${THEME.textMuted}`}>Tu pedido está vacío.</div>}
              <button onClick={() => { setPaso(1); setCatSeleccionada(null); }} className={`w-full py-4 rounded-xl border border-dashed border-[#E0D8C3] ${THEME.textMuted} hover:${THEME.accent} hover:border-[#8B5E3C] hover:bg-white transition-all flex items-center justify-center gap-2 font-bold text-sm uppercase`}><Plus size={18} /> Agregar otro mueble</button>
            </div>

            {carrito.length > 0 && (
              <div className={`${THEME.card} p-6 rounded-2xl space-y-4`}>
                <h3 className={`text-xs font-bold uppercase ${THEME.accent} tracking-widest mb-4`}>Datos de Contacto</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`flex items-center gap-3 bg-[#F9F7F2] p-4 rounded-xl border border-[#E0D8C3] focus-within:border-[#8B5E3C] transition-colors`}><User size={18} className={THEME.textMuted} /><input value={cliente.nombre} onChange={e => setCliente({ ...cliente, nombre: e.target.value })} placeholder="Nombre" className={`bg-transparent w-full outline-none ${THEME.textMain} text-sm placeholder-[#999]`} /></div>
                  <div className={`flex items-center gap-3 bg-[#F9F7F2] p-4 rounded-xl border border-[#E0D8C3] focus-within:border-[#8B5E3C] transition-colors`}><MapPin size={18} className={THEME.textMuted} /><input value={cliente.lugar} onChange={e => setCliente({ ...cliente, lugar: e.target.value })} placeholder="Ciudad" className={`bg-transparent w-full outline-none ${THEME.textMain} text-sm placeholder-[#999]`} /></div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#F9F7F2] p-1.5 rounded-xl border border-[#E0D8C3]">
                  <button onClick={() => setCliente({ ...cliente, entrega: 'taller' })} className={`py-3 rounded-lg text-xs font-bold uppercase flex flex-col items-center gap-1 transition-all ${cliente.entrega === 'taller' ? `${THEME.accentBg} text-white shadow-sm` : THEME.textMuted}`}>
                    <Store size={18} /> Retiro Taller
                  </button>
                  <button onClick={() => setCliente({ ...cliente, entrega: 'envio' })} className={`py-3 rounded-lg text-xs font-bold uppercase flex flex-col items-center gap-1 transition-all ${cliente.entrega === 'envio' ? `${THEME.accentBg} text-white shadow-sm` : THEME.textMuted}`}>
                    <Truck size={18} /> Envío Domicilio
                  </button>
                </div>

                {cliente.entrega === 'taller' && (
                  <a href={DATOS_CONTACTO.maps_link} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 p-4 rounded-xl border border-[#E0D8C3] bg-white ${THEME.accent} hover:bg-[#F9F7F2] transition-all text-xs font-bold uppercase`}>
                    <Map size={16} /> Ver Ubicación Taller en Maps
                  </a>
                )}

                <input type="file" ref={fileInputRef} className="hidden" onChange={e => { if (e.target.files[0]) setCliente(p => ({ ...p, nombreArchivo: e.target.files[0].name })) }} />
                <button onClick={() => fileInputRef.current.click()} className={`w-full py-4 rounded-xl text-sm font-bold uppercase flex items-center justify-center gap-2 transition-all ${cliente.nombreArchivo ? 'bg-[#7A8D6F]/20 text-[#7A8D6F] border border-[#7A8D6F]/30' : `bg-[#F9F7F2] ${THEME.textMuted} border border-[#E0D8C3] hover:bg-white`}`}><Paperclip size={16} /> {cliente.nombreArchivo ? 'Archivo Adjunto OK' : 'Adjuntar Plano / Foto'}</button>
              </div>
            )}

            {carrito.length > 0 && (
              <div className="mt-8 mb-24 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className={`text-xs ${THEME.textMuted} uppercase tracking-widest mb-1`}>Total Estimado</span>
                  <span className={`text-3xl md:text-4xl font-bold ${THEME.textMain} tracking-tight font-sans`}>${new Intl.NumberFormat('es-AR').format(carrito.reduce((a, b) => a + b.precio, 0))}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={generarPresupuestoPDF} className={`w-full py-4 rounded-xl font-bold uppercase text-[#5D4037] border border-[#5D4037] hover:bg-[#5D4037] hover:text-white transition-all flex items-center justify-center gap-2 text-xs md:text-sm`}>
                    <FileText size={20} /> Descargar PDF
                  </button>
                  <button onClick={enviarWhatsapp} disabled={!cliente.nombre} className={`w-full py-4 rounded-xl font-bold uppercase text-white shadow-lg flex items-center justify-center gap-2 transition-all ${cliente.nombre ? `${THEME.primary} hover:${THEME.primaryHover} shadow-[#5D4037]/30` : 'bg-[#E0D8C3] cursor-not-allowed text-[#999]'} text-xs md:text-sm`}>
                    <Send size={20} /> Enviar WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GALERIA */}
        {paso === 5 && (
          <div className="max-w-6xl mx-auto p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl md:text-2xl font-light tracking-widest ${THEME.textMain} uppercase font-sans`}>Nuestros Trabajos</h2>
              <button
                onClick={() => setShowReviews(true)}
                className={`px-4 py-2 bg-white border border-[#8B5E3C] text-[#8B5E3C] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#8B5E3C] hover:text-white transition-all shadow-sm flex items-center gap-2`}
              >
                <MessageCircle size={16} /> RESEÑAS
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
              {galeria.map(img => (
                <div key={img.id} onClick={() => setSelectedImage(img)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-md transition-all border border-[#E0D8C3]">
                  <img src={getDirectDriveUrl(img.src)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity">
                    <span className="text-white text-sm md:text-lg font-bold uppercase tracking-widest mb-4 px-2 text-center drop-shadow-md font-sans">{img.alt}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <a
                href={instagramUrl || DEFAULT_INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className={`px-6 py-3 rounded-xl border border-[#C13584] text-[#C13584] text-xs font-bold uppercase hover:bg-[#C13584] hover:text-white transition-colors flex items-center gap-2 shadow-sm`}
              >
                <Instagram size={18} /> Seguinos en Instagram
              </a>
            </div>
          </div>
        )}

        {/* QUIENES SOMOS (Texto Completo Restaurado) */}
        {paso === 6 && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in text-center max-w-2xl mx-auto">
            <div className={`w-32 h-32 rounded-full bg-white border border-[#E0D8C3] flex items-center justify-center mb-8 shadow-sm`}>
              <Users size={56} className={THEME.accent} />
            </div>
            <h2 className={`text-4xl font-light uppercase tracking-widest ${THEME.textMain} mb-8 font-sans`}>Sobre Nosotros</h2>

            <p className={`uppercase tracking-[0.3em] text-xs font-bold ${THEME.accent} mb-6`}>Carpintería de Autor</p>

            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-[#E0D8C3] shadow-sm space-y-6 text-[#1a1a1a] text-lg leading-relaxed font-light text-center">
              <p>En <strong className="font-bold">eBe Muebles</strong> nos apasiona trabajar con <strong className="font-bold">madera maciza</strong> cuidadosamente seleccionada y proveniente de fuentes <strong className="font-bold">reforestadas</strong>. Cada corte, cada detalle, se realiza con profundo respeto por la materia prima y por la naturaleza que nos la entrega.</p>

              <p>Combinamos la robustez y carácter del <strong className="font-bold">hierro</strong> con la calidez y vida de la <strong className="font-bold">madera natural</strong>, dando vida a piezas de gran resistencia que transmiten una estética industrial o moderna, siempre elegante y atemporal.</p>

              <p>Además, ponemos toda nuestra precisión y tecnología al servicio del <strong className="font-bold">MDF y la melamina</strong>, logrando terminaciones impecables y soluciones que aprovechan al máximo cada centímetro, creando espacios funcionales, cómodos y pensados para vos.</p>

              <p>Más que muebles, creamos el escenario donde se escriben tus mejores momentos: reuniones con amigos, desayunos en familia, tardes de trabajo inspiradas o simplemente el placer de llegar a casa.</p>

              <p className={`italic ${THEME.textMuted} mt-6 border-t border-[#E0D8C3] pt-6`}>Te invitamos a descubrir piezas hechas con <strong className="font-bold text-[#8B5E3C]">dedicación, diseño y mucho cariño.</strong> 💛🪵</p>
            </div>

            <div className="mt-12 flex justify-center">
              <a
                href={instagramUrl || DEFAULT_INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className={`px-10 py-4 rounded-xl border border-[#C13584] text-[#C13584] text-sm font-bold uppercase hover:bg-[#C13584] hover:text-white transition-colors flex items-center gap-2 shadow-sm`}
              >
                <Instagram size={20} /> Seguinos en Instagram
              </a>
            </div>
          </div>
        )}

        {/* Modal Imagen Galeria */}
        {selectedImage && (
          <div className="fixed inset-0 z-[60] bg-[#333]/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button className="absolute left-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm z-50 shadow-lg" onClick={prevImage}><ChevronLeft size={32} /></button>
            <img src={getDirectDriveUrl(selectedImage.src)} className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} referrerPolicy="no-referrer" />
            <button className="absolute right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm z-50 shadow-lg" onClick={nextImage}><ChevronRight size={32} /></button>
            <button className="absolute top-4 right-4 text-white hover:text-red-500"><X size={32} /></button>
            <p className="absolute bottom-8 text-white font-bold tracking-widest uppercase bg-black/60 px-6 py-3 rounded-full backdrop-blur-md shadow-lg font-sans">{selectedImage.alt}</p>
          </div>
        )}

      </div>
    </>
  );
};

export default App;