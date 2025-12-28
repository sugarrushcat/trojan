const WEBHOOK_ACOES = "https://discord.com/api/webhooks/1438189798849384560/lote5LpQxF80SDUZ3QdPOj2aHiQ7JtcJWKfTNxErKA0MjhDdQ86vruN74dnNUy0YMowD";
const WEBHOOK_VENDAS = "https://discord.com/api/webhooks/1434731757953093662/gElahX6G0yY6h-DVQx1RQ8wOu6IJGi-k2M20fEVOgNBy-WT3ztobwuPspLB6hLaeAy6z";
const WEBHOOK_SECUNDARIA = "https://discord.com/api/webhooks/1450610317813092427/n9N_MYFuMGdMtT2By1FbjKQ4OEy33le1711v55vpCdyGyFhZiLedJsRH9ImHANX0sQZY"; 

const app = {
    data: {
        participants: new Set(),
        cart: [],
        products: [ 
            { name: "Fn Five Seven (PT)", min: 53000,  max: 63600,  weight: 1.5,  cost: 10000 },
            { name: "HK P7M10 (Fajuta)",  min: 45000,  max: 55000,  weight: 1.0,  cost: 5000 },
            { name: "Tec-9 (Sub)",        min: 90000,  max: 110000, weight: 1.75, cost: 20000 },
            { name: "Uzi (Sub)",          min: 120000, max: 140000, weight: 1.25, cost: 20000 },
            { name: "Mtar-21 (Sub)",      min: 150000, max: 170000, weight: 5.0,  cost: 25000 },
            { name: "Ak-74 (Fuzil)",      min: 240000, max: 260000, weight: 8.0,  cost: 35000 },
            { name: "G36C (Fuzil)",       min: 260000, max: 280000, weight: 8.0,  cost: 30000 },
            { name: "Ak Compact (Fuzil)", min: 250000, max: 270000, weight: 2.25, cost: 40000 }, 
            { name: "Mossberg 590",       min: 260000, max: 280000, weight: 6.0,  cost: 35000 }
        ],
        recipes: [
            { name: "Fn Five Seven",   mats: [17, 13, 26, 25], weight: 1.5,  cost: 20000 },
            { name: "HK P7M10",        mats: [17, 13, 26, 25], weight: 1.0,  cost: 10000 },
            { name: "Tec-9",           mats: [34, 26, 33, 25], weight: 1.75, cost: 40000 },
            { name: "Uzi",             mats: [48, 39, 38, 35], weight: 1.25, cost: 40000 },
            { name: "Mtar-21",         mats: [51, 39, 38, 35], weight: 5.0,  cost: 50000 },
            { name: "Ak-74",           mats: [85, 65, 40, 40], weight: 8.0,  cost: 70000 },
            { name: "G36C",            mats: [85, 65, 40, 40], weight: 8.0,  cost: 60000 },
            { name: "Ak Compact",      mats: [85, 70, 50, 40], weight: 2.25, cost: 80000 },
            { name: "Mossberg 590",    mats: [90, 75, 50, 40], weight: 6.0,  cost: 70000 },
        ],
        matNames: ["Alumínio", "Cobre", "Materiais", "Projeto"],
        matWeights: [0.01, 0.01, 0.01, 0.01] 
    },

    init: function() {
        this.setDateTimeInputs('acao');
        this.setDateTimeInputs('venda');
        this.renderProductOptions(this.data.products); 
        this.initProductionTable();
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

    renderProductOptions: function(productsToRender) {
        const select = document.getElementById('venda-produto');
        select.innerHTML = '<option value="" disabled selected>Selecione o produto...</option>';
        productsToRender.forEach(p => {
            const option = document.createElement('option');
            option.value = p.name;
            Object.assign(option.dataset, { min: p.min, max: p.max, weight: p.weight, cost: p.cost });
            option.textContent = p.name;
            select.appendChild(option);
        });
        this.updatePriceRange(); 
    },

    updatePriceRange: function() {
        document.querySelectorAll('input[name="preco-tipo"]').forEach(el => el.checked = false);
        document.getElementById('venda-preco').value = '';
    },

    setPrice: function(type) {
        const select = document.getElementById('venda-produto');
        const option = select.options[select.selectedIndex];
        if (!option || !option.value) return;
        document.getElementById('venda-preco').value = type === 'min' ? option.dataset.min : option.dataset.max;
    },

    addToCart: function() {
        const prodSelect = document.getElementById('venda-produto');
        if(prodSelect.selectedIndex <= 0) return this.showToast('Selecione um produto', 'error');
        
        const opt = prodSelect.options[prodSelect.selectedIndex];
        const price = parseFloat(document.getElementById('venda-preco').value) || 0;
        const qtd = parseInt(document.getElementById('venda-qtd').value) || 1;
        
        if (price === 0) return this.showToast('Selecione Parceria ou Pista', 'error');
        
        this.data.cart.push({
            name: opt.text,
            price: price,
            qtd: qtd,
            total: price * qtd,
            weight: parseFloat(opt.dataset.weight),
            cost: parseFloat(opt.dataset.cost) || 0
        });
        
        this.renderCart();
        this.showToast('Item adicionado!');
    },

    clearCart: function() {
        this.data.cart = [];
        this.renderCart();
    },

    removeFromCart: function(index) {
        this.data.cart.splice(index, 1);
        this.renderCart();
    },

    renderCart: function() {
        const container = document.getElementById('cart-items');
        const summaryArea = document.getElementById('cart-summary-area');
        const weightArea = document.getElementById('cart-weight-area');
        
        if (this.data.cart.length === 0) {
            container.innerHTML = '<p class="empty-msg">Carrinho vazio</p>';
            summaryArea.innerHTML = ''; 
            weightArea.classList.add('hidden');
            return;
        }
        
        container.innerHTML = '';
        let grandTotal = 0, totalWeight = 0, totalProdCost = 0;

        this.data.cart.forEach((item, index) => {
            grandTotal += item.total;
            totalWeight += (item.weight * item.qtd);
            totalProdCost += (item.cost * item.qtd); 

            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-title">${item.name} — ${item.qtd}x</div>
                    <div class="cart-item-price">R$ ${item.total.toLocaleString('pt-BR')}</div>
                    <div class="btn-remove-item" onclick="app.removeFromCart(${index})">X</div>
                </div>
            `;
        });
        
        const faccaoNet = (grandTotal * 0.70) - totalProdCost; 
        
        summaryArea.innerHTML = `
            <div class="cart-summary-box">
                <div class="summary-total">💸 Total: R$ ${grandTotal.toLocaleString('pt-BR')}</div>
                ${totalProdCost > 0 ? `<div class="text-sub">🔨 Custo Produção: R$ ${totalProdCost.toLocaleString('pt-BR')}</div>` : ''}
                <div class="summary-seller">💰 Vendedor (30%): R$ ${(grandTotal * 0.30).toLocaleString('pt-BR')}</div>
                <div class="summary-faction">🔥 Facção (70% - Custo): R$ ${faccaoNet.toLocaleString('pt-BR')}</div>
            </div>
        `;
        weightArea.classList.remove('hidden');
        weightArea.innerHTML = `⚖️ Peso: ${totalWeight.toFixed(2).replace('.', ',')} kg`;
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

    initProductionTable: function() {
        const tbody = document.querySelector('#tabela-producao tbody');
        if(!tbody) return;
        tbody.innerHTML = ''; 
        this.data.recipes.forEach((r, idx) => {
            tbody.innerHTML += `<tr class="prod-row" data-name="${r.name.toLowerCase()}">
                <td class="pl-15 bold text-white">${r.name}</td>
                <td class="text-center">
                    <input type="number" min="0" class="prod-input" data-idx="${idx}" oninput="app.calculateProduction()">
                </td>
            </tr>`;
        });
    },

    filterProductionItems: function() {
        const term = document.getElementById('search-producao').value.toLowerCase();
        document.querySelectorAll('.prod-row').forEach(row => {
            row.style.display = row.dataset.name.includes(term) ? '' : 'none';
        });
    },

    loadFromCart: function() {
        if (this.data.cart.length === 0) return this.showToast('Carrinho de vendas vazio!', 'error');
        this.resetProduction();
        let loadedCount = 0;
        this.data.cart.forEach(item => {
            const cleanName = item.name.split('(')[0].trim().toLowerCase();
            const recipeIdx = this.data.recipes.findIndex(r => r.name.toLowerCase().includes(cleanName));
            if(recipeIdx > -1) {
                const input = document.querySelector(`.prod-input[data-idx="${recipeIdx}"]`);
                if(input) {
                    input.value = (parseInt(input.value) || 0) + item.qtd;
                    loadedCount++;
                }
            }
        });
        loadedCount > 0 ? this.calculateProduction() : this.showToast('Nenhum item compatível.', 'error');
        if(loadedCount > 0) document.getElementById('detalhes-area').scrollIntoView({ behavior: 'smooth' });
    },

    calculateProduction: function() {
        const inputs = document.querySelectorAll('.prod-input');
        let totals = new Array(this.data.matNames.length).fill(0);
        let totalMatWeight = 0, totalProdWeight = 0, totalFinanceCost = 0;
        let hasInput = false;
        
        const detailsContainer = document.getElementById('lista-detalhada');
        if(detailsContainer) detailsContainer.innerHTML = ''; 

        inputs.forEach(input => {
            const qtd = parseInt(input.value) || 0;
            if(qtd > 0) {
                hasInput = true;
                const recipe = this.data.recipes[input.dataset.idx];
                const crafts = Math.ceil(qtd / 2); 
                const cost = crafts * recipe.cost;
                const pWeight = qtd * recipe.weight;
                
                totalFinanceCost += cost;
                totalProdWeight += pWeight;
                
                let matsStr = [];
                recipe.mats.forEach((mQtd, i) => {
                    const totalM = mQtd * crafts;
                    totals[i] += totalM;
                    totalMatWeight += totalM * this.data.matWeights[i];
                    if(totalM > 0) matsStr.push({ name: this.data.matNames[i], val: totalM });
                });

                if(detailsContainer) {
                    detailsContainer.innerHTML += `
                    <div class="cart-item detail-card">
                        <div class="detail-header">
                            <div class="detail-title">${recipe.name}</div>
                            <div class="badge-count">x${qtd}</div>
                        </div>
                        <div class="mats-grid">
                            ${matsStr.map(m => `<div class="mat-item"><span>${m.name}:</span> <b>${m.val}</b></div>`).join('')}
                        </div>
                        <div class="detail-footer">
                            <div class="text-muted">Peso: <span class="text-white">${pWeight}kg</span></div>
                            <div class="success-text bold">R$ ${cost.toLocaleString('pt-BR')}</div>
                        </div>
                    </div>`;
                }
            }
        });

        const resDiv = document.getElementById('resumo-materiais');
        const weightsDiv = document.getElementById('production-weights');
        const detailsArea = document.getElementById('detalhes-area');
        
        if (hasInput) {
            weightsDiv.classList.remove('hidden');
            detailsArea.classList.remove('hidden');
            document.getElementById('weight-materials-val').innerText = `${totalMatWeight.toFixed(2).replace('.', ',')} kg`;
            document.getElementById('weight-product-val').innerText = `${totalProdWeight.toFixed(2).replace('.', ',')} kg`;
            document.getElementById('cost-finance-val').innerText = `R$ ${totalFinanceCost.toLocaleString('pt-BR')}`;
            
            resDiv.innerHTML = totals.map((t, i) => t > 0 ? `<div class="mat-tag">${this.data.matNames[i]}: ${t}</div>` : '').join('');
        } else {
            weightsDiv.classList.add('hidden');
            detailsArea.classList.add('hidden');
            resDiv.innerHTML = '<span class="text-muted italic">Selecione itens na tabela ou puxe do carrinho.</span>';
        }
    },

    resetProduction: function() {
        document.querySelectorAll('.prod-input').forEach(i => i.value = '');
        this.calculateProduction();
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
