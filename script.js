const WEBHOOK_ACOES = "https://discord.com/api/webhooks/1438189798849384560/lote5LpQxF80SDUZ3QdPOj2aHiQ7JtcJWKfTNxErKA0MjhDdQ86vruN74dnNUy0YMowD";
const WEBHOOK_VENDAS = "https://discord.com/api/webhooks/1434731757953093662/gElahX6G0yY6h-DVQx1RQ8wOu6IJGi-k2M20fEVOgNBy-WT3ztobwuPspLB6hLaeAy6z";
const WEBHOOK_SECUNDARIA = "https://discord.com/api/webhooks/1450610317813092427/n9N_MYFuMGdMtT2By1FbjKQ4OEy33le1711v55vpCdyGyFhZiLedJsRH9ImHANX0sQZY"; 

const app = {
    data: {
        participants: new Set(),
        cart: [],
        currentSelection: null,
        products: [ 
            { name: "Fn Five Seven (PT)", category: "Pistolas", min: 53000,  max: 63600,  weight: 1.5,  cost: 10000 },
            { name: "HK P7M10 (Fajuta)",  category: "Pistolas", min: 25000,  max: 30000,  weight: 1.0,  cost: 5000 },
            { name: "Tec-9 (Sub)",        category: "Submetralhadoras", min: 90000,  max: 110000, weight: 1.75, cost: 20000 },
            { name: "Uzi (Sub)",          category: "Submetralhadoras", min: 120000, max: 140000, weight: 1.25, cost: 20000 },
            { name: "Mtar-21 (Sub)",      category: "Submetralhadoras", min: 150000, max: 170000, weight: 5.0,  cost: 25000 },
            { name: "Ak-74 (Fuzil)",      category: "Fuzis", min: 240000, max: 260000, weight: 8.0,  cost: 35000 },
            { name: "G36C (Fuzil)",       category: "Fuzis", min: 260000, max: 280000, weight: 8.0,  cost: 30000 },
            { name: "Ak Compact (Fuzil)", category: "Fuzis", min: 190000, max: 210000, weight: 2.25, cost: 40000 }, 
            { name: "Mossberg 590",       category: "Escopetas", min: 260000, max: 280000, weight: 6.0,  cost: 35000 }
        ],
        recipes: [
            { name: "Fn Five Seven",   category: "Pistolas", mats: [17, 13, 26, 25], weight: 1.5,  cost: 20000 },
            { name: "HK P7M10",        category: "Pistolas", mats: [17, 13, 26, 25], weight: 1.0,  cost: 10000 },
            { name: "Tec-9",           category: "Submetralhadoras", mats: [34, 26, 33, 25], weight: 1.75, cost: 40000 },
            { name: "Uzi",             category: "Submetralhadoras", mats: [48, 39, 38, 35], weight: 1.25, cost: 40000 },
            { name: "Mtar-21",         category: "Submetralhadoras", mats: [51, 39, 38, 35], weight: 5.0,  cost: 50000 },
            { name: "Ak-74",           category: "Fuzis", mats: [85, 65, 40, 40], weight: 8.0,  cost: 70000 },
            { name: "G36C",            category: "Fuzis", mats: [85, 65, 40, 40], weight: 8.0,  cost: 60000 },
            { name: "Ak Compact",      category: "Fuzis", mats: [85, 70, 50, 40], weight: 2.25, cost: 80000 },
            { name: "Mossberg 590",    category: "Escopetas", mats: [90, 75, 50, 40], weight: 6.0,  cost: 70000 },
        ],
        matNames: ["Alumínio", "Cobre", "Materiais", "Projeto"],
        matWeights: [0.01, 0.01, 0.01, 0.01] 
    },

    init: function() {
        this.setDateTimeInputs('acao');
        this.setDateTimeInputs('venda');
        this.renderSalesCatalog(); 
    },

    setDateTimeInputs: function(prefix) {
        const now = new Date();
        const dateEl = document.getElementById(`${prefix}-data`);
        const timeEl = document.getElementById(`${prefix}-hora`);
        if(dateEl) dateEl.value = now.toISOString().split('T')[0];
        if(timeEl) timeEl.value = now.toTimeString().slice(0,5);
    },

    formatDate: function(rawDate) {
        if(!rawDate || !rawDate.includes('-')) return rawDate;
        const [ano, mes, dia] = rawDate.split('-');
        return `${dia}/${mes}/${ano}`;
    },

    switchTab: function(tabId, event) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if(event) event.currentTarget.classList.add('active');
    },

    showToast: function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    copyAdText: function(element) {
        const textToCopy = element.innerText;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => this.showToast("Anúncio copiado!")).catch(() => this.fallbackCopyText(textToCopy));
        } else {
            this.fallbackCopyText(textToCopy);
        }
    },

    fallbackCopyText: function(text) {
        const textArea = document.createElement("textarea");
        Object.assign(textArea.style, { position: 'fixed', top: '0', left: '0', opacity: '0' });
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy') ? this.showToast("Anúncio copiado!") : this.showToast("Erro ao copiar", "error");
        } catch (err) {
            this.showToast("Erro grave ao copiar", "error");
        }
        document.body.removeChild(textArea);
    },

    handleEnterParticipant: function(e) { if (e.key === 'Enter') this.addParticipant(); },
    
    addParticipant: function() {
        const input = document.getElementById('novo-participante');
        const name = input.value.trim();
        if (!name) return this.showToast('Digite um nome', 'error');
        if (this.data.participants.has(name)) return this.showToast('Já adicionado', 'error');
        this.data.participants.add(name);
        this.renderParticipants();
        input.value = "";
        input.focus();
    },

    renderParticipants: function() {
        const container = document.getElementById('lista-participantes');
        container.innerHTML = '';
        this.data.participants.forEach(p => {
            const div = document.createElement('div');
            div.className = 'chip';
            div.innerHTML = `${p} <span onclick="app.removeParticipant('${p}')">&times;</span>`;
            container.appendChild(div);
        });
    },

    removeParticipant: function(name) {
        this.data.participants.delete(name);
        this.renderParticipants();
    },
    
    sendActionWebhook: function() {
        const tipo = document.getElementById('acao-tipo').value;
        const resultado = document.querySelector('input[name="resultado"]:checked')?.value;
        const hora = document.getElementById('acao-hora').value;
        const dataFormatada = this.formatDate(document.getElementById('acao-data').value);
        const parts = Array.from(this.data.participants).join('\n> • ');

        if(!tipo || !resultado) return this.showToast('Preencha o local e o resultado!', 'error');

        const color = resultado === 'Vitória' ? 3066993 : 15158332; 
        
        this.sendToDiscord(WEBHOOK_ACOES, {
            username: "TrojanHelper",
            embeds: [{
                title: `⚔️ Registro de Ação: ${tipo}`,
                color: color,
                fields: [
                    { name: "Resultado", value: `**${resultado.toUpperCase()}**`, inline: true },
                    { name: "Motivo", value: "Ação Blipada", inline: true },
                    { name: "Data/Hora", value: `${dataFormatada} às ${hora}`, inline: false },
                    { name: "Participantes", value: parts ? `> • ${parts}` : "> Ninguém registrado" }
                ],
                footer: { text: "Sistema de Gestão TRJ" }
            }]
        }, "Ação registrada!");

        this.sendToDiscord(WEBHOOK_SECUNDARIA, {
            username: "Trojan Log",
            embeds: [{
                color: color,
                description: `**Ação:** ${tipo}\n**Data:** ${dataFormatada}\n**Hora:** ${hora}\n**Motivo:** Ação Blipada\n**Resultado:** ${resultado}`
            }]
        });
    },

    renderSalesCatalog: function() {
        const container = document.getElementById('sales-catalog');
        if(!container) return;
        
        const grouped = this.data.products.reduce((acc, curr) => {
            const cat = curr.category || "Outros";
            if(!acc[cat]) acc[cat] = [];
            acc[cat].push(curr);
            return acc;
        }, {});

        const order = ["Pistolas", "Submetralhadoras", "Fuzis", "Escopetas", "Outros"];
        
        let html = '';
        order.forEach(cat => {
            if(grouped[cat]) {
                html += `<div class="catalog-category-title">${cat}</div>`;
                html += `<div class="grid-list-small">`;
                grouped[cat].forEach(p => {
                    html += `
                    <div class="catalog-item" onclick="app.selectFromCatalog('${p.name}')">
                        <div class="cat-name">${p.name}</div>
                        <div class="cat-prices">
                            <span class="price-tag min">R$ ${p.min/1000}k</span>
                            <span class="price-separator">|</span>
                            <span class="price-tag max">R$ ${p.max/1000}k</span>
                        </div>
                    </div>`;
                });
                html += `</div>`;
            }
        });
        container.innerHTML = html;
    },

    selectFromCatalog: function(prodName) {
        this.data.currentSelection = this.data.products.find(p => p.name === prodName);
        if(!this.data.currentSelection) return;

        document.querySelectorAll('.catalog-item').forEach(el => el.classList.remove('selected'));
        const allNames = Array.from(document.querySelectorAll('.cat-name'));
        const clicked = allNames.find(el => el.textContent === prodName);
        if(clicked) clicked.parentElement.classList.add('selected');

        document.getElementById('price-controls').classList.remove('hidden-controls');
        document.getElementById('select-msg').style.display = 'none';

        document.querySelectorAll('input[name="preco-tipo"]').forEach(el => el.checked = false);
        document.getElementById('venda-preco').value = '';
    },

    setPrice: function(type) {
        if (!this.data.currentSelection) return;
        document.getElementById('venda-preco').value = type === 'min' 
            ? this.data.currentSelection.min 
            : this.data.currentSelection.max;
    },

    addToCart: function() {
        if(!this.data.currentSelection) return this.showToast('Selecione uma arma', 'error');
        
        const price = parseFloat(document.getElementById('venda-preco').value) || 0;
        const qtd = parseInt(document.getElementById('venda-qtd').value) || 1;
        
        if (price === 0) return this.showToast('Selecione Parceria ou Pista', 'error');
        
        this.data.cart.push({
            name: this.data.currentSelection.name,
            price: price,
            qtd: qtd,
            total: price * qtd,
            weight: this.data.currentSelection.weight,
            cost: this.data.currentSelection.cost || 0
        });
        
        this.renderCart();
        this.showToast('Item adicionado!');
        document.getElementById('cart-production-area').classList.add('hidden');
    },

    clearCart: function() {
        this.data.cart = [];
        this.renderCart();
        document.getElementById('cart-production-area').classList.add('hidden');
    },

    removeFromCart: function(index) {
        this.data.cart.splice(index, 1);
        this.renderCart();
        document.getElementById('cart-production-area').classList.add('hidden');
    },

    renderCart: function() {
        const container = document.getElementById('cart-items');
        const summaryArea = document.getElementById('cart-summary-area');
        
        if (this.data.cart.length === 0) {
            container.innerHTML = '<p class="empty-msg">Carrinho vazio</p>';
            summaryArea.innerHTML = ''; 
            return;
        }
        
        container.innerHTML = '';
        let grandTotal = 0, totalProdCost = 0;

        this.data.cart.forEach((item, index) => {
            grandTotal += item.total;
            totalProdCost += (item.cost * item.qtd); 

            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-title">${item.name} <span class="badge-count">x${item.qtd}</span></div>
                    <div class="cart-item-price">R$ ${item.total.toLocaleString('pt-BR')}</div>
                    <div class="btn-remove-item" onclick="app.removeFromCart(${index})">&times;</div>
                </div>
            `;
        });
        
        const faccaoNet = (grandTotal * 0.70) - totalProdCost; 
        
        summaryArea.innerHTML = `
            <div class="cart-summary-box">
                <div class="summary-total">💸 Total: R$ ${grandTotal.toLocaleString('pt-BR')}</div>
                ${totalProdCost > 0 ? `<div class="text-sub">🔨 Custo Prod.: R$ ${totalProdCost.toLocaleString('pt-BR')}</div>` : ''}
                <div class="summary-seller">💰 Vendedor (30%): R$ ${(grandTotal * 0.30).toLocaleString('pt-BR')}</div>
                <div class="summary-faction">🔥 Facção: R$ ${faccaoNet.toLocaleString('pt-BR')}</div>
            </div>
        `;
    },

    calculateCartProduction: function() {
        if (this.data.cart.length === 0) return this.showToast('O carrinho está vazio!', 'error');

        const area = document.getElementById('cart-production-area');
        const listDiv = document.getElementById('mats-list-display');
        const detailsDiv = document.getElementById('sales-production-details');
        const matWeightSpan = document.getElementById('total-mat-weight-display');
        const prodWeightSpan = document.getElementById('total-prod-weight-display');

        let totalMats = new Array(this.data.matNames.length).fill(0);
        let totalMatWeight = 0;
        let totalProdWeight = 0;
        let detailsHTML = "";

        this.data.cart.forEach(item => {
            const cleanName = item.name.split('(')[0].trim().toLowerCase();
            const recipe = this.data.recipes.find(r => r.name.toLowerCase().includes(cleanName));
            
            // Peso das Armas
            totalProdWeight += item.weight * item.qtd;

            if (recipe) {
                const crafts = Math.ceil(item.qtd / 2); 
                let itemMatsHTML = "";
                
                recipe.mats.forEach((mQtd, i) => {
                    const totalM = mQtd * crafts;
                    totalMats[i] += totalM;
                    totalMatWeight += totalM * this.data.matWeights[i]; // Peso dos Materiais
                    if (totalM > 0) {
                        itemMatsHTML += `<div class="mat-item-tiny"><span>${this.data.matNames[i]}:</span> <b>${totalM}</b></div>`;
                    }
                });

                detailsHTML += `
                <div class="detail-card-small">
                    <div class="detail-header-small">
                        <span class="detail-name">${item.name}</span>
                        <span class="badge-count-small">x${item.qtd}</span>
                    </div>
                    <div class="mats-grid-small">
                        ${itemMatsHTML}
                    </div>
                </div>`;
            }
        });

        listDiv.innerHTML = totalMats.map((t, i) => {
            return t > 0 ? `<div class="mat-tag-pill"><span>${this.data.matNames[i]}:</span> <b>${t}</b></div>` : '';
        }).join('');

        detailsDiv.innerHTML = detailsHTML;
        
        matWeightSpan.innerText = totalMatWeight.toFixed(2).replace('.', ',') + ' kg';
        prodWeightSpan.innerText = totalProdWeight.toFixed(2).replace('.', ',') + ' kg';

        area.classList.remove('hidden');
        area.scrollIntoView({ behavior: 'smooth' });
    },
    
    sendSaleWebhook: function() {
        if (this.data.cart.length === 0) return this.showToast('Carrinho vazio!', 'error');
        const vendedor = document.getElementById('venda-vendedor').value.trim();
        const faccao = document.getElementById('venda-faccao').value.trim();
        if (!vendedor || !faccao) return this.showToast('Preencha Vendedor e Facção!', 'error');
        
        let grandTotal = 0, totalProdCost = 0;
        let itemsDesc = "", itemsLogStr = [];
        
        this.data.cart.forEach(i => {
            grandTotal += i.total;
            totalProdCost += (i.cost * i.qtd);
            itemsDesc += `• ${i.name} — ${i.qtd}x — R$ ${i.total.toLocaleString('pt-BR')}\n`;
            itemsLogStr.push(`${i.name} (${i.qtd}x)`);
        });

        const faccaoNet = (grandTotal * 0.70) - totalProdCost;
        const timeStr = document.getElementById('venda-hora').value;
        const dateStr = this.formatDate(document.getElementById('venda-data').value);

        this.sendToDiscord(WEBHOOK_VENDAS, {
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
        }, "Venda enviada!");

        this.sendToDiscord(WEBHOOK_SECUNDARIA, {
            username: "Trojan Log",
            embeds: [{
                color: 5644438,
                description: `**Venda:** ${itemsLogStr.join(', ')}\n**Data:** ${dateStr}\n**Hora:** ${timeStr}\n**Família:** ${faccao}`
            }]
        });
    },

    sendToDiscord: function(url, payload, successMsg) {
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(response => {
            if (response.ok && successMsg) {
                this.showToast(successMsg);
                if (url === WEBHOOK_ACOES) {
                    document.getElementById('novo-participante').value = '';
                    this.data.participants.clear();
                    this.renderParticipants();
                } else if (url === WEBHOOK_VENDAS) {
                    this.clearCart();
                    document.getElementById('venda-vendedor').value = '';
                    document.getElementById('venda-faccao').value = '';
                }
            }
        }).catch(err => console.error(err));
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
