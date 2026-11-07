# Falstad / CircuitJS

Conteúdo web copiado de `Faltad_clone/falstad-web/dist`. A mesma distribuição atende às áreas de eletrônica analógica e digital, com entradas separadas no catálogo do portal.

Entrada: `index.html?lang=pt`. `portal-integration.js` ajusta a altura e pausa/retoma a simulação ao trocar de aba, preservando uma pausa feita pelo aluno. O motor e os exemplos foram mantidos. Créditos, licença e referência ao código original estão em `about.html`.

Hospedagem: publicar esta pasta junto com o restante do site. Não requer Electron nem o executável de desktop.

## Exemplos compartilhados

O botão **Exemplos da turma**, na barra superior, permite abrir os projetos publicados. Entre com a mesma senha dos exemplos do CAD para salvar o circuito atual, substituir um exemplo ou excluí-lo. Os exemplos originais do Falstad continuam disponíveis no menu do simulador.

`library-api.php` usa o hash de `config/command-library.php`, a sessão e o limite de tentativas do CAD. A senha não fica no JavaScript. Alterar a senha nessa configuração também altera o acesso à biblioteca do Falstad.

Os projetos são gravados no servidor em `config/falstad-library-data.php`, separadamente dos comandos elétricos. A pasta `config` precisa permitir gravação pelo PHP. Preserve esse arquivo ao atualizar o site e inclua-o nos backups. Publique os arquivos novos da integração junto com a pasta do simulador; não publique dados de teste.

## Arduino Mega

O botão **Arduino Mega** abre o painel de programas `.hex`, entradas e saídas. A biblioteca de exemplos guarda também o programa quando ele está carregado. Consulte `mega/README.md` para ligações, limitações e hospedagem.
