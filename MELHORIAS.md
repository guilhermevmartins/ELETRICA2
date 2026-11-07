# Passei por aqui · presença e sugestões

O botão destacado **Passei por aqui** convida o visitante a deixar nome ou apelido. A sugestão é opcional. O formulário avisa que os nomes e as ideias são públicos. O mural mostra as 30 presenças mais recentes e o total de registros (não pessoas únicas). Enviar uma sugestão junto conta como uma presença, não duas.

Apenas a sessão autenticada do desenvolvedor altera o status de sugestões; cada alteração fica registrada. Presenças sem sugestão não têm checkbox de tarefa. Sugestões antigas continuam disponíveis. A autenticação expira em duas horas e pode ser encerrada pelo botão Sair.

## Hospedagem

Envie `index.php`, `melhorias-api.php`, `includes/access-counter.php`, `assets/melhorias.js`, `assets/melhorias.css` e `config/improvements.php`. Preserve `config/.htaccess` e a configuração de senha existente. O PHP precisa de permissão para gravar na pasta `config`.

O histórico está em `config/improvements-data.php`. Preserve e faça backup desse arquivo ao atualizar o site. Ele é criado automaticamente no primeiro envio. Os arquivos de dados, bloqueio e controle de tentativas estão ignorados pelo Git; não substitua os dados do servidor pelos de testes locais.

A senha não está no JavaScript: apenas seu hash é armazenado em `config/improvements.php`. Para trocá-la, gere um novo hash com `password_hash` do PHP e substitua `password_hash` nesse arquivo. Não publique a senha no site.

## Total de acessos

O número no topo soma cada carregamento GET da página principal, incluindo atualizações da mesma pessoa. Trocar de simulador ou abrir o mural não incrementa. Não mede pessoas distintas e pode incluir robôs que carreguem a página. Não há contagem retroativa.

O contador guarda somente o total em `config/access-count.php`, sem IP, cookies ou identificadores próprios de visitantes. Usa bloqueio e gravação atômica para evitar perda de incrementos simultâneos. Preserve esse arquivo nos envios e backups. Se a gravação falhar, mostra `—` e mantém o site funcionando. As proteções existentes de sessão e limite de tentativas do formulário continuam separadas do contador.
