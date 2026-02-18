/* ============================================================
   COCAL – Gestão de Bolsas de Estudos 
   Application Logic – JAVASCRIPT FIXED
   ============================================================ */

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_ABR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MESES_SAFRA = [
    { mes: 4, ano: 2025, label: 'Abr/25' },
    { mes: 5, ano: 2025, label: 'Mai/25' },
    { mes: 6, ano: 2025, label: 'Jun/25' },
    { mes: 7, ano: 2025, label: 'Jul/25' },
    { mes: 8, ano: 2025, label: 'Ago/25' },
    { mes: 9, ano: 2025, label: 'Set/25' },
    { mes: 10, ano: 2025, label: 'Out/25' },
    { mes: 11, ano: 2025, label: 'Nov/25' },
    { mes: 12, ano: 2025, label: 'Dez/25' },
    { mes: 1, ano: 2026, label: 'Jan/26' },
    { mes: 2, ano: 2026, label: 'Fev/26' },
    { mes: 3, ano: 2026, label: 'Mar/26' }
];

const COLUMN_MAP = {
    'MATRICULA': ['MATRICULA', 'MATRÍCULA', 'MATRIUCLA', 'MAT', 'COD', 'CODIGO', 'ID', 'MATRICULA_COLABORADOR', 'MATRICULA_COLAB', 'NUMERO_MATRICULA', 'CODIGO_FUNCIONARIO'],
    'NOME': ['NOME', 'NOMES', 'COLABORADOR', 'FUNCIONARIO', 'NOME_COMPLETO', 'NM_FUNCIONARIO', 'NOME_FUNCIONARIO'],
    'DIRETORIA': ['DIRETORIA', 'DIRET', 'DIR', 'UNIDADE_DIRETORIA', 'DESC_DIRETORIA', 'DS_DIRETORIA', 'NOME_DIRETORIA', 'DESCRICAO_DIRETORIA', 'NM_DIRETORIA', 'DS_UNIDADE', 'DIRETORIA_UNIDADE', 'NOME_DA_DIRETORIA'],
    'CURSO': ['CURSO', 'PROGRAMA', 'NOME_CURSO', 'CURSO_FORMACAO', 'DESC_CURSO'],
    'INSTITUICAO': ['INSTITUICAO', 'INSTITUIÇÃO', 'IES', 'FACULDADE', 'UNIVERSIDADE', 'NOME_INSTITUICAO', 'NM_INSTITUICAO', 'INSTITUIO'],
    'NIVEL': ['NIVEL', 'NÍVEL', 'GRAU', 'MODALIDADE', 'NIVEL_ENSINO', 'TIPO', 'DESC_NIVEL'],
    'VALOR_REEMBOLSO': ['VALOR_REEMBOLSO', 'VLR_REEMBOLSO', 'REEMBOLSO', 'VALOR', 'VALOR TOTAL', 'VALOR_PAGO', 'VLR_PAGO', 'VALOR_PAGO_R$', 'REEMBOLSO_VALOR', 'VALOR_P'],
    'INICIO': ['INICIO', 'INÍCIO', 'DATA_INICIO', 'DT_INICIO', 'INGRESSO', 'DATA_ADMISSAO', 'DATA_CADASTRO', 'INICIO_CURSO'],
    'FIM': ['FIM', 'DATA_FIM', 'DT_FIM', 'PREVISAO_TERMINO', 'TERMINO', 'FIM_CURSO'],
    'SITUACAO': ['SITUACAO', 'SITUAÇÃO', 'STATUS', 'SIT', 'STATUS_BOLSA', 'SITUACAO_ATUAL'],
    'CHECAGEM': ['CHECAGEM', 'VERIFICACAO', 'CONFERENCIA', 'STATUS_CHECAGEM'],
    'DATA_CHECAGEM': ['DATA_CHECAGEM', 'DATA_STATUS', 'DATA_SITUACAO', 'DT_CHECAGEM', 'DATA CHECAGEM'],
    'COD_LOCAL': ['COD_LOCAL', 'CODIGO_LOCAL', 'COD LOCAL', 'CENTRO_CUSTO', 'COD_CC', 'CC', 'ESTRUTURA', 'COD._LOCAL']
};

let bolsistas = [];
let pagamentos = [];
let organograma = [];
let headcountRawData = [];
let charts = {};

// --------------- INIT ---------------
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ChartDataLabels !== 'undefined') Chart.register(ChartDataLabels);
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.weight = '700';
    loadFromStorage();
    if (sessionStorage.getItem('logged') === 'true') showApp();

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '1') {
            e.preventDefault();
            if (typeof togglePresentationMode === 'function') togglePresentationMode();
        }
    });
});

// --------------- NOTIFICAÇÕES ---------------
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-10 right-10 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl z-[3000] animate-in ${type === 'success' ? 'bg-[#76B82A] text-white' : 'bg-red-500 text-white'}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} mr-2"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function limparCache() {
    if (confirm('Deseja realmente limpar todos os dados salvos localmente? O sistema será reiniciado.')) {
        localStorage.clear(); sessionStorage.clear(); location.reload();
    }
}

// --------------- AUTH ---------------
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username')?.value.trim().toLowerCase();
    const p = document.getElementById('password')?.value.trim();
    if (['gestao', 'rh', 'admin', 'maicon'].includes(u) && (p === 'gestao' || p === 'rh2025' || p === 'admin' || p === 'cocal')) {
        sessionStorage.setItem('logged', 'true'); showApp();
    } else {
        document.getElementById('login-error')?.classList.remove('hidden');
    }
});

function logout() { sessionStorage.removeItem('logged'); location.reload(); }

function showApp() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('app-header').classList.remove('hidden-section');
    document.getElementById('app-container').classList.remove('hidden-section');
    setTimeout(() => {
        document.getElementById('app-content').style.opacity = '1';
        navigateTo('dashboard');
        autoConnect();
    }, 50);
}

// --------------- NAVIGATION ---------------
function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden-section'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const view = document.getElementById(`view-${page}`);
    if (view) view.classList.remove('hidden-section'), view.classList.add('animate-in');
    const nav = document.getElementById(`nav-${page}`);
    if (nav) nav.classList.add('active');
    if (page === 'dashboard') refreshDashboard();
    if (page === 'tabela') renderTable();
}

// --------------- DASHBOARD ---------------
function refreshDashboard() {
    const safra = document.getElementById('filtro-safra')?.value || 'todas';
    const dirSelection = document.getElementById('filtro-diretoria')?.value || 'todas';
    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

    // Filter list for KPIs: strictly based on user requirements
    const strictlyAtivos = bolsistas.filter(b => norm(b.situacao) === 'ATIVO');
    const ativosFiltrados = (dirSelection === 'todas') ? strictlyAtivos : strictlyAtivos.filter(b => norm(b.diretoria) === norm(dirSelection));
    const ativosNaSafra = ativosFiltrados.filter(b => isBolsistaInSafra(b, safra));

    // KPI 1: Bolsistas Ativos (Strictly SITUACAO=ATIVO)
    if (document.getElementById('kpi-ativos')) document.getElementById('kpi-ativos').textContent = ativosNaSafra.length;

    // KPI 2: Pendência Pagto (SITUACAO=ATIVO and CHECAGEM NÃO REGULAR)
    if (document.getElementById('kpi-novos')) {
        const pendentes = ativosNaSafra.filter(b => norm(b.checagem) !== 'REGULAR');
        document.getElementById('kpi-novos').textContent = pendentes.length;
    }

    // Investment Logic: Sum all payments in the base that fall within the Safra
    let pgsListTotal = [];
    if (dirSelection === 'todas') {
        pgsListTotal = pagamentos; // Use all historical payments to match Excel base total
    } else {
        const listForInv = bolsistas.filter(b => norm(b.diretoria) === norm(dirSelection));
        const matsInDir = new Set(listForInv.map(b => b.matricula));
        pgsListTotal = pagamentos.filter(p => matsInDir.has(p.matricula));
    }

    // Apply Safra filter to the payments
    if (safra !== 'todas') {
        const [aI, aF] = safra.split('/').map(Number);
        pgsListTotal = pgsListTotal.filter(p => (p.ano === aI && p.mes >= 4) || (p.ano === aF && p.mes <= 3));
    }

    const totalInv = pgsListTotal.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
    if (document.getElementById('kpi-ticket')) document.getElementById('kpi-ticket').textContent = formatBRL(totalInv);

    // Render Charts and other stats
    renderCharts(ativosFiltrados, safra);
    updateDirStats(ativosFiltrados, pagamentos, safra);
    renderSituacaoTable(ativosFiltrados, safra);

    const dadosPorMes = {};
    pgsListTotal.forEach(p => {
        const key = `${p.ano}-${String(p.mes).padStart(2, '0')}`;
        if (!dadosPorMes[key]) dadosPorMes[key] = { quantidade: 0, valor: 0 };
        dadosPorMes[key].quantidade++;
        dadosPorMes[key].valor += p.valor;
    });

    // Expose data globally for external scripts (like toggle_evolucao.js)
    window.dadosEvolucaoMensal = {
        dadosPorMes,
        safraAtual: safra,
        dirSelecionada: dirSelection
    };
    window.headcountRawData = headcountRawData;
    window.organograma = organograma;

    // Populate the table view as well
    const tableBody = document.getElementById('tableEvolucaoMensal');
    if (tableBody) {
        const keys = Object.keys(dadosPorMes).sort();
        let html = '';
        let totalV = 0, totalQ = 0;
        keys.forEach(k => {
            const d = dadosPorMes[k];
            totalV += d.valor;
            totalQ += d.quantidade;
            const avg = d.quantidade > 0 ? d.valor / d.quantidade : 0;
            const [ano, mes] = k.split('-');
            const label = `${MESES_ABR[parseInt(mes) - 1]}/${ano.substring(2)}`;
            html += `<tr>
                <td class="py-3 px-4 font-bold text-slate-700">${label}</td>
                <td class="py-3 px-4 text-right font-black text-slate-900">${formatBRL(d.valor)}</td>
                <td class="py-3 px-4 text-right font-black text-slate-600">${d.quantidade}</td>
                <td class="py-3 px-4 text-right font-bold text-slate-500">${formatBRL(avg)}</td>
            </tr>`;
        });
        tableBody.innerHTML = html || '<tr><td colspan="4" class="py-10 text-center text-slate-400">Sem dados no período</td></tr>';
        if (document.getElementById('totalValor')) document.getElementById('totalValor').textContent = formatBRL(totalV);
        if (document.getElementById('totalQtd')) document.getElementById('totalQtd').textContent = totalQ;
        if (document.getElementById('totalMedia')) document.getElementById('totalMedia').textContent = formatBRL(totalQ > 0 ? totalV / totalQ : 0);
    }

    if (document.getElementById('container-evolucao-grafico')?.classList.contains('hidden')) {
        if (typeof renderTabelaEvolucao === 'function') renderTabelaEvolucao();
    }

    renderSituacaoTable(ativosFiltrados, safra);
}

function renderCharts(baseList, safra) {
    const canvasEv = destroyChart('chartValorVsQtd');
    if (canvasEv) {
        const dadosMes = {};
        const relevantMats = new Set(baseList.map(b => b.matricula));
        let pgsGraf = pagamentos.filter(p => relevantMats.has(p.matricula));

        // Handle Filtering logic consistent with toggle_evolucao.js
        const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
        const dirSelection = document.getElementById('filtro-diretoria')?.value || 'todas';
        const dirAlvo = norm(dirSelection);

        if (safra !== 'todas') {
            const [aI, aF] = safra.split('/').map(Number);
            pgsGraf = pgsGraf.filter(p => (p.ano === aI && p.mes >= 4) || (p.ano === aF && p.mes <= 3));
        }

        pgsGraf.forEach(p => {
            const key = p.ano + '-' + String(p.mes).padStart(2, '0');
            if (!dadosMes[key]) dadosMes[key] = { v: 0, q: 0, hc: 0 };
            dadosMes[key].v += (parseFloat(p.valor) || 0);
            dadosMes[key].q++;
        });

        const keys = Object.keys(dadosMes).sort();

        // --- Headcount Logic ---
        let filteredHC = (headcountRawData || []);
        if (dirAlvo !== 'TODAS' && filteredHC.length > 0 && typeof organograma !== 'undefined') {
            const orgMap = {};
            organograma.forEach(item => {
                const r = {}; for (const [k, v] of Object.entries(item)) r[normalizeCol(k)] = v;
                const code = String(r.COD_LOCAL || '').trim();
                if (code) orgMap[code] = norm(r.DIRETORIA);
            });
            filteredHC = filteredHC.filter(hr => {
                let code = hr.cod_local; if (!code) return false;
                let dir = ''; let p = code.split('.');
                while (p.length > 0 && !dir) { dir = orgMap[p.join('.')]; p.pop(); }
                return dir === dirAlvo;
            });
        }

        keys.forEach(k => {
            const matching = filteredHC.filter(hr => {
                const status = (hr.statuses && hr.statuses[k]) ? String(hr.statuses[k]).toUpperCase() : '';
                return (status === '1' || status.includes('ATIVO')) && !status.includes('INATIVO');
            });
            dadosMes[k].hc = matching.length;
        });

        charts.chartValorVsQtd = new Chart(canvasEv, {
            type: 'bar',
            data: {
                labels: keys.map(k => `${MESES_ABR[parseInt(k.split('-')[1]) - 1]}/${k.split('-')[0].substring(2)}`),
                datasets: [
                    {
                        label: 'Pagamentos Realizados',
                        type: 'line',
                        data: keys.map(k => dadosMes[k].q),
                        borderColor: '#1e293b',
                        backgroundColor: '#1e293b',
                        borderWidth: 3,
                        pointBackgroundColor: '#1e293b',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: false,
                        tension: 0.3,
                        order: 1,
                        yAxisID: 'y1',
                        datalabels: {
                            align: 'top',
                            offset: 6,
                            formatter: (v) => v > 0 ? v : '',
                            font: { size: 10, weight: '900' },
                            color: '#1e293b'
                        }
                    },
                    {
                        label: 'Ativos (Headcount)',
                        type: 'line',
                        data: keys.map(k => dadosMes[k].hc),
                        borderColor: '#76B82A',
                        backgroundColor: '#76B82A15',
                        borderWidth: 3,
                        pointBackgroundColor: '#76B82A',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true,
                        tension: 0.3,
                        order: 2,
                        yAxisID: 'y',
                        datalabels: {
                            align: 'bottom',
                            offset: 6,
                            formatter: (v) => v > 0 ? v : '',
                            font: { size: 10, weight: '900' },
                            color: '#76B82A'
                        }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 40, left: 10, right: 10, bottom: 0 } },
                plugins: {
                    legend: { display: false },
                    datalabels: { display: true },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { weight: '600' } } },
                    y: {
                        display: false,
                        beginAtZero: true,
                        suggestedMax: (ctx) => Math.max(...ctx.chart.data.datasets[1].data) * 1.2
                    },
                    y1: {
                        display: false,
                        beginAtZero: true,
                        suggestedMax: (ctx) => Math.max(...ctx.chart.data.datasets[0].data) * 2.5
                    }
                }
            }
        });
    }

    const canvasQtd = destroyChart('chartQtdEvolucao');
    if (canvasQtd) {
        // Reuse data calculated above
        const dadosMes = {};
        const relevantMats = new Set(baseList.map(b => b.matricula));
        let pgsGraf = pagamentos.filter(p => relevantMats.has(p.matricula));
        if (safra !== 'todas') {
            const [aI, aF] = safra.split('/').map(Number);
            pgsGraf = pgsGraf.filter(p => (p.ano === aI && p.mes >= 4) || (p.ano === aF && p.mes <= 3));
        }

        pgsGraf.forEach(p => {
            const key = p.ano + '-' + String(p.mes).padStart(2, '0');
            if (!dadosMes[key]) dadosMes[key] = { q: 0 };
            dadosMes[key].q++;
        });

        const keys = Object.keys(dadosMes).sort();
        charts.chartQtdEvolucao = new Chart(canvasQtd, {
            type: 'line',
            data: {
                labels: keys.map(k => `${MESES_ABR[parseInt(k.split('-')[1]) - 1]}/${k.split('-')[0].substring(2)}`),
                datasets: [{
                    label: 'Quantidade de Pagamentos',
                    data: keys.map(k => dadosMes[k].q),
                    borderColor: '#1e293b',
                    backgroundColor: '#1e293b22',
                    borderWidth: 4,
                    pointRadius: 6,
                    pointBackgroundColor: '#1e293b',
                    fill: true,
                    tension: 0.3,
                    datalabels: { align: 'top', font: { weight: '900' } }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    const canvasSit = destroyChart('chartSituacoes');
    if (canvasSit) {
        const counts = {};
        const filteredList = baseList.filter(b => isBolsistaInSafra(b, safra));
        filteredList.forEach(b => {
            const sit = (b.checagem || b.situacao || 'OUTROS').toUpperCase().trim();
            counts[sit] = (counts[sit] || 0) + 1;
        });
        const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        charts.chartSituacoes = new Chart(canvasSit, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: labels.map(l => counts[l]),
                    backgroundColor: labels.map(l => (['REGULAR', 'ATIVO'].includes(l)) ? '#76B82A' : '#f59e0b'),
                    borderRadius: 5, barThickness: 18
                }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                layout: { padding: { right: 80 } }, // Give space for the "X BOLSISTAS" label
                onClick: (event, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const label = labels[index];
                        if (typeof filterTableBySituation === 'function') {
                            filterTableBySituation(label);
                        }
                    }
                },
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                },
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (v) => `${v} BOLSISTAS`,
                        font: { size: 10, weight: '900' },
                        color: '#1e293b'
                    }
                },
                scales: {
                    x: { display: false, beginAtZero: true },
                    y: {
                        grid: { display: false },
                        ticks: { font: { size: 9, weight: '800' }, color: '#64748b' }
                    }
                }
            }
        });
    }
}

function destroyChart(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
    const old = document.getElementById(id);
    if (!old) return null;
    const n = old.cloneNode(true);
    old.parentNode.replaceChild(n, old);
    return n;
}

function updateDirStats(baseList, pgs, safra) {
    const container = document.getElementById('table-detalhes-diretoria');
    if (!container) return;
    const stats = {};
    baseList.forEach(b => {
        const d = b.diretoria || 'SEM DIRETORIA';
        if (!stats[d]) stats[d] = { q: 0, v: 0 };
        if (['ATIVO', 'REGULAR'].includes(String(b.situacao).toUpperCase())) stats[d].q++;
    });
    let pgsFiltered = [...pgs];
    if (safra !== 'todas') {
        const [aI, aF] = safra.split('/').map(Number);
        pgsFiltered = pgsFiltered.filter(p => (p.ano === aI && p.mes >= 4) || (p.ano === aF && p.mes <= 3));
    }
    pgsFiltered.forEach(p => {
        const b = bolsistas.find(x => x.matricula === p.matricula);
        if (b && stats[b.diretoria]) stats[b.diretoria].v += (parseFloat(p.valor) || 0);
    });
    container.innerHTML = Object.entries(stats).sort((a, b) => b[1].q - a[1].q).map(([dir, s]) => `<tr class="border-b border-slate-50 hover:bg-slate-50"><td class="py-2 px-3 uppercase text-[9px] font-bold text-slate-700">${dir}</td><td class="py-2 px-3 text-center font-bold text-slate-500">${s.q}</td><td class="py-2 px-3 text-right font-black text-slate-800">${formatBRL(s.v)}</td></tr>`).join('');
}

// --------------- DATA FETCH ---------------
async function autoConnect() {
    showToast('↻ Atualizando bases de dados...');
    try {
        const fetchFile = async (p) => {
            const r = await fetch(p + '?v=' + Date.now());
            return r.ok ? new Uint8Array(await r.arrayBuffer()) : null;
        };
        const d1 = await fetchFile('BASES.BOLSAS/PROGRAMA.BOLSAS.ESTUDOS.BASE.xlsx');
        const d2 = await fetchFile('BASES.BOLSAS/BASE.PAGAMENTOS.xlsx');
        const d3 = await fetchFile('BASES.BOLSAS/ORGANOGRAMA.xlsx');
        const d4 = await fetchFile('BASES.BOLSAS/BOLSISTAS.COMPT.ATIVOS.xlsx');

        if (d1) processBolsasBase(d1);
        if (d2) processPagamentosBase(d2);
        if (d3) processOrganogramaBase(d3);
        if (d4) processHeadcountBase(d4);

        if (d1 || d2 || d3 || d4) { joinBasesData(); refreshDashboard(); showToast('✔ Dados sincronizados!'); }
    } catch (e) { console.error(e); showToast('❌ Erro de conexão.', 'error'); }
}

function processHeadcountBase(data) {
    const wb = XLSX.read(data, { type: 'array', cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 });
    if (rows.length < 1) return;

    const headers = rows[0];
    const dataRows = rows.slice(1);

    headcountRawData = dataRows.map(row => {
        const o = {}; const statuses = {};
        headers.forEach((h, i) => {
            let v = row[i];
            if (h instanceof Date) {
                const key = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}`;
                statuses[key] = v;
            } else if (typeof h === 'string' && h.match(/^\d{4}-\d{2}/)) {
                statuses[h.substring(0, 7)] = v;
            } else {
                const norm = normalizeCol(h);
                o[norm] = v;
            }
        });
        return { matricula: String(o.MATRICULA || '').trim().replace(/^0+/, '').split('.')[0], cod_local: String(o.COD_LOCAL || '').trim(), statuses };
    }).filter(h => h.matricula);
    saveToStorage();
}

function normalizeCol(n) {
    if (!n) return '';
    const clean = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim().replace(/[.:]/g, '').replace(/\s+/g, '_');
    const nc = clean(n);
    for (const [std, als] of Object.entries(COLUMN_MAP)) if (clean(std) === nc || als.some(a => clean(a) === nc)) return std;
    return nc;
}

function processBolsasBase(data) {
    const wb = XLSX.read(data, { type: 'array', cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    bolsistas = rows.map(row => {
        const o = {}; for (const [k, v] of Object.entries(row)) o[normalizeCol(k)] = v;
        const mat = String(o.MATRICULA || '').trim().replace(/^0+/, '').split('.')[0].toUpperCase();
        return {
            matricula: mat,
            nome: String(o.NOME || '').trim(),
            diretoria: String(o.DIRETORIA || 'SEM DIRETORIA').toUpperCase().trim(),
            situacao: String(o.SITUACAO || '').toUpperCase().trim(),
            checagem: String(o.CHECAGEM || 'REGULAR').toUpperCase().trim(),
            valor_reembolso: parseBRL(o.VALOR_REEMBOLSO),
            cod_local: String(o.COD_LOCAL || '').trim(),
            data_checagem: o.DATA_CHECAGEM instanceof Date ? o.DATA_CHECAGEM : null,
            inicio: o.INICIO instanceof Date ? o.INICIO : null,
            fim: o.FIM instanceof Date ? o.FIM : null,
            curso: String(o.CURSO || '').trim(),
            nivel: String(o.NIVEL || '').trim(),
            ies: String(o.INSTITUICAO || o.IES || '').trim()
        };
    }).filter(b => b.matricula);
    saveToStorage();
}

function processPagamentosBase(data) {
    const wb = XLSX.read(data, { type: 'array', cellDates: true });
    let allPgs = [];

    wb.SheetNames.forEach(sName => {
        const sheet = wb.Sheets[sName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const sheetPgs = rows.map(row => {
            const o = {}; for (const [k, v] of Object.entries(row)) o[normalizeCol(k)] = v;
            // Improved date detection: checks multiple possible columns
            let d = o.DATA instanceof Date ? o.DATA :
                (o.DATA_PAGAMENTO instanceof Date ? o.DATA_PAGAMENTO :
                    (o.INICIO instanceof Date ? o.INICIO :
                        (o.DATA_VALOR instanceof Date ? o.DATA_VALOR : null)));

            return {
                matricula: String(o.MATRICULA || '').trim().replace(/^0+/, '').split('.')[0].toUpperCase(),
                mes: d ? d.getMonth() + 1 : 0,
                ano: d ? d.getFullYear() : 0,
                valor: parseBRL(o.VALOR_REEMBOLSO || o.VALOR || o.VALOR_PAGO || o.VALOR_P)
            };
        }).filter(p => p.matricula && p.mes > 0);
        allPgs = allPgs.concat(sheetPgs);
    });

    pagamentos = allPgs;
    saveToStorage();
}

function processOrganogramaBase(data) {
    const wb = XLSX.read(data, { type: 'array' });
    organograma = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    saveToStorage();
}


function joinBasesData() {
    // 1. Tenta enriquecer dados usando o Organograma (se disponível)
    if (bolsistas.length > 0 && organograma.length > 0) {
        const orgMap = {};
        organograma.forEach(i => {
            const r = {}; for (const [k, v] of Object.entries(i)) r[normalizeCol(k)] = v;
            const mat = String(r.MATRICULA || '').trim().replace(/^0+/, '').split('.')[0].toUpperCase();
            if (mat) orgMap[mat] = String(r.DIRETORIA || '').trim().toUpperCase();
            if (r.COD_LOCAL) {
                let dir = String(r.DIRETORIA || '').trim().toUpperCase();
                if (dir) orgMap[String(r.COD_LOCAL).trim()] = dir;
            }
        });

        bolsistas = bolsistas.map(b => {
            // First try matching by Matricula directly in Organograma
            if (orgMap[b.matricula]) foundDir = orgMap[b.matricula];
            else if (orgMap[code]) foundDir = orgMap[code];
            else {
                let p = code.split('.');
                while (p.length > 0 && !foundDir) {
                    if (orgMap[p.join('.')]) foundDir = orgMap[p.join('.')];
                    p.pop();
                }
            }
            // Prioriza a Diretoria que vem na BASE (excel principal), conforme pedido pelo usuário
            // O Organograma serve como fallback caso a base esteja vazia
            b.diretoria = (b.diretoria && b.diretoria !== 'SEM DIRETORIA') ? b.diretoria : (foundDir || 'SEM DIRETORIA');
            return b;
        });
    }

    // 2. Popula os filtros de Diretorias (Dashboard, Tabela e Histórico)
    if (bolsistas.length > 0) {
        const dirs = [...new Set(bolsistas.map(b => b.diretoria))].filter(d => d && d !== 'SEM DIRETORIA').sort();
        const filters = ['filtro-diretoria', 'filtro-tabela-diretoria', 'filterHistoryDir'];

        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const cur = el.value;
                el.innerHTML = '<option value="todas">Todas as Diretorias</option>' + dirs.map(d => `<option value="${d}">${d}</option>`).join('');
                el.value = (dirs.concat('todas').includes(cur) ? cur : 'todas');
            }
        });
    }
}

function isBolsistaInSafra(b, s) {
    if (s === 'todas') return true;
    const [aI, aF] = s.split('/').map(Number);
    const bIni = b.inicio ? new Date(b.inicio) : null;
    const bFim = b.fim ? new Date(b.fim) : null;
    if (!bIni) return true;
    return bIni <= new Date(aF, 2, 31, 23, 59) && (bFim ? bFim >= new Date(aI, 3, 1) : true);
}

function formatBRL(v) { return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function parseBRL(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    let s = String(v).replace('R$', '').trim();
    if (!s) return 0;
    // Check if it's BR format (comma for decimal) or US format (dot for decimal but might have commas for thousands)
    if (s.includes(',') && s.includes('.')) {
        if (s.indexOf('.') < s.indexOf(',')) { // BR format 1.234,56
            s = s.replace(/\./g, '').replace(',', '.');
        } else { // US format 1,234.56
            s = s.replace(/,/g, '');
        }
    } else if (s.includes(',')) { // Only comma, assume BR decimal
        s = s.replace(',', '.');
    }
    return parseFloat(s) || 0;
}

function saveToStorage() {
    localStorage.setItem('cocal_bolsistas', JSON.stringify(bolsistas)); localStorage.setItem('cocal_pagamentos', JSON.stringify(pagamentos)); localStorage.setItem('cocal_headcount', JSON.stringify(headcountRawData));
}
function loadFromStorage() {
    try { bolsistas = JSON.parse(localStorage.getItem('cocal_bolsistas') || '[]'); pagamentos = JSON.parse(localStorage.getItem('cocal_pagamentos') || '[]'); headcountRawData = JSON.parse(localStorage.getItem('cocal_headcount') || '[]'); } catch { bolsistas = []; }
}


function filterTableByCategory(category) {
    const safra = document.getElementById('filtro-safra')?.value || 'todas';
    const dirSelection = document.getElementById('filtro-diretoria')?.value || 'todas';
    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

    navigateTo('tabela');

    // Filter based on same logic as cards
    let base = bolsistas;
    if (dirSelection !== 'todas') {
        base = base.filter(b => norm(b.diretoria) === norm(dirSelection));
    }

    // Apply Safra filter as the cards do
    let filtered = base.filter(b => isBolsistaInSafra(b, safra));

    if (category === 'ativos') {
        filtered = filtered.filter(b => norm(b.situacao) === 'ATIVO');
    } else if (category === 'pendentes') {
        // Match KPI 2: Ativo + Diferente de Regular
        filtered = filtered.filter(b => norm(b.situacao) === 'ATIVO' && norm(b.checagem) !== 'REGULAR');
    }

    // Update search UI
    const searchInput = document.getElementById('searchTerm');
    if (searchInput) {
        searchInput.value = '';
        searchInput.placeholder = category === 'todos' ? 'Pesquisar...' :
            (category === 'ativos' ? 'LISTA: BOLSISTAS ATIVOS' : 'LISTA: PENDÊNCIA PAGTO');
    }

    // Sync table directory filter to match dashboard
    const tableDirFilter = document.getElementById('filtro-tabela-diretoria');
    if (tableDirFilter) tableDirFilter.value = dirSelection;

    renderTable(filtered);
}

function filterTableBySituation(situation) {
    const safra = document.getElementById('filtro-safra')?.value || 'todas';
    const dirSelection = document.getElementById('filtro-diretoria')?.value || 'todas';
    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

    navigateTo('tabela');

    let base = bolsistas;
    if (dirSelection !== 'todas') {
        base = base.filter(b => norm(b.diretoria) === norm(dirSelection));
    }

    let filtered = base.filter(b => isBolsistaInSafra(b, safra));

    filtered = filtered.filter(b => {
        const s = (b.checagem || b.situacao || 'OUTROS').toUpperCase();
        return norm(s) === norm(situation);
    });

    const searchInput = document.getElementById('searchTerm');
    if (searchInput) {
        searchInput.value = '';
        searchInput.placeholder = `LISTA: ${situation.toUpperCase()}`;
    }

    const tableDirFilter = document.getElementById('filtro-tabela-diretoria');
    if (tableDirFilter) tableDirFilter.value = dirSelection;

    renderTable(filtered);
}

function renderTable(listParam) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    const term = (document.getElementById('searchTerm')?.value || '').toLowerCase();
    const dirFilter = document.getElementById('filtro-tabela-diretoria')?.value || 'todas';
    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

    let list = listParam || bolsistas;

    // Filter by Directory
    if (dirFilter !== 'todas') {
        list = list.filter(b => norm(b.diretoria) === norm(dirFilter));
    }

    // Filter by Search Term
    if (term) {
        list = list.filter(b => (b.nome + b.matricula).toLowerCase().includes(term));
    }

    const safra = document.getElementById('filtro-safra')?.value || 'todas';
    const [aI, aF] = (safra !== 'todas') ? safra.split('/').map(Number) : [0, 0];

    tbody.innerHTML = list.length === 0 ? '<tr><td colspan="6" class="p-10 text-center text-slate-400 font-bold">Nenhum dado encontrado para os filtros aplicados...</td></tr>' :
        list.map(b => {
            // Calcular total na Safra para este colaborador (para bater com o perfil)
            let listPgs = pagamentos.filter(p => p.matricula === b.matricula);
            if (safra !== 'todas') {
                listPgs = listPgs.filter(p => (p.ano === aI && p.mes >= 4) || (p.ano === aF && p.mes <= 3));
            }
            const totalSafra = listPgs.reduce((acc, p) => acc + (p.valor || 0), 0);

            // Se totalSafra for 0 e for 'todas', use o valor base como indicativo
            const vDesc = (safra === 'todas' && totalSafra === 0) ? (b.valor_reembolso || 0) : totalSafra;

            return `
                <tr class="hover:bg-slate-50 cursor-pointer border-b border-slate-50" onclick="openProfile('${b.matricula}')">
                    <td class="px-6 py-4">
                        <div class="font-black text-slate-800 text-sm uppercase">${b.nome}</div>
                        <div class="text-[10px] text-slate-400 font-bold">${b.matricula}</div>
                    </td>
                    <td class="px-6 py-4 uppercase text-[10px] font-bold text-slate-500">${b.diretoria}</td>
                    <td class="px-6 py-4">
                        <div class="text-[10px] font-black text-slate-700 uppercase">${b.nivel || '---'}</div>
                        <div class="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">${b.curso || '---'}</div>
                    </td>
                    <td class="px-6 py-4 text-[10px] font-bold text-slate-500 text-center">-</td>
                    <td class="px-6 py-4 text-sm font-black text-slate-800">${formatBRL(vDesc)}</td>
                    <td class="px-6 py-4">
                        <span class="badge ${['ATIVO', 'REGULAR'].includes(String(b.situacao).toUpperCase()) ? 'badge-active' : 'badge-inactive'}">${b.situacao}</span>
                    </td>
                </tr>`;
        }).join('');

    if (document.getElementById('tableCountBadge')) document.getElementById('tableCountBadge').textContent = list.length;
}

function openProfile(mat) {
    const b = bolsistas.find(x => x.matricula === mat);
    if (!b) return;
    navigateTo('perfil');
    console.log('Abrindo perfil Matrícula:', mat);
    console.log('Dados do Bolsista:', b);

    // Filtrar pagamentos para o perfil
    const pgsProfile = pagamentos.filter(p => p.matricula === mat);
    console.log('Pagamentos perfil:', mat, pgsProfile);

    // Basic Info
    document.getElementById('profile-name').textContent = b.nome;
    document.getElementById('profile-matricula').textContent = b.matricula;
    document.getElementById('profile-diretoria').textContent = b.diretoria;
    document.getElementById('profile-pfp').textContent = b.nome.charAt(0);

    const statusBadge = document.getElementById('profile-status-badge');
    if (statusBadge) {
        statusBadge.textContent = b.situacao;
        statusBadge.className = `badge ${['ATIVO', 'REGULAR'].includes(String(b.situacao).toUpperCase()) ? 'badge-active' : 'badge-inactive'}`;
    }

    // Academic Data
    const acadContainer = document.getElementById('profile-curso-info');
    if (acadContainer) {
        acadContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instituição</p>
                    <p class="text-xs font-bold text-slate-700 uppercase">${b.instituicao || '---'}</p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nível</p>
                    <p class="text-xs font-bold text-slate-700 uppercase">${b.nivel || '---'}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Curso</p>
                    <p class="text-xs font-bold text-slate-700 uppercase">${b.curso || '---'}</p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Início</p>
                    <p class="text-xs font-bold text-slate-700 uppercase">${b.inicio ? b.inicio.toLocaleDateString('pt-BR') : '---'}</p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Término</p>
                    <p class="text-xs font-bold text-slate-700 uppercase">${b.fim ? b.fim.toLocaleDateString('pt-BR') : '---'}</p>
                </div>
            </div>
        `;
    }

    // Payments Logic
    const pgsSorted = [...pgsProfile].sort((a, b) => (b.ano * 100 + b.mes) - (a.ano * 100 + a.mes));
    const total = pgsSorted.reduce((acc, p) => acc + p.valor, 0);
    document.getElementById('profile-total-reembolsado').textContent = formatBRL(total);

    // Payment History Table
    const histTable = document.getElementById('profile-history-table');
    if (histTable) {
        histTable.innerHTML = pgsSorted.length === 0 ? '<tr><td colspan="4" class="p-8 text-center text-slate-400 italic">Nenhum pagamento registrado</td></tr>' :
            pgsSorted.map(p => `
                <tr class="border-b border-slate-50 hover:bg-slate-50">
                    <td class="py-4 px-6 text-[11px] font-bold text-slate-600 uppercase">${MESES_ABR[p.mes - 1]}/${String(p.ano).substring(2)}</td>
                    <td class="py-4 px-6 text-[11px] font-black text-slate-800">${formatBRL(p.valor)}</td>
                    <td class="py-4 px-6 text-[10px] font-medium text-slate-400">${p.mes}/${p.ano}</td>
                    <td class="py-4 px-6"><span class="badge badge-active !text-[9px]">PAGO</span></td>
                </tr>
            `).join('');
    }

    // Evolution Chart (Profile)
    const canvas = destroyChart('chartProfileEvolution');
    if (canvas) {
        // Group by month for the last 12 months or all payments
        const last12 = [...pgsSorted].reverse().slice(-12);
        charts.chartProfileEvolution = new Chart(canvas, {
            type: 'line',
            data: {
                labels: last12.map(p => `${MESES_ABR[p.mes - 1]}/${String(p.ano).substring(2)}`),
                datasets: [{
                    label: 'Investimento Mensal',
                    data: last12.map(p => p.valor),
                    borderColor: '#76B82A',
                    backgroundColor: 'rgba(118, 184, 42, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#76B82A',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 35, left: 10, right: 10, bottom: 0 } },
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        align: 'top',
                        anchor: 'end',
                        offset: 4,
                        formatter: (v) => formatBRL(v),
                        font: { size: 10, weight: '900' },
                        color: '#76B82A'
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9, weight: '700' }, color: '#94a3b8' } },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { display: false },
                        suggestedMax: (ctx) => {
                            const max = Math.max(...ctx.chart.data.datasets[0].data);
                            return max > 0 ? max * 1.25 : 100;
                        }
                    }
                }
            }
        });
    }
}

function toggleEvolucaoView() {
    const g1 = document.getElementById('container-evolucao-grafico');
    const g2 = document.getElementById('container-evolucao-qtd');
    const t = document.getElementById('container-evolucao-tabela');
    const b = document.getElementById('btn-toggle-evolucao');

    if (!g1.classList.contains('hidden')) {
        // Mode 1 to Mode 2 (Quantity Chart)
        g1.classList.add('hidden');
        g2.classList.remove('hidden');
        t.classList.add('hidden');
        b.innerHTML = '<i class="fa-solid fa-table"></i><span>Ver Tabela</span>';
    } else if (!g2.classList.contains('hidden')) {
        // Mode 2 to Mode 3 (Table)
        g1.classList.add('hidden');
        g2.classList.add('hidden');
        t.classList.remove('hidden');
        b.innerHTML = '<i class="fa-solid fa-chart-column"></i><span>Ver Investimento</span>';
    } else {
        // Mode 3 to Mode 1 (Investment Chart)
        g1.classList.remove('hidden');
        g2.classList.add('hidden');
        t.classList.add('hidden');
        b.innerHTML = '<i class="fa-solid fa-chart-line"></i><span>Ver Quantidade</span>';
    }
}

function toggleSituacaoView() {
    const g = document.getElementById('container-grafico-sit'), t = document.getElementById('container-tabela-sit'), b = document.getElementById('btn-toggle-sit');
    if (!g.classList.contains('hidden')) { g.classList.add('hidden'); t.classList.remove('hidden'); b.innerHTML = '<i class="fa-solid fa-chart-column"></i><span>Ver Gráfico</span>'; renderSituacaoTable(); }
    else { g.classList.remove('hidden'); t.classList.add('hidden'); b.innerHTML = '<i class="fa-solid fa-table"></i><span>Ver Tabela</span>'; }
}

function renderSituacaoTable(list, safra) {
    const body = document.getElementById('body-sit-mensal');
    if (!body) return;

    const safraFiltro = safra || document.getElementById('filter-safra')?.value || 'todas';
    const filtered = (list || bolsistas).filter(b => isBolsistaInSafra(b, safraFiltro));

    // Determinar os meses da Safra selecionada
    let mesesSafra = [];
    if (safraFiltro === 'todas') {
        mesesSafra = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]; // Padrão
    } else {
        mesesSafra = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
    }

    const situacoes = Array.from(new Set(filtered.map(b => (b.checagem || b.situacao || 'OUTROS').toUpperCase()))).sort();

    // Obter mês atual para colocar "ATIVOS" / "REGULARES" no mês correto se não tiver data
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;

    let html = '';
    situacoes.forEach(sit => {
        let totalLinha = 0;
        let colunasHtml = '';

        mesesSafra.forEach(m => {
            const count = filtered.filter(b => {
                const s = (b.checagem || b.situacao || 'OUTROS').toUpperCase();
                if (s !== sit) return false;

                // Se for REGULAR ou ATIVO, e não tiver data de checagem, joga no mês atual
                if (['REGULAR', 'ATIVO'].includes(s)) {
                    if (!b.data_checagem) return m === mesAtual;
                }

                // Se tiver data de checagem, usa o mês dela
                if (b.data_checagem) {
                    return (b.data_checagem.getMonth() + 1) === m;
                }

                // Se for CONCLUIDO, CANCELADO, etc., e tiver data FIM, usa o mês de FIM
                if (['CONCLUIDO', 'CANCELADO', 'DEMITIDO', 'BLOQUEIO', 'TRANSFERENCIA'].includes(s)) {
                    if (b.fim) return (b.fim.getMonth() + 1) === m;
                }

                // Fallback: se não tiver data nenhuma e for o mês atual
                return m === mesAtual;
            }).length;

            totalLinha += count;
            colunasHtml += `<td class="py-1 px-1 text-center font-bold ${count > 0 ? 'text-slate-800' : 'text-slate-200'}">${count > 0 ? count : '-'}</td>`;
        });

        html += `
            <tr onclick="filterTableBySituation('${sit}')" class="hover:bg-slate-50 border-b border-slate-50 transition-colors cursor-pointer group">
                <td class="py-1 px-3 font-black text-slate-700 text-[10px] uppercase sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:text-[#76B82A] transition-colors">${sit}</td>
                ${colunasHtml}
                <td class="py-1 px-3 text-right font-black text-slate-900 bg-slate-50/30">${totalLinha}</td>
            </tr>
        `;
    });

    body.innerHTML = html;
}

function togglePresentationMode() {
    const isPresentation = document.body.classList.toggle('presentation-mode');
    const header = document.getElementById('app-header');

    if (isPresentation) {
        if (header) header.style.display = 'none';
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        showToast('Modo Apresentação Ativado (CTRL+1 para sair)', 'success');
    } else {
        if (header) header.style.display = 'flex';
        if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen();
        showToast('Modo Apresentação Desativado', 'success');
    }
}

function toggleEvolucaoView() {
    const g = document.getElementById('container-evolucao-grafico'), t = document.getElementById('container-evolucao-tabela'), b = document.getElementById('btn-toggle-evolucao');
    if (!g.classList.contains('hidden')) {
        g.classList.add('hidden'); t.classList.remove('hidden'); b.innerHTML = '<i class="fa-solid fa-chart-column"></i><span>Ver Gráfico</span>';
        if (typeof renderTabelaEvolucao === 'function') renderTabelaEvolucao();
    } else {
        g.classList.remove('hidden'); t.classList.add('hidden'); b.innerHTML = '<i class="fa-solid fa-table"></i><span>Ver Tabela</span>';

    }
}

function triggerImport(id) { document.getElementById(`input-${id === 'base' ? 'base-bolsas' : (id === 'sucessao' ? 'sucessao' : 'penalidades')}`).click(); }

function handleFileImport(input, type) {
    if (!input.files[0]) return;
    const r = new FileReader(); r.onload = (e) => {
        const d = new Uint8Array(e.target.result);
        if (type === 'base') processBolsasBase(d);
        if (type === 'sucessao') processOrganogramaBase(d);
        if (type === 'penalidades') processPagamentosBase(d);
        joinBasesData(); refreshDashboard();
    };
    r.readAsArrayBuffer(input.files[0]);
}