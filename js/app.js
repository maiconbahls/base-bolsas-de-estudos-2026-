/* ============================================================
   COCAL � Gest�o de Bolsas de Estudos 
   Application Logic � JAVASCRIPT (Vers�o Final Fiel ao Print)
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
    'MATRICULA': ['MATRICULA', 'MATR�CULA', 'MATRIUCLA', 'MAT', 'COD', 'CODIGO', 'ID', 'MATRICULA_COLABORADOR'],
    'NOME': ['NOME', 'NOMES', 'COLABORADOR', 'FUNCIONARIO', 'NOME_COMPLETO', 'NM_FUNCIONARIO', 'NOME_FUNCIONARIO'],
    'DIRETORIA': ['DIRETORIA', 'DIRET', 'DIR', 'UNIDADE_DIRETORIA', 'DESC_DIRETORIA', 'DS_DIRETORIA', 'NOME_DIRETORIA', 'DESCRICAO_DIRETORIA', 'NM_DIRETORIA', 'DS_UNIDADE', 'DIRETORIA_UNIDADE', 'NOME_DA_DIRETORIA'],
    'CURSO': ['CURSO', 'PROGRAMA', 'NOME_CURSO', 'CURSO_FORMACAO', 'DESC_CURSO'],
    'INSTITUICAO': ['INSTITUICAO', 'INSTITUI��O', 'IES', 'FACULDADE', 'UNIVERSIDADE', 'NOME_INSTITUICAO', 'NM_INSTITUICAO', 'INSTITUIO'],
    'NIVEL': ['NIVEL', 'N�VEL', 'GRAU', 'MODALIDADE', 'NIVEL_ENSINO', 'TIPO', 'DESC_NIVEL'],
    'VALOR_REEMBOLSO': ['VALOR_REEMBOLSO', 'VLR_REEMBOLSO', 'REEMBOLSO', 'VALOR', 'VALOR TOTAL', 'VALOR_PAGO', 'VLR_PAGO', 'VALOR_PAGO_R$', 'REEMBOLSO_VALOR', 'VALOR_P'],
    'INICIO': ['INICIO', 'IN�CIO', 'DATA_INICIO', 'DT_INICIO', 'INGRESSO', 'DATA_ADMISSAO', 'DATA_CADASTRO', 'INICIO_CURSO'],
    'FIM': ['FIM', 'DATA_FIM', 'DT_FIM', 'PREVISAO_TERMINO', 'TERMINO', 'FIM_CURSO'],
    'SITUACAO': ['SITUACAO', 'SITUA��O', 'STATUS', 'SIT', 'STATUS_BOLSA', 'SITUACAO_ATUAL'],
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
});

// --------------- NOTIFICA��ES ---------------
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-10 right-10 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl z-[3000] animate-in ${type === 'success' ? 'bg-[#76B82A] text-white' : 'bg-red-500 text-white'}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} mr-2"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function limparCache() {
    if (confirm('Deseja realmente limpar todos os dados salvos localmente? O sistema ser� reiniciado.')) {
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

    const listByDir = (dirSelection === 'todas') ? bolsistas : bolsistas.filter(b => norm(b.diretoria) === norm(dirSelection));
    const listFiltrada = listByDir.filter(b => isBolsistaInSafra(b, safra));
    // FILTER: Strict 'ATIVO' check for KPI
    const ativos = listByDir.filter(b => norm(b.situacao) === 'ATIVO');


    if (document.getElementById('kpi-ativos')) document.getElementById('kpi-ativos').textContent = listFiltrada.length || ativos.length;

    let pgsList = [...pagamentos];
    if (dirSelection !== 'todas') {
        const mats = new Set(listByDir.map(b => b.matricula));
        pgsList = pgsList.filter(p => mats.has(p.matricula));
    }
    if (safra !== 'todas') {
        const [aI, aF] = safra.split('/').map(Number);
        pgsList = pgsList.filter(p => (p.ano === aI && p.mes >= 4) || (p.ano === aF && p.mes <= 3));
    }

    const totalInv = pgsList.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
    if (document.getElementById('kpi-ticket')) document.getElementById('kpi-ticket').textContent = formatBRL(totalInv);

    const m = new Date().getMonth() + 1, a = new Date().getFullYear();
    const matsPagas = new Set(pagamentos.filter(p => p.mes === m && p.ano === a).map(p => p.matricula));
    if (document.getElementById('kpi-novos')) document.getElementById('kpi-novos').textContent = ativos.filter(b => !matsPagas.has(b.matricula)).length;

    renderCharts(listByDir, safra);
    updateDirStats(listByDir, pagamentos, safra);

    const dadosPorMes = {};
    pgsList.forEach(p => {
        const key = `${p.ano}-${String(p.mes).padStart(2, '0')}`;
        if (!dadosPorMes[key]) dadosPorMes[key] = { quantidade: 0, valor: 0 };
        dadosPorMes[key].quantidade++;
        dadosPorMes[key].valor += p.valor;
    });

    window.dadosEvolucaoMensal = {
        dadosPorMes,
        safraAtual: safra,
        dirSelecionada: dirSelection
    };
    window.headcountRawData = headcountRawData;
    window.organograma = organograma;

    if (document.getElementById('container-evolucao-grafico')?.classList.contains('hidden')) {
        if (typeof renderTabelaEvolucao === 'function') renderTabelaEvolucao();
    }

    renderSituacaoTable(listByDir, safra);
}

function renderCharts(baseList, safra) {
    const canvasEv = destroyChart('chartValorVsQtd');
    if (canvasEv) {
        const dadosMes = {};
        const relevantMats = new Set(baseList.map(b => b.matricula));
        let pgsGraf = pagamentos.filter(p => relevantMats.has(p.matricula));
        if (safra !== 'todas') {
            const [aI, aF] = safra.split('/').map(Number);
            pgsGraf = pgsGraf.filter(p => (p.ano === aI && p.mes >= 4) || (p.ano === aF && p.mes <= 3));
        }

        pgsGraf.forEach(p => {
            const key = p.ano + '-' + String(p.mes).padStart(2, '0');
            if (!dadosMes[key]) dadosMes[key] = { v: 0, q: 0 };
            dadosMes[key].v += (parseFloat(p.valor) || 0);
            dadosMes[key].q++;
        });

        const keys = Object.keys(dadosMes).sort();
        charts.chartValorVsQtd = new Chart(canvasEv, {
            type: 'bar',
            data: {
                labels: keys.map(k => `${MESES_ABR[parseInt(k.split('-')[1]) - 1]}/${k.split('-')[0].substring(2)}`),
                datasets: [
                    {
                        label: 'Valor de Reembolso',
                        data: keys.map(k => dadosMes[k].v),
                        backgroundColor: '#76B82A',
                        borderRadius: 5,
                        barPercentage: 0.7,
                        datalabels: {
                            anchor: 'end', align: 'top', offset: 12,
                            formatter: (v) => v > 0 ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
                            font: { size: 10, weight: '800' }, color: '#1e293b'
                        }
                    },
                    {
                        label: 'Quantidade de Reembolso',
                        type: 'line',
                        data: keys.map(k => dadosMes[k].q),
                        borderColor: '#1e293b',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#1e293b', // Solid points like the image
                        pointBorderColor: '#1e293b',
                        pointBorderWidth: 1,
                        pointRadius: 5,
                        fill: false,
                        datalabels: {
                            anchor: 'center', align: 'top', offset: 15,
                            formatter: (v) => v > 0 ? v : '',
                            font: { size: 11, weight: '800' }, color: '#1e293b'
                        }
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                layout: { padding: { top: 60, bottom: 20 } },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 15, // Square icons as requested
                            font: { size: 11, weight: '700' },
                            padding: 30,
                            usePointStyle: false
                        }
                    },
                    datalabels: { display: true }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, padding: 15 } },
                    y: {
                        display: false,
                        beginAtZero: true,
                        suggestedMax: (context) => {
                            const vals = context.chart.data.datasets[0].data;
                            return Math.max(...vals) * 1.35; // Centering the line point in the bar
                        }
                    }
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
                    borderRadius: 5, barThickness: 25
                }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v) => `${v}`, font: { size: 11, weight: '900' }, color: '#1e293b' } },
                scales: { x: { display: false, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 9, weight: '800' }, color: '#64748b' } } }
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
    showToast('? Atualizando bases de dados...');
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

        if (d1 || d2 || d3 || d4) { joinBasesData(); refreshDashboard(); showToast('? Dados sincronizados!'); }
    } catch (e) { console.error(e); showToast('? Erro de conex�o.', 'error'); }
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
        const mat = String(o.MATRICULA || '').trim().replace(/^0+/, '').split('.')[0];
        return {
            matricula: mat, nome: String(o.NOME || '').trim(), diretoria: String(o.DIRETORIA || 'SEM DIRETORIA').toUpperCase().trim(),
            situacao: String(o.SITUACAO || 'REGULAR').toUpperCase().trim(), valor_reembolso: parseBRL(o.VALOR_REEMBOLSO),
            cod_local: String(o.COD_LOCAL || '').trim(), checagem: String(o.CHECAGEM || '').trim(),
            inicio: o.INICIO instanceof Date ? o.INICIO : null, fim: o.FIM instanceof Date ? o.FIM : null,
            curso: String(o.CURSO || '').trim(), nivel: String(o.NIVEL || '').trim()
        };
    }).filter(b => b.matricula);
    saveToStorage();
}

function processPagamentosBase(data) {
    const wb = XLSX.read(data, { type: 'array', cellDates: true });
    const sName = wb.SheetNames.includes('PAGAMENTOS') ? 'PAGAMENTOS' : wb.SheetNames[0];
    const sheet = wb.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    pagamentos = rows.map(row => {
        const o = {}; for (const [k, v] of Object.entries(row)) o[normalizeCol(k)] = v;
        let d = o.DATA instanceof Date ? o.DATA : (o.INICIO instanceof Date ? o.INICIO : null);
        return {
            matricula: String(o.MATRICULA || '').trim().replace(/^0+/, '').split('.')[0],
            mes: d ? d.getMonth() + 1 : 0, ano: d ? d.getFullYear() : 0,
            valor: parseBRL(o.VALOR_REEMBOLSO || o.VALOR || o.VALOR_PAGO)
        };
    }).filter(p => p.matricula && p.mes > 0);
    saveToStorage();
}

function processOrganogramaBase(data) {
    const wb = XLSX.read(data, { type: 'array' });
    organograma = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    saveToStorage();
}

function joinBasesData() {
    if (bolsistas.length === 0 || organograma.length === 0) return;
    const orgMap = {};
    organograma.forEach(i => {
        const r = {}; for (const [k, v] of Object.entries(i)) r[normalizeCol(k)] = v;
        if (r.COD_LOCAL) {
            let dir = String(r.DIRETORIA || '').trim().toUpperCase();
            if (dir) orgMap[String(r.COD_LOCAL).trim()] = dir;
        }
    });

    bolsistas = bolsistas.map(b => {
        const code = String(b.cod_local || '').trim();
        let foundDir = '';
        if (orgMap[code]) foundDir = orgMap[code];
        else {
            let p = code.split('.');
            while (p.length > 0 && !foundDir) {
                if (orgMap[p.join('.')]) foundDir = orgMap[p.join('.')];
                p.pop();
            }
        }
        b.diretoria = foundDir || b.diretoria || 'SEM DIRETORIA';
        return b;
    });

    const dirs = [...new Set(bolsistas.map(b => b.diretoria))].filter(d => d).sort();
    const el = document.getElementById('filtro-diretoria');
    if (el) {
        const cur = el.value;
        el.innerHTML = '<option value="todas">Todas Diretorias</option>' + dirs.map(d => `<option value="${d}">${d}</option>`).join('');
        el.value = (dirs.includes(cur) ? cur : 'todas');
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
function parseBRL(v) { if (!v) return 0; if (typeof v === 'number') return v; return parseFloat(String(v).replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0; }

function saveToStorage() {
    localStorage.setItem('cocal_bolsistas', JSON.stringify(bolsistas)); localStorage.setItem('cocal_pagamentos', JSON.stringify(pagamentos)); localStorage.setItem('cocal_headcount', JSON.stringify(headcountRawData));
}
function loadFromStorage() {
    try { bolsistas = JSON.parse(localStorage.getItem('cocal_bolsistas') || '[]'); pagamentos = JSON.parse(localStorage.getItem('cocal_pagamentos') || '[]'); headcountRawData = JSON.parse(localStorage.getItem('cocal_headcount') || '[]'); } catch { bolsistas = []; }
}

function renderCharts(safra, bolsistas, pagamentos) {
    if (!document.getElementById('chart-evolucao')) return;

    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    // FILTER: Evolution chart uses ONLY active students as requested
    const listEvolucao = bolsistas.filter(b => norm(b.situacao) === 'ATIVO');

    // Chart 1: Evolu��o
    const dataValor = [], dataQtd = [];
    MESES_SAFRA.forEach(mes => {
        const pgsMes = pagamentos.filter(p => p.mes === mes.mes && p.ano === mes.ano);
        const bolsistasMes = listEvolucao.filter(b => {
            const bIni = b.inicio ? new Date(b.inicio) : null;
            const bFim = b.fim ? new Date(b.fim) : null;
            const mesDate = new Date(mes.ano, mes.mes - 1, 1);
            return bIni && bIni <= mesDate && (!bFim || bFim >= mesDate);
        });
        dataValor.push(pgsMes.reduce((acc, p) => acc + p.valor, 0));
        dataQtd.push(bolsistasMes.length);
    });

    destroyChart('chart-evolucao');
    charts['chart-evolucao'] = new Chart(document.getElementById('chart-evolucao').getContext('2d'), {
        type: 'line',
        data: {
            labels: MESES_SAFRA.map(m => m.label),
            datasets: [
                { label: 'Valor Reembolsado', data: dataValor, borderColor: '#76B82A', backgroundColor: 'rgba(118, 184, 42, 0.2)', fill: true, tension: 0.3, yAxisID: 'y' },
                { label: 'Bolsistas Ativos', data: dataQtd, borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)', fill: true, tension: 0.3, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: true, position: 'top' } },
            scales: {
                x: { display: true, title: { display: true, text: 'M�s/Ano' } },
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Valor Reembolsado' }, ticks: { callback: function (value) { return formatBRL(value); } } },
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Bolsistas Ativos' }, grid: { drawOnChartArea: false } }
            }
        }
    });

    // Chart 2: Situa��o
    const counts = {};
    bolsistas.forEach(b => { const s = (b.checagem || b.situacao || 'OUTROS').toUpperCase(); counts[s] = (counts[s] || 0) + 1; });
    const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    destroyChart('chart-situacao');
    charts['chart-situacao'] = new Chart(document.getElementById('chart-situacao').getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: labels.map(l => counts[l]),
                backgroundColor: labels.map(l => (['REGULAR', 'ATIVO'].includes(l)) ? '#76B82A' : '#f59e0b'),
                borderRadius: 5, barThickness: 25
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v) => `${v}`, font: { size: 11, weight: '900' }, color: '#1e293b' } },
            scales: { x: { display: false, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 9, weight: '800' }, color: '#64748b' } } }
        }
    });
}

function verAtivos() {
    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const ativos = bolsistas.filter(b => norm(b.situacao) === 'ATIVO');
    renderTable(ativos);
}

function renderTable(listParam) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    const term = (document.getElementById('searchTerm')?.value || '').toLowerCase();
    const list = (listParam || bolsistas).filter(b => (b.nome + b.matricula + b.diretoria + b.situacao).toLowerCase().includes(term));
    tbody.innerHTML = list.length === 0 ? '<tr><td colspan="6" class="p-10 text-center text-slate-400 font-bold">Nenhum dado...</td></tr>' :
        list.map(b => `<tr class="hover:bg-slate-50 cursor-pointer border-b border-slate-50" onclick="openProfile('${b.matricula}')"><td class="px-6 py-4"><div class="font-black text-slate-800 text-sm uppercase">${b.nome}</div><div class="text-[10px] text-slate-400 font-bold">${b.matricula}</div></td><td class="px-6 py-4 uppercase text-[10px] font-bold text-slate-500">${b.diretoria}</td><td class="px-6 py-4"><div class="text-[10px] font-black text-slate-700 uppercase">${b.nivel || '---'}</div><div class="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">${b.curso || '---'}</div></td><td class="px-6 py-4 text-[10px] font-bold text-slate-500 text-center">-</td><td class="px-6 py-4 text-sm font-black text-slate-800">${formatBRL(b.valor_reembolso)}</td><td class="px-6 py-4"><span class="badge ${['ATIVO', 'REGULAR'].includes(String(b.situacao).toUpperCase()) ? 'badge-active' : 'badge-inactive'}">${b.situacao}</span></td></tr>`).join('');
    if (document.getElementById('tableCountBadge')) document.getElementById('tableCountBadge').textContent = list.length;
}

function openProfile(mat) {
    const b = bolsistas.find(x => x.matricula === mat);
    if (!b) return;
    navigateTo('perfil');
    document.getElementById('profile-name').textContent = b.nome;
    document.getElementById('profile-matricula').textContent = b.matricula;
    document.getElementById('profile-diretoria').textContent = b.diretoria;
    const pgs = pagamentos.filter(p => p.matricula === mat);
    document.getElementById('profile-total-reembolsado').textContent = formatBRL(pgs.reduce((a, p) => a + p.valor, 0));
}

function toggleSituacaoView() {
    const g = document.getElementById('container-grafico-sit'), t = document.getElementById('container-tabela-sit'), b = document.getElementById('btn-toggle-sit');
    if (!g.classList.contains('hidden')) { g.classList.add('hidden'); t.classList.remove('hidden'); b.innerHTML = '<i class="fa-solid fa-chart-column"></i><span>Ver Gr�fico</span>'; renderSituacaoTable(); }
    else { g.classList.remove('hidden'); t.classList.add('hidden'); b.innerHTML = '<i class="fa-solid fa-table"></i><span>Ver Tabela</span>'; }
}

function renderSituacaoTable(list, safra) {
    const body = document.getElementById('body-sit-mensal');
    if (!body) return;
    const filtered = (list || bolsistas).filter(b => isBolsistaInSafra(b, (safra || 'todas')));
    const counts = {};
    filtered.forEach(b => { const s = (b.checagem || b.situacao || 'OUTROS').toUpperCase(); counts[s] = (counts[s] || 0) + 1; });
    body.innerHTML = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(k => `<tr class="hover:bg-slate-50"><td class="py-2.5 px-4 font-bold text-slate-700 uppercase text-[10px]">${k}</td><td class="py-2.5 px-4 text-right font-black text-slate-800">${counts[k]}</td></tr>`).join('');
}

function toggleEvolucaoView() {
    const g = document.getElementById('container-evolucao-grafico'), t = document.getElementById('container-evolucao-tabela'), b = document.getElementById('btn-toggle-evolucao');
    if (!g.classList.contains('hidden')) {
        g.classList.add('hidden'); t.classList.remove('hidden'); b.innerHTML = '<i class="fa-solid fa-chart-column"></i><span>Ver Gr�fico</span>';
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
