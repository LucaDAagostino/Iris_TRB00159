const forcedEnvironmentWs = null;

const environmentWs = calculateEnvironmentWs(forcedEnvironmentWs);
const baseEnvironmentWs = environmentWs ? environmentWs.baseEnvironmentWs : null;
const isPublicIP = environmentWs ? environmentWs.isPublicIP : false;

// === CONFIGURAZIONE AMBIENTI WS ===
const wsParamConfigs = {
  TEST: {
    internal: { serverName: 'FLA1IWSTST', host: 'mtcnsl02.trebigen.com', ports: { http: '11001', https: '11501' }, useHttps: true },
    public: { serverName: 'FLA1IWSTST', host: 'nextalia-gen-tst.trebigen.com:8443', useHttps: true }
  },
  TEST_UAT: {
    internal: { serverName: 'FLA1IWSTST', host: 'mtcnsl02.trebigen.com', ports: { http: '11001', https: '11501' }, useHttps: true },
    public: { serverName: 'FLA1IWSTST', host: 'nextalia-gen-tst.trebigen.com:8443', useHttps: true }
  },
  PRODUZIONE: {
    internal: { serverName: 'FLA1IWSPRD', host: 'mtcnsl02.trebigen.com', ports: { http: '11201', https: '11701' }, useHttps: true },
    public: { serverName: 'FLA1IWSPRD', host: 'nextalia-gen.trebigen.com:8443', useHttps: true }
  }
};

// scelgo la variante giusta
const wsConfigs = isPublicIP ? wsParamConfigs[baseEnvironmentWs].public : wsParamConfigs[baseEnvironmentWs].internal;

const baseWsUrl = getBaseWsUrl(wsConfigs, isPublicIP);

const properties = {
  // generico

  showLoginTitle: false,
  defaultFontSize: '16px',
  showConsoleLog: true,
  sendConsoleToWs: true,
  minConsoleLevel: "error",
  consoleLogPrograms: [],
  idCommandLine: "I_20_7",
  idVideo: "D_1_2",


  // logo
  logoName: 'Logo_Moltiply_White.svg',
  logoHref: 'https://www.trebi.it',
  faviconName: 'favicon_Moltiply.ico',
  logoProductName: 'logo_Moltiply_AppCore.png',
  logoCompanyName: 'Logo_Moltiply_White.svg',

  //logger
  supportEmail: "luca.dagostino@trebi.it",

  // web service
  cacheWs: true,
  environmentWs: baseEnvironmentWs,
  get isProduction() {
    const skin = pui.skin?.toUpperCase() || '';
    return this.environmentWs === 'PRODUZIONE' || skin.endsWith('_PRD');
  },
  urlWs: baseWsUrl,
  timeoutWs: 600,

  defaultCodeEnvironment: 'FA1',
  invokeWs_BGNIDSPF: true,
  prefixNameWs_BGNIDSPF: '{CODE}_{ENV}_',
  nameWs_BGNIDSPF: "BGNIDSPF",

  invokeWs_BGNIATTR: true,
  prefixNameWs_BGNIATTR: '{CODE}_{ENV}_',
  nameWs_BGNIATTR: "BGNIATTR",

  invokeWs_BGNIWMSG: true,
  prefixNameWs_BGNIWMSG: '{CODE}_{ENV}_',
  nameWs_BGNIWMSG: "BGNIWMSG",

  disableCacheWs: ['I0050LB', 'I1050LB', 'I0721LB'],      //Inserire qui i programmi che scrivono formati record dinamici

  // workstation
  workstationIdType: '*RANDOM',
  workstationIdTypeRandomPrefix: 'FLA1GN',

  // AppCore
  nameAppCore: 'NSIL',
  macroAppCore: 'ExecProgram',
  mainMenuAppCoreId: 'D_3_2',
  mainMenuId: 'D_1_2',
  mainMenuAppCore: 'MAINSBPM',
  mainProgramAppCore: 'I9001LB',
  mainProgramAppCoreId: 'D_3_74',
  mainAppCoreTag01: 'Società  .',
  mainAppCoreTag01Id: 'D_18_2',
  mainAppCoreTag01Value: 'D_18_14',

  mainAppCoreTag02: 'Ambiente .',
  mainAppCoreTag02Id: 'D_19_2',
  mainAppCoreTag02Value: 'D_19_14',

  // Background image
  backgroundImageInterval: null,
  backgroundImagesTimeRefresh: 900000,
  backgroundImages: ['Wallpaper_1.jpg', 'Wallpaper_2.jpg', 'Wallpaper_3.jpg', 'Wallpaper_4.jpg', 'Wallpaper_5.jpg', 'Wallpaper_6.jpg', 'Wallpaper_7.jpg', 'Wallpaper_8.jpg', 'Wallpaper_9.jpg', 'Wallpaper_10.jpg',
    'Wallpaper_11.jpg', 'Wallpaper_12.jpg', 'Wallpaper_13.jpg', 'Wallpaper_15.jpg', 'Wallpaper_16.jpg', 'Wallpaper_17.jpg', 'Wallpaper_18.jpg', 'Wallpaper_19.jpg', 'Wallpaper_20.jpg',
    'Wallpaper_21.jpg', 'Wallpaper_22.jpg', 'Wallpaper_23.jpg', 'Wallpaper_24.jpg', 'Wallpaper_25.jpg', 'Wallpaper_26.jpg', 'Wallpaper_27.jpg', 'Wallpaper_28.jpg', 'Wallpaper_29.jpg', 'Wallpaper_30.jpg',
    'Wallpaper_31.jpg', 'Wallpaper_32.jpg', 'Wallpaper_33.jpg'
  ],

  // Ridisegna
  redraw: true,
  redrawGridColumn: 6,
  findColumnsSubfile: 1,
  showSubfilePageOf: false,
  notificationMessage: true,
  partialMaxNumberNotificationMessage: 15,
  totalMaxNumberNotificationMessage: 999,
  showPreviousScreen: false,
  removeEmptyDataColumnsFromList: false,

  messageRow: 27,
  typeLabel: "middleLabel", // ["outLabel","middleLabel", "insideLabel" ]
  monospaceProgramAppCore: [],
  disableRedrawProgramAppCore: ['pgmDummy'], // Inserire qui i programmi che non devono essere ridisegnati. Si può agire anche da WS

  // logo
  showLogo: true,
  showLogoCompany: true
}

properties.urlWs_BGNIDSPF = baseWsUrl + properties.prefixNameWs_BGNIDSPF + properties.nameWs_BGNIDSPF;
properties.urlWs_BGNIATTR = baseWsUrl + properties.prefixNameWs_BGNIATTR + properties.nameWs_BGNIATTR;
properties.urlWs_BGNIWMSG = baseWsUrl + properties.prefixNameWs_BGNIWMSG + properties.nameWs_BGNIWMSG;

// === FUNZIONE PER COSTRUIRE L’URL BASE WS ===
function getBaseWsUrl(config, isPublic = false) {
  if (!config) {
    console.error(`Configurazione WS mancante per ambiente "${baseEnvironmentWs}"`);
    return '';
  }
  const protocol = config.useHttps ? 'https' : 'http';
  const path = '/web/services/';

  if (isPublic) return `${protocol}://${config.host}${path}`;

  const port = config.ports?.[protocol];
  if (!port) {
    console.error(`Porta non definita per protocollo "${protocol}" in "${baseEnvironmentWs}"`);
    return '';
  }
  return `${protocol}://${config.host}:${port}${path}`;
}

function calculateEnvironmentWs(forcedEnv = null) {
  const host = (location.hostname || "").toUpperCase();
  const port = String(location.port || "");
  let baseEnvironmentWs = null;
  let isPublicIP = false;

  // Heuristics da host/port
  if (host.includes("MTCNSL02") && (port === "11713" || port === "11814")) {
    baseEnvironmentWs = "PRODUZIONE";
  } else if (host.includes("NEXTALIA-GEN.TREBIGEN.COM")) {
    baseEnvironmentWs = "PRODUZIONE";
    isPublicIP = true;
  } else if (host.includes("MTCNSL02") && (port === "11213")) {
    baseEnvironmentWs = "TEST";
  } else if (host.includes("NEXTALIA-GEN-TST.TREBIGEN.COM")) {
    baseEnvironmentWs = "TEST";
    isPublicIP = true;
  } else if (host.includes("NEXTALIA-GEN-TST.TREBIGEN.COM")) {
    baseEnvironmentWs = "TEST_UAT";
    isPublicIP = true;
  }

  if (forcedEnv) baseEnvironmentWs = forcedEnv;

  if (!baseEnvironmentWs) {
    console.error("baseEnvironmentWs non determinato. Impostato default TEST");
    return { baseEnvironmentWs: "TEST", isPublicIP: false };
  }
  return { baseEnvironmentWs, isPublicIP };
}