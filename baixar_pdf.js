const { By, until } = require('selenium-webdriver');

async function baixarPdf(driver, nome) {
    if (!nome || typeof nome !== "string") {
        console.log("⚠️ Erro: Nome do requerente não foi passado corretamente.");
        return;
    }

    console.log(`⏳ Preparando geração do PDF para ${nome}...`);

    try {
        // **Clicar em "Imprimir Processo Completo"**
        try {
            let imprimirBtn = await driver.wait(until.elementLocated(By.xpath("//span[@name='692']/input")), 5000);
            await driver.executeScript("arguments[0].scrollIntoView();", imprimirBtn);
            await driver.sleep(1000);
            await imprimirBtn.click();
            console.log(`🖨️ Clicou em 'Imprimir Processo Completo' para ${nome}`);
            await driver.sleep(3000);
        } catch (e) {
            console.log(`⚠️ Erro ao clicar em 'Imprimir Processo Completo': ${e.message}`);
            return;
        }

        // **Verifica se "Visualizar" está disponível**
        try {
            let visualizarBtn = await driver.wait(until.elementLocated(By.name("btn_visualizar")), 3000);
            if (await visualizarBtn.isDisplayed() && await visualizarBtn.isEnabled()) {
                await visualizarBtn.click();
                console.log(`📂 Clicou em 'Visualizar' para ${nome}`);
                await driver.sleep(3000);
                return;
            }
        } catch (e) {
            console.log(`🔍 Nenhum botão 'Visualizar' encontrado. Será necessário gerar o PDF.`);
        }

        // **Clica em "Gerar" se necessário**
        try {
            let gerarBtn = await driver.wait(until.elementLocated(By.name("btn_gerar_pdf_completo")), 5000);
            await driver.executeScript("arguments[0].scrollIntoView();", gerarBtn);
            await gerarBtn.click();
            console.log(`📄 Clicou em 'Gerar' para ${nome}`);
            await driver.sleep(3000);
        } catch (e) {
            console.log(`⚠️ Erro ao clicar em 'Gerar': ${e.message}`);
            return;
        }

        // **Seleciona "Todos" os anexos**
        try {
            let anexosSelect = await driver.wait(until.elementLocated(By.name("anexos")), 5000);
            await anexosSelect.click();
            await driver.sleep(2000);

            let todosCheckbox = await driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Todos')]")), 5000);
            await todosCheckbox.click();

            console.log(`📂 Selecionou 'Todos' os anexos para ${nome}`);
            await driver.sleep(2000);
        } catch (e) {
            console.log(`⚠️ Erro ao selecionar anexos: ${e.message}`);
            return;
        }

        // **Define o nome do PDF**
        try {
            let nomePdfInput = await driver.wait(until.elementLocated(By.name("nomeAnexo")), 5000);
            await nomePdfInput.clear();
            await nomePdfInput.sendKeys(nome);
            console.log(`📝 Nome do PDF definido como: ${nome}`);
            await driver.sleep(2000);
        } catch (e) {
            console.log(`⚠️ Erro ao definir o nome do PDF: ${e.message}`);
            return;
        }

        // **Confirma a geração**
        try {
            let confirmarBtn = await driver.wait(until.elementLocated(By.name("confirmar")), 5000);
            await driver.executeScript("arguments[0].scrollIntoView();", confirmarBtn);
            await confirmarBtn.click();
            console.log(`✅ Confirmou a geração do PDF para ${nome}`);
            await driver.sleep(5000);
        } catch (e) {
            console.log(`⚠️ Erro ao confirmar a geração do PDF: ${e.message}`);
            return;
        }

        // **Aguarda a geração**
        console.log(`⏳ Aguardando geração do PDF para ${nome}...`);

        try {
            let botaoOk = await driver.wait(until.elementLocated(By.name("ok")), 5000);
            await botaoOk.click();
            console.log(`✅ Clicou no botão 'Ok' para ${nome}`);
            await driver.sleep(3000);
        } catch (e) {
            console.log(`⚠️ Nenhum botão 'Ok' encontrado, continuando.`);
        }

        // **Tenta baixar o PDF**
        try {
            let pdfLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(@href, '.pdf')]")), 10000);
            let pdfUrl = await pdfLink.getAttribute("href");

            if (pdfUrl) {
                console.log(`📥 PDF encontrado para ${nome}: ${pdfUrl}`);
                await driver.get(pdfUrl);
                await driver.sleep(5000);
                return;
            }
        } catch (e) {
            console.log(`⚠️ Nenhum link direto para PDF encontrado.`);
        }

        // **Se não encontrar link, tenta um botão de download**
        try {
            let botaoDownload = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Baixar PDF')]")), 5000);
            await botaoDownload.click();
            console.log(`📥 Clicou no botão de download.`);
            await driver.sleep(5000);
        } catch (e) {
            console.log(`⚠️ Nenhum botão de download encontrado.`);
        }

    } catch (e) {
        console.log(`❌ Erro ao tentar baixar o PDF: ${e.message}`);
    }
}

module.exports = baixarPdf;
