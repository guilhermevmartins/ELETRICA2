# Sugestões de melhoria

O botão no topo abre envio público e histórico compartilhado. Apenas a sessão autenticada do desenvolvedor altera o status; cada alteração fica registrada. A autenticação expira em duas horas e pode ser encerrada pelo botão Sair.

## Hospedagem

Envie `index.php`, `melhorias-api.php`, `assets/melhorias.js`, `assets/melhorias.css` e `config/improvements.php`. Preserve `config/.htaccess`. O PHP precisa de permissão para gravar na pasta `config`.

O histórico está em `config/improvements-data.php`. Preserve e faça backup desse arquivo ao atualizar o site. Ele é criado automaticamente no primeiro envio. Os arquivos de dados, bloqueio e controle de tentativas estão ignorados pelo Git; não substitua os dados do servidor pelos de testes locais.

A senha não está no JavaScript: apenas seu hash é armazenado em `config/improvements.php`. Para trocá-la, gere um novo hash com `password_hash` do PHP e substitua `password_hash` nesse arquivo. Não publique a senha no site.
