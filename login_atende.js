const { Builder, By, Key, until } = require('selenium-webdriver');
const pesquisarRequerentes = require("./pesquisa"); // Importa corretamente a função de pesquisa
require('dotenv').config(); // Para armazenar credenciais em um arquivo .env

async function loginAtende() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        let url = "https://fraiburgo.atende.net/atendenet#!/sistema/16";
        await driver.get(url);
        console.log(`🔍 URL inicial: ${await driver.getCurrentUrl()}`);

        // 📌 Inserir login
        try {
            let loginInput = await driver.wait(until.elementLocated(By.name("codigo")), 15000);
            await loginInput.sendKeys(process.env.ATENDE_USERNAME || "047.866.129-01");

            await driver.findElement(By.tagName("body")).click();
            await driver.sleep(1000);

            let senhaInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='password' and not(@aria-hidden='true')]")), 5000);
            await senhaInput.sendKeys(process.env.ATENDE_PASSWORD || "Nova@2025");
            await senhaInput.sendKeys(Key.ENTER);

            await driver.sleep(5000);
            let currentURL = await driver.getCurrentUrl();
            console.log(`🔍 URL após login: ${currentURL}`);

            if (currentURL.includes("sistema")) {
                console.log("✅ Login realizado com sucesso!");
            } else {
                console.log("❌ Erro no login. A URL não mudou.");
                return;
            }
        } catch (e) {
            console.log(`⚠️ Erro ao fazer login: ${e.message}`);
            return;
        }

        // 📌 Fechar todas as modais até que não haja mais nenhuma
        try {
            let modaisFechadas = 0;
            while (true) {
                let modais = await driver.findElements(By.xpath("//input[@type='button' and @name='fechar']"));
                if (modais.length === 0) break; // Sai do loop se não houver mais modais

                for (let modal of modais) {
                    try {
                        await driver.executeScript("arguments[0].click();", modal); // Usa JavaScript para forçar o clique
                        modaisFechadas++;
                        console.log(`✅ Modal fechada (${modaisFechadas})`);
                        await driver.sleep(1000);
                    } catch (e) {
                        console.log(`⚠️ Erro ao fechar modal: ${e.message}`);
                    }
                }
            }
        } catch (e) {
            console.log(`⚠️ Nenhuma modal encontrada: ${e.message}`);
        }

        // 📌 Esperar que o bloqueio desapareça antes de continuar
        try {
            await driver.wait(until.stalenessOf(driver.findElement(By.className("estrutura_area_bloqueio"))), 15000);
            console.log("✅ Página desbloqueada!");
        } catch (e) {
            console.log("⚠️ Tempo limite ao esperar o desbloqueio da página.");
        }

        // 📌 Clicar no botão "Gerenciar Processo"
        try {
            let gerenciarBtn = await driver.wait(until.elementLocated(By.xpath("//span[@class='estrutura_submenu_item_titulo' and @data-conteudo='Gerenciar']")), 10000);
            await driver.executeScript("arguments[0].click();", gerenciarBtn); // Usa JavaScript para garantir o clique
            console.log("✅ Clicou em 'Gerenciar Processo' com sucesso!");
            await driver.sleep(2000);
        } catch (e) {
            console.log(`⚠️ Erro ao clicar em 'Gerenciar Processo': ${e.message}`);
        }

        // 📌 Clicar na opção "Processo"
        try {
            let processoBtn = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Processo')]")), 10000);
            await driver.executeScript("arguments[0].click();", processoBtn);
            console.log("✅ Clicou em 'Processo' com sucesso!");
            await driver.sleep(2000);
        } catch (e) {
            console.log(`⚠️ Erro ao clicar em 'Processo': ${e.message}`);
        }

        // 📌 Desmarcar a opção "Meu Usuário"
        try {
            let meuUsuarioCheckbox = await driver.wait(until.elementLocated(By.name("meu_usuario")), 5000);
            if (await meuUsuarioCheckbox.isSelected()) {
                await meuUsuarioCheckbox.click();
                console.log("✅ Opção 'Meu Usuário' desmarcada.");
            }
            await driver.sleep(2000);
        } catch (e) {
            console.log(`⚠️ Erro ao desmarcar 'Meu Usuário': ${e.message}`);
        }

        // 📌 Chamar a função para pesquisar os nomes da planilha
        await pesquisarRequerentes(driver);

    } catch (e) {
        console.log(`❌ Erro inesperado: ${e.message}`);
    } finally {
        await driver.sleep(10 * 1000); // Tempo extra para ver o resultado antes de fechar
        await driver.quit();
    }
}

// 📌 Executar a função de login
loginAtende();
