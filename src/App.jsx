import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy
} from 'firebase/firestore';
import {
  Ruler, TreePine, Palette, Send, ShoppingCart, Plus, Trash2, Settings,
  ChevronRight, ChevronLeft, Image as ImageIcon, Sparkles, MessageSquare, BoxSelect,
  Armchair, Sun, CloudRain, Hammer, Monitor, Tv, Bed, Utensils, Archive,
  RectangleVertical, Box, LogOut, Save, Coins, ImagePlus, Lock, MapPin,
  User, Paperclip, X, Check, Table, DoorOpen, ArrowLeft, Truck, Store, Map, Users,
  Square, Circle, Triangle, Info, Star, Edit3, FileText, Download, MessageCircle
} from 'lucide-react';

// ==============================================================================
//  1. CONFIGURACIÓN Y DATOS
// ==============================================================================

// Configuración segura de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCObM7lu1VN6kvPx9Ifgd4eo4N3bgm-Oak",
  authDomain: "ebemuebles1.firebaseapp.com",
  projectId: "ebemuebles1",
  storageBucket: "ebemuebles1.firebasestorage.app",
  messagingSenderId: "570132018153",
  appId: "1:570132018153:web:ef8577e7109df18aadd178",
  measurementId: "G-4GCBZ6YWM3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ebe-muebles-v3';
const apiKey = "";

// --- COLORES Y ESTILOS (IDENTIDAD VISUAL "EBE MUEBLES DARK ROAST") ---
const THEME = {
  bg: "bg-[#E8DCCA]", // Beige Arena (Fondo)
  card: "bg-white border border-[#D6C4B0] shadow-sm",
  cardHover: "hover:border-[#5D4037] hover:shadow-md transition-all duration-500 ease-out",
  accent: "text-[#8B5E3C]", // Madera Natural (Iconos y bordes suaves)
  accentBg: "bg-[#8B5E3C]",
  accentBorder: "border-[#8B5E3C]",
  primary: "bg-[#5D4037]", // Marrón Café Intenso (Botones de Acción)
  primaryText: "text-[#5D4037]",
  primaryHover: "hover:bg-[#3E2723]",
  secondary: "bg-[#7A8D6F]", // Verde Oliva Suave
  secondaryText: "text-[#7A8D6F]",
  textMain: "text-[#2C241F]", // Café muy oscuro para lectura
  textMuted: "text-[#6B5A4E]", // Marrón grisáceo
  input: "bg-white border border-[#D6C4B0] focus:border-[#5D4037] outline-none transition-all font-sans text-[#2C241F] placeholder-[#999]"
};

// LOGO DEL NEGOCIO
const LOGO_SRC = "https://cdn-icons-png.flaticon.com/512/3030/3030336.png";

// EMAILS AUTORIZADOS
const ADMIN_EMAILS = [
  'emabelaver@gmail.com',
  'acevedo.gestoriadelautomotor@gmail.com'
];

const DATOS_CONTACTO = {
  telefono_whatsapp: "5493547531519",
  nombre_negocio: "eBe Muebles",
  maps_link: "https://maps.app.goo.gl/yXy8vciXoR11Z4L8A"
};

// --- COSTOS BASE ---
const DEFAULT_COSTOS = {
  // MESAS (Interior Base)
  madera_basica: 8500, madera_intermedia: 9700, madera_premium: 11000,

  // PUERTAS (Exterior e Interior)
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

const TESTIMONIOS = [
  { id: 1, nombre: "Martín G.", texto: "La mesa quedó increíble. La madera es de primera calidad.", stars: 5 },
  { id: 2, nombre: "Sofía L.", texto: "Excelente atención. Me asesoraron con las medidas y quedó perfecto.", stars: 5 },
  { id: 3, nombre: "Lucas M.", texto: "Muy prolijo el trabajo en hierro y madera. Recomendadisimos.", stars: 5 },
];

// --- MADERAS (Editables desde el Panel) ---
const DEFAULT_MADERAS = [
  { id: 'eucalipto', nombre: 'Eucalipto', tier: 'basica', src: "https://images.unsplash.com/photo-1626071465992-0081e3532f3c?q=80&w=400&auto=format&fit=crop" },
  { id: 'guayubira', nombre: 'Guayubira', tier: 'intermedia', src: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=400&auto=format&fit=crop" },
  { id: 'guayca', nombre: 'Guayca', tier: 'intermedia', src: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=400&auto=format&fit=crop" },
  { id: 'zoyta', nombre: 'Zoyta', tier: 'intermedia', src: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=400&auto=format&fit=crop" },
  { id: 'cedro', nombre: 'Cedro', tier: 'intermedia', src: "https://images.unsplash.com/photo-1596633605700-1efc9b49e277?q=80&w=400&auto=format&fit=crop" },
  { id: 'petiribi', nombre: 'Petiribí', tier: 'premium', src: "https://images.unsplash.com/photo-1541123638804-61f7adb9dbad?q=80&w=400&auto=format&fit=crop" },
];

const MELAMINAS_OPCIONES = {
  blanco: [{ id: 'm_blanco', nombre: 'Blanco', factor: 1.0, css: '#FFFFFF' }],
  color: [
    { id: 'm_gris_humo', nombre: 'Gris Humo', factor: 1.2, css: '#78909C' },
    { id: 'm_grafito', nombre: 'Grafito', factor: 1.2, css: '#37474F' },
    { id: 'm_negro', nombre: 'Negro', factor: 1.2, css: '#212121' },
    { id: 'm_azul', nombre: 'Azul Lago', factor: 1.25, css: '#546E7A' },
    { id: 'm_visom', nombre: 'Visón', factor: 1.2, css: '#A1887F' }
  ],
  texturado: [
    { id: 'm_baltico', nombre: 'Báltico', factor: 1.35, css: 'linear-gradient(45deg, #E0E0E0 25%, #F5F5F5 25%, #F5F5F5 50%, #E0E0E0 50%)' },
    { id: 'm_roble', nombre: 'Roble Kendal', factor: 1.35, css: '#8D6E63' },
    { id: 'm_seda', nombre: 'Seda Notte', factor: 1.4, css: '#3E2723' }
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

const OPCIONES_PATAS = {
  sin_patas: [{ id: 'ninguna', nombre: 'Sin Patas', icon: Box }],
  madera: [
    { id: 'recta', nombre: 'Rectas', icon: Square },
    { id: 'cuadrada', nombre: 'Cuadradas', icon: Box },
    { id: 'l_shape', nombre: 'En L', icon: ChevronRight }
  ],
  metal: [
    { id: 'industrial_u', nombre: 'Industrial U', icon: Square },
    { id: 'industrial_x', nombre: 'Industrial X', icon: X },
    { id: 'hairpin', nombre: 'Hairpin', icon: Triangle }
  ]
};

// ACABADOS SIMPLIFICADOS
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700;800&display=swap');
    
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
    {/* Subtle gradient overlay to add depth */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
    {/* Very subtle noise texture for craftsmanship feel */}
    <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}></div>
  </div>
);

const Header = ({ onBack, title, onLogoClick, showCart, cartCount, onCartClick }) => (
  <header className="sticky top-0 z-20 backdrop-blur-md bg-[#E8DCCA]/90 border-b border-[#D6C4B0] py-4 px-4 flex justify-between items-center transition-all">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className={`p-2.5 rounded-full hover:bg-white/50 ${THEME.textMain} transition-colors active:scale-95`}>
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className={`text-lg md:text-xl font-bold tracking-wide ${THEME.textMain} truncate max-w-[200px] md:max-w-none font-sans uppercase`}>{title}</h1>
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
          src={LOGO_SRC}
          alt="eBe Logo"
          className="h-8 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  </header>
);

const IconRenderer = ({ name, size = 24, className }) => {
  const icons = { Table, DoorOpen, Armchair, RectangleVertical, Box, Monitor, Utensils, Archive, Bed, Tv };
  const IconComponent = icons[name] || Box;
  return <IconComponent size={size} className={className} />;
};

const InputMedida = ({ label, val, onChange }) => (
  <div className="flex flex-col items-center group w-full">
    <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${THEME.textMuted}`}>{label}</label>
    <input
      type="number" value={val} onChange={e => onChange(e.target.value)} onFocus={e => e.target.select()}
      className={`w-full ${THEME.input} text-center text-lg md:text-xl font-light py-4 rounded-xl shadow-sm hover:border-[#5D4037]/30`}
    />
  </div>
);

// ==============================================================================
//  3. LOGICA PRINCIPAL (APP)
// ==============================================================================

const App = () => {
  const [paso, setPaso] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('orders');

  // Datos
  const [costos, setCostos] = useState(DEFAULT_COSTOS);
  const [galeria, setGaleria] = useState(DEFAULT_GALERIA);
  const [maderas, setMaderas] = useState(DEFAULT_MADERAS);

  const [orders, setOrders] = useState([]);
  const [carrito, setCarrito] = useState([]);

  // Admin Galeria/Materiales State
  const [newImage, setNewImage] = useState({ url: '', alt: '' });

  // Selección
  const [catSeleccionada, setCatSeleccionada] = useState(null);
  const [muebleSeleccionado, setMuebleSeleccionado] = useState(null);

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
  const [showAbout, setShowAbout] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const [showAi, setShowAi] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const isMDF = config.tipoConstruccion === 'placa';
  const fileInputRef = useRef(null);

  // LOGICA TITULO DINAMICO
  const getHeaderTitle = () => {
    if (paso === 5) return "Galería";
    if (paso === 4) return "Tu Pedido";
    if (paso === 6) return "Nosotros";
    if (paso === 3 && muebleSeleccionado) return muebleSeleccionado.nombre;
    if (paso === 2 && catSeleccionada) return catSeleccionada.label;
    if (paso === 1) return "Categorías";
    return "EBE MUEBLES";
  };

  // --- EFECTOS & LOGICA ---

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch (e) { console.warn("Modo offline"); }
    };
    initAuth();
  }, []);

  const handleAdminLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (ADMIN_EMAILS.includes(result.user.email)) {
        setIsAdmin(true);
      } else {
        alert("Acceso denegado. Este correo no tiene permisos de administrador.");
        await signOut(auth);
        await signInAnonymously(auth);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

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

  // Logica Cama y Rack Inteligente
  const handleTvSize = (inches) => {
    const w = Math.round(Number(inches) * 2.21 + 30);
    setConfig({ ...config, tvSize: inches, ancho: w, largo: 55, profundidad: 40 });
  };

  const handleBedSize = (sizeLabel) => {
    const medidas = CAMAS_MEDIDAS.find(m => m.label === sizeLabel);
    if (medidas) setConfig({ ...config, ancho: medidas.w, largo: 60, profundidad: medidas.l });
  };

  // Lógica Materiales
  useEffect(() => {
    if (paso === 3) {
      if (config.uso === 'exterior' && (config.tipoConstruccion === 'placa' || config.tipoConstruccion === 'puerta_placa')) {
        setConfig(prev => ({ ...prev, tipoConstruccion: 'maciza' }));
        return;
      }
      let mats = [];
      let esp = "1\"";

      const MATERIALES = [
        ...maderas.map(m => ({
          id: m.id,
          nombre: m.nombre,
          type: 'maciza',
          tier: m.tier,
          textura: { type: 'img', src: m.src }
        })),
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
        mats = []; esp = "18mm";
        if (muebleSeleccionado?.id?.includes('mesa')) esp = "36mm (Regruesado)";
        if (!MELAMINAS_OPCIONES.blanco.find(m => m.id === config.material) && !MELAMINAS_OPCIONES.color.find(m => m.id === config.material) && !MELAMINAS_OPCIONES.texturado.find(m => m.id === config.material)) setConfig(prev => ({ ...prev, material: 'm_blanco' }));
      } else if (config.tipoConstruccion === 'puerta_placa') {
        mats = [MATERIAL_PUERTA_PLACA]; esp = "Std"; setConfig(prev => ({ ...prev, material: MATERIAL_PUERTA_PLACA.id }));
      } else if (config.tipoConstruccion === 'chapa_inyectada') {
        mats = [MATERIAL_PUERTA_CHAPA]; esp = "3\""; setConfig(prev => ({ ...prev, material: MATERIAL_PUERTA_CHAPA.id }));
      }
      setMaterialesPosibles(mats);
      setEspesorVisual(esp);
    }
  }, [config.tipoConstruccion, config.uso, paso, costos, maderas]);

  // Calculadora
  useEffect(() => {
    // Regla: Mobiliario SIEMPRE es a cotizar
    if (catSeleccionada?.id === 'cat_muebles') {
      setPrecioItemActual(0);
      return;
    }

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
          // LOGICA PUERTAS: Interior vs Exterior
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
          // LOGICA MESAS: Base + Factor Exterior
          base = mat ? costos[`madera_${mat.tier}`] : costos.madera_basica;
          if (config.uso === 'exterior') base *= costos.factor_exterior; // 1.3
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
      const found = [...MELAMINAS_OPCIONES.blanco, ...MELAMINAS_OPCIONES.color, ...MELAMINAS_OPCIONES.texturado].find(m => m.id === config.material);
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
      const labelLargo = (i.mueble.id?.includes('mesa') || i.mueble.id?.includes('puerta')) ? 'Largo' : 'Alto';
      text += `🔹 *${i.mueble.nombre}*\n   Ancho: ${i.config.ancho} x ${labelLargo}: ${i.config.largo}${i.config.profundidad ? ' x Prof: ' + i.config.profundidad : ''}cm\n   Material: ${i.config.materialNombre}\n`;
      if (i.config.cantCajones > 0) text += `   + ${i.config.cantCajones} Cajones\n`;
      if (i.config.cantPuertas > 0) text += `   + ${i.config.cantPuertas} Puertas\n`;
      if (i.config.acabado !== 'natural') text += `   + ${i.config.acabado.toUpperCase()}\n`;
      if (i.precio === 0) text += `   (A Cotizar)\n`;
    });
    text += `\n💰 *Total Estimado: $${new Intl.NumberFormat('es-AR').format(total)}*`;
    if (cliente.nombreArchivo) text += `\n📎 Archivo adjunto: ${cliente.nombreArchivo}`;
    window.open(`https://wa.me/${DATOS_CONTACTO.telefono_whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // PDF GENERATOR
  const generarPresupuestoPDF = () => {
    const total = carrito.reduce((a, b) => a + b.precio, 0);
    const printWindow = window.open('', '_blank');
    const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

    printWindow.document.write(`
      <html>
        <head>
          <title>Presupuesto - EBE Muebles</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Inter:wght@300;400;600&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #2C241F; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #5D4037; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-section img { height: 60px; }
            .company-info { text-align: right; font-size: 12px; color: #666; }
            h1 { font-family: 'Montserrat', sans-serif; color: #5D4037; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }
            .client-info { background: #E8DCCA; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #D6C4B0; }
            .client-info h3 { margin-top: 0; color: #5D4037; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background: #5D4037; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            td { padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .item-name { font-weight: 600; color: #2C241F; }
            .item-desc { font-size: 12px; color: #666; margin-top: 4px; }
            .total-section { text-align: right; margin-top: 20px; border-top: 2px solid #5D4037; padding-top: 20px; }
            .total-label { font-size: 14px; text-transform: uppercase; color: #666; }
            .total-amount { font-size: 32px; font-weight: 700; color: #5D4037; font-family: 'Montserrat', sans-serif; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
               <img src="${LOGO_SRC}" alt="EBE Muebles Logo" />
            </div>
            <div class="company-info">
              <p><strong>EBE Muebles</strong></p>
              <p>Alta Gracia, Córdoba</p>
              <p>Tel: +54 9 3547 531519</p>
            </div>
          </div>

          <div class="client-info">
            <h3>Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${cliente.nombre || 'Consumidor Final'}</p>
            <p><strong>Ubicación:</strong> ${cliente.lugar || '-'}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
          </div>

          <h1>Detalle de Presupuesto</h1>
          
          <table>
            <thead>
              <tr>
                <th style="width: 50%">Producto</th>
                <th style="width: 30%">Especificaciones</th>
                <th style="width: 20%; text-align: right">Valor Estimado</th>
              </tr>
            </thead>
            <tbody>
              ${carrito.map(item => `
                <tr>
                  <td>
                    <div class="item-name">${item.mueble.nombre}</div>
                    <div class="item-desc">${item.config.materialNombre}</div>
                  </td>
                  <td>
                    <div style="font-size: 12px; line-height: 1.5;">
                      ${item.config.ancho} x ${item.config.largo} cm <br/>
                      ${item.config.acabado !== 'natural' ? `Acabado: ${item.config.acabado}` : ''}
                      ${item.config.cantCajones > 0 ? `<br/>${item.config.cantCajones} Cajones` : ''}
                    </div>
                  </td>
                  <td style="text-align: right; font-weight: 600;">$${new Intl.NumberFormat('es-AR').format(item.precio)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <span class="total-label">Total Estimado</span><br/>
            <span class="total-amount">$${new Intl.NumberFormat('es-AR').format(total)}</span>
          </div>

          <div class="footer">
            <p>Este documento es un presupuesto estimativo y no representa un comprobante fiscal válido.</p>
            <p>Los precios pueden variar según disponibilidad de materiales y ajustes finales de diseño.</p>
            <p>Gracias por elegirnos para crear tu espacio.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleAi = async (e) => {
    e.preventDefault(); setAiLoading(true);
    setTimeout(() => { setAiResponse("Para este estilo, te recomiendo combinar Petiribí con terminación natural. Aporta una calidez inigualable y es tendencia en diseño de interiores."); setAiLoading(false); }, 1500);
  };

  const nextImage = (e) => { e.stopPropagation(); setSelectedImage(galeria[(galeria.findIndex(i => i.id === selectedImage.id) + 1) % galeria.length]); };
  const prevImage = (e) => { e.stopPropagation(); setSelectedImage(galeria[(galeria.findIndex(i => i.id === selectedImage.id) - 1 + galeria.length) % galeria.length]); };

  // Admin Funcs
  const addGalleryImage = () => { if (newImage.url) { setGaleria([...galeria, { id: Date.now(), src: newImage.url, alt: newImage.alt || 'Nuevo Trabajo' }]); setNewImage({ url: '', alt: '' }); } };
  const removeGalleryImage = (id) => { setGaleria(galeria.filter(g => g.id !== id)); };

  const handleCostoChange = (k, rawValue) => {
    const num = parseInt(rawValue.replace(/\D/g, ''), 10);
    setCostos({ ...costos, [k]: isNaN(num) ? 0 : num });
  };

  const updateMadera = (index, field, value) => {
    const newMaderas = [...maderas];
    newMaderas[index][field] = value;
    setMaderas(newMaderas);
  };

  const addMadera = () => {
    const newId = `madera_${Date.now()}`;
    setMaderas([...maderas, { id: newId, nombre: 'Nueva Madera', tier: 'intermedia', src: '' }]);
  };

  const removeMadera = (id) => {
    setMaderas(maderas.filter(m => m.id !== id));
  };


  // --- RENDER ADMIN ---
  if (isAdmin) return (
    <div className={`min-h-screen bg-white text-[#333] p-6 font-sans`}>
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#E0D8C3]">
        <h2 className={`text-2xl font-bold ${THEME.accent} flex items-center gap-3 font-sans uppercase`}><Settings className="animate-spin-slow" /> Panel Admin</h2>
        <button onClick={() => { signOut(auth); setIsAdmin(false); signInAnonymously(auth); }} className="text-red-500 flex gap-2 hover:bg-red-50 p-2 rounded-xl transition-colors"><LogOut size={20} /> Salir</button>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['orders', 'prices', 'materiales', 'gallery'].map(tab => (
          <button key={tab} onClick={() => setAdminTab(tab)} className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider text-xs transition-all ${adminTab === tab ? `${THEME.primary} text-white shadow-lg` : 'bg-white border border-[#E0D8C3] text-[#666]'}`}>
            {tab === 'orders' ? 'Pedidos' : tab === 'prices' ? 'Precios' : tab === 'materiales' ? 'Materiales' : 'Galería'}
          </button>
        ))}
      </div>

      {adminTab === 'prices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {Object.entries(CATEGORIAS_COSTOS).map(([cat, keys]) => (
            <div key={cat} className={`bg-white p-6 rounded-xl border border-[#E0D8C3] shadow-sm`}>
              <h3 className={`${THEME.accent} font-bold uppercase text-sm mb-4 border-b border-[#F2E9D8] pb-2`}>{cat}</h3>
              <div className="space-y-4">
                {keys.map(k => (
                  <div key={k} className="flex justify-between items-center">
                    <label className="text-xs text-[#666] uppercase">{k.replace(/_/g, ' ')}</label>
                    <div className="relative w-40">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] text-sm">$</span>
                      <input type="text" value={new Intl.NumberFormat('es-AR').format(costos[k])} onChange={e => handleCostoChange(k, e.target.value)} className={`w-full bg-[#FAFAFA] rounded-lg p-2 pl-8 text-right text-base font-bold text-[#333] border border-[#E0D8C3] focus:border-[#5D4037] outline-none`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'materiales' && (
        <div className="space-y-6 pb-20">
          <div className={`bg-white p-6 rounded-xl space-y-6 border border-[#E0D8C3]`}>
            <div className="flex justify-between items-center mb-4 border-b border-[#F2E9D8] pb-4">
              <h3 className={`${THEME.accent} font-bold uppercase text-sm`}>Gestión de Maderas</h3>
              <button onClick={addMadera} className={`${THEME.primary} text-white p-2 rounded-lg flex items-center gap-2 px-4 font-bold text-xs`}><Plus size={16} /> AGREGAR</button>
            </div>
            {maderas.map((m, index) => (
              <div key={m.id} className="flex flex-col md:flex-row gap-4 items-center bg-[#FAFAFA] p-4 rounded-xl border border-[#E0D8C3]">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[#E0D8C3] flex items-center justify-center bg-white">
                  {m.src ? <img src={m.src} className="w-full h-full object-cover" /> : <ImageIcon className="text-[#999]" />}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  <input value={m.nombre} onChange={(e) => updateMadera(index, 'nombre', e.target.value)} placeholder="Nombre" className="bg-white p-2 rounded-lg border border-[#E0D8C3] text-sm text-[#333] focus:border-[#5D4037] outline-none" />
                  <select value={m.tier} onChange={(e) => updateMadera(index, 'tier', e.target.value)} className="bg-white p-2 rounded-lg border border-[#E0D8C3] text-sm text-[#333] focus:border-[#5D4037] outline-none appearance-none">
                    <option value="basica">Básica</option>
                    <option value="intermedia">Intermedia</option>
                    <option value="premium">Premium</option>
                  </select>
                  <input value={m.src} onChange={(e) => updateMadera(index, 'src', e.target.value)} placeholder="URL Foto" className="bg-white p-2 rounded-lg border border-[#E0D8C3] text-sm text-[#333] focus:border-[#5D4037] outline-none" />
                </div>
                <button onClick={() => removeMadera(m.id)} className="p-2 text-[#999] hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'gallery' && (
        <div className="space-y-6 pb-20">
          <div className={`bg-white p-6 rounded-xl space-y-4 border border-[#E0D8C3]`}>
            <h3 className={`${THEME.accent} font-bold uppercase text-sm`}>Agregar Nueva Foto</h3>
            <div className="flex gap-2">
              <input value={newImage.url} onChange={e => setNewImage({ ...newImage, url: e.target.value })} placeholder="URL de la imagen" className="flex-1 bg-[#FAFAFA] rounded-lg p-2 text-sm text-[#333] border border-[#E0D8C3] outline-none" />
              <input value={newImage.alt} onChange={e => setNewImage({ ...newImage, alt: e.target.value })} placeholder="Descripción" className="flex-1 bg-[#FAFAFA] rounded-lg p-2 text-sm text-[#333] border border-[#E0D8C3] outline-none" />
              <button onClick={addGalleryImage} className={`${THEME.primary} text-white p-2 rounded-lg`}><Plus /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galeria.map(img => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-[#E0D8C3]">
                <img src={img.src} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => removeGalleryImage(img.id)} className="bg-red-500 text-white p-2 rounded-full"><Trash2 size={16} /></button>
                </div>
                <span className="absolute bottom-0 left-0 right-0 bg-white/90 text-[#333] text-[10px] p-1 text-center truncate">{img.alt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {adminTab === 'orders' && <div className="text-[#999] text-center mt-20">No hay pedidos nuevos.</div>}

      {/* Global Save Button Admin */}
      <button onClick={() => alert("Cambios guardados")} className={`fixed bottom-6 right-6 ${THEME.primary} text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center z-50`}>
        <Save size={24} />
      </button>
    </div>
  );

  return (
    <>
      <GlobalStyles />
      <BackgroundAmbience />

      {/* Botón Flotante Carrito (MÁS ARRIBA) */}
      {paso > 0 && paso !== 4 && carrito.length > 0 && (
        <button onClick={() => setPaso(4)} className={`fixed bottom-24 right-6 ${THEME.primary} text-white p-3 md:p-4 rounded-full shadow-xl hover:scale-110 transition-all z-50 flex items-center justify-center border-2 border-white`}>
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-[#7A8D6F] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">{carrito.length}</span>
        </button>
      )}

      {/* AI MODAL */}
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

      {/* REVIEWS MODAL */}
      {showReviews && (
        <div className="fixed inset-0 z-50 bg-[#333]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviews(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E0D8C3] shadow-2xl overflow-hidden p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowReviews(false)} className="absolute top-4 right-4 text-[#999] hover:text-[#333]"><X size={24} /></button>
            <h3 className={`text-xl font-bold ${THEME.accent} mb-6 text-center uppercase tracking-widest font-sans`}>Reseñas de Clientes</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {TESTIMONIOS.map(t => (
                <div key={t.id} className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E0D8C3]">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold text-sm ${THEME.textMain}`}>{t.nombre}</span>
                    <div className="flex gap-0.5 text-[#C17A4A]">{[...Array(t.stars)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
                  </div>
                  <p className={`text-xs ${THEME.textMuted} italic leading-relaxed`}>"{t.texto}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* APP CONTAINER */}
      <div className={`min-h-screen font-sans ${THEME.textMain} pb-10 selection:bg-[#E0D8C3] selection:text-[#333]`}>

        {paso > 0 && <Header onBack={() => setPaso(paso === 5 ? 0 : paso === 3 ? (catSeleccionada?.destino === 'directo' ? 1 : 2) : (paso === 6 ? 0 : paso - 1))} title={getHeaderTitle()} onLogoClick={handleAdminLogin} showCart={false} cartCount={carrito.length} onCartClick={() => setPaso(4)} />}

        {/* HOME */}
        {paso === 0 && (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
            <div className="mb-12 text-center relative z-10 animate-float flex flex-col items-center">
              <img
                src={LOGO_SRC}
                alt="eBe Muebles Logo"
                onClick={handleAdminLogin}
                className="w-48 h-auto mb-6 drop-shadow-md cursor-pointer opacity-90 hover:scale-105 transition-transform"
              />
              <p className={`uppercase tracking-[0.3em] text-xs font-bold ${THEME.accent} mt-4`}>Carpintería de Autor</p>
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
              <button onClick={() => setShowAi(true)} className={`w-full py-4 rounded-xl border border-[#5D4037] flex items-center justify-center gap-2 hover:bg-[#5D4037]/5 transition-all text-[#5D4037]`}>
                <Sparkles size={18} /> <span className="text-xs font-bold uppercase tracking-wide">Asistente IA</span>
              </button>
            </div>
          </div>
        )}

        {/* CATEGORIAS (AJUSTE TAMAÑO CELULAR: grid-cols-3 para que entren en una linea o mas compactas) */}
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6">
                    {(MELAMINAS_OPCIONES[modalType] || []).map(m => (
                      <button key={m.id} onClick={() => { setConfig({ ...config, material: m.id }); setShowMaterialModal(false) }} className="group text-left">
                        <div className="aspect-video rounded-lg mb-3 shadow-sm group-hover:shadow-md transition-all border border-[#E0D8C3]" style={{ background: m.css }}></div>
                        <span className={`text-xs font-bold uppercase ${THEME.textMain} tracking-wide block`}>{m.nombre}</span>
                      </button>
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
                    <button onClick={() => { setModalType('color'); setShowMaterialModal(true) }} className="p-4 rounded-xl border border-[#E0D8C3] bg-transparent flex items-center justify-between hover:bg-[#F9F7F2] text-[#333]"><span className="font-bold text-xs md:text-sm">Colores Lisos</span> <ChevronRight size={16} className={THEME.textMuted} /></button>
                    <button onClick={() => { setModalType('texturado'); setShowMaterialModal(true) }} className="p-4 rounded-xl border border-[#E0D8C3] bg-transparent flex items-center justify-between hover:bg-[#F9F7F2] text-[#333]"><span className="font-bold text-xs md:text-sm">Maderas Texturadas</span> <ChevronRight size={16} className={THEME.textMuted} /></button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {materialesPosibles.map(m => {
                      const textureData = m.textura;
                      return (
                        <button key={m.id} onClick={() => setConfig({ ...config, material: m.id })} className={`relative h-24 rounded-xl overflow-hidden border transition-all group ${config.material === m.id ? `${THEME.accentBorder} ring-2 ring-[#5D4037] ring-offset-2 ring-offset-[#F2E9D8]` : 'border-[#E0D8C3] hover:opacity-100 opacity-90'}`}>
                          {textureData.type === 'img' ? (
                            <img src={textureData.src} className="absolute inset-0 w-full h-full object-cover" alt={m.nombre} />
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
                    {['sin_patas', 'madera', 'metal'].map(k => (<button key={k} onClick={() => setConfig({ ...config, tipoPatas: k })} className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${config.tipoPatas === k ? `${THEME.accentBg} text-white shadow-sm` : THEME.textMuted}`}>{k.replace('_', ' ')}</button>))}
                  </div>
                  {config.tipoPatas !== 'sin_patas' && (
                    <div className="grid grid-cols-3 gap-3">
                      {OPCIONES_PATAS[config.tipoPatas]?.map(p => {
                        const Icon = p.icon;
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
                        {/* Lógica para resaltar NATURAL */}
                        <span className={`text-center ${a.id === 'natural' ? 'text-xs md:text-sm font-black tracking-widest uppercase' : 'text-[10px] md:text-xs font-bold uppercase'}`}>{a.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(muebleSeleccionado?.id?.includes('puerta') || config.tipoConstruccion === 'chapa_inyectada') && (
                <button onClick={() => setConfig({ ...config, marco: !config.marco })} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${config.marco ? `${THEME.accentBg} text-white` : 'border-[#E0D8C3] bg-white text-[#666]'}`}><span className="text-xs font-bold uppercase">Incluir Marco {config.tipoConstruccion === 'chapa_inyectada' ? '(Metálico)' : ''}</span><div className={`w-6 h-6 rounded border flex items-center justify-center ${config.marco ? `bg-white/20 border-transparent text-white` : 'border-[#999]'}`}>{config.marco && <Check size={14} />}</div></button>
              )}
            </section>

            {/* Footer Precio (YA NO ES FIJO FLOTANTE, APARECE AL FINAL) */}
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
                  <div className={`w-20 h-20 rounded-lg bg-[#F9F7F2] flex items-center justify-center text-3xl border border-[#E0D8C3]`}>{item.mueble.imagen}</div>
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

                {/* Opciones de Entrega */}
                <div className="grid grid-cols-2 gap-3 bg-[#F9F7F2] p-1.5 rounded-xl border border-[#E0D8C3]">
                  <button onClick={() => setCliente({ ...cliente, entrega: 'taller' })} className={`py-3 rounded-lg text-xs font-bold uppercase flex flex-col items-center gap-1 transition-all ${cliente.entrega === 'taller' ? `${THEME.accentBg} text-white shadow-sm` : THEME.textMuted}`}>
                    <Store size={18} /> Retiro Taller
                  </button>
                  <button onClick={() => setCliente({ ...cliente, entrega: 'envio' })} className={`py-3 rounded-lg text-xs font-bold uppercase flex flex-col items-center gap-1 transition-all ${cliente.entrega === 'envio' ? `${THEME.accentBg} text-white shadow-sm` : THEME.textMuted}`}>
                    <Truck size={18} /> Envío Domicilio
                  </button>
                </div>

                {/* Google Maps Link si es retiro */}
                {cliente.entrega === 'taller' && (
                  <a href={DATOS_CONTACTO.maps_link} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 p-4 rounded-xl border border-[#E0D8C3] bg-white ${THEME.accent} hover:bg-[#F9F7F2] transition-all text-xs font-bold uppercase`}>
                    <Map size={16} /> Ver Ubicación Taller en Maps
                  </a>
                )}

                <input type="file" ref={fileInputRef} className="hidden" onChange={e => { if (e.target.files[0]) setCliente(p => ({ ...p, nombreArchivo: e.target.files[0].name })) }} />
                <button onClick={() => fileInputRef.current.click()} className={`w-full py-4 rounded-xl text-sm font-bold uppercase flex items-center justify-center gap-2 transition-all ${cliente.nombreArchivo ? 'bg-[#7A8D6F]/20 text-[#7A8D6F] border border-[#7A8D6F]/30' : `bg-[#F9F7F2] ${THEME.textMuted} border border-[#E0D8C3] hover:bg-white`}`}><Paperclip size={16} /> {cliente.nombreArchivo ? 'Archivo Adjunto OK' : 'Adjuntar Plano / Foto'}</button>
              </div>
            )}

            {/* Footer Carrito NO FLOTANTE (ESTÁTICO AL FINAL) */}
            {carrito.length > 0 && (
              <div className="mt-8 mb-24 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className={`text-xs ${THEME.textMuted} uppercase tracking-widest mb-1`}>Total Estimado</span>
                  <span className={`text-3xl md:text-4xl font-bold ${THEME.textMain} tracking-tight font-sans`}>${new Intl.NumberFormat('es-AR').format(carrito.reduce((a, b) => a + b.precio, 0))}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={generarPresupuestoPDF} className={`w-full py-4 rounded-xl font-bold uppercase text-[#8B5E3C] border border-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white transition-all flex items-center justify-center gap-2 text-xs md:text-sm`}>
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
            {/* Botón Estático para Reseñas */}
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl md:text-2xl font-bold ${THEME.textMain} uppercase tracking-widest font-sans`}>Nuestros Trabajos</h2>
              <button
                onClick={() => setShowReviews(true)}
                className={`px-4 py-2 bg-white border border-[#8B5E3C] text-[#8B5E3C] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#8B5E3C] hover:text-white transition-all shadow-sm flex items-center gap-2`}
              >
                <MessageCircle size={16} /> Reseñas
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
              {galeria.map(img => (
                <div key={img.id} onClick={() => setSelectedImage(img)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-md transition-all border border-[#E0D8C3]">
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold uppercase tracking-widest text-sm border-b border-white pb-1 font-sans">{img.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUIENES SOMOS */}
        {paso === 6 && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in text-center max-w-2xl mx-auto">
            <div className={`w-32 h-32 rounded-full bg-white border border-[#E0D8C3] flex items-center justify-center mb-8 shadow-sm`}>
              <Users size={56} className={THEME.accent} />
            </div>
            <h2 className={`text-4xl font-bold uppercase tracking-widest ${THEME.textMain} mb-8 font-sans`}>Sobre Nosotros</h2>

            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-[#E0D8C3] shadow-sm space-y-6 text-[#555] text-lg leading-relaxed font-light text-left">
              <p><strong className={THEME.textMain}>En EBE Muebles</strong> somos un equipo dedicado al diseño y fabricación de muebles a medida de alta calidad, combinando funcionalidad, estética y durabilidad en cada proyecto. Nacemos con una visión clara: crear piezas únicas que respondan a las necesidades reales de cada cliente, respetando los espacios, los estilos y el uso cotidiano.</p>
              <p>Nos especializamos en el desarrollo de muebles de madera maciza, hierro y combinaciones contemporáneas, trabajando con <span className={`${THEME.accent} font-medium`}>maderas reforestadas</span> provenientes de tala cuidada, seleccionadas por su resistencia, estabilidad y comportamiento a largo plazo.</p>
              <p>Cada mueble es diseñado y fabricado de manera personalizada, acompañando al cliente desde la idea inicial hasta la entrega final, brindando asesoramiento técnico y estético en todo el proceso.</p>
              <p>Contamos con <span className={`${THEME.accent} font-medium`}>fabricación propia</span>, lo que nos permite controlar cada etapa del proceso: diseño, selección de materiales, construcción, terminaciones e instalación.</p>
              <p className={`italic ${THEME.textMuted} text-center mt-4 border-t border-[#E0D8C3] pt-4`}>"Nuestro propósito es transformar ideas en piezas reales, creando muebles que acompañen la vida diaria y perduren en el tiempo."</p>
            </div>

            <button onClick={() => setPaso(5)} className={`mt-12 px-10 py-4 rounded-xl border border-[#8B5E3C] ${THEME.accent} text-sm font-bold uppercase hover:bg-[#8B5E3C] hover:text-white transition-colors flex items-center gap-2 mx-auto`}>Ver Galería de Trabajos <ChevronRight size={16} /></button>
          </div>
        )}

        {/* Modal Imagen Galeria */}
        {selectedImage && (
          <div className="fixed inset-0 z-[60] bg-[#333]/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button className="absolute left-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm z-50 shadow-lg" onClick={prevImage}><ChevronLeft size={32} /></button>
            <img src={selectedImage.src} className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
            <button className="absolute right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm z-50 shadow-lg" onClick={nextImage}><ChevronRight size={32} /></button>
            <button className="absolute top-4 right-4 text-white hover:text-red-500"><X size={32} /></button>
            <p className="absolute bottom-8 text-white font-bold tracking-widest uppercase bg-black/60 px-6 py-3 rounded-full backdrop-blur-md shadow-lg font-sans">{selectedImage.alt}</p>
          </div>
        )}

        {/* Modal Reseñas (Separado) */}
        {showReviews && (
          <div className="fixed inset-0 z-[60] bg-[#333]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviews(false)}>
            <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E0D8C3] shadow-2xl overflow-hidden p-6 relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowReviews(false)} className="absolute top-4 right-4 text-[#999] hover:text-[#333]"><X size={24} /></button>
              <h3 className={`text-xl font-bold ${THEME.accent} mb-6 text-center uppercase tracking-widest font-sans`}>Reseñas de Clientes</h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {TESTIMONIOS.map(t => (
                  <div key={t.id} className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E0D8C3]">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-bold text-sm ${THEME.textMain}`}>{t.nombre}</span>
                      <div className="flex gap-0.5 text-[#C17A4A]">{[...Array(t.stars)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
                    </div>
                    <p className={`text-xs ${THEME.textMuted} italic leading-relaxed`}>"{t.texto}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default App;