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
    'fn_five_seven': { 
        name: "Fn Five Seven (PT)", category: "Pistolas", 
        price: { min: 53000, max: 63600 }, weight: 1.5, cost: 10000,
        recipe: [17, 13, 26, 25] 
    },
    'hk_p7m10': { 
        name: "HK P7M10 (Fajuta)", category: "Pistolas", 
        price: { min: 25000, max: 30000 }, weight: 1.0, cost: 5000,
        recipe: [17, 13, 26, 25] 
    },
    'tec_9': { 
        name: "Tec-9 (Sub)", category: "Submetralhadoras", 
        price: { min: 90000, max: 110000 }, weight: 1.75, cost: 20000,
        recipe: [34, 26, 33, 25] 
    },
    'uzi': { 
        name: "Uzi (Sub)", category: "Submetralhadoras", 
        price: { min: 120000, max: 140000 }, weight: 1.25, cost: 20000,
        recipe: [48, 39, 38, 35] 
    },
    'mtar_21': { 
        name: "Mtar-21 (Sub)", category: "Submetralhadoras", 
        price: { min: 150000, max: 170000 }, weight: 5.0, cost: 25000,
        recipe: [51, 39, 38, 35] 
    },
    'ak_74': { 
        name: "Ak-74 (Fuzil)", category: "Fuzis", 
        price: { min: 240000, max: 260000 }, weight: 8.0, cost: 35000,
        recipe: [85, 65, 40, 40] 
    },
    'g36c': { 
        name: "G36C (Fuzil)", category: "Fuzis", 
        price: { min: 260000, max: 280000 }, weight: 8.0, cost: 30000,
        recipe: [85, 65, 40, 40] 
    },
    'ak_compact': { 
        name: "Ak Compact (Fuzil)", category: "Fuzis", 
        price: { min: 190000, max: 210000 }, weight: 2.25, cost: 40000,
        recipe: [85, 70, 50, 40] 
    },
    'mossberg': { 
        name: "Mossberg 590", category: "Escopetas", 
        price: { min: 260000, max: 280000 }, weight: 6.0, cost: 35000,
        recipe: [90, 75, 50, 40] 
    }
};

const app = {
    state: {
        participants: new Set(),
        cart: [],
        selectedItemId: null,
        globalPriceType: 'max',
        tutorialActive: false,
        tutorialStepIndex: 0
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
            'tutorial-box', 'tut-title', 'tut-text', 'tut-progress', 'btn-tut-prev'
        ];
        ids.forEach(id => this.dom[id] = document.getElementById(id));
    },

    setDefaults() {
        const now = new Date();
        const dateISO = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().slice(0, 5);
        ['acao', 'venda'].forEach(prefix => {
            const d = document.getElementById(`${prefix}-data`);
            const t = document.getElementById(`${prefix}-hora`);
            if (d) d.value = dateISO;
            if (t) t.value = timeStr;
        });
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
                htmlBuffer += `
                <div class="catalog-category-title collapsed" onclick="app.toggleCategory(this)">
                    ${cat}
                </div>
                <div class="grid-list-small hidden">`;
                
                grouped[cat].forEach(item => {
                    htmlBuffer += `
                    <div class="catalog-item" data-id="${item.id}" onclick="app.selectItem('${item.id}')">
                        <div class="cat-name">${item.name}</div>
                        <div class="cat-prices">
                            <span class="price-tag min">R$ ${item.price.min/1000}k</span>
                            <span class="price-separator">|</span>
                            <span class="price-tag max">R$ ${item.price.max/1000}k</span>
                        </div>
                    </div>`;
                });
                htmlBuffer += `</div>`;
            }
        });
        this.dom['sales-catalog'].innerHTML = htmlBuffer;
    },

    toggleCategory(headerElement) {
        headerElement.classList.toggle('collapsed');
        const contentDiv = headerElement.nextElementSibling;
        if (contentDiv) {
            contentDiv.classList.toggle('hidden');
        }
    },

    updateGlobalPriceType(type) {
        this.state.globalPriceType = type;
        const typeName = type === 'min' ? 'Parceria' : 'Pista';

        if (this.state.selectedItemId) {
            const item = CATALOG[this.state.selectedItemId];
            this.dom['venda-preco'].value = item.price[type];
        }

        if (this.state.cart.length > 0) {
            this.state.cart.forEach(item => {
                const cat = CATALOG[item.id];
                item.price = cat.price[type];
                item.total = item.price * item.qtd;
            });
            
            this.renderCart();
            
            if (!this.dom['cart-production-area'].classList.contains('hidden')) {
                this.calculateCartProduction();
            }
            
            this.showToast(`Tudo atualizado para ${typeName}`);
        }
    },

    validateInput(inputElement) {
        let val = parseInt(inputElement.value);
        if (isNaN(val) || val < 1) {
            inputElement.value = 1;
        }
    },

    adjustSalesQtd(amount) {
        const input = this.dom['venda-qtd'];
        let val = parseInt(input.value) || 1;
        val += amount;
        if (val < 1) val = 1;
        input.value = val;
    },

    adjustCartQtd(index, amount) {
        const item = this.state.cart[index];
        const newQtd = item.qtd + amount;
        
        if (newQtd < 1) return;

        item.qtd = newQtd;
        item.total = item.price * item.qtd;
        
        this.renderCart();
        
        if (!this.dom['cart-production-area'].classList.contains('hidden')) {
            this.calculateCartProduction();
        }
    },

    selectItem(id) {
        this.state.selectedItemId = id;
        document.querySelectorAll('.catalog-item').forEach(el => el.classList.remove('selected'));
        const selectedEl = document.querySelector(`.catalog-item[data-id="${id}"]`);
        if(selectedEl) selectedEl.classList.add('selected');

        this.dom['price-controls'].classList.remove('hidden-controls');
        this.dom['select-msg'].style.display = 'none';
        
        const item = CATALOG[id];
        this.dom['venda-preco'].value = item.price[this.state.globalPriceType];
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
            id: id,
            name: item.name,
            price: price, 
            qtd: qtd,
            total: price * qtd,
            weight: item.weight,
            cost: item.cost,
            recipe: item.recipe
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
            document.body.classList.remove('cart-active');
            return;
        }
        document.body.classList.add('cart-active');

        let html = '';
        let grandTotal = 0;
        let totalProdCost = 0;

        this.state.cart.forEach((item, idx) => {
            grandTotal += item.total;
            totalProdCost += (item.cost * item.qtd);
            html += `
                <div class="cart-item">
                    <div class="cart-item-title">
                        ${item.name}
                        <span class="badge-count-small">x${item.qtd}</span>
                    </div>
                    <div class="cart-controls-row">
                        <div class="qty-selector-sm">
                            <button class="btn-qty-sm" onclick="app.adjustCartQtd(${idx}, -1)">-</button>
                            <span class="qty-display-sm">${item.qtd}</span>
                            <button class="btn-qty-sm" onclick="app.adjustCartQtd(${idx}, 1)">+</button>
                        </div>
                        <div class="cart-item-price">R$ ${item.total.toLocaleString('pt-BR')}</div>
                    </div>
                    <div class="btn-remove-item" onclick="app.removeFromCart(${idx})">&times;</div>
                </div>`;
        });

        container.innerHTML = html;
        const faccaoNet = (grandTotal * 0.70) - totalProdCost;

        this.dom['cart-summary-area'].innerHTML = `
            <div class="cart-summary-box">
                <div class="summary-total">💸 Total: R$ ${grandTotal.toLocaleString('pt-BR')}</div>
                ${totalProdCost > 0 ? `<div class="text-sub">🔨 Custo Prod.: R$ ${totalProdCost.toLocaleString('pt-BR')}</div>` : ''}
                <div class="summary-seller">💰 Vendedor (30%): R$ ${(grandTotal * 0.30).toLocaleString('pt-BR')}</div>
                <div class="summary-faction">🔥 Facção: R$ ${faccaoNet.toLocaleString('pt-BR')}</div>
            </div>`;
    },

    removeFromCart(index) {
        this.state.cart.splice(index, 1);
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

        const totalMats = [0, 0, 0, 0]; 
        const specificProjects = []; 
        let totalMatWeight = 0;
        let totalProdWeight = 0;
        let detailsHTML = "";

        this.state.cart.forEach(item => {
            totalProdWeight += item.weight * item.qtd;
            
            if (item.recipe) {
                const crafts = Math.ceil(item.qtd / 2);
                let itemMatsHTML = "";
                
                item.recipe.forEach((qtd, i) => {
                    const totalM = qtd * crafts;
                    if (i === 3 && totalM > 0) {
                        specificProjects.push({ name: `Proj. ${item.name}`, qtd: totalM });
                        totalMatWeight += totalM * CONFIG.MAT_WEIGHTS[i];
                    } else {
                        totalMats[i] += totalM;
                        totalMatWeight += totalM * CONFIG.MAT_WEIGHTS[i];
                    }

                    if (totalM > 0) {
                        itemMatsHTML += `<div class="mat-item-tiny"><span>${CONFIG.MAT_NAMES[i]}:</span> <b>${totalM}</b></div>`;
                    }
                });

                detailsHTML += `
                <div class="detail-card-small">
                    <div class="detail-header-small"><span class="detail-name">${item.name}</span><span class="badge-count-small">x${item.qtd}</span></div>
                    <div class="mats-grid-small">${itemMatsHTML}</div>
                </div>`;
            }
        });

        let matsHtml = totalMats.map((t, i) => {
            if (i === 3) return ''; 
            return t > 0 ? `<div class="mat-tag-pill"><span>${CONFIG.MAT_NAMES[i]}:</span> <b>${t}</b></div>` : '';
        }).join('');

        specificProjects.forEach(proj => {
            matsHtml += `<div class="mat-tag-pill project-tag"><span>${proj.name}:</span> <b>${proj.qtd}</b></div>`;
        });

        this.dom['mats-list-display'].innerHTML = matsHtml;
        this.dom['sales-production-details'].innerHTML = detailsHTML;
        this.dom['total-mat-weight-display'].innerText = totalMatWeight.toFixed(2).replace('.', ',') + ' kg';
        this.dom['total-prod-weight-display'].innerText = totalProdWeight.toFixed(2).replace('.', ',') + ' kg';

        const area = this.dom['cart-production-area'];
        area.classList.remove('hidden');
        area.scrollIntoView({ behavior: 'smooth' });
    },

    addParticipant() {
        const input = this.dom['novo-participante'];
        const name = input.value.trim();
        if (!name) return this.showToast('Digite um nome', 'error');
        if (this.state.participants.has(name)) return this.showToast('Já adicionado', 'error');
        
        this.state.participants.add(name);
        this.renderParticipants();
        input.value = "";
        input.focus();
    },

    removeParticipant(name) {
        this.state.participants.delete(name);
        this.renderParticipants();
    },

    renderParticipants() {
        const fragment = document.createDocumentFragment();
        this.state.participants.forEach(p => {
            const div = document.createElement('div');
            div.className = 'chip';
            div.innerHTML = `${p} <span onclick="app.removeParticipant('${p}')">&times;</span>`;
            fragment.appendChild(div);
        });
        const container = this.dom['lista-participantes'];
        container.innerHTML = '';
        container.appendChild(fragment);
    },

    async sendWebhook(url, payload, successMessage, callback) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                if(successMessage) this.showToast(successMessage);
                if(callback) callback();
            } else {
                throw new Error("Discord API Error");
            }
        } catch (err) {
            console.error(err);
            this.showToast("Erro ao enviar para o Discord", "error");
        }
    },

    sendActionWebhook() {
        const tipo = this.dom['acao-tipo'].value;
        const resultadoEl = document.querySelector('input[name="resultado"]:checked');
        if(!tipo || !resultadoEl) return this.showToast('Preencha o local e o resultado!', 'error');
        
        const resultado = resultadoEl.value;
        const hora = this.dom['acao-hora'].value;
        const dataF = this.formatDate(this.dom['acao-data'].value);
        const parts = Array.from(this.state.participants).join('\n> • ');
        const color = resultado === 'Vitória' ? 3066993 : 15158332;

        const embedMain = {
            username: "TrojanHelper",
            embeds: [{
                title: `⚔️ Registro de Ação: ${tipo}`,
                color: color,
                fields: [
                    { name: "Resultado", value: `**${resultado.toUpperCase()}**`, inline: true },
                    { name: "Motivo", value: "Ação Blipada", inline: true },
                    { name: "Data/Hora", value: `${dataF} às ${hora}`, inline: false },
                    { name: "Participantes", value: parts ? `> • ${parts}` : "> Ninguém registrado" }
                ],
                footer: { text: "Sistema de Gestão TRJ" }
            }]
        };

        const embedLog = {
            username: "Trojan Log",
            embeds: [{
                color: color,
                description: `**Ação:** ${tipo}\n**Data:** ${dataF}\n**Hora:** ${hora}\n**Motivo:** Ação Blipada\n**Resultado:** ${resultado}`
            }]
        };

        this.sendWebhook(CONFIG.WEBHOOKS.ACOES, embedMain, "Ação registrada!", () => {
            this.dom['novo-participante'].value = '';
            this.state.participants.clear();
            this.renderParticipants();
        });
        this.sendWebhook(CONFIG.WEBHOOKS.LOGS, embedLog);
    },

    sendSaleWebhook() {
        if (this.state.cart.length === 0) return this.showToast('Carrinho vazio!', 'error');
        const vendedor = this.dom['venda-vendedor'].value.trim();
        const faccao = this.dom['venda-faccao'].value.trim();
        if (!vendedor || !faccao) return this.showToast('Preencha Vendedor e Facção!', 'error');

        let grandTotal = 0, totalProdCost = 0;
        let itemsDesc = "";
        const itemsLogStr = [];

        this.state.cart.forEach(i => {
            grandTotal += i.total;
            totalProdCost += (i.cost * i.qtd);
            itemsDesc += `• ${i.name} — ${i.qtd}x — R$ ${i.total.toLocaleString('pt-BR')}\n`;
            itemsLogStr.push(`${i.name} (${i.qtd}x)`);
        });

        const faccaoNet = (grandTotal * 0.70) - totalProdCost;
        const timeStr = this.dom['venda-hora'].value;
        const dateStr = this.formatDate(this.dom['venda-data'].value);

        const embedMain = {
            username: "TrojanHelper",
            embeds: [{
                title: "📄 Venda Registrada",
                color: 5644438,
                fields: [
                    { name: "💼 Vendedor", value: vendedor, inline: true },
                    { name: "🏛️ Facção Compradora", value: faccao, inline: true },
                    { name: "📦 Itens", value: itemsDesc, inline: false },
                    { name: "💸 Total Venda", value: `R$ ${grandTotal.toLocaleString('pt-BR')}`, inline: true },
                    { name: "🔨 Custo Produção", value: `R$ ${totalProdCost.toLocaleString('pt-BR')}`, inline: true },
                    { name: "💰 Vendedor (30%)", value: `R$ ${(grandTotal * 0.30).toLocaleString('pt-BR')}`, inline: true },
                    { name: "🔥 Facção (Liq.)", value: `**R$ ${faccaoNet.toLocaleString('pt-BR')}**`, inline: false }
                ],
                footer: { text: `Data: ${dateStr} às ${timeStr}` }
            }]
        };

        const embedLog = {
            username: "Trojan Log",
            embeds: [{
                color: 5644438,
                description: `**Venda:** ${itemsLogStr.join(', ')}\n**Data:** ${dateStr}\n**Hora:** ${timeStr}\n**Família:** ${faccao}`
            }]
        };

        this.sendWebhook(CONFIG.WEBHOOKS.VENDAS, embedMain, "Venda enviada!", () => {
            this.clearCart();
            this.dom['venda-vendedor'].value = '';
            this.dom['venda-faccao'].value = '';
        });
        this.sendWebhook(CONFIG.WEBHOOKS.LOGS, embedLog);
    },

    switchTab(tabId, event) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (event) event.currentTarget.classList.add('active');
    },

    formatDate(rawDate) {
        if (!rawDate || !rawDate.includes('-')) return rawDate;
        const [ano, mes, dia] = rawDate.split('-');
        return `${dia}/${mes}/${ano}`;
    },

    showToast(message, type = 'success') {
        const container = this.dom['toast-container'];
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> ${message}`;
        container.appendChild(toast);
        requestAnimationFrame(() => {
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        });
    },

    handleEnterParticipant(e) { 
        if (e.key === 'Enter') this.addParticipant(); 
    },

    copyAdText(element) {
        const text = element.innerText;
        navigator.clipboard.writeText(text)
            .then(() => this.showToast("Anúncio copiado!"))
            .catch(() => this.fallbackCopyText(text));
    },

    fallbackCopyText(text) {
        const textArea = document.createElement("textarea");
        textArea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            this.showToast("Anúncio copiado!");
        } catch (err) {
            this.showToast("Erro ao copiar", "error");
        }
        document.body.removeChild(textArea);
    },

    startTutorial() {
        this.state.tutorialActive = true;
        this.state.tutorialStepIndex = 0;
        this.dom['tutorial-box'].classList.remove('hidden');
        document.body.classList.add('tutorial-active');
        this.renderTutorialStep();
    },

    endTutorial() {
        this.state.tutorialActive = false;
        this.dom['tutorial-box'].classList.add('hidden');
        document.body.classList.remove('tutorial-active');
        this.cleanHighlights();
    },

    cleanHighlights() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
        document.querySelectorAll('.tutorial-active-parent').forEach(el => el.classList.remove('tutorial-active-parent'));
    },

    getTutorialSteps() {
        return [
            {
                tab: 'vendas',
                elementId: 'area-vendedor-info',
                title: "1. Identificação",
                text: "Comece preenchendo o seu nome em <b>Vendedor</b> e o nome da família que está comprando em <b>Facção</b>."
            },
            {
                tab: 'vendas',
                elementId: 'area-tabela-preco',
                title: "2. Tabela de Preços",
                text: "Defina se o preço será <b>Parceria</b> ou <b>Pista</b>. Ao mudar aqui, o sistema atualiza automaticamente todas as armas, inclusive as do carrinho!"
            },
            {
                tab: 'vendas',
                elementId: 'sales-catalog',
                title: "3. Catálogo",
                text: "Selecione a arma desejada e a quantidade. Depois clique em <b>Adicionar ao Carrinho</b>."
            },
            {
                tab: 'vendas',
                elementId: 'area-carrinho',
                title: "4. Carrinho",
                text: "Confira o pedido aqui. Você pode ajustar quantidades com os botões <b>+</b> e <b>-</b>."
            },
            {
                tab: 'vendas',
                elementId: 'area-producao',
                title: "5. Produção",
                text: "Clique em <b>Calcular Produção</b> para ver a lista exata de materiais e projetos necessários."
            },
            {
                tab: 'acoes',
                elementId: 'acao-tipo',
                title: "6. Ações",
                text: "Nesta aba você registra PVP e Ações. Selecione o local e o resultado."
            },
            {
                tab: 'acoes',
                elementId: 'group-participantes',
                title: "7. Participantes",
                text: "Digite o nome de quem foi na ação e aperte Enter."
            }
        ];
    },

    prevTutorialStep() {
        if (this.state.tutorialStepIndex > 0) {
            this.cleanHighlights();
            this.state.tutorialStepIndex--;
            this.renderTutorialStep();
        }
    },

    nextTutorialStep() {
        const steps = this.getTutorialSteps();
        this.cleanHighlights();
        this.state.tutorialStepIndex++;

        if (this.state.tutorialStepIndex >= steps.length) {
            this.endTutorial();
            this.showToast("Tutorial concluído! 💜");
        } else {
            this.renderTutorialStep();
        }
    },

    renderTutorialStep() {
        const steps = this.getTutorialSteps();
        const step = steps[this.state.tutorialStepIndex];
        const totalSteps = steps.length;

        this.switchTab(step.tab);

        this.dom['tut-title'].innerText = step.title;
        this.dom['tut-text'].innerHTML = step.text;
        this.dom['tut-progress'].innerText = `${this.state.tutorialStepIndex + 1}/${totalSteps}`;
        this.dom['btn-tut-prev'].disabled = (this.state.tutorialStepIndex === 0);

        setTimeout(() => {
            const el = document.getElementById(step.elementId);
            if (el) {
                el.classList.add('tutorial-highlight');
                const parentCard = el.closest('.card');
                if (parentCard) {
                    parentCard.classList.add('tutorial-active-parent');
                }
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }, 400);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
