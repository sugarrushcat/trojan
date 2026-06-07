document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'I')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'j' || e.key === 'J')) e.preventDefault();
});

(function() {
    const CONFIG = {
        WEBHOOKS: {
            ACOES: "https://discord.com/api/webhooks/1500271163090276362/4su-b6yUy4GISMOW_xd9pZfvIzyNYA9b26lAQwmjTbFXw64Q0a2uRg_kNtJmSZvbHlhc",
            VENDAS: "https://discord.com/api/webhooks/1500271084107468902/eQKJInfwlZNtBKNIrPnpTC_DkcS78GPPvnXOLMRHCTbYPFtSqVsVEGCoM8eHvhnqJHO_",
            LOGS_ACOES: "NAO TEM",
            LOGS_VENDAS: "NAO TEM"
        },
        MAT_NAMES: ["Aluminio", "Cobre", "Materiais", "Projeto"],
        MAT_WEIGHTS: [0.25, 0.25, 0.25, 0.25]
    };

    const CATALOG = {
        'fn_five_seven': { name: "Fn Five Seven (PT)", category: "Pistolas",       price: { min: 55000, max: 65000 },   weight: 1.5,  cost: 10000, recipe: [10, 10, 10, 10] },
        'hk_p7m10':      { name: "HK P7M10 (Fajuta)",  category: "Pistolas",       price: { min: 25000, max: 30000 },   weight: 1.0,  cost: 5000,  recipe: [10, 10, 10, 10] },
        'tec_9':         { name: "Tec-9 (Sub)",        category: "Submetralhadoras", price: { min: 90000, max: 110000 },  weight: 1.75, cost: 30000, recipe: [20, 20, 20, 20] },
        'uzi':           { name: "Uzi (Sub)",          category: "Submetralhadoras", price: { min: 120000, max: 140000 }, weight: 1.25, cost: 40000, recipe: [20, 20, 20, 20] },
        'mtar_21':       { name: "Mtar-21 (Sub)",      category: "Submetralhadoras", price: { min: 150000, max: 170000 }, weight: 5.0,  cost: 50000, recipe: [20, 20, 20, 20] },
        'ak_74':         { name: "Ak-74 (Fuzil)",      category: "Fuzis",          price: { min: 240000, max: 260000 }, weight: 8.0,  cost: 35000, recipe: [25, 25, 25, 25] },
        'g36c':          { name: "G36C (Fuzil)",       category: "Fuzis",          price: { min: 260000, max: 280000 }, weight: 8.0,  cost: 30000, recipe: [25, 25, 25, 25] },
        'ak_compact':    { name: "Ak Compact (Fuzil)", category: "Fuzis",          price: { min: 190000, max: 210000 }, weight: 2.25, cost: 40000, recipe: [25, 25, 25, 25] },
        'mossberg':      { name: "Mossberg 590",       category: "Escopetas",      price: { min: 260000, max: 280000 }, weight: 6.0,  cost: 35000, recipe: [25, 25, 25, 25] }
    };

    const ACTIONS_JSON_PATH = "./actions.json?v=1.0";
    const EMBEDDED_ACTIONS_DATA = window.ZIGOS_ACTIONS_DATA || null;
    const FAVORITES_STORAGE_KEY = "zigos_rule_favorites";
    const RECENT_ACTIONS_STORAGE_KEY = "zigos_recent_actions";
    const PARTICIPANT_PRESETS = [
        { passaporte: "129", nome: "Oda Arasaka" },
        { passaporte: "220", nome: "Thalia Duice Maeda Hall Quissanga" },
        { passaporte: "126", nome: "Marck Khalid" },
        { passaporte: "492", nome: "Matteo Kuro" },
        { passaporte: "814", nome: "Robb Stark" },
        { passaporte: "29", nome: "Diana Duice" },
        { passaporte: "277", nome: "Nyriel Kuro" },
        { passaporte: "119", nome: "PerolesxCoyote ElComedor" },
        { passaporte: "102", nome: "Boris Duice" },
        { passaporte: "911", nome: "Morgana Duice" },
        { passaporte: "467", nome: "Theodore Seville" },
        { passaporte: "641", nome: "Zak KataErva" },
        { passaporte: "640", nome: "Sota KataErva" },
        { passaporte: "385", nome: "Rafik Castellani" },
        { passaporte: "317", nome: "Bruna Castellani" },
        { passaporte: "295", nome: "Beatriz Coff LeBlanc" },
        { passaporte: "730", nome: "Lavinia Hastings Montibeller Silverhand" },
        { passaporte: "270", nome: "Becky MavenTwo" },
        { passaporte: "190", nome: "Aline Hoffman" },
        { passaporte: "138", nome: "Polly Bocket" },
        { passaporte: "397", nome: "Nero Khalid" },
        { passaporte: "485", nome: "Moura Duice" },
        { passaporte: "383", nome: "Nicolly Blanck" },
        { passaporte: "196", nome: "Luan Zucci" },
        { passaporte: "368", nome: "Yummi Duice" },
        { passaporte: "539", nome: "Liz AmaetraiDuice" }
    ];

    window.app = {
        state: {
            participants: new Set(),
            cart: [],
            selectedItemId: null,
            globalPriceType: "max",
            isAdmin: false,
            actionData: { groups: [], details: {} },
            ruleFavorites: new Set(),
            selectedRuleAction: "",
            showAllRules: false,
            recentActions: [],
            allActionNames: [],
            selectedActionName: "",
            showAllActionOptions: false,
            selectedParticipantValue: "",
            discountOn: false
        },
        dom: {},

        async init() {
            this.cacheDOM();
            this.setDefaults();
            this.renderCatalog();
            this.initTheme();
            this.initAdminSettings();
            this.initRuleFavorites();
            this.initRecentActions();
            this.bindRuleEvents();
            this.registerServiceWorker();
            await this.loadActionData();
        },

        cacheDOM() {
            const ids = [
                "acao-tipo", "acao-search", "acao-action-list", "acao-empty", "acao-show-all", "acao-helper", "acao-selected-display", "acao-data", "acao-hora", "novo-participante", "participant-action-list", "participant-empty", "lista-participantes",
                "venda-vendedor", "seller-action-list", "seller-empty", "venda-faccao", "venda-data", "venda-hora", "venda-preco", "venda-qtd",
                "sales-catalog", "price-controls", "select-msg", "cart-items", "cart-summary-area",
                "cart-production-area", "mats-list-display", "sales-production-details", "total-mat-weight-display", "total-prod-weight-display",
                "toast-container", "regras-acao-tipo", "regras-search", "regras-favorites",
                "regras-action-list", "regras-empty", "acao-info-regras", "regras-recent",
                "regras-show-all", "regras-helper"
            ];

            ids.forEach((id) => {
                const el = document.getElementById(id);
                if (el) this.dom[id] = el;
            });
        },

        initTheme() {
            const themeToggle = document.getElementById("theme-toggle");
            const savedTheme = localStorage.getItem("zigos_theme");

            if (savedTheme === "light") {
                document.body.classList.add("light-mode");
                if (themeToggle) {
                    themeToggle.querySelector(".icon-sun").style.display = "none";
                    themeToggle.querySelector(".icon-moon").style.display = "inline";
                }
            }

            if (themeToggle) {
                themeToggle.addEventListener("click", () => {
                    document.body.classList.toggle("light-mode");
                    const isLight = document.body.classList.contains("light-mode");

                    localStorage.setItem("zigos_theme", isLight ? "light" : "dark");

                    themeToggle.querySelector(".icon-sun").style.display = isLight ? "none" : "inline";
                    themeToggle.querySelector(".icon-moon").style.display = isLight ? "inline" : "none";
                });
            }
        },

        initAdminSettings() {
            const savedColor = localStorage.getItem("zigos_color");
            const colorPicker = document.getElementById("admin-color");
            if (savedColor) {
                this.applyColor(savedColor);
                if (colorPicker) colorPicker.value = savedColor;
            } else if (colorPicker) {
                colorPicker.value = "#106B3A";
            }

            if (colorPicker) {
                colorPicker.addEventListener("input", (e) => {
                    this.applyColor(e.target.value);
                    localStorage.setItem("zigos_color", e.target.value);
                });
            }

            const savedName = localStorage.getItem("zigos_default_user");
            if (savedName) {
                const inputName = document.getElementById("admin-default-user");
                const vendaName = document.getElementById("venda-vendedor");
                if (inputName) inputName.value = savedName;
                if (vendaName) vendaName.value = savedName;
            }
        },

        initRuleFavorites() {
            try {
                const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
                const favorites = raw ? JSON.parse(raw) : [];
                this.state.ruleFavorites = new Set(Array.isArray(favorites) ? favorites : []);
            } catch (error) {
                this.state.ruleFavorites = new Set();
            }
        },

        initRecentActions() {
            try {
                const raw = localStorage.getItem(RECENT_ACTIONS_STORAGE_KEY);
                const recent = raw ? JSON.parse(raw) : [];
                this.state.recentActions = Array.isArray(recent) ? recent : [];
            } catch (error) {
                this.state.recentActions = [];
            }
        },

        bindRuleEvents() {
            if (this.dom["regras-search"]) {
                this.dom["regras-search"].addEventListener("input", (event) => {
                    this.renderRulesExplorer(event.target.value);
                });
            }

            if (this.dom["acao-search"]) {
                this.dom["acao-search"].addEventListener("input", (event) => {
                    this.renderActionPicker(event.target.value);
                });
            }

            if (this.dom["novo-participante"]) {
                this.dom["novo-participante"].addEventListener("input", (event) => {
                    this.renderParticipantSuggestions(event.target.value);
                });
            }

            if (this.dom["venda-vendedor"]) {
                this.dom["venda-vendedor"].addEventListener("input", (event) => {
                    this.renderSellerSuggestions(event.target.value);
                });
            }

            if (this.dom["regras-acao-tipo"]) {
                this.dom["regras-acao-tipo"].addEventListener("change", () => {
                    this.checkRegrasTipo();
                });
            }
        },

        registerServiceWorker() {
            if (!("serviceWorker" in navigator)) return;
            if (!window.isSecureContext) return;

            window.addEventListener("load", () => {
                navigator.serviceWorker.register("./service-worker.js").catch((error) => {
                    console.error("Falha ao registrar service worker", error);
                });
            });
        },

        async loadActionData() {
            if (EMBEDDED_ACTIONS_DATA && EMBEDDED_ACTIONS_DATA.details) {
                this.state.actionData = {
                    groups: Array.isArray(EMBEDDED_ACTIONS_DATA.groups) ? EMBEDDED_ACTIONS_DATA.groups : [],
                    details: EMBEDDED_ACTIONS_DATA.details || {}
                };
                this.state.allActionNames = Object.keys(this.state.actionData.details);

                this.renderActionSelectOptions();
                this.renderActionPicker();
                this.renderParticipantSuggestions();
                this.renderSellerSuggestions();
                this.renderRulesExplorer();
                return;
            }

            try {
                const response = await fetch(ACTIONS_JSON_PATH, { cache: "no-store" });
                if (!response.ok) throw new Error(`Falha ao carregar actions.json (${response.status})`);

                const data = await response.json();
                this.state.actionData = {
                    groups: Array.isArray(data.groups) ? data.groups : [],
                    details: data.details || {}
                };
                this.state.allActionNames = Object.keys(this.state.actionData.details);

                this.renderActionSelectOptions();
                this.renderActionPicker();
                this.renderParticipantSuggestions();
                this.renderSellerSuggestions();
                this.renderRulesExplorer();
            } catch (error) {
                console.error(error);
                this.showToast("Não foi possível carregar as ações.", "error");
            }
        },

        renderActionSelectOptions() {
            const acaoSelect = this.dom["acao-tipo"];
            const regrasSelect = this.dom["regras-acao-tipo"];
            if (acaoSelect) {
                acaoSelect.innerHTML = '<option value="" disabled selected>Selecione a ação...</option>';
            }

            if (regrasSelect) {
                regrasSelect.innerHTML = '<option value="" disabled selected>Escolha uma ação...</option>';
            }

            this.state.actionData.groups.forEach((group) => {
                if (acaoSelect) acaoSelect.appendChild(this.buildOptGroup(group));
                if (regrasSelect) regrasSelect.appendChild(this.buildOptGroup(group));
            });
        },

        buildOptGroup(group) {
            const optgroup = document.createElement("optgroup");
            optgroup.label = group.label;
            (group.actions || []).forEach((actionName) => {
                const option = document.createElement("option");
                option.value = actionName;
                option.textContent = actionName;
                optgroup.appendChild(option);
            });
            return optgroup;
        },

        applyColor(hexColor) {
            document.documentElement.style.setProperty("--primary", hexColor);

            const darken = "#" + hexColor
                .replace(/^#/, "")
                .replace(/../g, (color) => ("0" + Math.min(255, Math.max(0, parseInt(color, 16) - 40)).toString(16)).slice(-2));
            document.documentElement.style.setProperty("--primary-dark", darken);

            let cleanHex = hexColor.replace("#", "");
            if (cleanHex.length === 3) {
                cleanHex = cleanHex.split("").map((char) => char + char).join("");
            }

            const r = parseInt(cleanHex.substring(0, 2), 16) || 16;
            const g = parseInt(cleanHex.substring(2, 4), 16) || 107;
            const b = parseInt(cleanHex.substring(4, 6), 16) || 58;

            document.documentElement.style.setProperty("--primary-rgb", `${r}, ${g}, ${b}`);
        },

        resetColor() {
            localStorage.removeItem("zigos_color");
            this.applyColor("#106B3A");
            const colorPicker = document.getElementById("admin-color");
            if (colorPicker) colorPicker.value = "#106B3A";
            this.showToast("Cor restaurada para o padrão!");
        },

        saveDefaultUser(name) {
            localStorage.setItem("zigos_default_user", name);
            const vendaName = document.getElementById("venda-vendedor");
            if (vendaName) vendaName.value = name;
        },

        hardReset() {
            if (confirm("⚠️ TEM CERTEZA? Isso vai apagar seu tema, sua cor e todos os nomes salvos localmente!")) {
                localStorage.removeItem("zigos_theme");
                localStorage.removeItem("zigos_color");
                localStorage.removeItem("zigos_default_user");
                localStorage.removeItem(FAVORITES_STORAGE_KEY);
                alert("Sistema zerado. A página será recarregada.");
                location.reload();
            }
        },

        setDefaults() {
            const now = new Date();
            const dateStr = new Intl.DateTimeFormat("en-CA", {
                timeZone: "America/Sao_Paulo",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(now);
            const timeStr = new Intl.DateTimeFormat("pt-BR", {
                timeZone: "America/Sao_Paulo",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(now);

            ["acao", "venda"].forEach((prefix) => {
                if (this.dom[`${prefix}-data`]) this.dom[`${prefix}-data`].value = dateStr;
                if (this.dom[`${prefix}-hora`]) this.dom[`${prefix}-hora`].value = timeStr;
            });
        },

        switchTab(tabId, event) {
            document.querySelectorAll(".section").forEach((section) => section.classList.remove("active"));
            document.querySelectorAll(".nav-btn").forEach((button) => button.classList.remove("active"));
            const nextSection = document.getElementById(tabId);
            nextSection.classList.add("active");
            nextSection.classList.remove("animate-in");
            void nextSection.offsetWidth;
            nextSection.classList.add("animate-in");
            if (event) event.currentTarget.classList.add("active");
        },

        toggleAdmin() {
            if (this.state.isAdmin) return;
            this.state.isAdmin = true;
            this.showToast("Modo Admin liberado!", "success");

            const nav = document.getElementById("nav-menu");
            const btn = document.createElement("button");
            btn.className = "nav-btn";
            btn.innerText = "⚙️ Admin";
            btn.id = "btn-tab-admin";
            btn.onclick = (e) => app.switchTab("admin-panel", e);
            nav.appendChild(btn);

            this.switchTab("admin-panel");
            document.querySelectorAll(".nav-btn").forEach((button) => button.classList.remove("active"));
            btn.classList.add("active");
        },

        normalizeText(text = "") {
            return text
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
        },

        getAllActionNames() {
            return this.state.allActionNames;
        },

        renderActionPicker(filterText = "") {
            const listContainer = this.dom["acao-action-list"];
            const emptyState = this.dom["acao-empty"];
            const helper = this.dom["acao-helper"];
            const showAllButton = this.dom["acao-show-all"];
            const selectedDisplay = this.dom["acao-selected-display"];
            if (!listContainer || !emptyState) return;

            const normalizedFilter = this.normalizeText(filterText.trim());
            const allNames = this.getAllActionNames();
            const shouldShowAll = this.state.showAllActionOptions || Boolean(normalizedFilter);
            const filteredNames = normalizedFilter
                ? allNames.filter((name) => this.normalizeText(name).includes(normalizedFilter))
                : (shouldShowAll ? allNames : []);

            listContainer.innerHTML = filteredNames
                .map((name) => this.renderActionOptionCard(name))
                .join("");

            if (normalizedFilter && !allNames.some((name) => this.normalizeText(name) === normalizedFilter)) {
                listContainer.innerHTML += this.renderManualActionCard(filterText.trim());
            }

            if (helper) helper.style.display = shouldShowAll ? "none" : "block";
            if (showAllButton) showAllButton.textContent = this.state.showAllActionOptions ? "Ocultar lista" : "Mostrar todas";
            emptyState.style.display = shouldShowAll && !filteredNames.length ? "block" : "none";

            if (selectedDisplay) {
                selectedDisplay.textContent = this.state.selectedActionName || "Nenhuma ação selecionada.";
            }

            this.applyStaggerAnimation(listContainer, ".rule-action-card");
        },

        renderActionOptionCard(name) {
            const isActive = this.state.selectedActionName === name ? " active" : "";
            const details = this.state.actionData.details[name] || {};
            const subtitle = details.cartao ? details.cartao : "Selecionar ação";

            return `
                <button class="rule-action-card${isActive}" type="button" onclick="app.selectActionForRegister('${this.escapeForSingleQuote(name)}')">
                    <div class="rule-action-card-main">
                        <strong>${name}</strong>
                        <span>${subtitle}</span>
                    </div>
                </button>
            `;
        },

        renderManualActionCard(rawValue) {
            const safeValue = this.escapeForSingleQuote(rawValue);
            return `
                <button class="rule-action-card" type="button" onclick="app.selectManualAction('${safeValue}')">
                    <div class="rule-action-card-main">
                        <strong>${rawValue}</strong>
                        <span>Adicionar ação manual</span>
                    </div>
                </button>
            `;
        },

        renderRulesExplorer(filterText = "") {
            const listContainer = this.dom["regras-action-list"];
            const favoritesContainer = this.dom["regras-favorites"];
            const emptyState = this.dom["regras-empty"];
            const recentContainer = this.dom["regras-recent"];
            const helper = this.dom["regras-helper"];
            const showAllButton = this.dom["regras-show-all"];
            if (!listContainer || !favoritesContainer || !emptyState) return;

            const normalizedFilter = this.normalizeText(filterText.trim());
            const allNames = this.getAllActionNames();
            const shouldShowAll = this.state.showAllRules || Boolean(normalizedFilter);
            const filteredNames = normalizedFilter
                ? allNames.filter((name) => this.normalizeText(name).includes(normalizedFilter))
                : (shouldShowAll ? allNames : []);

            const favoriteNames = [...this.state.ruleFavorites].filter((name) => allNames.includes(name));
            const recentNames = this.state.recentActions.filter((name) => allNames.includes(name));

            favoritesContainer.innerHTML = favoriteNames.length
                ? favoriteNames.map((name) => this.renderFavoriteChip(name)).join("")
                : '<p class="rules-empty-favorites">Nenhum favorito salvo ainda. Clique na estrela de uma ação para fixar aqui.</p>';

            if (recentContainer) {
                recentContainer.innerHTML = recentNames.length
                    ? recentNames.map((name) => this.renderFavoriteChip(name)).join("")
                    : '<p class="rules-empty-favorites">Nenhuma consulta recente ainda.</p>';
            }

            listContainer.innerHTML = filteredNames
                .map((name) => this.renderRuleActionCard(name))
                .join("");

            if (helper) {
                helper.style.display = shouldShowAll ? "none" : "block";
            }

            if (showAllButton) {
                showAllButton.textContent = this.state.showAllRules ? "Ocultar lista" : "Mostrar todas";
            }

            emptyState.style.display = shouldShowAll && !filteredNames.length ? "block" : "none";
            this.applyStaggerAnimation(listContainer, ".rule-action-card");
            if (favoritesContainer) this.applyStaggerAnimation(favoritesContainer, ".favorite-chip");
            if (recentContainer) this.applyStaggerAnimation(recentContainer, ".favorite-chip");
        },

        renderFavoriteChip(name) {
            const isActive = this.state.selectedRuleAction === name ? " active" : "";
            return `
                <button class="favorite-chip${isActive}" type="button" onclick="app.selectRuleAction('${this.escapeForSingleQuote(name)}')">
                    <span>★</span>${name}
                </button>
            `;
        },

        renderRuleActionCard(name) {
            const isFavorite = this.state.ruleFavorites.has(name);
            const isActive = this.state.selectedRuleAction === name ? " active" : "";
            const details = this.state.actionData.details[name] || {};
            const subtitle = details.cartao ? details.cartao : "Consultar regras";

            return `
                <button class="rule-action-card${isActive}" type="button" onclick="app.selectRuleAction('${this.escapeForSingleQuote(name)}')">
                    <div class="rule-action-card-main">
                        <strong>${name}</strong>
                        <span>${subtitle}</span>
                    </div>
                    <span
                        class="rule-favorite-toggle${isFavorite ? " active" : ""}"
                        title="${isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
                        onclick="app.toggleFavoriteAction('${this.escapeForSingleQuote(name)}', event)"
                    >★</span>
                </button>
            `;
        },

        escapeForSingleQuote(text) {
            return String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        },

        selectRuleAction(actionName) {
            this.state.selectedRuleAction = actionName;
            this.pushRecentAction(actionName);

            if (this.dom["regras-acao-tipo"]) {
                this.dom["regras-acao-tipo"].value = actionName;
            }

            this.renderActionRules(actionName, "acao-info-regras");
            this.renderRulesExplorer(this.dom["regras-search"] ? this.dom["regras-search"].value : "");
        },

        selectActionForRegister(actionName) {
            this.state.selectedActionName = actionName;
            if (this.dom["acao-tipo"]) this.dom["acao-tipo"].value = actionName;
            if (this.dom["acao-search"]) this.dom["acao-search"].value = actionName;
            this.renderActionPicker(this.dom["acao-search"] ? this.dom["acao-search"].value : "");
        },

        selectManualAction(actionName) {
            const value = actionName.trim();
            if (!value) return;
            this.state.selectedActionName = value;
            if (this.dom["acao-tipo"]) this.dom["acao-tipo"].value = "";
            if (this.dom["acao-search"]) this.dom["acao-search"].value = value;
            this.renderActionPicker(value);
        },

        toggleFavoriteAction(actionName, event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            if (this.state.ruleFavorites.has(actionName)) {
                this.state.ruleFavorites.delete(actionName);
                this.showToast("Ação removida dos favoritos.");
            } else {
                this.state.ruleFavorites.add(actionName);
                this.showToast("Ação adicionada aos favoritos!");
            }

            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...this.state.ruleFavorites]));
            this.renderRulesExplorer(this.dom["regras-search"] ? this.dom["regras-search"].value : "");
        },

        toggleShowAllRules() {
            this.state.showAllRules = !this.state.showAllRules;
            this.renderRulesExplorer(this.dom["regras-search"] ? this.dom["regras-search"].value : "");
        },

        toggleShowAllActions() {
            this.state.showAllActionOptions = !this.state.showAllActionOptions;
            this.renderActionPicker(this.dom["acao-search"] ? this.dom["acao-search"].value : "");
        },

        pushRecentAction(actionName) {
            if (!actionName) return;
            this.state.recentActions = [
                actionName,
                ...this.state.recentActions.filter((name) => name !== actionName)
            ].slice(0, 8);
            localStorage.setItem(RECENT_ACTIONS_STORAGE_KEY, JSON.stringify(this.state.recentActions));
        },

        renderActionRules(actionName, containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!actionName || actionName === "Outro") {
                container.classList.add("hidden");
                container.innerHTML = "";
                return;
            }

            const data = this.state.actionData.details[actionName] || {
                bandidos: "-",
                policia: "-",
                refens: "-",
                armamento: "-",
                perimetro: "Não há registro de perímetro exato.",
                extras: "Consulte o manual da cidade no Discord."
            };

            const isFavorite = this.state.ruleFavorites.has(actionName);
            const favoriteLabel = isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos";

            const cartaoHtml = data.cartao
                ? `
                    <div style="margin-bottom: 15px; text-align: center;">
                        <span style="display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; background-color: ${data.bgCartao}; color: ${data.textCartao}; border: 2px solid #ffffff;">
                            Tipo de acesso: ${data.cartao}
                        </span>
                    </div>
                `
                : "";

            container.innerHTML = `
                <div class="rules-title-row">
                    <div>
                        <p class="rule-section-kicker">Ação selecionada</p>
                        <h3 class="rules-action-title">${actionName}</h3>
                    </div>
                    <button class="btn-favorite-rule${isFavorite ? " active" : ""}" type="button" onclick="app.toggleFavoriteAction('${this.escapeForSingleQuote(actionName)}', event)">
                        <span>★</span>${favoriteLabel}
                    </button>
                </div>
                ${cartaoHtml}
                <div class="rules-details-grid">
                    <div class="rule-box"><span class="rule-title">Bandidos</span><span class="rule-val">${data.bandidos}</span></div>
                    <div class="rule-box"><span class="rule-title">Polícia</span><span class="rule-val">${data.policia}</span></div>
                    <div class="rule-box"><span class="rule-title">Reféns</span><span class="rule-val">${data.refens}</span></div>
                    <div class="rule-box"><span class="rule-title">Armamento</span><span class="rule-val">${data.armamento}</span></div>
                </div>
                <div class="rule-full-box mt-10">
                    <span class="rule-title">Perímetro e posições</span>
                    <p class="rule-text">${data.perimetro}</p>
                </div>
                <div class="rule-full-box mt-10">
                    <span class="rule-title">Regras extras</span>
                    <p class="rule-text">${data.extras}</p>
                </div>
            `;
            container.classList.remove("hidden");
        },

        checkAcaoTipo() {
            const select = this.dom["acao-tipo"];
            if (select && select.value) {
                this.selectActionForRegister(select.value);
            }
        },

        getParticipantLabel(participant) {
            return `${participant.passaporte} - ${participant.nome}`;
        },

        findParticipantMatches(filterText = "") {
            const query = filterText.trim();
            const normalizedQuery = this.normalizeText(query);
            if (!query) return [];

            return PARTICIPANT_PRESETS.filter((participant) => {
                const fullLabel = this.getParticipantLabel(participant);
                return participant.passaporte.includes(query)
                    || this.normalizeText(participant.nome).includes(normalizedQuery)
                    || this.normalizeText(fullLabel).includes(normalizedQuery);
            }).slice(0, 8);
        },

        renderParticipantSuggestions(filterText = "") {
            const container = this.dom["participant-action-list"];
            const emptyState = this.dom["participant-empty"];
            if (!container || !emptyState) return;

            const query = filterText.trim();
            const normalizedQuery = this.normalizeText(query);

            if (!query) {
                container.innerHTML = "";
                emptyState.style.display = "none";
                return;
            }

            const matches = this.findParticipantMatches(query);

            container.innerHTML = matches.map((participant) => this.renderParticipantCard(participant)).join("");

            if (!matches.some((participant) => this.normalizeText(this.getParticipantLabel(participant)) === normalizedQuery || participant.passaporte === query || this.normalizeText(participant.nome) === normalizedQuery)) {
                container.innerHTML += this.renderManualParticipantCard(query);
            }

            emptyState.style.display = matches.length ? "none" : "block";
            this.applyStaggerAnimation(container, ".participant-card");
        },

        renderSellerSuggestions(filterText = "") {
            const container = this.dom["seller-action-list"];
            const emptyState = this.dom["seller-empty"];
            if (!container || !emptyState) return;

            const query = filterText.trim();

            if (!query) {
                container.innerHTML = "";
                emptyState.style.display = "none";
                return;
            }

            const matches = this.findParticipantMatches(query);
            container.innerHTML = matches.map((participant) => this.renderSellerCard(participant)).join("");

            emptyState.style.display = matches.length ? "none" : "block";
            this.applyStaggerAnimation(container, ".participant-card");
        },

        renderSellerCard(participant) {
            const value = this.getParticipantLabel(participant);
            const currentValue = this.dom["venda-vendedor"] ? this.dom["venda-vendedor"].value.trim() : "";
            const isActive = currentValue === value ? " active" : "";
            return `
                <button class="participant-card${isActive}" type="button" onclick="app.selectSeller('${this.escapeForSingleQuote(value)}')">
                    <div class="participant-card-main">
                        <strong>${participant.nome}</strong>
                        <span>Passaporte ${participant.passaporte}</span>
                    </div>
                    <span class="participant-card-tag">Usar</span>
                </button>
            `;
        },

        selectSeller(value, clearList = true) {
            const cleanValue = value.trim();
            if (!cleanValue || !this.dom["venda-vendedor"]) return;
            this.dom["venda-vendedor"].value = cleanValue;
            if (clearList && this.dom["seller-action-list"] && this.dom["seller-empty"]) {
                this.dom["seller-action-list"].innerHTML = "";
                this.dom["seller-empty"].style.display = "none";
            }
        },

        renderParticipantCard(participant) {
            const value = this.getParticipantLabel(participant);
            const isActive = this.state.selectedParticipantValue === value ? " active" : "";
            return `
                <button class="participant-card${isActive}" type="button" onclick="app.selectParticipant('${this.escapeForSingleQuote(value)}')">
                    <div class="participant-card-main">
                        <strong>${participant.nome}</strong>
                        <span>Passaporte ${participant.passaporte}</span>
                    </div>
                    <span class="participant-card-tag">Adicionar</span>
                </button>
            `;
        },

        renderManualParticipantCard(rawValue) {
            return `
                <button class="participant-card" type="button" onclick="app.selectParticipant('${this.escapeForSingleQuote(rawValue)}', true)">
                    <div class="participant-card-main">
                        <strong>${rawValue}</strong>
                        <span>Adicionar participante manualmente</span>
                    </div>
                    <span class="participant-card-tag">Manual</span>
                </button>
            `;
        },

        selectParticipant(value, isManual = false) {
            const cleanValue = value.trim();
            if (!cleanValue) return;
            this.state.selectedParticipantValue = cleanValue;
            if (this.dom["novo-participante"]) {
                this.dom["novo-participante"].value = cleanValue;
            }
            this.addParticipant(isManual ? cleanValue : cleanValue);
        },

        showToast(msg, type = "success") {
            const toast = document.createElement("div");
            toast.className = `toast ${type}`;
            toast.innerText = msg;
            this.dom["toast-container"].appendChild(toast);
            setTimeout(() => {
                toast.classList.add("closing");
                setTimeout(() => toast.remove(), 250);
            }, 2750);
        },

        applyStaggerAnimation(container, selector) {
            if (!container) return;
            const items = container.querySelectorAll(selector);
            if (!items.length) return;
            container.classList.add("stagger-list");
            items.forEach((item, index) => {
                item.style.animationDelay = `${Math.min(index * 45, 220)}ms`;
            });
        },

        renderCatalog() {
            const grouped = {};
            const categories = ["Pistolas", "Submetralhadoras", "Fuzis", "Escopetas", "Outros"];

            Object.entries(CATALOG).forEach(([id, item]) => {
                const category = item.category || "Outros";
                if (!grouped[category]) grouped[category] = [];
                grouped[category].push({ ...item, id });
            });

            let htmlBuffer = "";
            categories.forEach((category) => {
                if (!grouped[category]) return;
                htmlBuffer += `<div class="catalog-category-title collapsed" onclick="app.toggleCategory(this)">${category}</div><div class="grid-list-small hidden">`;
                grouped[category].forEach((item) => {
                    htmlBuffer += `
                        <div class="catalog-item" data-id="${item.id}" onclick="app.selectItem('${item.id}')">
                            <div class="cat-name">${item.name}</div>
                            <div class="cat-prices">
                                <span class="price-tag min">R$ ${item.price.min / 1000}k</span>
                                <span class="price-separator">|</span>
                                <span class="price-tag max">R$ ${item.price.max / 1000}k</span>
                            </div>
                        </div>
                    `;
                });
                htmlBuffer += "</div>";
            });

            this.dom["sales-catalog"].innerHTML = htmlBuffer;
            this.applyStaggerAnimation(this.dom["sales-catalog"], ".catalog-item");
        },

        toggleCategory(el) {
            el.classList.toggle("collapsed");
            const content = el.nextElementSibling;
            if (content) content.classList.toggle("hidden");
        },

        selectItem(id) {
            this.state.selectedItemId = id;
            document.querySelectorAll(".catalog-item").forEach((el) => el.classList.remove("selected"));
            const selected = document.querySelector(`.catalog-item[data-id="${id}"]`);
            if (selected) selected.classList.add("selected");
            this.dom["price-controls"].classList.remove("hidden-controls");
            this.dom["select-msg"].style.display = "none";
            this.dom["venda-preco"].value = CATALOG[id].price[this.state.globalPriceType];
            this.dom["venda-qtd"].value = 1;
        },

        updateGlobalPriceType(type) {
            this.state.globalPriceType = type;
            const typeName = type === "min" ? "Parceria" : "Pista";

            if (this.state.selectedItemId) {
                this.dom["venda-preco"].value = CATALOG[this.state.selectedItemId].price[type];
            }

            if (this.state.cart.length > 0) {
                this.state.cart.forEach((item) => {
                    item.price = CATALOG[item.id].price[type];
                    item.total = item.price * item.qtd;
                });
                this.renderCart();
                if (!this.dom["cart-production-area"].classList.contains("hidden")) this.calculateCartProduction();
                this.showToast(`Precos atualizados para ${typeName}`);
            }
        },

        validateInput(el) {
            let val = parseInt(el.value, 10);
            if (isNaN(val) || val < 1) el.value = 1;
        },

        adjustSalesQtd(delta) {
            const el = this.dom["venda-qtd"];
            let value = parseInt(el.value, 10) || 1;
            value += delta;
            if (value < 1) value = 1;
            el.value = value;
        },

        addToCart() {
            const id = this.state.selectedItemId;
            if (!id) return this.showToast("Selecione uma arma", "error");

            const price = parseFloat(this.dom["venda-preco"].value) || 0;
            const qtd = parseInt(this.dom["venda-qtd"].value, 10) || 1;
            if (price <= 0) return this.showToast("Preco invalido", "error");

            const item = CATALOG[id];
            this.state.cart.push({
                id,
                name: item.name,
                price,
                qtd,
                total: price * qtd,
                weight: item.weight,
                cost: item.cost,
                recipe: item.recipe
            });

            this.renderCart();
            this.showToast("Item adicionado!");
            this.dom["cart-production-area"].classList.add("hidden");
        },

        adjustCartQtd(idx, delta) {
            const item = this.state.cart[idx];
            if (!item || item.qtd + delta < 1) return;
            item.qtd += delta;
            item.total = item.price * item.qtd;
            this.renderCart();
            if (!this.dom["cart-production-area"].classList.contains("hidden")) this.calculateCartProduction();
        },

        removeFromCart(idx) {
            this.state.cart.splice(idx, 1);
            this.renderCart();
            this.dom["cart-production-area"].classList.add("hidden");
        },

        clearCart() {
            this.state.cart = [];
            this.renderCart();
            this.dom["cart-production-area"].classList.add("hidden");
        },

        renderCart() {
            const container = this.dom["cart-items"];
            if (this.state.cart.length === 0) {
                container.innerHTML = '<p class="empty-msg">Carrinho vazio</p>';
                this.dom["cart-summary-area"].innerHTML = "";
                return;
            }

            let html = "";
            let grandTotal = 0;
            let totalProdCost = 0;

            this.state.cart.forEach((item, idx) => {
                grandTotal += item.total;
                totalProdCost += item.cost * item.qtd;
                html += `
                    <div class="cart-item">
                        <div class="cart-item-title">${item.name} <span class="badge-count-small">x${item.qtd}</span></div>
                        <div class="cart-controls-row">
                            <div class="qty-selector-sm">
                                <button class="btn-qty-sm" onclick="app.adjustCartQtd(${idx}, -1)">-</button>
                                <span class="qty-display-sm">${item.qtd}</span>
                                <button class="btn-qty-sm" onclick="app.adjustCartQtd(${idx}, 1)">+</button>
                            </div>
                            <div class="cart-item-price">R$ ${item.total.toLocaleString("pt-BR")}</div>
                        </div>
                        <div class="btn-remove-item" onclick="app.removeFromCart(${idx})">&times;</div>
                    </div>
                `;
            });

            const lucroLiquido = grandTotal - totalProdCost;
            const valorVendedor = lucroLiquido * 0.50;
            const faccaoNet = lucroLiquido * 0.50;

            container.innerHTML = html;
            this.dom["cart-summary-area"].innerHTML = `
                <div class="cart-summary-box">
                    <div class="summary-total">Total: R$ ${grandTotal.toLocaleString("pt-BR")}</div>
                    <div class="summary-seller">Vendedor (50% do lucro): R$ ${valorVendedor.toLocaleString("pt-BR")}</div>
                    <div class="summary-faction">Faccao (50% do lucro): R$ ${faccaoNet.toLocaleString("pt-BR")}</div>
                    <div style="color: var(--text-dim); font-size: 0.82rem; margin-top: 8px;">Custo de producao: R$ ${totalProdCost.toLocaleString("pt-BR")}</div>
                </div>
            `;
        },

        calculateCartProduction() {
            if (this.state.cart.length === 0) return this.showToast("Carrinho vazio!", "error");

            const totalMats = [0, 0, 0, 0];
            let totalMatWeight = 0;
            let totalProdWeight = 0;
            let detailsHTML = "";

            this.state.cart.forEach((item) => {
                totalProdWeight += item.weight * item.qtd;
                if (!item.recipe) return;

                let itemMatsHTML = "";
                item.recipe.forEach((qtd, i) => {
                    const total = qtd * item.qtd;
                    totalMats[i] += total;
                    totalMatWeight += total * CONFIG.MAT_WEIGHTS[i];
                    if (total > 0) itemMatsHTML += `<div class="mat-item-tiny"><span>${CONFIG.MAT_NAMES[i]}:</span> <b>${total}</b></div>`;
                });

                detailsHTML += `
                    <div class="detail-card-small">
                        <div class="detail-header-small"><span class="detail-name">${item.name}</span><span class="badge-count-small">x${item.qtd}</span></div>
                        <div class="mats-grid-small">${itemMatsHTML}</div>
                    </div>
                `;
            });

            let matsHtml = totalMats.map((total, i) => i !== 3 && total > 0 ? `<div class="mat-tag-pill"><span>${CONFIG.MAT_NAMES[i]}:</span> <b>${total}</b></div>` : "").join("");
            if (totalMats[3] > 0) matsHtml += `<div class="mat-tag-pill project-tag"><span>Projeto:</span> <b>${totalMats[3]}</b></div>`;

            this.dom["mats-list-display"].innerHTML = matsHtml;
            this.dom["sales-production-details"].innerHTML = detailsHTML;
            if (this.dom["total-mat-weight-display"]) this.dom["total-mat-weight-display"].innerText = `${totalMatWeight.toFixed(2).replace(".", ",")} kg`;
            if (this.dom["total-prod-weight-display"]) this.dom["total-prod-weight-display"].innerText = `${totalProdWeight.toFixed(2).replace(".", ",")} kg`;

            const area = this.dom["cart-production-area"];
            area.classList.remove("hidden");
            area.scrollIntoView({ behavior: "smooth" });
        },

        closeProduction() {
            this.dom["cart-production-area"].classList.add("hidden");
        },
        addParticipant(forcedValue = "") {
            const rawValue = forcedValue || this.dom["novo-participante"].value.trim();
            if (!rawValue) return;

            const normalizedRaw = this.normalizeText(rawValue);
            const matchedParticipant = PARTICIPANT_PRESETS.find((participant) => (
                participant.passaporte === rawValue
                || this.normalizeText(participant.nome) === normalizedRaw
                || this.normalizeText(this.getParticipantLabel(participant)) === normalizedRaw
            ));

            const finalValue = matchedParticipant ? this.getParticipantLabel(matchedParticipant) : rawValue;
            if (this.state.participants.has(finalValue)) {
                this.dom["novo-participante"].value = "";
                this.dom["participant-action-list"].innerHTML = "";
                this.dom["participant-empty"].style.display = "none";
                return;
            }

            this.state.participants.add(finalValue);
            this.renderParticipants();
            this.dom["novo-participante"].value = "";
            this.state.selectedParticipantValue = "";
            this.dom["participant-action-list"].innerHTML = "";
            this.dom["participant-empty"].style.display = "none";
        },

        removeParticipant(val) {
            this.state.participants.delete(val);
            this.renderParticipants();
        },

        renderParticipants() {
            let html = "";
            this.state.participants.forEach((participant) => {
                html += `<div class="chip">${participant} <span onclick="app.removeParticipant('${this.escapeForSingleQuote(participant)}')">&times;</span></div>`;
            });
            this.dom["lista-participantes"].innerHTML = html;
            this.applyStaggerAnimation(this.dom["lista-participantes"], ".chip");
        },

        handleEnterParticipant(e) {
            if (e.key === "Enter") this.addParticipant();
        },

        sendWebhook(url, payload) {
            try {
                fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.error("Erro Discord", error);
            }
        },

        sendActionWebhook() {
            let tipo = this.state.selectedActionName || "";

            const dataInput = this.dom["acao-data"].value.trim();
            const hora = this.dom["acao-hora"].value.trim();
            const resultado = document.querySelector('input[name="resultado"]:checked')?.value;

            if (!tipo || !dataInput || !hora || !resultado) return this.showToast("Preencha todos os dados da ação!", "error");
            if (this.state.participants.size === 0) return this.showToast("Adicione pelo menos um participante!", "error");

            const dataFormatada = this.formatDate(dataInput);
            const participants = Array.from(this.state.participants).join("\n- ");
            const color = resultado === "Vitória" ? 3066993 : 15158332;

            const embedMainAcao = {
                username: "Zigos",
                embeds: [{
                    title: `Registro de Ação: ${tipo}`,
                    color,
                    fields: [
                        { name: "Resultado", value: `**${resultado.toUpperCase()}**`, inline: true },
                        { name: "Motivo", value: "Ação Blipada", inline: true },
                        { name: "Data/Hora", value: `${dataFormatada} às ${hora}`, inline: false },
                        { name: "Participantes", value: `- ${participants}` }
                    ]
                }]
            };

            this.showToast("Ação registrada com sucesso!");
            this.state.participants.clear();
            this.renderParticipants();
            this.pushRecentAction(tipo);

            this.sendWebhook(CONFIG.WEBHOOKS.ACOES, embedMainAcao);

            if (CONFIG.WEBHOOKS.LOGS_ACOES !== "NAO TEM") {
                this.sendWebhook(CONFIG.WEBHOOKS.LOGS_ACOES, {
                    username: "Zigos Log",
                    embeds: [{ color, description: `**Ação:** ${tipo}\n**Data:** ${dataFormatada}\n**Hora:** ${hora}\n**Resultado:** ${resultado}` }]
                });
            }
        },

        sendSaleWebhook() {
            const vendedor = this.dom["venda-vendedor"].value.trim();
            const faccao = this.dom["venda-faccao"].value.trim();
            const dataInput = this.dom["venda-data"].value.trim();
            const horaInput = this.dom["venda-hora"].value.trim();

            if (!vendedor || !faccao || !dataInput || !horaInput) return this.showToast("Preencha todos os campos de venda!", "error");
            if (this.state.cart.length === 0) return this.showToast("O carrinho esta vazio!", "error");

            const totalVenda = this.state.cart.reduce((acc, item) => acc + item.total, 0);
            const custoTotal = this.state.cart.reduce((acc, item) => acc + (item.cost * item.qtd), 0);
            const lucroLiquido = totalVenda - custoTotal;
            const valorVendedor = lucroLiquido * 0.50;
            const lucroFaccao = lucroLiquido * 0.50;
            const itensFormatados = this.state.cart.map((item) => `- ${item.name} | ${item.qtd}x | R$ ${item.total.toLocaleString("pt-BR")}`).join("\n");

            const currentColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
            const embedColor = parseInt(currentColor.replace("#", ""), 16) || 1076026;

            const embedVenda = {
                username: "Zigos",
                embeds: [{
                    title: "Venda de Armamentos Registrada",
                    color: embedColor,
                    fields: [
                        { name: "Vendedor", value: vendedor, inline: true },
                        { name: "Faccao Compradora", value: faccao, inline: true },
                        { name: "Itens", value: itensFormatados, inline: false },
                        { name: "Total Venda", value: `R$ ${totalVenda.toLocaleString("pt-BR")}`, inline: true },
                        { name: "Custo Producao", value: `R$ ${custoTotal.toLocaleString("pt-BR")}`, inline: true },
                        { name: "Vendedor (50% Lucro)", value: `R$ ${valorVendedor.toLocaleString("pt-BR")}`, inline: true },
                        { name: "Faccao (50% Lucro)", value: `**R$ ${lucroFaccao.toLocaleString("pt-BR")}**`, inline: true }
                    ],
                    footer: { text: `Data: ${this.formatDate(dataInput)} as ${horaInput}` }
                }]
            };

            this.showToast("Venda registrada com sucesso!");
            this.clearCart();
            this.sendWebhook(CONFIG.WEBHOOKS.VENDAS, embedVenda);

            if (CONFIG.WEBHOOKS.LOGS_VENDAS !== "NAO TEM") {
                this.sendWebhook(CONFIG.WEBHOOKS.LOGS_VENDAS, {
                    username: "Zigos Log",
                    embeds: [{ color: embedColor, description: `**Comprador:** ${faccao}\n**Produtos:**\n${itensFormatados}\n**Data:** ${this.formatDate(dataInput)} as ${horaInput}` }]
                });
            }
        }    };

    document.addEventListener("DOMContentLoaded", () => window.app.init());
})();
