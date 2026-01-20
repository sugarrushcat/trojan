// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBmfbbuI02_UFirRXRGSmo0fU9ZekQ2Egw",
  authDomain: "trojan-stats.firebaseapp.com",
  projectId: "trojan-stats",
  storageBucket: "trojan-stats.firebasestorage.app",
  messagingSenderId: "826944316857",
  appId: "1:826944316857:web:143f3519b5b70134fb4268"
};

try {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    console.log("Firebase conectado.");
} catch (error) {
    console.error("Erro Firebase:", error);
}

const CONFIG = {
    WEBHOOKS: {
        ACOES: "https://discord.com/api/webhooks/1438189798849384560/lote5LpQxF80SDUZ3QdPOj2aHiQ7JtcJWKfTNxErKA0MjhDdQ86vruN74dnNUy0YMowD",
        VENDAS: "https://discord.com/api/webhooks/1434731757953093662/gElahX6G0yY6h-DVQx1RQ8wOu6IJGi-k2M20fEVOgNBy-WT3ztobwuPspLB6hLaeAy6z",
        LOGS: "https://discord.com/api/webhooks/1450610317813092427/n9N_MYFuMGdMtT2By1FbjKQ4OEy33le1711v55vpCdyGyFhZiLedJsRH9ImHANX0sQZY"
    },
    MAT_NAMES: ["Alumínio", "Cobre", "Materiais", "Projeto"],
    MAT_WEIGHTS: [0.01, 0.01, 0.01, 0.01]
};

const CATALOG = {
    'fn_five_seven': { name: "Fn Five Seven (PT)", category: "Pistolas", price: { min: 53000, max: 63600 }, weight: 1.5, cost: 10000, recipe: [17, 13, 26, 25] },
    'hk_p7m10': { name: "HK P7M10 (Fajuta)", category: "Pistolas", price: { min: 25000, max: 30000 }, weight: 1.0, cost: 5000, recipe: [17, 13, 26, 25] },
    'tec_9': { name: "Tec-9 (Sub)", category: "Submetralhadoras", price: { min: 90000, max: 110000 }, weight: 1.75, cost: 20000, recipe: [34, 26, 33, 25] },
    'uzi': { name: "Uzi (Sub)", category: "Submetralhadoras", price: { min: 120000, max: 140000 }, weight: 1.25, cost: 20000, recipe: [48, 39, 38, 35] },
    'mtar_21': { name: "Mtar-21 (Sub)", category: "Submetralhadoras", price: { min: 150000, max: 170000 }, weight: 5.0, cost: 25000, recipe: [51, 39, 38, 35] },
    'ak_74': { name: "Ak-74 (Fuzil)", category: "Fuzis", price: { min: 240000, max: 260000 }, weight: 8.0, cost: 35000, recipe: [85, 65, 40, 40] },
    'g36c': { name: "G36C (Fuzil)", category: "Fuzis", price: { min: 260000, max: 280000 }, weight: 8.0, cost: 30000, recipe: [85, 65, 40, 40] },
    'ak_compact': { name: "Ak Compact (Fuzil)", category: "Fuzis", price: { min: 190000, max: 210000 }, weight: 2.25, cost: 40000, recipe: [85, 70, 50, 40] },
    'mossberg': { name: "Mossberg 590", category: "Escopetas", price: { min: 260000, max: 280000 }, weight: 6.0, cost: 35000, recipe: [90, 75, 50, 40] }
};

const app = {
    state: {
        participants: new Set(),
        cart: [],
        selectedItemId: null,
        globalPriceType: 'max',
        tutorialActive: false,
        tutorialStepIndex: 0,
        isAdmin: false
    },
    dom: {},

    init() {
        this.cacheDOM();
        this.setDefaults();
        this.renderCatalog();
    },

    cacheDOM() {
        const ids = [
            'acao-tipo', 'acao-data', 'acao-hora', 'novo-participante', 'lista-participantes',
            'venda-vendedor', 'venda-faccao', 'venda-data', 'venda-hora', 'venda-preco', 'venda-qtd',
            'sales-catalog', 'price-controls', 'select-msg', 'cart-items', 'cart-summary-area',
            'cart-production-area', 'mats-list-display', 'sales-production-details',
            'total-mat-weight-display', 'total-prod-weight-display', 'toast-container',
            'tutorial-box', 'tut-title', 'tut-text', 'tut-progress', 'btn-tut-prev',
            'stat-total-vendas', 'stat-faturamento', 'stat-total-itens', 'stats-top-itens', 'stat-total-bruto'
        ];
        ids.forEach(id => this.dom[id] = document.getElementById(id));
    },

    setDefaults() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const dateISO = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().slice(0, 5);
        ['acao', 'venda'].forEach(prefix => {
            const d = document.getElementById(`${prefix}-data`);
            const t = document.getElementById(`${prefix}-hora`);
            if (d) d.value = dateISO;
            if (t) t.value = timeStr;
        });
    },

    toggleAdmin() {
        if (this.state.isAdmin) return;
        this.state.isAdmin = true;
        this.showToast("🔓 Modo Admin Ativado!");
        
        const nav = document.getElementById('nav-menu');
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.innerText = '📊 Estatísticas';
        btn.onclick = (e) => app.switchTab('estatisticas', e);
        nav.insertBefore(btn, nav.lastElementChild);
        this.loadDashboard();
    },

    renderCatalog() {
        const grouped = {};
        const categories = ["Pistolas", "Submetralhadoras", "Fuzis", "Escopetas", "Outros"];
        Object.entries(CATALOG).forEach(([id, item]) => {
            const cat = item.category || "Outros";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({ ...item, id });
        });

        let htmlBuffer = '';
        categories.forEach(cat => {
            if (grouped[cat]) {
                htmlBuffer += `<div class="catalog-category-title collapsed" onclick="app.toggleCategory(this)">${cat}</div><div class="grid-list-small hidden">`;
                grouped[cat].forEach(item => {
                    htmlBuffer += `<div class="catalog-item" data-id="${item.id}" onclick="app.selectItem('${item.id}')"><div class="cat-name">${item.name}</div><div class="cat-prices"><span class="price-tag min">R$ ${item.price.min/1000}k</span><span class="price-separator">|</span><span class="price-tag max">R$ ${item.price.max/1000}k</span></div></div>`;
                });
                htmlBuffer += `</div>`;
            }
        });
        const el = this.dom['sales-catalog'];
        if(el) el.innerHTML = htmlBuffer;
    },

    toggleCategory(el) {
        el.classList.toggle('collapsed');
        const content = el.nextElementSibling;
        if (content) content.classList.toggle('hidden');
    },

    updateGlobalPriceType(type) {
        this.state.globalPriceType = type;
        const typeName = type === 'min' ? 'Parceria' : 'Pista';
        if (this.state.selectedItemId) {
            this.dom['venda-preco'].value = CATALOG[this.state.selectedItemId].price[type];
        }
        if (this.state.cart.length > 0) {
            this.state.cart.forEach(item => {
                item.price = CATALOG[item.id].price[type];
                item.total = item.price * item.qtd;
            });
            this.renderCart();
            if (!this.dom['cart-production-area'].classList.contains('hidden')) {
                this.calculateCartProduction();
            }
            this.showToast(`Preços atualizados para ${typeName}`);
        }
    },

    validateInput(el) {
        let val = parseInt(el.value);
        if (isNaN(val) || val < 1) el.value = 1;
    },

    adjustSalesQtd(n) {
        const el = this.dom['venda-qtd'];
        let val = parseInt(el.value) || 1;
        val += n;
        if (val < 1) val = 1;
        el.value = val;
    },

    adjustCartQtd(idx, n) {
        const item = this.state.cart[idx];
        if (item.qtd + n < 1) return;
        item.qtd += n;
        item.total = item.price * item.qtd;
        this.renderCart();
        if (!this.dom['cart-production-area'].classList.contains('hidden')) {
            this.calculateCartProduction();
        }
    },

    selectItem(id) {
        this.state.selectedItemId = id;
        document.querySelectorAll('.catalog-item').forEach(el => el.classList.remove('selected'));
        const el = document.querySelector(`.catalog-item[data-id="${id}"]`);
        if(el) el.classList.add('selected');
        this.dom['price-controls'].classList.remove('hidden-controls');
        this.dom['select-msg'].style.display = 'none';
        this.dom['venda-preco'].value = CATALOG[id].price[this.state.globalPriceType];
        this.dom['venda-qtd'].value = 1;
    },

    addToCart() {
        const id = this.state.selectedItemId;
        if (!id) return this.showToast('Selecione uma arma', 'error');
        const price = parseFloat(this.dom['venda-preco'].value) || 0;
        const qtd = parseInt(this.dom['venda-qtd'].value) || 1;
        if (price === 0) return this.showToast('Preço inválido', 'error');
        const item = CATALOG[id];
        this.state.cart.push({
            id: id, name: item.name, category: item.category, price: price, qtd: qtd,
            total: price * qtd, weight: item.weight, cost: item.cost, recipe: item.recipe
        });
        this.renderCart();
        this.showToast('Item adicionado!');
        this.dom['cart-production-area'].classList.add('hidden');
    },

    renderCart() {
        const container = this.dom['cart-items'];
        if (this.state.cart.length === 0) {
            container.innerHTML = '<p class="empty-msg">Carrinho vazio</p>';
            this.dom['cart-summary-area'].innerHTML = '';
            return;
        }
        let html = '', grandTotal = 0, totalProdCost = 0;
        this.state.cart.forEach((item, idx) => {
            grandTotal += item.total;
            totalProdCost += (item.cost * item.qtd);
            html += `<div class="cart-item"><div class="cart-item-title">${item.name} <span class="badge-count-small">x${item.qtd}</span></div>
            <div class="cart-controls-row"><div class="qty-selector-sm"><button class="btn-qty-sm" onclick="app.adjustCartQtd(${idx}, -1)">-</button><span class="qty-display-sm">${item.qtd}</span><button class="btn-qty-sm" onclick="app.adjustCartQtd(${idx}, 1)">+</button></div><div class="cart-item-price">R$ ${item.total.toLocaleString('pt-BR')}</div></div><div class="btn-remove-item" onclick="app.removeFromCart(${idx})">&times;</div></div>`;
        });
        container.innerHTML = html;
        const faccaoNet = (grandTotal * 0.70) - totalProdCost;
        this.dom['cart-summary-area'].innerHTML = `<div class="cart-summary-box"><div class="summary-total">💸 Total: R$ ${grandTotal.toLocaleString('pt-BR')}</div><div class="summary-seller">💰 Vendedor (30%): R$ ${(grandTotal * 0.30).toLocaleString('pt-BR')}</div><div class="summary-faction">🔥 Facção: R$ ${faccaoNet.toLocaleString('pt-BR')}</div></div>`;
    },

    removeFromCart(idx) {
        this.state.cart.splice(idx, 1);
        this.renderCart();
        this.dom['cart-production-area'].classList.add('hidden');
    },

    clearCart() {
        this.state.cart = [];
        this.renderCart();
        this.dom['cart-production-area'].classList.add('hidden');
    },

    closeProduction() {
        this.dom['cart-production-area'].classList.add('hidden');
    },

    calculateCartProduction() {
        if (this.state.cart.length === 0) return this.showToast('Carrinho vazio!', 'error');
        
        const totalMats = [0, 0, 0]; // Alum, Cobre, Mat
        const projectTotals = {};
        
        let totalMatWeight = 0, totalProdWeight = 0, detailsHTML = "";
        
        this.state.cart.forEach(item => {
            totalProdWeight += item.weight * item.qtd;
            if (item.recipe) {
                const crafts = Math.ceil(item.qtd / 2);
                let itemMatsHTML = "";
                
                // Processar materiais padrão e projeto
                item.recipe.forEach((qtd, i) => {
                    const totalM = qtd * crafts;
                    if (totalM > 0) {
                        totalMatWeight += totalM * CONFIG.MAT_WEIGHTS[i];
                        
                        // Determinar nome do material ou projeto específico
                        let matName = CONFIG.MAT_NAMES[i];
                        if(i === 3) {
                            // Lógica para nomear o projeto baseado na categoria
                            if(item.category.includes("Pistola")) matName = "Projeto de Pistola";
                            else if(item.category.includes("Sub")) matName = "Projeto de Sub";
                            else if(item.category.includes("Fuzil")) matName = "Projeto de Fuzil";
                            else if(item.category.includes("Escopeta")) matName = "Projeto de Escopeta";
                            
                            if(!projectTotals[matName]) projectTotals[matName] = 0;
                            projectTotals[matName] += totalM;
                        } else {
                            totalMats[i] += totalM;
                        }
                        
                        itemMatsHTML += `<div class="mat-item-tiny"><span>${matName}:</span> <b>${totalM}</b></div>`;
                    }
                });
                
                detailsHTML += `<div class="detail-card-small"><div class="detail-header-small"><span class="detail-name">${item.name}</span><span class="badge-count-small">x${item.qtd}</span></div><div class="mats-grid-small">${itemMatsHTML}</div></div>`;
            }
        });

        // Gerar HTML dos materiais padrão
        let matsHtml = totalMats.map((t, i) => t > 0 ? `<div class="mat-tag-pill"><span>${CONFIG.MAT_NAMES[i]}:</span> <b>${t}</b></div>` : '').join('');
        
        // Adicionar HTML dos projetos separados
        for (const [pName, pQtd] of Object.entries(projectTotals)) {
            matsHtml += `<div class="mat-tag-pill project-tag"><span>${pName}:</span> <b>${pQtd}</b></div>`;
        }

        this.dom['mats-list-display'].innerHTML = matsHtml;
        this.dom['sales-production-details'].innerHTML = detailsHTML;
        this.dom['total-mat-weight-display'].innerText = totalMatWeight.toFixed(2).replace('.', ',') + ' kg';
        this.dom['total-prod-weight-display'].innerText = totalProdWeight.toFixed(2).replace('.', ',') + ' kg';

        const area = this.dom['cart-production-area'];
        area.classList.remove('hidden');
        area.scrollIntoView({ behavior: 'smooth' });
    },

    addParticipant() {
        const val = this.dom['novo-participante'].value.trim();
        if(!val) return;
        if(this.state.participants.has(val)) return;
        this.state.participants.add(val);
        this.renderParticipants();
        this.dom['novo-participante'].value = "";
    },
    removeParticipant(val) { this.state.participants.delete(val); this.renderParticipants(); },
    renderParticipants() {
        let html = '';
        this.state.participants.forEach(p => html += `<div class="chip">${p} <span onclick="app.removeParticipant('${p}')">&times;</span></div>`);
        this.dom['lista-participantes'].innerHTML = html;
    },
    handleEnterParticipant(e) { if(e.key === 'Enter') this.addParticipant(); },

    // --- ENVIOS ---
    async sendWebhook(url, payload, msg, cb) {
        try {
            await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if(msg) this.showToast(msg);
            if(cb) cb();
        } catch(e) { console.error(e); this.showToast("Erro no Discord", "error"); }
    },

    sendActionWebhook() {
        const tipo = this.dom['acao-tipo'].value;
        if(!tipo) return this.showToast("Selecione o local", "error");
        
        const resultado = document.querySelector('input[name="resultado"]:checked')?.value;
        if(!resultado) return this.showToast("Selecione o resultado", "error");

        const dataF = this.formatDate(this.dom['acao-data'].value);
        const hora = this.dom['acao-hora'].value;
        const parts = Array.from(this.state.participants).join('\n> • ');
        const color = resultado === 'Vitória' ? 3066993 : 15158332;

        const embed = {
            username: "TrojanHelper",
            embeds: [{
                title: `⚔️ Registro de Ação: ${tipo}`,
                color: color,
                fields: [
                    { name: "Resultado", value: `**${resultado.toUpperCase()}**`, inline: true },
                    { name: "Motivo", value: "Ação Blipada", inline: true },
                    { name: "Data/Hora", value: `${dataF} às ${hora}`, inline: false },
                    { name: "Participantes", value: parts ? `> • ${parts}` : "> Ninguém registrado" }
                ]
            }]
        };
        this.sendWebhook(CONFIG.WEBHOOKS.ACOES, embed, "Ação registrada!", () => {
            this.state.participants.clear();
            this.renderParticipants();
        });
    },

    async sendSaleWebhook() {
        if (this.state.cart.length === 0) return this.showToast('Carrinho vazio!', 'error');
        const dataInput = this.dom['venda-data'].value;
        const horaInput = this.dom['venda-hora'].value;
        
        const vendaData = {
            vendedor: this.dom['venda-vendedor'].value,
            faccao: this.dom['venda-faccao'].value,
            itens: this.state.cart,
            data: new Date(`${dataInput}T${horaInput}`),
            total: this.state.cart.reduce((a,b) => a + b.total, 0),
            lucroFaccao: this.state.cart.reduce((acc, item) => acc + (item.total * 0.70) - (item.cost * item.qtd), 0),
            custoProducao: this.state.cart.reduce((acc, item) => acc + (item.cost * item.qtd), 0)
        };
        
        try {
            await db.collection("vendas_trojan").add(vendaData);
            this.showToast("Venda salva!");
            this.clearCart();
            if(this.state.isAdmin) this.loadDashboard();
        } catch(e) { console.error(e); this.showToast("Erro ao salvar", "error"); }

        const embedMain = {
            username: "TrojanHelper",
            embeds: [{
                title: "📄 Venda Registrada",
                color: 5644438,
                fields: [
                    { name: "💼 Vendedor", value: vendaData.vendedor, inline: true },
                    { name: "🏛️ Facção", value: vendaData.faccao, inline: true },
                    { name: "📦 Itens", value: vendaData.itens.map(i => `${i.name} (${i.qtd}x)`).join('\n'), inline: false },
                    { name: "💸 Total", value: `R$ ${vendaData.total.toLocaleString('pt-BR')}`, inline: true }
                ],
                footer: { text: `Data: ${this.formatDate(dataInput)} ${horaInput}` }
            }]
        };
        this.sendWebhook(CONFIG.WEBHOOKS.VENDAS, embedMain);
    },

    async loadDashboard() {
        if (!this.dom['stat-total-vendas']) return;
        this.dom['stats-top-itens'].innerHTML = '<p class="text-muted italic">Carregando...</p>';

        try {
            const dataAtual = new Date();
            const inicioMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
            const snapshot = await db.collection("vendas_trojan").where("data", ">=", inicioMes).get();
            
            let totalVendas = 0, faturamentoFaccao = 0, totalBruto = 0, totalItens = 0, itemCounts = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                totalVendas++;
                faturamentoFaccao += (data.lucroFaccao || 0);
                totalBruto += (data.total || 0);
                if (data.itens) {
                    data.itens.forEach(item => {
                        totalItens += item.qtd;
                        itemCounts[item.nome] = (itemCounts[item.nome] || 0) + item.qtd;
                    });
                }
            });

            this.dom['stat-total-vendas'].innerText = totalVendas;
            this.dom['stat-faturamento'].innerText = `R$ ${faturamentoFaccao.toLocaleString('pt-BR')}`;
            this.dom['stat-total-itens'].innerText = totalItens;
            if (this.dom['stat-total-bruto']) this.dom['stat-total-bruto'].innerText = `R$ ${totalBruto.toLocaleString('pt-BR')}`;

            const sortedItems = Object.entries(itemCounts).sort(([,a], [,b]) => b - a).slice(0, 5);
            let topHtml = sortedItems.length ? sortedItems.map(([n, q]) => `<div class="top-item"><span>${n}</span><span class="top-item-qtd">${q}</span></div>`).join('') : '<p class="text-muted italic text-center">Nenhuma venda.</p>';
            this.dom['stats-top-itens'].innerHTML = topHtml;
        } catch (e) {
            console.error("Erro Dashboard:", e);
            this.dom['stats-top-itens'].innerHTML = '<p class="error">Erro ao carregar.</p>';
        }
    },

    switchTab(tabId, event) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (event) event.currentTarget.classList.add('active');
        if (tabId === 'estatisticas' && this.state.isAdmin) this.loadDashboard();
    },

    startTutorial() { this.state.tutorialActive = true; this.state.tutorialStepIndex = 0; this.dom['tutorial-box'].classList.remove('hidden'); this.renderTutorialStep(); },
    endTutorial() { this.state.tutorialActive = false; this.dom['tutorial-box'].classList.add('hidden'); this.cleanHighlights(); },
    cleanHighlights() { document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight')); document.querySelectorAll('.tutorial-active-parent').forEach(el => el.classList.remove('tutorial-active-parent')); },
    
    getTutorialSteps() {
        return [
            {
                tab: 'vendas',
                elementId: 'area-vendedor-info',
                title: "1. Identificação",
                text: "Comece preenchendo o seu nome e a facção do cliente."
            },
            {
                tab: 'vendas',
                elementId: 'area-tabela-preco',
                title: "2. Tabela de Preços",
                text: "Escolha entre preço de <b>Parceria</b> ou <b>Pista</b>. O sistema atualiza os valores automaticamente."
            },
            {
                tab: 'vendas',
                elementId: 'sales-catalog',
                title: "3. Catálogo",
                text: "Clique nos itens para selecionar. Defina a quantidade e adicione ao carrinho."
            },
            {
                tab: 'vendas',
                elementId: 'area-carrinho',
                title: "4. Carrinho & Envio",
                text: "Revise os itens e clique em <b>Finalizar</b> para enviar o log para o Discord."
            },
            {
                tab: 'vendas',
                elementId: 'area-producao',
                title: "5. Calculadora de Produção",
                text: "Descubra exatamente quantos materiais (cobre, alumínio, etc.) você precisa para fabricar o pedido."
            },
            {
                tab: 'acoes',
                elementId: 'acoes',
                title: "6. Registro de Ações",
                text: "Registre vitórias ou derrotas em PvP e ações da facção."
            },
            {
                tab: 'vendas',
                elementId: 'btn-admin-secret',
                title: "7. Modo Admin",
                text: "Clique em <b>Sistema Online</b> para revelar a aba secreta de <b>Estatísticas</b>."
            }
        ];
    },

    prevTutorialStep() { if(this.state.tutorialStepIndex > 0) { this.cleanHighlights(); this.state.tutorialStepIndex--; this.renderTutorialStep(); } },
    nextTutorialStep() { const s = this.getTutorialSteps(); this.cleanHighlights(); this.state.tutorialStepIndex++; if(this.state.tutorialStepIndex >= s.length) { this.endTutorial(); this.showToast("Fim!"); } else this.renderTutorialStep(); },
    renderTutorialStep() { 
        const s = this.getTutorialSteps(); 
        const step = s[this.state.tutorialStepIndex]; 
        
        this.switchTab(step.tab); 
        
        this.dom['tut-title'].innerText = step.title; 
        this.dom['tut-text'].innerHTML = step.text; 
        this.dom['tut-progress'].innerText = `${this.state.tutorialStepIndex + 1}/${s.length}`; 
        this.dom['btn-tut-prev'].disabled = (this.state.tutorialStepIndex === 0); 
        
        setTimeout(() => { 
            const el = document.getElementById(step.elementId); 
            if(el) { 
                el.classList.add('tutorial-highlight'); 
                const p = el.closest('.card'); 
                if(p) p.classList.add('tutorial-active-parent'); 
                el.scrollIntoView({behavior:'smooth',block:'center'}); 
            } 
        }, 400); 
    },
    
    copyAdText(el) { navigator.clipboard.writeText(el.innerText).then(() => this.showToast("Copiado!")); },
    showToast(msg, type='success') { const t = document.createElement('div'); t.className=`toast ${type}`; t.innerText=msg; this.dom['toast-container'].appendChild(t); setTimeout(()=>t.remove(), 3000); },
    formatDate(d) { if(!d) return ''; const [y,m,d2] = d.split('-'); return `${d2}/${m}/${y}`; }
};

document.addEventListener('DOMContentLoaded', () => app.init());
