import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, updateDoc, writeBatch, getDocs, limit, increment, serverTimestamp
} from 'firebase/firestore';
import {
  Ruler, TreePine, Palette, Send, ShoppingCart, Plus, Trash2, Settings,
  ChevronRight, ChevronLeft, Image as ImageIcon, Sparkles, MessageSquare, BoxSelect,
  Armchair, Sun, CloudRain, Hammer, Monitor, Tv, Bed, Utensils, Archive,
  RectangleVertical, Box, LogOut, Save, Coins, ImagePlus, Lock, MapPin,
  User, Paperclip, X, Check, Table, DoorOpen, ArrowLeft, Truck, Store, Map, Users,
  Square, Triangle, Star, FileText, MessageCircle, Instagram, Upload,
  BarChart3, PieChart, Smartphone, Globe, Grid, RefreshCw, Phone, Mail, Navigation, Info, Edit, Link as LinkIcon, Eye, Bot, Download,
  LayoutDashboard, ListOrdered, ExternalLink
} from 'lucide-react';

// ==============================================================================
//  1. CONFIGURACIÓN Y DATOS
// ==============================================================================

// GEMINI API CONFIG
const apiKey = "AIzaSyABrPRcFOGlwh1oX8BhTljlfaJDpFuKFjw";

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
const APP_ID_FIRESTORE = typeof __app_id !== 'undefined' ? __app_id : 'ebe-muebles-prod-v9-final';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UTILIDADES ---
const getDirectDriveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url;
  if (!url.includes('drive.google.com')) return url;
  let idMatch = url.match(/\/file\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/) || url.match(/\/d\/(.*?)\//);
  if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  return url;
};

// --- TEMA PREMIUM ---
const THEME = {
  bg: "bg-[#EAE2D6]",
  card: "bg-white border border-[#D6C4B0] shadow-sm",
  cardHover: "hover:border-[#5D4037] hover:shadow-lg transition-all duration-300 ease-out",
  accent: "text-[#8B5E3C]",
  accentBg: "bg-[#8B5E3C]",
  accentBorder: "border-[#8B5E3C]",
  primary: "bg-[#5D4037]",
  primaryText: "text-[#5D4037]",
  primaryHover: "hover:bg-[#3E2723]",
  secondary: "bg-[#7A8D6F]",
  secondaryText: "text-[#7A8D6F]",
  textMain: "text-[#2C241F]",
  textMuted: "text-[#6B5A4E]",
  input: "bg-white border border-[#D6C4B0] focus:border-[#5D4037] outline-none transition-all font-sans text-[#2C241F] placeholder-[#999] rounded-lg"
};

// --- DATOS ESTÁTICOS ---
const DEFAULT_LOGO_SRC = "https://cdn-icons-png.flaticon.com/512/3030/3030336.png";
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/_u/ebe.muebles/";
const ADMIN_EMAILS = ['emabelaver@gmail.com', 'acevedo.gestoriadelautomotor@gmail.com'];

const DATOS_CONTACTO = {
  telefono_whatsapp: "5493547531519",
  nombre_negocio: "eBe Muebles",
  maps_link: "https://maps.app.goo.gl/yXy8vciXoR11Z4L8A",
  ubicacion_texto: "Alta Gracia, Córdoba"
};

// DEFAULTS COMPACTOS
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
  { id: 'kiri', nombre: 'Kiri', tier: 'basica', src: "https://i.postimg.cc/zvnLjGQ1/Kiri-textura.png" },
  { id: 'paraiso', nombre: 'Paraíso', tier: 'basica', src: "https://i.postimg.cc/J0wDZkpm/Paraiso-textura.png" },
  { id: 'zoita', nombre: 'Zoita', tier: 'intermedia', src: "https://i.postimg.cc/8chFHzYP/Zoita-textura.png" },
  { id: 'cedro', nombre: 'Cedro', tier: 'intermedia', src: "https://i.postimg.cc/MZRjx9pD/Cedro-textura.png" },
  { id: 'guayubira', nombre: 'Guayubira', tier: 'intermedia', src: "https://i.postimg.cc/1XpgH3d1/Guayubira-textura.png" },
  { id: 'laurel', nombre: 'Laurel', tier: 'intermedia', src: "https://i.postimg.cc/tJh154cy/Laurel-textura.png" },
  { id: 'petiribi', nombre: 'Petiribí', tier: 'premium', src: "https://i.postimg.cc/SQ8zqgxf/Petiribi-textura.png" },
];

const DEFAULT_MELAMINAS_DB = [
  // Línea Lisos
  { id: 'm_ceniza', nombre: 'Ceniza', css: '#BDBDBD', category: 'lisos' },
  { id: 'm_grafito', nombre: 'Grafito', css: '#37474F', category: 'lisos' },
  { id: 'm_negro_profundo', nombre: 'Negro Profundo', css: '#101010', category: 'lisos' },
  { id: 'm_gris_humo', nombre: 'Gris Humo', css: '#9E9E9E', category: 'lisos' },
  { id: 'm_almendra', nombre: 'Almendra', css: '#E6DCC3', category: 'lisos' },
  { id: 'm_aluminio', nombre: 'Aluminio', css: '#A0A0A0', category: 'lisos' },
  { id: 'm_litio', nombre: 'Litio', css: '#8D867D', category: 'lisos' },
  { id: 'm_blanco', nombre: 'Blanco', css: '#FFFFFF', category: 'lisos' },
  { id: 'm_blanco_tundra', nombre: 'Blanco Tundra', css: '#F0F0F0', category: 'lisos' },
  // Línea Nature
  { id: 'm_caju', nombre: 'Cajú', css: 'linear-gradient(90deg, #B8A47E, #A6936E)', category: 'nature' },
  { id: 'm_gaudi', nombre: 'Gaudí', css: 'linear-gradient(90deg, #5D4B3F, #4A3A30)', category: 'nature' },
  { id: 'm_mont_blanc', nombre: 'Mont Blanc', css: 'linear-gradient(90deg, #D4CFC9, #C4BFB9)', category: 'nature' },
  { id: 'm_teka_artico', nombre: 'Teka Ártico', css: 'linear-gradient(90deg, #E0E0E0, #D0D0D0)', category: 'nature' },
  { id: 'm_venezia', nombre: 'Venezia', css: 'linear-gradient(90deg, #D7D7D7, #C7C7C7)', category: 'nature' },
  { id: 'm_nogal_terracota', nombre: 'Nogal Terracota', css: 'linear-gradient(90deg, #8B6B40, #7A5A30)', category: 'nature' },
  { id: 'm_carvalho_mezzo', nombre: 'Carvalho Mezzo', css: 'linear-gradient(90deg, #7A6553, #6A5543)', category: 'nature' },
  { id: 'm_nocce_milano', nombre: 'Nocce Milano', css: 'linear-gradient(90deg, #5C4033, #4C3023)', category: 'nature' },
  { id: 'm_blanco_nature', nombre: 'Blanco Nature', css: 'linear-gradient(90deg, #F5F5F5, #E5E5E5)', category: 'nature' },
  // Línea Mesopotamia
  { id: 'm_petiribi_meso', nombre: 'Petiribí', css: 'linear-gradient(90deg, #8A6F45, #7A5F35)', category: 'mesopotamia' },
  { id: 'm_yute', nombre: 'Yute', css: 'repeating-linear-gradient(45deg, #948C78, #948C78 2px, #847C68 2px, #847C68 4px)', category: 'mesopotamia' },
  { id: 'm_terracota', nombre: 'Terracota', css: '#6E4D3A', category: 'mesopotamia' },
  { id: 'm_gris_caliza', nombre: 'Gris Caliza', css: '#9E9E9E', category: 'mesopotamia' },
  { id: 'm_gris_basalto', nombre: 'Gris Basalto', css: '#757575', category: 'mesopotamia' },
  { id: 'm_gris_tapir', nombre: 'Gris Tapir', css: '#8D8D8D', category: 'mesopotamia' },
  { id: 'm_amatista', nombre: 'Amatista', css: '#9C8AA5', category: 'mesopotamia' },
  { id: 'm_jade', nombre: 'Jade', css: '#7A8B7D', category: 'mesopotamia' },
  { id: 'm_kiri_meso', nombre: 'Kiri', css: 'linear-gradient(90deg, #DCCBB2, #CCCBA2)', category: 'mesopotamia' },
  { id: 'm_paraiso_meso', nombre: 'Paraíso', css: 'linear-gradient(90deg, #C29F76, #B28F66)', category: 'mesopotamia' },
  // Línea Étnica
  { id: 'm_tribal', nombre: 'Tribal', css: '#6D605B', category: 'etnica' },
  { id: 'm_sahara', nombre: 'Sahara', css: '#A3927F', category: 'etnica' },
  { id: 'm_tuareg', nombre: 'Tuareg', css: '#1A242E', category: 'etnica' },
  { id: 'm_himalaya', nombre: 'Himalaya', css: '#B09A8B', category: 'etnica' },
  { id: 'm_safari', nombre: 'Safari', css: '#4B533E', category: 'etnica' },
  { id: 'm_everest', nombre: 'Everest', css: '#D1D5D2', category: 'etnica' },
  // Línea Hilados
  { id: 'm_seda_giorno', nombre: 'Seda Giorno', css: 'repeating-linear-gradient(45deg, #B0AB9F, #B0AB9F 2px, #A09B8F 2px, #A09B8F 4px)', category: 'hilados' },
  { id: 'm_seda_notte', nombre: 'Seda Notte', css: 'repeating-linear-gradient(45deg, #7A726A, #7A726A 2px, #6A625A 2px, #6A625A 4px)', category: 'hilados' },
  { id: 'm_seda_azzurra', nombre: 'Seda Azzurra', css: 'repeating-linear-gradient(45deg, #1B2E45, #1B2E45 2px, #0B1E35 2px, #0B1E35 4px)', category: 'hilados' },
  { id: 'm_lino_chiaro', nombre: 'Lino Chiaro', css: 'repeating-linear-gradient(45deg, #CFCBC5, #CFCBC5 2px, #BFBBB5 2px, #BFBBB5 4px)', category: 'hilados' },
  { id: 'm_lino_blanco', nombre: 'Lino Blanco', css: 'repeating-linear-gradient(45deg, #EAEAEA, #EAEAEA 2px, #DADADA 2px, #DADADA 4px)', category: 'hilados' },
  { id: 'm_lino_terra', nombre: 'Lino Terra', css: 'repeating-linear-gradient(45deg, #5E544A, #5E544A 2px, #4E443A 2px, #4E443A 4px)', category: 'hilados' },
  { id: 'm_lino_negro', nombre: 'Lino Negro', css: 'repeating-linear-gradient(45deg, #1C1C1C, #1C1C1C 2px, #0C0C0C 2px, #0C0C0C 4px)', category: 'hilados' },
  // Línea Urban Concept
  { id: 'm_coliseo', nombre: 'Coliseo', css: 'linear-gradient(135deg, #6E665F, #5E564F)', category: 'urban' },
  { id: 'm_amberes', nombre: 'Amberes', css: 'linear-gradient(135deg, #2C2E33, #1C1E23)', category: 'urban' },
  { id: 'm_viena', nombre: 'Viena', css: 'linear-gradient(135deg, #9E9E93, #8E8E83)', category: 'urban' },
  { id: 'm_moscu', nombre: 'Moscú', css: 'linear-gradient(135deg, #4A3F39, #3A2F29)', category: 'urban' },
  { id: 'm_praga', nombre: 'Praga', css: 'linear-gradient(90deg, #9C8C7C, #8C7C6C)', category: 'urban' },
  { id: 'm_street', nombre: 'Street', css: 'linear-gradient(135deg, #8C837B, #7C736B)', category: 'urban' },
  { id: 'm_home', nombre: 'Home', css: 'linear-gradient(135deg, #A8A49E, #98948E)', category: 'urban' },
  // Línea Nórdica
  { id: 'm_helsinki', nombre: 'Helsinki', css: 'linear-gradient(90deg, #D7CFC4, #C9BEB0)', category: 'nordica' },
  { id: 'm_baltico', nombre: 'Báltico', css: 'linear-gradient(90deg, #8C8479, #756D63)', category: 'nordica' },
  { id: 'm_olmo_finlandes', nombre: 'Olmo Finlandés', css: 'linear-gradient(90deg, #C19A6B, #A67C52)', category: 'nordica' },
  { id: 'm_roble_escandinavo', nombre: 'Roble Escandinavo', css: 'linear-gradient(90deg, #C2B299, #AFA089)', category: 'nordica' },
  { id: 'm_teka_oslo', nombre: 'Teka Oslo', css: 'linear-gradient(90deg, #594132, #493122)', category: 'nordica' },
];

const CATEGORIAS_MELAMINA = [
  { id: 'lisos', label: 'Línea Lisos' },
  { id: 'nature', label: 'Línea Nature' },
  { id: 'nordica', label: 'Línea Nórdica' },
  { id: 'mesopotamia', label: 'Línea Mesopotamia' },
  { id: 'etnica', label: 'Línea Étnica' },
  { id: 'hilados', label: 'Línea Hilados' },
  { id: 'urban', label: 'Línea Urban Concept' }
];

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
//  2. COMPONENTES VISUALES (OPTIMIZADOS)
// ==============================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap');
    
    body { font-family: 'Inter', sans-serif; background-color: #F5F2EB; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Montserrat', sans-serif; }
      
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #E8DCCA; }
    ::-webkit-scrollbar-thumb { background: #8B5E3C; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #5D4037; }
    
    /* Animación de carga para el asistente */
    .gemini-gradient { background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 50%, #DB2777 100%); }
  `}</style>
);

const BackgroundAmbience = React.memo(() => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#E8DCCA] pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
    <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}></div>
  </div>
));

const Header = React.memo(({ onBack, title, onLogoClick, showCart, cartCount, onCartClick, logoUrl }) => (
  <header className="sticky top-0 z-20 backdrop-blur-md bg-[#F5F2EB]/95 border-b border-[#D6C4B0] py-4 px-4 flex justify-between items-center transition-all shadow-sm">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} aria-label="Volver" className={`p-2.5 rounded-full hover:bg-white/50 ${THEME.textMain} transition-colors active:scale-95`}>
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className={`text-lg md:text-xl font-bold tracking-tight ${THEME.textMain} truncate max-w-[200px] md:max-w-none font-sans uppercase`}>{title}</h1>
    </div>
    <div className="flex items-center gap-4">
      {showCart && (
        <button onClick={onCartClick} aria-label="Carrito" className={`relative p-2 ${THEME.textMain} hover:${THEME.accent} transition-colors`}>
          <ShoppingCart size={28} />
          {cartCount > 0 && <span className={`absolute -top-1 -right-1 w-4 h-4 ${THEME.primary} text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm animate-bounce`}>{cartCount}</span>}
        </button>
      )}
      <div onClick={onLogoClick} className="cursor-pointer flex items-center gap-2 group">
        <img
          src={getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC}
          alt="eBe Logo"
          referrerPolicy="no-referrer"
          className="h-9 w-auto opacity-90 group-hover:opacity-100 transition-opacity object-contain drop-shadow-sm"
        />
      </div>
    </div>
  </header>
));

const IconRenderer = React.memo(({ name, size = 24, className }) => {
  const icons = { Table, DoorOpen, Armchair, RectangleVertical, Box, Monitor, Utensils, Archive, Bed, Tv };
  const IconComponent = icons[name] || Box;
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
});

const InputMedida = React.memo(({ label, val, onChange }) => (
  <div className="flex flex-col items-center group w-full">
    <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${THEME.textMuted}`}>{label}</label>
    <input
      type="number" value={val} onChange={e => onChange(e.target.value)} onFocus={e => e.target.select()}
      className={`w-full ${THEME.input} text-center text-lg md:text-xl font-medium py-4 rounded-xl shadow-sm hover:border-[#5D4037] hover:shadow-md transition-all duration-300`}
    />
  </div>
));

const getMaterialVisual = (config, maderas, melaminas) => {
  if (config.tipoConstruccion === 'chapa_inyectada') {
    const color = COLORES_CHAPA.find(c => c.id === config.chapa_color);
    return { type: 'css', value: color ? color.css : '#000' };
  }
  if (config.tipoConstruccion === 'puerta_placa') {
    return { type: 'img', value: maderas[0]?.src || '' };
  }
  if (config.material && config.material.startsWith('m_')) {
    const melamina = melaminas.find(m => m.id === config.material);
    return { type: 'css', value: melamina ? melamina.css : '#fff' };
  }
  const madera = maderas.find(m => m.id === config.material);
  return { type: 'img', value: madera ? madera.src : '' };
};

// ==============================================================================
//  3. APP PRINCIPAL
// ==============================================================================

const App = () => {
  const [paso, setPaso] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  // DATOS PERSISTENTES
  const [costos, setCostos] = useState(DEFAULT_COSTOS);
  const [galeria, setGaleria] = useState(DEFAULT_GALERIA);
  const [maderas, setMaderas] = useState(DEFAULT_MADERAS);
  const [melaminas, setMelaminas] = useState(DEFAULT_MELAMINAS_DB);
  const [testimonios, setTestimonios] = useState(DEFAULT_TESTIMONIOS);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_SRC);
  const [instagramUrl, setInstagramUrl] = useState(DEFAULT_INSTAGRAM_URL);
  const [aboutUsImageUrl, setAboutUsImageUrl] = useState('');
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

  // Analytics State
  const [visitStats, setVisitStats] = useState({ mobile: 0, desktop: 0 });

  const [ordersList, setOrdersList] = useState([]);
  const [carrito, setCarrito] = useState([]);

  // Admin Inputs
  const [newImage, setNewImage] = useState({ url: '', alt: '' });
  const [adminLogoInput, setAdminLogoInput] = useState('');
  const [adminInstagramInput, setAdminInstagramInput] = useState('');
  const [adminAboutUsImageInput, setAdminAboutUsImageInput] = useState('');
  const [newMelamina, setNewMelamina] = useState({ nombre: '', css: '#ffffff', category: 'lisos', isGradient: false });
  const [newMaterial, setNewMaterial] = useState({ nombre: '', tier: 'basica', src: '' });
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [editMaterialData, setEditMaterialData] = useState({});


  // Flow State
  const [catSeleccionada, setCatSeleccionada] = useState(null);
  const [muebleSeleccionado, setMuebleSeleccionado] = useState(null);

  // Config State
  const [config, setConfig] = useState({
    ancho: 160, largo: 80, profundidad: 40, cantidad: 1,
    material: 'eucalipto', acabado: 'natural', tipoPatas: 'sin_patas', modeloPatas: 'ninguna',
    marco: false, cantCajones: 0, cantPuertas: 0, uso: 'interior', tipoConstruccion: 'maciza',
    chapa_color: 'negro', chapa_acabado: 'satinado', tvSize: ''
  });

  const [cliente, setCliente] = useState({ nombre: '', lugar: '', nombreArchivo: null, entrega: 'envio', telefono: '' });
  const [precioItemActual, setPrecioItemActual] = useState(0);
  const [espesorVisual, setEspesorVisual] = useState('');
  const [materialesPosibles, setMaterialesPosibles] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const isMDF = config.tipoConstruccion === 'placa';
  const fileInputRef = useRef(null);

  // Responsive Check
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- PRELOADER IMÁGENES ---
  useEffect(() => {
    const preloadImages = () => {
      maderas.forEach((madera) => {
        const img = new Image();
        img.src = getDirectDriveUrl(madera.src);
      });
    };
    if (maderas.length > 0) preloadImages();
  }, [maderas]);

  // --- PDF LIB LOADER ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => setPdfLibLoaded(true);
    document.body.appendChild(script);
  }, []);

  const getHeaderTitle = useCallback(() => {
    if (paso === 5) return "Galería";
    if (paso === 4) return "Tu Pedido";
    if (paso === 6) return "Nosotros";
    if (paso === 7) return "Contacto";
    if (paso === 3 && muebleSeleccionado) return muebleSeleccionado.nombre;
    if (paso === 2 && catSeleccionada) return catSeleccionada.label;
    if (paso === 1) return "Categorías";
    return "EBE MUEBLES";
  }, [paso, muebleSeleccionado, catSeleccionada]);

  const melaminasGrouped = useMemo(() => {
    const grouped = {};
    melaminas.forEach(m => {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push(m);
    });
    return grouped;
  }, [melaminas]);

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

  // ANALYTICS
  useEffect(() => {
    if (!user) return;
    const trackVisit = async () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      try {
        const statsRef = doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'stats', 'visits');
        await setDoc(statsRef, {
          [isMobileDevice ? 'mobile' : 'desktop']: increment(1)
        }, { merge: true });
      } catch (e) { console.warn("Analytics error", e); }
    };
    if (!sessionStorage.getItem('visited')) {
      trackVisit();
      sessionStorage.setItem('visited', 'true');
    }
  }, [user]);

  // CARGAR DATOS FIRESTORE
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
      } catch (e) { console.error("Error conf", e); }
    };
    loadSettings();

    const unsubGaleria = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'gallery'), orderBy('createdAt', 'desc')),
      (snap) => { if (!snap.empty) setGaleria(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
      (error) => { console.warn("Galeria fallback", error); setGaleria(DEFAULT_GALERIA); }
    );

    const unsubMaderas = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials'), orderBy('nombre')),
      (snap) => { if (!snap.empty) setMaderas(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
      (error) => { console.warn("Maderas fallback", error); setMaderas(DEFAULT_MADERAS); }
    );

    const unsubMelaminas = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'melamines'), orderBy('nombre')),
      (snap) => { if (!snap.empty) setMelaminas(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
      (error) => { console.warn("Melaminas fallback", error); setMelaminas(DEFAULT_MELAMINAS_DB); }
    );

    const unsubCostos = onSnapshot(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'costos'),
      (snap) => { if (snap.exists()) setCostos(snap.data()); }
    );

    const unsubStats = onSnapshot(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'stats', 'visits'), (snap) => {
      if (snap.exists()) setVisitStats(snap.data());
    });

    let unsubOrders = () => { };
    if (isAdmin) {
      unsubOrders = onSnapshot(query(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'orders'), orderBy('createdAt', 'desc')),
        (snap) => { setOrdersList(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }
      );
    }

    return () => { unsubGaleria(); unsubMaderas(); unsubMelaminas(); unsubCostos(); unsubOrders(); unsubStats(); };
  }, [user, isAdmin]);

  // --- ADMIN ACTIONS ---
  const handleAdminLogin = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (ADMIN_EMAILS.includes(result.user.email)) setIsAdmin(true);
      else { alert("No tienes permisos de administrador."); await signOut(auth); await signInAnonymously(auth); }
    } catch (e) { alert("Error Auth: " + e.message); }
  }, []);

  const handleSaveSettings = useCallback(async () => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'general'), {
        logoUrl: getDirectDriveUrl(adminLogoInput) || DEFAULT_LOGO_SRC,
        instagramUrl: adminInstagramInput || DEFAULT_INSTAGRAM_URL,
        aboutUsImageUrl: getDirectDriveUrl(adminAboutUsImageInput)
      }, { merge: true });
      alert("Configuración guardada correctamente.");
    } catch (e) { alert("Error al guardar: " + e.message); }
  }, [isAdmin, adminLogoInput, adminInstagramInput, adminAboutUsImageInput]);

  const addGalleryImage = useCallback(async () => {
    if (newImage.url && isAdmin) {
      try {
        await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'gallery'), {
          src: getDirectDriveUrl(newImage.url), alt: newImage.alt || 'Nuevo Trabajo', createdAt: Date.now()
        });
        setNewImage({ url: '', alt: '' });
      } catch (e) { alert("Error: " + e.message); }
    }
  }, [isAdmin, newImage]);

  const removeGalleryImage = useCallback(async (id) => { if (isAdmin && typeof id === 'string') await deleteDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'gallery', id)); }, [isAdmin]);

  const startEditMaterial = (m) => {
    setEditMaterialId(m.id);
    setEditMaterialData({ ...m });
  };

  const saveMaterial = async () => {
    if (!isAdmin || !editMaterialId) return;
    try {
      await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials', editMaterialId), editMaterialData, { merge: true });
      setEditMaterialId(null);
    } catch (e) { console.error(e); alert("Error al guardar material"); }
  };

  const addMaterial = async () => {
    if (!isAdmin) return;
    if (!newMaterial.nombre) return alert("Falta nombre");
    try {
      await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials'), {
        ...newMaterial,
        id: `mat_${Date.now()}`,
        createdAt: Date.now()
      });
      setNewMaterial({ nombre: '', tier: 'basica', src: '' });
    } catch (e) { console.error(e); }
  };

  const uploadDefaultMaterials = async () => {
    if (!isAdmin) return;
    if (!confirm("Esto cargará todas las maderas por defecto a la base de datos. ¿Deseas continuar?")) return;

    try {
      const batch = writeBatch(db);
      DEFAULT_MADERAS.forEach((m) => {
        const ref = doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials', m.id || `def_mat_${Math.random()}`);
        batch.set(ref, { ...m, createdAt: serverTimestamp() });
      });
      await batch.commit();
      alert("¡Maderas cargadas exitosamente! Ahora se verán en la web.");
    } catch (e) {
      console.error("Error cargando defaults:", e);
      alert("Hubo un error al cargar las maderas.");
    }
  };

  const deleteMaterial = async (id) => { if (isAdmin) await deleteDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'materials', id)); }

  const addMelamina = async () => {
    if (!isAdmin) return;
    if (!newMelamina.nombre) return alert("Falta nombre");
    try {
      await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'melamines'), {
        ...newMelamina,
        id: `m_${Date.now()}`,
        createdAt: Date.now()
      });
      setNewMelamina({ nombre: '', css: '#ffffff', category: 'lisos', isGradient: false });
    } catch (e) { console.error(e); }
  };

  const deleteMelamina = async (id) => { if (isAdmin) await deleteDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'melamines', id)); }

  const uploadDefaultMelamines = async () => {
    if (!isAdmin) return;
    if (!confirm("Esto cargará todas las melaminas por defecto a la base de datos de la web. ¿Deseas continuar?")) return;

    try {
      const batch = writeBatch(db);
      DEFAULT_MELAMINAS_DB.forEach((melamina) => {
        const ref = doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'melamines', melamina.id);
        batch.set(ref, { ...melamina, createdAt: serverTimestamp() });
      });
      await batch.commit();
      alert("¡Todas las materialidades han sido cargadas exitosamente!");
    } catch (e) {
      console.error("Error cargando defaults:", e);
      alert("Hubo un error al cargar las materialidades.");
    }
  };

  // Helper para obtener label de patas
  const getPatasLabel = (tipo, modelo) => {
    if (!tipo || tipo === 'sin_patas') return '';
    const group = OPCIONES_PATAS[tipo];
    if (!group) return '';
    const leg = group.find(p => p.id === modelo);
    return leg ? `${leg.nombre} (${tipo === 'metal' ? 'Metal' : 'Madera'})` : '';
  };

  const handleCostoChange = (key, val) => {
    const num = parseInt(val.replace(/\./g, '')) || 0;
    setCostos(prev => ({ ...prev, [key]: num }));
  };

  const saveCostos = useCallback(async () => {
    if (!isAdmin) return;
    await setDoc(doc(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'settings', 'costos'), costos);
    alert("Costos actualizados y guardados en la nube.");
  }, [isAdmin, costos]);

  // --- LÓGICA DE NEGOCIO ---
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

  useEffect(() => {
    if (paso === 3) {
      if (muebleSeleccionado?.id === 'mesa_custom' && config.uso === 'exterior') {
        if (config.tipoConstruccion === 'placa') setConfig(p => ({ ...p, tipoConstruccion: 'maciza' }));
        if (config.tipoPatas === 'madera') setConfig(p => ({ ...p, tipoPatas: 'metal' }));
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
        mats = []; // Se maneja via Modal
        esp = "18mm";
        if (muebleSeleccionado?.id?.includes('mesa')) esp = "36mm (Regruesado)";
        if (!melaminas.find(m => m.id === config.material)) setConfig(prev => ({ ...prev, material: 'm_blanco' }));
      } else if (config.tipoConstruccion === 'puerta_placa') {
        mats = [MATERIAL_PUERTA_PLACA]; esp = "Std"; setConfig(prev => ({ ...prev, material: MATERIAL_PUERTA_PLACA.id }));
      } else if (config.tipoConstruccion === 'chapa_inyectada') {
        mats = [MATERIAL_PUERTA_CHAPA]; esp = "3\""; setConfig(prev => ({ ...prev, material: MATERIAL_PUERTA_CHAPA.id }));
      }
      setMaterialesPosibles(mats);
      setEspesorVisual(esp);
    }
  }, [config.tipoConstruccion, config.uso, config.tipoPatas, config.marco, paso, costos, maderas, melaminas]);

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

  const agregarCarrito = useCallback(() => {
    let mName = config.material;
    if (config.tipoConstruccion === 'chapa_inyectada') {
      mName = `Chapa ${config.chapa_color} (${config.chapa_acabado})`;
    } else if (config.tipoConstruccion === 'puerta_placa') {
      mName = 'Puerta Placa';
    } else {
      const found = melaminas.find(m => m.id === config.material);
      if (found) mName = found.nombre;
      else {
        const matConfig = maderas.find(m => m.id === config.material);
        mName = matConfig ? matConfig.nombre : config.material.charAt(0).toUpperCase() + config.material.slice(1);
      }
    }
    setCarrito(prev => [...prev, { id: Date.now(), mueble: muebleSeleccionado, config: { ...config, materialNombre: mName }, precio: precioItemActual }]);
    setPaso(1); setCatSeleccionada(null);
  }, [config, muebleSeleccionado, melaminas, maderas, precioItemActual]);

  const handleAi = useCallback(async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse('');

    const contextText = `
      Eres el Asistente Virtual de eBe Muebles, una carpintería de autor en Alta Gracia, Córdoba.
      Tu tono es profesional, cálido y experto en diseño. Responde SOLO basándote en los siguientes productos y servicios que ofrecemos.

      NUESTROS PRODUCTOS:
      ${LISTA_MUEBLES_GRAL.map(m => `- ${m.nombre}`).join('\n')}
      - Mesas a Medida (Maciza, Melamina, Herrería)
      - Puertas a Medida (Maciza, Chapa Inyectada, Placa)

      MATERIALES MADERA MACIZA:
      ${maderas.map(m => `- ${m.nombre} (${m.tier})`).join('\n')}

      MATERIALES MELAMINA (Colores y Texturas):
      ${melaminas.map(m => `- ${m.nombre} (Línea ${m.category})`).join('\n')}

      SERVICIOS:
      - Fabricación a medida.
      - Envíos a domicilio y retiro en taller.
      - Asesoramiento personalizado.

      SI EL USUARIO PREGUNTA POR ALGO QUE NO ESTÁ EN ESTA LISTA, responde amablemente que por el momento no trabajamos ese producto, pero que podemos asesorarlo con nuestros muebles a medida.
      Intenta que tus respuestas sean breves y orientadas a la venta.
    `;

    try {
      // Usamos el modelo gemini-1.5-flash que es el estándar actual para API Keys gratuitas
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: contextText + "\n\nUsuario: " + aiQuery }] }] })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        setAiResponse(data.candidates[0].content.parts[0].text);
      } else {
        setAiResponse("Lo siento, hubo un problema al conectar con el asistente. Por favor intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error AI:", error);
      setAiResponse("Hubo un error de conexión. Verifica tu internet o intenta más tarde.");
    } finally {
      setAiLoading(false);
      setAiQuery('');
    }
  }, [aiQuery, maderas, melaminas]);

  // --- FUNCIÓN DE DESCARGA PDF AUTOMÁTICA ---
  const downloadPDF = () => {
    if (!pdfLibLoaded) return alert("Cargando generador de PDF, intenta en unos segundos...");

    const element = document.createElement('div');
    // HTML del PDF oculto - DISEÑO FACTURA PROFESIONAL A4 EXACTO
    const total = carrito.reduce((a, b) => a + b.precio, 0);
    const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const idPresupuesto = Math.floor(1000 + Math.random() * 9000);

    const itemsHtml = carrito.map(item => {
      // Buscar imagen del material
      const visual = getMaterialVisual(item.config, maderas, melaminas);
      let visualHtml = '';
      if (visual.type === 'img' && visual.value) {
        // Imagen real de la textura
        visualHtml = `<img src="${getDirectDriveUrl(visual.value)}" style="width:40px;height:40px;border-radius:4px;object-fit:cover;border:1px solid #ddd;display:block;margin-right:15px;">`;
      } else if (visual.type === 'css') {
        visualHtml = `<span style="display:block;width:40px;height:40px;border-radius:4px;background:${visual.value};margin-right:15px;border:1px solid #ddd;"></span>`;
      }

      let acabadoLabel = '';
      if (item.config.acabado) {
        if (item.config.acabado === 'natural') acabadoLabel = 'Natural';
        else if (item.config.acabado === 'cetol') acabadoLabel = 'Impregnante (Cetol)';
        else if (item.config.acabado === 'laca') acabadoLabel = 'Laca Poliuretánica';
        else acabadoLabel = item.config.acabado;
      }

      const patasLabel = getPatasLabel(item.config.tipoPatas, item.config.modeloPatas);

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 15px 10px; vertical-align: middle;">
             <div style="display:flex; align-items: center;">
                ${visualHtml}
                <div>
                    <strong style="font-size: 13px; display:block; margin-bottom: 2px; text-transform: uppercase;">${item.mueble.nombre}</strong>
                    <span style="font-size:11px;color:#666">${item.config.materialNombre}</span>
                </div>
             </div>
          </td>
          <td style="padding: 15px 10px; vertical-align: middle; color: #444; font-size: 12px;">
             ${item.config.ancho}x${item.config.largo}cm 
             ${item.config.cantCajones > 0 ? `<br/>• ${item.config.cantCajones} Cajones` : ''} 
             ${acabadoLabel ? `<br/>• Terminación: ${acabadoLabel}` : ''}
             ${patasLabel ? `<br/>• Patas: ${patasLabel}` : ''}
          </td>
          <td style="padding: 15px 10px; text-align:right; vertical-align: middle; font-weight: bold; font-size: 13px;">$${new Intl.NumberFormat('es-AR').format(item.precio)}</td>
        </tr>`;
    }).join('');

    element.innerHTML = `
      <div style="width: 210mm; min-height: 297mm; padding: 15mm; box-sizing: border-box; font-family: 'Helvetica', sans-serif; color: #333; background: white; position: relative;">
        
        <!-- MARCA DE AGUA -->
        <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(93, 64, 55, 0.04); font-weight: 900; z-index: 0; white-space: nowrap; pointer-events: none;">EBE MUEBLES</div>

        <!-- CABECERA -->
        <div style="display:flex; justify-content:space-between; align-items: flex-start; border-bottom: 4px solid #5D4037; padding-bottom: 20px; margin-bottom: 30px;">
           <div style="display: flex; flex-direction: column;">
               <img src="${getDirectDriveUrl(logoUrl) || DEFAULT_LOGO_SRC}" style="height:70px; object-fit: contain; margin-bottom: 10px;" />
               <div style="font-size: 11px; color: #555; line-height: 1.4;">
                  <strong>${DATOS_CONTACTO.nombre_negocio}</strong><br/>
                  ${DATOS_CONTACTO.ubicacion_texto}<br/>
                  Tel: +${DATOS_CONTACTO.telefono_whatsapp}<br/>
                  Instagram: @ebe.muebles
               </div>
           </div>
           <div style="text-align:right;">
             <h1 style="margin:0; font-size:32px; color:#5D4037; text-transform:uppercase; font-weight: 800; letter-spacing: -1px;">Presupuesto</h1>
             <p style="margin:5px 0; color:#888; font-size: 14px; font-weight: 500;"># ${idPresupuesto}</p>
             <p style="margin:0; color:#333; font-size: 14px; font-weight: bold;">Fecha: ${fecha}</p>
           </div>
        </div>
        
        <!-- INFO CLIENTE -->
        <div style="margin-bottom: 30px; background: #F9F7F2; padding: 15px; border-radius: 6px; border-left: 5px solid #8B5E3C; display: flex; justify-content: space-between;">
           <div>
              <span style="font-size: 10px; font-weight: 700; color: #8B5E3C; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Cliente</span>
              <h2 style="margin: 0; font-size: 16px; color: #222;">${cliente.nombre || 'Consumidor Final'}</h2>
           </div>
           <div style="text-align: right;">
              <span style="font-size: 10px; font-weight: 700; color: #8B5E3C; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Contacto</span>
              <p style="margin: 0; font-size: 12px; color: #444;">${cliente.telefono || '-'}</p>
              <p style="margin: 0; font-size: 12px; color: #444;">${cliente.lugar || '-'}</p>
           </div>
        </div>

        <!-- TABLA -->
        <table style="width:100%; border-collapse: collapse; margin-bottom:30px;">
           <thead>
              <tr style="background:#5D4037; color:white;">
                  <th style="padding:12px 10px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing: 1px; border-top-left-radius: 4px;">Producto</th>
                  <th style="padding:12px 10px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing: 1px;">Detalle</th>
                  <th style="padding:12px 10px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing: 1px; border-top-right-radius: 4px;">Importe</th>
              </tr>
           </thead>
           <tbody>${itemsHtml}</tbody>
        </table>

        <!-- TOTALES -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
           <div style="width: 280px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #666; padding-bottom: 5px; border-bottom: 1px dashed #ddd;">
                 <span>Envío</span>
                 <span>A Cotizar</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #666; padding-bottom: 5px; border-bottom: 1px dashed #ddd;">
                 <span>Instalación</span>
                 <span>A Cotizar</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 3px solid #5D4037; font-weight: 900; font-size: 18px; color: #5D4037; align-items: center;">
                 <span>TOTAL ESTIMADO</span>
                 <span>$${new Intl.NumberFormat('es-AR').format(total)}</span>
              </div>
           </div>
        </div>

        <!-- PIE DE PAGINA (LEGALES) -->
        <div style="border-top: 1px solid #ddd; padding-top: 15px; font-size: 10px; color: #666; line-height: 1.5; margin-top: auto;">
           <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 30px;">
               <div>
                  <strong style="color: #5D4037; display: block; margin-bottom: 4px; text-transform: uppercase;">Condiciones Comerciales</strong>
                  Este presupuesto tiene una validez de 10 días hábiles. Los precios están sujetos a verificación final vía WhatsApp. La demora de fabricación se estipula a partir de la seña.
               </div>
               <div>
                  <strong style="color: #5D4037; display: block; margin-bottom: 4px; text-transform: uppercase;">Entregas y Materiales</strong>
                  El envío corre por cuenta y responsabilidad del cliente. Trabajamos con materiales 100% naturales y procesos artesanales, garantizando piezas únicas.
               </div>
           </div>
           <div style="text-align:center; margin-top:30px; font-weight:800; color:#5D4037; font-size:10px; letter-spacing:2px; text-transform: uppercase;">Gracias por elegir diseño argentino</div>
        </div>
      </div>
    `;

    // Configuración para html2pdf - CALIDAD HD A4
    const opt = {
      margin: 0,
      filename: `Presupuesto_eBe_${cliente.nombre || 'Cliente'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 4, useCORS: true, logging: false, letterRendering: true }, // Scale 4 para máxima calidad
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Ejecutar descarga
    window.html2pdf().set(opt).from(element).save();
  };

  const enviarWhatsapp = useCallback(async () => {
    const total = carrito.reduce((a, b) => a + b.precio, 0);
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

    // Guardar pedido
    try {
      await addDoc(collection(db, 'artifacts', APP_ID_FIRESTORE, 'public', 'data', 'orders'), {
        orderNumber: nextOrderNumber,
        cliente,
        items: carrito,
        total,
        createdAt: Date.now()
      });
    } catch (e) { }

    // Mensaje WhatsApp
    let text = `👋 Hola *eBe Muebles*, soy ${cliente.nombre}.\n📍 Desde: ${cliente.lugar}\n📋 *PEDIDO WEB #${nextOrderNumber}*\n\n`;
    carrito.forEach(i => text += `🔹 *${i.mueble.nombre}* \n`);
    text += `\n💰 *Total: $${new Intl.NumberFormat('es-AR').format(total)}*`;
    text += `\n\n(He descargado el PDF del presupuesto)`;

    window.open(`https://wa.me/${DATOS_CONTACTO.telefono_whatsapp}?text=${encodeURIComponent(text)}`, '_blank');

    // Descarga automática del PDF
    downloadPDF();
  }, [carrito, cliente, pdfLibLoaded]);

  const nextImage = useCallback((e) => { e && e.stopPropagation(); setSelectedImage(prev => galeria[(galeria.findIndex(i => i.id === prev.id) + 1) % galeria.length]); }, [galeria]);
  const prevImage = useCallback((e) => { e && e.stopPropagation(); setSelectedImage(prev => galeria[(galeria.findIndex(i => i.id === prev.id) - 1 + galeria.length) % galeria.length]); }, [galeria]);

  // --- RENDER ---
  if (isAdmin) return (
    <div className={`min-h-screen bg-[#F5F5F5] text-[#333] font-sans flex flex-col md:flex-row`}>
      {/* Sidebar Admin (Responsive) */}
      <div className="w-full md:w-64 bg-white border-b md:border-r border-[#E0E0E0] flex flex-row md:flex-col fixed md:h-full z-20 transition-all items-center md:items-stretch justify-between md:justify-start px-4 md:px-0">
        <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3">
          <Settings className="text-[#5D4037] animate-spin-slow" />
          <span className="font-bold text-[#5D4037] text-lg hidden md:block uppercase tracking-wider">Admin</span>
        </div>
        <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto md:py-4 gap-2 md:gap-0 no-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Panel' },
            { id: 'orders', icon: ListOrdered, label: 'Pedidos' },
            { id: 'gallery', icon: ImageIcon, label: 'Galería' },
            { id: 'prices', icon: Coins, label: 'Precios' },
            { id: 'materials', icon: TreePine, label: 'Maderas' },
            { id: 'melaminas', icon: Palette, label: 'Melaminas' },
            { id: 'config', icon: Settings, label: 'Config' }
          ].map(item => (
            <button key={item.id} onClick={() => setAdminTab(item.id)} className={`flex items-center gap-3 p-3 md:px-6 hover:bg-[#F9F7F2] transition-colors rounded-lg md:rounded-none whitespace-nowrap ${adminTab === item.id ? 'bg-[#F9F7F2] border-b-2 md:border-b-0 md:border-r-4 border-[#8B5E3C] text-[#5D4037]' : 'text-[#555]'}`}>
              <item.icon size={20} />
              <span className="hidden md:block font-bold text-sm capitalize tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-[#E0E0E0] hidden md:block mt-auto">
          <button onClick={() => { signOut(auth); setIsAdmin(false); signInAnonymously(auth); }} className="w-full text-red-500 flex items-center justify-center md:justify-start gap-2 hover:bg-red-50 p-3 rounded-xl transition-colors font-bold text-sm"><LogOut size={20} /> <span className="hidden md:block">Salir</span></button>
        </div>
      </div>
      <div className="flex-1 md:ml-64 p-4 md:p-10 pt-20 md:pt-10 overflow-y-auto min-h-screen">

        {adminTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="text-3xl font-bold text-[#333]">Panel de Control</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-[#E0D8C3] shadow-sm">
                <h4 className="text-xs font-bold text-[#999] uppercase tracking-widest mb-2">Visitas Totales</h4>
                <div className="text-4xl font-black text-[#5D4037]">{visitStats.mobile + visitStats.desktop}</div>
                <div className="mt-4 text-xs font-medium text-gray-500 flex gap-4">
                  <span className="flex items-center gap-1"><Smartphone size={14} /> {visitStats.mobile} Móvil</span>
                  <span className="flex items-center gap-1"><Monitor size={14} /> {visitStats.desktop} PC</span>
                </div>
              </div>

              <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="bg-white p-6 rounded-xl border border-[#E0D8C3] shadow-sm flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group">
                <BarChart3 size={32} className="text-[#F4B400] mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-[#333]">Ir a Google Analytics</h4>
                <p className="text-xs text-gray-500 mt-1">Ver métricas detalladas</p>
              </a>
            </div>
          </div>
        )}

        {adminTab === 'materials' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-white p-6 rounded-xl border border-[#E0D8C3]">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-[#8B5E3C] uppercase text-sm">Editar Materiales (Maderas)</h3>
                <button onClick={uploadDefaultMaterials} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm" title="Cargar catálogo de maderas">
                  <Save size={16} /> Sincronizar Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Nombre</label>
                  <input value={newMaterial.nombre} onChange={e => setNewMaterial({ ...newMaterial, nombre: e.target.value })} className="border p-2 rounded text-sm font-medium" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Categoría</label>
                  <select className="w-full border p-1 rounded text-sm bg-white" value={newMaterial.tier} onChange={e => setNewMaterial({ ...newMaterial, tier: e.target.value })}>
                    <option value="basica">Básica</option>
                    <option value="intermedia">Intermedia</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">URL Textura</label>
                  <input className="w-full border p-1 rounded text-sm" value={newMaterial.src} onChange={e => setNewMaterial({ ...newMaterial, src: e.target.value })} />
                </div>
                <button onClick={addMaterial} className="bg-[#5D4037] text-white p-2 rounded font-bold text-sm h-10 hover:bg-[#3E2723]">AGREGAR</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maderas.map(m => (
                  <div key={m.id} className="border border-gray-200 rounded-lg p-4 relative group hover:border-[#8B5E3C] transition-all bg-white shadow-sm">
                    {editMaterialId === m.id ? (
                      <div className="space-y-3">
                        <div><label className="text-[10px] font-bold text-gray-400">Nombre</label><input className="w-full border p-1 rounded text-sm" value={editMaterialData.nombre} onChange={e => setEditMaterialData({ ...editMaterialData, nombre: e.target.value })} /></div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400">Categoría Precio</label>
                          <select className="w-full border p-1 rounded text-sm bg-white" value={editMaterialData.tier} onChange={e => setEditMaterialData({ ...editMaterialData, tier: e.target.value })}>
                            <option value="basica">Básica</option>
                            <option value="intermedia">Intermedia</option>
                            <option value="premium">Premium</option>
                          </select>
                        </div>
                        <div><label className="text-[10px] font-bold text-gray-400">URL Textura</label><input className="w-full border p-1 rounded text-sm" value={editMaterialData.src} onChange={e => setEditMaterialData({ ...editMaterialData, src: e.target.value })} /></div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={saveMaterial} className="bg-green-600 text-white p-1.5 rounded text-xs font-bold flex-1">Guardar</button>
                          <button onClick={() => setEditMaterialId(null)} className="bg-gray-300 text-gray-700 p-1.5 rounded text-xs font-bold flex-1">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-24 bg-gray-100 rounded mb-3 overflow-hidden"><img src={getDirectDriveUrl(m.src)} className="w-full h-full object-cover" /></div>
                        <h4 className="font-bold text-[#333]">{m.nombre}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase font-bold text-[10px]">{m.tier}</span>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button onClick={() => startEditMaterial(m)} className="p-1.5 bg-white border rounded-full text-gray-500 hover:text-[#8B5E3C] hover:border-[#8B5E3C]"><Edit size={14} /></button>
                          <button onClick={() => deleteMaterial(m.id)} className="p-1.5 bg-white border rounded-full text-red-400 hover:text-red-600 hover:border-red-600"><Trash2 size={14} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {adminTab === 'melaminas' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-white p-6 rounded-xl border border-[#E0D8C3] shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold uppercase text-sm text-[#8B5E3C]">Gestión de Melaminas</h3>
                <button onClick={uploadDefaultMelamines} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm" title="Cargar catálogo completo de melaminas">
                  <Save size={16} /> Sincronizar Defaults
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Nombre</label>
                  <input value={newMelamina.nombre} onChange={e => setNewMelamina({ ...newMelamina, nombre: e.target.value })} className="border p-2 rounded text-sm font-medium" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Categoría</label>
                  <select value={newMelamina.category} onChange={e => setNewMelamina({ ...newMelamina, category: e.target.value })} className="border p-2 rounded text-sm bg-white font-medium">
                    {CATEGORIAS_MELAMINA.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">CSS Color</label>
                  <div className="flex gap-2">
                    <input value={newMelamina.css} onChange={e => setNewMelamina({ ...newMelamina, css: e.target.value })} className="border p-2 rounded text-sm flex-1 font-medium" />
                    <div className="w-10 h-10 rounded border" style={{ background: newMelamina.css }}></div>
                  </div>
                </div>
                <button onClick={addMelamina} className="bg-[#5D4037] text-white p-2 rounded font-bold text-sm h-10 hover:bg-[#3E2723]">AGREGAR</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {melaminas.map(m => (
                <div key={m.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between group shadow-sm hover:border-[#8B5E3C]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border" style={{ background: m.css }}></div>
                    <div>
                      <div className="font-bold text-xs text-gray-800">{m.nombre}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-semibold">{CATEGORIAS_MELAMINA.find(c => c.id === m.category)?.label}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteMelamina(m.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'prices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
            <div className="col-span-full flex justify-end">
              <button onClick={saveCostos} className="flex items-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-bold shadow-md hover:bg-green-700 transition-all"><Save size={18} /> GUARDAR CAMBIOS</button>
            </div>
            {Object.entries(CATEGORIAS_COSTOS).map(([cat, keys]) => (
              <div key={cat} className="bg-white p-6 rounded-xl border border-[#E0D8C3] shadow-sm">
                <h3 className="font-bold text-[#8B5E3C] uppercase text-sm mb-4 border-b pb-2">{cat}</h3>
                <div className="space-y-3">
                  {keys.map(k => (
                    <div key={k} className="flex justify-between items-center text-sm">
                      <label className="text-gray-600 uppercase font-medium">{k.replace(/_/g, ' ')}</label>
                      <input value={new Intl.NumberFormat('es-AR').format(costos[k] || 0)} onChange={e => handleCostoChange(k, e.target.value)} className="w-24 text-right border rounded p-1 font-mono font-bold text-gray-700" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {adminTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#E0D8C3] shadow-sm">
              <h3 className="font-bold uppercase text-sm text-[#8B5E3C] mb-4">Gestión de Galería</h3>
              <div className="flex gap-2">
                <input value={newImage.url} onChange={e => setNewImage({ ...newImage, url: e.target.value })} placeholder="URL Imagen (Ej: Google Drive o Directa)" className="flex-1 border p-3 rounded-lg text-sm font-medium" />
                <input value={newImage.alt} onChange={e => setNewImage({ ...newImage, alt: e.target.value })} placeholder="Título descriptivo" className="flex-1 border p-3 rounded-lg text-sm font-medium" />
                <button onClick={addGalleryImage} className="bg-[#5D4037] text-white px-6 rounded-lg hover:bg-[#3E2723] transition-colors font-bold"><Plus /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galeria.map(img => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-[#E0D8C3] shadow-sm">
                  <img src={getDirectDriveUrl(img.src)} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs font-bold truncate">{img.alt}</div>
                  <button onClick={() => removeGalleryImage(img.id)} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-opacity"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'orders' && (
          <div className="space-y-6 max-w-6xl">
            <div className="bg-white p-6 rounded-xl border border-[#E0D8C3] shadow-sm">
              <h3 className="font-bold text-[#8B5E3C] uppercase text-sm mb-4 border-b pb-2">Pedidos Recientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Items</th>
                      <th className="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map(order => (
                      <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-[#5D4037]">#{order.orderNumber}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-[#333]">
                          {order.cliente.nombre}
                          <div className="text-xs font-normal text-gray-500">{order.cliente.lugar}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1"><Phone size={10} /> {order.cliente.telefono || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="text-xs mb-1 text-gray-600">• {i.mueble.nombre} ({i.config.materialNombre})</div>
                          ))}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#5D4037]">
                          ${new Intl.NumberFormat('es-AR').format(order.total)}
                        </td>
                      </tr>
                    ))}
                    {ordersList.length === 0 && <tr><td colSpan="5" className="text-center py-8">No hay pedidos registrados aún.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminTab === 'config' && (
          <div className="bg-white p-8 rounded-xl border border-[#E0D8C3] space-y-6 max-w-2xl mx-auto shadow-md">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-[#5D4037] uppercase text-lg">Configuración General</h3>
              <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-[#5D4037] text-white py-2 px-4 rounded-lg hover:bg-[#3E2723] transition-colors font-bold"><Save size={20} /> Guardar</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wide">URL Logo Principal</label>
                <input value={adminLogoInput} onChange={e => setAdminLogoInput(e.target.value)} placeholder="https://..." className="w-full border p-3 rounded-lg text-sm font-medium bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wide">URL Imagen "Sobre Nosotros"</label>
                <input value={adminAboutUsImageInput} onChange={e => setAdminAboutUsImageInput(e.target.value)} placeholder="https://..." className="w-full border p-3 rounded-lg text-sm font-medium bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wide">Link Instagram</label>
                <input value={adminInstagramInput} onChange={e => setAdminInstagramInput(e.target.value)} placeholder="Instagram URL" className="w-full border p-3 rounded-lg text-sm font-medium bg-gray-50 focus:bg-white transition-colors" />
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

      {/* Botón Carrito FLOTANTE */}
      {paso > 0 && paso !== 4 && carrito.length > 0 && (
        <button onClick={() => setPaso(4)} aria-label="Ver Carrito" className={`fixed bottom-24 right-6 ${THEME.primary} text-white p-3 md:p-4 rounded-full shadow-xl hover:scale-110 transition-all z-50 flex items-center justify-center border-2 border-white`}>
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-[#7A8D6F] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">{carrito.length}</span>
        </button>
      )}

      {/* AI Modal - Asistente GEMINI */}
      {showAi && (
        <div className="fixed inset-0 z-50 bg-[#333]/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowAi(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#E0D8C3] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#F2E9D8] flex justify-between items-center gemini-gradient">
              <div className="flex items-center gap-2 text-white">
                <Sparkles size={20} className="text-yellow-200" />
                <span className={`font-bold uppercase text-sm tracking-wider`}>Asistente Gemini</span>
              </div>
              <button onClick={() => setShowAi(false)} aria-label="Cerrar asistente"><X size={18} className="text-white/80 hover:text-white" /></button>
            </div>
            <div className="p-4 h-80 overflow-y-auto bg-gray-50 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 shadow-sm leading-relaxed">
                  ¡Hola! Soy tu asistente de diseño inteligente. Conozco todos los productos de <b>eBe Muebles</b>.
                  <br /><br />¿Buscas una mesa de madera maciza, un vestidor o quizás alguna textura en melamina específica? ¡Pregúntame!
                </div>
              </div>

              {aiResponse && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 shadow-sm leading-relaxed">
                    {aiResponse}
                  </div>
                </div>
              )}

              {aiLoading && (
                <div className="flex gap-2 items-center text-xs text-purple-600 font-medium ml-12 animate-pulse">
                  <Sparkles size={12} /> Pensando...
                </div>
              )}
            </div>

            <form onSubmit={handleAi} className="p-3 bg-white flex gap-2 border-t border-gray-100">
              <input
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Ej: ¿Qué madera recomiendas para exterior?"
                className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-200 outline-none transition-all`}
              />
              <button type="submit" aria-label="Enviar" className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-xl font-bold shadow-md transition-all active:scale-95`}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviews && (
        <div className="fixed inset-0 z-50 bg-[#333]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviews(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E0D8C3] shadow-2xl overflow-hidden p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowReviews(false)} aria-label="Cerrar reseñas" className="absolute top-4 right-4 text-[#999] hover:text-[#333]"><X size={24} /></button>
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
                <button onClick={() => setPaso(7)} className={`w-full py-4 rounded-xl border-2 border-[#5D4037] flex flex-col md:flex-row items-center justify-center gap-2 hover:bg-[#5D4037]/5 transition-all text-[#5D4037]`}>
                  <Mail size={20} /> <span className="text-xs font-bold uppercase tracking-wide">Contacto</span>
                </button>
                <button onClick={() => setShowAi(true)} className={`w-full py-4 rounded-xl border-2 border-[#5D4037] flex flex-col md:flex-row items-center justify-center gap-2 hover:bg-[#5D4037]/5 transition-all text-[#5D4037]`}>
                  <Sparkles size={20} /> <span className="text-xs font-bold uppercase tracking-wide">Asistente</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIAS (Grid en PC, Lista en Celu) */}
        {paso === 1 && (
          <div className="min-h-[85vh] flex flex-col justify-center max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'}`}>
              {CATEGORIAS_PRINCIPALES.map(cat => (
                <button key={cat.id} onClick={() => { setCatSeleccionada(cat); if (cat.destino === 'directo') { setMuebleSeleccionado(cat.item); setPaso(3); } else { setPaso(2); } }}
                  className={`${THEME.card} ${isMobile ? 'py-6 px-6 flex-row justify-start gap-6' : 'aspect-[4/5] flex-col justify-center gap-4'} rounded-2xl p-4 flex items-center group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-md`}>
                  <div className={`p-3 md:p-4 rounded-full bg-[#F9F7F2] border border-[#E0D8C3] ${THEME.accent} relative z-10 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <IconRenderer name={cat.icon} size={24} className="md:w-8 md:h-8" />
                  </div>
                  <h2 className={`text-sm md:text-sm font-bold uppercase tracking-widest relative z-10 ${THEME.textMain} font-sans`}>{cat.label}</h2>
                  {!isMobile && <div className={`absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${THEME.primaryText}`}>
                    <ChevronRight size={16} />
                  </div>}
                  {isMobile && <ChevronRight size={16} className={`ml-auto ${THEME.textMuted}`} />}
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
                    {CATEGORIAS_MELAMINA.map(cat => {
                      const items = melaminasGrouped[cat.id] || [];
                      if (items.length === 0) return null;
                      return (
                        <div key={cat.id}>
                          <h4 className={`text-xs font-bold ${THEME.accent} uppercase mb-2 border-b border-[#E0D8C3] pb-1`}>{cat.label}</h4>
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
                      );
                    })}
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
                    <button onClick={() => { setModalType('all'); setShowMaterialModal(true) }} className={`w-full py-4 rounded-xl border bg-white hover:bg-[#F9F7F2] transition-all flex items-center justify-between px-6 ${config.material.startsWith('m_') ? `${THEME.accentBorder} ring-2 ring-[#5D4037] ring-offset-1` : 'border-[#E0D8C3]'}`}>
                      <div className="flex items-center gap-4">
                        <Grid size={24} className={THEME.textMuted} />
                        <span className={`font-bold text-sm uppercase tracking-wide ${THEME.textMain}`}>
                          {config.material.startsWith('m_')
                            ? `SELECCIONADO: ${melaminas.find(m => m.id === config.material)?.nombre || 'DISEÑO'}`
                            : 'SELECCIONAR COLOR / TEXTURA'}
                        </span>
                      </div>
                      {config.material.startsWith('m_') ? (
                        <div className="w-10 h-10 rounded-lg border border-[#E0D8C3] shadow-sm" style={{ background: melaminas.find(m => m.id === config.material)?.css }}></div>
                      ) : (
                        <ChevronRight size={20} className={THEME.textMuted} />
                      )}
                    </button>
                  </div>
                ) : (
                  // Aquí es donde mejoramos la visualización de las maderas
                  <div className="grid grid-cols-2 gap-4">
                    {materialesPosibles.map(m => {
                      const textureData = m.textura;
                      return (
                        <button key={m.id} onClick={() => setConfig({ ...config, material: m.id })} className={`relative h-32 md:h-40 rounded-xl overflow-hidden border transition-all group ${config.material === m.id ? `${THEME.accentBorder} ring-2 ring-[#5D4037] ring-offset-2 ring-offset-[#F2E9D8]` : 'border-[#E0D8C3]'}`}>
                          {textureData.type === 'img' ? (
                            <img src={textureData.src} className="absolute inset-0 w-full h-full object-cover" alt={m.nombre} referrerPolicy="no-referrer" />
                          ) : (
                            <div className="absolute inset-0" style={{ background: textureData.css }}></div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-white/90 py-2 px-3 border-t border-[#E0D8C3]">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#333] block text-center">{m.nombre}</span>
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

            {muebleSeleccionado?.id?.includes('puerta') && (
              <div className="bg-[#2C241F] text-[#E8DCCA] p-6 rounded-2xl mb-8 shadow-xl border border-[#3E2723] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8DCCA]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="flex items-center gap-2 mb-4 text-white font-bold text-xs uppercase tracking-[0.2em] border-b border-[#E8DCCA]/10 pb-3">
                  <Info size={16} className="text-[#8B5E3C]" /> Especificaciones Técnicas
                </div>
                <ul className="space-y-3 text-sm font-light">
                  {config.uso === 'exterior' ? (
                    <>
                      <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] mt-1.5 shrink-0"></div><span><strong className="text-white font-medium">Estructura:</strong> Alma de acero reforzada.</span></li>
                      <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] mt-1.5 shrink-0"></div><span><strong className="text-white font-medium">Herrajes:</strong> Bisagra pivotante o reforzada, cerradura de seguridad.</span></li>
                      <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] mt-1.5 shrink-0"></div><span><strong className="text-white font-medium">Accesorios:</strong> Manija interior y manijón exterior incluidos.</span></li>
                      <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] mt-1.5 shrink-0"></div><span><strong className="text-white font-medium">Espesor Total:</strong> 3 pulgadas.</span></li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] mt-1.5 shrink-0"></div><span><strong className="text-white font-medium">Herrajes:</strong> Bisagras y manijas incluidas.</span></li>
                      <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] mt-1.5 shrink-0"></div><span><strong className="text-white font-medium">Espesor Total:</strong> 2 pulgadas.</span></li>
                    </>
                  )}
                </ul>
              </div>
            )}

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
              {carrito.map(item => {
                const visual = getMaterialVisual(item.config, maderas, melaminas);
                return (
                  <div key={item.id} className={`${THEME.card} p-5 rounded-2xl flex gap-5 group relative`}>
                    <div className={`w-20 h-20 rounded-lg flex items-center justify-center border border-[#E0D8C3] overflow-hidden`}>
                      {visual.type === 'img' && visual.value ? (
                        <img src={getDirectDriveUrl(visual.value)} className="w-full h-full object-cover" />
                      ) : visual.type === 'css' ? (
                        <div className="w-full h-full" style={{ background: visual.value }}></div>
                      ) : (
                        <div className="text-3xl">{item.mueble.imagen}</div>
                      )}
                    </div>
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
                );
              })}
              {carrito.length === 0 && <div className={`text-center py-20 ${THEME.textMuted}`}>Tu pedido está vacío.</div>}
              <button onClick={() => { setPaso(1); setCatSeleccionada(null); }} className={`w-full py-4 rounded-xl border border-dashed border-[#E0D8C3] ${THEME.textMuted} hover:${THEME.accent} hover:border-[#8B5E3C] hover:bg-white transition-all flex items-center justify-center gap-2 font-bold text-sm uppercase`}><Plus size={18} /> Agregar otro mueble</button>
            </div>

            {carrito.length > 0 && (
              <div className={`${THEME.card} p-6 rounded-2xl space-y-4`}>
                <h3 className={`text-xs font-bold uppercase ${THEME.accent} tracking-widest mb-4`}>Datos de Contacto</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`flex items-center gap-3 bg-[#F9F7F2] p-4 rounded-xl border border-[#E0D8C3] focus-within:border-[#8B5E3C] transition-colors`}><User size={18} className={THEME.textMuted} /><input value={cliente.nombre} onChange={e => setCliente({ ...cliente, nombre: e.target.value })} placeholder="Nombre" className={`bg-transparent w-full outline-none ${THEME.textMain} text-sm placeholder-[#999] font-medium`} /></div>
                  <div className={`flex items-center gap-3 bg-[#F9F7F2] p-4 rounded-xl border border-[#E0D8C3] focus-within:border-[#8B5E3C] transition-colors`}><MapPin size={18} className={THEME.textMuted} /><input value={cliente.lugar} onChange={e => setCliente({ ...cliente, lugar: e.target.value })} placeholder="Ciudad" className={`bg-transparent w-full outline-none ${THEME.textMain} text-sm placeholder-[#999] font-medium`} /></div>
                </div>

                {/* TELEFONO MEJORADO */}
                <div className="flex items-center gap-3 bg-[#F9F7F2] p-4 rounded-xl border border-[#E0D8C3] focus-within:border-[#8B5E3C] transition-colors">
                  <Phone size={18} className={THEME.textMuted} />
                  <input
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={cliente.telefono}
                    onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
                    placeholder={cliente.telefono ? '' : '+543547531519'}
                    className={`bg-transparent w-full outline-none ${THEME.textMain} text-sm placeholder-[#999] font-medium`}
                  />
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
                  <button onClick={() => downloadPDF(null)} className={`w-full py-4 rounded-xl font-bold uppercase text-[#5D4037] border border-[#5D4037] hover:bg-[#5D4037] hover:text-white transition-all flex items-center justify-center gap-2 text-xs md:text-sm`}>
                    <Download size={20} /> Descargar PDF
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
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${THEME.textMain} uppercase font-sans mb-6`}>Nuestros Trabajos</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setShowReviews(true)}
                className={`py-3 px-4 rounded-lg bg-white border border-[#8B5E3C] text-[#8B5E3C] font-semibold text-xs md:text-sm uppercase tracking-wider hover:bg-[#8B5E3C] hover:text-white transition-all shadow-sm flex flex-row items-center justify-center gap-2`}
              >
                <MessageCircle size={18} /> RESEÑAS
              </button>
              <a
                href={instagramUrl || DEFAULT_INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className={`py-3 px-4 rounded-lg border border-[#C13584] bg-white text-[#C13584] font-semibold text-xs md:text-sm uppercase hover:bg-[#C13584] hover:text-white transition-all shadow-sm flex flex-row items-center justify-center gap-2`}
              >
                <Instagram size={18} /> INSTAGRAM
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
              {galeria.map(img => (
                <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-md transition-all border border-[#E0D8C3]">
                  <img src={getDirectDriveUrl(img.src)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity">
                    <span className="text-white text-sm md:text-lg font-bold uppercase tracking-widest mb-4 px-2 text-center drop-shadow-md font-sans">{img.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUIENES SOMOS (Compacto en móvil) */}
        {paso === 6 && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in text-center max-w-4xl mx-auto">
            <div className={`w-32 h-32 rounded-full bg-white border border-[#E0D8C3] flex items-center justify-center mb-8 shadow-sm overflow-hidden p-2`}>
              {aboutUsImageUrl ? (
                <img src={getDirectDriveUrl(aboutUsImageUrl)} className="w-full h-full object-cover rounded-full" alt="Nosotros" loading="lazy" decoding="async" />
              ) : (
                <Users size={56} className={THEME.accent} />
              )}
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold uppercase tracking-tight ${THEME.textMain} mb-4 font-sans`}>Sobre Nosotros</h2>
            <p className={`uppercase tracking-[0.2em] text-xs font-black ${THEME.accent} mb-6`}>Carpintería de Autor</p>

            <div className={`${isMobile ? 'p-6 text-sm space-y-3' : 'p-10 text-lg space-y-6'} bg-[#2C241F] rounded-3xl border border-[#3E2723] shadow-2xl text-[#E8DCCA] leading-relaxed font-light text-left relative overflow-hidden transition-all duration-300`}>
              {!isMobile && <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8DCCA] opacity-5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>}
              <p><strong className="text-white font-bold">En EBE Muebles</strong> somos un equipo dedicado al diseño y fabricación de muebles a medida de alta calidad, combinando funcionalidad, estética y durabilidad en cada proyecto. Nacemos con una visión clara: crear piezas únicas que respondan a las necesidades reales de cada cliente, respetando los espacios, los estilos y el uso cotidiano.</p>
              <p>Nos especializamos en el desarrollo de muebles de madera maciza, hierro y combinaciones contemporáneas, trabajando con <span className="text-[#A1887F] font-bold">maderas reforestadas</span> provenientes de tala cuidada, seleccionadas por su resistencia, estabilidad y comportamiento a largo plazo. Este compromiso con los materiales no solo garantiza productos superiores, sino también una producción responsable con el medio ambiente.</p>
              <p>Cada mueble es diseñado y fabricado de manera personalizada, acompañando al cliente desde la idea inicial hasta la entrega final, brindando asesoramiento técnico y estético en todo el proceso. Creemos que un buen mueble debe ser visualmente atractivo, funcional y, sobre todo, durable.</p>
              <p>Contamos con <span className="text-[#A1887F] font-bold">fabricación propia</span>, lo que nos permite controlar cada etapa del proceso: diseño, selección de materiales, construcción, terminaciones e instalación. Esto asegura estándares de calidad constantes y resultados alineados a lo acordado.</p>
              <p>En EBE Muebles desarrollamos soluciones para viviendas, oficinas, locales comerciales, emprendimientos gastronómicos y proyectos arquitectónicos, adaptándonos a diferentes escalas y necesidades, siempre con el mismo nivel de compromiso y detalle.</p>
              <p className="italic text-white/80 text-center mt-6 border-t border-white/10 pt-6 font-medium">"Nuestro propósito es transformar ideas en piezas reales, creando muebles que acompañen la vida diaria y perduren en el tiempo."</p>
            </div>

            <div className="mt-12 flex justify-center">
              <a href={instagramUrl || DEFAULT_INSTAGRAM_URL} target="_blank" rel="noreferrer" className={`px-10 py-4 rounded-xl border border-[#C13584] text-[#C13584] text-sm font-bold uppercase hover:bg-[#C13584] hover:text-white transition-colors flex items-center gap-2 shadow-sm`}>
                <Instagram size={20} /> Seguinos en Instagram
              </a>
            </div>
          </div>
        )}

        {/* CONTACTO */}
        {paso === 7 && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in text-center max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-white to-[#F9F7F2] p-10 rounded-3xl border border-[#D6C4B0] shadow-2xl w-full relative overflow-hidden">
              <h2 className={`text-4xl font-bold uppercase tracking-tight ${THEME.textMain} mb-2 font-sans text-center`}>Hablemos</h2>
              <p className="text-center text-[#666] mb-10 text-sm font-medium uppercase tracking-wide">Estamos listos para tu proyecto</p>

              <div className="space-y-6">
                <a href={`https://wa.me/${DATOS_CONTACTO.telefono_whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-4 bg-[#25D366] text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform w-full group">
                  <MessageCircle size={28} className="group-hover:animate-bounce" /> WhatsApp Directo
                </a>

                <a href={instagramUrl || DEFAULT_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-4 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform w-full group">
                  <Instagram size={28} className="group-hover:rotate-12 transition-transform" /> Instagram
                </a>

                <a href={DATOS_CONTACTO.maps_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-4 bg-[#4285F4] text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform w-full group">
                  <MapPin size={28} className="group-hover:animate-bounce" />
                  <div className="flex flex-col items-start leading-none">
                    <span>Ubicación Taller</span>
                    <span className="text-xs font-normal opacity-90 mt-1">Alta Gracia, Córdoba</span>
                  </div>
                </a>
              </div>
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