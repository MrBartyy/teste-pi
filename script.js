document.addEventListener('DOMContentLoaded', () => {
    const itens = document.querySelectorAll('.item-lista');
    const totalCarrinho = document.getElementById('totalCarrinho');

    function atualizarCarrinho() {
        let somaGeral = 0;

        itens.forEach(item => {
            const precoElement = item.querySelector('.preco-unitario:not(.valor-total-item)');
            const qtdInput = item.querySelector('.input-qtd');
            const totalItemElement = item.querySelector('.valor-total-item');

            // Converte o preço unitário para número
            const textoPreco = precoElement.textContent.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
            const valorUnitario = Number(textoPreco) || 0;

            // Converte a quantidade para número
            const textoQtd = qtdInput.value.replace('x', '').trim();
            const quantidade = Number(textoQtd) || 1;

            // Calcula o total do item individual
            const totalItem = valorUnitario * quantidade;

            // Atualiza o texto do total do item formatado
            totalItemElement.textContent = totalItem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // Acumula no valor total geral do carrinho
            somaGeral += totalItem;
        });

        // Atualiza o valor total geral da compra na tela
        if (totalCarrinho) {
            totalCarrinho.textContent = somaGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }

    // Configura os botões de cada item individualmente
    itens.forEach(item => {
        const btnMenos = item.querySelector('.btn-menos');
        const btnMais = item.querySelector('.btn-mais');
        const qtdInput = item.querySelector('.input-qtd');

        btnMenos.addEventListener('click', () => {
            let valorAtual = Number(qtdInput.value.replace('x', '').trim()) || 1;
            if (valorAtual > 1) {
                qtdInput.value = (valorAtual - 1) + 'x';
                atualizarCarrinho();
            }
        });

        btnMais.addEventListener('click', () => {
            let valorAtual = Number(qtdInput.value.replace('x', '').trim()) || 1;
            if (valorAtual => 1) {
                qtdInput.value = (valorAtual + 1) + 'x';
                atualizarCarrinho();
            }
        });
    });

    // Executa o cálculo ao carregar a página para inicializar os valores corretos
    atualizarCarrinho();


});