const fetch = require("node-fetch");
const { By, Key, until } = require("selenium-webdriver");
const baixarPdf = require("./baixar_pdf"); // Importando a função de baixar PDF

// URL da planilha do Google Sheets exportada como CSV
const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/12aCWAzA5LsUicRzDCChsCfLyP-gqeQPxjWm71CCiRRY/export?format=csv";

// Função para carregar nomes do Google Sheets
async function carregarNomesGoogleSheets() {
    try {
        console.log("📥 Buscando dados do Google Sheets...");
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        if (!response.ok) throw new Error("❌ Erro ao acessar a planilha. Status: " + response.status);
        
        const csvData = await response.text();
        const linhas = csvData.split("\n"); // Divide o CSV em linhas
        const nomes = linhas.map(linha => linha.split(",")[0].trim()).filter(nome => nome.length > 0);
        
        console.log(`📄 ${nomes.length} nomes carregados do Google Sheets.`);
        return nomes;
    } catch (error) {
        console.error("⚠️ Erro ao carregar nomes do Google Sheets:", error);
        return [];
    }
}

// Função para pesquisar requerentes no sistema
async function pesquisarRequerentes(driver, wait) {
    try {
        const nomesRequerentes = await carregarNomesGoogleSheets() || [];
        
        if (!Array.isArray(nomesRequerentes) || nomesRequerentes.length === 0) {
            console.error("❌ Erro: nomesRequerentes não é um array válido ou está vazio.");
            return;
        }

        for (let nome of nomesRequerentes) {
            try {
                console.log(`🔍 Pesquisando: ${nome}`);
                const campoPesquisa = await wait.until(until.elementLocated(By.name("campo01")));
                await campoPesquisa.clear();
                await campoPesquisa.sendKeys(nome, Key.ENTER);

                await driver.sleep(5000); // Aguarda a atualização da página

                // Aguarda a tabela de resultados e clica no primeiro resultado
                const primeiroResultado = await wait.until(until.elementLocated(By.xpath("//table[contains(@class, 'dados_consulta')]//tr[td[@nomecoluna='numero']]")));
                await primeiroResultado.click();
                console.log(`✅ Clicou no primeiro resultado para: ${nome}`);

                await driver.sleep(3000);

                // Chama a função para baixar o PDF após acessar o processo
                await baixarPdf(driver, wait, nome);

            } catch (error) {
                console.warn(`⚠️ Nenhum resultado encontrado para '${nome}'. Pulando para o próximo.`);
                continue;
            }
        }
    } catch (error) {
        console.error("❌ Erro inesperado ao processar requerentes:", error);
    }
}

module.exports = pesquisarRequerentes;
