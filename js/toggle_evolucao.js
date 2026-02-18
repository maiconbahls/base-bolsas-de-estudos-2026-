

// ━━━━━━━━━━━━━━━━━ FUNÇÃO DE ALTERNÂNCIA GRÁFICO/TABELA ━━━━━━━━━━━━━━━━━
function toggleEvolucaoView() {
    const containerGrafico = document.getElementById('container-evolucao-grafico');
    const containerTabela = document.getElementById('container-evolucao-tabela');
    const botao = document.getElementById('btn-toggle-evolucao');

    if (containerGrafico && containerTabela && botao) {
        const mostrandoGrafico = !containerGrafico.classList.contains('hidden');

        if (mostrandoGrafico) {
            // Mudar para TABELA
            containerGrafico.classList.add('hidden');
            containerTabela.classList.remove('hidden');
            botao.innerHTML = '<i class="fa-solid fa-chart-column"></i><span>Ver Gráfico</span>';

            // Renderizar a tabela usando os dados já processados
            renderTabelaEvolucao();
        } else {
            // Voltar para GRÁFICO
            containerTabela.classList.add('hidden');
            containerGrafico.classList.remove('hidden');
            botao.innerHTML = '<i class="fa-solid fa-table"></i><span>Ver Tabela</span>';
        }
    }
}

function renderTabelaEvolucao() {
    if (!window.dadosEvolucaoMensal) {
        console.warn('Dados da evolução mensal não disponíveis');
        return;
    }

    const { dadosPorMes, safraAtual, dirSelecionada } = window.dadosEvolucaoMensal;
    const containerTabela = document.getElementById('container-evolucao-tabela');
    if (!containerTabela) return;

    // Normalização para comparação robusta
    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const dirAlvo = norm(dirSelecionada);

    // Definir meses a exibir (Safra: Abril a Março)
    let mesesTabela = [];
    if (safraAtual === 'todas') {
        let chaves = new Set(Object.keys(dadosPorMes));
        if (typeof headcountRawData !== 'undefined' && headcountRawData) {
            headcountRawData.forEach(hr => {
                Object.keys(hr.statuses || {}).forEach(k => chaves.add(k));
            });
        }
        mesesTabela = Array.from(chaves).sort();
    } else {
        const [anoIni, anoFim] = safraAtual.split('/').map(Number);
        for (let m = 4; m <= 12; m++) mesesTabela.push(`${anoIni}-${String(m).padStart(2, '0')}`);
        for (let m = 1; m <= 3; m++) mesesTabela.push(`${anoFim}-${String(m).padStart(2, '0')}`);
    }

    // Filtrar para não mostrar meses futuros demais, respeitando o "até agora" do usuário
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    mesesTabela = mesesTabela.filter(m => m <= currentKey || (dadosPorMes[m] && dadosPorMes[m].quantidade > 0));

    // 1. Filtrar Headcount por Diretoria (Usando a lógica de conexão da COD_LOCAL)
    let filteredHeadcount = typeof headcountRawData !== 'undefined' ? (headcountRawData || []) : [];
    if (dirAlvo !== 'TODAS' && filteredHeadcount.length > 0 && typeof organograma !== 'undefined') {
        const orgMap = {};
        organograma.forEach(item => {
            const row = {};
            for (const [k, v] of Object.entries(item)) row[normalizeCol ? normalizeCol(k) : k] = v;
            const code = String(row.COD_LOCAL || '').trim();
            if (code) orgMap[code] = norm(row.DIRETORIA);
        });

        filteredHeadcount = filteredHeadcount.filter(hr => {
            let code = hr.cod_local;
            if (!code) return false;
            let dir = '';
            let p = code.split('.');
            while (p.length > 0 && !dir) {
                dir = orgMap[p.join('.')];
                p.pop();
            }
            return dir === dirAlvo;
        });
    }

    // Gerar dados das 3 linhas solicitadas
    const rowComptLabels = mesesTabela.map(chave => {
        const [ano, mes] = chave.split('-');
        return `${MESES[parseInt(mes) - 1].substring(0, 3)}/${ano.substring(2)}`;
    });

    const rowAtivosValues = mesesTabela.map(key => {
        const matching = filteredHeadcount.filter(hr => {
            const status = (hr.statuses && hr.statuses[key]) ? String(hr.statuses[key]).toUpperCase() : '';
            return (status === '1' || status.includes('ATIVO')) && !status.includes('INATIVO');
        });

        if (key === '2025-04') {
            console.log(`🔍 Debug Tabela (Abril/25): Total Filtrado=${filteredHeadcount.length}, Encontrados=${matching.length}`);
            if (matching.length === 0 && filteredHeadcount.length > 0) {
                console.log('📌 Exemplo de status no primeiro registro:', filteredHeadcount[0].statuses);
            }
        }

        return matching.length;
    });

    const rowPagosValues = mesesTabela.map(key => dadosPorMes[key]?.quantidade || 0);

    // Gerar HTML da Tabela Horizontal (3 Linhas de Dados)
    let html = `
        <div class="overflow-x-auto pb-4 custom-scrollbar">
            <table class="w-full text-[11px] border-separate border-spacing-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <thead>
                    <tr class="bg-slate-800 text-white">
                        <th class="py-4 px-6 text-left font-black uppercase tracking-widest border-b border-slate-700 bg-slate-900 sticky left-0 z-10 w-[220px]">
                            INDICADORES / COMPT
                        </th>
                        ${rowComptLabels.map(label => `
                            <th class="py-4 px-4 text-center font-black uppercase tracking-widest border-b border-slate-700 min-w-[90px]">
                                ${label}
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr class="bg-white hover:bg-slate-50/80 transition-all group">
                        <td class="py-5 px-6 font-black text-slate-700 border-r border-slate-100 bg-slate-50/50 sticky left-0 z-10 group-hover:bg-slate-100 transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-7 h-7 rounded-lg bg-[#76B82A]/10 text-[#76B82A] flex items-center justify-center text-sm">
                                    <i class="fa-solid fa-users"></i>
                                </div>
                                TOTAL ATIVOS (HEADCOUNT)
                            </div>
                        </td>
                        ${rowAtivosValues.map(val => `
                            <td class="py-5 px-4 text-center font-black text-slate-600 border-r border-slate-50 last:border-r-0">
                                ${val > 0 ? val : `<span class="text-slate-200">-</span>`}
                            </td>
                        `).join('')}
                    </tr>
                    <tr class="bg-white hover:bg-slate-50/80 transition-all group">
                        <td class="py-5 px-6 font-black text-slate-700 border-r border-slate-100 bg-slate-50/50 sticky left-0 z-10 group-hover:bg-slate-100 transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-sm">
                                    <i class="fa-solid fa-money-bill-transfer"></i>
                                </div>
                                PAGAMENTOS REALIZADOS
                            </div>
                        </td>
                        ${rowPagosValues.map(val => `
                            <td class="py-5 px-4 text-center font-black text-slate-800 border-r border-slate-50 last:border-r-0">
                                ${val > 0 ? val : `<span class="text-slate-200">-</span>`}
                            </td>
                        `).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    containerTabela.innerHTML = html;
}
� *