document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formProduto");
    const nomeInput = document.getElementById("nomeProduto");
    const valorInput = document.getElementById("valorProduto");
    const quantidadeInput = document.getElementById("quantidadeProduto");
    const totalModal = document.getElementById("totalModal");
    const totalCarrinho = document.getElementById("totalCarrinho");

    const formatarMoeda = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // ==========================================
    // MÓDULO DE EDIÇÃO DO ORÇAMENTO
    // ==========================================
    const btnEditarOrcamento = document.querySelector(".edit-bg");
    const spanOrcamentoValor = document.getElementById("orcamento-valor");
    const formOrcamento = document.getElementById("formOrcamento");
    const inputNovoOrcamento = document.getElementById("novoOrcamento");

    if (btnEditarOrcamento) {
        btnEditarOrcamento.addEventListener("click", () => {
            const valorAtualTexto = spanOrcamentoValor.textContent;
            const valorNumerico = Number(valorAtualTexto.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
            
            inputNovoOrcamento.value = valorNumerico.toFixed(2);

            if (window.jQuery) {
                window.jQuery("#modalOrcamento").modal("show");
            }
        });
    }

    if (formOrcamento) {
        formOrcamento.addEventListener("submit", (e) => {
            e.preventDefault();

            const novoValor = Number(inputNovoOrcamento.value);

            if (novoValor < 0) {
                alert("O orçamento não pode ser negativo.");
                return;
            }

            // Atualiza o valor na tela
            spanOrcamentoValor.textContent = formatarMoeda(novoValor);

            // Fecha o modal corretamente via jQuery do Bootstrap
            if (window.jQuery) {
                window.jQuery("#modalOrcamento").modal("hide");
            }
        });

        if (window.jQuery) {
            window.jQuery("#modalOrcamento").on("shown.bs.modal", () => inputNovoOrcamento.focus());
        }
    }
    // ==========================================

    function atualizarTotalModal() {
        const preco = Number(valorInput.value) || 0;
        const qtd = Number(quantidadeInput.value) || 1;
        totalModal.textContent = formatarMoeda(preco * qtd);
    }

    valorInput.addEventListener("input", atualizarTotalModal);
    quantidadeInput.addEventListener("input", atualizarTotalModal);

    document.getElementById("diminuirQtd").addEventListener("click", () => {
        const qtd = Number(quantidadeInput.value) || 1;
        if (qtd > 1) {
            quantidadeInput.value = qtd - 1;
            atualizarTotalModal();
        }
    });

    document.getElementById("aumentarQtd").addEventListener("click", () => {
        quantidadeInput.value = (Number(quantidadeInput.value) || 1) + 1;
        atualizarTotalModal();
    });

    function calcularTotalItem(linha) {
        const preco = Number(linha.dataset.preco) || 0;
        const qtd = Number(linha.querySelector(".input-qtd").value) || 1;
        return preco * qtd;
    }

    function atualizarTotais() {
        let totalGeral = 0;

        document.querySelectorAll(".item-lista").forEach(linha => {
            const totalItem = calcularTotalItem(linha);
            linha.querySelector(".valor-total-item").textContent = formatarMoeda(totalItem);
            totalGeral += totalItem;
        });

        totalCarrinho.textContent = formatarMoeda(totalGeral);
    }

    // Inicializa valores da lista existente no HTML
    document.querySelectorAll(".item-lista").forEach(linha => {
        const precoEl = linha.querySelector(".preco-unitario");
        if (precoEl) {
            const precoLimpo = precoEl.textContent.replace(/[^\d,]/g, "").replace(",", ".");
            linha.dataset.preco = Number(precoLimpo) || 0;
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome = nomeInput.value.trim();
        const preco = Number(valorInput.value);
        const quantidade = Number(quantidadeInput.value);

        if (!nome || preco <= 0 || quantidade < 1) {
            alert("Preencha os campos corretamente.");
            return;
        }

        const linha = document.createElement("div");
        linha.className = "row item-lista align-items-center";
        linha.dataset.preco = preco;

        linha.innerHTML = `
            <div class="col-md-3">
                <div class="produto">${escapeHtml(nome)}</div>
            </div>
            <div class="col-md-3 text-center">
                <span class="produto-rotulo">Valor: </span>
                <span class="preco-unitario">${formatarMoeda(preco)}</span>
            </div>
            <div class="col-md-3 text-center">
                <div class="controle-quantidade">
                    <button type="button" class="btn-qtd btn-menos" aria-label="Diminuir">−</button>
                    <div class="qtd-display">
                        <span class="qtd-label">QTD: </span>
                        <input type="text" class="input-qtd" value="${quantidade}x" readonly>
                    </div>
                    <button type="button" class="btn-qtd btn-mais" aria-label="Aumentar">+</button>
                </div>
            </div>
            <div class="col-md-3 text-center">
                <span class="produto-rotulo">Valor total: </span>
                <span class="preco-unitario valor-total-item">${formatarMoeda(preco * quantidade)}</span>
            </div>
        `;

        const divisor = document.createElement("hr");
        divisor.className = "divisor";

        const containerTotal = document.querySelector(".total-compra-container");
        containerTotal.parentNode.insertBefore(divisor, containerTotal);
        containerTotal.parentNode.insertBefore(linha, containerTotal);

        atualizarTotais();

        form.reset();
        quantidadeInput.value = 1;
        atualizarTotalModal();

        if (window.jQuery) {
            window.jQuery("#modalProduto").modal("hide");
        }
    });

    // Delegação de eventos para botões de quantidade da lista
    document.addEventListener("click", (e) => {
        const botao = e.target.closest(".btn-menos, .btn-mais");
        if (!botao) return;

        const linha = botao.closest(".item-lista");
        if (!linha) return;

        const inputQtd = linha.querySelector(".input-qtd");
        let qtd = parseInt(inputQtd.value) || 1;

        if (botao.classList.contains("btn-mais")) {
            qtd++;
        } else if (botao.classList.contains("btn-menos")) {
            qtd--;
            if (qtd <= 0) {
                const proximo = linha.nextElementSibling;
                if (proximo && proximo.classList.contains("divisor")) {
                    proximo.remove();
                }
                linha.remove();
                atualizarTotais();
                return;
            }
        }

        inputQtd.value = qtd + "x";
        atualizarTotais();
    });

    // Função auxiliar simples para prevenir XSS básico
    function escapeHtml(string) {
        return string.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    atualizarTotais();
    atualizarTotalModal();

    if (window.jQuery) {
        window.jQuery("#modalProduto").on("shown.bs.modal", () => nomeInput.focus());
    }
});E