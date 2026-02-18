function navigateToDirectory(dir) {
    // 1. Define o filtro de diretoria na página de tabela
    const filterEl = document.getElementById('filtro-diretoria-tabela'); // Ajustar se o ID for outro
    const globalFilterEl = document.getElementById('filtro-diretoria'); // O filtro do Dashboard

    if (globalFilterEl) globalFilterEl.value = dir;

    // 2. Navega para a página de tabela
    navigateTo('tabela');

    // 3. Aplica o filtro na tabela (o renderTable usa o valor do campo de filtro)
    setTimeout(() => {
        const tableFilter = document.getElementById('filterDir'); // ID comum para filtro de tabela
        if (tableFilter) {
            tableFilter.value = dir;
            renderTable();
        }
    }, 100);
}
