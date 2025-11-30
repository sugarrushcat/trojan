// ======================================================
// ⚙️ CONFIGURAÇÃO DAS WEBHOOKS
// ======================================================
const WEBHOOK_ACOES = "https://discord.com/api/webhooks/1438189798849384560/lote5LpQxF80SDUZ3QdPOj2aHiQ7JtcJWKfTNxErKA0MjhDdQ86vruN74dnNUy0YMowD";
const WEBHOOK_VENDAS = "https://discord.com/api/webhooks/1434731757953093662/gElahX6G0yY6h-DVQx1RQ8wOu6IJGi-k2M20fEVOgNBy-WT3ztobwuPspLB6hLaeAy6z";
const WEBHOOK_SECUNDARIA = "https://discord.com/api/webhooks/1440743055379665136/G9nQ8BPcPkCZzLNiqDagcml_UZquf_QvZyF4MmxG4uCPE6hIV91E2rM94vj6Bf04qtGP"; 
// ======================================================

const app = {
    data: {
        participants: new Set(),
        cart: [],
        products: [ 
            { name: "Munição de PT",       min: 130,   max: 150,   weight: 0 },
            { name: "Munição de Smg",      min: 260,   max: 300,   weight: 0 },
            { name: "Munição de Fuzil",    min: 350,   max: 400,   weight: 0 },
            { name: "Munição de Escopeta", min: 400,   max: 450,   weight: 0 },
            { name: "C4",                  min: 3000,  max: 3600,  weight: 2.0 },
            { name: "Colete",              min: 10000, max: 12000, weight: 5.0 }
        ],
        recipes: [
            { name: "500 Munição Pt",       mats: [43, 65, 0, 0, 0, 53, 150], weight: 0 },
            { name: "500 Munição Smg",      mats: [43, 65, 0, 0, 0, 53, 150], weight: 0 },
            { name: "500 Munição Fuzil",    mats: [43, 65, 0, 0, 0, 53, 150], weight: 0 },
            { name: "500 Munição Escopeta", mats: [43, 65, 0, 0, 0, 53, 150], weight: 0 },
            { name: "C4",                   mats: [15, 5, 5, 10, 0, 0, 0],    weight: 2.0 },
            { name: "Colete",               mats: [41, 0, 22, 0, 35, 0, 0],   weight: 5.0 },
        ],
        matNames: ["Alumínio", "Cobre", "Linha", "Eletrônico Novo", "Fibra", "Materiais", "Projeto"],
        matWeights: [0.01, 0.01, 0.01, 0.01, 0.10, 0.01, 0.01] 
    },

    init: function() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');

        const actionDate = document.getElementById('acao-data');
        const actionTime = document.getElementById('acao-hora');
        if(actionDate) actionDate.value = `${year}-${month}-${day}`;
        if(actionTime) actionTime.value = `${hour}:${minute}`;

        const salesDate = document.getElementById('venda-data');
        const salesTime = document.getElementById('venda-hora');
        if(salesDate) salesDate.value = `${year}-${month}-${day}`;
        if(salesTime) salesTime.value = `${hour}:${minute}`;

        this.renderProductOptions(this.data.products); 
        this.initProductionTable();
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

    // --- COPY ---
    copyAdText: function(element) {
        const textToCopy = element.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showToast("Anúncio copiado!");
        }).catch(err => {
            this.showToast("Erro ao copiar", "error");
        });
    },

    // --- AÇÕES ---
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
        const rawData = document.getElementById('acao-data').value; 
        const hora = document.getElementById('acao-hora').value;
        const motivo = "Ação Blipada";
        const parts = Array.from(this.data.participants).join('\n> • ');

        if(!tipo || !resultado) return this.showToast('Preencha o local e o resultado!', 'error');

        let dataFormatada = rawData;
        if(rawData.includes('-')) {
            const [ano, mes, dia] = rawData.split('-');
            dataFormatada = `${dia}/${mes}/${ano}`;
        }

        const color = resultado === 'Vitória' ? 3066993 : 15158332; 
        
        const payloadMain = {
            username: "TrojanHelper",
            embeds: [{
                title: `⚔️ Registro de Ação: ${tipo}`,
                color: color,
                fields: [
                    { name: "Resultado", value: `**${resultado.toUpperCase()}**`, inline: true },
                    { name: "Motivo", value: motivo, inline: true },
                    { name: "Data/Hora", value: `${dataFormatada} às ${hora}`, inline: false },
                    { name: "Participantes", value: parts ? `> • ${parts}` : "> Ninguém registrado" }
                ],
                footer: { text: "Sistema de Gestão TRJ" }
            }]
        };

        const payloadLog = {
            username: "Trojan Log",
            embeds: [{
                color: color,
                description: `**Ação:** ${tipo}\n**Data:** ${dataFormatada}\n**Hora:** ${hora}\n**Motivo/resumo Ação Blipada:** ${motivo}\n**Resultado:** ${resultado}`
            }]
        };

        this.sendToDiscord(WEBHOOK_ACOES, payloadMain, "Ação registrada!");
        this.sendToDiscord(WEBHOOK_SECUNDARIA, payloadLog, null);
    },

    // --- VENDAS ---
    renderProductOptions: function(productsToRender) {
        const select = document.getElementById('venda-produto');
        select.innerHTML = '<option value="" disabled selected>Selecione o produto...</option>';
        productsToRender.forEach(p => {
            const option = document.createElement('option');
            option.value = p.name;
            option.dataset.min = p.min;
            option.dataset.max = p.max;
            option.dataset.weight = p.weight;
            option.textContent = p.name;
            select.appendChild(option);
        });
        select.selectedIndex = 0; 
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
        const price = type === 'min' ? option.dataset.min : option.dataset.max;
        document.getElementById('venda-preco').value = price;
    },
    addToCart: function() {
        const prodSelect = document.getElementById('venda-produto');
        if(prodSelect.selectedIndex === 0) return this.showToast('Selecione um produto', 'error');
        const selectedOption = prodSelect.options[prodSelect.selectedIndex];
        const prodName = selectedOption.text;
        const prodWeight = parseFloat(selectedOption.dataset.weight);
        const price = parseFloat(document.getElementById('venda-preco').value) || 0;
        const qtd = parseInt(document.getElementById('venda-qtd').value) || 1;
        if (price === 0) return this.showToast('Selecione Parceria ou Pista', 'error');
        const total = (price * qtd);
        this.data.cart.push({ name: prodName, price, qtd, total, weight: prodWeight });
        this.renderCart();
        this.showToast('Item adicionado!');
    },
    clearCart: function() {
        this.data.cart = [];
        this.renderCart();
    },
    renderCart: function() {
        const container = document.getElementById('cart-items');
        const summaryArea = document.getElementById('cart-summary-area');
        const weightArea = document.getElementById('cart-weight-area');
        
        if (this.data.cart.length === 0) {
            container.innerHTML = '<p class="empty-msg">Carrinho vazio</p>';
            summaryArea.innerHTML = ''; 
            weightArea.style.display = 'none';
            return;
        }
        container.innerHTML = '';
        let grandTotal = 0;
        let totalWeight = 0;
        this.data.cart.forEach((item, index) => {
            grandTotal += item.total;
            totalWeight += (item.weight * item.qtd);
            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-title">${item.name} — ${item.qtd}x</div>
                    <div class="cart-item-price">R$ ${item.total.toLocaleString('pt-BR')}</div>
                    <div class="btn-remove-item" onclick="app.removeFromCart(${index})">X</div>
                </div>
            `;
        });
        const vendedorShare = grandTotal * 0.60;
        const faccaoShare = grandTotal * 0.40;
        summaryArea.innerHTML = `
            <div class="cart-summary-box">
                <div class="summary-total">💸 Total: R$ ${grandTotal.toLocaleString('pt-BR')}</div>
                <div class="summary-seller">💰 Vendedor (60%): R$ ${vendedorShare.toLocaleString('pt-BR')}</div>
                <div class="summary-faction">🔥 Facção (40%): R$ ${faccaoShare.toLocaleString('pt-BR')}</div>
            </div>
        `;
        weightArea.style.display = 'inline-block';
        weightArea.innerHTML = `⚖️ Peso: ${totalWeight.toFixed(2).replace('.', ',')} kg`;
    },
    removeFromCart: function(index) {
        this.data.cart.splice(index, 1);
        this.renderCart();
    },
    
    sendSaleWebhook: function() {
        if (this.data.cart.length === 0) return this.showToast('Carrinho vazio!', 'error');
        const vendedor = document.getElementById('venda-vendedor').value.trim();
        const faccao = document.getElementById('venda-faccao').value.trim();
        if (!vendedor || !faccao) return this.showToast('Preencha Vendedor e Facção!', 'error');
        
        let grandTotal = 0;
        let itemsDesc = "";
        let itemsSimple = ""; 

        this.data.cart.forEach(i => {
            grandTotal += i.total;
            itemsDesc += `• ${i.name} — ${i.qtd}x — R$ ${i.total.toLocaleString('pt-BR')}\n`;
            itemsSimple += `${i.name} (${i.qtd}x), `;
        });

        const vendedorShare = grandTotal * 0.60;
        const faccaoShare = grandTotal * 0.40;
        
        const rawDate = document.getElementById('venda-data').value;
        const timeStr = document.getElementById('venda-hora').value;

        let dateStr = rawDate;
        if(rawDate.includes('-')) {
            const [ano, mes, dia] = rawDate.split('-');
            dateStr = `${dia}/${mes}/${ano}`;
        }

        const payloadMain = {
            username: "TrojanHelper",
            embeds: [{
                title: "📄 Venda Registrada",
                color: 5644438,
                fields: [
                    { name: "💼 Vendedor", value: vendedor, inline: true },
                    { name: "🏛️ Facção Compradora", value: faccao, inline: true },
                    { name: "📦 Itens", value: itemsDesc, inline: false },
                    { name: "💸 Total", value: `R$ ${grandTotal.toLocaleString('pt-BR')}`, inline: true },
                    { name: "💰 Vendedor (60%)", value: `R$ ${vendedorShare.toLocaleString('pt-BR')}`, inline: true },
                    { name: "🔥 Facção (40%)", value: `R$ ${faccaoShare.toLocaleString('pt-BR')}`, inline: true }
                ],
                footer: { text: `Data: ${dateStr} às ${timeStr}` }
            }]
        };

        // PAYLOAD SECUNDÁRIO COM O TEXTO EXATO NA DESCRIÇÃO DO EMBED
        const payloadLog = {
            username: "Trojan Log",
            embeds: [{
                color: 5644438, // Roxo
                description: `**Venda:** ${itemsSimple.slice(0, -2)}\n**Data:** ${dateStr}\n**Hora:** ${timeStr}\n**Família para venda:** ${faccao}`
            }]
        };

        this.sendToDiscord(WEBHOOK_VENDAS, payloadMain, "Venda enviada!");
        this.sendToDiscord(WEBHOOK_SECUNDARIA, payloadLog, null);
    },

    // --- PRODUÇÃO ---
    initProductionTable: function() {
        const tbody = document.querySelector('#tabela-producao tbody');
        tbody.innerHTML = ''; 
        this.data.recipes.forEach((r, idx) => {
            tbody.innerHTML += `<tr class="prod-row" data-name="${r.name.toLowerCase()}">
                <td>${r.name}</td>
                <td><input type="number" min="0" class="prod-input" data-idx="${idx}" oninput="app.calculateProduction()"></td>
                ${r.mats.map(m => `<td>${m}</td>`).join('')}
            </tr>`;
        });
    },
    filterProductionItems: function() {
        const term = document.getElementById('search-producao').value.toLowerCase();
        const rows = document.querySelectorAll('.prod-row');
        rows.forEach(row => {
            const name = row.dataset.name;
            if(name.includes(term)) { row.style.display = ''; } else { row.style.display = 'none'; }
        });
    },
    calculateProduction: function() {
        const inputs = document.querySelectorAll('.prod-input');
        let totals = new Array(this.data.matNames.length).fill(0);
        let totalMatWeight = 0;
        let totalProdWeight = 0;
        let hasInput = false;

        inputs.forEach(input => {
            const qtd = parseInt(input.value) || 0;
            if(qtd > 0) hasInput = true;
            const recipe = this.data.recipes[input.dataset.idx];
            totalProdWeight += (qtd * recipe.weight);
            recipe.mats.forEach((cost, matIdx) => {
                const materialQtd = cost * qtd;
                totals[matIdx] += materialQtd;
                totalMatWeight += materialQtd * this.data.matWeights[matIdx];
            });
        });

        const resDiv = document.getElementById('resumo-materiais');
        const weightsDiv = document.getElementById('production-weights');
        const matWeightSpan = document.getElementById('weight-materials-val');
        const prodWeightSpan = document.getElementById('weight-product-val');
        resDiv.innerHTML = '';

        if (hasInput) {
            weightsDiv.style.display = 'flex';
            matWeightSpan.innerText = `${totalMatWeight.toFixed(2).replace('.', ',')} kg`;
            prodWeightSpan.innerText = `${totalProdWeight.toFixed(2).replace('.', ',')} kg`;
            totals.forEach((total, i) => {
                if (total > 0) {
                    resDiv.innerHTML += `<div class="mat-tag">${this.data.matNames[i]}: ${total}</div>`;
                }
            });
        } else {
            weightsDiv.style.display = 'none';
            resDiv.innerHTML = '<span style="color:var(--text-muted)">Nenhum material necessário.</span>';
        }
    },
    resetProduction: function() {
        document.querySelectorAll('.prod-input').forEach(i => i.value = '');
        this.calculateProduction();
    },

    // --- FETCH ---
    sendToDiscord: function(url, payload, successMsg) {
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                if(successMsg) this.showToast(successMsg);
                
                if (url === WEBHOOK_ACOES || url === WEBHOOK_VENDAS) {
                    if(payload.embeds && payload.embeds[0].title.includes("Ação")) {
                        document.getElementById('novo-participante').value = '';
                        this.data.participants.clear();
                        this.renderParticipants();
                    } else if (payload.embeds && payload.embeds[0].title.includes("Venda")) {
                        this.clearCart();
                        document.getElementById('venda-vendedor').value = '';
                        document.getElementById('venda-faccao').value = '';
                    }
                }
            } else {
                console.error("Erro Discord:", response);
            }
        })
        .catch(err => {
            console.error(err);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
