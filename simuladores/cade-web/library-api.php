<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
session_start(['cookie_httponly'=>true,'cookie_samesite'=>'Strict','cookie_secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off','use_strict_mode'=>true]);
function reply(array $data, int $code=200): void { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $message, int $code=400): void { reply(['error'=>$message],$code); }
$dir=dirname(__DIR__,2).'/config';
$file=$dir.'/command-library-data.php';
$prefix="<?php exit; ?>\n";
$_SESSION['library_csrf']=$_SESSION['library_csrf']??bin2hex(random_bytes(24));
$admin=($_SESSION['library_admin_until']??0)>time();
$method=$_SERVER['REQUEST_METHOD'];
$input=[];
if ($method==='POST') {
 if ((int)($_SERVER['CONTENT_LENGTH']??0)>2000000) fail('Circuito muito grande.',413);
 $raw=file_get_contents('php://input',false,null,0,2000001);
 if (strlen($raw)>2000000) fail('Circuito muito grande.',413);
 $input=json_decode($raw,true);
 if (!is_array($input)) fail('Pedido inválido.');
 if (!hash_equals($_SESSION['library_csrf'],(string)($_SERVER['HTTP_X_CSRF_TOKEN']??''))) fail('Atualize a página e tente novamente.',403);
 $action=$input['action']??'';
 if ($action==='login') {
  $ratePath=$dir.'/command-library-login.php';
  $rate=fopen($ratePath,'c+');
  if (!$rate||!flock($rate,LOCK_EX)) fail('Servidor indisponível.',503);
  $saved=stream_get_contents($rate);$attempts=$saved?json_decode(substr($saved,strlen($prefix)),true):[];
  if (!is_array($attempts)) fail('Controle de acesso indisponível.',503);
  $attempts=array_filter($attempts,static function($v){return $v['until']>time();});
  $key=hash('sha256',$_SERVER['REMOTE_ADDR']??'local');
  $limit=$attempts[$key]??['count'=>0,'until'=>time()+900];
  if ($limit['count']>=10) fail('Muitas tentativas. Aguarde 15 minutos.',429);
  $config=require $dir.'/command-library.php';
  $ok=is_string($input['password']??null)&&password_verify($input['password'],$config['password_hash']);
  if ($ok) unset($attempts[$key]); else {$limit['count']++;$attempts[$key]=$limit;}
  rewind($rate);ftruncate($rate,0);fwrite($rate,$prefix.json_encode($attempts));fflush($rate);flock($rate,LOCK_UN);fclose($rate);
  if (!$ok) fail('Senha incorreta.',401);
  session_regenerate_id(true);$_SESSION['library_admin_until']=time()+7200;
  reply(['admin'=>true]);
 }
 if ($action==='logout') {unset($_SESSION['library_admin_until']);reply(['admin'=>false]);}
 if (!$admin) fail('Entre como administrador para alterar os exemplos.',403);
 if (!in_array($action,['save','delete'],true)) fail('Ação inválida.');
} elseif ($method!=='GET') fail('Método não permitido.',405);
$lock=fopen($dir.'/command-library.lock','c+');
if (!$lock||!flock($lock,$method==='GET'?LOCK_SH:LOCK_EX)) fail('Não foi possível acessar a biblioteca.',503);
$items=[];
if (is_file($file)) {
 $stored=file_get_contents($file);
 if ($stored===false||substr($stored,0,strlen($prefix))!==$prefix) fail('Biblioteca indisponível.',503);
 $items=json_decode(substr($stored,strlen($prefix)),true);
 if (!is_array($items)) fail('Biblioteca inválida. Dados preservados.',503);
}
if ($method==='GET') reply(['items'=>array_values($items),'admin'=>$admin,'csrf'=>$_SESSION['library_csrf']]);
$id=$input['id']??null;$index=null;
foreach ($items as $i=>$entry) if ($entry['id']===$id) {$index=$i;break;}
if ($id!==null && $index===null) fail('Este exemplo não existe mais. Atualize a lista.',409);
if ($index!==null && ($input['revision']??null)!==$items[$index]['revision']) fail('O exemplo mudou em outra janela. Atualize a lista antes de editar.',409);
if ($action==='delete') {
 if ($index===null) fail('Selecione um exemplo.');
 array_splice($items,$index,1);
} else {
 $name=$input['name']??'';$category=$input['category']??'';$project=$input['project']??null;
 if (!is_string($name)||!is_string($category)||trim($name)===''||strlen($name)>320||strlen($category)>200) fail('Nome ou categoria inválidos.');
 if (!is_array($project)||($project['format']??null)!=='cade-web'||($project['version']??null)!==1||!is_array($project['components']??null)||!is_array($project['wires']??null)||count($project['components'])>500||count($project['wires'])>1500||count($project['drawings']??[])>500) fail('Circuito inválido.');
 if (!$project['components']&&empty($project['drawings'])) fail('O circuito está vazio.');
 if ($index===null&&count($items)>=200) fail('Limite de 200 exemplos atingido.');
 $id=$id??bin2hex(random_bytes(16));
 $entry=['id'=>$id,'revision'=>bin2hex(random_bytes(16)),'name'=>trim($name),'category'=>trim($category)?:'Comandos','project'=>$project];
 if ($index===null) $items[]=$entry; else $items[$index]=$entry;
}
$encoded=$prefix.json_encode(array_values($items),JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
$temp=tempnam($dir,'library-');
if ($temp===false||file_put_contents($temp,$encoded)!==strlen($encoded)||!rename($temp,$file)) {if ($temp&&is_file($temp)) unlink($temp);fail('Não foi possível salvar no servidor.',503);}
reply(['items'=>array_values($items),'id'=>$id]);
