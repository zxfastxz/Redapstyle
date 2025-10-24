# REDAP – Painel Profissional de Monitoramento de Alagamentos

> Sistema interativo para monitoramento de sensores de alagamento, com gráficos históricos, alertas visuais e mapas em tempo real.



##  Sobre o projeto

O **REDAP** é um dashboard moderno e intuitivo desenvolvido para monitorar níveis de água em diferentes locais da cidade. Ideal para equipes de gestão urbana, defesa civil ou qualquer pessoa interessada em acompanhar dados de alagamentos.

Ele combina:

- **Mapa interativo** com todos os sensores.  
- **Cards informativos** mostrando temperatura, umidade, nível da água e status.  
- **Gráficos históricos** de nível e temperatura atualizados dinamicamente.  
- **Indicadores globais e alertas críticos** destacados com efeitos visuais.  
- **Integração com trânsito (Waze)** para planejamento de rotas seguras.  

> Atualmente os dados são **simulados**, mas o sistema está pronto para integração com sensores reais (NodeMCU/ESP + DHT11 + sensor ultrassônico).



##  Funcionalidades

1. **Simulação automática de dados**  
   - Atualizações a cada 10 segundos.  
   - Status crítico destacado com animação de oscilação para chamar atenção.

2. **Mapas interativos**  
   - Marcadores coloridos de acordo com o status: Normal, Alerta, Risco ou Crítico.  
   - Centralização em um sensor específico com clique no botão correspondente.

3. **Gráficos históricos**  
   - Linha do tempo de nível da água e temperatura.  
   - Atualizam automaticamente conforme os dados simulados chegam.

4. **Alertas visuais**  
   - Banner “⚠️ Situação Crítica” quando algum sensor ultrapassa o limite crítico.

5. **Exportação de histórico (CSV)**  
   - Permite baixar os dados para análise offline.

6. **Filtro por sensor ou bairro**  
   - Facilita visualizar apenas os sensores desejados.



##  Como usar

1. Clone este repositório ou baixe os arquivos:  
   - `index.html`  
   - `script.js`  
   - `style.css`  

2. Abra o `index.html` em **qualquer navegador moderno**.

3. Clique em **▶ Iniciar Simulação** para começar a ver os dados sendo atualizados a cada 10 segundos.

4. Caso algum sensor atinja o nível crítico, o alerta visual será exibido automaticamente.

> **Dica:** A simulação aleatória permite testar todos os níveis: Normal, Alerta, Risco e Crítico.



##  Tecnologias utilizadas

- **HTML5 / CSS3** – Estrutura e layout responsivo.  
- **JavaScript** – Lógica de simulação e atualização dinâmica.  
- **Leaflet.js** – Mapas interativos.  
- **Chart.js** – Gráficos históricos de nível e temperatura.  
- **CSV Export** – Para download do histórico.



##  Próximos passos

- Conectar sensores reais via **NodeMCU/ESP + DHT11 + ultrassônico** usando MQTT ou HTTP.  
- Adicionar **alertas sonoros e notificações push**.  
- Dashboard **multi-tela (wallboard)** para monitoramento em tempo real.  
- Histórico visual no mapa, mostrando trajetórias de alertas críticos.  
- Dark mode e tema customizável.  
- Filtros avançados por sensor, bairro ou intervalo de datas.



##  Contribuição

Este projeto é open-source. Se você tiver ideias ou melhorias, sinta-se à vontade para abrir **issues** ou enviar **pull requests**.



##  Licença

REDAP – Sistema desenvolvido para **demonstração educacional**.  
Não há garantia de precisão para monitoramento real de alagamentos.

