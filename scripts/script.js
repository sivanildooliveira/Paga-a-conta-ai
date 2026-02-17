// ================================================================
//  CONFIGURAÇÕES CENTRALIZADAS
// ================================================================
const CONFIG = {
    MINIMO_JOGADORES:       2,
    TEMPO_MINIMO_SUSPENSE:  5000,   // 5s mínimo
    TEMPO_EXTRA_ALEATORIO:  3000,   // até +3s (total 5–8s)
    TEMPO_TENSAO_FINAL:     2000,   // fase "quem será?"
    TEMPO_TRANSICAO:        2000,   // antes de exibir resultado
    TEMPO_DINHEIRO_VOANDO:  3000,   // duração da chuva
    TOTAL_CONFETES:         80,
    TOTAL_DINHEIRO:         25,
    TOTAL_PARTICULAS:       25,

    CORES: [
        '#ff3366','#33ccff','#ffcc00','#66ff66',
        '#ff66ff','#ff8833','#33ffcc','#cc66ff',
        '#ff5555','#55aaff','#ff1493','#00ff7f',
    ],

    FRASES_PT: [
        "A carteira chora, mas a amizade agradece! 😂",
        "Hoje é você, amanhã... também pode ser! 🤷",
        "Beber é opcional, pagar não! 🍺",
        "O destino escolheu… aceite com dignidade! 👑",
        "Pelo menos a cerveja vai ser boa! 🍻",
        "Chora no caixa, ri na mesa! 😜",
        "Generosidade involuntária é a melhor! 💰",
        "O universo conspira contra seu bolso! 🌌",
        "Pix, crédito ou sofrimento? 💳",
        "Você não perdeu, só investiu em amizade! 🥲",
    ],
    FRASES_EN: [
        "Your wallet cries, but friendship thanks you! 😂",
        "Today it's you, tomorrow... also you! 🤷",
        "Drinking is optional, paying is not! 🍺",
        "Destiny has chosen... accept it! 👑",
        "At least the beer is cold! 🍻",
        "Cry at the register, laugh at the table! 😜",
        "Involuntary generosity is the best kind! 💰",
        "The universe conspires against your wallet! 🌌",
    ],

    EMOJIS_CONFETE: ['🎉','🎊','💸','🍺','🍻','✨','💰','🪙','⭐','🥳'],
    EMOJIS_DINHEIRO: ['💸','💵','💴','💶','💷','🪙','💰'],

    TEXTOS: {
        pt: {
            colocarDedo:  '👆 Coloquem os dedos na tela',
            faltam:       (n) => `👆 Faltam ${n} dedo(s)`,
            preparemSe:   '⏳ Preparem-se...',
            naoTirem:     '🔥 Não tirem o dedo!',
            quemSera:     '😱 QUEM SERÁ?!',
            resultado:    'PAGA A CONTA AÍ!',
            arregou:      'ALGUÉM ARREGOU!',
            arregouSub:   'Todos precisam manter o dedo na tela até o sorteio. Sem medo!',
        },
        en: {
            colocarDedo:  '👆 Place your fingers on the screen',
            faltam:       (n) => `👆 Need ${n} more finger(s)`,
            preparemSe:   '⏳ Get ready...',
            naoTirem:     "🔥 Don't lift your finger!",
            quemSera:     '😱 WHO WILL IT BE?!',
            resultado:    'YOU PAY THE BILL!',
            arregou:      'SOMEONE CHICKENED OUT!',
            arregouSub:   'Everyone must keep their finger on the screen until the draw. No fear!',
        },
    },
};

// ================================================================
//  REFERÊNCIAS DO DOM
// ================================================================
const DOM = {
    telaInicial:        document.getElementById('telaInicial'),
    telaToques:         document.getElementById('telaToques'),
    telaResultado:      document.getElementById('telaResultado'),
    telaErro:           document.getElementById('telaErro'),
    areaDeToque:        document.getElementById('areaDeToque'),
    mensagemToque:      document.getElementById('mensagemToque'),
    contadorJogadores:  document.getElementById('contadorJogadores'),
    barraContainer:     document.getElementById('barraContainer'),
    barraFill:          document.getElementById('barraFill'),
    bolinhaResultado:   document.getElementById('bolinhaResultado'),
    fraseMotivacional:  document.getElementById('fraseMotivacional'),
    emojiResultado:     document.getElementById('emojiResultado'),
    textoResultado:     document.getElementById('textoResultado'),
    textoErro:          document.getElementById('textoErro'),
    subtextoErro:       document.getElementById('subtextoErro'),
    fundoParticulas:    document.getElementById('fundoParticulas'),
    btnSom:             document.getElementById('btnSom'),
    btnIdioma:          document.getElementById('btnIdioma'),
};

// ================================================================
//  UTILITÁRIOS
// ================================================================
function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escolher(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function mostrarTela(el) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('visivel'));
    el.classList.add('visivel');
}

function criarFlash(classe) {
    const d = document.createElement('div');
    d.className = classe;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 800);
}

// ================================================================
//  SISTEMA DE SOM (Web Audio API — sem arquivos externos)
// ================================================================
const som = {
  ctx: null,
  ativo: false,
  
  inicializar() {
    // Criar contexto apenas quando usuário clicar
    if (!this.ctx) {
      this.ctx = new(window.AudioContext || window.webkitAudioContext)();
    }
    
    // Forçar ativação no iOS
    if (this.ctx.state !== 'running') {
      this.ctx.resume();
    }
  },
  
  criarOscilador(tipo, freqInicial, freqFinal, duracao, volume = 0.2) {
    if (!this.ativo || !this.ctx) return;
    
    const agora = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    o.type = tipo;
    o.frequency.setValueAtTime(freqInicial, agora);
    
    if (freqFinal) {
      o.frequency.exponentialRampToValueAtTime(freqFinal, agora + duracao);
    }
    
    g.gain.setValueAtTime(volume, agora);
    g.gain.exponentialRampToValueAtTime(0.001, agora + duracao);
    
    o.connect(g);
    g.connect(this.ctx.destination);
    
    o.start(agora);
    o.stop(agora + duracao);
  },
  
  pop() {
    this.criarOscilador('sine', 900, 400, 0.15, 0.25);
  },
  
  audioSuspense: null,

  tensao(duracao) {
    if (!this.ativo) return;
    
    // Usar arquivo suspense.mp3
    this.audioSuspense = new Audio('musics/suspense.mp3');
    this.audioSuspense.loop = false;
    this.audioSuspense.volume = 0.5;
    this.audioSuspense.play().catch(() => {});
  },

  pararSuspense() {
    if (this.audioSuspense) {
      this.audioSuspense.pause();
      this.audioSuspense.currentTime = 0;
      this.audioSuspense = null;
    }
  },
  
  fanfarra() {
    const notas = [523, 659, 784, 1047];
    notas.forEach((freq, i) => {
      setTimeout(() => {
        this.criarOscilador('square', freq, null, 0.4, 0.18);
      }, i * 150);
    });
  },
  
  risada() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.criarOscilador('triangle', 600 - i * 60, 200, 0.12, 0.12);
      }, 600 + i * 120);
    }
  },
  
  erro() {
    this.criarOscilador('square', 300, 100, 0.5, 0.2);
  },
  
  tick() {
    this.criarOscilador('sine', 1200, null, 0.06, 0.1);
  },

  pararTudo() {
    // Parar música de suspense
    this.pararSuspense();
    // Fecha o AudioContext atual para cortar todos os sons instantaneamente
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    // Recria o contexto para uso futuro
    if (this.ativo) {
      this.inicializar();
    }
  }
};

// Desbloquear áudio no primeiro toque em qualquer lugar (iOS)
// Necessário pois o iOS exige interação do usuário para AudioContext
['touchstart', 'touchend', 'click'].forEach(evt => {
    document.addEventListener(evt, function ativarAudio() {
        if (som.ativo) {
            som.inicializar();
        }
        document.removeEventListener(evt, ativarAudio);
    }, { once: true });
});

// ================================================================
//  EFEITOS VISUAIS
// ================================================================
const efeitos = {
    criarParticulasFundo() {
        DOM.fundoParticulas.innerHTML = '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i < CONFIG.TOTAL_PARTICULAS; i++) {
            const p = document.createElement('div');
            p.className = 'particula';
            const t = aleatorio(4, 18);
            const s = p.style;
            s.width = t + 'px';
            s.height = t + 'px';
            s.left = Math.random() * 100 + '%';
            s.animationDuration = aleatorio(10, 22) + 's';
            s.animationDelay = Math.random() * 12 + 's';
            frag.appendChild(p);
        }
        DOM.fundoParticulas.appendChild(frag);
    },

    lancarConfetes() {
        const frag = document.createDocumentFragment();
        const total = CONFIG.TOTAL_CONFETES;
        const batchSize = 10;
        let idx = 0;

        function criarLote() {
            const end = Math.min(idx + batchSize, total);
            for (let i = idx; i < end; i++) {
                const c = document.createElement('div');
                c.className = 'confete';
                const s = c.style;
                s.left = Math.random() * 100 + 'vw';
                s.animationDuration = (2.5 + Math.random() * 2) + 's';

                if (Math.random() > 0.5) {
                    c.textContent = escolher(CONFIG.EMOJIS_CONFETE);
                    s.fontSize = aleatorio(16, 28) + 'px';
                } else {
                    const sz = aleatorio(6, 12);
                    s.width = sz + 'px';
                    s.height = sz + 'px';
                    s.background = escolher(CONFIG.CORES);
                    s.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                }
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 5000);
            }
            idx = end;
            if (idx < total) {
                requestAnimationFrame(criarLote);
            }
        }
        requestAnimationFrame(criarLote);
    },

    lancarDinheiroVoando() {
        const total = CONFIG.TOTAL_DINHEIRO;
        for (let i = 0; i < total; i++) {
            setTimeout(() => {
                const d = document.createElement('div');
                d.className = 'dinheiro-voando';
                d.textContent = escolher(CONFIG.EMOJIS_DINHEIRO);
                const s = d.style;
                s.left = Math.random() * 100 + 'vw';
                s.top = '-40px';
                s.fontSize = aleatorio(24, 42) + 'px';
                s.animationDuration = (2 + Math.random() * 1.5) + 's';
                document.body.appendChild(d);
                setTimeout(() => d.remove(), 4000);
            }, i * 80);
        }
    },

    lancarCarteirasVoando() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.className = 'carteira-voando';
                c.textContent = '👛';
                const s = c.style;
                s.left = (20 + Math.random() * 60) + 'vw';
                s.bottom = '10vh';
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 3000);
            }, i * 600);
        }
    },

    mostrarNumeroCentral(texto) {
        const anterior = DOM.areaDeToque.querySelector('.numero-central');
        if (anterior) anterior.remove();
        const d = document.createElement('div');
        d.className = 'numero-central';
        d.textContent = texto;
        DOM.areaDeToque.appendChild(d);
        setTimeout(() => d.remove(), 1200);
    },
};

// ================================================================
//  BARRA DE PROGRESSO
// ================================================================
const barra = {
    rafId: null,
    inicio: 0,
    duracao: 0,

    iniciar(ms) {
        this.inicio = performance.now();
        this.duracao = ms;
        DOM.barraContainer.classList.add('ativa');
        DOM.barraFill.style.width = '0%';

        const atualizar = (agora) => {
            const pct = Math.min(((agora - this.inicio) / this.duracao) * 100, 100);
            DOM.barraFill.style.width = pct + '%';
            if (pct < 100) {
                this.rafId = requestAnimationFrame(atualizar);
            } else {
                this.parar();
            }
        };
        this.rafId = requestAnimationFrame(atualizar);
    },

    parar()  { 
        if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    },

    resetar() {
        this.parar();
        DOM.barraContainer.classList.remove('ativa');
        DOM.barraFill.style.width = '0%';
    },
};

// ================================================================
//  JOGO PRINCIPAL
// ================================================================
const jogo = {
    // ----- Estado -----
    jogadores: {},            // { touchId: { bolinha, cor, numero } }
    contagemIniciada: false,
    rodadaFinalizada: false,
    timerSorteio: null,
    timerTensao: null,
    proximoNumero: 0,
    somAtivo: false,
    idioma: 'pt',              // 'pt' ou 'en'

    /** Textos do idioma atual */
    t() { return CONFIG.TEXTOS[this.idioma]; },

    /** Frases do idioma atual */
    frases() { return this.idioma === 'pt' ? CONFIG.FRASES_PT : CONFIG.FRASES_EN; },

    // ----- ALTERNAR SOM -----
    alternarSom() {
        this.somAtivo = !this.somAtivo;
        som.ativo = this.somAtivo;
        DOM.btnSom.innerHTML = this.somAtivo ? '<i class="fa-solid fa-volume-high"></i> Som' : '<i class="fa-solid fa-volume-xmark"></i> Mudo';
        DOM.btnSom.classList.toggle('ativo', this.somAtivo);

        // Inicializar e desbloquear AudioContext no gesto do usuário (necessário para iOS)
        if (this.somAtivo) {
            som.inicializar();
        }

        // Salvar preferência
        localStorage.setItem('somAtivo', this.somAtivo);
    },

    // ----- ALTERNAR IDIOMA -----
    alternarIdioma() {
        this.idioma = this.idioma === 'pt' ? 'en' : 'pt';
        this.aplicarIdioma();

        // Salvar preferência
        localStorage.setItem('idioma', this.idioma);
    },

    // ----- APLICAR IDIOMA (visual) -----
    aplicarIdioma() {
        DOM.btnIdioma.textContent = this.idioma === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN';

        // Alternar todos os elementos com data-lang
        document.querySelectorAll('[data-lang="pt"]').forEach(el => {
            el.style.display = this.idioma === 'pt' ? '' : 'none';
        });
        document.querySelectorAll('[data-lang="en"]').forEach(el => {
            el.style.display = this.idioma === 'en' ? '' : 'none';
        });
    },

    // ----- INICIAR RODADA -----
    iniciarRodada() {
        som.inicializar();
        this.limparEstado();
        mostrarTela(DOM.telaToques);
        DOM.mensagemToque.textContent = this.t().colocarDedo;
        DOM.contadorJogadores.textContent = '0';
    },

    // ----- REINICIAR -----
    reiniciar() {
        som.inicializar();
        this.limparEstado();
        mostrarTela(DOM.telaToques);
        DOM.mensagemToque.textContent = this.t().colocarDedo;
        DOM.contadorJogadores.textContent = '0';
    },

    // ----- VOLTAR INÍCIO -----
    voltarInicio() {
        this.limparEstado();
        mostrarTela(DOM.telaInicial);
    },

    // ----- LIMPAR ESTADO -----
    limparEstado() {
        clearTimeout(this.timerSorteio);
        clearTimeout(this.timerTensao);
        barra.resetar();

        Object.values(this.jogadores).forEach(j => j.bolinha.remove());
        this.jogadores = {};

        DOM.areaDeToque.querySelectorAll('.numero-central').forEach(n => n.remove());

        // Limpar efeitos residuais
        document.querySelectorAll('.confete, .dinheiro-voando, .carteira-voando, .flash-branco, .flash-vermelho').forEach(e => e.remove());

        this.contagemIniciada = false;
        this.rodadaFinalizada = false;
        this.proximoNumero = 0;
    },

    // ----- TOTAL JOGADORES -----
    totalJogadores() {
        return Object.keys(this.jogadores).length;
    },

    // ----- ATUALIZAR UI -----
    atualizarUI() {
        const total = this.totalJogadores();
        DOM.contadorJogadores.textContent = total;

        if (total < CONFIG.MINIMO_JOGADORES) {
            DOM.mensagemToque.textContent = this.t().faltam(CONFIG.MINIMO_JOGADORES - total);
        } else if (!this.contagemIniciada) {
            DOM.mensagemToque.textContent = this.t().preparemSe;
        } else {
            DOM.mensagemToque.textContent = this.t().naoTirem;
        }
    },

    // ----- ADICIONAR JOGADOR -----
    adicionarJogador(toque) {
        if (this.rodadaFinalizada) return;

        this.proximoNumero++;
        const numero = this.proximoNumero;
        const cor = CONFIG.CORES[(numero - 1) % CONFIG.CORES.length];

        // Criar bolinha
        const bolinha = document.createElement('div');
        bolinha.className = 'bolinha bolinha-entrar';
        bolinha.style.background = cor;
        bolinha.style.color = cor;
        bolinha.style.boxShadow = `0 0 30px ${cor}, inset 0 0 20px rgba(255,255,255,0.15)`;
        const rect = DOM.areaDeToque.getBoundingClientRect();
        bolinha.style.left = (toque.clientX - rect.left) + 'px';
        bolinha.style.top = (toque.clientY - rect.top) + 'px';
        bolinha.textContent = numero;

        // Após entrada → pulsar
        bolinha.addEventListener('animationend', function handler() {
            bolinha.classList.remove('bolinha-entrar');
            bolinha.classList.add('bolinha-pulsar');
            bolinha.removeEventListener('animationend', handler);
        });

        DOM.areaDeToque.appendChild(bolinha);

        this.jogadores[toque.identifier] = { bolinha, cor, numero };

        // Som de pop
        som.pop();

        this.atualizarUI();

        // Iniciar contagem se atingiu mínimo
        if (this.totalJogadores() >= CONFIG.MINIMO_JOGADORES && !this.contagemIniciada) {
            this.iniciarContagem();
        }
    },

    // ----- MOVER JOGADOR -----
    moverJogador(toque) {
        const j = this.jogadores[toque.identifier];
        if (j) {
            const rect = DOM.areaDeToque.getBoundingClientRect();
            j.bolinha.style.left = (toque.clientX - rect.left) + 'px';
            j.bolinha.style.top = (toque.clientY - rect.top) + 'px';
        }
    },

    // ----- REMOVER JOGADOR -----
    removerJogador(toque) {
        const j = this.jogadores[toque.identifier];
        if (!j) return;
        j.bolinha.remove();
        delete this.jogadores[toque.identifier];
        this.atualizarUI();

        if (!this.rodadaFinalizada && this.contagemIniciada) {
            this.cancelarRodada();
        }
    },

    // ----- INICIAR CONTAGEM -----
    iniciarContagem() {
        this.contagemIniciada = true;
        this.atualizarUI();

        const tempoSuspense = CONFIG.TEMPO_MINIMO_SUSPENSE + Math.random() * CONFIG.TEMPO_EXTRA_ALEATORIO;
        barra.iniciar(tempoSuspense);

        // Som de tensão crescente
        som.tensao(tempoSuspense);

        // Mostrar contagem visual (números grandes)
        const segundos = Math.ceil(tempoSuspense / 1000);
        for (let i = segundos; i >= 1; i--) {
            const atraso = (segundos - i) * 1000;
            setTimeout(() => {
                if (!this.rodadaFinalizada && this.contagemIniciada) {
                    efeitos.mostrarNumeroCentral(i);
                    som.tick();
                }
            }, atraso);
        }

        this.timerSorteio = setTimeout(() => this.faseTensaoFinal(), tempoSuspense);
    },

    // ----- FASE DE TENSÃO FINAL (micro vibrações, piscar) -----
    faseTensaoFinal() {
        if (this.rodadaFinalizada) return;

        DOM.mensagemToque.textContent = this.t().quemSera;
        efeitos.mostrarNumeroCentral('?');

        // Todas as bolinhas entram em modo suspense
        Object.values(this.jogadores).forEach(j => {
            j.bolinha.classList.remove('bolinha-pulsar');
            j.bolinha.classList.add('bolinha-suspense');
        });

        // Vibrar dispositivo
        if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 80, 40, 150]);

        this.timerTensao = setTimeout(() => this.sortearPagador(), CONFIG.TEMPO_TENSAO_FINAL);
    },

    // ----- SORTEAR PAGADOR -----
    sortearPagador() {
        if (this.rodadaFinalizada) return;

        this.rodadaFinalizada = true;
        this.contagemIniciada = false;
        barra.parar();

        // Parar música de suspense imediatamente
        som.pararSuspense();

        const ids = Object.keys(this.jogadores);
        if (ids.length < CONFIG.MINIMO_JOGADORES) {
            this.cancelarRodada();
            return;
        }

        // Escolher aleatório
        const idSorteado = escolher(ids);
        const pagador = this.jogadores[idSorteado];

        // Flash branco dramático
        criarFlash('flash-branco');

        // Fanfarra + risada
        som.fanfarra();
        som.risada();

        // Vibrar forte
        if (navigator.vibrate) {
          navigator.vibrate(600);
        } else {
          criarFlash('flash-branco');
        }

        // Eliminar os outros
        ids.forEach(id => {
            if (id !== idSorteado) {
                const j = this.jogadores[id];
                j.bolinha.classList.remove('bolinha-suspense');
                j.bolinha.classList.add('bolinha-eliminada');
            }
        });

        // Zoom no vencedor
        pagador.bolinha.classList.remove('bolinha-suspense');
        pagador.bolinha.classList.add('bolinha-vencedora');

        // Transição para resultado
        setTimeout(() => this.mostrarResultado(pagador), CONFIG.TEMPO_TRANSICAO);
    },

    // ----- MOSTRAR RESULTADO -----
    mostrarResultado(pagador) {
        // Configurar bolinha de resultado
        DOM.bolinhaResultado.style.background = pagador.cor;
        DOM.bolinhaResultado.style.setProperty('--cor', pagador.cor);
        DOM.bolinhaResultado.textContent = pagador.numero;

        // Texto de resultado
        DOM.textoResultado.textContent = this.t().resultado;

        // Frase motivacional
        DOM.fraseMotivacional.textContent = escolher(this.frases());

        mostrarTela(DOM.telaResultado);

        // Efeitos visuais contínuos de 2-3s
        efeitos.lancarConfetes();
        efeitos.lancarDinheiroVoando();
        efeitos.lancarCarteirasVoando();

        // Segunda onda de confetes
        setTimeout(() => efeitos.lancarConfetes(), 1500);

        // Limpar bolinhas
        Object.values(this.jogadores).forEach(j => j.bolinha.remove());
        this.jogadores = {};
    },

    // ----- CANCELAR RODADA -----
    cancelarRodada() {
        clearTimeout(this.timerSorteio);
        clearTimeout(this.timerTensao);
        barra.resetar();

        this.contagemIniciada = false;
        this.rodadaFinalizada = true;

        // Parar todos os sons imediatamente (tensão, ticks, etc.)
        som.pararTudo();

        criarFlash('flash-vermelho');
        som.erro();

        if (navigator.vibrate) {
            navigator.vibrate([200, 80, 200]);
        } else {
            criarFlash('flash-vermelho');
        }

        // Textos de erro
        DOM.textoErro.textContent = this.t().arregou;
        DOM.subtextoErro.textContent = this.t().arregouSub;

        // Eliminar bolinhas e mostrar tela de erro imediatamente
        Object.values(this.jogadores).forEach(j => j.bolinha.remove());
        this.jogadores = {};
        mostrarTela(DOM.telaErro);
    },
};

// ================================================================
//  EVENTOS DE TOQUE
// ================================================================
DOM.areaDeToque.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) jogo.adicionarJogador(t);
}, { passive: false });

// Throttle touchmove a ~60fps
let touchMoveRafPending = false;
DOM.areaDeToque.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (touchMoveRafPending) return;
    touchMoveRafPending = true;
    const toques = Array.from(e.changedTouches);
    requestAnimationFrame(() => {
        for (const t of toques) jogo.moverJogador(t);
        touchMoveRafPending = false;
    });
}, { passive: false });

DOM.areaDeToque.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) jogo.removerJogador(t);
}, { passive: false });

DOM.areaDeToque.addEventListener('touchcancel', (e) => {
    for (const t of e.changedTouches) jogo.removerJogador(t);
}, { passive: true });

// ================================================================
//  INICIALIZAÇÃO
// ================================================================
efeitos.criarParticulasFundo();

// Restaurar preferências salvas
(function restaurarPreferencias() {
    const idiomaSalvo = localStorage.getItem('idioma');
    if (idiomaSalvo && (idiomaSalvo === 'pt' || idiomaSalvo === 'en')) {
        jogo.idioma = idiomaSalvo;
        jogo.aplicarIdioma();
    }

    const somSalvo = localStorage.getItem('somAtivo');
    if (somSalvo === 'true') {
        jogo.somAtivo = true;
        som.ativo = true;
        DOM.btnSom.innerHTML = '<i class="fa-solid fa-volume-high"></i> Som';
        DOM.btnSom.classList.add('ativo');
    }
})();